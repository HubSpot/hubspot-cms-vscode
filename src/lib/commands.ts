import { ExtensionContext } from 'vscode';
import { registerCommands as registerConfigCommands } from './commands/config';
import { registerCommands as registerAuthCommands } from './commands/auth';
import { registerCommands as registerTerminalCommands } from './commands/terminal';
import { registerCommands as registerCreateCommands } from './commands/create';
import { registerCommands as registerAccountCommands } from './commands/account';

export const registerCommands = (
  context: ExtensionContext,
  rootPath: string
) => {
  registerAccountCommands(context);
  registerConfigCommands(context);
  registerAuthCommands(context, rootPath);
  registerTerminalCommands(context);
  registerCreateCommands(context);
};
