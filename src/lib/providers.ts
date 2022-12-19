import { commands, languages, window, ExtensionContext } from 'vscode';
import { FileCompletionProvider } from './providers/fileCompletionProvider';
import { AccountsProvider } from './providers/accounts';
import { HelpAndFeedbackProvider } from './providers/helpAndFeedback';
import { COMMANDS, TREE_DATA } from './constants';

export const initializeProviders = (context: ExtensionContext) => {
  const accountProvider = new AccountsProvider();
  const fileCompletionProvider = new FileCompletionProvider();
  const helpAndFeedbackProvider = new HelpAndFeedbackProvider();

  context.subscriptions.push(
    commands.registerCommand(COMMANDS.ACCOUNTS_REFRESH, () => {
      console.log(COMMANDS.ACCOUNTS_REFRESH);
      accountProvider.refresh();
    })
  );

  languages.registerCompletionItemProvider(
    'html-hubl',
    fileCompletionProvider,
    "'",
    '"'
  );
  window.registerTreeDataProvider(TREE_DATA.ACCOUNTS, accountProvider);
  window.registerTreeDataProvider(
    TREE_DATA.HELP_AND_FEEDBACK,
    helpAndFeedbackProvider
  );
};
