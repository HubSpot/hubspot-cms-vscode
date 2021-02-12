const vscode = require('vscode');
const {
  findConfig,
  loadConfig,
  validateConfig,
  getAccountId,
  isTrackingAllowed,
} = require('@hubspot/cli-lib');
const { enableLinting, disableLinting } = require('./lib/lint');
const { trackUsage } = require('@hubspot/cli-lib/api/fileMapper');

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

  // TODO: !isTrackingAllowed() should not kill entire extension
  // TODO: Show user alert if config is not valid
  if (!validateConfig() || !isTrackingAllowed()) {
    return;
  }
  try {
    await trackUsage(
      'vscode-extension-interaction',
      'ACTIVATION',
      {},
      getAccountId()
    );
  } catch (e) {
    console.log(e);
  }
  if (vscode.workspace.getConfiguration('hubl').get('lint.enabled')) {
    enableLinting();
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('hubl.lint.enabled')) {
        if (vscode.workspace.getConfiguration('hubl').get('lint.enabled')) {
          enableLinting();
        } else {
          disableLinting();
        }
      }
    })
  );
}

module.exports = {
  activate,
};
