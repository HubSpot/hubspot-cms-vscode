import * as vscode from 'vscode';

import { AccountsProvider } from './providers/accounts';
import { QuickLinksProvider } from './providers/quickLinks';
import { COMMANDS, TREE_DATA } from './constants';

export const initializeProviders = (context: vscode.ExtensionContext) => {
  const accountProvider = new AccountsProvider();
  const quickLinksProvider = new QuickLinksProvider();

  console.log('quickLinksProvider: ', quickLinksProvider);

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
};
