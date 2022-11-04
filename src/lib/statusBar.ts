import * as vscode from 'vscode';

let hsStatusBar: vscode.StatusBarItem;

export const updateStatusBarItems = (
  defaultAccount: string,
  config: object
) => {
  console.log('updateStatusBarItems', defaultAccount, config);
  if (defaultAccount) {
    hsStatusBar.text = `$(arrow-swap) ${defaultAccount}`;
    hsStatusBar.tooltip = `Active HubSpot Account: ${defaultAccount}`;
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
  hsStatusBar.command = 'hubspot.config.setDefaultAccount';

  context.subscriptions.push(hsStatusBar);
};
