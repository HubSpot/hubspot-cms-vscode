import { commands, window, ExtensionContext } from 'vscode';
import { compare } from 'compare-versions';
import { checkTerminalCommandVersion, runTerminalCommand } from '../helpers';
import { COMMANDS, POLLING_INTERVALS } from '../constants';

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.HUBSPOT_CLI.INSTALL, () => {
      const terminal = window.createTerminal();

      terminal.show();

      const hubspotInstalledPoll = setInterval(async () => {
        const hsVersion = await commands.executeCommand(
          COMMANDS.VERSION_CHECK.HS
        );

        if (hsVersion) {
          clearInterval(hubspotInstalledPoll);
          window.showInformationMessage(
            `HubSpot CLI version ${hsVersion} installed.`
          );
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
    commands.registerCommand(COMMANDS.HUBSPOT_CLI.UPDATE, async () => {
      const terminal = window.createTerminal();
      const latestVersion = await commands.executeCommand(
        COMMANDS.VERSION_CHECK.HS_LATEST
      );
      terminal.show();

      const hubspotUpdatedPoll = setInterval(async () => {
        const hsVersion = await commands.executeCommand(
          COMMANDS.VERSION_CHECK.HS
        );

        if (hsVersion === latestVersion) {
          clearInterval(hubspotUpdatedPoll);
          window.showInformationMessage(
            `HubSpot CLI updated to version ${latestVersion}.`
          );
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
    commands.registerCommand(COMMANDS.VERSION_CHECK.HS_LATEST, async () => {
      const hsVersion = (await runTerminalCommand('hs --version')).trim();
      const latestHsVersion = (
        await runTerminalCommand(
          `npm info @hubspot/cli@latest | grep 'latest: ' | sed -n -e 's/^latest: //p'`
        )
      ).trim();
      commands.executeCommand(
        'setContext',
        'hubspot.terminal.versions.latest.hs',
        hsVersion
      );
      console.log('latestVersion: ', latestHsVersion);

      console.log(
        'Newer CLI Version Available: ',
        compare(latestHsVersion, hsVersion, '>')
      );

      commands.executeCommand(
        'setContext',
        'hubspot.updateAvailableForCLI',
        compare(latestHsVersion, hsVersion, '>')
      );

      return latestHsVersion;
    })
  );

  context.subscriptions.push(
    commands.registerCommand(COMMANDS.VERSION_CHECK.HS, async () => {
      const hsVersion = await checkTerminalCommandVersion('hs');
      commands.executeCommand(
        'setContext',
        'hubspot.terminal.versions.installed.hs',
        hsVersion
      );
      commands.executeCommand(
        'setContext',
        'hubspot.versionChecksComplete',
        true
      );

      console.log('hsVersion: ', hsVersion);
      if (hsVersion) {
        commands.executeCommand(COMMANDS.VERSION_CHECK.HS_LATEST);
      }

      return hsVersion;
    })
  );

  context.subscriptions.push(
    commands.registerCommand(COMMANDS.VERSION_CHECK.NPM, async () => {
      const npmVersion = await checkTerminalCommandVersion('npm');
      commands.executeCommand(
        'setContext',
        'hubspot.terminal.versions.installed.npm',
        npmVersion
      );

      console.log('npmVersion: ', npmVersion);
      return npmVersion;
    })
  );
};
