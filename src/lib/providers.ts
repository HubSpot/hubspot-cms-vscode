import * as vscode from 'vscode';

import { AccountsProvider } from './providers/accounts';
import { QuickLinksProvider } from './providers/quickLinks';
import { RemoteFsProvider } from './providers/remoteFs';
import { COMMANDS, TREE_DATA } from './constants';

export const initializeProviders = (context: vscode.ExtensionContext) => {
  const accountProvider = new AccountsProvider();
  const quickLinksProvider = new QuickLinksProvider();
  const remoteFsProvider = new RemoteFsProvider();

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.ACCOUNTS_REFRESH, () => {
      console.log(COMMANDS.ACCOUNTS_REFRESH);
      accountProvider.refresh();
    })
  );
  vscode.window.registerTreeDataProvider(TREE_DATA.ACCOUNTS, accountProvider);
  vscode.window.registerTreeDataProvider(
    TREE_DATA.QUICK_LINKS,
    quickLinksProvider
  );
  vscode.window.registerTreeDataProvider(TREE_DATA.REMOTE, remoteFsProvider);
};
