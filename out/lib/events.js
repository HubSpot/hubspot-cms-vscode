"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEvents = void 0;
const vscode_1 = require("vscode");
const fs_1 = require("fs");
const statusBar_1 = require("../lib/statusBar");
const constants_1 = require("./constants");
const lint_1 = require("./lint");
const auth_1 = require("./auth");
let configFoundAndLoaded = false;
let hubspotConfigWatcher;
const registerEvents = (context) => {
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.EVENTS.ON_CONFIG_FOUND, (rootPath, configPath) => {
        if (!configFoundAndLoaded) {
            configFoundAndLoaded = true;
            console.log(constants_1.EVENTS.ON_CONFIG_FOUND);
            (0, lint_1.setLintingEnabledState)();
            context.subscriptions.push((0, lint_1.getUpdateLintingOnConfigChange)());
            (0, statusBar_1.updateStatusBarItems)();
        }
        if (!hubspotConfigWatcher) {
            console.log(`watching: ${configPath}`);
            // This triggers an in-memory update of the config when the file changes
            hubspotConfigWatcher = (0, fs_1.watch)(configPath, 
            // Type should be WatchEventType but isn't present in types
            async (eventType) => {
                if (eventType === 'change') {
                    console.log(`${configPath} changed`);
                    (0, auth_1.loadHubspotConfigFile)(rootPath);
                }
                else if (eventType === 'rename') {
                    // 'rename' event is triggers for renames and deletes
                    console.log(`${configPath} renamed/deleted`);
                    (0, auth_1.loadHubspotConfigFile)(rootPath);
                    hubspotConfigWatcher && hubspotConfigWatcher.close();
                    hubspotConfigWatcher = null;
                    console.log(`stopped watching ${configPath}`);
                }
            });
        }
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.EVENTS.ON_CONFIG_UPDATED, () => {
        console.log(constants_1.EVENTS.ON_CONFIG_UPDATED);
        vscode_1.commands.executeCommand(constants_1.COMMANDS.ACCOUNTS_REFRESH);
        (0, statusBar_1.updateStatusBarItems)();
    }));
};
exports.registerEvents = registerEvents;
//# sourceMappingURL=events.js.map