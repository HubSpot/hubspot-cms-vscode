import {
  workspace,
  Uri,
  Diagnostic,
  DiagnosticSeverity,
  languages,
  Range,
  DiagnosticCollection,
  ExtensionContext,
  TextDocument,
} from 'vscode';
import {
  getIntermediateRepresentationSchema,
  mapToInternalType,
  createAjvInstance,
  validateUid,
  getInvalidJsonError,
  getMissingTypeError,
  getMissingConfigError,
  getMissingAccountIdError,
  getMissingRequiredFieldError,
  getFailedToFetchSchemasError,
  getUnsupportedTypeError,
  AjvErrorKeyword,
  ValidateFunction,
  ErrorObject,
  metafileExtension,
  Components,
  hsProjectJsonFilename,
} from '@hubspot/project-parsing-lib';
import { getAccountId } from '@hubspot/local-dev-lib/config';

import * as jsonc from 'jsonc-parser';
import { debounce } from 'debounce';
import { doesFileExist, dirname } from '../lib/fileHelpers';
import { INTERVALS } from '../lib/constants';
import {
  PlatformVersionSchemaCache,
  SchemaAndValidator,
  SchemaCacheEntry,
} from '../lib/types';

type ProjectConfigValidationState = {
  diagnosticsCollection: DiagnosticCollection;
  ajv: ReturnType<typeof createAjvInstance>;
  schemaCache: PlatformVersionSchemaCache;
};

export function initializeProjectConfigValidation(
  context: ExtensionContext
): void {
  const state: ProjectConfigValidationState = {
    diagnosticsCollection: languages.createDiagnosticCollection(
      'hubspot-project-config-schema'
    ),
    ajv: createAjvInstance(),
    schemaCache: {},
  };
  context.subscriptions.push(state.diagnosticsCollection);

  workspace.onDidOpenTextDocument((doc) => validateDocument(state, doc));
  workspace.onDidChangeTextDocument(
    debounce(
      (event) => validateDocument(state, event.document),
      INTERVALS.DEBOUNCE
    )
  );
  workspace.onDidSaveTextDocument((doc) => validateDocument(state, doc));
  workspace.onDidCloseTextDocument((doc) =>
    state.diagnosticsCollection.delete(doc.uri)
  );
  workspace.textDocuments.forEach((doc) => validateDocument(state, doc));
}

async function validateDocument(
  state: ProjectConfigValidationState,
  document: TextDocument
): Promise<void> {
  try {
    const diagnostics = await validateDocumentDiagnostics(state, document);
    state.diagnosticsCollection.set(document.uri, diagnostics);
  } catch (error) {
    console.error('Error validating document:', error);
  }
}

