import * as vscode from 'vscode';

import { startServer } from './lib/server';
import {
  handleHubspotConfigPostRequest,
  registerConfigDependentFeatures,
} from './lib/auth';
import { registerCommands } from './lib/commands';
import { initializeStatusBar, updateStatusBarItems } from './lib/statusBar';
import { getDefaultPortalFromConfig, getRootPath } from './lib/helpers';
import {
  getUpdateLintingOnConfigChange,
  setLintingEnabledState,
} from './lib/lint';
import { PortalsProvider } from './lib/providers/portalsProvider';
import { HubspotConfig } from './lib/types';
import { COMMANDS, TREE_DATA } from './lib/constants';

export const activate = async (context: vscode.ExtensionContext) => {
  console.log('Activating Extension...');
  const rootPath = getRootPath();

  registerCommands(context);
  initializeStatusBar(context);
  registerConfigDependentFeatures({
    rootPath,
    onConfigFound: (configPath: string) => {
      console.log('loadConfigDependentFeatures');
      setLintingEnabledState();
      context.subscriptions.push(getUpdateLintingOnConfigChange());
      const portalProvider = new PortalsProvider();
      context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.PORTALS_REFRESH, () => {
          console.log(COMMANDS.PORTALS_REFRESH);
          portalProvider.refresh();
        })
      );
      vscode.window.registerTreeDataProvider(TREE_DATA.PORTALS, portalProvider);
      updateStatusBarItems();
    },
    onConfigUpdated: (config: HubspotConfig, configPath: string) => {
      console.log(
        'updateConfigDependentFeatures',
        config.defaultPortal,
        JSON.stringify(config.portals.map((p) => p.name)),
        configPath
      );
      vscode.commands.executeCommand(
        COMMANDS.CONFIG_SET_DEFAULT_ACCOUNT,
        getDefaultPortalFromConfig(config),
        { silenceNotification: true }
      );
      vscode.commands.executeCommand(COMMANDS.PORTALS_REFRESH);
      updateStatusBarItems();
    },
  });

  startServer({
    onPostRequest: async (req: any) => {
      return handleHubspotConfigPostRequest(req, { rootPath });
    },
  });
};
