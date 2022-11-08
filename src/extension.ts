import * as vscode from 'vscode';

import { DocumentationProvider } from './lib/providers/documentationProvider';
import { startAuthServer } from './lib/servers/auth';
import {
  handleHubspotConfigPostRequest,
  registerConfigDependentFeatures,
} from './lib/auth';
import { registerCommands } from './lib/commands';
import { initializeStatusBar } from './lib/statusBar';
import { getDefaultPortalFromConfig, getRootPath } from './lib/helpers';
import {
  getUpdateLintingOnConfigChange,
  setLintingEnabledState,
} from './lib/lint';
import { PortalsProvider } from './lib/providers/portalsProvider';
import { HubspotConfig } from './lib/types';
import { COMMANDS } from './lib/constants';

export const activate = async (context: vscode.ExtensionContext) => {
  console.log('Activating Extension...');
  const rootPath = getRootPath();

  registerCommands(context);
  initializeStatusBar(context);
  registerConfigDependentFeatures(
    context,
    rootPath,
    (configPath: string) => {
      console.log('loadConfigDependentFeatures');
      setLintingEnabledState();
      context.subscriptions.push(getUpdateLintingOnConfigChange());
      const portalProvider = new PortalsProvider();
      context.subscriptions.push(
        vscode.commands.registerCommand('hubspot:portals:refresh', () => {
          console.log('hubspot:portals:refresh');
          portalProvider.refresh();
        })
      );
      vscode.window.registerTreeDataProvider('hubspot:portals', portalProvider);
    },
    (config: HubspotConfig, configPath: string) => {
      console.log(
        'updateConfigDependentFeatures',
        config.defaultPortal,
        JSON.stringify(config.portals.map((p) => p.name)),
        configPath
      );
      vscode.commands.executeCommand(
        COMMANDS.CONFIG_SET_DEFAULT_ACCOUNT,
        getDefaultPortalFromConfig(config)
      );
      vscode.commands.executeCommand('hubspot:portals:refresh');
    }
  );

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
