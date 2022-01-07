import * as vscode from 'vscode';
import { Utils } from 'vscode-uri';
import { validateHubl } from '../core/api/validate';
import { getDefaultAccountConfig } from './config';
import {
  isCodedFile,
  buildAnnotationValueGetter,
  ANNOTATION_KEYS,
} from './templates';
import { isModuleHTMLFile } from './modules';
import {
  TEMPLATE_ERRORS_TYPES,
  VSCODE_SEVERITY,
  HUBL_TAG_DEFINITION_REGEX,
  TEMPLATE_TYPES,
} from './constants';

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

const isFileInWorkspace = async (error, document) => {
  let filePath = error.categoryErrors.fullName || error.categoryErrors.path;

  if (error.category === 'MODULE_NOT_FOUND') {
    filePath = filePath + '.module';
  }

  const dirName = Utils.dirname(document.uri);

  try {
    const x = await vscode.workspace.fs.stat(
      Utils.resolvePath(dirName, filePath)
    );
    return true;
  } catch (e) {
    return false;
  }
};

const clearValidation = (document, collection) => {
  collection.set(document.uri, null);
};

const getRenderingErrors = async (source, context) => {
  const { portalId } = await getDefaultAccountConfig();

  try {
    const { renderingErrors } = await validateHubl(portalId, source, context);
    return renderingErrors;
  } catch (e) {
    console.error('There was an error validating this file');
    console.debug(e);
  }
};

const getTemplateType = (document) => {
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

const updateValidation = async (document, collection) => {
  if (!document) {
    return collection.clear();
  }

  const renderingErrors = await getRenderingErrors(
    document.getText(),
    getTemplateType(document)
  );

  if (!renderingErrors) {
    return clearValidation(document, collection);
  }

  let templateErrors = [];

  for (let i = 0; i < renderingErrors.length; i++) {
    const error = renderingErrors[i];
    if (
      error.reason === TEMPLATE_ERRORS_TYPES.MISSING ||
      error.reason === TEMPLATE_ERRORS_TYPES.BAD_URL
    ) {
      const fileExits = await isFileInWorkspace(error, document);
      if (fileExits) {
        continue;
      }
    }

    templateErrors.push({
      code: '',
      message: error.message,
      range: getRange(document, error),
      severity: vscode.DiagnosticSeverity[VSCODE_SEVERITY[error.reason]],
    });
  }
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

export { triggerValidate };
