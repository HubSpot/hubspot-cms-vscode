import { existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { ExtensionContext, window, commands, workspace, Uri } from 'vscode';
import { COMMANDS } from '../constants';
import { getRootPath } from '../helpers';
const { deleteFile } = require('@hubspot/cli-lib/api/fileMapper');
const { downloadFileOrFolder } = require('@hubspot/cli-lib/fileMapper');
const { getPortalId } = require('@hubspot/cli-lib');
const { validateSrcAndDestPaths } = require('@hubspot/cli-lib/modules');
const { shouldIgnoreFile } = require('@hubspot/cli-lib/ignoreRules');
const { isAllowedExtension } = require('@hubspot/cli-lib/path');
const { upload } = require('@hubspot/cli-lib/api/fileMapper');
const { createIgnoreFilter } = require('@hubspot/cli-lib/ignoreRules');
const { uploadFolder, hasUploadErrors } = require('@hubspot/cli-lib');
const { walk } = require('@hubspot/cli-lib/lib/walk');

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
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.REMOTE_FS.UPLOAD,
      async (clickedFileLink) => {
        let srcPath;
        if (clickedFileLink === undefined || !(clickedFileLink instanceof Uri)) { // check if Uri, because having a remoteFs tree item selected will show up here too
          srcPath = await window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Upload',
            title: 'Upload to Remote FS',
            defaultUri: Uri.from({
              scheme: 'file',
              path: getRootPath(),
            }),
          });
          if (srcPath === undefined) {
            // User didn't select anything
            return; 
          }
          srcPath = srcPath[0].fsPath; // showOpenDialog returns an array of size one
        } else {
          srcPath = clickedFileLink.fsPath;
        }
        console.log(srcPath);
        const destPath = await window.showInputBox({
          prompt: "Remote Destination"
        })
        if (destPath === undefined) {
          return;
        }
        console.log(destPath);
        const srcDestIssues = await validateSrcAndDestPaths(
          { isLocal: true, path: srcPath },
          { isHubSpot: true, path: destPath }
        );
        if (srcDestIssues.length) {
          console.log(srcDestIssues)
          await window.showErrorMessage('Error validating source and destination path during file upload');
          return;
        }
        const stats = statSync(srcPath);
        if (stats.isFile()) {
          if (!isAllowedExtension(srcPath)) {
            await window.showErrorMessage('Disallowed extension');
            return;
          }
          if (shouldIgnoreFile(srcPath)) {
            await window.showErrorMessage('Ignored file');
            return;
          }
          upload(
            getPortalId(),
            srcPath,
            destPath
          ).then(async () => {
            await window.showInformationMessage('Upload succeded');
          }).catch(async (error: any) => {
            await window.showErrorMessage(`Upload error: ${error}`);
          })
        } else {
          const filePaths = await getUploadableFileList(srcPath);
          uploadFolder(
            getPortalId(),
            srcPath,
            destPath,
            {
              mode: 'publish'
            },
            {},
            filePaths
          ).then(async (results: any) => {
            if (!hasUploadErrors(results)) {
              window.showInformationMessage('Upload succeeded');
            } else {
              window.showErrorMessage('Some files failed');
            }
          }).catch(async (error: any) => {
            window.showErrorMessage('Upload failed');
          }).finally(() => {
            commands.executeCommand('hubspot.remoteFs.refresh');
          })
        }
      }
    )
  )
};

const getUploadableFileList = async (src: any) => {
  const filePaths = await walk(src);
  const allowedFiles = filePaths
    .filter((file: any) => isAllowedExtension(file))
    .filter(createIgnoreFilter());
  return allowedFiles;
}