"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteFsTreeItem = exports.RemoteFsProvider = void 0;
const vscode_1 = require("vscode");
const path = require("path");
const helpers_1 = require("../helpers");
const tracking_1 = require("../tracking");
const constants_1 = require("../constants");
const { getDirectoryContentsByPath, } = require('@hubspot/local-dev-lib/api/fileMapper');
const { getAccountId } = require('@hubspot/local-dev-lib/config');
const { FOLDER_DOT_EXTENSIONS, } = require('@hubspot/local-dev-lib/constants/extensions');
const { watch } = require('@hubspot/local-dev-lib/cms/watch');
function isPathFolder(path) {
    const splitPath = path.split('/');
    const fileOrFolderName = splitPath[splitPath.length - 1];
    const splitName = fileOrFolderName.split('.');
    return !(splitName.length > 1 && FOLDER_DOT_EXTENSIONS.indexOf(splitName[1]) === -1);
}
class RemoteFsProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.remoteFsCache = new Map();
        this.watchedSrc = '';
        this.watchedDest = '';
        this.currentWatcher = null;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    hardRefresh() {
        this.remoteFsCache.clear();
        this.refresh();
    }
    invalidateCache(filePath) {
        console.log(`Invalidating cache for ${filePath}`);
        /* If it's not in the cache, invalidate the parent directory
           This helps for uploading when the destination folder doesn't exist yet */
        if (this.remoteFsCache.get(filePath) === undefined && filePath !== '/') {
            let parentDirectory = path.dirname(filePath);
            if (parentDirectory === '.') {
                parentDirectory = '/';
            }
            return this.invalidateCache(parentDirectory);
        }
        // Invalidate the key itself and all child paths
        for (const key of this.remoteFsCache.keys()) {
            if (key.startsWith(filePath)) {
                this.remoteFsCache.delete(key);
            }
        }
        this.refresh();
    }
    endWatch() {
        if (this.currentWatcher) {
            this.currentWatcher.close().then(() => {
                console.log(`Closed existing watcher on ${this.watchedDest}`);
                (0, helpers_1.invalidateParentDirectoryCache)(this.watchedDest);
                this.watchedSrc = '';
                this.watchedDest = '';
                this.currentWatcher = null;
            });
        }
    }
    /* If watching /Example/directory -> example/remotefs
     *  then /Example/directory/hello.html returns example/remotefs/hello.html
     */
    equivalentRemotePath(localPath) {
        const posixWatchedSrc = this.watchedSrc
            .split(path.sep)
            .join(path.posix.sep);
        const posixLocalPath = localPath.split(path.sep).join(path.posix.sep);
        const posixRelativePath = path.relative(posixWatchedSrc, posixLocalPath);
        return path.join(this.watchedDest, posixRelativePath);
    }
    changeWatch(srcPath, destPath, filesToUpload) {
        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.REMOTE_FS.WATCH);
        const setWatch = () => {
            (0, helpers_1.requireAccountId)();
            const uploadingStatus = (0, helpers_1.buildStatusBarItem)('Uploading...');
            uploadingStatus.show();
            vscode_1.window.showInformationMessage(`Beginning initial upload of ${srcPath} to ${destPath}...`);
            let { data: watcher } = watch(getAccountId(), srcPath, destPath, {
                cmsPublishMode: 'publish',
                remove: true,
                disableInitial: false,
                notify: 'none',
                commandOptions: {},
                filePaths: filesToUpload,
            }, 
            // postInitialUploadCallback
            (results) => {
                uploadingStatus.dispose();
                if (results.length > 0) {
                    results.forEach((result) => {
                        console.log(JSON.stringify(result, null, 2));
                        vscode_1.window.showErrorMessage(`Upload error: ${result.error.error.message}`);
                    });
                }
                vscode_1.window.showInformationMessage(`Finished initial upload of ${srcPath} to ${destPath}! Now watching for changes.`);
                (0, helpers_1.invalidateParentDirectoryCache)(destPath);
            }, 
            // onUploadFolderError
            (error) => {
                uploadingStatus.dispose();
                vscode_1.window.showErrorMessage(`Upload folder error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }, 
            // onQueueAddError
            undefined, 
            // onUploadFileError
            (file, dest, accountId) => (error) => {
                uploadingStatus.dispose();
                vscode_1.window.showErrorMessage(`Upload file error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            });
            this.currentWatcher = watcher;
            this.currentWatcher.on('raw', (event, path, details) => {
                if (event === 'created' || event === 'moved') {
                    const pathToInvalidate = this.equivalentRemotePath(path);
                    (0, helpers_1.invalidateParentDirectoryCache)(pathToInvalidate);
                }
            });
            this.watchedSrc = srcPath;
            this.watchedDest = destPath;
            console.log(`Set new watcher from ${this.watchedSrc} => ${this.watchedDest}`);
            this.invalidateCache(this.watchedDest);
        };
        if (this.currentWatcher) {
            this.currentWatcher.close().then(() => {
                console.log(`Closed existing watcher on ${this.watchedDest}`);
                setWatch();
            });
        }
        else {
            setWatch();
        }
    }
    getTreeItem(fileLink) {
        return new RemoteFsTreeItem(fileLink);
    }
    async getChildren(parent) {
        (0, helpers_1.requireAccountId)();
        const remoteDirectory = (parent === null || parent === void 0 ? void 0 : parent.path) ? parent.path : '/';
        let directoryContents = this.remoteFsCache.get(remoteDirectory);
        if (directoryContents === undefined) {
            ({ data: directoryContents } = await getDirectoryContentsByPath(getAccountId(), remoteDirectory));
            // Default content wasn't originally in this endpoint and so doesn't show up unless manually queried
            if (remoteDirectory === '/') {
                directoryContents.children = [
                    '@hubspot',
                    ...directoryContents.children.sort(),
                ];
            }
            else if (remoteDirectory === '@hubspot') {
                // Small QoL to move themes to top and modules to bottom of the display like DMUI does
                const noModules = directoryContents.children
                    .filter((f) => !f.endsWith('.module'))
                    .sort();
                const onlyModules = directoryContents.children
                    .filter((f) => f.endsWith('.module'))
                    .sort();
                directoryContents.children = [...noModules, ...onlyModules];
            }
            else {
                directoryContents.children.sort();
            }
            this.remoteFsCache.set(remoteDirectory, directoryContents);
        }
        const buildFileLinkFromPath = this.curriedFileLinkFromPathBuilder(parent);
        const fileOrFolderList = directoryContents.children.map(buildFileLinkFromPath);
        return Promise.resolve(fileOrFolderList);
    }
    curriedFileLinkFromPathBuilder(parent) {
        return (fileName) => {
            const filePath = parent ? `${parent.path}/${fileName}` : fileName;
            return {
                label: fileName,
                path: filePath,
                isDefault: filePath.startsWith('@hubspot'),
                isFolder: isPathFolder(fileName),
                isSynced: this.watchedDest === filePath,
            };
        };
    }
}
exports.RemoteFsProvider = RemoteFsProvider;
class RemoteFsTreeItem extends vscode_1.TreeItem {
    constructor(fileLink) {
        const getCollapsibleState = (fileLink) => {
            return fileLink.isFolder
                ? vscode_1.TreeItemCollapsibleState.Collapsed
                : vscode_1.TreeItemCollapsibleState.None;
        };
        super(fileLink.label, getCollapsibleState(fileLink));
        this.fileLink = fileLink;
        this.contextValue = this.getContextValue(fileLink);
        if (!fileLink.isFolder) {
            const resourceUri = vscode_1.Uri.parse(`hubl:${fileLink.path}`);
            this.tooltip = `Open link: ${resourceUri.toString()}`;
            this.command = {
                command: 'vscode.open',
                title: '',
                arguments: [resourceUri],
            };
        }
        this.iconPath = new vscode_1.ThemeIcon(this.getIcon(fileLink));
    }
    getContextValue(fileLink) {
        if (fileLink.isDefault) {
            return 'defaultRemoteFsTreeItem';
        }
        else if (fileLink.isSynced) {
            return 'syncedRemoteFsTreeItem';
        }
        else {
            return 'remoteFsTreeItem';
        }
    }
    getIcon(fileLink) {
        if (fileLink.label === '@hubspot') {
            return 'lock';
        }
        else if (fileLink.isSynced) {
            return 'sync';
        }
        else if (fileLink.isFolder) {
            return 'symbol-folder';
        }
        else {
            return 'file-code';
        }
    }
}
exports.RemoteFsTreeItem = RemoteFsTreeItem;
//# sourceMappingURL=remoteFsProvider.js.map