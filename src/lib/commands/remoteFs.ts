import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { ExtensionContext, window, commands, Uri } from 'vscode';
import { COMMANDS, TRACKED_EVENTS } from '../constants';
import { buildStatusBarItem, getRootPath } from '../helpers';
import { invalidateParentDirectoryCache } from '../helpers';
import { trackEvent } from '../tracking';

const { deleteFile, upload } = require('@hubspot/local-dev-lib/api/fileMapper');
const { downloadFileOrFolder } = require('@hubspot/local-dev-lib/fileMapper');
const { getAccountId } = require('@hubspot/local-dev-lib/config');
const {
  validateSrcAndDestPaths,
} = require('@hubspot/local-dev-lib/cms/modules');
const { shouldIgnoreFile } = require('@hubspot/local-dev-lib/ignoreRules');
const { isAllowedExtension } = require('@hubspot/local-dev-lib/path');
const { createIgnoreFilter } = require('@hubspot/local-dev-lib/ignoreRules');
const {
  uploadFolder,
  hasUploadErrors,
} = require('@hubspot/local-dev-lib/cms/uploadFolder');
const { walk } = require('@hubspot/local-dev-lib/fs');

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.REMOTE_FS.FETCH,
      async (clickedFileLink) => {
        const remoteFilePath = clickedFileLink.path;
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
            `There already exists a file at "${localFilePath}". Overwrite it?`,
            ...['Okay', 'Cancel']
          );
          if (!selection || selection === 'Cancel') {
            return;
          }
        }
        console.log(
          `Saving remote file "${remoteFilePath}" to filesystem path "${localFilePath}"`
        );
        window.showInformationMessage(
          `Beginning download of "${remoteFilePath}" to "${localFilePath}"...`
        );
        const downloadingStatus = buildStatusBarItem('Downloading...');
        downloadingStatus.show();
        trackEvent(TRACKED_EVENTS.REMOTE_FS.FETCH);
        await downloadFileOrFolder({
          accountId: getAccountId(),
          src: remoteFilePath,
          dest: localFilePath,
          options: {
            overwrite: true,
          },
        });
        window.showInformationMessage(
          `Finished download of "${remoteFilePath}" to "${localFilePath}"!`
        );
        downloadingStatus.dispose();
      }
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.REMOTE_FS.DELETE,
      async (clickedFileLink) => {
        console.log(COMMANDS.REMOTE_FS.DELETE);
        const filePath = clickedFileLink.path;
        const selection = await window.showWarningMessage(
          `Are you sure you want to delete "${filePath}"? This action cannot be undone.`,
          ...['Okay', 'Cancel']
        );
        if (!selection || selection === 'Cancel') {
          return;
        }
        trackEvent(TRACKED_EVENTS.REMOTE_FS.DELETE);
        const deletingStatus = buildStatusBarItem(`Deleting...`);
        deletingStatus.show();
        deleteFile(getAccountId(), filePath)
          .then(() => {
            window.showInformationMessage(`Successfully deleted "${filePath}"`);
            invalidateParentDirectoryCache(filePath);
            commands.executeCommand(COMMANDS.REMOTE_FS.REFRESH);
          })
          .catch((err: any) => {
            window.showErrorMessage(
              `Error deleting "${filePath}": ${
                JSON.parse(err.message.slice(5)).message
              }`
            );
          })
          .finally(() => {
            deletingStatus.dispose();
          });
      }
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.REMOTE_FS.UPLOAD,
      async (clickedFileLink) => {
        let srcPath: string;
        if (
          clickedFileLink === undefined ||
          !(clickedFileLink instanceof Uri)
        ) {
          // check if Uri, because having a remoteFs tree item selected will show up here too
          const srcUri = await window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Upload',
            title: 'Upload to Remote File System',
            defaultUri: Uri.from({
              scheme: 'file',
              path: getRootPath(),
            }),
          });
          if (srcUri === undefined) {
            // User didn't select anything
            return;
          }
          srcPath = srcUri[0].fsPath; // showOpenDialog returns an array of size one
        } else {
          srcPath = clickedFileLink.fsPath;
        }
        const destPath = await window.showInputBox({
          prompt: 'Remote Destination',
        });
        if (destPath === undefined || destPath.length === 0) {
          return;
        }
        const srcDestIssues = await validateSrcAndDestPaths(
          { isLocal: true, path: srcPath },
          { isHubSpot: true, path: destPath }
        );
        if (srcDestIssues.length) {
          srcDestIssues.forEach((issue: any) => {
            window.showErrorMessage(`Error: ${issue.message}`);
          });
          return;
        }
        const stats = statSync(srcPath);
        if (stats.isFile()) {
          handleFileUpload(srcPath, destPath);
        } else {
          handleFolderUpload(srcPath, destPath);
        }
      }
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.REMOTE_FS.WATCH,
      async (clickedFileLink) => {
        let srcPath: string;
        if (
          clickedFileLink === undefined ||
          !(clickedFileLink instanceof Uri)
        ) {
          // check if Uri, because having a remoteFs tree item selected will show up here too
          const srcUri = await window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Watch',
            title: 'Watch',
            defaultUri: Uri.from({
              scheme: 'file',
              path: getRootPath(),
            }),
          });
          if (srcUri === undefined) {
            // User didn't select anything
            return;
          }
          srcPath = srcUri[0].fsPath; // showOpenDialog returns an array of size one
        } else {
          srcPath = clickedFileLink.fsPath;
        }
        const destPath = await window.showInputBox({
          prompt: 'Remote Destination',
        });
        if (destPath === undefined || destPath.length === 0) {
          return;
        }
        const filesToUpload = await getUploadableFileList(srcPath);
        commands.executeCommand(
          COMMANDS.REMOTE_FS.START_WATCH,
          srcPath,
          destPath,
          filesToUpload
        );
        invalidateParentDirectoryCache(destPath);
      }
    )
  );
};

