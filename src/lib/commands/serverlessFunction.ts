import { ExtensionContext, commands, workspace } from 'vscode';
import {
  convertFileToServerlessFunction,
  convertFolderToServerlessFunction,
} from '../fileHelpers';
import { COMMANDS } from '../constants';

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE_SERVERLESS_FUNCTION_FOLDER,
      (clickContext) => {
        const createFileSubscription = workspace.onWillCreateFiles(
          convertFolderToServerlessFunction(clickContext.fsPath, () => {
            createFileSubscription.dispose();
          })
        );
        commands.executeCommand('explorer.newFolder');
      }
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE_SERVERLESS_FUNCTION,
      (clickContext) => {
        const createFileSubscription = workspace.onWillCreateFiles(
          convertFileToServerlessFunction(clickContext.fsPath, () => {
            createFileSubscription.dispose();
          })
        );
        commands.executeCommand('explorer.newFile');
      }
    )
  );
};
