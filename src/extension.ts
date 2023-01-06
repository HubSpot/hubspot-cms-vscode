import { ExtensionContext, workspace } from 'vscode';

import { getRootPath } from './lib/helpers';
import { registerCommands } from './lib/commands';
import { registerEvents } from './lib/events';
import { registerURIHandler } from './lib/uri';
import { initializeStatusBar } from './lib/statusBar';
import { initializeProviders } from './lib/providers';
import { initializeConfig } from './lib/auth';
import { initializeTerminal } from './lib/terminal';
import { initializeTracking, trackEvent } from './lib/tracking';
import { TRACKED_EVENTS } from './lib/constants';

export const activate = async (context: ExtensionContext) => {
  if (!workspace.workspaceFolders) return;

  initializeTracking(context);
  await trackEvent(TRACKED_EVENTS.ACTIVATE);
  console.log(
    'Activating Extension Version: ',
    context.extension.packageJSON.version
  );
  const rootPath = getRootPath();

  registerCommands(context, rootPath);
  registerEvents(context);
  registerURIHandler(context);

  initializeProviders(context);
  initializeTerminal(context);
  initializeStatusBar(context);

  initializeConfig(rootPath);
};