const getUploadableFileList = async (src: any) => {
  const filePaths = await walk(src);
  const allowedFiles = filePaths
    .filter((file: any) => isAllowedExtension(file))
    .filter(createIgnoreFilter());
  return allowedFiles;
};

const handleFileUpload = async (srcPath: string, destPath: string) => {
  if (!isAllowedExtension(srcPath)) {
    window.showErrorMessage(
      `The file "${srcPath}" does not have a valid extension`
    );
    return;
  }
  if (shouldIgnoreFile(srcPath)) {
    window.showErrorMessage(
      `The file "${srcPath}" is being ignored via an .hsignore rule`
    );
    return;
  }
  trackEvent(TRACKED_EVENTS.REMOTE_FS.UPLOAD_FILE);
  upload(getAccountId(), srcPath, destPath)
    .then(() => {
      window.showInformationMessage(
        `Uploading files to "${destPath}" was successful`
      );
      invalidateParentDirectoryCache(destPath);
    })
    .catch((error: any) => {
      window.showErrorMessage(
        `Uploading file "${srcPath}" to "${destPath}" failed: ${error}`
      );
    });
};

const handleFolderUpload = async (srcPath: string, destPath: string) => {
  const filePaths = await getUploadableFileList(srcPath);
  const uploadingStatus = buildStatusBarItem('Uploading...');
  uploadingStatus.show();
  window.showInformationMessage(
    `Beginning upload of "${srcPath}" to "${destPath}"...`
  );
  trackEvent(TRACKED_EVENTS.REMOTE_FS.UPLOAD_FOLDER);
  uploadFolder(
    getAccountId(),
    srcPath,
    destPath,
    {
      mode: 'publish',
    },
    {},
    filePaths
  )
    .then(async (results: any) => {
      if (!hasUploadErrors(results)) {
        window.showInformationMessage(
          `Uploading files to "${destPath}" was successful`
        );
        invalidateParentDirectoryCache(destPath);
      } else {
        window.showErrorMessage(
          `One or more files failed to upload to "${destPath}" in the Design Manager`
        );
        console.log(
          `Upload results contains errors: ${JSON.stringify(results, null, 2)}`
        );
      }
    })
    .catch(async (error: any) => {
      window.showErrorMessage(
        `Uploading file "${srcPath}" to "${destPath}" failed: ${error}`
      );
    })
    .finally(() => {
      uploadingStatus.dispose();
      commands.executeCommand(COMMANDS.REMOTE_FS.REFRESH);
    });
};
