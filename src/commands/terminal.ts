import { commands, ExtensionContext } from 'vscode';

import { installHsCli, updateHsCliToLatestVersion } from '../lib/terminal';
import { COMMANDS } from '../lib/constants';

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.HUBSPOT_CLI.INSTALL, installHsCli)
  );

  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.HUBSPOT_CLI.UPDATE,
      updateHsCliToLatestVersion
    )
  );
};
