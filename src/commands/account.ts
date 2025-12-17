import { commands, ExtensionContext, Uri } from 'vscode';
import { HubSpotConfigAccount } from '@hubspot/local-dev-lib/types/Accounts';
import { COMMANDS } from '../lib/constants';

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.ACCOUNT.VIEW_PERSONAL_ACCESS_KEY,
      async (hubspotAccount: HubSpotConfigAccount) => {
        const pakUrl = `https://app.hubspot${
          hubspotAccount.env === 'qa' ? 'qa' : ''
        }.com/personal-access-key/${hubspotAccount.accountId}`;

        commands.executeCommand('vscode.open', Uri.parse(pakUrl));
      }
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.ACCOUNT.OPEN_DESIGN_MANAGER,
      async (hubspotAccount: HubSpotConfigAccount) => {
        const designManagerUrl = `https://app.hubspot${
          hubspotAccount.env === 'qa' ? 'qa' : ''
        }.com/design-manager/${hubspotAccount.accountId}`;

        commands.executeCommand('vscode.open', Uri.parse(designManagerUrl));
      }
    )
  );
};
