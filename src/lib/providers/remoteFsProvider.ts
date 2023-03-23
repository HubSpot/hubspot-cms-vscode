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
import { dirname } from 'path';
const {
  getDirectoryContentsByPath,
} = require('@hubspot/cli-lib/api/fileMapper');
const { getPortalId } = require('@hubspot/cli-lib');
const { FOLDER_DOT_EXTENSIONS } = require('@hubspot/cli-lib/lib/constants');

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
    const fileOrFolderList = directoryContents.children.map((f: string) => {
      return isPathFolder(f)
        ? {
            label: f,
            path: parent ? `${parent.path}/${f}` : f,
            icon: 'symbol-folder',
          }
        : {
            label: f,
            url: parent ? `hubl:${parent.path}/${f}` : `hubl:${f}`,
            icon: 'file-code',
          };
    });
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
    this.contextValue = 'remoteFsTreeItem';
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
