const vscode = require('vscode');
const { validateHubl } = require('@hubspot/cli-lib/api/validate');
const { getPortalId } = require('@hubspot/cli-lib');
const { isCodedFile, getAnnotationValue } = require('@hubspot/cli-lib/templates');
const {
  TEMPLATE_ERRORS_TYPES,
  VSCODE_SEVERITY,
  HUBL_TAG_DEFINITION_REGEX,
} = require('./constants');
const fs = require('fs');
const path = require('path');

const getRange = (document, error) => {
  const adjustedLineNumber = error.lineno > 0 ? error.lineno - 1 : 0;

  if (error.startPosition > 0) {
    return document.getWordRangeAtPosition(
      new vscode.Position(adjustedLineNumber, error.startPosition - 1),
      HUBL_TAG_DEFINITION_REGEX
    );
  } else {
    return document.lineAt(new vscode.Position(adjustedLineNumber, 0)).range;
  }
};

const isFileInWorkspace = (error) => {
  const pathToActiveFile = vscode.window.activeTextEditor.document.uri.path;
  const dirToActiveFile = path.dirname(pathToActiveFile);

  let filePath = error.categoryErrors.fullName || error.categoryErrors.path;

  if (error.category === 'MODULE_NOT_FOUND') {
    filePath = filePath + '.module';
  }

  return fs.existsSync(path.resolve(dirToActiveFile, filePath));
};

const clearValidation = (document, collection) => {
  collection.set(document.uri, null);
};

const getRenderingErrors = async (source, context) => {
  try {
    const { renderingErrors } = await validateHubl(getPortalId(), source, context);
    return renderingErrors;
  } catch (e) {
    console.error('There was an error validating this file');
  }
};

const updateValidation = async (document, collection) => {
  if (!document) {
    return collection.clear();
  }

  // Todo: move to cli-lib
  const ANNOTATIONS_REGEX = /<!--([\s\S]*?)-->/;
  const getFileAnnotations = (filePath, source) => {
    try {
      const match = source.match(ANNOTATIONS_REGEX);
      const annotation = match && match[1] ? match[1] : '';
      return annotation;
    } catch (err) {
      return '';
    }
  };

  const TEMPLATE_TYPE_ID = {
    'page': 4
  }

  let context = {};
  if (isCodedFile(document.fileName)) {
    const annotations = getFileAnnotations(document.fileName, document.getText())
    context.is_available_for_new_content = getAnnotationValue(annotations, 'isAvailableForNewContent') != 'false'
    context.tempalate_type = TEMPLATE_TYPE_ID[getAnnotationValue(annotations, 'templateType')]
  }

  if (document.fileName.indexOf('.module') > -1) {
    context = { context: { module: {} } };
  }

  // let context;
  // if .html and not modle, get annotations and pass template type to validator
  // if .html and in module folder, get meta data and fields?
  // if other file, try to match file ext with tempalte type

  const renderingErrors = await getRenderingErrors(document.getText(), context);

  if (!renderingErrors) {
    return clearValidation(document, collection);
  }

  const resolvedRenderingErrors = renderingErrors.filter((error) => {
    if (
      error.reason === TEMPLATE_ERRORS_TYPES.MISSING ||
      error.reason === TEMPLATE_ERRORS_TYPES.BAD_URL
    ) {
      return isFileInWorkspace(error) ? false : true;
    }
    return true;
  });

  const templateErrors = resolvedRenderingErrors.map((error) => {
    return {
      code: '',
      message: error.message,
      range: getRange(document, error),
      severity: vscode.DiagnosticSeverity[VSCODE_SEVERITY[error.reason]],
    };
  });

  collection.set(document.uri, templateErrors);
};

let timeout = null;
const triggerValidate = (document, collection) => {
  clearTimeout(timeout);

  if (!['html-hubl', 'css-hubl'].includes(document.languageId)) {
    return clearValidation(document, collection);
  }

  timeout = setTimeout(function () {
    updateValidation(document, collection);
  }, 1000);
};

module.exports = { triggerValidate };
