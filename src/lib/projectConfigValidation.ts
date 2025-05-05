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
  errorMessages,
  Ajv,
  ValidateFunction,
  AnySchema,
  ErrorObject,
} from '@hubspot/project-parsing-lib';
import { getAccountId } from '@hubspot/local-dev-lib/config';
import { dirname } from 'path';
import * as jsonc from 'jsonc-parser';
import { debounce } from 'debounce';
import { doesFileExist } from './fileHelpers';

const hsProjectJsonFilename = 'hsproject.json';
const VALIDATION_DEBOUNCE_TIME = 250;

const AjvErrorKeyword = {
  AdditionalItems: 'additionalItems',
  AdditionalProperties: 'additionalProperties',
  Dependencies: 'dependencies',
  Enum: 'enum',
  ExclusiveMaximum: 'exclusiveMaximum',
  ExclusiveMinimum: 'exclusiveMinimum',
  Maximum: 'maximum',
  MaxItems: 'maxItems',
  MaxLength: 'maxLength',
  MaxProperties: 'maxProperties',
  Minimum: 'minimum',
  MinItems: 'minItems',
  MinLength: 'minLength',
  MinProperties: 'minProperties',
  MultipleOf: 'multipleOf',
  OneOf: 'oneOf',
  Pattern: 'pattern',
  Required: 'required',
  Type: 'type',
};

type SchemaAndValidator = { schema: AnySchema; validator?: ValidateFunction };
type SchemaCacheEntry =
  | {
      byType: Record<
        string, // internal type
        SchemaAndValidator
      >;
    }
  | { error: string };

// A schema cache maps a platform version to a set of schemas and validators indexed by the internal type.
// Validators are compiled on demand and then cached.
type SchemaCache = Record<
  string, // platform version
  SchemaCacheEntry
>;

let diagnosticsCollection: DiagnosticCollection;
let ajv: Ajv;
let schemaCache: SchemaCache = {};

export function initializeProjectConfigValidation(
  context: ExtensionContext
): void {
  diagnosticsCollection = languages.createDiagnosticCollection(
    'hubspot-project-config-schema'
  );
  context.subscriptions.push(diagnosticsCollection);

  ajv = createAjvInstance();

  workspace.onDidOpenTextDocument(validateDocument);
  workspace.onDidChangeTextDocument(
    debounce(
      (event) => validateDocument(event.document),
      VALIDATION_DEBOUNCE_TIME
    )
  );
  workspace.onDidSaveTextDocument(validateDocument);
  workspace.onDidCloseTextDocument((doc) =>
    diagnosticsCollection.delete(doc.uri)
  );
  workspace.textDocuments.forEach(validateDocument);
}

async function validateDocument(document: TextDocument): Promise<void> {
  try {
    const diagnostics = await validateDocumentDiagnostics(document);
    diagnosticsCollection.set(document.uri, diagnostics);
  } catch (error) {
    console.error('Error validating document:', error);
  }
}

