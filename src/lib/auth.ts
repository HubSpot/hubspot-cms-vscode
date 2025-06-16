import { commands, window } from 'vscode';
import { COMMANDS, EVENTS } from './constants';
import {
  findConfig,
  loadConfig,
  validateConfig,
  setConfig,
  setConfigPath,
  getConfigPath,
} from '@hubspot/local-dev-lib/config';
import {
  getDeprecatedConfig,
  getGlobalConfig,
  mergeConfigProperties,
  mergeExistingConfigs,
} from '@hubspot/local-dev-lib/config/migrate';

const onLoadPath = (configPath: string) => {
  commands.executeCommand('setContext', 'hubspot.configPath', configPath);
  if (!configPath) {
    commands.executeCommand(COMMANDS.CONFIG.SET_DEFAULT_ACCOUNT, null);
    setConfig(undefined);
    setConfigPath(null);
  }
};

export const loadHubspotConfigFile = (rootPath: string) => {
  if (!rootPath) {
    return;
  }

  const deprecatedConfigPath = findConfig(rootPath);
  const globalConfigPath = getConfigPath(undefined, true);

  const resolvedConfigPath = globalConfigPath || deprecatedConfigPath;

  if (!resolvedConfigPath) {
    return;
  }

  // We need to call loadConfig to ensure the isActive() check returns true for global config
  loadConfig(resolvedConfigPath);

  if (deprecatedConfigPath && globalConfigPath) {
    const mergeConfigCopy = 'Merge accounts';
    window
      .showWarningMessage(
        `Found both global and deprecated account configuration files. Click "Merge configuration files" to merge them automatically.`,
        mergeConfigCopy
      )
      .then((selection) => {
        if (selection === mergeConfigCopy) {
          window.showInformationMessage(
            `Merging accounts from ${deprecatedConfigPath} into ${globalConfigPath}. Your existing configuration file will be archived.`
          );

          const deprecatedConfig = getDeprecatedConfig(deprecatedConfigPath);
          const globalConfig = getGlobalConfig();

          let success = false;
          try {
            const { initialConfig: GlobalConfigWithPropertiesMerged } =
              mergeConfigProperties(globalConfig!, deprecatedConfig!, true);

            mergeExistingConfigs(
              GlobalConfigWithPropertiesMerged,
              deprecatedConfig!
            );
            success = true;
          } catch (error) {
            throw new Error('Error merging configuration files: ' + error);
          }

          if (success) {
            window.showInformationMessage(`Config files successfully merged.`);
            initializeConfig(rootPath);
          }
        }
      });
    return;
  }

  onLoadPath(resolvedConfigPath);

  if (!validateConfig()) {
    throw new Error(
      `Invalid config could not be loaded: ${resolvedConfigPath}`
    );
  } else {
    commands.executeCommand(EVENTS.ON_CONFIG_UPDATED);
    return resolvedConfigPath;
  }
};

export const initializeConfig = (rootPath: string) => {
  const configPath = loadHubspotConfigFile(rootPath);

  if (configPath) {
    console.log(`configPath: ${configPath}`);
    commands.executeCommand(EVENTS.ON_CONFIG_FOUND, rootPath, configPath);
  } else {
    console.log(`No config found. Config path: ${configPath}`);
  }
};
