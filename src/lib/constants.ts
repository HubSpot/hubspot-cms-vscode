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
  ACCOUNTS_REFRESH: 'hubspot.accounts.refresh',
  AUTHORIZE_ACCOUNT: 'hubspot.auth.onClickAuthorize',
  CONFIG: {
    DELETE_ACCOUNT: 'hubspot.config.deleteAccount',
    RENAME_ACCOUNT: 'hubspot.config.renameAccount',
    SELECT_DEFAULT_ACCOUNT: 'hubspot.config.selectDefaultAccount',
    SET_DEFAULT_ACCOUNT: 'hubspot.config.setDefaultAccount',
  },
  HUBSPOT_CLI: {
    INSTALL: 'hubspot.hs.install',
    UPDATE: 'hubspot.hs.update',
  },
  VERSION_CHECK: {
    HS: 'hubspot.versionCheck.hs',
    HS_LATEST: 'hubspot.versionCheck.hs.latest',
    NPM: 'hubspot.versionCheck.npm',
  },
};

export const EVENTS = {
  ON_CONFIG_FOUND: 'hubspot.auth.onConfigFound',
  ON_CONFIG_UPDATED: 'hubspot.auth.onConfigUpdated',
};

export const TREE_DATA = {
  ACCOUNTS: 'hubspot.treedata.accounts',
  QUICK_LINKS: 'hubspot.treedata.quickLinks',
};

export const POLLING_INTERVALS = {
  SLOW: 60000,
  FAST: 2500,
};
