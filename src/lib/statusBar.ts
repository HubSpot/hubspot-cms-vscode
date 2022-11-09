import * as vscode from 'vscode';

const { getConfig } = require('@hubspot/cli-lib');

let hsStatusBar: vscode.StatusBarItem;

export const updateStatusBarItems = () => {
  console.log('updateStatusBarItems');

  const config = getConfig();
  console.log('config', config);
  const defaultAccount = config.defaultPortal;

  if (defaultAccount) {
    hsStatusBar.text = `$(arrow-swap) ${defaultAccount}`;
    hsStatusBar.tooltip = `Active HubSpot Account: ${defaultAccount}`;
    hsStatusBar.show();
  } else {
    // TODO - Show something and allow user to set default account?
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
