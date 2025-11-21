"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAccountId = exports.buildStatusBarItem = exports.invalidateParentDirectoryCache = exports.checkTerminalCommandVersion = exports.runTerminalCommand = exports.getDisplayedHubspotPortalInfo = exports.getRootPath = void 0;
const path_1 = require("path");
const vscode_1 = require("vscode");
const config_1 = require("@hubspot/local-dev-lib/config");
const getAccountIdentifier_1 = require("@hubspot/local-dev-lib/config/getAccountIdentifier");
const constants_1 = require("./constants");
const { exec } = require('node:child_process');
const getRootPath = () => {
    const workspaceFolders = vscode_1.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length < 1) {
        return;
    }
    return workspaceFolders[0].uri.fsPath;
};
exports.getRootPath = getRootPath;
const getDisplayedHubspotPortalInfo = (portalData) => {
    const accountIdentifier = (0, getAccountIdentifier_1.getAccountIdentifier)(portalData);
    return portalData.name
        ? `${portalData.name} - ${accountIdentifier}`
        : `${accountIdentifier}`;
};
exports.getDisplayedHubspotPortalInfo = getDisplayedHubspotPortalInfo;
const runTerminalCommand = async (terminalCommand) => {
    return new Promise((resolve, reject) => {
        try {
            const cmd = process.platform === 'win32'
                ? `${terminalCommand} & exit`
                : `${terminalCommand} && exit`;
            exec(cmd, (error, stdout, stderr) => {
                const err = error || stderr;
                if (err) {
                    reject(err);
                }
                else {
                    resolve(stdout);
                }
            });
        }
        catch (e) {
            reject(e);
        }
    });
};
exports.runTerminalCommand = runTerminalCommand;
const checkTerminalCommandVersion = async (terminalCommand) => {
    return new Promise(async (resolve, reject) => {
        try {
            const cmd = process.platform === 'win32'
                ? `where ${terminalCommand}`
                : `which ${terminalCommand}`;
            const pathOutputMaybe = await (0, exports.runTerminalCommand)(cmd);
            if (pathOutputMaybe === `${terminalCommand} not found`) {
                // Command is not installed/found
                resolve(undefined);
            }
            else {
                // Terminal command is installed, check version
                try {
                    const commandVersion = await (0, exports.runTerminalCommand)(`${terminalCommand} --version`);
                    resolve(commandVersion.trim());
                }
                catch (e) {
                    // Unknown version
                    resolve('unknown');
                }
            }
        }
        catch (e) {
            resolve(undefined);
        }
    });
};
exports.checkTerminalCommandVersion = checkTerminalCommandVersion;
const invalidateParentDirectoryCache = (filePath) => {
    let parentDirectory = (0, path_1.dirname)(filePath);
    if (parentDirectory === '.') {
        parentDirectory = '/';
    }
    vscode_1.commands.executeCommand(constants_1.COMMANDS.REMOTE_FS.INVALIDATE_CACHE, parentDirectory);
};
exports.invalidateParentDirectoryCache = invalidateParentDirectoryCache;
const buildStatusBarItem = (text) => {
    const statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right);
    statusBarItem.text = text;
    return statusBarItem;
};
exports.buildStatusBarItem = buildStatusBarItem;
function requireAccountId() {
    const accountId = (0, config_1.getAccountId)();
    if (!accountId) {
        return;
    }
}
exports.requireAccountId = requireAccountId;
//# sourceMappingURL=helpers.js.map