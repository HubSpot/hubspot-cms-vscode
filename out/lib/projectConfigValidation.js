"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeProjectConfigValidation = void 0;
const vscode_1 = require("vscode");
const project_parsing_lib_1 = require("@hubspot/project-parsing-lib");
const config_1 = require("@hubspot/local-dev-lib/config");
const jsonc = require("jsonc-parser");
const debounce_1 = require("debounce");
const fileHelpers_1 = require("./fileHelpers");
const constants_1 = require("./constants");
function initializeProjectConfigValidation(context) {
    const state = {
        diagnosticsCollection: vscode_1.languages.createDiagnosticCollection('hubspot-project-config-schema'),
        ajv: (0, project_parsing_lib_1.createAjvInstance)(),
        schemaCache: {},
    };
    context.subscriptions.push(state.diagnosticsCollection);
    vscode_1.workspace.onDidOpenTextDocument((doc) => validateDocument(state, doc));
    vscode_1.workspace.onDidChangeTextDocument((0, debounce_1.debounce)((event) => validateDocument(state, event.document), constants_1.VALIDATION_DEBOUNCE_TIME));
    vscode_1.workspace.onDidSaveTextDocument((doc) => validateDocument(state, doc));
    vscode_1.workspace.onDidCloseTextDocument((doc) => state.diagnosticsCollection.delete(doc.uri));
    vscode_1.workspace.textDocuments.forEach((doc) => validateDocument(state, doc));
}
exports.initializeProjectConfigValidation = initializeProjectConfigValidation;
async function validateDocument(state, document) {
    try {
        const diagnostics = await validateDocumentDiagnostics(state, document);
        state.diagnosticsCollection.set(document.uri, diagnostics);
    }
    catch (error) {
        console.error('Error validating document:', error);
    }
}
async function validateDocumentDiagnostics(state, document) {
    if (!document.fileName.endsWith(project_parsing_lib_1.metafileExtension)) {
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
    let metaFile;
    try {
        metaFile = JSON.parse(document.getText());
    }
    catch (error) {
        return [newErrorDiagnostic((0, project_parsing_lib_1.getInvalidJsonError)())];
    }
    const root = jsonc.parseTree(document.getText());
    if (!root) {
        // Should not happen, we've already parsed it above without jsonc
        return [newErrorDiagnostic((0, project_parsing_lib_1.getInvalidJsonError)())];
    }
    if (!metaFile.type) {
        return [newErrorDiagnostic((0, project_parsing_lib_1.getMissingTypeError)())];
    }
    const uidError = (0, project_parsing_lib_1.validateUid)(metaFile.uid || '');
    if (uidError) {
        const uidNode = jsonc.findNodeAtLocation(root, ['uid']);
        return [
            newErrorDiagnostic(uidError, uidNode
                ? new vscode_1.Range(document.positionAt(uidNode.offset), document.positionAt(uidNode.offset + uidNode.length))
                : undefined),
        ];
    }
    if (!metaFile.config) {
        return [newErrorDiagnostic((0, project_parsing_lib_1.getMissingConfigError)())];
    }
    const accountId = (0, config_1.getAccountId)();
    if (!accountId) {
        return [
            newErrorDiagnostic(`${(0, project_parsing_lib_1.getMissingAccountIdError)()}. Authenticate account with the HubSpot CLI`),
        ];
    }
    const cachedValidator = await getCachedValidatorForExternalType(state, hsProjectFile, projectVersion, accountId, metaFile.type);
    if (cachedValidator.type === 'error') {
        return [newErrorDiagnostic(cachedValidator.error)];
    }
    if (cachedValidator.validator(metaFile['config'])) {
        return [];
    }
    let diagnostics = {};
    (cachedValidator.validator.errors || []).forEach((error) => {
        const { message, nodePath, onlyKeyNode } = customizeAjvError(error);
        if (!message) {
            return;
        }
        const deduplicationKey = diagnosticDeduplicationKey(nodePath, error.keyword, error.params);
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
        diagnostics[deduplicationKey] = newErrorDiagnostic(message, new vscode_1.Range(startPos, endPos));
    });
    return Object.values(diagnostics);
}
function customizeAjvError(error) {
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
        case project_parsing_lib_1.AjvErrorKeyword.AdditionalItems:
            message = `Too many items, need at most ${error.params.limit}`;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.AdditionalProperties:
            nodePath.push(error.params.additionalProperty);
            onlyKeyNode = true;
            message = `Unknown field: ${error.params.additionalProperty}`;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.Dependencies:
            message = `When you have this property, you must have all of these as well: ${error.params.deps}. You are missing at least: ${error.params.missingProperty}`;
            nodePath.push(error.params.property);
            onlyKeyNode = true;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.Enum:
            // Enum errors often happen on types and have cascading effects. We let users know that other errors can lead to this one.
            if (error.params.allowedValues) {
                message = `Try one of: ${error.params.allowedValues.join(', ')}`;
            }
            else {
                message = `Value not allowed. Other errors can cause this`;
            }
            break;
        case project_parsing_lib_1.AjvErrorKeyword.Maximum:
        case project_parsing_lib_1.AjvErrorKeyword.Minimum:
        case project_parsing_lib_1.AjvErrorKeyword.ExclusiveMaximum:
        case project_parsing_lib_1.AjvErrorKeyword.ExclusiveMinimum:
            message = `This value must ${error.params.comparison}${error.params.limit}`;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.MaxItems:
            message = `Value is too long, needs at most ${error.params.limit} items`;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.MaxLength:
            message = `Value is too long, needs at most ${error.params.limit} characters`;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.MaxProperties:
            message = `Too many properties, need at most ${error.params.limit}`;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.MinItems:
            message = `Value is too short, needs at least ${error.params.limit} items`;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.MinLength:
            message = `Value is too short, needs at least ${error.params.limit} characters`;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.MinProperties:
            message = `Too few properties, need at least ${error.params.limit}`;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.MultipleOf:
            message = `This value must be a multiple of ${error.params.multipleOf}`;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.OneOf:
            onlyKeyNode = true;
            message = `Does not match any of the allowed schemas`;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.Pattern:
            message = `Value does not match pattern: ${error.params.pattern}`;
            break;
        case project_parsing_lib_1.AjvErrorKeyword.Required:
            onlyKeyNode = true;
            message = (0, project_parsing_lib_1.getMissingRequiredFieldError)(error.params.missingProperty);
            break;
        case project_parsing_lib_1.AjvErrorKeyword.Type:
            message = `Incorrect type: ${error.message}`;
            break;
        default:
            break;
    }
    return { message, nodePath, onlyKeyNode };
}
function newErrorDiagnostic(error, range) {
    return new vscode_1.Diagnostic(range || new vscode_1.Range(0, 0, 0, 0), error, vscode_1.DiagnosticSeverity.Error);
}
function diagnosticDeduplicationKey(nodePath, keyword, params) {
    return `${keyword}::${nodePath.join('/')}::${JSON.stringify(params)}`;
}
function getKeyNode(node) {
    var _a, _b;
    return ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === 'property' ? (_b = node.parent.children) === null || _b === void 0 ? void 0 : _b[0] : node;
}
async function getSchemasForAllTypes(state, hsProjectFile, platformVersion, accountId) {
    // If schema cache has a schema for this version, return it
    // If there is an error, we're going to return that too
    if (state.schemaCache[platformVersion]) {
        return state.schemaCache[platformVersion];
    }
    try {
        const response = await (0, project_parsing_lib_1.getIntermediateRepresentationSchema)({
            projectSourceDir: hsProjectFile.fsPath,
            platformVersion,
            accountId,
        });
        const schemasByType = {};
        for (const [key, schema] of Object.entries(response)) {
            schemasByType[key] = { schema };
        }
        state.schemaCache[platformVersion] = {
            type: 'schema',
            schemasByType,
        };
    }
    catch (error) {
        const message = `${(0, project_parsing_lib_1.getFailedToFetchSchemasError)()}. Reload your window or restart to try again`;
        console.error(message, error);
        state.schemaCache[platformVersion] = {
            type: 'error',
            error: message,
        };
    }
    return state.schemaCache[platformVersion];
}
async function getCachedValidatorForExternalType(state, hsProjectFile, platformVersion, accountId, externalType) {
    const cachedSchemas = await getSchemasForAllTypes(state, hsProjectFile, platformVersion, accountId);
    if (cachedSchemas.type === 'error') {
        return cachedSchemas;
    }
    const internalType = (0, project_parsing_lib_1.mapToInternalType)(externalType);
    if (!(internalType in cachedSchemas.schemasByType)) {
        return { type: 'error', error: (0, project_parsing_lib_1.getUnsupportedTypeError)(externalType) };
    }
    const schemaAndValidator = cachedSchemas.schemasByType[internalType];
    let validator = schemaAndValidator.validator;
    if (!validator) {
        validator = state.ajv.compile(schemaAndValidator.schema);
        schemaAndValidator.validator = validator;
    }
    return { type: 'validator', validator };
}
async function findHsProjectFile(start) {
    let currentDir = (0, fileHelpers_1.dirname)(start);
    while (true) {
        const current = vscode_1.Uri.joinPath(currentDir, project_parsing_lib_1.hsProjectJsonFilename);
        if (await (0, fileHelpers_1.doesFileExist)(current)) {
            return current;
        }
        const parent = (0, fileHelpers_1.dirname)(currentDir);
        if (parent.fsPath === currentDir.fsPath) {
            return null;
        }
        currentDir = parent;
    }
}
async function getProjectVersion(hsProjectFile) {
    try {
        const fileContents = await vscode_1.workspace.fs.readFile(hsProjectFile);
        const config = JSON.parse(fileContents.toString());
        if ('platformVersion' in config) {
            return config.platformVersion;
        }
    }
    catch (error) {
        console.error(`Error reading ${project_parsing_lib_1.hsProjectJsonFilename}:`, error);
    }
    return null;
}
//# sourceMappingURL=projectConfigValidation.js.map