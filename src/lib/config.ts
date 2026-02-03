import { commands, window } from 'vscode';
import { EVENTS } from './constants';
import {
  validateConfig,
  getLocalConfigFilePathIfExists,
  globalConfigFileExists,
  getGlobalConfigFilePath,
  getConfig,
} from '@hubspot/local-dev-lib/config';
import { HubSpotConfig } from '@hubspot/local-dev-lib/types/Config';
import { HubSpotConfigAccount } from '@hubspot/local-dev-lib/types/Accounts';
import {
  mergeConfigProperties,
  mergeConfigAccounts,
  getConfigAtPath,
} from '@hubspot/local-dev-lib/config/migrate';

export const getDisplayedHubSpotPortalInfo = (
  portalData: HubSpotConfigAccount
) => {
  const accountIdentifier = portalData.accountId;
  return portalData.name
    ? `${portalData.name} - ${accountIdentifier}`
    : `${accountIdentifier}`;
};

export const portalNameInvalid = (
  portalName: string,
  config: HubSpotConfig | null
) => {
  if (typeof portalName !== 'string') {
    return 'Portal name must be a string';
  } else if (!portalName.length) {
    return 'Portal name cannot be empty';
  } else if (!/^\S*$/.test(portalName)) {
    return 'Portal name cannot contain spaces';
  }
  return config &&
    'portals' in config &&
    (config.accounts || [])
      .map((p: HubSpotConfigAccount) => p.name)
      .find((name: string | undefined) => name === portalName)
    ? `${portalName} already exists in config.`
    : '';
};

export const loadHubSpotConfigFile = (rootPath: string) => {
  if (!rootPath) {
    return;
  }

  const deprecatedConfigPath = getLocalConfigFilePathIfExists();
  const globalConfigExists = globalConfigFileExists();

  let globalConfigPath: string | null = null;

  if (globalConfigExists) {
    globalConfigPath = getGlobalConfigFilePath();
  }

  const resolvedConfigPath = globalConfigPath || deprecatedConfigPath;

  if (!resolvedConfigPath) {
    return;
  }

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

          const deprecatedConfig = getConfigAtPath(deprecatedConfigPath);
          const globalConfig = getConfig();

          let success = false;
          try {
            const {
              configWithMergedProperties: GlobalConfigWithPropertiesMerged,
            } = mergeConfigProperties(globalConfig!, deprecatedConfig!, true);

            mergeConfigAccounts(
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

  commands.executeCommand(
    'setContext',
    'hubspot.configPath',
    resolvedConfigPath
  );

  if (!validateConfig()) {
    throw new Error(
      `Invalid config could not be loaded: ${resolvedConfigPath}`
    );
  } else {
    commands.executeCommand(EVENTS.CONFIG.ON_CONFIG_UPDATED);
    return resolvedConfigPath;
  }
};

export const initializeConfig = (rootPath: string) => {
  const configPath = loadHubSpotConfigFile(rootPath);

  if (configPath) {
    console.log(`configPath: ${configPath}`);
    commands.executeCommand(
      EVENTS.CONFIG.ON_CONFIG_FOUND,
      rootPath,
      configPath
    );
  } else {
    console.log(`No config found. Config path: ${configPath}`);
  }
};
