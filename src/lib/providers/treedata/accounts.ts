import {
  Event,
  EventEmitter,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
} from 'vscode';
import { getDisplayedHubspotPortalInfo } from '../../helpers';
import { HubspotConfig, Portal } from '../../types';

const { getConfig } = require('@hubspot/cli-lib');

const isDefaultPortal = (portal: Portal, config: HubspotConfig) => {
  return (
    config.defaultPortal === portal.portalId ||
    config.defaultPortal === portal.name
  );
};

const getAccountIdentifiers = (portal: Portal) => {
  let accountIdentifiers = '';

  if (portal.env === 'qa') {
    accountIdentifiers = '[QA]';
  }

  return accountIdentifiers;
};

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
    const identifiers = getAccountIdentifiers(p);
    const name = `${getDisplayedHubspotPortalInfo(p)} ${identifiers}`;
    return new AccountTreeItem(
      name,
      p,
      { isDefault: isDefaultPortal(p, this.config) },
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
    public readonly portalData: Portal,
    public readonly options: { isDefault: boolean },
    public readonly collapsibleState: TreeItemCollapsibleState,
    // TODO: Figure out why this is erroring out
    // @ts-ignore: Private method access
    public iconPath: string = new ThemeIcon('account'),
    public readonly contextValue: string = 'accountTreeItem'
  ) {
    super(name, collapsibleState);

    if (options.isDefault) {
      // TODO: Figure out why this is erroring out
      // @ts-ignore: Private method access
      this.iconPath = new ThemeIcon('star-full');
    }
    this.tooltip = `${options.isDefault ? '* Default Account\n' : ''}${
      portalData.name ? `Name: ${portalData.name}\n` : ''
    }ID: ${portalData.portalId}\n${
      portalData.env ? `Environment: ${portalData.env}\n` : ''
    }${
      portalData.sandboxAccountType
        ? `Sandbox Account Type: ${portalData.sandboxAccountType}`
        : ''
    }${
      portalData.parentAccountId
        ? `Parent Account ID: ${portalData.parentAccountId}`
        : ''
    }`;
  }
}
