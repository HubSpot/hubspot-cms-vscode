import { commands, window, ExtensionContext } from 'vscode';

import { COMMANDS, TREE_DATA } from './constants';

import { AccountsProvider } from './providers/treedata/accounts';
import { HelpAndFeedbackProvider } from './providers/treedata/helpAndFeedback';

const initializeTreeDataProviders = (context: ExtensionContext) => {
  const accountProvider = new AccountsProvider();
  const helpAndFeedbackProvider = new HelpAndFeedbackProvider();

  context.subscriptions.push(
    commands.registerCommand(COMMANDS.ACCOUNTS_REFRESH, () => {
      console.log(COMMANDS.ACCOUNTS_REFRESH);
      accountProvider.refresh();
    })
  );
  window.registerTreeDataProvider(TREE_DATA.ACCOUNTS, accountProvider);
  window.registerTreeDataProvider(
    TREE_DATA.HELP_AND_FEEDBACK,
    helpAndFeedbackProvider
  );
};

export const initializeProviders = (context: ExtensionContext) => {
  initializeTreeDataProviders(context);
};
