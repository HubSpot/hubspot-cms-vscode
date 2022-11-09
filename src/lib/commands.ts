import * as vscode from 'vscode';
import { updateStatusBarItems } from './statusBar';
import { COMMANDS } from './constants';
import { getDisplayedHubspotPortalInfo } from './helpers';
import { Portal } from './types';

const { getConfig } = require('@hubspot/cli-lib');
const {
  deleteAccount,
  deleteConfigFile,
  renameAccount,
  updateDefaultAccount,
} = require('@hubspot/cli-lib/lib/config');

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
        updateStatusBarItems();
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
      'hubspot.config.selectDefaultAccount',
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
                updateStatusBarItems();
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
      'hubspot.config.renameAccount',
      async (accountToRename) => {
        vscode.window
          .showInputBox({
            placeHolder: 'Enter a new name for the account',
          })
          .then((newName) => {
            // TODO - Validation
            if (newName) {
              const oldName = accountToRename.name || accountToRename.portalId;
              renameAccount(oldName, newName);
              updateStatusBarItems();
              vscode.window.showInformationMessage(
                `Successfully renamed default account from ${oldName} to ${newName}.`
              );
            }
          });
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'hubspot.config.deleteAccount',
      async (accountToDelete) => {
        const config = getConfig();
        const accountIdentifier =
          accountToDelete.name || accountToDelete.portalId;

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
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('hubspot.create.module', async (data) => {
      console.log('hubspot.create.module', data);
    })
  );

  // context.subscriptions.push(
  //   vscode.commands.registerCommand(
  //     'hubspot.config.changeDefaultAccount',
  //     async (portalData) => {
  //       updateDefaultAccount(portalData.name || portalData.portalId);
  //     }
  //   )
  // );
};
