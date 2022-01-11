import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { getConfig, setConfig } from '../core/config';

const findAndLoadConfigFile = async () => {
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

    setConfig(yaml.parse(Buffer.from(file).toString()));
  } catch (error) {
    console.error('Could not read config file');
    return null;
  }
};

const getDefaultAccountConfig = () => {
  const _config = getConfig();
  const defaultAccountConfig = _config.portals.find(
    (portal) => portal.name === _config.defaultPortal
  );
  return defaultAccountConfig;
};

export { findAndLoadConfigFile, getDefaultAccountConfig };
