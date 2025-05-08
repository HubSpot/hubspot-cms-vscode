import {
  Event,
  EventEmitter,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
} from 'vscode';
import { getDisplayedHubspotPortalInfo } from '../../helpers';

import { getConfig } from '@hubspot/local-dev-lib/config';
import { CLIConfig } from '@hubspot/local-dev-lib/types/Config';
import { CLIAccount_DEPRECATED } from '@hubspot/local-dev-lib/types/Accounts';

const isDefaultPortal = (
  portal: CLIAccount_DEPRECATED,
  config: CLIConfig | null
) => {
  return (
    config &&
    'defaultPortal' in config &&
    (config.defaultPortal === portal.portalId ||
      config.defaultPortal === portal.name)
  );
};

const getAccountIdentifiers = (portal: CLIAccount_DEPRECATED) => {
  let accountIdentifiers = '';

  if (portal.env === 'qa') {
    accountIdentifiers = '[QA]';
  }

  return accountIdentifiers;
};

export class AccountsProvider
  implements TreeDataProvider<CLIAccount_DEPRECATED>
{
  private config: CLIConfig | null;
  constructor() {
    this.config = getConfig();
  }

  _onDidChangeTreeData: EventEmitter<undefined> = new EventEmitter<undefined>();
  onDidChangeTreeData: Event<undefined> = this._onDidChangeTreeData.event;

  refresh(): void {
    console.log('AccountsProvider:refresh');
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(p: CLIAccount_DEPRECATED): TreeItem {
    const identifiers = getAccountIdentifiers(p);
    const name = `${getDisplayedHubspotPortalInfo(p)} ${identifiers}`;
    return new AccountTreeItem(
      name,
      p,
      { isDefault: isDefaultPortal(p, this.config) ?? false },
      TreeItemCollapsibleState.None
    );
  }

  getChildren(): Thenable<CLIAccount_DEPRECATED[] | undefined> {
    console.log('AccountsProvider:getChildren');
    this.config = getConfig();

    if (this.config && 'portals' in this.config && this.config.portals) {
      return Promise.resolve(this.config.portals);
    }

    return Promise.resolve([]);
  }
}

export class AccountTreeItem extends TreeItem {
  constructor(
    public readonly name: string,
    public readonly portalData: CLIAccount_DEPRECATED,
    public readonly options: { isDefault: boolean },
    public readonly collapsibleState: TreeItemCollapsibleState,
    public iconPath: ThemeIcon = new ThemeIcon('account'),
    public readonly contextValue: string = 'accountTreeItem'
  ) {
    super(name, collapsibleState);

    if (options.isDefault) {
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
