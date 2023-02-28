import { ExtensionContext } from 'vscode';
import { registerCommands as registerAccountCommands } from './commands/account';
import { registerCommands as registerAuthCommands } from './commands/auth';
import { registerCommands as registerConfigCommands } from './commands/config';
import { registerCommands as registerGlobalStateCommands } from './commands/globalState';
import { registerCommands as registerModuleCommands } from './commands/modules';
import { registerCommands as registerNotificationCommands } from './commands/notifications';
import { registerCommands as registerServerlessCommands } from './commands/serverless';
import { registerCommands as registerTemplateCommands } from './commands/templates';
import { registerCommands as registerTerminalCommands } from './commands/terminal';
import { registerCommands as registerRemoteFsCommands } from './commands/remoteFs';
export const registerCommands = (
  context: ExtensionContext,
  rootPath: string | undefined
) => {
  if (rootPath) {
    registerAuthCommands(context, rootPath);
  }
  registerAccountCommands(context);
  registerConfigCommands(context);
  registerGlobalStateCommands(context);
  registerModuleCommands(context);
  registerNotificationCommands(context);
  registerServerlessCommands(context);
  registerTemplateCommands(context);
  registerTerminalCommands(context);
  registerRemoteFsCommands(context);
};
