import * as vscode from 'vscode';
import { updateStatusBarItems } from './statusBar';
import { COMMANDS } from './constants';

const { updateDefaultAccount } = require('@hubspot/cli-lib/lib/config');

export const registerCommands = (context: vscode.ExtensionContext) => {
  vscode.commands.registerCommand(
    COMMANDS.CONFIG_SET_DEFAULT_ACCOUNT,
    (defaultAccount, config) => {
      console.log(COMMANDS.CONFIG_SET_DEFAULT_ACCOUNT);
      updateDefaultAccount(defaultAccount);
      updateStatusBarItems(defaultAccount, config);
    }
  );
};
