import * as vscode from 'vscode';
import { QuickLink } from '../types';

export class QuickLinksProvider implements vscode.TreeDataProvider<QuickLink> {
  getTreeItem(q: QuickLink): vscode.TreeItem {
    console.log('getting tree item: ', q);
    return new QuickLinkTreeItem(q.label, vscode.Uri.parse(q.url));
  }

  getChildren(): Thenable<QuickLink[]> {
    console.log('getChildren');
    return Promise.resolve([
      {
        label: 'Foo',
        url: 'https://www.google.com',
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
    this.tooltip = `Open link: ${resourceUri.path}`;
    this.iconPath = new vscode.ThemeIcon('link-external');
    this.contextValue = 'link';
    // this.command =
    // vscode.env.openExternal(vscode.Uri.parse('https://example.com'));
  }
}
