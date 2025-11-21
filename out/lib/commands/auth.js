"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
const registerCommands = (context, rootPath) => {
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.AUTHORIZE_ACCOUNT, async () => {
        // Detect the IDE type based on env.appName
        const ideParam = vscode_1.env.appName.toLowerCase() === constants_1.IDE_NAMES.CURSOR
            ? constants_1.IDE_NAMES.CURSOR
            : constants_1.IDE_NAMES.VSCODE;
        const authUrl = `https://app.hubspot.com/l/personal-access-key?vsCodeExtensionRootPath=${rootPath}&source=${ideParam}`;
        const callableUri = await vscode_1.env.asExternalUri(vscode_1.Uri.parse(authUrl));
        await vscode_1.env.openExternal(callableUri);
    }));
};
exports.registerCommands = registerCommands;
//# sourceMappingURL=auth.js.map