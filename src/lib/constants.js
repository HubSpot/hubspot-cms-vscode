const TEMPLATE_ERRORS_TYPES = {
  DISABLED: 'DISABLED',
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  UNKNOWN: 'UNKNOWN',
  BAD_URL: 'BAD_URL',
  EXCEPTION: 'EXCEPTION',
  MISSING: 'MISSING',
  OTHER: 'OTHER',
};

const VSCODE_SEVERITY = {
  DISABLED: 'Information',
  SYNTAX_ERROR: 'Error',
  UNKNOWN: 'Error',
  BAD_URL: 'Warning',
  EXCEPTION: 'Error',
  MISSING: 'Warning',
  OTHER: 'Information',
};

const EXTENSION_CONFIG_NAME = 'hubspot';

const EXTENSION_CONFIG_KEYS = {
  BETA: 'beta',
};

const GLOBAL_STATE_KEYS = {
  HAS_SEEN_LINTING_MESSAGE: 'HS_HAS_SEEN_LINTING_MESSAGE',
};

// Used when VS Code attempts to find the correct range of characters to select
const HUBL_TAG_DEFINITION_REGEX = /{%.*(.*).*%}/;

module.exports = {
  TEMPLATE_ERRORS_TYPES,
  VSCODE_SEVERITY,
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
  GLOBAL_STATE_KEYS,
  HUBL_TAG_DEFINITION_REGEX,
};
