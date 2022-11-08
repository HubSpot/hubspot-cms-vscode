import * as vscode from 'vscode';
import { updateStatusBarItems } from './statusBar';
import { COMMANDS } from './constants';

export const registerCommands = (context: vscode.ExtensionContext) => {
  vscode.commands.registerCommand(
    COMMANDS.CONFIG_SET_DEFAULT_ACCOUNT,
    (defaultAccount) => {
      console.log(
        'Setting default account to: ',
        JSON.stringify(defaultAccount)
      );
      updateStatusBarItems(defaultAccount);
    }
  );
};
