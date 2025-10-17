import { commands, window, ExtensionContext } from 'vscode';
import {
  getConfig,
  deleteAccount,
  deleteConfigFile,
  renameAccount,
  updateDefaultAccount,
  getConfigDefaultAccount,
  getConfigAccounts,
} from '@hubspot/local-dev-lib/config';
import { CLIConfig } from '@hubspot/local-dev-lib/types/Config';
import {
  CLIAccount,
  CLIAccount_DEPRECATED,
} from '@hubspot/local-dev-lib/types/Accounts';
import { getAccountIdentifier } from '@hubspot/local-dev-lib/config/getAccountIdentifier';

import { updateStatusBarItems } from '../features/statusBar';
import { COMMANDS, TRACKED_EVENTS } from '../lib/constants';
import { getDisplayedHubspotPortalInfo } from '../lib/config';
import { portalNameInvalid } from '../lib/config';
import { trackEvent } from '../lib/tracking';
import { showAutoDismissedStatusBarMessage } from '../lib/statusBar';

const showRenameAccountPrompt = (accountToRename: CLIAccount_DEPRECATED) => {
  window
    .showInputBox({
      placeHolder: 'Enter a new name for the account',
    })
    .then(async (newName: string | undefined) => {
      if (newName) {
        const oldName =
          accountToRename.name || getAccountIdentifier(accountToRename);
        const config: CLIConfig | null = getConfig();
        let invalidReason = '';
        if (config) {
          invalidReason = portalNameInvalid(newName, config);
        }

        if (!invalidReason) {
          if (!oldName) {
            window.showErrorMessage(
              'Could not determine account name to rename'
            );
            return;
          }
          renameAccount(String(oldName), newName);
          commands.executeCommand(COMMANDS.ACCOUNTS_REFRESH);
          showAutoDismissedStatusBarMessage(
            `Successfully renamed default account from ${oldName} to ${newName}.`
          );
          await trackEvent(TRACKED_EVENTS.RENAME_ACCOUNT);
        } else {
          window.showErrorMessage(invalidReason);
          await trackEvent(TRACKED_EVENTS.RENAME_ACCOUNT_ERROR, {
            oldName,
            newName,
            invalidReason,
          });
          showRenameAccountPrompt(accountToRename);
        }
      }
    });
};

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CONFIG.SET_DEFAULT_ACCOUNT,
      async (defaultAccount, { silenceNotification = false } = {}) => {
        if (!defaultAccount) return;
        const newDefaultAccount =
          typeof defaultAccount === 'string' ||
          typeof defaultAccount === 'number'
            ? defaultAccount
            : defaultAccount.name || getAccountIdentifier(defaultAccount);
        console.log('Setting default account to: ', newDefaultAccount);
        updateDefaultAccount(newDefaultAccount);
        await trackEvent(TRACKED_EVENTS.UPDATE_DEFAULT_ACCOUNT);
        commands.executeCommand(COMMANDS.REMOTE_FS.HARD_REFRESH);
        if (!silenceNotification) {
          showAutoDismissedStatusBarMessage(
            `Successfully set default account to ${newDefaultAccount}.`
          );
        }
      }
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CONFIG.SELECT_DEFAULT_ACCOUNT,
      async () => {
        const defaultAccount = getConfigDefaultAccount();
        const accounts: CLIAccount[] = getConfigAccounts() || [];

        if (accounts && accounts.length !== 0) {
          window
            .showQuickPick(
              accounts.map((a: CLIAccount) => {
                return {
                  label: getDisplayedHubspotPortalInfo(a),
                  description:
                    defaultAccount === getAccountIdentifier(a) ||
                    defaultAccount === a.name
                      ? '(default)'
                      : '',
                  account: a,
                };
              }),
              {
                canPickMany: false,
              }
            )
            .then(async (selection) => {
              if (selection) {
                const newDefaultAccount =
                  selection.account.name ||
                  getAccountIdentifier(selection.account);
                if (!newDefaultAccount) {
                  window.showErrorMessage(
                    'No account selected; Choose an account to set as default'
                  );
                  return;
                }
                await trackEvent(TRACKED_EVENTS.SELECT_DEFAULT_ACCOUNT);
                updateDefaultAccount(newDefaultAccount);
                showAutoDismissedStatusBarMessage(
                  `Successfully set default account to ${newDefaultAccount}.`
                );
                commands.executeCommand(COMMANDS.REMOTE_FS.HARD_REFRESH);
              }
            });
        }
      }
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CONFIG.RENAME_ACCOUNT,
      async (accountToRename) => {
        showRenameAccountPrompt(accountToRename);
      }
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CONFIG.DELETE_ACCOUNT,
      async (accountToDelete) => {
        const accounts: CLIAccount[] = getConfigAccounts() || [];
        const accountIdentifier =
          accountToDelete.name || getAccountIdentifier(accountToDelete);

        await window
          .showInformationMessage(
            `Are you sure that you want to delete ${accountIdentifier} from the config?`,
            'Yes',
            'No'
          )
          .then(async (answer) => {
            if (answer === 'Yes') {
              if (accounts && accounts.length === 1) {
                deleteConfigFile();
                showAutoDismissedStatusBarMessage(
                  `Successfully deleted account ${accountIdentifier}. The config file has been deleted because there are no more authenticated accounts.`
                );
              } else {
                deleteAccount(accountIdentifier);
                showAutoDismissedStatusBarMessage(
                  `Successfully deleted account ${accountIdentifier}.`
                );
              }
              await trackEvent(TRACKED_EVENTS.DELETE_ACCOUNT);
              commands.executeCommand(COMMANDS.REMOTE_FS.HARD_REFRESH);
              commands.executeCommand(COMMANDS.ACCOUNTS_REFRESH);
              updateStatusBarItems();
            }
          });
      }
    )
  );
};
