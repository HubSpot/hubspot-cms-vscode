import { commands, ExtensionContext, Uri } from 'vscode';
import { COMMANDS } from '../constants';
import { Portal } from '../types';

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.ACCOUNT.VIEW_PERSONAL_ACCESS_KEY,
      async (hubspotAccount: Portal) => {
        const pakUrl = `https://app.hubspot${
          hubspotAccount.env === 'qa' ? 'qa' : ''
        }.com/personal-access-key/${hubspotAccount.portalId}`;

        commands.executeCommand('vscode.open', Uri.parse(pakUrl));
      }
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.ACCOUNT.OPEN_DESIGN_MANAGER,
      async (hubspotAccount: Portal) => {
        const designManagerUrl = `https://app.hubspot${
          hubspotAccount.env === 'qa' ? 'qa' : ''
        }.com/design-manager/${hubspotAccount.portalId}`;

        commands.executeCommand('vscode.open', Uri.parse(designManagerUrl));
      }
    )
  )
};
