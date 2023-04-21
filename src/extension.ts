import { ExtensionContext, workspace } from 'vscode';

import { getRootPath } from './lib/helpers';
import { TRACKED_EVENTS } from './lib/constants';

import { registerCommands } from './lib/commands';
import { registerEvents } from './lib/events';
import { registerURIHandler } from './lib/uri';

import { initializeCliLibLogger } from './lib/logger';
import { initializeStatusBar } from './lib/statusBar';
import { initializeProviders } from './lib/providers';
import { initializeConfig } from './lib/auth';
import { initializeTerminal } from './lib/terminal';
import { initializePanels } from './lib/panels';
import { initializeTracking, trackEvent } from './lib/tracking';
import { initializeGlobalState } from './lib/globalState';

export const activate = async (context: ExtensionContext) => {
  initializeCliLibLogger();
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

  initializeGlobalState(context);
  initializeProviders(context);
  initializePanels(context);
  initializeTerminal();
  initializeStatusBar(context);

  if (rootPath) {
    initializeConfig(rootPath);
  }
};
