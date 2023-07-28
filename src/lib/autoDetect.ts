import {
  ExtensionContext,
  workspace,
  window,
  ConfigurationTarget,
} from 'vscode';
import { FileAssociations } from './types';
const { extname } = require('path');
import { HUBL_HTML_ID, HUBL_CSS_ID } from './constants';

/*
Check if the user has BOTH file associations in their workspace - if they do we can stop.
If not, check if they've got the workspaceStorage flag telling us to not bug them. If they do, stop.
If they don't have either, add the event listener for file open to prompt them once we detect HubL.
Once HubL is detected, add either the file associations or the flag depending on how they respond & remove the listener. Handling 'x'-ing out the window without saying either yes or no I'm not sure how we want to handle.
 */

export const initializeHubLAutoDetect = (context: ExtensionContext) => {
  // Check if either both css & html are associated already, or if already said no to HubL.
  if (
    hasFileAssociations() ||
    !context.workspaceState.get('USE_HUBL') ||
    checkGlobalState()
  ) {
    return;
  }

  const handleTextDocumentOpen = workspace.onDidOpenTextDocument(() => {
    const textDocument = window.activeTextEditor?.document;
    if (!textDocument) {
      return;
    }
    const fileExt = extname(textDocument.fileName);
    if (fileExt !== '.html' || fileExt !== '.css') {
      return;
    }

    const limit = textDocument.lineCount;
    let n = 1;
    while (n < 50 && n <= limit) {
      const lineWithHubl = textDocument.lineAt(n).text.match(/{{.*}}|{%.*%}/g);
      if (lineWithHubl) {
        showHublDetectedMessage();
        break;
      }
      n++;
    }
  });

  const updateWorkspaceFileAssociation = () => {
    const filesConfig = workspace.getConfiguration('files');
    const fileAssoc = filesConfig.get('associations') as FileAssociations;
    fileAssoc[`*.html`] = HUBL_HTML_ID;
    fileAssoc[`*.css`] = HUBL_CSS_ID;
    filesConfig.update('associations', fileAssoc);
    context.workspaceState.update('USE_HUBL', true);
  };

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
          }
          case hublDetectedNoButton: {
          }
          case hublDetectedNeverAgainButton: {
            workspace
              .getConfiguration()
              .update('hubspot.neverUseHubL', true, ConfigurationTarget.Global);
          }
          default: {
            // User closed the dialogue "X"
          }
        }
        if (selection === hublDetectedYesButton) {
          updateWorkspaceFileAssociation();
        } else if (selection === hublDetectedNoButton) {
          context.workspaceState.update('USE_HUBL', false);
        }
        handleTextDocumentOpen.dispose();
      });
  };
};

function hasFileAssociations() {
  const filesConfig = workspace.getConfiguration('files');
  const fileAssoc = filesConfig.get('associations') as FileAssociations;
  return (
    fileAssoc['.html'] === HUBL_HTML_ID && fileAssoc['.css'] === HUBL_CSS_ID
  );
}

// Returns true if the user already has global hubl associations, or has asked to never use HubL.
function checkGlobalState() {
  const globalFileAssoc = workspace.getConfiguration(
    'globalValue.files.associations'
  ) as FileAssociations;
  if (
    globalFileAssoc['.html'] === HUBL_HTML_ID &&
    globalFileAssoc['.css'] === HUBL_CSS_ID
  ) {
    return true;
  }

  return !!workspace
    .getConfiguration()
    .get('hubspot.neverUseHubL', ConfigurationTarget.Global);
}
