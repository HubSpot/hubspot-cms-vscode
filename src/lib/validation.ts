import {
  window,
  DiagnosticSeverity,
  Position,
  TextDocument,
  DiagnosticCollection,
} from 'vscode';
import { HubspotConfig } from './types';
import { HubLValidationError } from '@hubspot/local-dev-lib/types/HublValidation';

const { validateHubl } = require('@hubspot/local-dev-lib/api/validateHubl');
const { getAccountId } = require('@hubspot/local-dev-lib/config');
const {
  isCodedFile,
  getAnnotationsFromSource,
  ANNOTATION_KEYS,
  TEMPLATE_TYPES
} = require('@hubspot/local-dev-lib/cms/templates');
const { isModuleHTMLFile } = require('@hubspot/local-dev-lib/cms/modules');
const {
  TEMPLATE_ERRORS_TYPES,
  VSCODE_SEVERITY,
  HUBL_TAG_DEFINITION_REGEX,
} = require('./constants');
const fs = require('fs');
const path = require('path');

const getRange = (document: TextDocument, error: HubLValidationError) => {
  const adjustedLineNumber = error.lineno > 0 ? error.lineno - 1 : 0;

  if (error.startPosition > 0) {
    return document.getWordRangeAtPosition(
      new Position(adjustedLineNumber, error.startPosition - 1),
      HUBL_TAG_DEFINITION_REGEX
    );
  } else {
    return document.lineAt(new Position(adjustedLineNumber, 0)).range;
  }
};

const isFileInWorkspace = (error: HubLValidationError) => {
  const activeEditor = window.activeTextEditor;

  if (!activeEditor) {
    return false;
  }

  const pathToActiveFile = activeEditor.document.uri.path;
  const dirToActiveFile = path.dirname(pathToActiveFile);

  let filePath = error.categoryErrors.fullName || error.categoryErrors.path;

  if (error.category === 'MODULE_NOT_FOUND') {
    filePath = filePath + '.module';
  }
  return fs.existsSync(path.normalize(filePath));
};

const clearValidation = (
  document: TextDocument,
  collection: DiagnosticCollection
) => {
  collection.set(document.uri, undefined);
};

const getRenderingErrors = async (source: string, context: object) => {
  try {
    const { renderingErrors } = await validateHubl(
      getAccountId(),
      source,
      context
    );
    return renderingErrors;
  } catch (e) {
    console.error('There was an error validating this file');
  }
};

const getTemplateType = (document: TextDocument) => {
  if (isCodedFile(document.fileName)) {
    const getAnnotationValue = getAnnotationsFromSource(document.getText());
    return {
      is_available_for_new_content:
        getAnnotationValue(ANNOTATION_KEYS.isAvailableForNewContent) != 'false',
      template_type:
        TEMPLATE_TYPES[getAnnotationValue(ANNOTATION_KEYS.templateType)],
      template_path: document.uri.path,
    };
  }
  if (isModuleHTMLFile(document.fileName)) {
    return { context: { module: {} }, module_path: document.fileName };
  }
  return {};
};

const updateValidation = async (
  document: TextDocument,
  collection: DiagnosticCollection
) => {
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

  const resolvedRenderingErrors = renderingErrors.filter(
    (error: HubLValidationError) => {
      if (
        error.reason === TEMPLATE_ERRORS_TYPES.MISSING ||
        error.reason === TEMPLATE_ERRORS_TYPES.BAD_URL
      ) {
        return isFileInWorkspace(error) ? false : true;
      }
      return true;
    }
  );

  const templateErrors = resolvedRenderingErrors.map(
    (error: HubLValidationError) => {
      return {
        code: '',
        message: error.message,
        range: getRange(document, error),
        severity: DiagnosticSeverity[VSCODE_SEVERITY[error.reason]],
      };
    }
  );

  collection.set(document.uri, templateErrors);
};

let timeout: NodeJS.Timeout;
export const triggerValidate = (
  document: TextDocument,
  collection: DiagnosticCollection
) => {
  clearTimeout(timeout);

  if (!['html-hubl', 'css-hubl'].includes(document.languageId)) {
    return clearValidation(document, collection);
  }

  timeout = setTimeout(function () {
    updateValidation(document, collection);
  }, 1000);
};

export const portalNameInvalid = (
  portalName: string,
  config: HubspotConfig
) => {
  if (typeof portalName !== 'string') {
    return 'Portal name must be a string';
  } else if (!portalName.length) {
    return 'Portal name cannot be empty';
  } else if (!/^\S*$/.test(portalName)) {
    return 'Portal name cannot contain spaces';
  }
  return config &&
    (config.portals || [])
      .map((p) => p.name)
      .find((name) => name === portalName)
    ? `${portalName} already exists in config.`
    : false;
};
