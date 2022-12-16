import { ExtensionContext } from 'vscode';
import { registerCommands as registerConfigCommands } from './commands/config';
import { registerCommands as registerAuthCommands } from './commands/auth';
import { registerCommands as registerTerminalCommands } from './commands/terminal';
import { registerCommands as registerCreateCommands } from './commands/create';

export const registerCommands = (
  context: ExtensionContext,
  rootPath: string
) => {
  registerConfigCommands(context);
  registerAuthCommands(context, rootPath);
  registerTerminalCommands(context);
  registerCreateCommands(context);
};
