import * as vscode from 'vscode';
import * as fs from 'fs';
import { Portal } from './types';
import { COMMANDS } from './constants';

const { findConfig, loadConfig, validateConfig } = require('@hubspot/cli-lib');
const { setConfig, setConfigPath } = require('@hubspot/cli-lib/lib/config');

let hubspotConfigWatcher: fs.FSWatcher | null;
let configDependentFeaturesLoaded: boolean = false;
let loadConfigDependentFeatures: Function;
let updateConfigDependentFeatures: Function;

const onLoadPath = (configPath: string) => {
  vscode.commands.executeCommand(
    'setContext',
    'hubspot.configPath',
    configPath
  );
  if (!configPath) {
    vscode.commands.executeCommand(COMMANDS.CONFIG_SET_DEFAULT_ACCOUNT, null);
    setConfig(null);
    setConfigPath(null);
  }
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

  if (!validateConfig()) {
    throw new Error(`Invalid config could not be loaded: ${path}`);
  } else {
    console.log(
      'loadedHubspotConfig',
      config.defaultPortal,
      JSON.stringify(config.portals.map((p: Portal) => p.name))
    );
    updateConfigDependentFeatures();
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

  if (!hubspotConfigWatcher) {
    console.log('Started watching hubspot.config.yml');
    // This triggers an in-memory update of the config when the file changes
    hubspotConfigWatcher = fs.watch(configPath, async (eventType) => {
      if (eventType === 'change') {
        console.log('hubspot.config.yml changed');
        loadHubspotConfigFile(rootPath);
      } else if (eventType === 'rename') {
        // 'rename' event is triggers for renames and deletes
        console.log('hubspot.config.yml renamed/deleted');
        loadHubspotConfigFile(rootPath);
        hubspotConfigWatcher && hubspotConfigWatcher.close();
        hubspotConfigWatcher = null;
        console.log('Stopped watching hubspot.config.yml');
      }
    });
  }
};

/**
 * Some features rely on the existence of hubspot.config.yml, this function
 * allows registering those features so they are only initialized when
 * the hubspot.config.yml file is present
 * @param rootPath root path of the project (where hubspot.config.yml would reside)
 * @param onConfigFound callback to be executed when a hubspot.config.yml is found
 * @param onConfigUpdated callback to be executed when the hubspot.config.yml is updated/changed
 */
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
