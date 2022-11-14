export const TEMPLATE_ERRORS_TYPES = {
  DISABLED: 'DISABLED',
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  UNKNOWN: 'UNKNOWN',
  BAD_URL: 'BAD_URL',
  EXCEPTION: 'EXCEPTION',
  MISSING: 'MISSING',
  OTHER: 'OTHER',
};

export const VSCODE_SEVERITY = {
  DISABLED: 'Information',
  SYNTAX_ERROR: 'Error',
  UNKNOWN: 'Error',
  BAD_URL: 'Warning',
  EXCEPTION: 'Error',
  MISSING: 'Warning',
  OTHER: 'Information',
};

export const EXTENSION_CONFIG_NAME = 'hubspot';

export const EXTENSION_CONFIG_KEYS = {
  BETA: 'beta',
  HUBL_LINTING: 'hublLinting',
};

export const GLOBAL_STATE_KEYS = {
  HAS_SEEN_LINTING_MESSAGE: 'HS_HAS_SEEN_LINTING_MESSAGE',
};

// Used when VS Code attempts to find the correct range of characters to select
export const HUBL_TAG_DEFINITION_REGEX = /{%.*(.*).*%}/;

export const COMMANDS = {
  CONFIG_SET_DEFAULT_ACCOUNT: 'hubspot.config.setDefaultAccount',
  CONFIG_SELECT_DEFAULT_ACCOUNT: 'hubspot.config.selectDefaultAccount',
  CONFIG_DELETE_ACCOUNT: 'hubspot.config.deleteAccount',
  PORTALS_REFRESH: 'hubspot.portals.refresh',
};

export const TREE_DATA = {
  PORTALS: 'hubspot.treedata.portals',
};
