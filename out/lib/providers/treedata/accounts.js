"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountTreeItem = exports.AccountsProvider = void 0;
const vscode_1 = require("vscode");
const config_1 = require("@hubspot/local-dev-lib/config");
const environments_1 = require("@hubspot/local-dev-lib/constants/environments");
const getAccountIdentifier_1 = require("@hubspot/local-dev-lib/config/getAccountIdentifier");
const helpers_1 = require("../../helpers");
const isDefaultAccount = (account, config) => {
    if (!config) {
        return false;
    }
    const accountIdentifier = (0, getAccountIdentifier_1.getAccountIdentifier)(account);
    const defaultAccount = (0, config_1.getConfigDefaultAccount)();
    return (accountIdentifier === defaultAccount || account.name === defaultAccount);
};
const getAccountIdentifiers = (portal) => {
    let accountIdentifiers = '';
    if (portal.env === 'qa') {
        accountIdentifiers = '[QA]';
    }
    return accountIdentifiers;
};
class AccountsProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.config = (0, config_1.getConfig)();
        this.hasAnyQAAccounts = false;
    }
    refresh() {
        console.log('AccountsProvider:refresh');
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(p) {
        var _a;
        const identifiers = getAccountIdentifiers(p);
        const name = `${(0, helpers_1.getDisplayedHubspotPortalInfo)(p)} ${identifiers}`;
        return new AccountTreeItem(name, p, {
            isDefault: (_a = isDefaultAccount(p, this.config)) !== null && _a !== void 0 ? _a : false,
            hasAnyQAAccounts: this.hasAnyQAAccounts,
        }, vscode_1.TreeItemCollapsibleState.None);
    }
    getChildren() {
        console.log('AccountsProvider:getChildren');
        this.config = (0, config_1.getConfig)();
        const accounts = (0, config_1.getConfigAccounts)();
        if (accounts) {
            this.hasAnyQAAccounts = accounts.some((account) => account.env === environments_1.ENVIRONMENTS.QA);
            return Promise.resolve(accounts);
        }
        this.hasAnyQAAccounts = false;
        return Promise.resolve([]);
    }
}
exports.AccountsProvider = AccountsProvider;
class AccountTreeItem extends vscode_1.TreeItem {
    constructor(name, portalData, options, collapsibleState) {
        super(name, collapsibleState);
        this.name = name;
        this.portalData = portalData;
        this.options = options;
        this.collapsibleState = collapsibleState;
        this.contextValue = 'accountTreeItem';
        this.iconPath = new vscode_1.ThemeIcon(options.isDefault ? 'star-full' : 'account');
        this.tooltip = `${options.isDefault ? '* Default Account\n' : ''}${portalData.name ? `Name: ${portalData.name}\n` : ''}ID: ${(0, getAccountIdentifier_1.getAccountIdentifier)(portalData)}\n${options.hasAnyQAAccounts ? `Environment: ${portalData.env}\n` : ''}${portalData.sandboxAccountType
            ? `Sandbox Account Type: ${portalData.sandboxAccountType}`
            : ''}${portalData.parentAccountId
            ? `Parent Account ID: ${portalData.parentAccountId}`
            : ''}`;
    }
}
exports.AccountTreeItem = AccountTreeItem;
//# sourceMappingURL=accounts.js.map