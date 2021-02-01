const vscode = require('vscode');
const {
  findConfig,
  loadConfig,
  validateConfig,
  isTrackingAllowed,
} = require('@hubspot/cms-lib');
const {lintHubl} = require('./lib/lint');
const { trackUsage } = require('@hubspot/cms-lib/api/fileMapper');

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

  if (!validateConfig() || !isTrackingAllowed()) {
    return;
  }

  await trackUsage('vscode-extension', 'ACTIVATION');

  lintHubl(context);
}

module.exports = {
  activate,
};
