const vscode = require('vscode');
const {
  findConfig,
  loadConfig,
  validateConfig,
  isTrackingAllowed,
} = require('@hubspot/cms-lib');
const {lintHubl, disable} = require('./lib/lint');
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

  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {

		if (e.affectsConfiguration('hubl.lint.enabled')) {
      if (vscode.workspace.getConfiguration('hubl').get('lint.enabled')) {
        lintHubl();
      } else  {
        disable();
      }
    }
	}));

}



module.exports = {
  activate,
};
