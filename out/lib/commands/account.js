"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const vscode_1 = require("vscode");
const getAccountIdentifier_1 = require("@hubspot/local-dev-lib/config/getAccountIdentifier");
const constants_1 = require("../constants");
const registerCommands = (context) => {
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.ACCOUNT.VIEW_PERSONAL_ACCESS_KEY, async (hubspotAccount) => {
        const pakUrl = `https://app.hubspot${hubspotAccount.env === 'qa' ? 'qa' : ''}.com/personal-access-key/${(0, getAccountIdentifier_1.getAccountIdentifier)(hubspotAccount)}`;
        vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse(pakUrl));
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.ACCOUNT.OPEN_DESIGN_MANAGER, async (hubspotAccount) => {
        const designManagerUrl = `https://app.hubspot${hubspotAccount.env === 'qa' ? 'qa' : ''}.com/design-manager/${(0, getAccountIdentifier_1.getAccountIdentifier)(hubspotAccount)}`;
        vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse(designManagerUrl));
    }));
};
exports.registerCommands = registerCommands;
//# sourceMappingURL=account.js.map