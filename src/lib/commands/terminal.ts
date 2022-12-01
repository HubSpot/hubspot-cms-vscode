import * as vscode from 'vscode';
import { checkIfTerminalCommandExists } from '../helpers';
import { COMMANDS, POLLING_INTERVALS, TERMINAL_IDS } from '../constants';

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.INSTALL_HUBSPOT_CLI, () => {
      const terminal = vscode.window.createTerminal(TERMINAL_IDS.CLI_INSTALL);

      terminal.show();

      const hubspotInstalledPoll = setInterval(async () => {
        const hsPath = await vscode.commands.executeCommand(
          COMMANDS.CHECK_HUBSPOT_CLI_INSTALL
        );

        if (hsPath) {
          clearInterval(hubspotInstalledPoll);
          vscode.window.showInformationMessage('HubSpot CLI installed.');
        }
      }, POLLING_INTERVALS.FAST);

      terminal.sendText("echo 'Installing the HubSpot CLI.'");
      terminal.sendText('npm i -g @hubspot/cli@latest');
      terminal.sendText(
        "echo 'Installation complete. You can now close this terminal window.'"
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CHECK_HUBSPOT_CLI_INSTALL,
      async () => {
        const hsPath = await checkIfTerminalCommandExists('hs');
        vscode.commands.executeCommand(
          'setContext',
          'hubspot.paths.hs',
          hsPath
        );

        console.log('hsPath: ', hsPath);
        return hsPath;
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.CHECK_NPM_INSTALL, async () => {
      const npmPath = await checkIfTerminalCommandExists('npm');
      vscode.commands.executeCommand(
        'setContext',
        'hubspot.paths.npm',
        npmPath
      );

      console.log('npmPath: ', npmPath);
      return npmPath;
    })
  );
};
