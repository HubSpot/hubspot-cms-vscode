import { ExtensionContext } from 'vscode';
import { registerCommands as registerAuthCommands } from './commands/auth';
import { registerCommands as registerConfigCommands } from './commands/config';
import { registerCommands as registerNotificationCommands } from './commands/notifications';
import { registerCommands as registerTerminalCommands } from './commands/terminal';
import { registerCommands as registerCreateCommands } from './commands/create';
import { registerCommands as registerAccountCommands } from './commands/account';
import { registerCommands as registerGlobalStateCommands } from './commands/globalState';

export const registerCommands = (
  context: ExtensionContext,
  rootPath: string
) => {
  registerAccountCommands(context);
  registerAuthCommands(context, rootPath);
  registerConfigCommands(context);
  registerNotificationCommands(context);
  registerCreateCommands(context);
  registerTerminalCommands(context);
  registerGlobalStateCommands(context);
};
