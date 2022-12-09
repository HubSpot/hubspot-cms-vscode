import { commands, workspace, ExtensionContext } from 'vscode';
import { convertFolderToModule } from '../fileHelpers';

import { COMMANDS } from '../constants';

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.CREATE_MODULE, async (clickContext) => {
      if (clickContext.scheme === 'file') {
        const createFileSubscription = workspace.onWillCreateFiles(
          convertFolderToModule(clickContext.fsPath, () => {
            createFileSubscription.dispose();
          })
        );

        commands.executeCommand('explorer.newFolder');
      }
    })
  );
};
