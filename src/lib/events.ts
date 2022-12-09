import * as vscode from 'vscode';
import { updateStatusBarItems } from '../lib/statusBar';
import { COMMANDS, EVENTS } from './constants';

export const registerEvents = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(EVENTS.ON_CONFIG_UPDATED, () => {
      console.log(EVENTS.ON_CONFIG_UPDATED);
      vscode.commands.executeCommand(COMMANDS.ACCOUNTS_REFRESH);
      updateStatusBarItems();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.AUTHORIZE_ACCOUNT, async () => {
      const authUrl =
        'https://app.hubspot.com/l/personal-access-key/auth/vscode';

      const callableUri = await vscode.env.asExternalUri(
        vscode.Uri.parse(authUrl)
      );
      await vscode.env.openExternal(callableUri);
    })
  );
};
