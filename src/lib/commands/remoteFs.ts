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
          invalidateParentDirectoryCache(filePath);
          commands.executeCommand('hubspot.remoteFs.refresh');
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
            title: 'Upload to Remote FS',
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
};

const getUploadableFileList = async (src: any) => {
  const filePaths = await walk(src);
  const allowedFiles = filePaths
    .filter((file: any) => isAllowedExtension(file))
    .filter(createIgnoreFilter());
  return allowedFiles;
};

const invalidateParentDirectoryCache = (filePath: string) => {
  let parentDirectory = dirname(filePath);
  if (parentDirectory === '.') {
    parentDirectory = '/';
  }
  commands.executeCommand('hubspot.remoteFs.invalidateCache', parentDirectory);
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
  upload(getPortalId(), srcPath, destPath)
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
}

const handleFolderUpload = async (srcPath: string, destPath: string) => {
  const filePaths = await getUploadableFileList(srcPath);
  uploadFolder(
    getPortalId(),
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
          `Upload results contains errors: ${JSON.stringify(
            results,
            null,
            2
          )}`
        );
      }
    })
    .catch(async (error: any) => {
      window.showErrorMessage(
        `Uploading file "${srcPath}" to "${destPath}" failed: ${error}`
      );
    })
    .finally(() => {
      commands.executeCommand('hubspot.remoteFs.refresh');
    });
}