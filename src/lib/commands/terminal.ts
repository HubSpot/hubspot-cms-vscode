import * as vscode from 'vscode';
import { compare } from 'compare-versions';
import { checkTerminalCommandVersion, runTerminalCommand } from '../helpers';
import { COMMANDS, POLLING_INTERVALS, TERMINAL_IDS } from '../constants';

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.HUBSPOT_CLI.INSTALL, () => {
      const terminal = vscode.window.createTerminal(TERMINAL_IDS.CLI_INSTALL);

      terminal.show();

      const hubspotInstalledPoll = setInterval(async () => {
        const hsVersion = await vscode.commands.executeCommand(
          COMMANDS.CHECK_HUBSPOT_CLI_INSTALL
        );

        if (hsVersion) {
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
    vscode.commands.registerCommand(COMMANDS.HUBSPOT_CLI.UPDATE, async () => {
      const terminal = vscode.window.createTerminal(TERMINAL_IDS.CLI_INSTALL);
      const latestVersion = await vscode.commands.executeCommand(
        COMMANDS.FETCH.LATEST_CLI_VERSION
      );
      terminal.show();

      const hubspotUpdatedPoll = setInterval(async () => {
        const hsVersion = await vscode.commands.executeCommand(
          COMMANDS.CHECK_HUBSPOT_CLI_INSTALL
        );

        if (hsVersion === latestVersion) {
          clearInterval(hubspotUpdatedPoll);
          vscode.window.showInformationMessage('HubSpot CLI updated.');
        }
      }, POLLING_INTERVALS.FAST);

      terminal.sendText("echo 'Updating the HubSpot CLI.'");
      terminal.sendText('npm i -g @hubspot/cli@latest');
      terminal.sendText(
        "echo 'Update complete. You can now close this terminal window.'"
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.FETCH.LATEST_CLI_VERSION,
      async () => {
        const hsVersion = (await runTerminalCommand('hs --version')).trim();
        const latestHsVersion = (
          await runTerminalCommand(
            `npm info @hubspot/cli@latest | grep 'latest: ' | sed -n -e 's/^latest: //p'`
          )
        ).trim();
        vscode.commands.executeCommand(
          'setContext',
          'hubspot.terminal.versions.latest.hs',
          hsVersion
        );
        console.log('latestVersion: ', latestHsVersion);

        console.log(
          'Newer CLI Version Available: ',
          compare(latestHsVersion, hsVersion, '>')
        );

        vscode.commands.executeCommand(
          'setContext',
          'hubspot.updateAvailableForCLI',
          compare(latestHsVersion, hsVersion, '>')
        );

        return latestHsVersion;
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.CHECK_HUBSPOT_CLI_INSTALL,
      async () => {
        const hsVersion = await checkTerminalCommandVersion('hs');
        vscode.commands.executeCommand(
          'setContext',
          'hubspot.terminal.versions.installed.hs',
          hsVersion
        );
        vscode.commands.executeCommand(
          'setContext',
          'hubspot.versionChecksComplete',
          true
        );

        console.log('hsVersion: ', hsVersion);
        if (hsVersion) {
          vscode.commands.executeCommand(COMMANDS.FETCH.LATEST_CLI_VERSION);
        }

        return hsVersion;
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.CHECK_NPM_INSTALL, async () => {
      const npmVersion = await checkTerminalCommandVersion('npm');
      vscode.commands.executeCommand(
        'setContext',
        'hubspot.terminal.versions.installed.npm',
        npmVersion
      );

      console.log('npmVersion: ', npmVersion);
      return npmVersion;
    })
  );
};
