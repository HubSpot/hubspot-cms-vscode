"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeStatusBar = exports.updateStatusBarItems = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
const config_1 = require("@hubspot/local-dev-lib/config");
let hsStatusBar;
const updateStatusBarItems = () => {
    console.log('updateStatusBarItems');
    const config = (0, config_1.getConfig)();
    const defaultAccount = config && (0, config_1.getConfigDefaultAccount)();
    if (defaultAccount) {
        hsStatusBar.text = `$(arrow-swap) ${defaultAccount}`;
        hsStatusBar.tooltip = `Default HubSpot Account: ${defaultAccount}`;
        hsStatusBar.backgroundColor = undefined;
        hsStatusBar.show();
    }
    else {
        hsStatusBar.text = `$(extensions-warning-message) No Default HubSpot Account`;
        hsStatusBar.tooltip =
            'There is currently no default HubSpot account set within the config. Click here to select a defaultAccount.';
        hsStatusBar.backgroundColor = new vscode_1.ThemeColor('statusBarItem.warningBackground');
        hsStatusBar.show();
    }
};
exports.updateStatusBarItems = updateStatusBarItems;
const initializeStatusBar = (context) => {
    console.log('statusBar:activate');
    hsStatusBar = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 100);
    hsStatusBar.command = constants_1.COMMANDS.CONFIG.SELECT_DEFAULT_ACCOUNT;
    context.subscriptions.push(hsStatusBar);
};
exports.initializeStatusBar = initializeStatusBar;
//# sourceMappingURL=statusBar.js.map