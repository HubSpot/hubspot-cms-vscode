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
import { AccountsProvider } from './lib/providers/accountsProvider';
import { COMMANDS, TREE_DATA } from './lib/constants';

export const activate = async (context: vscode.ExtensionContext) => {
  console.log('Activating Extension...');
  const rootPath = getRootPath();

  vscode.commands.executeCommand(COMMANDS.CHECK_NPM_INSTALL);
  vscode.commands.executeCommand(COMMANDS.CHECK_HUBSPOT_CLI_INSTALL);
  registerCommands(context);
  initializeStatusBar(context);
  registerURIHandler(context, rootPath);
  registerConfigDependentFeatures({
    rootPath,
    onConfigFound: () => {
      console.log('loadConfigDependentFeatures');
      setLintingEnabledState();
      context.subscriptions.push(getUpdateLintingOnConfigChange());
      const accountProvider = new AccountsProvider();
      context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.ACCOUNTS_REFRESH, () => {
          console.log(COMMANDS.ACCOUNTS_REFRESH);
          accountProvider.refresh();
        })
      );
      vscode.window.registerTreeDataProvider(
        TREE_DATA.ACCOUNTS,
        accountProvider
      );
      updateStatusBarItems();
    },
    onConfigUpdated: () => {
      vscode.commands.executeCommand(COMMANDS.ACCOUNTS_REFRESH);
      updateStatusBarItems();
    },
  });
};
