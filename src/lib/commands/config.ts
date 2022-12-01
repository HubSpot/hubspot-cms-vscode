import * as vscode from 'vscode';
import { updateStatusBarItems } from '../statusBar';
import { COMMANDS } from '../constants';
import { getDisplayedHubspotPortalInfo } from '../helpers';
import { Portal } from '../types';
import { portalNameInvalid } from '../validation';

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
    .then((newName) => {
      if (newName) {
        const invalidReason = portalNameInvalid(newName, getConfig());

        if (!invalidReason) {
          const oldName = accountToRename.name || accountToRename.portalId;
          renameAccount(oldName, newName);
          vscode.window.showInformationMessage(
            `Successfully renamed default account from ${oldName} to ${newName}.`
          );
        } else {
          vscode.window.showErrorMessage(invalidReason);
          showRenameAccountPrompt(accountToRename);
        }
      }
    });
};

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CONFIG_SET_DEFAULT_ACCOUNT,
      (defaultAccount, { silenceNotification = false } = {}) => {
        if (!defaultAccount) return;
        const newDefaultAccount =
          typeof defaultAccount === 'string' ||
          typeof defaultAccount === 'number'
            ? defaultAccount
            : defaultAccount.name || defaultAccount.portalId;
        console.log('Setting default account to: ', newDefaultAccount);
        updateDefaultAccount(newDefaultAccount);
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
      COMMANDS.CONFIG_SELECT_DEFAULT_ACCOUNT,
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
            .then((selection) => {
              if (selection) {
                const newDefaultAccount =
                  // @ts-ignore selection is an object
                  selection.portal.name || selection.portal.portalId;
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
      COMMANDS.CONFIG_RENAME_ACCOUNT,
      async (accountToRename) => {
        showRenameAccountPrompt(accountToRename);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CONFIG_DELETE_ACCOUNT,
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
          .then((answer) => {
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
              updateStatusBarItems();
            }
          });
      }
    )
  );
};
