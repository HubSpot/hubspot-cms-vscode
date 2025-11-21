"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeConfig = exports.loadHubspotConfigFile = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
const config_1 = require("@hubspot/local-dev-lib/config");
const migrate_1 = require("@hubspot/local-dev-lib/config/migrate");
const onLoadPath = (configPath) => {
    vscode_1.commands.executeCommand('setContext', 'hubspot.configPath', configPath);
    if (!configPath) {
        vscode_1.commands.executeCommand(constants_1.COMMANDS.CONFIG.SET_DEFAULT_ACCOUNT, null);
        (0, config_1.setConfig)(undefined);
        (0, config_1.setConfigPath)(null);
    }
};
const loadHubspotConfigFile = (rootPath) => {
    if (!rootPath) {
        return;
    }
    const deprecatedConfigPath = (0, config_1.findConfig)(rootPath);
    const globalConfigExists = (0, config_1.configFileExists)(true);
    let globalConfigPath = null;
    if (globalConfigExists) {
        globalConfigPath = (0, config_1.getConfigPath)(undefined, true);
    }
    const resolvedConfigPath = globalConfigPath || deprecatedConfigPath;
    if (!resolvedConfigPath) {
        return;
    }
    // We need to call loadConfig to ensure the isActive() check returns true for global config
    (0, config_1.loadConfig)(resolvedConfigPath);
    if (deprecatedConfigPath && globalConfigPath) {
        const mergeConfigCopy = 'Merge accounts';
        vscode_1.window
            .showWarningMessage(`Found both global and deprecated account configuration files. Click "Merge configuration files" to merge them automatically.`, mergeConfigCopy)
            .then((selection) => {
            if (selection === mergeConfigCopy) {
                vscode_1.window.showInformationMessage(`Merging accounts from ${deprecatedConfigPath} into ${globalConfigPath}. Your existing configuration file will be archived.`);
                const deprecatedConfig = (0, migrate_1.getDeprecatedConfig)(deprecatedConfigPath);
                const globalConfig = (0, migrate_1.getGlobalConfig)();
                let success = false;
                try {
                    const { initialConfig: GlobalConfigWithPropertiesMerged } = (0, migrate_1.mergeConfigProperties)(globalConfig, deprecatedConfig, true);
                    (0, migrate_1.mergeExistingConfigs)(GlobalConfigWithPropertiesMerged, deprecatedConfig);
                    success = true;
                }
                catch (error) {
                    throw new Error('Error merging configuration files: ' + error);
                }
                if (success) {
                    vscode_1.window.showInformationMessage(`Config files successfully merged.`);
                    (0, exports.initializeConfig)(rootPath);
                }
            }
        });
        return;
    }
    onLoadPath(resolvedConfigPath);
    if (!(0, config_1.validateConfig)()) {
        throw new Error(`Invalid config could not be loaded: ${resolvedConfigPath}`);
    }
    else {
        vscode_1.commands.executeCommand(constants_1.EVENTS.ON_CONFIG_UPDATED);
        return resolvedConfigPath;
    }
};
exports.loadHubspotConfigFile = loadHubspotConfigFile;
const initializeConfig = (rootPath) => {
    const configPath = (0, exports.loadHubspotConfigFile)(rootPath);
    if (configPath) {
        console.log(`configPath: ${configPath}`);
        vscode_1.commands.executeCommand(constants_1.EVENTS.ON_CONFIG_FOUND, rootPath, configPath);
    }
    else {
        console.log(`No config found. Config path: ${configPath}`);
    }
};
exports.initializeConfig = initializeConfig;
//# sourceMappingURL=auth.js.map