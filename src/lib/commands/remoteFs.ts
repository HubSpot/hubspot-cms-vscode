import { ExtensionContext, window, commands } from 'vscode';
import { COMMANDS } from '../constants';
const { deleteFile } = require('@hubspot/cli-lib/api/fileMapper');
const { getPortalId } = require('@hubspot/cli-lib');

export const registerCommands = (context: ExtensionContext) => {
    context.subscriptions.push(
        commands.registerCommand(COMMANDS.REMOTE_FS.DELETE, async (clickedFileLink) => {
            console.log(COMMANDS.REMOTE_FS.DELETE);
            const fileLinkIsFolder = clickedFileLink.icon === 'symbol-folder';
            const filePath = fileLinkIsFolder ? clickedFileLink.path : clickedFileLink.url.slice(5)
            const selection = await window.showWarningMessage(
                `Are you sure you want to delete ${filePath}? This action cannot be undone.`,
                ...['Okay', 'Cancel']
            );
            if (!selection || selection === 'Cancel') {
                return;
            }
            const res = await deleteFile(getPortalId(), filePath);
            commands.executeCommand('hubspot.remoteFs.refresh');
        })
    )
}