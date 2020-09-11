const vscode = require('vscode');

const autoDetectHubl = (context) => {
  const getHublPreference = context.workspaceState.get('USE_HUBL');
  const htmlFileAssociation = vscode.workspace
    .getConfiguration('files')
    .get('associations')['*.html'];

  // context.workspaceState.update('USE_HUBL', null)
  if (getHublPreference === false || htmlFileAssociation === 'hubl') {
    return;
  }

  const showHublDetectedMessage = () => {
    const hublDetectedMessage =
      'It looks like this file contains HubL code. Would you like to use HubL for all .html files in this project?';
    const hublDetectedYesButton = 'Use HubL for .html files';
    const hublDetectedNoButton = 'No';

    vscode.window
      .showInformationMessage(
        hublDetectedMessage,
        hublDetectedYesButton,
        hublDetectedNoButton
      )
      .then((selection) => {
        if (selection === hublDetectedYesButton) {
          updateWorkspaceFileAssociation();
        } else if (selection === hublDetectedNoButton) {
          context.workspaceState.update('USE_HUBL', false);
        }
        handleTextDocumentOpen.dispose();
      });
  };

  const updateWorkspaceFileAssociation = () => {
    const editorConfig = vscode.workspace.getConfiguration('files');
    const workspaceFileAssociations = editorConfig.get('associations');

    workspaceFileAssociations['*.html'] = 'hubl';
    editorConfig.update('associations', workspaceFileAssociations);
  };

  const handleTextDocumentOpen = vscode.workspace.onDidOpenTextDocument(() => {
    const textDocument = vscode.window.activeTextEditor.document;

    let n = 1;
    while (n < 50 && n <= textDocument.lineCount) {
      const lineWithHubl = textDocument.lineAt(n).text.match(/{{.*}}|{%.*%}/g);

      if (lineWithHubl) {
        showHublDetectedMessage();
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
