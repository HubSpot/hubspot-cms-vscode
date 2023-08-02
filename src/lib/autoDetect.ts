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
    optedOutGlobally() ||
    !!context.workspaceState.get('DO_NOT_USE_HUBL')
  ) {
    return;
  }
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
        showHublDetectedMessage(context);
        handleTextDocumentOpen.dispose();
        break;
      }
      n++;
    }
  });
};

const showHublDetectedMessage = (context: ExtensionContext) => {
  const hublDetectedMessage =
    'It looks like this file contains HubL code. Would you like to use HubL for this project?';
  const hublDetectedYesButton = 'Use HubL';
  const hublDetectedNoButton = 'No';
  const hublDetectedNeverAgainButton = 'Never ask again';

  const hubLAssociatedMessage =
    'File associations were successfully updated. HubL will now be used for all HTML and CSS files in this workspace.';
  const noAssociationsMessage =
    'If you would to update your file associations in the future to use the HubL language mode, see the [HubSpot VSCode documentation](https://github.com/HubSpot/hubspot-cms-vscode/tree/master#language-modes).';
  const neverAssociationsMessage =
    "We will no longer ask you if you'd like to use HubL on any files in VSCode. If you'd like to turn back on HubL language auto-detection, you can toggle the 'Never Use Hubl' option in your settings. To manually update file associations, see the [HubSpot VSCode documentation].";

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
          window.showInformationMessage(hubLAssociatedMessage);
          break;
        }
        case hublDetectedNoButton: {
          context.workspaceState.update('DO_NOT_USE_HUBL', true);
          window.showInformationMessage(noAssociationsMessage);
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
          window.showInformationMessage(neverAssociationsMessage);
          break;
        }
        default: // User closed the dialogue
          break;
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

function optedOutGlobally() {
  return !!workspace
    .getConfiguration(EXTENSION_CONFIG_NAME)
    .get(EXTENSION_CONFIG_KEYS.NEVER_USE_HUBL);
}
