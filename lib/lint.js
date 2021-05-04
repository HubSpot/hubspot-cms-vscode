const vscode = require('vscode');
const { triggerValidate } = require('./validation');

const collection = vscode.languages.createDiagnosticCollection('hubl');
let documentChangeListener;

const enableLinting = () => {
  if (vscode.window.activeTextEditor) {
    triggerValidate(vscode.window.activeTextEditor.document, collection);
  }

  documentChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document) {
      triggerValidate(event.document, collection);
    }
  });
};

const disableLinting = () => {
  // Clear out any existing diagnostics
  collection.clear();
  // Remove onDidChangeTextDocument event listener
  documentChangeListener.dispose();
};

module.exports = { enableLinting, disableLinting };
