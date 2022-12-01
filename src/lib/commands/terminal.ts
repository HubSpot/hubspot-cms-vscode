import * as vscode from 'vscode';
import { checkIfTerminalCommandExists } from '../helpers';
import { COMMANDS, TERMINAL_IDS } from '../constants';

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.INSTALL_HUBSPOT_CLI, () => {
      // vscode.window
      //   .showQuickPick(['Install CLI (npm)', 'Install CLI (yarn)'])
      //   .then((selection) => {
      //     console.log('selection: ', selection);
      //   });

      const terminal = vscode.window.createTerminal(TERMINAL_IDS.CLI_INSTALL);

      terminal.show();

      // TODO - Poll for 'which hs' value instead of this
      vscode.window.onDidCloseTerminal(async (closedTerminal) => {
        if (closedTerminal.name === TERMINAL_IDS.CLI_INSTALL) {
          const retVal = await vscode.commands.executeCommand(
            COMMANDS.CHECK_HUBSPOT_CLI_INSTALL
          );
          console.log('retVal: ', retVal);
          if (retVal) {
            vscode.window.showInformationMessage('HubSpot CLI installed.');
          } else {
            vscode.window.showInformationMessage(
              'Error Installing HubSpot CLI.'
            );
          }
        }
      });
      terminal.sendText("echo 'Installing the HubSpot CLI.'");
      terminal.sendText('npm i -g @hubspot/cli@latest');
      terminal.sendText(
        "echo 'Installation complete. You can now close this terminal window.'"
      );
      // terminal.sendText('exit');
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
