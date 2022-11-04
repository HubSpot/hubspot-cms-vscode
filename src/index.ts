import * as vscode from 'vscode';
import * as fs from 'fs';
import { PortalsProvider } from './lib/providers/portalsProvider';
import { DocumentationProvider } from './lib/providers/documentationProvider';
import { startAuthServer } from './lib/servers/auth';
import {
  getUpdateLintingOnConfigChange,
  setLintingEnabledState,
} from './lib/lint';
import { trackAction } from './lib/tracking';
import { loadHubspotConfigFile } from './lib/auth';
import { registerCommands } from './lib/commands';
import { initializeStatusBar } from './lib/statusBar';

const hubspotDebugChannel = vscode.window.createOutputChannel(
  'hubspot-cms-vscode'
);
const logOutput = hubspotDebugChannel.appendLine.bind(hubspotDebugChannel);

const loadConfigDependentFeatures = async (
  context: vscode.ExtensionContext,
  configPath: string,
  rootPath: string
) => {
  console.log('loadConfigDependentFeatures', configPath);
  fs.watch(configPath, async () => {
    console.log('hubspot.config.yml changed');
    loadHubspotConfigFile(rootPath);
  });
  logOutput('loadConfigDependentFeatures');
  await trackAction('extension-activated');
  setLintingEnabledState();
  context.subscriptions.push(getUpdateLintingOnConfigChange());
  vscode.window.registerTreeDataProvider(
    'hubspot:portals',
    new PortalsProvider(configPath)
  );
};

export const activate = async (context: vscode.ExtensionContext) => {
  console.log('Activating Extension...');

  registerCommands(context);
  initializeStatusBar(context);

  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length < 1) {
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const configPath = loadHubspotConfigFile(rootPath);

  // TODO - Restart server when hubspot.config.yml is changed
  // Update tree data when hubspot.config.yml is changed
  startAuthServer(
    {
      getConfigPath: loadHubspotConfigFile,
      rootPath,
      onAuthSuccess: async (
        config: any,
        name: string,
        newConfigPath: string
      ) => {
        console.log('onAuthSuccess', JSON.stringify(config), name);
        await trackAction('auth-success', { name });
        loadConfigDependentFeatures(context, newConfigPath, rootPath);
      },
    },
    logOutput
  );
  vscode.window.registerTreeDataProvider(
    'hubspot:documentation',
    new DocumentationProvider()
  );

  if (configPath) {
    logOutput(`HubSpot config loaded from: ${configPath}`);
    console.log('configPath', configPath);
    await loadConfigDependentFeatures(context, configPath, rootPath);
  } else {
    logOutput(`No config found. Config path: ${configPath}`);
  }
};
