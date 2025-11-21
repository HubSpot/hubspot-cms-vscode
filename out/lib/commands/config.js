"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const vscode_1 = require("vscode");
const config_1 = require("@hubspot/local-dev-lib/config");
const getAccountIdentifier_1 = require("@hubspot/local-dev-lib/config/getAccountIdentifier");
const statusBar_1 = require("../statusBar");
const constants_1 = require("../constants");
const helpers_1 = require("../helpers");
const validation_1 = require("../validation");
const tracking_1 = require("../tracking");
const messaging_1 = require("../messaging");
const showRenameAccountPrompt = (accountToRename) => {
    vscode_1.window
        .showInputBox({
        placeHolder: 'Enter a new name for the account',
    })
        .then(async (newName) => {
        if (newName) {
            const oldName = accountToRename.name || (0, getAccountIdentifier_1.getAccountIdentifier)(accountToRename);
            const config = (0, config_1.getConfig)();
            let invalidReason = '';
            if (config) {
                invalidReason = (0, validation_1.portalNameInvalid)(newName, config);
            }
            if (!invalidReason) {
                if (!oldName) {
                    vscode_1.window.showErrorMessage('Could not determine account name to rename');
                    return;
                }
                (0, config_1.renameAccount)(String(oldName), newName);
                vscode_1.commands.executeCommand(constants_1.COMMANDS.ACCOUNTS_REFRESH);
                (0, messaging_1.showAutoDismissedStatusBarMessage)(`Successfully renamed default account from ${oldName} to ${newName}.`);
                await (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.RENAME_ACCOUNT);
            }
            else {
                vscode_1.window.showErrorMessage(invalidReason);
                await (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.RENAME_ACCOUNT_ERROR, {
                    oldName,
                    newName,
                    invalidReason,
                });
                showRenameAccountPrompt(accountToRename);
            }
        }
    });
};
const registerCommands = (context) => {
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.CONFIG.SET_DEFAULT_ACCOUNT, async (defaultAccount, { silenceNotification = false } = {}) => {
        if (!defaultAccount)
            return;
        const newDefaultAccount = typeof defaultAccount === 'string' ||
            typeof defaultAccount === 'number'
            ? defaultAccount
            : defaultAccount.name || (0, getAccountIdentifier_1.getAccountIdentifier)(defaultAccount);
        console.log('Setting default account to: ', newDefaultAccount);
        (0, config_1.updateDefaultAccount)(newDefaultAccount);
        await (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.UPDATE_DEFAULT_ACCOUNT);
        vscode_1.commands.executeCommand(constants_1.COMMANDS.REMOTE_FS.HARD_REFRESH);
        if (!silenceNotification) {
            (0, messaging_1.showAutoDismissedStatusBarMessage)(`Successfully set default account to ${newDefaultAccount}.`);
        }
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.CONFIG.SELECT_DEFAULT_ACCOUNT, async () => {
        const defaultAccount = (0, config_1.getConfigDefaultAccount)();
        const accounts = (0, config_1.getConfigAccounts)() || [];
        if (accounts && accounts.length !== 0) {
            vscode_1.window
                .showQuickPick(accounts.map((a) => {
                return {
                    label: (0, helpers_1.getDisplayedHubspotPortalInfo)(a),
                    description: defaultAccount === (0, getAccountIdentifier_1.getAccountIdentifier)(a) ||
                        defaultAccount === a.name
                        ? '(default)'
                        : '',
                    account: a,
                };
            }), {
                canPickMany: false,
            })
                .then(async (selection) => {
                if (selection) {
                    const newDefaultAccount = selection.account.name ||
                        (0, getAccountIdentifier_1.getAccountIdentifier)(selection.account);
                    if (!newDefaultAccount) {
                        vscode_1.window.showErrorMessage('No account selected; Choose an account to set as default');
                        return;
                    }
                    await (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.SELECT_DEFAULT_ACCOUNT);
                    (0, config_1.updateDefaultAccount)(newDefaultAccount);
                    (0, messaging_1.showAutoDismissedStatusBarMessage)(`Successfully set default account to ${newDefaultAccount}.`);
                    vscode_1.commands.executeCommand(constants_1.COMMANDS.REMOTE_FS.HARD_REFRESH);
                }
            });
        }
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.CONFIG.RENAME_ACCOUNT, async (accountToRename) => {
        showRenameAccountPrompt(accountToRename);
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.CONFIG.DELETE_ACCOUNT, async (accountToDelete) => {
        const accounts = (0, config_1.getConfigAccounts)() || [];
        const accountIdentifier = accountToDelete.name || (0, getAccountIdentifier_1.getAccountIdentifier)(accountToDelete);
        await vscode_1.window
            .showInformationMessage(`Are you sure that you want to delete ${accountIdentifier} from the config?`, 'Yes', 'No')
            .then(async (answer) => {
            if (answer === 'Yes') {
                if (accounts && accounts.length === 1) {
                    (0, config_1.deleteConfigFile)();
                    (0, messaging_1.showAutoDismissedStatusBarMessage)(`Successfully deleted account ${accountIdentifier}. The config file has been deleted because there are no more authenticated accounts.`);
                }
                else {
                    (0, config_1.deleteAccount)(accountIdentifier);
                    (0, messaging_1.showAutoDismissedStatusBarMessage)(`Successfully deleted account ${accountIdentifier}.`);
                }
                await (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.DELETE_ACCOUNT);
                vscode_1.commands.executeCommand(constants_1.COMMANDS.REMOTE_FS.HARD_REFRESH);
                vscode_1.commands.executeCommand(constants_1.COMMANDS.ACCOUNTS_REFRESH);
                (0, statusBar_1.updateStatusBarItems)();
            }
        });
    }));
};
exports.registerCommands = registerCommands;
//# sourceMappingURL=config.js.map