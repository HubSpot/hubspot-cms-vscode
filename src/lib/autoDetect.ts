import {
  ExtensionContext,
  workspace,
  window,
  ConfigurationTarget,
} from 'vscode';
import { FileAssociations } from './types';
const { extname } = require('path');
import {
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
  HUBL_HTML_ID,
  HUBL_CSS_ID,
} from './constants';

export const initializeHubLAutoDetect = (context: ExtensionContext) => {
  if (
    hasHubLAssociations() ||
    checkGlobalState() ||
    !!context.workspaceState.get('DO_NOT_USE_HUBL')
  ) {
    return;
  }
  initHubLAutoDetector(context);
};

const initHubLAutoDetector = (context: ExtensionContext) => {
  const showHublDetectedMessage = () => {
    const hublDetectedMessage = `It looks like this file contains HubL code. Would you like to use HubL for this project?`;
    const hublDetectedYesButton = `Use HubL`;
    const hublDetectedNoButton = 'No';
    const hublDetectedNeverAgainButton = 'Never ask again';

    window
      .showInformationMessage(
        hublDetectedMessage,
        hublDetectedYesButton,
        hublDetectedNoButton,
        hublDetectedNeverAgainButton
      )
      .then((selection) => {
        switch (selection) {
          case hublDetectedYesButton: {
            updateWorkspaceFileAssociation();
            break;
          }
          case hublDetectedNoButton: {
            context.workspaceState.update('DO_NOT_USE_HUBL', true);
            break;
          }
          case hublDetectedNeverAgainButton: {
            workspace
              .getConfiguration(EXTENSION_CONFIG_NAME)
              .update(
                EXTENSION_CONFIG_KEYS.NEVER_USE_HUBL,
                true,
                ConfigurationTarget.Global
              );
            break;
          }
          default: // User closed the dialogue
        }
      });
  };

  const handleTextDocumentOpen = workspace.onDidOpenTextDocument(() => {
    const textDocument = window.activeTextEditor?.document;
    if (!textDocument) {
      return;
    }
    const fileExt = extname(textDocument.fileName);
    if (fileExt !== '.html' && fileExt !== '.css') {
      return;
    }

    let n = 1;
    const limit = Math.min(50, textDocument.lineCount);
    while (n <= limit) {
      const lineWithHubl = textDocument.lineAt(n).text.match(/{{.*}}|{%.*%}/g);
      if (lineWithHubl) {
        showHublDetectedMessage();
        handleTextDocumentOpen.dispose();
        break;
      }
      n++;
    }
  });
};

const updateWorkspaceFileAssociation = () => {
  const filesConfig = workspace.getConfiguration('files');
  const fileAssoc = filesConfig.get('associations') as FileAssociations;
  fileAssoc[`*.html`] = HUBL_HTML_ID;
  fileAssoc[`*.css`] = HUBL_CSS_ID;
  filesConfig.update('associations', fileAssoc);
};

function hasHubLAssociations() {
  // Checks if the current active window has HubL associations
  // Note if the Workspace doesn't have any, it will fallback to the global state
  const filesConfig = workspace.getConfiguration('files');
  const fileAssoc = filesConfig.get('associations') as FileAssociations;
  return (
    fileAssoc['*.html'] === HUBL_HTML_ID && fileAssoc['*.css'] === HUBL_CSS_ID
  );
}

function checkGlobalState() {
  return !!workspace
    .getConfiguration(EXTENSION_CONFIG_NAME)
    .get(EXTENSION_CONFIG_KEYS.NEVER_USE_HUBL);
}
