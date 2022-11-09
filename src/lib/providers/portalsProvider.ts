import * as vscode from 'vscode';
import { getDisplayedHubspotPortalInfo } from '../helpers';
import { HubspotConfig, Portal } from '../types';

const { getConfig } = require('@hubspot/cli-lib');

export class PortalsProvider implements vscode.TreeDataProvider<Portal> {
  private config: HubspotConfig;
  constructor() {
    this.config = getConfig();
  }

  _onDidChangeTreeData: vscode.EventEmitter<undefined> =
    new vscode.EventEmitter<undefined>();
  onDidChangeTreeData: vscode.Event<undefined> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    console.log('Triggering PortalsProvider:refresh');
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(p: Portal): vscode.TreeItem {
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
  }

  getChildren(): Thenable<Portal[] | undefined> {
    console.log('Getting children for PortalsProvider');
    this.config = getConfig();

    if (this.config && this.config.portals) {
      return Promise.resolve(this.config.portals);
    }

    return Promise.resolve([]);
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
    public readonly iconPath: string = new vscode.ThemeIcon('account'),
    public readonly contextValue: string = 'portal'
  ) {
    super(name, collapsibleState);
    this.tooltip = `Active Account: ${getDisplayedHubspotPortalInfo(
      portalData
    )}`;
    // this.command = {
    //   command: 'hubspot.config.changeDefaultAccount',
    //   title: 'Set Default Account',
    //   arguments: [portalData],
    // };
  }
}
