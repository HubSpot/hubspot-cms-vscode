import * as vscode from 'vscode';
import { QuickLink } from '../types';

export class QuickLinksProvider implements vscode.TreeDataProvider<QuickLink> {
  getTreeItem(q: QuickLink): vscode.TreeItem {
    return new QuickLinkTreeItem(q.label, vscode.Uri.parse(q.url));
  }

  getChildren(): Thenable<QuickLink[]> {
    return Promise.resolve([
      {
        label: 'Fetch',
        url: 'https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli#fetch',
      },
      {
        label: 'Upload',
        url: 'https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli#upload',
      },
      {
        label: 'Watch',
        url: 'https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli#watch',
      },
      {
        label: 'Remove',
        url: 'https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli#remove',
      },
    ]);
  }
}

export class QuickLinkTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly resourceUri: vscode.Uri
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `Open link: ${resourceUri.toString()}`;
    this.iconPath = new vscode.ThemeIcon('link-external');
    this.contextValue = 'link';
    this.command = {
      command: 'vscode.open',
      title: '',
      arguments: [resourceUri],
    };
  }
}
