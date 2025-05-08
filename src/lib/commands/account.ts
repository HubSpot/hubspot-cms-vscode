import { commands, ExtensionContext, Uri } from 'vscode';
import { CLIAccount_DEPRECATED } from '@hubspot/local-dev-lib/types/Accounts';
import { COMMANDS } from '../constants';

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.ACCOUNT.VIEW_PERSONAL_ACCESS_KEY,
      async (hubspotAccount: CLIAccount_DEPRECATED) => {
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
      async (hubspotAccount: CLIAccount_DEPRECATED) => {
        const designManagerUrl = `https://app.hubspot${
          hubspotAccount.env === 'qa' ? 'qa' : ''
        }.com/design-manager/${hubspotAccount.portalId}`;

        commands.executeCommand('vscode.open', Uri.parse(designManagerUrl));
      }
    )
  );
};
