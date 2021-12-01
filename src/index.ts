import * as vscode from 'vscode';
//@ts-ignore
import { trackUsage } from './core/api/dfs/v1';
import * as yaml from 'yaml';
//@ts-ignore
import { setConfig } from './core/config';
import {
  findConfigFile,
  validateConfig,
  loadDefaultAccountConfig,
  //@ts-ignore
} from './lib/config';

const {
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
} = require('./lib/constants');

async function activate(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length < 1) {
    return;
  }

  const config = await findConfigFile();

  if (!validateConfig(config)) {
    return;
  }

  loadDefaultAccountConfig(config);

  const accountId = 1932631;

  await trackUsage(
    'vscode-extension-interaction',
    'INTERACTION',
    { authType: 'personalAccessKey' },
    accountId
  );
  // };

  // await trackAction('extension-activated');

  if (
    vscode.workspace
      .getConfiguration(EXTENSION_CONFIG_NAME)
      .get(EXTENSION_CONFIG_KEYS.HUBL_LINTING)
  ) {
    // enableLinting();
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(
      async (e: vscode.ConfigurationChangeEvent) => {
        if (
          e.affectsConfiguration(
            `${EXTENSION_CONFIG_NAME}.${EXTENSION_CONFIG_KEYS.HUBL_LINTING}`
          )
        ) {
          if (
            vscode.workspace
              .getConfiguration(EXTENSION_CONFIG_NAME)
              .get(EXTENSION_CONFIG_KEYS.HUBL_LINTING)
          ) {
            // enableLinting();
            // await trackAction('linting-enabled');
          } else {
            // disableLinting();
            // await trackAction('linting-disabled');
          }
        }
      }
    )
  );
}

module.exports = {
  activate,
};
