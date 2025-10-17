import { commands, window, ExtensionContext } from 'vscode';

import { AccountsTreeDataProvider } from './AccountsTreeDataProvider';
import { DocsTreeDataProvider } from './DocsTreeDataProvider';
import { RemoteFsTreeDataProvider } from './RemoteFsTreeDataProvider';
import { COMMANDS, TREE_DATA } from '../../lib/constants';

export const registerProviders = (context: ExtensionContext) => {
  const accountsTreeDataProvider = new AccountsTreeDataProvider();
  const docsTreeDataProvider = new DocsTreeDataProvider();
  const remoteFsTreeDataProvider = new RemoteFsTreeDataProvider();

  context.subscriptions.push(
    commands.registerCommand(COMMANDS.ACCOUNTS_REFRESH, () => {
      console.log(COMMANDS.ACCOUNTS_REFRESH);
      accountsTreeDataProvider.refresh();
    })
  );

  window.registerTreeDataProvider(TREE_DATA.ACCOUNTS, accountsTreeDataProvider);
  window.registerTreeDataProvider(
    TREE_DATA.HELP_AND_FEEDBACK,
    docsTreeDataProvider
  );
  window.registerTreeDataProvider(TREE_DATA.REMOTE, remoteFsTreeDataProvider);
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.REMOTE_FS.REFRESH, () => {
      console.log(COMMANDS.REMOTE_FS.REFRESH);
      remoteFsTreeDataProvider.refresh();
    })
  );
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.REMOTE_FS.HARD_REFRESH, () => {
      console.log(COMMANDS.REMOTE_FS.HARD_REFRESH);
      remoteFsTreeDataProvider.hardRefresh();
    })
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.REMOTE_FS.INVALIDATE_CACHE,
      (filePath) => {
        console.log(COMMANDS.REMOTE_FS.INVALIDATE_CACHE);
        remoteFsTreeDataProvider.invalidateCache(filePath);
      }
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.REMOTE_FS.START_WATCH,
      (srcPath, destPath, filesToUpload) => {
        console.log(COMMANDS.REMOTE_FS.START_WATCH);
        remoteFsTreeDataProvider.changeWatch(srcPath, destPath, filesToUpload);
      }
    )
  );
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.REMOTE_FS.END_WATCH, () => {
      console.log(COMMANDS.REMOTE_FS.END_WATCH);
      remoteFsTreeDataProvider.endWatch();
    })
  );
};
