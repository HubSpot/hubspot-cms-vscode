import { commands, languages, window, ExtensionContext, workspace } from 'vscode';
import { FileCompletionProvider } from './providers/fileCompletion';
import { COMMANDS, TREE_DATA } from './constants';

import { AccountsProvider } from './providers/treedata/accounts';
import { HelpAndFeedbackProvider } from './providers/treedata/helpAndFeedback';
import { RemoteFileProvider } from './providers/remoteFileProvider';
import { RemoteFsProvider } from './providers/remoteFs';

const initializeTreeDataProviders = (context: ExtensionContext) => {
  const accountProvider = new AccountsProvider();
  const fileCompletionProvider = new FileCompletionProvider();
  const helpAndFeedbackProvider = new HelpAndFeedbackProvider();
  const remoteFsProvider = new RemoteFsProvider();
  const remoteFileProvider = RemoteFileProvider;
  const scheme = 'hubl';

  context.subscriptions.push(
    commands.registerCommand(COMMANDS.ACCOUNTS_REFRESH, () => {
      console.log(COMMANDS.ACCOUNTS_REFRESH);
      accountProvider.refresh();
    })
  );
  context.subscriptions.push(
    workspace.registerTextDocumentContentProvider(
      scheme,
      remoteFileProvider
    )
  )

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
  window.registerTreeDataProvider(TREE_DATA.REMOTE, remoteFsProvider)
};

export const initializeProviders = (context: ExtensionContext) => {
  initializeTreeDataProviders(context);
};
