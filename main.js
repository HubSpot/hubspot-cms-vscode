const vscode = require('vscode');
const { extname } = require('path');

const autoDetectHubl = (context) => {
  const languages = {
    ".html": "hubl-html",
    ".css": "hubl-css"
  }
  const getHublPreference = context.workspaceState.get('USE_HUBL');
  const htmlFileAssociation = vscode.workspace
    .getConfiguration('files')
    .get('associations')['*.html'];

  // context.workspaceState.update('USE_HUBL', null)
  if (getHublPreference === false || htmlFileAssociation === 'hubl') {
    return;
  }

  const showHublDetectedMessage = (extension) => {
    const hublDetectedMessage = (extension) => {
     return `It looks like this file contains HubL code. Would you like to use HubL for all ${extension} files in this project?`;
    }
    const hublDetectedYesButton = `Use HubL for ${extension} files`;
    const hublDetectedNoButton = 'No';

    vscode.window
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

  const updateWorkspaceFileAssociation = (extension) => {
    const editorConfig = vscode.workspace.getConfiguration('files');
    const workspaceFileAssociations = editorConfig.get('associations');

    workspaceFileAssociations[`*${extension}`] = languages[extension];
    editorConfig.update('associations', workspaceFileAssociations);
  };

  const handleTextDocumentOpen = vscode.workspace.onDidOpenTextDocument(() => {
    const textDocument = vscode.window.activeTextEditor.document;
    const fileExtension = extname(textDocument.fileName);
    let n = 1;
    while (n < 50 && n <= textDocument.lineCount) {
      const lineWithHubl = textDocument.lineAt(n).text.match(/{{.*}}|{%.*%}/g);

      if (lineWithHubl) {
        showHublDetectedMessage(fileExtension);
        break;
      }
      n++;
    }
  });
};

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  vscode.languages.setLanguageConfiguration('hubl', {
    indentationRules: {
      decreaseIndentPattern: /.*{%(.*?end).*%}*./,
      increaseIndentPattern: /.*{%(?!.*end).*%}.*/,
    },
  });

  autoDetectHubl(context);
}

function deactivate() {}

// eslint-disable-next-line no-undef
module.exports = {
  activate,
  deactivate,
};
