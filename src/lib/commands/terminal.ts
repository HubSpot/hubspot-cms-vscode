import { commands, window, ExtensionContext } from 'vscode';
import { gt as isVersionUpToDate } from 'semver';
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

      terminal.sendText(
        "echo 'Installing the HubSpot CLI.' && npm i -g @hubspot/cli@latest && echo 'Installation complete. You can now close this terminal window.'"
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

      terminal.sendText(
        "echo 'Updating the HubSpot CLI.' && npm uninstall -g @hubspot/cms-cli && npm i -g @hubspot/cli@latest && echo 'Update complete. You can now close this terminal window.'"
      );
    })
  );

  context.subscriptions.push(
    commands.registerCommand(COMMANDS.VERSION_CHECK.HS_LATEST, async () => {
      const hsVersion = (await runTerminalCommand('hs --version')).trim();
      const nodeLatestLine: string = await runTerminalCommand(
        `npm info @hubspot/cli@latest | grep 'latest'`
      );
      const latestHsVersion = nodeLatestLine
        .replace(
          // Remove ANSI color styles https://stackoverflow.com/a/29497680
          /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
          ''
        )
        .replace('latest: ', '')
        .trim();
      commands.executeCommand(
        'setContext',
        'hubspot.terminal.versions.latest.hs',
        hsVersion
      );
      console.log('latestVersion: ', latestHsVersion);

      const newerCLIVersionAvailable = isVersionUpToDate(
        latestHsVersion,
        hsVersion
      );

      console.log('Newer CLI Version Available: ', newerCLIVersionAvailable);

      commands.executeCommand(
        'setContext',
        'hubspot.updateAvailableForCLI',
        newerCLIVersionAvailable
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
