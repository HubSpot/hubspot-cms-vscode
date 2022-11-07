import * as vscode from 'vscode';

import { DocumentationProvider } from './lib/providers/documentationProvider';
import { startAuthServer } from './lib/servers/auth';
import {
  handleHubspotConfigPostRequest,
  registerConfigDependentFeatures,
} from './lib/auth';
import { registerCommands } from './lib/commands';
import { initializeStatusBar } from './lib/statusBar';
import { getRootPath } from './lib/helpers';
import {
  getUpdateLintingOnConfigChange,
  setLintingEnabledState,
} from './lib/lint';
import { PortalsProvider } from './lib/providers/portalsProvider';

export const activate = async (context: vscode.ExtensionContext) => {
  console.log('Activating Extension...');
  const rootPath = getRootPath();

  registerCommands(context);
  initializeStatusBar(context);
  registerConfigDependentFeatures(context, rootPath, (configPath: string) => {
    console.log('loadConfigDependentFeatures');
    setLintingEnabledState();
    const portalProvider = new PortalsProvider(configPath);
    context.subscriptions.push(getUpdateLintingOnConfigChange());
    vscode.window.registerTreeDataProvider('hubspot:portals', portalProvider);
    // vscode.commands.registerCommand(
    //   'hubspot:portals:refresh',
    //   portalProvider.refresh
    // );
  });

  // TODO - Restart server when hubspot.config.yml is changed
  // Update tree data when hubspot.config.yml is changed
  startAuthServer({
    onPostRequest: async (req: any) => {
      return handleHubspotConfigPostRequest(req, { rootPath });
    },
  });
  vscode.window.registerTreeDataProvider(
    'hubspot:documentation',
    new DocumentationProvider()
  );
};
