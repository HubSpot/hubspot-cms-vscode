import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { getDisplayedHubspotPortalInfo } from '../helpers';
import { Portal } from '../types';

export class PortalsProvider
  implements vscode.TreeDataProvider<PortalTreeItem> {
  public config: any;
  // private _onDidChangeTreeData: vscode.EventEmitter<
  //   PortalTreeItem | null | undefined
  // > = new vscode.EventEmitter<PortalTreeItem | null | undefined>();
  // public readonly onDidChangeTreeData: vscode.Event<
  //   PortalTreeItem | null | undefined
  // > = this._onDidChangeTreeData.event;

  constructor(private configPath: string) {
    this.config = this.getHubspotCofigYaml(configPath);
    // TODO - Figure out why this is giving an error
  }

  // refresh(): void {
  //   this._onDidChangeTreeData.fire();
  // }

  getTreeItem(element: PortalTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: PortalTreeItem
  ): Thenable<PortalTreeItem[] | undefined> {
    vscode.window.showInformationMessage(this.configPath);
    if (!this.configPath) {
      return Promise.resolve([]);
    }

    if (element) {
      // Should never be called, but just in case
      return Promise.resolve([]);
    } else {
      if (this.pathExists(this.configPath)) {
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

  private getMappedPortals(): PortalTreeItem[] {
    return this.config.portals.map((p: Portal) => {
      return new PortalTreeItem(
        `${getDisplayedHubspotPortalInfo(p)} ${
          this.config.defaultPortal === p.portalId ||
          this.config.defaultPortal === p.name
            ? '(default)'
            : ''
        }`,
        p.portalId,
        p,
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

export class PortalTreeItem extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly id: string,
    public readonly portalData: Portal,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    // TODO: Figure out why this is erroring out
    // @ts-ignore: Private method access
    public readonly iconPath: string = new vscode.ThemeIcon('account')
  ) {
    super(name, collapsibleState);
    this.tooltip = `Active Account: ${getDisplayedHubspotPortalInfo(
      portalData
    )}`;
  }
}
