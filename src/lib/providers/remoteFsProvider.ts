import {
  TreeDataProvider,
  TreeItem,
  Uri,
  TreeItemCollapsibleState,
  ThemeIcon,
  EventEmitter,
  Event,
} from 'vscode';
import { FileLink, RemoteFsDirectory } from '../types';
import { dirname, normalize, relative, join } from 'path';
import { invalidateParentDirectoryCache } from '../helpers';
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
      let parentDirectory = dirname(filePath);
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
      });
      this.invalidateCache(this.watchedDest);
      this.watchedSrc = '';
      this.watchedDest = '';
      this.currentWatcher = null;
    }
  }

  equivalentRemotePath(localPath: string) {
    const normalizedSrc = normalize(this.watchedSrc).replace(/\/$/, '');
    const normalizedChanged = normalize(localPath).replace(/\/$/, '');
    const relativePath = relative(normalizedSrc, normalizedChanged);
    return join(this.watchedDest, relativePath);
  }

  changeWatch(srcPath: string, destPath: string, filesToUpload: any): void {
    const setWatch = () => {
      this.currentWatcher = watch(getPortalId(), srcPath, destPath, {
        mode: 'publish',
        remove: true,
        disableInitial: false,
        notify: false,
        commandOptions: {},
        filePaths: filesToUpload,
      });
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
    return fileLink.url
      ? new RemoteFsTreeItem(
          fileLink.label,
          fileLink.icon,
          TreeItemCollapsibleState.None,
          Uri.parse(fileLink.url)
        )
      : new RemoteFsTreeItem(
          fileLink.label,
          fileLink.icon,
          TreeItemCollapsibleState.Collapsed
        );
  }

  async getChildren(parent?: FileLink): Promise<FileLink[]> {
    const remoteDirectory: string = parent?.path ? parent.path : '/';

    let directoryContents: any = this.remoteFsCache.get(remoteDirectory);
    if (directoryContents === undefined) {
      directoryContents = await getDirectoryContentsByPath(
        getPortalId(),
        remoteDirectory
      );
      this.remoteFsCache.set(remoteDirectory, directoryContents);
    }
    const fileOrFolderList = directoryContents.children.map(
      (filePath: string) => {
        if (isPathFolder(filePath)) {
          const path = parent ? `${parent.path}/${filePath}` : filePath;
          return {
            label: filePath,
            path: path,
            icon: path === this.watchedDest ? 'sync' : 'symbol-folder',
          };
        } else {
          return {
            label: filePath,
            url: parent
              ? `hubl:${parent.path}/${filePath}`
              : `hubl:${filePath}`,
            icon: 'file-code',
          };
        }
      }
    );
    return Promise.resolve(fileOrFolderList);
  }
}

export class RemoteFsTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly icon: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly resourceUri?: Uri
  ) {
    super(label, collapsibleState);
    if (icon === 'sync') {
      this.contextValue = 'syncedRemoteFsTreeItem';
    } else {
      this.contextValue = 'remoteFsTreeItem';
    }
    if (resourceUri) {
      this.tooltip = `Open link: ${resourceUri.toString()}`;
      this.command = {
        command: 'vscode.open',
        title: '',
        arguments: [resourceUri],
      };
    }
    this.iconPath = new ThemeIcon(icon);
  }
}
