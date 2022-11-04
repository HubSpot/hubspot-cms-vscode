const vscode = require('vscode');
const { validateHubl } = require('@hubspot/cli-lib/api/validate');
const { getPortalId } = require('@hubspot/cli-lib');

const { TEMPLATE_TYPES } = require('@hubspot/cli-lib/lib/constants');
const {
  isCodedFile,
  buildAnnotationValueGetter,
  ANNOTATION_KEYS,
} = require('@hubspot/cli-lib/templates');
const { isModuleHTMLFile } = require('@hubspot/cli-lib/modules');
const {
  TEMPLATE_ERRORS_TYPES,
  VSCODE_SEVERITY,
  HUBL_TAG_DEFINITION_REGEX,
} = require('./constants');
const fs = require('fs');
const path = require('path');

const getRange = (document: any, error: any) => {
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

const isFileInWorkspace = (error: any) => {
  const pathToActiveFile = vscode.window.activeTextEditor.document.uri.path;
  const dirToActiveFile = path.dirname(pathToActiveFile);

  let filePath = error.categoryErrors.fullName || error.categoryErrors.path;

  if (error.category === 'MODULE_NOT_FOUND') {
    filePath = filePath + '.module';
  }

  return fs.existsSync(path.resolve(dirToActiveFile, filePath));
};

const clearValidation = (document: any, collection: any) => {
  collection.set(document.uri, null);
};

const getRenderingErrors = async (source: any, context: any) => {
  try {
    const { renderingErrors } = await validateHubl(
      getPortalId(),
      source,
      context
    );
    return renderingErrors;
  } catch (e) {
    console.error('There was an error validating this file');
  }
};

const getTemplateType = (document: any) => {
  if (isCodedFile(document.fileName)) {
    const getAnnotationValue = buildAnnotationValueGetter(document.getText());
    return {
      is_available_for_new_content:
        getAnnotationValue(ANNOTATION_KEYS.isAvailableForNewContent) != 'false',
      tempalate_type:
        TEMPLATE_TYPES[getAnnotationValue(ANNOTATION_KEYS.templateType)],
    };
  }
  if (isModuleHTMLFile(document.fileName)) {
    return { context: { module: {} }, module_path: document.fileName };
  }
  return {};
};

const updateValidation = async (document: any, collection: any) => {
  if (!document) {
    return collection.clear();
  }

  const templateContext = getTemplateType(document);
  const renderingErrors = await getRenderingErrors(
    document.getText(),
    templateContext
  );

  if (!renderingErrors) {
    return clearValidation(document, collection);
  }

  const resolvedRenderingErrors = renderingErrors.filter((error: any) => {
    if (
      error.reason === TEMPLATE_ERRORS_TYPES.MISSING ||
      error.reason === TEMPLATE_ERRORS_TYPES.BAD_URL
    ) {
      return isFileInWorkspace(error) ? false : true;
    }
    return true;
  });

  const templateErrors = resolvedRenderingErrors.map((error: any) => {
    return {
      code: '',
      message: error.message,
      range: getRange(document, error),
      severity: vscode.DiagnosticSeverity[VSCODE_SEVERITY[error.reason]],
    };
  });

  collection.set(document.uri, templateErrors);
};

let timeout: NodeJS.Timeout;
export const triggerValidate = (document: any, collection: any) => {
  clearTimeout(timeout);

  if (!['html-hubl', 'css-hubl'].includes(document.languageId)) {
    return clearValidation(document, collection);
  }

  timeout = setTimeout(function () {
    updateValidation(document, collection);
  }, 1000);
};
