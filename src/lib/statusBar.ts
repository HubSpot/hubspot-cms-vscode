import * as vscode from 'vscode';
import { getDisplayedHubspotPortalInfo } from './helpers';
import { Portal } from './types';

let hsStatusBar: vscode.StatusBarItem;

export const updateStatusBarItems = (defaultAccount: Portal | undefined) => {
  console.log('updateStatusBarItems');
  if (defaultAccount) {
    hsStatusBar.text = `$(arrow-swap) ${getDisplayedHubspotPortalInfo(
      defaultAccount
    )}`;
    hsStatusBar.tooltip = `Active HubSpot Account: ${getDisplayedHubspotPortalInfo(
      defaultAccount
    )}`;
    hsStatusBar.show();
  } else {
    hsStatusBar.hide();
  }
};

export const initializeStatusBar = (context: vscode.ExtensionContext) => {
  console.log('statusBar:activate');

  hsStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  hsStatusBar.command = 'hubspot.config.selectDefaultAccount';

  context.subscriptions.push(hsStatusBar);
};
