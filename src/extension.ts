import * as vscode from 'vscode';

import { startServer } from './lib/server';
import {
  handleHubspotConfigPostRequest,
  registerConfigDependentFeatures,
} from './lib/auth';
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

  registerCommands(context);
  initializeStatusBar(context);
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

  startServer({
    onPostRequest: async (req: any) => {
      return handleHubspotConfigPostRequest(req, { rootPath });
    },
  });
};
