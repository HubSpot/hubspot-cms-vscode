import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { setCustomClauseVariables } from './variables';
import { trackAction } from './tracking';
import { Portal } from './types';
import { COMMANDS } from './constants';

const { findConfig, loadConfig, validateConfig } = require('@hubspot/cli-lib');
const {
  updateConfigWithPersonalAccessKey,
} = require('@hubspot/cli-lib/personalAccessKey');
const {
  createEmptyConfigFile,
  setConfig,
  setConfigPath,
} = require('@hubspot/cli-lib/lib/config');

let hubspotConfigWatcher: fs.FSWatcher | null;
let configDependentFeaturesLoaded: boolean = false;
let loadConfigDependentFeatures: Function;
let updateConfigDependentFeatures: Function;

const onLoadPath = (configPath: string) => {
  setCustomClauseVariables(configPath);
  if (!configPath) {
    vscode.commands.executeCommand(COMMANDS.CONFIG_SET_DEFAULT_ACCOUNT, null);
    setConfig(null);
    setConfigPath(null);
  }
};

const onLoadHubspotConfig = () => {
  updateConfigDependentFeatures();
};

export const loadHubspotConfigFile = (rootPath: string) => {
  if (!rootPath) {
    return;
  }

  console.log(`Root path: ${rootPath}`);

  const path = findConfig(rootPath);
  onLoadPath(path);

  console.log(`Path: ${path}`);

  if (!path) {
    return;
  }

  const config = loadConfig(path);

  console.log(
    'loadedHubspotConfig',
    config.defaultPortal,
    JSON.stringify(config.portals.map((p: Portal) => p.name))
  );

  if (!validateConfig()) {
    throw new Error(`Invalid config could not be loaded: ${path}`);
  } else {
    onLoadHubspotConfig();
    return path;
  }
};

export const initializeHubspotConfigDependents = (
  rootPath: string,
  configPath: string
) => {
  if (!configDependentFeaturesLoaded) {
    configDependentFeaturesLoaded = true;
    loadConfigDependentFeatures();
  }

  // This triggers an in-memory update of the config when the file changes
  if (!hubspotConfigWatcher) {
    console.log('Started watching hubspot.config.yml');
    hubspotConfigWatcher = fs.watch(configPath, async (eventType) => {
      if (eventType === 'change') {
        console.log('hubspot.config.yml changed');
        loadHubspotConfigFile(rootPath);
      } else if (eventType === 'rename') {
        console.log('hubspot.config.yml renamed/deleted');
        loadHubspotConfigFile(rootPath);
        hubspotConfigWatcher && hubspotConfigWatcher.close();
        hubspotConfigWatcher = null;
        console.log('Stopped watching hubspot.config.yml');
      }
    });
  }
};

export const registerConfigDependentFeatures = async ({
  rootPath,
  onConfigFound,
  onConfigUpdated,
}: {
  rootPath: string;
  onConfigFound: Function;
  onConfigUpdated: Function;
}) => {
  loadConfigDependentFeatures = onConfigFound;
  updateConfigDependentFeatures = onConfigUpdated;
  const configPath = loadHubspotConfigFile(rootPath);

  if (configPath) {
    console.log(`HubSpot config loaded from: ${configPath}`);
    console.log('configPath', configPath);
    initializeHubspotConfigDependents(rootPath, configPath);
  } else {
    console.log(`No config found. Config path: ${configPath}`);
  }
};

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
    setConfigPath(configPath);
  } else {
    configPath = path.resolve(rootPath, 'hubspot.config.yml');
    console.log('Creating empty config: ', configPath);
    await createEmptyConfigFile({ path: configPath });
  }
  const updatedConfig = await updateConfigWithPersonalAccessKey({
    personalAccessKey,
    name,
    env,
  });

  initializeHubspotConfigDependents(rootPath, configPath);

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
          COMMANDS.CONFIG_SET_DEFAULT_ACCOUNT,
          name
        );
      }
    });

  await trackAction('auth-success', { name });

  return updatedConfig;
};
