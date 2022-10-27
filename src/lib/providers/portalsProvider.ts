import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
const hubspotDebugChannel = vscode.window.createOutputChannel(
  'hubspot-cms-vscode'
);
const logOutput = hubspotDebugChannel.appendLine.bind(hubspotDebugChannel);

export class PortalsProvider implements vscode.TreeDataProvider<Portal> {
  constructor(private configPath: string) {}

  getTreeItem(element: Portal): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Portal): Thenable<Portal[]> {
    vscode.window.showInformationMessage(this.configPath);
    // logOutput(this.configPath);
    if (!this.configPath) {
      return Promise.resolve([]);
    }

    if (element) {
      const portals = this.getPortalsInHubspotCofigYaml(this.configPath);
      return Promise.resolve(portals.filter((p) => p.name === element.name));
    } else {
      if (this.pathExists(this.configPath)) {
        return Promise.resolve(
          this.getPortalsInHubspotCofigYaml(this.configPath)
        );
      } else {
        // vscode.window.showInformationMessage('Workspace has no package.json');
        return Promise.resolve([]);
      }
    }
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getPortalsInHubspotCofigYaml(configPath: string): Portal[] {
    logOutput(`PATH: ${configPath} - ${__dirname}`);
    if (this.pathExists(configPath)) {
      const config: any = yaml.load(
        fs.readFileSync(configPath.slice(1), 'utf-8')
      );

      return config.portals;
    } else {
      return [];
    }
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
    public readonly portalId: string,
    public readonly authType: string,
    public readonly auth: {
      tokenInfo: {
        accessToken: string;
        expiresAt: string;
      };
    },
    public readonly personalAccessKey: string,
    public readonly sandboxAccountType: string,
    public readonly parentAccountId: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(name, collapsibleState);
    this.tooltip = `${this.name}-${this.portalId}`;
  }

  // iconPath = {
  //   light: path.join(
  //     __filename,
  //     '..',
  //     '..',
  //     'resources',
  //     'light',
  //     'Portal.svg'
  //   ),
  //   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'Portal.svg'),
  // };
}
