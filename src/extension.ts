import { ExtensionContext } from 'vscode';

import { registerURIHandler } from './lib/uri';
import { registerCommands } from './lib/commands';
import { initializeStatusBar } from './lib/statusBar';
import { getRootPath } from './lib/helpers';
import { initializeProviders } from './lib/providers';
import { initializeConfig } from './lib/auth';
import { initializeTracking } from './lib/tracking';
import { initializeTerminal } from './lib/terminal';
import { registerEvents } from './lib/events';

export const activate = async (context: ExtensionContext) => {
  console.log(
    'Activating Extension Version: ',
    // @ts-ignore TODO - Why is extension not available, when it is?
    context.extension.packageJSON.version
  );
  const rootPath = getRootPath();

  registerCommands(context);
  registerEvents(context);
  registerURIHandler(context, rootPath);

  initializeProviders(context);
  initializeTerminal(context);
  initializeStatusBar(context);
  initializeTracking(context);

  initializeConfig(rootPath);
};
