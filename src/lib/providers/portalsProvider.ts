import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

export class PortalsProvider implements vscode.TreeDataProvider<Portal> {
  public config: any;
  constructor(private configPath: string) {
    this.config = this.getHubspotCofigYaml(configPath);
  }

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

class Portal extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly id: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(name, collapsibleState);
    this.tooltip = `${this.name} - PortalId: ${this.id}`;
  }
}
