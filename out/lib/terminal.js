"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTerminal = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
const initializeTerminal = () => {
    const hsInstalled = vscode_1.commands.executeCommand(constants_1.COMMANDS.VERSION_CHECK.HS);
    vscode_1.commands.executeCommand(constants_1.COMMANDS.VERSION_CHECK.NPM);
    if (!hsInstalled) {
        const hubspotInstalledPoll = setInterval(async () => {
            const hsPath = await vscode_1.commands.executeCommand(constants_1.COMMANDS.VERSION_CHECK.HS);
            if (hsPath) {
                clearInterval(hubspotInstalledPoll);
            }
        }, constants_1.POLLING_INTERVALS.SLOW);
    }
};
exports.initializeTerminal = initializeTerminal;
//# sourceMappingURL=terminal.js.map