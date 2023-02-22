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

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  getTreeItem(q: FileLink): TreeItem {
    return q.url
      ? new RemoteFsTreeItem(
          q.label,
          q.icon,
          TreeItemCollapsibleState.None,
          Uri.parse(q.url)
        )
      : new RemoteFsTreeItem(
          q.label,
          q.icon,
          TreeItemCollapsibleState.Collapsed
        );
  }

  async getChildren(parent?: FileLink): Promise<FileLink[]> {
    const remoteDirectory: string = parent?.path ? parent.path : '/';
    const directoryContents: RemoteFsDirectory =
      await getDirectoryContentsByPath(getPortalId(), remoteDirectory);
    const fileOrFolderList = directoryContents.children.map((f) => {
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
