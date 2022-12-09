import { ExtensionContext } from 'vscode';

import { registerURIHandler } from './lib/uri';
import { registerCommands } from './lib/commands';
import { initializeStatusBar } from './lib/statusBar';
import { getRootPath } from './lib/helpers';
import { initializeProviders } from './lib/providers';
import { initializeConfig } from './lib/auth';
import { initializeTerminal } from './lib/terminal';
import { registerEvents } from './lib/events';

export const activate = async (context: ExtensionContext) => {
  console.log('Activating Extension...');
  const rootPath = getRootPath();

  registerCommands(context, rootPath);
  registerEvents(context);
  registerURIHandler(context);

  initializeProviders(context);
  initializeTerminal(context);
  initializeStatusBar(context);

  initializeConfig(rootPath);
};
