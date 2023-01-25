import { commands, env, ExtensionContext, Uri } from 'vscode';
import { COMMANDS } from '../constants';

export const registerCommands = (
  context: ExtensionContext,
  rootPath: string
) => {
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.AUTHORIZE_ACCOUNT, async () => {
      const authUrl = `https://app.hubspot.com/l/personal-access-key?vsCodeExtensionRootPath=${rootPath}`;

      const callableUri = await env.asExternalUri(Uri.parse(authUrl));
      await env.openExternal(callableUri);
    })
  );
};
