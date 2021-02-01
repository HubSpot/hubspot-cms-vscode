const vscode = require('vscode');
const {
  findConfig,
  loadConfig,
  validateConfig,
  isTrackingAllowed,
} = require('@hubspot/cms-lib');
const {enableLinting, disableLinting} = require('./lib/lint');
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

  // TODO: !isTrackingAllowed() should not kill entire extension
  // TODO: Show user alert if config is not valid
  if (!validateConfig() || !isTrackingAllowed()) {
    return;
  }

  await trackUsage('vscode-extension', 'ACTIVATION');

  if (vscode.workspace.getConfiguration('hubl').get('lint.enabled')) {
    enableLinting();
  }

  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('hubl.lint.enabled')) {
      if (vscode.workspace.getConfiguration('hubl').get('lint.enabled')) {
        enableLinting();
      } else  {
        disableLinting();
      }
    }
	}));

}



module.exports = {
  activate,
};
