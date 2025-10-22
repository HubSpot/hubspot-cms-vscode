import {
  window,
  ExtensionContext,
  StatusBarAlignment,
  StatusBarItem,
  ThemeColor,
} from 'vscode';
import { COMMANDS } from '../lib/constants';
import {
  getConfig,
  getConfigDefaultAccount,
} from '@hubspot/local-dev-lib/config';

let hsStatusBar: StatusBarItem;

export const updateStatusBarItems = () => {
  const config = getConfig();

  const defaultAccount = config && getConfigDefaultAccount();

  if (defaultAccount) {
    hsStatusBar.text = `$(arrow-swap) ${defaultAccount}`;
    hsStatusBar.tooltip = `Default HubSpot Account: ${defaultAccount}`;
    hsStatusBar.backgroundColor = undefined;
    hsStatusBar.show();
  } else {
    hsStatusBar.text = `$(extensions-warning-message) No Default HubSpot Account`;
    hsStatusBar.tooltip =
      'There is currently no default HubSpot account set within the config. Click here to select a defaultAccount.';
    hsStatusBar.backgroundColor = new ThemeColor(
      'statusBarItem.warningBackground'
    );
    hsStatusBar.show();
  }
};

export const initializeStatusBar = (context: ExtensionContext) => {
  hsStatusBar = window.createStatusBarItem(StatusBarAlignment.Right, 100);
  hsStatusBar.command = COMMANDS.CONFIG.SELECT_DEFAULT_ACCOUNT;

  context.subscriptions.push(hsStatusBar);
};
