import { commands, env, ExtensionContext, Uri } from 'vscode';
import { updateStatusBarItems } from '../lib/statusBar';
import { COMMANDS, EVENTS } from './constants';

export const registerEvents = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(EVENTS.ON_CONFIG_UPDATED, () => {
      console.log(EVENTS.ON_CONFIG_UPDATED);
      commands.executeCommand(COMMANDS.ACCOUNTS_REFRESH);
      updateStatusBarItems();
    })
  );

  context.subscriptions.push(
    commands.registerCommand(COMMANDS.AUTHORIZE_ACCOUNT, async () => {
      const authUrl =
        'https://app.hubspot.com/l/personal-access-key/auth/vscode';

      const callableUri = await env.asExternalUri(Uri.parse(authUrl));
      await env.openExternal(callableUri);
    })
  );
};
