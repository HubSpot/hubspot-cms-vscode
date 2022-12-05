import * as vscode from 'vscode';
import { COMMANDS, POLLING_INTERVALS } from './constants';

export const initializeTerminal = (context: vscode.ExtensionContext) => {
  const hsInstalled = vscode.commands.executeCommand(COMMANDS.VERSION_CHECK.HS);
  vscode.commands.executeCommand(COMMANDS.VERSION_CHECK.NPM);

  if (!hsInstalled) {
    const hubspotInstalledPoll = setInterval(async () => {
      const hsPath = await vscode.commands.executeCommand(
        COMMANDS.VERSION_CHECK.HS
      );

      if (hsPath) {
        clearInterval(hubspotInstalledPoll);
      }
    }, POLLING_INTERVALS.SLOW);
  }
};
