import { ExtensionContext } from 'vscode';

import { registerCommands } from './commands';
import { registerProviders } from './providers';
import { registerEvents } from './events';
import { registerPanels } from './panels';
import { registerURIHandler } from './lib/uri';
import { initializeCliLibLogger } from './lib/logger';
import {
  initializeStatusBar,
  updateStatusBarItems,
} from './features/statusBar';
import { initializeConfig } from './lib/config';
import {
  getLocalConfigFilePathIfExists,
  globalConfigFileExists,
} from '@hubspot/local-dev-lib/config';
import { initializeTerminal } from './lib/terminal';
import { initializeTracking, trackEvent } from './lib/tracking';
import { maybeShowFeedbackRequest } from './features/feedbackRequest';
import { initializeHubLAutoDetect } from './features/autoDetectHubl';
import { initializeProjectConfigValidation } from './features/projectConfigValidation';
import { getRootPath } from './lib/helpers';
import { TRACKED_EVENTS } from './lib/constants';

export const activate = async (context: ExtensionContext) => {
  // Initialization steps
  initializeCliLibLogger();

  console.log('Activating Extension v', context.extension.packageJSON.version);
  const rootPath = getRootPath();

  // Set HUBSPOT_CONFIG_PATH early if local config exists
  // This allows local-dev-lib to find the config without relying on process.cwd()
  // Only needed for local config; global config is always in a known location
  if (rootPath && !globalConfigFileExists()) {
    const localConfigPath = getLocalConfigFilePathIfExists(rootPath);
    if (localConfigPath) {
      process.env.HUBSPOT_CONFIG_PATH = localConfigPath;
    }
  }

  await initializeTracking(context);
  trackEvent(TRACKED_EVENTS.ACTIVATE);

  // Contribution registration steps
  registerCommands(context, rootPath);
  registerURIHandler(context);
  registerProviders(context);
  registerPanels(context);

  // Registered commands that are not configured in the package.json file
  registerEvents(context);

  // Initialize config after events are registered so ON_CONFIG_FOUND handler is available
  if (rootPath) {
    initializeConfig(rootPath);
  }

  // Additional post-registration steps
  maybeShowFeedbackRequest(context);
  initializeTerminal();
  initializeStatusBar(context);
  initializeHubLAutoDetect(context);
  initializeProjectConfigValidation(context);

  // Ensure status bar shows initial state (including warning if no default account)
  updateStatusBarItems();
};
