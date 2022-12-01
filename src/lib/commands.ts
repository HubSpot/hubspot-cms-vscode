import * as vscode from 'vscode';
import { registerCommands as registerConfigCommands } from './commands/config';
import { registerCommands as registerAuthCommands } from './commands/auth';

export const registerCommands = (context: vscode.ExtensionContext) => {
  registerConfigCommands(context);
  registerAuthCommands(context);
};
