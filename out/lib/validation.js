"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalNameInvalid = exports.triggerValidate = void 0;
const vscode_1 = require("vscode");
const validateHubl_1 = require("@hubspot/local-dev-lib/api/validateHubl");
const config_1 = require("@hubspot/local-dev-lib/config");
const { isCodedFile, getAnnotationValue, ANNOTATION_KEYS, TEMPLATE_TYPES, } = require('@hubspot/local-dev-lib/cms/templates');
const { isModuleHTMLFile } = require('@hubspot/local-dev-lib/cms/modules');
const helpers_1 = require("./helpers");
const constants_1 = require("./constants");
const fs = require('fs');
const path = require('path');
const getRange = (document, error) => {
    const adjustedLineNumber = error.lineno > 0 ? error.lineno - 1 : 0;
    if (error.startPosition > 0) {
        return document.getWordRangeAtPosition(new vscode_1.Position(adjustedLineNumber, error.startPosition - 1), constants_1.HUBL_TAG_DEFINITION_REGEX);
    }
    else {
        return document.lineAt(new vscode_1.Position(adjustedLineNumber, 0)).range;
    }
};
const isFileInWorkspace = (error) => {
    const activeEditor = vscode_1.window.activeTextEditor;
    if (!activeEditor) {
        return false;
    }
    const pathToActiveFile = activeEditor.document.uri.path;
    const dirToActiveFile = path.dirname(pathToActiveFile);
    let filePath = error.categoryErrors.fullName || error.categoryErrors.path;
    if (error.category === 'MODULE_NOT_FOUND') {
        filePath = filePath + '.module';
    }
    return fs.existsSync(path.normalize(filePath));
};
const clearValidation = (document, collection) => {
    collection.set(document.uri, undefined);
};
const getRenderingErrors = async (source, context) => {
    try {
        (0, helpers_1.requireAccountId)();
        const { data: { renderingErrors }, } = await (0, validateHubl_1.validateHubl)((0, config_1.getAccountId)(), source, context);
        return renderingErrors;
    }
    catch (e) {
        console.error('There was an error validating this file');
    }
};
const getTemplateTypeValue = (type) => {
    if (!type || !(type in TEMPLATE_TYPES)) {
        return TEMPLATE_TYPES.unmapped;
    }
    return TEMPLATE_TYPES[type];
};
const getTemplateType = (document) => {
    if (isCodedFile(document.fileName)) {
        const source = document.getText();
        return {
            is_available_for_new_content: getAnnotationValue(source, ANNOTATION_KEYS.isAvailableForNewContent) !=
                'false',
            template_type: getTemplateTypeValue(getAnnotationValue(source, ANNOTATION_KEYS.templateType)),
            template_path: document.uri.path,
        };
    }
    if (isModuleHTMLFile(document.fileName)) {
        return { context: { module: {} }, module_path: document.fileName };
    }
    return {};
};
const isValidTemplateError = (reason) => {
    return Object.values(constants_1.TEMPLATE_ERRORS_TYPES).includes(reason);
};
const updateValidation = async (document, collection) => {
    if (!document) {
        return collection.clear();
    }
    const templateContext = getTemplateType(document);
    const renderingErrors = await getRenderingErrors(document.getText(), templateContext);
    if (!renderingErrors) {
        return clearValidation(document, collection);
    }
    const resolvedRenderingErrors = renderingErrors.filter((error) => {
        if (error.reason === constants_1.TEMPLATE_ERRORS_TYPES.MISSING ||
            error.reason === constants_1.TEMPLATE_ERRORS_TYPES.BAD_URL) {
            return isFileInWorkspace(error) ? false : true;
        }
        return true;
    });
    const templateErrors = resolvedRenderingErrors.map((error) => {
        const severity = isValidTemplateError(error.reason)
            ? vscode_1.DiagnosticSeverity[constants_1.VSCODE_SEVERITY[error.reason]]
            : vscode_1.DiagnosticSeverity.Error;
        return {
            code: '',
            message: error.message,
            range: getRange(document, error) || new vscode_1.Range(0, 0, 0, 0),
            severity,
        };
    });
    collection.set(document.uri, templateErrors);
};
let timeout;
const triggerValidate = (document, collection) => {
    clearTimeout(timeout);
    if (!['html-hubl', 'css-hubl'].includes(document.languageId)) {
        return clearValidation(document, collection);
    }
    timeout = setTimeout(function () {
        updateValidation(document, collection);
    }, 1000);
};
exports.triggerValidate = triggerValidate;
const portalNameInvalid = (portalName, config) => {
    if (typeof portalName !== 'string') {
        return 'Portal name must be a string';
    }
    else if (!portalName.length) {
        return 'Portal name cannot be empty';
    }
    else if (!/^\S*$/.test(portalName)) {
        return 'Portal name cannot contain spaces';
    }
    return config &&
        'portals' in config &&
        (config.portals || [])
            .map((p) => p.name)
            .find((name) => name === portalName)
        ? `${portalName} already exists in config.`
        : '';
};
exports.portalNameInvalid = portalNameInvalid;
//# sourceMappingURL=validation.js.map