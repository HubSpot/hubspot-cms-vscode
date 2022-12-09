import * as vscode from 'vscode';
import { triggerValidate } from './validation';
import { trackEvent } from './tracking';
import { EXTENSION_CONFIG_NAME, EXTENSION_CONFIG_KEYS } from './constants';

const collection = vscode.languages.createDiagnosticCollection('hubl');
let documentChangeListener: vscode.Disposable;

export const setLintingEnabledState = () => {
  if (
    vscode.workspace
      .getConfiguration(EXTENSION_CONFIG_NAME)
      .get(EXTENSION_CONFIG_KEYS.HUBL_LINTING)
  ) {
    enableLinting();
  }
};

export const getUpdateLintingOnConfigChange = () => {
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
        await trackEvent('linting-enabled');
      } else {
        disableLinting();
        await trackEvent('linting-disabled');
      }
    }
  });
};

export const enableLinting = () => {
  if (vscode.window.activeTextEditor) {
    triggerValidate(vscode.window.activeTextEditor.document, collection);
  }

  documentChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document) {
      triggerValidate(event.document, collection);
    }
  });
};

export const disableLinting = () => {
  // Clear out any existing diagnostics
  collection.clear();
  // Remove onDidChangeTextDocument event listener
  documentChangeListener.dispose();
};
