import * as vscode from 'vscode';

import { registerURIHandler } from './lib/uri';
import { registerCommands } from './lib/commands';
import { initializeStatusBar } from './lib/statusBar';
import { getRootPath } from './lib/helpers';
import { initializeProviders } from './lib/providers';
import { initializeConfig } from './lib/auth';

export const activate = async (context: vscode.ExtensionContext) => {
  console.log('Activating Extension...');
  const rootPath = getRootPath();

  vscode.commands.executeCommand(COMMANDS.CHECK_NPM_INSTALL);
  vscode.commands.executeCommand(COMMANDS.CHECK_HUBSPOT_CLI_INSTALL);
  registerCommands(context);
  registerURIHandler(context, rootPath);

  initializeProviders(context);
  initializeStatusBar(context);

  initializeConfig(rootPath);
};
