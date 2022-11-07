import * as vscode from 'vscode';
import * as fs from 'fs';
import { setCustomClauseVariables } from './variables';
import { updateStatusBarItems } from './statusBar';
import { trackAction } from './tracking';

const { findConfig, loadConfig, validateConfig } = require('@hubspot/cli-lib');
const {
  updateConfigWithPersonalAccessKey,
} = require('@hubspot/cli-lib/personalAccessKey');
const {
  createEmptyConfigFile,
  setConfigPath,
} = require('@hubspot/cli-lib/lib/config');

let hubspotConfigWatcher: fs.FSWatcher;
let loadConfigDependentFeatures: Function;

export const loadHubspotConfigFile = (rootPath: string) => {
  if (!rootPath) {
    return;
  }

  console.log(`Root path: ${rootPath}`);

  const path = findConfig(rootPath);
  setCustomClauseVariables(path);

  console.log(`Path: ${path}`);

  if (!path) {
    return;
  }

  loadConfig(path);

  if (!validateConfig()) {
    return;
  } else {
    return path;
  }
};

export const onChangeHubspotConfig = (config: any) => {
  console.log('onChangeHubspotConfig');
  updateStatusBarItems(config.defaultAccount, config);
};

export const initializeHubspotConfigFileWatch = (
  rootPath: string,
  configPath: string
) => {
  if (!hubspotConfigWatcher) {
    loadConfigDependentFeatures(configPath);
    hubspotConfigWatcher = fs.watch(configPath, async (eventType) => {
      if (eventType === 'change') {
        console.log('hubspot.config.yml changed');
        loadHubspotConfigFile(rootPath);
      } else if (eventType === 'rename') {
        // TODO - Do we want to disable config-specific features?
        console.log('hubspot.config.yml renamed/deleted');
        loadHubspotConfigFile(rootPath);
      }
    });
  }
};

export const registerConfigDependentFeatures = async (
  context: vscode.ExtensionContext,
  rootPath: string,
  doLoadConfigDependentFeatures: Function
) => {
  const configPath = loadHubspotConfigFile(rootPath);
  loadConfigDependentFeatures = doLoadConfigDependentFeatures;

  if (configPath) {
    console.log(`HubSpot config loaded from: ${configPath}`);
    console.log('configPath', configPath);
    initializeHubspotConfigFileWatch(rootPath, configPath);
  } else {
    console.log(`No config found. Config path: ${configPath}`);
  }
};

// Handled express auth server POST request w/ new auth data
export const handleHubspotConfigPostRequest = async (
  req: any,
  { rootPath }: { rootPath: string }
) => {
  const {
    env = 'prod',
    name,
    personalAccessKeyResp: { encodedOAuthRefreshToken: personalAccessKey },
  } = req.body;
  let configPath = loadHubspotConfigFile(rootPath);

  if (configPath) {
    // Do we need this?
    setConfigPath(configPath);
  } else {
    configPath = `${rootPath}/hubspot.config.yml`;
    console.log('Creating empty config: ', configPath);
    await createEmptyConfigFile({ path: configPath });
  }
  const updatedConfig = await updateConfigWithPersonalAccessKey({
    personalAccessKey,
    name,
    env,
  });

  initializeHubspotConfigFileWatch(rootPath, configPath);

  vscode.window.showInformationMessage(
    `Successfully added ${name} to the config.`
  );
  vscode.window
    .showInformationMessage(
      `Do you want to set ${name} as the default account?`,
      'Yes',
      'No'
    )
    .then((answer: string | undefined) => {
      if (answer === 'Yes') {
        console.log(`Updating defaultPortal to ${name}.`);
        vscode.commands.executeCommand(
          'hubspot.config.setDefaultAccount',
          name
        );
      }
    });

  await trackAction('auth-success', { name });

  return updatedConfig;
};
