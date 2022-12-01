import * as vscode from 'vscode';
import { convertFolderToModule } from '../fileHelpers';

import { COMMANDS } from '../constants';

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CREATE_MODULE,
      async (clickContext) => {
        if (clickContext.scheme === 'file') {
          const createFileSubscription = vscode.workspace.onWillCreateFiles(
            convertFolderToModule(clickContext.fsPath, () => {
              createFileSubscription.dispose();
            })
          );

          vscode.commands.executeCommand('explorer.newFolder');
        }
      }
    )
  );
};