async function validateDocumentDiagnostics(
  document: TextDocument
): Promise<Diagnostic[]> {
  if (!document.fileName.endsWith('-hsmeta.json')) return [];
  const projectRoot = await findProjectRoot(document.uri);
  if (!projectRoot) return [];
  const projectVersion = await getProjectVersion(projectRoot);
  if (!projectVersion) return [];
  // Any file that fails the above checks is one that we don't handle
  let metaFile: any; // The type is whatever JSON the user provided us with
  try {
    metaFile = JSON.parse(document.getText());
  } catch (error) {
    return [
      new Diagnostic(
        new Range(0, 0, 0, 0),
        errorMessages.validation.invalidJson,
        DiagnosticSeverity.Error
      ),
    ];
  }
  const root = jsonc.parseTree(document.getText());
  if (!root) {
    // Should not happen, we've already parsed it above without jsonc
    return [
      new Diagnostic(
        new Range(0, 0, 0, 0),
        errorMessages.validation.invalidJson,
        DiagnosticSeverity.Error
      ),
    ];
  }
  if (!('type' in metaFile)) {
    return [
      new Diagnostic(
        new Range(0, 0, 0, 0),
        errorMessages.validation.missingType,
        DiagnosticSeverity.Error
      ),
    ];
  }
  const uidError = validateUid(metaFile.uid);
  if (uidError) {
    const uidNode = jsonc.findNodeAtLocation(root, ['uid']);
    return [
      new Diagnostic(
        uidNode
          ? new Range(
              document.positionAt(uidNode.offset),
              document.positionAt(uidNode.offset + uidNode.length)
            )
          : new Range(0, 0, 0, 0),
        uidError,
        DiagnosticSeverity.Error
      ),
    ];
  }
  if (!('config' in metaFile)) {
    return [
      new Diagnostic(
        new Range(0, 0, 0, 0),
        errorMessages.validation.missingConfig,
        DiagnosticSeverity.Error
      ),
    ];
  }
  const accountId = getAccountId();
  if (!accountId) {
    return [
      new Diagnostic(
        new Range(0, 0, 0, 0),
        `${errorMessages.api.accountIdIsRequiredToFetchSchemas}. Authenticate account with the HubSpot CLI`,
        DiagnosticSeverity.Error
      ),
    ];
  }
  const validator = await getCachedValidatorForExternalType(
    projectRoot,
    projectVersion,
    accountId,
    metaFile.type
  );
  if ('error' in validator) {
    return [
      new Diagnostic(
        new Range(0, 0, 0, 0),
        validator.error,
        DiagnosticSeverity.Error
      ),
    ];
  }
  if (!validator(metaFile['config'])) {
    let diagnostics: Record<string, Diagnostic> = {};
    for (const error of validator.errors || []) {
      const { message, nodePath, onlyKeyNode } = customizeAjvError(error);
      if (!message) {
        continue;
      }
      // This is a duplicate error, skip it
      if (
        diagnosticDeduplicationKey(nodePath, error.keyword, error.params) in
        diagnostics
      ) {
        continue;
      }
      let node = jsonc.findNodeAtLocation(root, nodePath);
      if (node && onlyKeyNode) {
        // Sometimes we want to highlight the key that corresponds to a node
        node = getKeyNode(node);
      }
      if (!node) {
        // If we couldn't find the exact location, create a generic error
        diagnostics[
          diagnosticDeduplicationKey(nodePath, error.keyword, error.params)
        ] = new Diagnostic(
          new Range(0, 0, 0, 0),
          message,
          DiagnosticSeverity.Error
        );
        continue;
      }
      const startPos = document.positionAt(node.offset);
      const endPos = document.positionAt(node.offset + node.length);
      diagnostics[
        diagnosticDeduplicationKey(nodePath, error.keyword, error.params)
      ] = new Diagnostic(
        new Range(startPos, endPos),
        message,
        DiagnosticSeverity.Error
      );
    }
    return Object.values(diagnostics);
  }
  return [];
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
      message = errorMessages.validation.missingRequiredField(
        error.params.missingProperty
      );
      break;
    case AjvErrorKeyword.Type:
      message = `Incorrect type: ${error.message}`;
      break;
    default:
      break;
  }
  return { message, nodePath, onlyKeyNode };
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

async function getCachedSchemasForAllTypes(
  projectRoot: Uri,
  platformVersion: string,
  accountId: number
): Promise<SchemaCacheEntry> {
  // If schema cache has a schema for this version, return it
  // If there is an error, we're going to return that too
  if (schemaCache[platformVersion]) {
    return schemaCache[platformVersion];
  }
  let response: Record<string, AnySchema>;
  try {
    response = await getIntermediateRepresentationSchema({
      projectSourceDir: projectRoot.fsPath,
      platformVersion,
      accountId,
    });
    let byType: Record<string, SchemaAndValidator> = {};
    for (const [key, schema] of Object.entries(response)) {
      byType[key] = { schema };
    }
    const result = {
      byType,
    };
    schemaCache[platformVersion] = result;
    return result;
  } catch (error) {
    const message = `${errorMessages.api.failedToFetchSchemas}. Reload your window to try again`;
    console.error(message, error);
    const result = {
      error: message,
    };
    schemaCache[platformVersion] = result;
    return result;
  }
}

async function getCachedValidatorForExternalType(
  projectRoot: Uri,
  platformVersion: string,
  accountId: number,
  externalType: string
): Promise<ValidateFunction | { error: string }> {
  const cachedSchemas = await getCachedSchemasForAllTypes(
    projectRoot,
    platformVersion,
    accountId
  );
  if ('error' in cachedSchemas) {
    return cachedSchemas;
  }
  const internalType = mapToInternalType(externalType);
  if (!(internalType in cachedSchemas.byType)) {
    return { error: errorMessages.validation.unsupportedType(externalType) };
  }
  const schemaAndValidator = cachedSchemas.byType[internalType];
  let validator = schemaAndValidator.validator;
  if (!validator) {
    validator = ajv.compile(schemaAndValidator.schema);
    schemaAndValidator.validator = validator;
  }
  return validator;
}

// VSCode doesn't provide a dirname function, that's in the github:/microsoft/vscode-uri package
function vscodeDirname(uri: Uri): Uri {
  return uri.with({ path: dirname(uri.path) });
}

async function findProjectRoot(start: Uri): Promise<Uri | null> {
  let currentDir = vscodeDirname(start);
  while (true) {
    const current = Uri.joinPath(currentDir, hsProjectJsonFilename);
    if (await doesFileExist(current)) {
      return current;
    }
    const parent = vscodeDirname(currentDir);
    if (parent.fsPath === currentDir.fsPath) {
      return null;
    }
    currentDir = parent;
  }
}

async function getProjectVersion(projectRoot: Uri): Promise<string | null> {
  try {
    const fileContents = await workspace.fs.readFile(projectRoot);
    const config = JSON.parse(fileContents.toString());
    if ('platformVersion' in config) {
      return config.platformVersion;
    }
    return null;
  } catch (error) {
    console.error(`Error reading ${hsProjectJsonFilename}:`, error);
    return null;
  }
}