async function validateDocumentDiagnostics(
  state: ProjectConfigValidationState,
  document: TextDocument
): Promise<Diagnostic[]> {
  if (!document.fileName.endsWith(metafileExtension)) {
    return [];
  }
  const hsProjectFile = await findHsProjectFile(document.uri);
  if (!hsProjectFile) {
    return [];
  }
  const projectVersion = await getProjectVersion(hsProjectFile);
  if (!projectVersion) {
    return [];
  }
  // Any file that fails the above checks is one that we don't handle
  let metaFile: Partial<Components>;
  try {
    metaFile = JSON.parse(document.getText());
  } catch (error) {
    return [newErrorDiagnostic(getInvalidJsonError())];
  }
  const root = jsonc.parseTree(document.getText());
  if (!root) {
    // Should not happen, we've already parsed it above without jsonc
    return [newErrorDiagnostic(getInvalidJsonError())];
  }
  if (!metaFile.type) {
    return [newErrorDiagnostic(getMissingTypeError())];
  }
  const uidError = validateUid(metaFile.uid || '');
  if (uidError) {
    const uidNode = jsonc.findNodeAtLocation(root, ['uid']);
    return [
      newErrorDiagnostic(
        uidError,
        uidNode
          ? new Range(
              document.positionAt(uidNode.offset),
              document.positionAt(uidNode.offset + uidNode.length)
            )
          : undefined
      ),
    ];
  }
  if (!metaFile.config) {
    return [newErrorDiagnostic(getMissingConfigError())];
  }
  const accountId = getAccountId();
  if (!accountId) {
    return [
      newErrorDiagnostic(
        `${getMissingAccountIdError()}. Authenticate account with the HubSpot CLI`
      ),
    ];
  }
  const cachedValidator = await getCachedValidatorForExternalType(
    state,
    hsProjectFile,
    projectVersion,
    accountId,
    metaFile.type
  );
  if (cachedValidator.type === 'error') {
    return [newErrorDiagnostic(cachedValidator.error)];
  }
  if (cachedValidator.validator(metaFile['config'])) {
    return [];
  }
  let diagnostics: Record<string, Diagnostic> = {};
  (cachedValidator.validator.errors || []).forEach((error) => {
    const { message, nodePath, onlyKeyNode } = customizeAjvError(error);
    if (!message) {
      return;
    }
    const deduplicationKey = diagnosticDeduplicationKey(
      nodePath,
      error.keyword,
      error.params
    );
    // This is a duplicate error, skip it
    if (deduplicationKey in diagnostics) {
      return;
    }
    let node = jsonc.findNodeAtLocation(root, nodePath);
    if (node && onlyKeyNode) {
      // Sometimes we want to highlight the key that corresponds to a node
      node = getKeyNode(node);
    }
    if (!node) {
      // If we couldn't find the exact location, create a generic error
      diagnostics[deduplicationKey] = newErrorDiagnostic(message);
      return;
    }
    const startPos = document.positionAt(node.offset);
    const endPos = document.positionAt(node.offset + node.length);
    diagnostics[deduplicationKey] = newErrorDiagnostic(
      message,
      new Range(startPos, endPos)
    );
  });
  return Object.values(diagnostics);
}

function customizeAjvError(error: ErrorObject): {
  message: string | undefined;
  nodePath: (string | number)[];
  onlyKeyNode: boolean;
} {
  let nodePath = [
    'config',
    ...error.instancePath
      .split('/')
      .slice(1)
      .map((p) => (p.match(/\d+/) ? parseInt(p) : p)),
  ];
  // For some errors, we only want to highlight the key
  // that corresponds to the error, not the value that caused
  // the error. For example, if there's an unknown field, we
  // don't want to highlight the entire value to report this.
  let onlyKeyNode = false;
  let message = error.message;
  switch (error.keyword) {
    case AjvErrorKeyword.AdditionalItems:
      message = `Too many items, need at most ${error.params.limit}`;
      break;
    case AjvErrorKeyword.AdditionalProperties:
      nodePath.push(error.params.additionalProperty);
      onlyKeyNode = true;
      message = `Unknown field: ${error.params.additionalProperty}`;
      break;
    case AjvErrorKeyword.Dependencies:
      message = `When you have this property, you must have all of these as well: ${error.params.deps}. You are missing at least: ${error.params.missingProperty}`;
      nodePath.push(error.params.property);
      onlyKeyNode = true;
      break;
    case AjvErrorKeyword.Enum:
      // Enum errors often happen on types and have cascading effects. We let users know that other errors can lead to this one.
      if (error.params.allowedValues) {
        message = `Try one of: ${error.params.allowedValues.join(', ')}`;
      } else {
        message = `Value not allowed. Other errors can cause this`;
      }
      break;
    case AjvErrorKeyword.Maximum:
    case AjvErrorKeyword.Minimum:
    case AjvErrorKeyword.ExclusiveMaximum:
    case AjvErrorKeyword.ExclusiveMinimum:
      message = `This value must ${error.params.comparison}${error.params.limit}`;
      break;
    case AjvErrorKeyword.MaxItems:
      message = `Value is too long, needs at most ${error.params.limit} items`;
      break;
    case AjvErrorKeyword.MaxLength:
      message = `Value is too long, needs at most ${error.params.limit} characters`;
      break;
    case AjvErrorKeyword.MaxProperties:
      message = `Too many properties, need at most ${error.params.limit}`;
      break;
    case AjvErrorKeyword.MinItems:
      message = `Value is too short, needs at least ${error.params.limit} items`;
      break;
    case AjvErrorKeyword.MinLength:
      message = `Value is too short, needs at least ${error.params.limit} characters`;
      break;
    case AjvErrorKeyword.MinProperties:
      message = `Too few properties, need at least ${error.params.limit}`;
      break;
    case AjvErrorKeyword.MultipleOf:
      message = `This value must be a multiple of ${error.params.multipleOf}`;
      break;
    case AjvErrorKeyword.OneOf:
      onlyKeyNode = true;
      message = `Does not match any of the allowed schemas`;
      break;
    case AjvErrorKeyword.Pattern:
      message = `Value does not match pattern: ${error.params.pattern}`;
      break;
    case AjvErrorKeyword.Required:
      onlyKeyNode = true;
      message = getMissingRequiredFieldError(error.params.missingProperty);
      break;
    case AjvErrorKeyword.Type:
      message = `Incorrect type: ${error.message}`;
      break;
    default:
      break;
  }
  return { message, nodePath, onlyKeyNode };
}

