import { ExtensionContext, workspace, window, languages } from 'vscode';
const { extname } = require('path');

interface FileAssociations {
  [key: string]: string;
}

export const initializeHubLAutoDetect = (context: ExtensionContext) => {
  languages.setLanguageConfiguration('hubl', {
    indentationRules: {
      decreaseIndentPattern: /.*{%(.*?end).*%}*./,
      increaseIndentPattern: /.*{%(?!.*end).*%}.*/,
    },
  });
  const languageExtensions = {
    '.html': 'html-hubl',
    '.css': 'css-hubl',
  };
  const getHublPreference = context.workspaceState.get('USE_HUBL');

  const filesConfig = workspace.getConfiguration('files');
  const fileAssoc = filesConfig.get('associations') as FileAssociations;
  context.workspaceState.update('USE_HUBL', null);

  const showHublDetectedMessage = (extension: '.html' | '.css') => {
    const hublDetectedMessage = (extension: '.html' | '.css') => {
      return `It looks like this file contains HubL code. Would you like to use HubL for all ${extension} files in this project?`;
    };
    const hublDetectedYesButton = `Use HubL for ${extension} files`;
    const hublDetectedNoButton = 'No';

    window
      .showInformationMessage(
        hublDetectedMessage(extension),
        hublDetectedYesButton,
        hublDetectedNoButton
      )
      .then((selection) => {
        if (selection === hublDetectedYesButton) {
          updateWorkspaceFileAssociation(extension);
        } else if (selection === hublDetectedNoButton) {
          context.workspaceState.update('USE_HUBL', false);
        }
        handleTextDocumentOpen.dispose();
      });
  };

  const updateWorkspaceFileAssociation = (extension: '.html' | '.css') => {
    fileAssoc[`*${extension}`] = languageExtensions[extension];
    filesConfig.update('associations', fileAssoc);
  };

  const handleTextDocumentOpen = workspace.onDidOpenTextDocument(() => {
    const textDocument = window.activeTextEditor?.document;
    if (!textDocument) {
      return;
    }
    const fileExt = extname(textDocument.fileName);
    if (
      getHublPreference === false ||
      (fileExt === '.html' && fileAssoc['*.html'] === 'html-hubl') ||
      (fileExt === '.css' && fileAssoc['*.css'] === 'css-hubl')
    ) {
      return;
    }
    let n = 1;
    while (n < 50 && n <= textDocument.lineCount) {
      const lineWithHubl = textDocument.lineAt(n).text.match(/{{.*}}|{%.*%}/g);
      if (lineWithHubl) {
        showHublDetectedMessage(fileExt);
        break;
      }
      n++;
    }
  });
};
