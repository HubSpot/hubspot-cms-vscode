import * as vscode from 'vscode';
import { COMMANDS } from '../constants';

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.AUTHORIZE_ACCOUNT, async () => {
      const authUrl =
        'https://app.hubspot.com/l/personal-access-key/auth/vscode';

      console.log('uriScheme: ', vscode.env.uriScheme);
      const callableUri = await vscode.env.asExternalUri(
        vscode.Uri.parse(authUrl)
      );
      await vscode.env.openExternal(callableUri);
    })
  );
};
