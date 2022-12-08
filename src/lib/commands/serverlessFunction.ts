import * as vscode from 'vscode';
import { convertFolderToServerlessFunction } from '../fileHelpers';
import { COMMANDS } from '../constants';

export const registerCommands = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            COMMANDS.CREATE_SERVERLESS_FUNCTION_FOLDER,
            async (clickContext) => {
                const createFileSubscription = vscode.workspace.onWillCreateFiles(
                    convertFolderToServerlessFunction(clickContext.fsPath, () => {
                        createFileSubscription.dispose();
                    })
                );
                vscode.commands.executeCommand('explorer.newFolder');
            }
        )
    )
}