"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeHubLAutoDetect = void 0;
const vscode_1 = require("vscode");
const { extname } = require('path');
const constants_1 = require("./constants");
const tracking_1 = require("./tracking");
const initializeHubLAutoDetect = (context) => {
    if (hasHubLAssociations() ||
        optedOutGlobally() ||
        !!context.workspaceState.get('DO_NOT_USE_HUBL')) {
        return;
    }
    const handleTextDocumentOpen = vscode_1.workspace.onDidOpenTextDocument(() => {
        var _a;
        const textDocument = (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
        if (!textDocument) {
            return;
        }
        const fileExt = extname(textDocument.fileName);
        if (fileExt !== '.html' && fileExt !== '.css') {
            return;
        }
        let n = 1;
        const limit = Math.min(50, textDocument.lineCount);
        while (n <= limit) {
            const lineWithHubl = textDocument.lineAt(n).text.match(/{{.*}}|{%.*%}/g);
            if (lineWithHubl) {
                showHublDetectedMessage(context);
                (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.AUTO_DETECT.DETECTED);
                handleTextDocumentOpen.dispose();
                break;
            }
            n++;
        }
    });
};
exports.initializeHubLAutoDetect = initializeHubLAutoDetect;
const showHublDetectedMessage = (context) => {
    const hublDetectedMessage = 'It looks like this file contains HubL code. Would you like to use HubL for this project?';
    const hublDetectedYesButton = 'Use HubL';
    const hublDetectedNoButton = 'No';
    const hublDetectedNeverAgainButton = 'Never ask again';
    const hubLAssociatedMessage = 'File associations were successfully updated. HubL will now be used for all HTML and CSS files in this workspace.';
    const noAssociationsMessage = 'If you would to update your file associations in the future to use the HubL language mode, see the [HubSpot VSCode documentation](https://github.com/HubSpot/hubspot-cms-vscode/tree/master#language-modes).';
    const neverAssociationsMessage = "We will no longer ask you if you'd like to use HubL on any files in VSCode. If you'd like to turn back on HubL language auto-detection, you can toggle the 'Never Use Hubl' option in your settings. To manually update file associations, see the [HubSpot VSCode documentation].";
    vscode_1.window
        .showInformationMessage(hublDetectedMessage, hublDetectedYesButton, hublDetectedNoButton, hublDetectedNeverAgainButton)
        .then((selection) => {
        switch (selection) {
            case hublDetectedYesButton: {
                updateWorkspaceFileAssociation();
                vscode_1.window.showInformationMessage(hubLAssociatedMessage);
                (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.AUTO_DETECT.YES);
                break;
            }
            case hublDetectedNoButton: {
                context.workspaceState.update('DO_NOT_USE_HUBL', true);
                vscode_1.window.showInformationMessage(noAssociationsMessage);
                (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.AUTO_DETECT.NO);
                break;
            }
            case hublDetectedNeverAgainButton: {
                vscode_1.workspace
                    .getConfiguration(constants_1.EXTENSION_CONFIG_NAME)
                    .update(constants_1.EXTENSION_CONFIG_KEYS.NEVER_USE_HUBL, true, vscode_1.ConfigurationTarget.Global);
                vscode_1.window.showInformationMessage(neverAssociationsMessage);
                (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.AUTO_DETECT.NEVER);
                break;
            }
            default: // User closed the dialogue
                break;
        }
    });
};
const updateWorkspaceFileAssociation = () => {
    const filesConfig = vscode_1.workspace.getConfiguration('files');
    const fileAssoc = filesConfig.get('associations');
    fileAssoc[`*.html`] = constants_1.HUBL_HTML_ID;
    fileAssoc[`*.css`] = constants_1.HUBL_CSS_ID;
    filesConfig.update('associations', fileAssoc);
};
function hasHubLAssociations() {
    // Checks if the current active window has HubL associations
    // Note if the Workspace doesn't have any, it will fallback to the global state
    const filesConfig = vscode_1.workspace.getConfiguration('files');
    const fileAssoc = filesConfig.get('associations');
    return (fileAssoc['*.html'] === constants_1.HUBL_HTML_ID && fileAssoc['*.css'] === constants_1.HUBL_CSS_ID);
}
function optedOutGlobally() {
    return !!vscode_1.workspace
        .getConfiguration(constants_1.EXTENSION_CONFIG_NAME)
        .get(constants_1.EXTENSION_CONFIG_KEYS.NEVER_USE_HUBL);
}
//# sourceMappingURL=autoDetect.js.map