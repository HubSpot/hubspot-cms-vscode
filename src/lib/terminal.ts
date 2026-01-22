import { commands, window } from 'vscode';
import { gt as isVersionUpToDate } from 'semver';
const { exec } = require('node:child_process');

import { INTERVALS } from './constants';

export const runTerminalCommand = async (
  terminalCommand: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const cmd =
        process.platform === 'win32'
          ? `${terminalCommand} & exit`
          : `${terminalCommand} && exit`;
      exec(cmd, (error: Error, stdout: string, stderr: string) => {
        const err = error || stderr;

        if (err) {
          reject(err);
        } else {
          resolve(stdout);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const checkTerminalCommandVersion = async (
  terminalCommand: string
): Promise<string | undefined> => {
  return new Promise(async (resolve, reject) => {
    try {
      const cmd =
        process.platform === 'win32'
          ? `where ${terminalCommand}`
          : `which ${terminalCommand}`;
      const pathOutputMaybe = await runTerminalCommand(cmd);
      if (pathOutputMaybe === `${terminalCommand} not found`) {
        // Command is not installed/found
        resolve(undefined);
      } else {
        // Terminal command is installed, check version
        try {
          const commandVersion = await runTerminalCommand(
            `${terminalCommand} --version`
          );
          resolve(commandVersion.trim());
        } catch (e) {
          // Unknown version
          resolve('unknown');
        }
      }
    } catch (e) {
      resolve(undefined);
    }
  });
};

const checkAndSetNpmVersion = async (): Promise<string | undefined> => {
  const npmVersion = await checkTerminalCommandVersion('npm');
  commands.executeCommand(
    'setContext',
    'hubspot.terminal.versions.installed.npm',
    npmVersion
  );

  console.log('npmVersion: ', npmVersion);
  return npmVersion;
};

export const installHsCli = async (): Promise<void> => {
  const terminal = window.createTerminal();
  terminal.show();

  const hubspotInstalledPoll = setInterval(async () => {
    const hsVersion = await checkAndSetHsCliVersion();

    if (hsVersion) {
      clearInterval(hubspotInstalledPoll);
      window.showInformationMessage(
        `HubSpot CLI version ${hsVersion} installed.`
      );
    }
  }, INTERVALS.POLLING.FAST);

  const cmd =
    process.platform === 'win32'
      ? "echo 'Installing the HubSpot CLI.' & npm i -g @hubspot/cli@latest & echo 'Installation complete. You can now close this terminal window.'"
      : "echo 'Installing the HubSpot CLI.' && npm i -g @hubspot/cli@latest && echo 'Installation complete. You can now close this terminal window.'";
  terminal.sendText(cmd);
};

export const updateHsCliToLatestVersion = async (): Promise<void> => {
  const terminal = window.createTerminal();
  const latestVersion = await checkAndSetHsCliLatestVersion();
  terminal.show();

  const hsLegacyInstalled: boolean = (
    await runTerminalCommand(`npm list -g`)
  ).includes('@hubspot/cms-cli');
  if (hsLegacyInstalled) {
    const selection = await window.showWarningMessage(
      'The legacy HubSpot CLI (@hubspot/cms-cli) will be removed to update. Continue?',
      ...['Okay', 'Cancel']
    );
    if (!selection || selection === 'Cancel') {
      terminal.dispose();
      return;
    }
  }

  const hubspotUpdatedPoll = setInterval(async () => {
    const hsVersion = await checkAndSetHsCliVersion();

    if (hsVersion === latestVersion) {
      clearInterval(hubspotUpdatedPoll);
      window.showInformationMessage(
        `HubSpot CLI updated to version ${latestVersion}.`
      );
    }
  }, INTERVALS.POLLING.FAST);

  const cmd =
    process.platform === 'win32'
      ? "echo 'Updating the HubSpot CLI.' & npm uninstall -g @hubspot/cms-cli & npm i -g @hubspot/cli@latest & echo 'Update complete. You can now close this terminal window.'"
      : "echo 'Updating the HubSpot CLI.' && npm uninstall -g @hubspot/cms-cli && npm i -g @hubspot/cli@latest && echo 'Update complete. You can now close this terminal window.'";
  terminal.sendText(cmd);
};

const checkAndSetHsCliLatestVersion = async (): Promise<string | undefined> => {
  const hsVersion = (await runTerminalCommand('hs --version')).trim();
  const cmd =
    process.platform === 'win32'
      ? `npm info @hubspot/cli@latest | findstr "latest"`
      : `npm info @hubspot/cli@latest | grep 'latest'`;
  const nodeLatestLine: string = await runTerminalCommand(cmd);
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
};

const checkAndSetHsCliVersion = async (): Promise<string | undefined> => {
  const hsVersion = await checkTerminalCommandVersion('hs');
  commands.executeCommand(
    'setContext',
    'hubspot.terminal.versions.installed.hs',
    hsVersion
  );
  commands.executeCommand('setContext', 'hubspot.versionChecksComplete', true);

  console.log('hsVersion: ', hsVersion);
  if (hsVersion) {
    await checkAndSetHsCliLatestVersion();
  }

  return hsVersion;
};

export const initializeTerminal = async () => {
  const hsCliInstalled = await checkAndSetHsCliVersion();
  checkAndSetNpmVersion();

  if (!hsCliInstalled) {
    const hubspotInstalledPoll = setInterval(async () => {
      const hsCliInstalled = await checkAndSetHsCliVersion();

      if (hsCliInstalled) {
        clearInterval(hubspotInstalledPoll);
      }
    }, INTERVALS.POLLING.SLOW);
  }
};
