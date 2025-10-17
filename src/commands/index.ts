import { ExtensionContext } from 'vscode';

import { registerCommands as registerAccountCommands } from './account';
import { registerCommands as registerAuthCommands } from './auth';
import { registerCommands as registerConfigCommands } from './config';
import { registerCommands as registerGlobalStateCommands } from './globalState';
import { registerCommands as registerModuleCommands } from './modules';
import { registerCommands as registerServerlessCommands } from './serverless';
import { registerCommands as registerTemplateCommands } from './templates';
import { registerCommands as registerTerminalCommands } from './terminal';
import { registerCommands as registerRemoteFsCommands } from './remoteFs';

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
  registerServerlessCommands(context);
  registerTemplateCommands(context);
  registerTerminalCommands(context);
  registerRemoteFsCommands(context);
};
