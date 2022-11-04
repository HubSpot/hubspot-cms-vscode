const vscode = require('vscode');
const { triggerValidate } = require('./validation');
const { EXTENSION_CONFIG_NAME, EXTENSION_CONFIG_KEYS } = require('./constants');

const collection = vscode.languages.createDiagnosticCollection('hubl');
let documentChangeListener;

const setLintingEnabledState = () => {
  if (
    vscode.workspace
      .getConfiguration(EXTENSION_CONFIG_NAME)
      .get(EXTENSION_CONFIG_KEYS.HUBL_LINTING)
  ) {
    enableLinting();
  }
};

const getUpdateLintingOnConfigChange = () => {
  return vscode.workspace.onDidChangeConfiguration(async (e) => {
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
  });
};

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

module.exports = {
  enableLinting,
  disableLinting,
  getUpdateLintingOnConfigChange,
  setLintingEnabledState,
};
