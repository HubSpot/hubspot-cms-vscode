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
  getAllConfigAccounts,
  getConfigDefaultAccountIfExists,
} from '@hubspot/local-dev-lib/config';
import { ENVIRONMENTS } from '@hubspot/local-dev-lib/constants/environments';
import { HubSpotConfig } from '@hubspot/local-dev-lib/types/Config';
import { HubSpotConfigAccount } from '@hubspot/local-dev-lib/types/Accounts';
import { getDisplayedHubspotPortalInfo } from '../../helpers';
import { HUBSPOT_ACCOUNT_TYPES } from '@hubspot/local-dev-lib/constants/config';

const isDefaultAccount = (
  account: HubSpotConfigAccount,
  config: HubSpotConfig | null
) => {
  if (!config) {
    return false;
  }
  const accountIdentifier = account.accountId;
  const defaultAccount = getConfigDefaultAccountIfExists();
  return (
    accountIdentifier === defaultAccount?.accountId ||
    account.name === defaultAccount?.name
  );
};

const getAccountIdentifiers = (portal: HubSpotConfigAccount) => {
  let accountIdentifiers = '';

  if (portal.env === ENVIRONMENTS.QA) {
    accountIdentifiers = '[QA]';
  }

  return accountIdentifiers;
};

export class AccountsProvider
  implements TreeDataProvider<HubSpotConfigAccount>
{
  private config: HubSpotConfig | null;
  private hasAnyQAAccounts: boolean;
  constructor() {
    this.config = getConfig();
    this.hasAnyQAAccounts = false;
  }

  _onDidChangeTreeData: EventEmitter<undefined> = new EventEmitter<undefined>();
  onDidChangeTreeData: Event<undefined> = this._onDidChangeTreeData.event;

  refresh(): void {
    console.log('AccountsProvider:refresh');
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(p: HubSpotConfigAccount): TreeItem {
    const identifiers = getAccountIdentifiers(p);
    const name = `${getDisplayedHubspotPortalInfo(p)} ${identifiers}`;
    return new AccountTreeItem(
      name,
      p,
      {
        isDefault: isDefaultAccount(p, this.config) ?? false,
        hasAnyQAAccounts: this.hasAnyQAAccounts,
      },
      TreeItemCollapsibleState.None
    );
  }

  getChildren(): Thenable<HubSpotConfigAccount[] | undefined> {
    console.log('AccountsProvider:getChildren');
    this.config = getConfig();
    const accounts = getAllConfigAccounts();

    if (accounts) {
      this.hasAnyQAAccounts = accounts.some(
        (account) => account.env === ENVIRONMENTS.QA
      );

      return Promise.resolve(accounts);
    }

    this.hasAnyQAAccounts = false;
    return Promise.resolve([]);
  }
}

export class AccountTreeItem extends TreeItem {
  constructor(
    public readonly name: string,
    public readonly portalData: HubSpotConfigAccount,
    public readonly options: { isDefault: boolean; hasAnyQAAccounts: boolean },
    public readonly collapsibleState: TreeItemCollapsibleState
  ) {
    super(name, collapsibleState);

    this.contextValue = 'accountTreeItem';
    this.iconPath = new ThemeIcon(options.isDefault ? 'star-full' : 'account');
    this.tooltip = `${options.isDefault ? '* Default Account\n' : ''}${
      portalData.name ? `Name: ${portalData.name}\n` : ''
    }ID: ${portalData.accountId}\n${
      options.hasAnyQAAccounts ? `Environment: ${portalData.env}\n` : ''
    }${
      portalData.accountType !== HUBSPOT_ACCOUNT_TYPES.STANDARD
        ? `Account Type: ${portalData.accountType}`
        : ''
    }${
      portalData.parentAccountId
        ? `Parent Account ID: ${portalData.parentAccountId}`
        : ''
    }`;
  }
}
