import {
  window,
  DiagnosticSeverity,
  Position,
  TextDocument,
  DiagnosticCollection,
  Diagnostic,
  Range,
} from 'vscode';
import { HubSpotConfig } from '@hubspot/local-dev-lib/types/Config';
import { HubSpotConfigAccount } from '@hubspot/local-dev-lib/types/Accounts';
import { HubLValidationError } from '@hubspot/local-dev-lib/types/HublValidation';
import { validateHubl } from '@hubspot/local-dev-lib/api/validateHubl';
import { getConfigDefaultAccountIfExists } from '@hubspot/local-dev-lib/config';
const {
  isCodedFile,
  getAnnotationValue,
  ANNOTATION_KEYS,
  TEMPLATE_TYPES,
} = require('@hubspot/local-dev-lib/cms/templates');
const { isModuleHTMLFile } = require('@hubspot/local-dev-lib/cms/modules');
import {
  TEMPLATE_ERRORS_TYPES,
  VSCODE_SEVERITY,
  HUBL_TAG_DEFINITION_REGEX,
} from './constants';
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
    const account = getConfigDefaultAccountIfExists();
    if (!account?.accountId) {
      return;
    }
    const {
      data: { renderingErrors },
    } = await validateHubl(account.accountId, source, context);
    return renderingErrors;
  } catch (e) {
    console.error('There was an error validating this file');
  }
};

const getTemplateTypeValue = (type: string | null): number => {
  if (!type || !(type in TEMPLATE_TYPES)) {
    return TEMPLATE_TYPES.unmapped;
  }
  return TEMPLATE_TYPES[type as keyof typeof TEMPLATE_TYPES];
};

const getTemplateType = (document: TextDocument) => {
  if (isCodedFile(document.fileName)) {
    const source = document.getText();
    return {
      is_available_for_new_content:
        getAnnotationValue(source, ANNOTATION_KEYS.isAvailableForNewContent) !=
        'false',
      template_type: getTemplateTypeValue(
        getAnnotationValue(source, ANNOTATION_KEYS.templateType)
      ),
      template_path: document.uri.path,
    };
  }
  if (isModuleHTMLFile(document.fileName)) {
    return { context: { module: {} }, module_path: document.fileName };
  }
  return {};
};

const isValidTemplateError = (
  reason: string
): reason is keyof typeof TEMPLATE_ERRORS_TYPES => {
  return Object.values(TEMPLATE_ERRORS_TYPES).includes(reason);
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

  const templateErrors: Diagnostic[] = resolvedRenderingErrors.map(
    (error: HubLValidationError) => {
      const severity = isValidTemplateError(error.reason)
        ? DiagnosticSeverity[VSCODE_SEVERITY[error.reason]]
        : DiagnosticSeverity.Error;
      return {
        code: '',
        message: error.message,
        range: getRange(document, error) || new Range(0, 0, 0, 0),
        severity,
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
  config: HubSpotConfig | null
) => {
  if (typeof portalName !== 'string') {
    return 'Portal name must be a string';
  } else if (!portalName.length) {
    return 'Portal name cannot be empty';
  } else if (!/^\S*$/.test(portalName)) {
    return 'Portal name cannot contain spaces';
  }
  return config &&
    'portals' in config &&
    (config.accounts || [])
      .map((p: HubSpotConfigAccount) => p.name)
      .find((name: string | undefined) => name === portalName)
    ? `${portalName} already exists in config.`
    : '';
};
