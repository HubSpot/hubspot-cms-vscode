import * as vscode from 'vscode';
import { registerCommands as registerConfigCommands } from './commands/config';
import { registerCommands as registerAuthCommands } from './commands/auth';
import { registerCommands as registerTerminalCommands } from './commands/terminal';
import { registerCommands as registerModuleCommands } from './commands/module';

export const registerCommands = (context: vscode.ExtensionContext) => {
  registerConfigCommands(context);
  registerAuthCommands(context);
  registerTerminalCommands(context);
  registerModuleCommands(context);
};
