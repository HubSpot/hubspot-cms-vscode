import * as vscode from 'vscode';

import { registerConfigDependentFeatures } from './lib/auth';
import { registerURIHandler } from './lib/uri';
import { registerCommands } from './lib/commands';
import { initializeStatusBar, updateStatusBarItems } from './lib/statusBar';
import { getRootPath } from './lib/helpers';
import {
  getUpdateLintingOnConfigChange,
  setLintingEnabledState,
} from './lib/lint';
import { COMMANDS } from './lib/constants';
import { initializeProviders } from './lib/providers';

export const activate = async (context: vscode.ExtensionContext) => {
  console.log('Activating Extension...');
  const rootPath = getRootPath();

  registerCommands(context);
  initializeProviders(context);
  initializeStatusBar(context);
  registerURIHandler(context, rootPath);
  registerConfigDependentFeatures({
    rootPath,
    onConfigFound: () => {
      console.log('loadConfigDependentFeatures');
      setLintingEnabledState();
      context.subscriptions.push(getUpdateLintingOnConfigChange());
      updateStatusBarItems();
    },
    onConfigUpdated: () => {
      vscode.commands.executeCommand(COMMANDS.ACCOUNTS_REFRESH);
      updateStatusBarItems();
    },
  });
};
