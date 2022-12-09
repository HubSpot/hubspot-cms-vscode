import {
  ThemeIcon,
  TreeItem,
  TreeItemCollapsibleState,
  TreeDataProvider,
  Uri,
} from 'vscode';
import { Link } from '../types';

export class HelpAndFeedbackProvider implements TreeDataProvider<any> {
  getTreeItem(q: Link): TreeItem {
    return new LinkTreeItem(q.label, Uri.parse(q.url));
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

export class LinkTreeItem extends TreeItem {
  constructor(public readonly label: string, public readonly resourceUri: Uri) {
    super(label, TreeItemCollapsibleState.None);
    this.tooltip = `Open link: ${resourceUri.toString()}`;
    this.iconPath = new ThemeIcon('link-external');
    this.contextValue = 'link';
    this.command = {
      command: 'vscode.open',
      title: '',
      arguments: [resourceUri],
    };
  }
}
