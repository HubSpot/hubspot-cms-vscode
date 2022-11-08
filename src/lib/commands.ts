import * as vscode from 'vscode';
import { updateStatusBarItems } from './statusBar';
import { COMMANDS } from './constants';
import { getDisplayedHubspotPortalInfo } from './helpers';
import { Portal } from './types';

const { getConfig } = require('@hubspot/cli-lib');
const { updateDefaultAccount } = require('@hubspot/cli-lib/lib/config');

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CONFIG_SET_DEFAULT_ACCOUNT,
      (defaultAccount) => {
        console.log(
          'Setting default account to: ',
          JSON.stringify(defaultAccount)
        );
        updateStatusBarItems(defaultAccount);
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
                console.log('selection: ', selection);
                updateDefaultAccount(
                  // @ts-ignore selection is an object
                  selection.portal.name || selection.portal.portalId
                );
              }
            });
        }
      }
    )
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
