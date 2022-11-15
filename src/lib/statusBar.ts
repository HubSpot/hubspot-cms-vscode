import * as vscode from 'vscode';
import { COMMANDS } from './constants';

const { getConfig } = require('@hubspot/cli-lib');

let hsStatusBar: vscode.StatusBarItem;

export const updateStatusBarItems = () => {
  console.log('updateStatusBarItems');

  const config = getConfig();
  const defaultAccount = config.defaultPortal;

  if (defaultAccount) {
    hsStatusBar.text = `$(arrow-swap) ${defaultAccount}`;
    hsStatusBar.tooltip = `Active HubSpot Account: ${defaultAccount}`;
    hsStatusBar.backgroundColor = undefined;
    hsStatusBar.show();
  } else {
    hsStatusBar.text = `$(extensions-warning-message) No Default Account Set`;
    hsStatusBar.tooltip =
      'There is currently no default HubSpot account set within the config. Click here to select a defaultPortal.';
    hsStatusBar.backgroundColor = new vscode.ThemeColor(
      'statusBarItem.warningBackground'
    );
    hsStatusBar.show();
  }
};

export const initializeStatusBar = (context: vscode.ExtensionContext) => {
  console.log('statusBar:activate');

  hsStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  hsStatusBar.command = COMMANDS.CONFIG_SELECT_DEFAULT_ACCOUNT;

  context.subscriptions.push(hsStatusBar);
};
