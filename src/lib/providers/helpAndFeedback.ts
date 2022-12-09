import * as vscode from 'vscode';
import { Link } from '../types';

export class HelpAndFeedbackProvider implements vscode.TreeDataProvider<any> {
  getTreeItem(q: Link): vscode.TreeItem {
    return new LinkTreeItem(q.label, vscode.Uri.parse(q.url));
  }

  getChildren(): Thenable<any> {
    return Promise.resolve([
      {
        label: 'CLI Documentation',
        url: 'https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli#interacting-with-the-developer-file-system',
      },
    ]);
  }
}

export class LinkTreeItem extends vscode.TreeItem {
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
