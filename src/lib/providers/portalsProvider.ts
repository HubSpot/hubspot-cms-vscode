import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

export class PortalsProvider implements vscode.TreeDataProvider<Portal> {
  public config: any;
  // private _onDidChangeTreeData: vscode.EventEmitter<
  //   Portal | null | undefined
  // > = new vscode.EventEmitter<Portal | null | undefined>();
  // public readonly onDidChangeTreeData: vscode.Event<
  //   Portal | null | undefined
  // > = this._onDidChangeTreeData.event;

  constructor(private configPath: string) {
    this.config = this.getHubspotCofigYaml(configPath);
    // TODO - Figure out why this is giving an error
  }

  // refresh(): void {
  //   this._onDidChangeTreeData.fire();
  // }

  getTreeItem(element: Portal): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Portal): Thenable<Portal[] | undefined> {
    vscode.window.showInformationMessage(this.configPath);
    if (!this.configPath) {
      return Promise.resolve([]);
    }

    if (element) {
      // Should never be called, but just in case
      return Promise.resolve([]);
    } else {
      if (this.pathExists(this.configPath)) {
        console.log('mappedPortals: ', JSON.stringify(this.getMappedPortals()));
        return Promise.resolve(this.getMappedPortals());
      } else {
        return Promise.resolve([]);
      }
    }
  }

  private getHubspotCofigYaml(configPath: string): any {
    if (this.pathExists(configPath)) {
      try {
        return yaml.load(fs.readFileSync(configPath.slice(1), 'utf-8'));
      } catch (e: any) {
        throw new Error(e);
      }
    } else {
      return {};
    }
  }

  private getMappedPortals(): Portal[] {
    return this.config.portals.map((p: any) => {
      return new Portal(
        `${p.name} ${
          this.config.defaultPortal === p.portalId ||
          this.config.defaultPortal === p.name
            ? '(default)'
            : ''
        }`,
        p.portalId,
        vscode.TreeItemCollapsibleState.None
      );
    });
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}

export class Portal extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly id: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    // TODO: Figure out why this is erroring out
    // @ts-ignore: Private method access
    public readonly iconPath: string = new vscode.ThemeIcon('account')
  ) {
    super(name, collapsibleState);
    this.tooltip = `${this.name} - PortalId: ${this.id}`;
  }
}
