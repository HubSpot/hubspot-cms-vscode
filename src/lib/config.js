import * as vscode from 'vscode';

const findConfigFile = async () => {
  const config = await vscode.workspace.findFiles(
    '**/hubspot.config.yml',
    '**/node_modules/**'
  );

  if (config.length === 0) {
    console.debug('No config file found');
    return null;
  }

  try {
    const file = await vscode.workspace.fs.readFile(config[0]);

    return yaml.parse(file.toString());
  } catch (error) {
    console.error('Could not read config file');
    return null;
  }
};

const validateConfig = (config) => {
  if (!config) {
    console.error('Config file is empty');
    return false;
  }

  if (!config.defaultPortal) {
    console.error('This extension requires a "defaultPortal"');
    return false;
  }

  if (!Array.isArray(config.portals)) {
    console.error('This extension requires at least one configured account');
    return false;
  }
  return true;
};

const loadDefaultAccountConfig = (config) => {
  const defaultAccountConfig = config.portals.find(
    (portal) => portal.name === config.defaultPortal
  );

  setConfig(defaultAccountConfig);
};

export { findConfigFile, validateConfig, loadDefaultAccountConfig };
