import * as vscode from 'vscode';
import { registerCommands as registerConfigCommands } from './commands/config';
import { registerCommands as registerAuthCommands } from './commands/auth';
import { registerCommands as registerModuleCommands } from './commands/module';
import { registerCommands as registerServerlessFunctionCommands } from './commands/serverlessFunction';

export const registerCommands = (context: vscode.ExtensionContext) => {
  registerConfigCommands(context);
  registerAuthCommands(context);
  registerModuleCommands(context);
  registerServerlessFunctionCommands(context);
};