function newErrorDiagnostic(error: string, range?: Range): Diagnostic {
  return new Diagnostic(
    range || new Range(0, 0, 0, 0),
    error,
    DiagnosticSeverity.Error
  );
}

function diagnosticDeduplicationKey(
  nodePath: (string | number)[],
  keyword: string,
  params: any
): string {
  return `${keyword}::${nodePath.join('/')}::${JSON.stringify(params)}`;
}

function getKeyNode(node: jsonc.Node): jsonc.Node | undefined {
  return node.parent?.type === 'property' ? node.parent.children?.[0] : node;
}

async function getSchemasForAllTypes(
  state: ProjectConfigValidationState,
  hsProjectFile: Uri,
  platformVersion: string,
  accountId: number
): Promise<SchemaCacheEntry> {
  // If schema cache has a schema for this version, return it
  // If there is an error, we're going to return that too
  if (state.schemaCache[platformVersion]) {
    return state.schemaCache[platformVersion];
  }
  try {
    const response = await getIntermediateRepresentationSchema({
      projectSourceDir: hsProjectFile.fsPath,
      platformVersion,
      accountId,
    });
    const schemasByType: Record<string, SchemaAndValidator> = {};
    for (const [key, schema] of Object.entries(response)) {
      schemasByType[key] = { schema };
    }
    state.schemaCache[platformVersion] = {
      type: 'schema',
      schemasByType,
    };
  } catch (error) {
    const message = `${getFailedToFetchSchemasError()}. Reload your window or restart to try again`;
    console.error(message, error);
    state.schemaCache[platformVersion] = {
      type: 'error',
      error: message,
    };
  }
  return state.schemaCache[platformVersion];
}

async function getCachedValidatorForExternalType(
  state: ProjectConfigValidationState,
  hsProjectFile: Uri,
  platformVersion: string,
  accountId: number,
  externalType: string
): Promise<
  | { type: 'validator'; validator: ValidateFunction }
  | { type: 'error'; error: string }
> {
  const cachedSchemas = await getSchemasForAllTypes(
    state,
    hsProjectFile,
    platformVersion,
    accountId
  );
  if (cachedSchemas.type === 'error') {
    return cachedSchemas;
  }
  const internalType = mapToInternalType(externalType);
  if (!(internalType in cachedSchemas.schemasByType)) {
    return { type: 'error', error: getUnsupportedTypeError(externalType) };
  }
  const schemaAndValidator = cachedSchemas.schemasByType[internalType];
  let validator = schemaAndValidator.validator;
  if (!validator) {
    validator = state.ajv.compile(schemaAndValidator.schema);
    schemaAndValidator.validator = validator;
  }
  return { type: 'validator', validator };
}

async function findHsProjectFile(start: Uri): Promise<Uri | null> {
  let currentDir = dirname(start);
  while (true) {
    const current = Uri.joinPath(currentDir, hsProjectJsonFilename);
    if (await doesFileExist(current)) {
      return current;
    }
    const parent = dirname(currentDir);
    if (parent.fsPath === currentDir.fsPath) {
      return null;
    }
    currentDir = parent;
  }
}

async function getProjectVersion(hsProjectFile: Uri): Promise<string | null> {
  try {
    const fileContents = await workspace.fs.readFile(hsProjectFile);
    const config = JSON.parse(fileContents.toString());
    if ('platformVersion' in config) {
      return config.platformVersion;
    }
  } catch (error) {
    console.error(`Error reading ${hsProjectJsonFilename}:`, error);
  }
  return null;
}
