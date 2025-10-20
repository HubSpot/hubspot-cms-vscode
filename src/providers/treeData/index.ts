import { commands, window, ExtensionContext } from 'vscode';

import { AccountsTreeDataProvider } from './AccountsTreeDataProvider';
import { DocsTreeDataProvider } from './DocsTreeDataProvider';
import { RemoteFsTreeDataProvider } from './RemoteFsTreeDataProvider';
import { COMMANDS, EVENTS, PROVIDERS } from '../../lib/constants';

export const registerProviders = (context: ExtensionContext) => {
  const accountsTreeDataProvider = new AccountsTreeDataProvider();
  const docsTreeDataProvider = new DocsTreeDataProvider();
  const remoteFsTreeDataProvider = new RemoteFsTreeDataProvider();

  // Register tree data providers
  window.registerTreeDataProvider(
    PROVIDERS.TREE_DATA.ACCOUNTS,
    accountsTreeDataProvider
  );
  window.registerTreeDataProvider(
    PROVIDERS.TREE_DATA.HELP_AND_FEEDBACK,
    docsTreeDataProvider
  );
  window.registerTreeDataProvider(
    PROVIDERS.TREE_DATA.REMOTE,
    remoteFsTreeDataProvider
  );

  // Register commands
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.REMOTE_FS.HARD_REFRESH, () => {
      console.log(COMMANDS.REMOTE_FS.HARD_REFRESH);
      remoteFsTreeDataProvider.hardRefresh();
    })
  );

  context.subscriptions.push(
    commands.registerCommand(COMMANDS.REMOTE_FS.END_WATCH, () => {
      console.log(COMMANDS.REMOTE_FS.END_WATCH);
      remoteFsTreeDataProvider.endWatch();
    })
  );

  // Register events
  context.subscriptions.push(
    commands.registerCommand(EVENTS.ACCOUNT.REFRESH, () => {
      console.log(EVENTS.ACCOUNT.REFRESH);
      accountsTreeDataProvider.refresh();
    })
  );

  context.subscriptions.push(
    commands.registerCommand(EVENTS.REMOTE_FS.REFRESH, () => {
      console.log(EVENTS.REMOTE_FS.REFRESH);
      remoteFsTreeDataProvider.refresh();
    })
  );

  context.subscriptions.push(
    commands.registerCommand(EVENTS.REMOTE_FS.INVALIDATE_CACHE, (filePath) => {
      console.log(EVENTS.REMOTE_FS.INVALIDATE_CACHE);
      remoteFsTreeDataProvider.invalidateCache(filePath);
    })
  );
  context.subscriptions.push(
    commands.registerCommand(
      EVENTS.REMOTE_FS.START_WATCH,
      (srcPath, destPath, filesToUpload) => {
        console.log(EVENTS.REMOTE_FS.START_WATCH);
        remoteFsTreeDataProvider.changeWatch(srcPath, destPath, filesToUpload);
      }
    )
  );
};
