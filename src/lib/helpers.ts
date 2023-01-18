import { workspace } from 'vscode';
import { HubspotConfig, Portal } from './types';

const { exec } = require('node:child_process');

export const getRootPath = () => {
  const workspaceFolders = workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length < 1) {
    throw new Error('No workspace folder found.');
  }
  return workspaceFolders[0].uri.path;
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
    : `${portalData.portalId}`;
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

export const checkTerminalCommandVersion = async (
  terminalCommand: string
): Promise<string | undefined> => {
  return new Promise(async (resolve, reject) => {
    try {
      const pathOutputMaybe = await runTerminalCommand(
        `which ${terminalCommand}`
      );
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
