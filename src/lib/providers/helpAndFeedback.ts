import {
  ThemeIcon,
  TreeItem,
  TreeItemCollapsibleState,
  TreeDataProvider,
  Uri,
} from 'vscode';
import { Link } from '../types';

export class HelpAndFeedbackProvider implements TreeDataProvider<Link> {
  getTreeItem(q: Link): TreeItem {
    return new UrlLinkTreeItem(q.label, Uri.parse(q.url));
  }

  getChildren(): Thenable<Link[]> {
    return Promise.resolve([
      {
        label: 'CLI Documentation',
        url: 'https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli#interacting-with-the-developer-file-system',
      },
      {
        label: 'Report issue',
        url: 'https://github.com/HubSpot/hubspot-cms-vscode/issues/new?assignees=&labels=bug&template=bug_report.md&title=',
      },
      {
        label: 'Rate the extension',
        url: 'https://marketplace.visualstudio.com/items?itemName=hubspot.hubl&ssr=false#review-details',
      },
      {
        label: 'About HubSpot VSCode Extension',
        url: 'https://github.com/HubSpot/hubspot-cms-vscode/blob/master/README.md',
      },
    ]);
  }
}

export class UrlLinkTreeItem extends TreeItem {
  constructor(public readonly label: string, public readonly resourceUri: Uri) {
    super(label, TreeItemCollapsibleState.None);
    this.tooltip = `Open link: ${resourceUri.toString()}`;
    this.iconPath = new ThemeIcon('link-external');
    this.contextValue = 'url-link-tree-item';
    this.command = {
      command: 'vscode.open',
      title: '',
      arguments: [resourceUri],
    };
  }
}
