import { commands, env, ExtensionContext, Uri } from 'vscode';

import { COMMANDS, IDE_NAMES } from '../lib/constants';

export const registerCommands = (
  context: ExtensionContext,
  rootPath: string
) => {
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.ACCOUNT.AUTHORIZE, async () => {
      // Detect the IDE type based on env.appName
      const ideParam =
        env.appName.toLowerCase() === IDE_NAMES.CURSOR
          ? IDE_NAMES.CURSOR
          : IDE_NAMES.VSCODE;

      const authUrl = `https://app.hubspot.com/l/personal-access-key?vsCodeExtensionRootPath=${rootPath}&source=${ideParam}`;

      const callableUri = await env.asExternalUri(Uri.parse(authUrl));
      await env.openExternal(callableUri);
    })
  );
};
