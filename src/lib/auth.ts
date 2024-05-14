import { commands } from 'vscode';
import { COMMANDS, EVENTS } from './constants';

const {
  findConfig,
  loadConfig,
  validateConfig,
  setConfig,
  setConfigPath,
} = require('@hubspot/local-dev-lib/config');

const onLoadPath = (configPath: string) => {
  commands.executeCommand('setContext', 'hubspot.configPath', configPath);
  if (!configPath) {
    commands.executeCommand(COMMANDS.CONFIG.SET_DEFAULT_ACCOUNT, null);
    setConfig(null);
    setConfigPath(null);
  }
};

export const loadHubspotConfigFile = (rootPath: string) => {
  if (!rootPath) {
    return;
  }

  console.log(`rootPath: ${rootPath}`);

  const path = findConfig(rootPath);
  onLoadPath(path);

  console.log(`path: ${path}`);

  if (!path) {
    return;
  }

  loadConfig(path);

  if (!validateConfig()) {
    throw new Error(`Invalid config could not be loaded: ${path}`);
  } else {
    commands.executeCommand(EVENTS.ON_CONFIG_UPDATED);
    return path;
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
