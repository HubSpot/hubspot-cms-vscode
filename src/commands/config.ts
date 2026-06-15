import { commands, window, ExtensionContext } from 'vscode';
import {
  getConfig,
  getAllConfigAccounts,
  getConfigDefaultAccountIfExists,
  removeAccountFromConfig,
  renameConfigAccount,
  setConfigAccountAsDefault,
} from '@hubspot/local-dev-lib/config';
import { HubSpotConfigAccount } from '@hubspot/local-dev-lib/types/Accounts';

import { updateStatusBarItems } from '../features/statusBar';
import { COMMANDS, EVENTS, TRACKED_EVENTS } from '../lib/constants';
import { getDisplayedHubSpotPortalInfo } from '../lib/config';
import { portalNameInvalid } from '../lib/config';
import { trackEvent } from '../lib/tracking';
import { showAutoDismissedStatusBarMessage } from '../lib/statusBar';

const showRenameAccountPrompt = (accountToRename: HubSpotConfigAccount) => {
  window
    .showInputBox({
      placeHolder: 'Enter a new name for the account',
    })
    .then(async (newName: string | undefined) => {
      if (newName) {
        const oldName = accountToRename.name;
        const config = getConfig();
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
          renameConfigAccount(String(oldName), newName);
          commands.executeCommand(EVENTS.ACCOUNT.REFRESH);
          showAutoDismissedStatusBarMessage(
            `Successfully renamed default account from ${oldName} to ${newName}.`
          );
          trackEvent(TRACKED_EVENTS.RENAME_ACCOUNT);
        } else {
          window.showErrorMessage(invalidReason);
          trackEvent(TRACKED_EVENTS.RENAME_ACCOUNT_ERROR, {
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
            : defaultAccount.name;
        console.log('Setting default account to: ', newDefaultAccount);
        setConfigAccountAsDefault(newDefaultAccount);
        trackEvent(TRACKED_EVENTS.UPDATE_DEFAULT_ACCOUNT);
        commands.executeCommand(COMMANDS.REMOTE_FS.HARD_REFRESH);
        if (!silenceNotification) {
          showAutoDismissedStatusBarMessage(
            `Successfully set default account to ${newDefaultAccount}.`
          );
        }
        updateStatusBarItems();
      }
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CONFIG.SELECT_DEFAULT_ACCOUNT,
      async () => {
        const defaultAccount = getConfigDefaultAccountIfExists();
        const accounts: HubSpotConfigAccount[] = getAllConfigAccounts() || [];

        if (accounts && accounts.length !== 0) {
          window
            .showQuickPick(
              accounts.map((a: HubSpotConfigAccount) => {
                return {
                  label: getDisplayedHubSpotPortalInfo(a),
                  description:
                    defaultAccount?.accountId === a.accountId ||
                    defaultAccount?.name === a.name
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
                const newDefaultAccount = selection.account.name;
                if (!newDefaultAccount) {
                  window.showErrorMessage(
                    'No account selected; Choose an account to set as default'
                  );
                  return;
                }
                trackEvent(TRACKED_EVENTS.SELECT_DEFAULT_ACCOUNT);
                setConfigAccountAsDefault(newDefaultAccount);
                showAutoDismissedStatusBarMessage(
                  `Successfully set default account to ${newDefaultAccount}.`
                );
                commands.executeCommand(COMMANDS.REMOTE_FS.HARD_REFRESH);
                updateStatusBarItems();
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
        const accountIdentifier = accountToDelete.name;

        await window
          .showInformationMessage(
            `Are you sure that you want to delete ${accountIdentifier} from the config?`,
            'Yes',
            'No'
          )
          .then(async (answer) => {
            if (answer === 'Yes') {
              removeAccountFromConfig(accountIdentifier);
              showAutoDismissedStatusBarMessage(
                `Successfully deleted account ${accountIdentifier}.`
              );
              trackEvent(TRACKED_EVENTS.DELETE_ACCOUNT);
              commands.executeCommand(COMMANDS.REMOTE_FS.HARD_REFRESH);
              commands.executeCommand(EVENTS.ACCOUNT.REFRESH);
              updateStatusBarItems();
            }
          });
      }
    )
  );
};
