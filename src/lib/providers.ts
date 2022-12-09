import * as vscode from 'vscode';

import { AccountsProvider } from './providers/accounts';
import { HelpAndFeedbackProvider } from './providers/helpAndFeedback';
import { COMMANDS, TREE_DATA } from './constants';

export const initializeProviders = (context: vscode.ExtensionContext) => {
  const accountProvider = new AccountsProvider();
  const helpAndFeedbackProvider = new HelpAndFeedbackProvider();

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.ACCOUNTS_REFRESH, () => {
      console.log(COMMANDS.ACCOUNTS_REFRESH);
      accountProvider.refresh();
    })
  );
  vscode.window.registerTreeDataProvider(TREE_DATA.ACCOUNTS, accountProvider);
  vscode.window.registerTreeDataProvider(
    TREE_DATA.HELP_AND_FEEDBACK,
    helpAndFeedbackProvider
  );
};
