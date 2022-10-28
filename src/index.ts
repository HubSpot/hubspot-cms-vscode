import * as vscode from 'vscode';
const {
  findConfig,
  loadConfig,
  validateConfig,
  getAccountId,
  isTrackingAllowed,
  getAccountConfig,
} = require('@hubspot/cli-lib');
const { enableLinting, disableLinting } = require('./lib/lint');
const { trackUsage } = require('@hubspot/cli-lib/api/fileMapper');
const { PortalsProvider } = require('./lib/providers/portalsProvider');
const {
  DocumentationProvider,
} = require('./lib/providers/documentationProvider');

const {
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
} = require('./lib/constants');
const hubspotDebugChannel =
  vscode.window.createOutputChannel('hubspot-cms-vscode');
const logOutput = hubspotDebugChannel.appendLine.bind(hubspotDebugChannel);

const setCustomClauseVariables = (config: any) => {
  logOutput(`Setting hubspot.folderContainsHublFiles variable to ${!!config}`);
  vscode.commands.executeCommand(
    'setContext',
    'hubspot.folderContainsHubSpotConfigYaml',
    !!config
  );
};

const loadHubspotConfigFile = () => {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length < 1) {
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;

  if (!rootPath) {
    return;
  }

  logOutput(`Root path: ${rootPath}`);

  const path = findConfig(rootPath);

  if (!path) {
    return;
  }

  loadConfig(path);

  if (!validateConfig()) {
    return;
  } else {
    return path;
  }
};

const loadConfigDependentFeatures = async (
  context: vscode.ExtensionContext,
  configPath: any
) => {
  const trackAction = async (action: string) => {
    if (!isTrackingAllowed()) {
      return;
    }

    let authType = 'unknown';
    const accountId = getAccountId();

    if (accountId) {
      const accountConfig = getAccountConfig(accountId);
      authType =
        accountConfig && accountConfig.authType
          ? accountConfig.authType
          : 'apikey';
    }

    await trackUsage(
      'vscode-extension-interaction',
      'INTERACTION',
      { authType, action },
      accountId
    );
  };

  await trackAction('extension-activated');

  if (
    vscode.workspace
      .getConfiguration(EXTENSION_CONFIG_NAME)
      .get(EXTENSION_CONFIG_KEYS.HUBL_LINTING)
  ) {
    enableLinting();
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (
        e.affectsConfiguration(
          `${EXTENSION_CONFIG_NAME}.${EXTENSION_CONFIG_KEYS.HUBL_LINTING}`
        )
      ) {
        if (
          vscode.workspace
            .getConfiguration(EXTENSION_CONFIG_NAME)
            .get(EXTENSION_CONFIG_KEYS.HUBL_LINTING)
        ) {
          enableLinting();
          await trackAction('linting-enabled');
        } else {
          disableLinting();
          await trackAction('linting-disabled');
        }
      }
    })
  );

  vscode.window.registerTreeDataProvider(
    'hubspot:portals',
    new PortalsProvider(configPath)
  );
};

async function activate(context: vscode.ExtensionContext) {
  logOutput('Activating Extension...');

  const configPath = loadHubspotConfigFile();

  setCustomClauseVariables(configPath);
  vscode.window.registerTreeDataProvider(
    'hubspot:documentation',
    new DocumentationProvider()
  );

  if (configPath) {
    logOutput(`HubSpot config loaded from: ${configPath}`);
    await loadConfigDependentFeatures(context, configPath);
  } else {
    logOutput(`No config found.`);
  }
}

module.exports = {
  activate,
};
