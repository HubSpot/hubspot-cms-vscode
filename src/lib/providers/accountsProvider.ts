import {
  Event,
  EventEmitter,
  ThemeIcon,
  TreeItem,
  TreeDataProvider,
  TreeItemCollapsibleState,
} from 'vscode';
import { getDisplayedHubspotPortalInfo } from '../helpers';
import { HubspotConfig, Portal } from '../types';

const { getConfig } = require('@hubspot/cli-lib');

export class AccountsProvider implements TreeDataProvider<Portal> {
  private config: HubspotConfig;
  constructor() {
    this.config = getConfig();
  }

  _onDidChangeTreeData: EventEmitter<undefined> = new EventEmitter<undefined>();
  onDidChangeTreeData: Event<undefined> = this._onDidChangeTreeData.event;

  refresh(): void {
    console.log('AccountsProvider:refresh');
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(p: Portal): TreeItem {
    return new AccountTreeItem(
      `${getDisplayedHubspotPortalInfo(p)} ${
        this.config.defaultPortal === p.portalId ||
        this.config.defaultPortal === p.name
          ? '(default)'
          : ''
      }`,
      p.portalId,
      p,
      TreeItemCollapsibleState.None
    );
  }

  getChildren(): Thenable<Portal[] | undefined> {
    console.log('AccountsProvider:getChildren');
    this.config = getConfig();

    if (this.config && this.config.portals) {
      return Promise.resolve(this.config.portals);
    }

    return Promise.resolve([]);
  }
}

export class AccountTreeItem extends TreeItem {
  constructor(
    public readonly name: string,
    public readonly id: string,
    public readonly portalData: Portal,
    public readonly collapsibleState: TreeItemCollapsibleState,
    // TODO: Figure out why this is erroring out
    // @ts-ignore: Private method access
    public readonly iconPath: string = new ThemeIcon('account'),
    public readonly contextValue: string = 'accountTreeItem'
  ) {
    super(name, collapsibleState);
    this.tooltip = `Active Account: ${getDisplayedHubspotPortalInfo(
      portalData
    )}`;
  }
}
