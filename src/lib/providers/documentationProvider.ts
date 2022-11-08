import * as vscode from 'vscode';

const DOCUMENTATION_TREE = [
  {
    name: 'CLI Commands',
    resourceUri:
      'https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli',
  },
];

export class DocumentationProvider
  implements vscode.TreeDataProvider<DocumentationLink> {
  constructor() {}

  getTreeItem(element: DocumentationLink): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: DocumentationLink
  ): Thenable<DocumentationLink[] | undefined> {
    if (element) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(
        DOCUMENTATION_TREE.map(
          (d) =>
            new DocumentationLink(
              d.name,
              d.resourceUri,
              vscode.TreeItemCollapsibleState.None
            )
        )
      );
    }
  }
}

class DocumentationLink extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly url: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(name, collapsibleState);
    this.tooltip = url;
    this.command = {
      command: 'vscode.open',
      title: 'Open Documentation',
      arguments: [vscode.Uri.parse(url)],
    };
  }
}
