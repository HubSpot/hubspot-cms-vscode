import {
  TreeDataProvider,
  TreeItem,
  Uri,
  TreeItemCollapsibleState,
  ThemeIcon,
  EventEmitter,
  Event,
  window,
} from 'vscode';
import { FileLink, RemoteFsDirectory } from '../types';
import * as path from 'path';
import { buildStatusBarItem, invalidateParentDirectoryCache } from '../helpers';
import { trackEvent } from '../tracking';
import { TRACKED_EVENTS } from '../constants';
const {
  getDirectoryContentsByPath,
} = require('@hubspot/cli-lib/api/fileMapper');
const { getPortalId } = require('@hubspot/cli-lib');
const { FOLDER_DOT_EXTENSIONS } = require('@hubspot/cli-lib/lib/constants');
const { watch } = require('@hubspot/cli-lib/lib/watch');

function isPathFolder(path: string) {
  const splitPath = path.split('/');
  const fileOrFolderName = splitPath[splitPath.length - 1];
  const splitName = fileOrFolderName.split('.');

  return !(
    splitName.length > 1 && FOLDER_DOT_EXTENSIONS.indexOf(splitName[1]) === -1
  );
}
export class RemoteFsProvider implements TreeDataProvider<FileLink> {
  private _onDidChangeTreeData: EventEmitter<
    FileLink | undefined | null | void
  > = new EventEmitter<FileLink | undefined | null | void>();
  readonly onDidChangeTreeData: Event<void | FileLink | null | undefined> =
    this._onDidChangeTreeData.event;
  private remoteFsCache: Map<string, RemoteFsDirectory> = new Map();
  private watchedSrc: string = '';
  private watchedDest: string = '';
  private currentWatcher: any = null;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  hardRefresh(): void {
    this.remoteFsCache.clear();
    this.refresh();
  }

  invalidateCache(filePath: string): void {
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
        invalidateParentDirectoryCache(this.watchedDest);
        this.watchedSrc = '';
        this.watchedDest = '';
        this.currentWatcher = null;
      });
    }
  }

  /* If watching /Example/directory -> example/remotefs
   *  then /Example/directory/hello.html returns example/remotefs/hello.html
   */
  equivalentRemotePath(localPath: string) {
    const posixWatchedSrc = this.watchedSrc
      .split(path.sep)
      .join(path.posix.sep);
    const posixLocalPath = localPath.split(path.sep).join(path.posix.sep);
    const posixRelativePath = path.relative(posixWatchedSrc, posixLocalPath);
    return path.join(this.watchedDest, posixRelativePath);
  }

  changeWatch(srcPath: string, destPath: string, filesToUpload: any): void {
    trackEvent(TRACKED_EVENTS.REMOTE_FS.WATCH);
    const setWatch = () => {
      const uploadingStatus = buildStatusBarItem('Uploading...');
      uploadingStatus.show();
      window.showInformationMessage(
        `Beginning initial upload of ${srcPath} to ${destPath}...`
      );
      this.currentWatcher = watch(
        getPortalId(),
        srcPath,
        destPath,
        {
          mode: 'publish',
          remove: true,
          disableInitial: false,
          notify: false,
          commandOptions: {},
          filePaths: filesToUpload,
        },
        (results: any) => {
          uploadingStatus.dispose();
          if (results.length > 0) {
            results.forEach((result: any) => {
              console.log(JSON.stringify(result, null, 2));
              window.showErrorMessage(
                `Upload error: ${result.error.error.message}`
              );
            });
          }
          window.showInformationMessage(
            `Finished initial upload of ${srcPath} to ${destPath}! Now watching for changes.`
          );
          invalidateParentDirectoryCache(destPath);
        }
      );
      this.currentWatcher.on('raw', (event: any, path: any, details: any) => {
        if (event === 'created' || event === 'moved') {
          const pathToInvalidate = this.equivalentRemotePath(path);
          invalidateParentDirectoryCache(pathToInvalidate);
        }
      });
      this.watchedSrc = srcPath;
      this.watchedDest = destPath;
      console.log(
        `Set new watcher from ${this.watchedSrc} => ${this.watchedDest}`
      );
      this.invalidateCache(this.watchedDest);
    };
    if (this.currentWatcher) {
      this.currentWatcher.close().then(() => {
        console.log(`Closed existing watcher on ${this.watchedDest}`);
        setWatch();
      });
    } else {
      setWatch();
    }
  }

  getTreeItem(fileLink: FileLink): TreeItem {
    return new RemoteFsTreeItem(fileLink);
  }

  async getChildren(parent?: FileLink): Promise<FileLink[]> {
    const remoteDirectory: string = parent?.path ? parent.path : '/';
    let directoryContents: any = this.remoteFsCache.get(remoteDirectory);
    if (directoryContents === undefined) {
      directoryContents = await getDirectoryContentsByPath(
        getPortalId(),
        remoteDirectory
      );
      // Default content wasn't originally in this endpoint and so doesn't show up unless manually queried
      if (remoteDirectory === '/') {
        directoryContents.children = [
          '@hubspot',
          ...directoryContents.children,
        ];
      } else if (remoteDirectory === '@hubspot') {
        // Small QoL to move themes to top and modules to bottom of the display like DMUI does
        const noModules = directoryContents.children
          .filter((f: string) => !f.endsWith('.module'))
          .sort();
        const onlyModules = directoryContents.children
          .filter((f: string) => f.endsWith('.module'))
          .sort();
        directoryContents.children = [...noModules, ...onlyModules];
      }
      this.remoteFsCache.set(remoteDirectory, directoryContents);
    }
    const buildFileLinkFromPath = this.curriedFileLinkFromPathBuilder(parent);
    const fileOrFolderList = directoryContents.children.map(
      buildFileLinkFromPath
    );
    return Promise.resolve(fileOrFolderList);
  }

  curriedFileLinkFromPathBuilder(parent?: FileLink) {
    return (fileName: string): FileLink => {
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

export class RemoteFsTreeItem extends TreeItem {
  constructor(public readonly fileLink: FileLink) {
    const getCollapsibleState = (fileLink: FileLink) => {
      return fileLink.isFolder
        ? TreeItemCollapsibleState.Collapsed
        : TreeItemCollapsibleState.None;
    };
    super(fileLink.label, getCollapsibleState(fileLink));
    this.contextValue = this.getContextValue(fileLink);
    if (!fileLink.isFolder) {
      const resourceUri = Uri.parse(`hubl:${fileLink.path}`);
      this.tooltip = `Open link: ${resourceUri.toString()}`;
      this.command = {
        command: 'vscode.open',
        title: '',
        arguments: [resourceUri],
      };
    }
    this.iconPath = new ThemeIcon(this.getIcon(fileLink));
  }

  getContextValue(fileLink: FileLink) {
    if (fileLink.isDefault) {
      return 'defaultRemoteFsTreeItem';
    } else if (fileLink.isSynced) {
      return 'syncedRemoteFsTreeItem';
    } else {
      return 'remoteFsTreeItem';
    }
  }
  getIcon(fileLink: FileLink) {
    if (fileLink.label === '@hubspot') {
      return 'lock';
    } else if (fileLink.isSynced) {
      return 'sync';
    } else if (fileLink.isFolder) {
      return 'symbol-folder';
    } else {
      return 'file-code';
    }
  }
}
