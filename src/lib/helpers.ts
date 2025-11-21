import { dirname } from 'path';
import { window, commands, workspace, StatusBarAlignment } from 'vscode';
import { getConfigDefaultAccountIfExists } from '@hubspot/local-dev-lib/config';
import { HubSpotConfigAccount } from '@hubspot/local-dev-lib/types/Accounts';
import { COMMANDS } from './constants';

const { exec } = require('node:child_process');

export const getRootPath = () => {
  const workspaceFolders = workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length < 1) {
    return;
  }
  return workspaceFolders[0].uri.fsPath;
};

export const getDisplayedHubspotPortalInfo = (
  portalData: HubSpotConfigAccount
) => {
  const accountIdentifier = portalData.accountId;
  return portalData.name
    ? `${portalData.name} - ${accountIdentifier}`
    : `${accountIdentifier}`;
};

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

export const invalidateParentDirectoryCache = (filePath: string) => {
  let parentDirectory = dirname(filePath);
  if (parentDirectory === '.') {
    parentDirectory = '/';
  }
  commands.executeCommand(COMMANDS.REMOTE_FS.INVALIDATE_CACHE, parentDirectory);
};

export const buildStatusBarItem = (text: string) => {
  const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right);
  statusBarItem.text = text;
  return statusBarItem;
};
