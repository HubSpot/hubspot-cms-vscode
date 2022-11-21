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

export const checkIfTerminalCommandExists = async (terminalCommand: string) => {
  return new Promise((resolve, reject) => {
    try {
      exec(
        `which ${terminalCommand} && exit`,
        (error: Error, stdout: string, stderr: string) => {
          if (
            error ||
            stderr ||
            (stdout && stdout === `${terminalCommand} not found`)
          ) {
            resolve(false);
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
