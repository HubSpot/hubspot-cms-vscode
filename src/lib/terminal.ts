import * as vscode from 'vscode';
import { COMMANDS, POLLING_INTERVALS } from './constants';

export const initializeTerminal = (context: vscode.ExtensionContext) => {
  const hsInstalled = vscode.commands.executeCommand(
    COMMANDS.CHECK_HUBSPOT_CLI_INSTALL
  );
  vscode.commands.executeCommand(COMMANDS.CHECK_NPM_INSTALL);

  if (!hsInstalled) {
    const hubspotInstalledPoll = setInterval(async () => {
      const hsPath = await vscode.commands.executeCommand(
        COMMANDS.CHECK_HUBSPOT_CLI_INSTALL
      );

      if (hsPath) {
        clearInterval(hubspotInstalledPoll);
      }
    }, POLLING_INTERVALS.SLOW);
  }
};
