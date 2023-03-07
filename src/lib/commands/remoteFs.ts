import { ExtensionContext, window, commands, workspace, Uri } from 'vscode';
import { COMMANDS } from '../constants';
import { getRootPath } from '../helpers';
const { deleteFile } = require('@hubspot/cli-lib/api/fileMapper');
const { downloadFileOrFolder } = require('@hubspot/cli-lib/fileMapper');
const { getPortalId } = require('@hubspot/cli-lib');

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
        COMMANDS.REMOTE_FS.FETCH,
        async (clickedFileLink) => {
            const fileLinkIsFolder = clickedFileLink.icon === 'symbol-folder';
            const filePath = fileLinkIsFolder
                ? clickedFileLink.path
                : clickedFileLink.url.slice(5);
            // We use showOpenDialog instead of showSaveDialog because the latter has worse support for this use-case
            const destPath = await window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: "Save",
                title: "Save Remote File",
                defaultUri: Uri.from({
                    scheme: 'file',
                    path: getRootPath()
                })
            });
            if (destPath === undefined) {
                return;
            }
            console.log(`Saving remote file ${filePath} to filesystem path ${destPath[0].fsPath}`);
            await downloadFileOrFolder({
                accountId: getPortalId(),
                src: filePath,
                dest: destPath[0].fsPath,
                options: {}
            });
        }
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.REMOTE_FS.DELETE,
      async (clickedFileLink) => {
        console.log(COMMANDS.REMOTE_FS.DELETE);
        const fileLinkIsFolder = clickedFileLink.icon === 'symbol-folder';
        const filePath = fileLinkIsFolder
          ? clickedFileLink.path
          : clickedFileLink.url.slice(5);
        const selection = await window.showWarningMessage(
          `Are you sure you want to delete ${filePath}? This action cannot be undone.`,
          ...['Okay', 'Cancel']
        );
        if (!selection || selection === 'Cancel') {
          return;
        }
        const res = await deleteFile(getPortalId(), filePath);
        commands.executeCommand('hubspot.remoteFs.refresh');
      }
    )
  );
};
