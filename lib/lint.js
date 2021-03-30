const vscode = require('vscode');
const { validateHubl } = require('@hubspot/cli-lib/api/validate');
const { getPortalId } = require('@hubspot/cli-lib');
const {
  TEMPLATE_ERRORS_TYPES,
  VSCODE_SEVERITY,
  WORD_REGEX,
} = require('./constants');
const fs = require('fs');
const path = require('path');

const getRange = (document, error) => {
  const adjustedLineNumber = error.lineno > 0 ? error.lineno - 1 : 0;

  if (error.startPosition > 0) {
    return document.getWordRangeAtPosition(
      new vscode.Position(adjustedLineNumber, error.startPosition - 1),
      WORD_REGEX
    );
  } else {
    return document.lineAt(new vscode.Position(adjustedLineNumber, 0)).range;
  }
};

async function updateDiagnostics(document, collection) {
  if (!document) {
    return collection.clear();
  }

  const { renderingErrors } = await validateHubl(
    getPortalId(),
    document.getText()
  );

  const isFileInWorkspace = (error) => {
    const pathToActiveFile = vscode.window.activeTextEditor.document.uri.path;
    const dirToActiveFile = path.dirname(pathToActiveFile);

    let filePath = error.categoryErrors.fullName || error.categoryErrors.path;

    if (error.category === 'MODULE_NOT_FOUND') {
      filePath = filePath + '.module';
    }

    return fs.existsSync(path.resolve(dirToActiveFile, filePath));
  };

  const fitleredErrors = renderingErrors.filter((error) => {
    if (
      error.reason === TEMPLATE_ERRORS_TYPES.MISSING ||
      error.reason === TEMPLATE_ERRORS_TYPES.BAD_URL
    ) {
      return isFileInWorkspace(error) ? false : true;
    }
    return true;
  });

  const templateErrors = fitleredErrors.map((error) => {
    console.log(error)
    return {
      code: '',
      message: error.message,
      range: getRange(document, error),
      severity: vscode.DiagnosticSeverity[VSCODE_SEVERITY[error.reason]],
    };
  });

  collection.set(document.uri, templateErrors);
}

const collection = vscode.languages.createDiagnosticCollection('hubl');
let documentChangeListener;

const enableLinting = () => {
  let timeout = null;

  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document, collection);
  }

  documentChangeListener = vscode.workspace.onDidChangeTextDocument(
    (editor) => {
      if (editor) {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          updateDiagnostics(editor.document, collection);
        }, 1000);
      }
    }
  );
};

const disableLinting = () => {
  // Clear out any existing diagnostics
  collection.clear();
  // Remove onDidChangeTextDocument event listener
  documentChangeListener.dispose();
};

module.exports = { enableLinting, disableLinting };
