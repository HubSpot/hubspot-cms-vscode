import * as vscode from 'vscode';
import { FileLink, GetDirectoryContentsByPath } from '../types';
import { getDefaultPortalFromConfig } from '../helpers';

const {
  getDirectoryContentsByPath,
} = require('@hubspot/cli-lib/api/fileMapper');
const { getPortalId } = require('@hubspot/cli-lib');
const { FOLDER_DOT_EXTENSIONS } = require('@hubspot/cli-lib/lib/constants');

function isPathFolder(path: string) {
  const splitPath = path.split('/');
  const fileOrFolderName = splitPath[splitPath.length - 1];
  const splitName = fileOrFolderName.split('.');

  if (
    splitName.length > 1 &&
    FOLDER_DOT_EXTENSIONS.indexOf(splitName[1]) === -1
  ) {
    return false;
  }

  return true;
}
export class RemoteFsProvider implements vscode.TreeDataProvider<FileLink> {
  getTreeItem(q: FileLink): vscode.TreeItem {
    return new QuickLinkTreeItem(q.label, vscode.Uri.parse(q.url), q.icon);
  }

  async getChildren(): Promise<FileLink[]> {
    //@ts-ignore
    const directoryContents: GetDirectoryContentsByPath =
      await getDirectoryContentsByPath(getPortalId(), '/');
    //@ts-ignore
    const fileOrFolderList = directoryContents.children.map((f) => {
      return {
        label: f,
        url: `hubl:${f}`,
        icon: isPathFolder(f) ? 'symbol-folder' : 'file-code',
      };
    });
    return Promise.resolve(fileOrFolderList);
  }
}

export class QuickLinkTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly resourceUri: vscode.Uri,
    public readonly icon: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `Open link: ${resourceUri.toString()}`;
    this.iconPath = new vscode.ThemeIcon(icon);
    this.contextValue = 'link';
    this.command = {
      command: 'vscode.open',
      title: '',
      arguments: [resourceUri],
    };
  }
}