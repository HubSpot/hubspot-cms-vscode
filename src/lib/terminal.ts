import { commands, ExtensionContext } from 'vscode';
import { COMMANDS, POLLING_INTERVALS } from './constants';

export const initializeTerminal = (context: ExtensionContext) => {
  const hsInstalled = commands.executeCommand(COMMANDS.VERSION_CHECK.HS);
  commands.executeCommand(COMMANDS.VERSION_CHECK.NPM);

  if (!hsInstalled) {
    const hubspotInstalledPoll = setInterval(async () => {
      const hsPath = await commands.executeCommand(COMMANDS.VERSION_CHECK.HS);

      if (hsPath) {
        clearInterval(hubspotInstalledPoll);
      }
    }, POLLING_INTERVALS.SLOW);
  }
};
