import { existsSync } from 'fs';
import { join, dirname } from 'path';
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
        const remoteFilePath = fileLinkIsFolder
          ? clickedFileLink.path
          : clickedFileLink.url.slice(5);
        // We use showOpenDialog instead of showSaveDialog because the latter has worse support for this use-case
        const destPath = await window.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          openLabel: 'Save',
          title: 'Save Remote File',
          defaultUri: Uri.from({
            scheme: 'file',
            path: getRootPath(),
          }),
        });
        if (destPath === undefined) {
          // User didn't select anything
          return;
        }
        const localFilePath = join(
          destPath[0].fsPath,
          remoteFilePath.split('/').slice(-1)[0]
        );
        if (existsSync(localFilePath)) {
          const selection = await window.showWarningMessage(
            `There already exists a file at ${localFilePath}. Overwrite it?`,
            ...['Okay', 'Cancel']
          );
          if (!selection || selection === 'Cancel') {
            return;
          }
        }
        console.log(
          `Saving remote file ${remoteFilePath} to filesystem path ${localFilePath}`
        );
        await downloadFileOrFolder({
          accountId: getPortalId(),
          src: remoteFilePath,
          dest: localFilePath,
          options: {
            overwrite: true,
          },
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
        deleteFile(getPortalId(), filePath).then(() => {
          window.showInformationMessage(`Successfully deleted ${filePath}`);
          let parentDirectory = dirname(filePath);
          if (parentDirectory === '.') {
            parentDirectory = '/';
          }
          commands.executeCommand(
            'hubspot.remoteFs.invalidateCache',
            parentDirectory
          );
          commands.executeCommand('hubspot.remoteFs.refresh');
        });
      }
    )
  );
};
