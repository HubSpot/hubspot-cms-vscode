import { ExtensionContext } from 'vscode';
import { registerCommands as registerAuthCommands } from './commands/auth';
import { registerCommands as registerConfigCommands } from './commands/config';
import { registerCommands as registerModuleCommands } from './commands/module';
import { registerCommands as registerNotificationCommands } from './commands/notifications';
import { registerCommands as registerServerlessFunctionCommands } from './commands/serverlessFunction';
import { registerCommands as registerTerminalCommands } from './commands/terminal';

export const registerCommands = (context: ExtensionContext) => {
  registerAuthCommands(context);
  registerConfigCommands(context);
  registerModuleCommands(context);
  registerNotificationCommands(context);
  registerServerlessFunctionCommands(context);
  registerTerminalCommands(context);
};
