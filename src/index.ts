import * as vscode from 'vscode';
import * as fs from 'fs';
const { PortalsProvider } = require('./lib/providers/portalsProvider');
const {
  DocumentationProvider,
} = require('./lib/providers/documentationProvider');
const { startAuthServer } = require('./lib/servers/auth');
const {
  getUpdateLintingOnConfigChange,
  setLintingEnabledState,
} = require('./lib/lint');
const { trackAction } = require('./lib/tracking');
const { loadHubspotConfigFile } = require('./lib/auth');

const hubspotDebugChannel = vscode.window.createOutputChannel(
  'hubspot-cms-vscode'
);
const logOutput = hubspotDebugChannel.appendLine.bind(hubspotDebugChannel);

const initStatusBarActivePortal = (context: any) => {
  const hsStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    1
  );
  hsStatusBar.text = `$(arrow-swap) Test`;
  hsStatusBar.command = 'hubspot:setDefaultAccount';
  context.subscriptions.push(hsStatusBar);
};

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
  initStatusBarActivePortal(context);
};

async function activate(context: vscode.ExtensionContext) {
  logOutput('Activating Extension...');
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
}

module.exports = {
  activate,
};
