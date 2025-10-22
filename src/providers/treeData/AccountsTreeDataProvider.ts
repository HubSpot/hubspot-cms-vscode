import {
  Event,
  EventEmitter,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
} from 'vscode';
import {
  getConfig,
  getConfigAccounts,
  getConfigDefaultAccount,
} from '@hubspot/local-dev-lib/config';
import { getAccountIdentifier } from '@hubspot/local-dev-lib/config/getAccountIdentifier';
import { CLIConfig } from '@hubspot/local-dev-lib/types/Config';
import {
  CLIAccount,
  CLIAccount_DEPRECATED,
} from '@hubspot/local-dev-lib/types/Accounts';

import { getDisplayedHubspotPortalInfo } from '../../lib/config';

const isDefaultAccount = (account: CLIAccount, config: CLIConfig | null) => {
  if (!config) {
    return false;
  }
  const accountIdentifier = getAccountIdentifier(account);
  const defaultAccount = getConfigDefaultAccount();
  return (
    accountIdentifier === defaultAccount || account.name === defaultAccount
  );
};

const getAccountIdentifiers = (portal: CLIAccount_DEPRECATED) => {
  let accountIdentifiers = '';

  if (portal.env === 'qa') {
    accountIdentifiers = '[QA]';
  }

  return accountIdentifiers;
};

export class AccountsTreeDataProvider
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
    return new AccountTreeDataItem(
      name,
      p,
      { isDefault: isDefaultAccount(p, this.config) ?? false },
      TreeItemCollapsibleState.None
    );
  }

  getChildren(): Thenable<CLIAccount_DEPRECATED[] | undefined> {
    console.log('AccountsProvider:getChildren');
    this.config = getConfig();
    const accounts = getConfigAccounts();

    if (accounts) {
      return Promise.resolve(accounts);
    }

    return Promise.resolve([]);
  }
}

export class AccountTreeDataItem extends TreeItem {
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
    }ID: ${getAccountIdentifier(portalData)}\n${
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
