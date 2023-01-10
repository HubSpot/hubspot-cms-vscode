import {
  Command,
  ThemeIcon,
  TreeItem,
  TreeItemCollapsibleState,
  TreeDataProvider,
  Uri,
} from 'vscode';
import { instanceOfLink, instanceOfCommand, Link } from '../../types';
import { COMMANDS } from '../../constants';

export class HelpAndFeedbackProvider implements TreeDataProvider<any> {
  getTreeItem(q: any): TreeItem {
    if (instanceOfCommand(q)) {
      return new CommandTreeItem(q);
    } else if (instanceOfLink(q)) {
      return new UrlLinkTreeItem(q.label, Uri.parse(q.url));
    } else {
      throw new Error('Invalid tree item passed to HelpAndFeedbackProvider');
    }
  }

  getChildren(): Thenable<Array<Link | Command>> {
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
      {
        title: 'Submit feedback',
        command: COMMANDS.PANELS.OPEN_FEEDBACK_PANEL,
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

export class CommandTreeItem extends TreeItem {
  constructor(public readonly command: Command) {
    super(command.title, TreeItemCollapsibleState.None);
    this.tooltip = `Open ${command.title}`;
    this.iconPath = new ThemeIcon('file');
    this.contextValue = 'command-tree-item';
    this.command = command;
  }
}
