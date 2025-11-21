"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableLinting = exports.enableLinting = exports.getUpdateLintingOnConfigChange = exports.setLintingEnabledState = void 0;
const vscode_1 = require("vscode");
const validation_1 = require("./validation");
const tracking_1 = require("./tracking");
const constants_1 = require("./constants");
const collection = vscode_1.languages.createDiagnosticCollection('hubl');
let documentChangeListener;
const setLintingEnabledState = () => {
    if (vscode_1.workspace
        .getConfiguration(constants_1.EXTENSION_CONFIG_NAME)
        .get(constants_1.EXTENSION_CONFIG_KEYS.HUBL_LINTING)) {
        (0, exports.enableLinting)();
    }
};
exports.setLintingEnabledState = setLintingEnabledState;
const getUpdateLintingOnConfigChange = () => {
    return vscode_1.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration(`${constants_1.EXTENSION_CONFIG_NAME}.${constants_1.EXTENSION_CONFIG_KEYS.HUBL_LINTING}`)) {
            if (vscode_1.workspace
                .getConfiguration(constants_1.EXTENSION_CONFIG_NAME)
                .get(constants_1.EXTENSION_CONFIG_KEYS.HUBL_LINTING)) {
                (0, exports.enableLinting)();
                await (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.LINTING_ENABLED);
            }
            else {
                (0, exports.disableLinting)();
                await (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.LINTING_DISABLED);
            }
        }
    });
};
exports.getUpdateLintingOnConfigChange = getUpdateLintingOnConfigChange;
const enableLinting = () => {
    if (vscode_1.window.activeTextEditor) {
        (0, validation_1.triggerValidate)(vscode_1.window.activeTextEditor.document, collection);
    }
    documentChangeListener = vscode_1.workspace.onDidChangeTextDocument((event) => {
        if (event.document) {
            (0, validation_1.triggerValidate)(event.document, collection);
        }
    });
};
exports.enableLinting = enableLinting;
const disableLinting = () => {
    // Clear out any existing diagnostics
    collection.clear();
    // Remove onDidChangeTextDocument event listener
    documentChangeListener.dispose();
};
exports.disableLinting = disableLinting;
//# sourceMappingURL=lint.js.map