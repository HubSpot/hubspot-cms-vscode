const vscode = require('vscode');
const {
  findConfig,
  loadConfig,
  validateConfig,
  isTrackingAllowed,
  getPortalId
} = require('@hubspot/cms-lib');
const { trackUsage } = require('@hubspot/cms-lib/api/fileMapper');
const { validateHubl } = require('@hubspot/cms-lib/api/validate');

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

  const collection = vscode.languages.createDiagnosticCollection('hubl');

  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document, collection);
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((editor) => {
      if (editor) {
        updateDiagnostics(editor.document, collection);
      }
    })
  );
}

const getRange = (document, error) => {
  if (error.startPosition > 0) {
    return document.getWordRangeAtPosition(
      new vscode.Position(error.lineno - 1, error.startPosition - 1)
    );
  } else {
    return document.lineAt(new vscode.Position(error.lineno - 1, 0)).range;
  }
};

async function updateDiagnostics(document, collection) {
  console.log('Request');
  const { renderingErrors } = await validateHubl(getPortalId(), document.getText());

  const errors = renderingErrors.map((error) => {
    return {
      code: '',
      message: error.message,
      range: getRange(document, error),
      severity: vscode.DiagnosticSeverity.Error,
    };
  });

  if (document) {
    collection.set(document.uri, errors);
  } else {
    collection.clear();
  }
}
module.exports = {
  activate,
};
