const vscode = require('vscode');
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
const { notifyBeta } = require('./lib/notify');
const {
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
} = require('./lib/constants');

async function activate(context) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length < 1) {
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;

  if (!rootPath) {
    return;
  }

  const path = findConfig(rootPath);

  if (!path) {
    return;
  }

  loadConfig(path);

  if (!validateConfig()) {
    return;
  }

  const trackAction = async (action) => {
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
      .get(EXTENSION_CONFIG_KEYS.BETA)
  ) {
    enableLinting();
  } else {
    notifyBeta(context);
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (
        e.affectsConfiguration(
          `${EXTENSION_CONFIG_NAME}.${EXTENSION_CONFIG_KEYS.BETA}`
        )
      ) {
        if (
          vscode.workspace
            .getConfiguration(EXTENSION_CONFIG_NAME)
            .get(EXTENSION_CONFIG_KEYS.BETA)
        ) {
          enableLinting();
          await trackAction('beta-enabled');
        } else {
          disableLinting();
          await trackAction('beta-disabled');
        }
      }
    })
  );
}

module.exports = {
  activate,
};
