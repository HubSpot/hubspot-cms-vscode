import {
  ExtensionContext,
  workspace,
  window,
  ConfigurationTarget,
} from 'vscode';
import { FileAssociations } from '../lib/types';
const { extname } = require('path');
import {
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
  HUBL_HTML_ID,
  HUBL_CSS_ID,
  TRACKED_EVENTS,
} from '../lib/constants';
import { trackEvent } from '../lib/tracking';

const DO_NOT_USE_HUBL_KEY = 'DO_NOT_USE_HUBL';

export const initializeHubLAutoDetect = (context: ExtensionContext) => {
  if (
    hasHubLAssociations() ||
    optedOutGlobally() ||
    !!context.workspaceState.get(DO_NOT_USE_HUBL_KEY)
  ) {
    return;
  }

  const checkForHubl = (textDocument: any) => {
    if (!textDocument) {
      return false;
    }
    const fileExt = extname(textDocument.fileName);
    if (fileExt !== '.html' && fileExt !== '.css') {
      return false;
    }

    let n = 0;
    const limit = Math.min(50, textDocument.lineCount);

    // Check the first 50 lines of the document for any HubL code
    while (n < limit) {
      const lineWithHubl = textDocument.lineAt(n).text.match(/{{.*}}|{%.*%}/g);
      if (lineWithHubl) {
        return true;
      }
      n++;
    }
    return false;
  };

  // Check currently active document on initialization
  const activeDocument = window.activeTextEditor?.document;
  if (activeDocument && checkForHubl(activeDocument)) {
    showHublDetectedMessage(context);
    trackEvent(TRACKED_EVENTS.AUTO_DETECT.DETECTED);
    return;
  }

  // Listen for new documents being opened
  const handleTextDocumentOpen = workspace.onDidOpenTextDocument(() => {
    const textDocument = window.activeTextEditor?.document;
    if (checkForHubl(textDocument)) {
      showHublDetectedMessage(context);
      trackEvent(TRACKED_EVENTS.AUTO_DETECT.DETECTED);
      handleTextDocumentOpen.dispose();
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
          trackEvent(TRACKED_EVENTS.AUTO_DETECT.YES);
          break;
        }
        case hublDetectedNoButton: {
          context.workspaceState.update(DO_NOT_USE_HUBL_KEY, true);
          window.showInformationMessage(noAssociationsMessage);
          trackEvent(TRACKED_EVENTS.AUTO_DETECT.NO);
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
          trackEvent(TRACKED_EVENTS.AUTO_DETECT.NEVER);
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
  filesConfig.update('associations', fileAssoc, ConfigurationTarget.Workspace);
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
