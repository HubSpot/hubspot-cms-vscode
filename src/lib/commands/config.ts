import * as vscode from 'vscode';
import { updateStatusBarItems } from '../statusBar';
import { COMMANDS, TRACKED_EVENTS } from '../constants';
import { getDisplayedHubspotPortalInfo } from '../helpers';
import { Portal } from '../types';
import { portalNameInvalid } from '../validation';
import { trackEvent } from '../tracking';

const { getConfig } = require('@hubspot/cli-lib');
const {
  deleteAccount,
  deleteConfigFile,
  renameAccount,
  updateDefaultAccount,
} = require('@hubspot/cli-lib/lib/config');

const showRenameAccountPrompt = (accountToRename: Portal) => {
  vscode.window
    .showInputBox({
      placeHolder: 'Enter a new name for the account',
    })
    .then(async (newName: string | undefined) => {
      if (newName) {
        const oldName = accountToRename.name || accountToRename.portalId;
        const invalidReason = portalNameInvalid(newName, getConfig());

        if (!invalidReason) {
          renameAccount(oldName, newName);
          vscode.window.showInformationMessage(
            `Successfully renamed default account from ${oldName} to ${newName}.`
          );
          await trackEvent(TRACKED_EVENTS.RENAME_ACCOUNT);
        } else {
          vscode.window.showErrorMessage(invalidReason);
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

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CONFIG.SET_DEFAULT_ACCOUNT,
      async (defaultAccount, { silenceNotification = false } = {}) => {
        if (!defaultAccount) return;
        const newDefaultAccount =
          typeof defaultAccount === 'string' ||
          typeof defaultAccount === 'number'
            ? defaultAccount
            : defaultAccount.name || defaultAccount.portalId;
        console.log('Setting default account to: ', newDefaultAccount);
        updateDefaultAccount(newDefaultAccount);
        await trackEvent(TRACKED_EVENTS.UPDATE_DEFAULT_ACCOUNT);
        if (!silenceNotification) {
          vscode.window.showInformationMessage(
            `Successfully set default account to ${newDefaultAccount}.`
          );
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CONFIG.SELECT_DEFAULT_ACCOUNT,
      async () => {
        const config = getConfig();
        if (config && config.portals) {
          vscode.window
            .showQuickPick(
              config.portals.map((p: Portal) => {
                return {
                  label: getDisplayedHubspotPortalInfo(p),
                  description:
                    config.defaultPortal === p.portalId ||
                    config.defaultPortal === p.name
                      ? '(default)'
                      : '',
                  portal: p,
                };
              }),
              {
                canPickMany: false,
              }
            )
            .then(async (selection) => {
              if (selection) {
                const newDefaultAccount =
                  // @ts-ignore selection is an object
                  selection.portal.name || selection.portal.portalId;
                await trackEvent(TRACKED_EVENTS.SELECT_DEFAULT_ACCOUNT);
                updateDefaultAccount(newDefaultAccount);
                vscode.window.showInformationMessage(
                  `Successfully set default account to ${newDefaultAccount}.`
                );
              }
            });
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CONFIG.RENAME_ACCOUNT,
      async (accountToRename) => {
        showRenameAccountPrompt(accountToRename);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CONFIG.DELETE_ACCOUNT,
      async (accountToDelete) => {
        const config = getConfig();
        const accountIdentifier =
          accountToDelete.name || accountToDelete.portalId;

        await vscode.window
          .showInformationMessage(
            `Are you sure that you want to delete ${accountIdentifier} from the config?`,
            'Yes',
            'No'
          )
          .then(async (answer) => {
            if (answer === 'Yes') {
              if (config && config.portals.length === 1) {
                deleteConfigFile();
                vscode.window.showInformationMessage(
                  `Successfully deleted account ${accountIdentifier}. The config file has been deleted because there are no more authenticated accounts.`
                );
              } else {
                deleteAccount(accountIdentifier);
                vscode.window.showInformationMessage(
                  `Successfully deleted account ${accountIdentifier}.`
                );
              }
              await trackEvent(TRACKED_EVENTS.DELETE_ACCOUNT);
              updateStatusBarItems();
            }
          });
      }
    )
  );
};
