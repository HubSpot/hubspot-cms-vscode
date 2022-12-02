import * as vscode from 'vscode';

import { registerURIHandler } from './lib/uri';
import { registerCommands } from './lib/commands';
import { initializeStatusBar } from './lib/statusBar';
import { getRootPath } from './lib/helpers';
import { initializeProviders } from './lib/providers';
import { initializeConfig } from './lib/auth';
import { hublClient } from './lib/client';

export const activate = async (context: vscode.ExtensionContext) => {
  console.log('Activating Extension...');
  const rootPath = getRootPath();

  registerCommands(context);
  registerURIHandler(context, rootPath);

  initializeProviders(context);
  initializeStatusBar(context);
  hublClient(context);
  initializeConfig(rootPath);
};
