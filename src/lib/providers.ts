import {
  commands,
  languages,
  window,
  ExtensionContext,
  workspace,
} from 'vscode';
import { FileCompletionProvider } from './providers/fileCompletion';
import { COMMANDS, TREE_DATA } from './constants';

import { AccountsProvider } from './providers/treedata/accounts';
import { HelpAndFeedbackProvider } from './providers/treedata/helpAndFeedback';
import { RemoteFileProvider } from './providers/remoteFileProvider';
import { RemoteFsProvider } from './providers/remoteFsProvider';

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
    workspace.registerTextDocumentContentProvider(scheme, remoteFileProvider)
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
  window.registerTreeDataProvider(TREE_DATA.REMOTE, remoteFsProvider);
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.REMOTE_FS.REFRESH, () => {
      console.log(COMMANDS.REMOTE_FS.REFRESH);
      remoteFsProvider.refresh();
    })
  );
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.REMOTE_FS.HARD_REFRESH, () => {
      console.log(COMMANDS.REMOTE_FS.HARD_REFRESH);
      remoteFsProvider.hardRefresh();
    })
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.REMOTE_FS.INVALIDATE_CACHE,
      (filePath) => {
        console.log(COMMANDS.REMOTE_FS.INVALIDATE_CACHE);
        remoteFsProvider.invalidateCache(filePath);
      }
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.REMOTE_FS.START_WATCH,
      (srcPath, destPath, filesToUpload) => {
        console.log(COMMANDS.REMOTE_FS.START_WATCH);
        remoteFsProvider.changeWatch(srcPath, destPath, filesToUpload);
      }
    )
  );
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.REMOTE_FS.END_WATCH, () => {
      console.log(COMMANDS.REMOTE_FS.END_WATCH);
      remoteFsProvider.endWatch();
    })
  );
};

export const initializeProviders = (context: ExtensionContext) => {
  initializeTreeDataProviders(context);
};
