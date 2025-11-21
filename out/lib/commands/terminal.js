"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const vscode_1 = require("vscode");
const semver_1 = require("semver");
const helpers_1 = require("../helpers");
const constants_1 = require("../constants");
const registerCommands = (context) => {
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.HUBSPOT_CLI.INSTALL, () => {
        const terminal = vscode_1.window.createTerminal();
        terminal.show();
        const hubspotInstalledPoll = setInterval(async () => {
            const hsVersion = await vscode_1.commands.executeCommand(constants_1.COMMANDS.VERSION_CHECK.HS);
            if (hsVersion) {
                clearInterval(hubspotInstalledPoll);
                vscode_1.window.showInformationMessage(`HubSpot CLI version ${hsVersion} installed.`);
            }
        }, constants_1.POLLING_INTERVALS.FAST);
        const cmd = process.platform === 'win32'
            ? "echo 'Installing the HubSpot CLI.' & npm i -g @hubspot/cli@latest & echo 'Installation complete. You can now close this terminal window.'"
            : "echo 'Installing the HubSpot CLI.' && npm i -g @hubspot/cli@latest && echo 'Installation complete. You can now close this terminal window.'";
        terminal.sendText(cmd);
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.HUBSPOT_CLI.UPDATE, async () => {
        const terminal = vscode_1.window.createTerminal();
        const latestVersion = await vscode_1.commands.executeCommand(constants_1.COMMANDS.VERSION_CHECK.HS_LATEST);
        terminal.show();
        const hsLegacyInstalled = (await (0, helpers_1.runTerminalCommand)(`npm list -g`)).includes('@hubspot/cms-cli');
        if (hsLegacyInstalled) {
            const selection = await vscode_1.window.showWarningMessage('The legacy Hubspot CLI (@hubspot/cms-cli) will be removed to update. Continue?', ...['Okay', 'Cancel']);
            if (!selection || selection === 'Cancel') {
                terminal.dispose();
                return;
            }
        }
        const hubspotUpdatedPoll = setInterval(async () => {
            const hsVersion = await vscode_1.commands.executeCommand(constants_1.COMMANDS.VERSION_CHECK.HS);
            if (hsVersion === latestVersion) {
                clearInterval(hubspotUpdatedPoll);
                vscode_1.window.showInformationMessage(`HubSpot CLI updated to version ${latestVersion}.`);
            }
        }, constants_1.POLLING_INTERVALS.FAST);
        const cmd = process.platform === 'win32'
            ? "echo 'Updating the HubSpot CLI.' & npm uninstall -g @hubspot/cms-cli & npm i -g @hubspot/cli@latest & echo 'Update complete. You can now close this terminal window.'"
            : "echo 'Updating the HubSpot CLI.' && npm uninstall -g @hubspot/cms-cli && npm i -g @hubspot/cli@latest && echo 'Update complete. You can now close this terminal window.'";
        terminal.sendText(cmd);
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.VERSION_CHECK.HS_LATEST, async () => {
        const hsVersion = (await (0, helpers_1.runTerminalCommand)('hs --version')).trim();
        const cmd = process.platform === 'win32'
            ? `npm info @hubspot/cli@latest | findstr "latest"`
            : `npm info @hubspot/cli@latest | grep 'latest'`;
        const nodeLatestLine = await (0, helpers_1.runTerminalCommand)(cmd);
        const latestHsVersion = nodeLatestLine
            .replace(
        // Remove ANSI color styles https://stackoverflow.com/a/29497680
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
            .replace('latest: ', '')
            .trim();
        vscode_1.commands.executeCommand('setContext', 'hubspot.terminal.versions.latest.hs', hsVersion);
        console.log('latestVersion: ', latestHsVersion);
        const newerCLIVersionAvailable = (0, semver_1.gt)(latestHsVersion, hsVersion);
        console.log('Newer CLI Version Available: ', newerCLIVersionAvailable);
        vscode_1.commands.executeCommand('setContext', 'hubspot.updateAvailableForCLI', newerCLIVersionAvailable);
        return latestHsVersion;
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.VERSION_CHECK.HS, async () => {
        const hsVersion = await (0, helpers_1.checkTerminalCommandVersion)('hs');
        vscode_1.commands.executeCommand('setContext', 'hubspot.terminal.versions.installed.hs', hsVersion);
        vscode_1.commands.executeCommand('setContext', 'hubspot.versionChecksComplete', true);
        console.log('hsVersion: ', hsVersion);
        if (hsVersion) {
            vscode_1.commands.executeCommand(constants_1.COMMANDS.VERSION_CHECK.HS_LATEST);
        }
        return hsVersion;
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.VERSION_CHECK.NPM, async () => {
        const npmVersion = await (0, helpers_1.checkTerminalCommandVersion)('npm');
        vscode_1.commands.executeCommand('setContext', 'hubspot.terminal.versions.installed.npm', npmVersion);
        console.log('npmVersion: ', npmVersion);
        return npmVersion;
    }));
};
exports.registerCommands = registerCommands;
//# sourceMappingURL=terminal.js.map