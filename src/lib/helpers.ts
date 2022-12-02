import * as vscode from 'vscode';
import { HubspotConfig, Portal } from './types';

const { exec } = require('node:child_process');

export const getRootPath = () => {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length < 1) {
    throw new Error('No workspace folder found.');
  }

  return workspaceFolders[0].uri.fsPath;
};

export const getDefaultPortalFromConfig = (config: HubspotConfig) => {
  return (
    config &&
    config.portals &&
    config.portals.find(
      (p: Portal) =>
        p.portalId === config.defaultPortal || p.name === config.defaultPortal
    )
  );
};

export const getDisplayedHubspotPortalInfo = (portalData: Portal) => {
  return portalData.name
    ? `${portalData.name} - ${portalData.portalId}`
    : portalData.portalId;
};

export const runTerminalCommand = async (
  terminalCommand: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      exec(
        `${terminalCommand} && exit`,
        (error: Error, stdout: string, stderr: string) => {
          const err = error || stderr;

          if (err) {
            reject(err);
          } else {
            resolve(stdout);
          }
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

export const checkTerminalCommandVersion = async (terminalCommand: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const pathOutputMaybe = await runTerminalCommand(
        `which ${terminalCommand}`
      );
      if (pathOutputMaybe === `${terminalCommand} not found`) {
        // Command is not installed/found
        resolve(null);
      } else {
        // Terminal command is installed, check version
        try {
          const commandVersion = await runTerminalCommand(
            `${terminalCommand} --version`
          );
          resolve(commandVersion);
        } catch (e) {
          // Unknown version
          resolve('unknown');
        }
      }
    } catch (e) {
      resolve(null);
    }

    // try {
    //   exec(
    //     `which ${terminalCommand} && exit`,
    //     (error: Error, stdout: string, stderr: string) => {
    //       if (
    //         error ||
    //         stderr ||
    //         (stdout && stdout === `${terminalCommand} not found`)
    //       ) {
    //         // Command is not installed/found
    //         resolve(null);
    //       } else {
    //         // Terminal command is installed, check version
    //         exec(
    //           `${terminalCommand} --version && exit`,
    //           (error: Error, stdout: string, stderr: string) => {
    //             if (error || stderr) {
    //               // Unknown version
    //               resolve('unknown');
    //             } else {
    //               resolve(stdout);
    //             }
    //           }
    //         );
    //       }
    //     }
    //   );
    // } catch (e) {
    //   reject(e);
    // }
  });
};

// const semVerRegEx = /^(\d*)\.(\d*)\.(\d*)(.*)$/dgi;
// export const newerVersionAvailable = (
//   currentVersion: string,
//   latestVersion: string
// ) => {
//   console.log('comparing versions: ', currentVersion, ' and ', latestVersion);
//   const [, currentMajor, currentMinor, currentPatch, currentOther] =
//     semVerRegEx.exec(currentVersion) || [];
//   const [, latestMajor, latestMinor, latestPatch, latestOther] =
//     semVerRegEx.exec(latestVersion) || [];

//   if (
//     typeof currentMajor !== 'string' ||
//     typeof currentMinor !== 'string' ||
//     typeof currentPatch !== 'string' ||
//     typeof latestMajor !== 'string' ||
//     typeof latestMinor !== 'string' ||
//     typeof latestPatch !== 'string' ||
//     currentOther ||
//     latestOther
//   ) {
//     // Cannot run comparison, return false
//     console.log('catchall', currentMajor, typeof currentMajor, [
//       typeof currentMajor !== 'string',
//       typeof currentMinor !== 'string',
//       typeof currentPatch !== 'string',
//       typeof latestMajor !== 'string',
//       typeof latestMinor !== 'string',
//       typeof latestPatch !== 'string',
//       currentOther,
//       latestOther,
//     ]);
//     return false;
//   }

//   if (latestMajor > currentMajor) {
//     return true;
//   } else if (latestMinor > currentMinor) {
//     return true;
//   } else if (latestPatch > currentPatch) {
//     return true;
//   }

//   return false;
// };
