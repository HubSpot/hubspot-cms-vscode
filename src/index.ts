import * as vscode from 'vscode';
//@ts-ignore
import { trackAction } from './lib/usageTracking';
import {
  validateConfig,
  //@ts-ignore
} from './core/config';
import {
  findAndLoadConfigFile,
  getDefaultAccountConfig,
  //@ts-ignore
} from './lib/config';

const {
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
} = require('./lib/constants');
import { enableLinting } from './lib/lint';

async function activate(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length < 1) {
    return;
  }

  await findAndLoadConfigFile();

  if (!validateConfig()) {
    return;
  }

  const { portalId: accountId } = getDefaultAccountConfig();

  await trackAction('extension-activated');

  if (
    vscode.workspace
      .getConfiguration(EXTENSION_CONFIG_NAME)
      .get(EXTENSION_CONFIG_KEYS.HUBL_LINTING)
  ) {
    enableLinting();
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
