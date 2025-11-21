"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
const helpers_1 = require("../helpers");
const tracking_1 = require("../tracking");
const { deleteFile, upload } = require('@hubspot/local-dev-lib/api/fileMapper');
const { downloadFileOrFolder } = require('@hubspot/local-dev-lib/fileMapper');
const { getAccountId } = require('@hubspot/local-dev-lib/config');
const { validateSrcAndDestPaths, } = require('@hubspot/local-dev-lib/cms/modules');
const { shouldIgnoreFile } = require('@hubspot/local-dev-lib/ignoreRules');
const { isAllowedExtension } = require('@hubspot/local-dev-lib/path');
const { createIgnoreFilter } = require('@hubspot/local-dev-lib/ignoreRules');
const { uploadFolder, hasUploadErrors, } = require('@hubspot/local-dev-lib/cms/uploadFolder');
const { walk } = require('@hubspot/local-dev-lib/fs');
const registerCommands = (context) => {
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.REMOTE_FS.FETCH, async (clickedFileLink) => {
        (0, helpers_1.requireAccountId)();
        const remoteFilePath = clickedFileLink.path;
        // We use showOpenDialog instead of showSaveDialog because the latter has worse support for this use-case
        const destPath = await vscode_1.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Save',
            title: 'Save Remote File',
            defaultUri: vscode_1.Uri.from({
                scheme: 'file',
                path: (0, helpers_1.getRootPath)(),
            }),
        });
        if (destPath === undefined) {
            // User didn't select anything
            return;
        }
        const localFilePath = (0, path_1.join)(destPath[0].fsPath, remoteFilePath.split('/').slice(-1)[0]);
        if ((0, fs_1.existsSync)(localFilePath)) {
            const selection = await vscode_1.window.showWarningMessage(`There already exists a file at "${localFilePath}". Overwrite it?`, ...['Okay', 'Cancel']);
            if (!selection || selection === 'Cancel') {
                return;
            }
        }
        console.log(`Saving remote file "${remoteFilePath}" to filesystem path "${localFilePath}"`);
        vscode_1.window.showInformationMessage(`Beginning download of "${remoteFilePath}" to "${localFilePath}"...`);
        const downloadingStatus = (0, helpers_1.buildStatusBarItem)('Downloading...');
        downloadingStatus.show();
        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.REMOTE_FS.FETCH);
        try {
            await downloadFileOrFolder(getAccountId(), remoteFilePath, localFilePath, undefined, {
                overwrite: true,
            });
        }
        catch (error) {
            vscode_1.window.showErrorMessage(`Failed to fetch ${remoteFilePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        vscode_1.window.showInformationMessage(`Finished download of "${remoteFilePath}" to "${localFilePath}"!`);
        downloadingStatus.dispose();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.REMOTE_FS.DELETE, async (clickedFileLink) => {
        (0, helpers_1.requireAccountId)();
        console.log(constants_1.COMMANDS.REMOTE_FS.DELETE);
        const filePath = clickedFileLink.path;
        const selection = await vscode_1.window.showWarningMessage(`Are you sure you want to delete "${filePath}"? This action cannot be undone.`, ...['Okay', 'Cancel']);
        if (!selection || selection === 'Cancel') {
            return;
        }
        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.REMOTE_FS.DELETE);
        const deletingStatus = (0, helpers_1.buildStatusBarItem)(`Deleting...`);
        deletingStatus.show();
        deleteFile(getAccountId(), filePath)
            .then(() => {
            vscode_1.window.showInformationMessage(`Successfully deleted "${filePath}"`);
            (0, helpers_1.invalidateParentDirectoryCache)(filePath);
            vscode_1.commands.executeCommand(constants_1.COMMANDS.REMOTE_FS.REFRESH);
        })
            .catch((err) => {
            vscode_1.window.showErrorMessage(`Error deleting "${filePath}": ${err instanceof Error ? err.message : 'Unknown error'}`);
        })
            .finally(() => {
            deletingStatus.dispose();
        });
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.REMOTE_FS.UPLOAD, async (clickedFileLink) => {
        (0, helpers_1.requireAccountId)();
        let srcPath;
        if (clickedFileLink === undefined ||
            !(clickedFileLink instanceof vscode_1.Uri)) {
            // check if Uri, because having a remoteFs tree item selected will show up here too
            const srcUri = await vscode_1.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Upload',
                title: 'Upload to Remote File System',
                defaultUri: vscode_1.Uri.from({
                    scheme: 'file',
                    path: (0, helpers_1.getRootPath)(),
                }),
            });
            if (srcUri === undefined) {
                // User didn't select anything
                return;
            }
            srcPath = srcUri[0].fsPath; // showOpenDialog returns an array of size one
        }
        else {
            srcPath = clickedFileLink.fsPath;
        }
        const destPath = await vscode_1.window.showInputBox({
            prompt: 'Remote Destination',
        });
        if (destPath === undefined || destPath.length === 0) {
            return;
        }
        const srcDestIssues = await validateSrcAndDestPaths({ isLocal: true, path: srcPath }, { isHubSpot: true, path: destPath });
        if (srcDestIssues.length) {
            srcDestIssues.forEach((issue) => {
                vscode_1.window.showErrorMessage(`Error: ${issue.message}`);
            });
            return;
        }
        const stats = (0, fs_1.statSync)(srcPath);
        if (stats.isFile()) {
            handleFileUpload(srcPath, destPath);
        }
        else {
            handleFolderUpload(srcPath, destPath);
        }
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.REMOTE_FS.WATCH, async (clickedFileLink) => {
        let srcPath;
        if (clickedFileLink === undefined ||
            !(clickedFileLink instanceof vscode_1.Uri)) {
            // check if Uri, because having a remoteFs tree item selected will show up here too
            const srcUri = await vscode_1.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Watch',
                title: 'Watch',
                defaultUri: vscode_1.Uri.from({
                    scheme: 'file',
                    path: (0, helpers_1.getRootPath)(),
                }),
            });
            if (srcUri === undefined) {
                // User didn't select anything
                return;
            }
            srcPath = srcUri[0].fsPath; // showOpenDialog returns an array of size one
        }
        else {
            srcPath = clickedFileLink.fsPath;
        }
        const destPath = await vscode_1.window.showInputBox({
            prompt: 'Remote Destination',
        });
        if (destPath === undefined || destPath.length === 0) {
            return;
        }
        const filesToUpload = await getUploadableFileList(srcPath);
        vscode_1.commands.executeCommand(constants_1.COMMANDS.REMOTE_FS.START_WATCH, srcPath, destPath, filesToUpload);
        (0, helpers_1.invalidateParentDirectoryCache)(destPath);
    }));
};
exports.registerCommands = registerCommands;
const getUploadableFileList = async (src) => {
    const filePaths = await walk(src);
    const allowedFiles = filePaths
        .filter((file) => isAllowedExtension(file))
        .filter(createIgnoreFilter());
    return allowedFiles;
};
const handleFileUpload = async (srcPath, destPath) => {
    if (!isAllowedExtension(srcPath)) {
        vscode_1.window.showErrorMessage(`The file "${srcPath}" does not have a valid extension`);
        return;
    }
    if (shouldIgnoreFile(srcPath)) {
        vscode_1.window.showErrorMessage(`The file "${srcPath}" is being ignored via an .hsignore rule`);
        return;
    }
    (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.REMOTE_FS.UPLOAD_FILE);
    (0, helpers_1.requireAccountId)();
    upload(getAccountId(), srcPath, destPath)
        .then(() => {
        vscode_1.window.showInformationMessage(`Uploading files to "${destPath}" was successful`);
        (0, helpers_1.invalidateParentDirectoryCache)(destPath);
    })
        .catch((error) => {
        vscode_1.window.showErrorMessage(`Uploading file "${srcPath}" to "${destPath}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    });
};
const handleFolderUpload = async (srcPath, destPath) => {
    const filePaths = await getUploadableFileList(srcPath);
    const uploadingStatus = (0, helpers_1.buildStatusBarItem)('Uploading...');
    uploadingStatus.show();
    vscode_1.window.showInformationMessage(`Beginning upload of "${srcPath}" to "${destPath}"...`);
    (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.REMOTE_FS.UPLOAD_FOLDER);
    uploadFolder(getAccountId(), srcPath, destPath, {}, {}, filePaths, 'publish')
        .then(async (results) => {
        if (!hasUploadErrors(results)) {
            vscode_1.window.showInformationMessage(`Uploading files to "${destPath}" was successful`);
            (0, helpers_1.invalidateParentDirectoryCache)(destPath);
        }
        else {
            vscode_1.window.showErrorMessage(`One or more files failed to upload to "${destPath}" in the Design Manager`);
            console.log(`Upload results contains errors: ${JSON.stringify(results, null, 2)}`);
        }
    })
        .catch(async (error) => {
        vscode_1.window.showErrorMessage(`Uploading file "${srcPath}" to "${destPath}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    })
        .finally(() => {
        uploadingStatus.dispose();
        vscode_1.commands.executeCommand(constants_1.COMMANDS.REMOTE_FS.REFRESH);
    });
};
//# sourceMappingURL=remoteFs.js.map