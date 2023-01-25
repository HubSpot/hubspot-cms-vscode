import { languages, window, workspace, Disposable } from 'vscode';
import { triggerValidate } from './validation';
import { trackEvent } from './tracking';
import {
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
  TRACKED_EVENTS,
} from './constants';

const collection = languages.createDiagnosticCollection('hubl');
let documentChangeListener: Disposable;

export const setLintingEnabledState = () => {
  if (
    workspace
      .getConfiguration(EXTENSION_CONFIG_NAME)
      .get(EXTENSION_CONFIG_KEYS.HUBL_LINTING)
  ) {
    enableLinting();
  }
};

export const getUpdateLintingOnConfigChange = () => {
  return workspace.onDidChangeConfiguration(async (e) => {
    if (
      e.affectsConfiguration(
        `${EXTENSION_CONFIG_NAME}.${EXTENSION_CONFIG_KEYS.HUBL_LINTING}`
      )
    ) {
      if (
        workspace
          .getConfiguration(EXTENSION_CONFIG_NAME)
          .get(EXTENSION_CONFIG_KEYS.HUBL_LINTING)
      ) {
        enableLinting();
        await trackEvent(TRACKED_EVENTS.LINTING_ENABLED);
      } else {
        disableLinting();
        await trackEvent(TRACKED_EVENTS.LINTING_DISABLED);
      }
    }
  });
};

export const enableLinting = () => {
  if (window.activeTextEditor) {
    triggerValidate(window.activeTextEditor.document, collection);
  }

  documentChangeListener = workspace.onDidChangeTextDocument((event) => {
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
