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
  ALLOW_USAGE_TRACKING: 'allowUsageTracking',
};

export const GLOBAL_STATE_KEYS = {
  HAS_SEEN_LINTING_MESSAGE: 'HS_HAS_SEEN_LINTING_MESSAGE',
};

// Used when VS Code attempts to find the correct range of characters to select
export const HUBL_TAG_DEFINITION_REGEX = /{%.*(.*).*%}/;

export const COMMANDS = {
  ACCOUNT: {
    VIEW_PERSONAL_ACCESS_KEY: 'hubspot.account.viewPersonalAccessKey',
  },
  ACCOUNTS_REFRESH: 'hubspot.accounts.refresh',
  AUTHORIZE_ACCOUNT: 'hubspot.auth.onClickAuthorize',
  CONFIG: {
    DELETE_ACCOUNT: 'hubspot.config.deleteAccount',
    RENAME_ACCOUNT: 'hubspot.config.renameAccount',
    SELECT_DEFAULT_ACCOUNT: 'hubspot.config.selectDefaultAccount',
    SET_DEFAULT_ACCOUNT: 'hubspot.config.setDefaultAccount',
  },
  CREATE_MODULE: 'hubspot.create.module',
  CREATE_SERVERLESS_FUNCTION_FOLDER: 'hubspot.create.serverlessFunctionFolder',
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
  HELP_AND_FEEDBACK: 'hubspot.treedata.helpAndFeedback',
};

export const POLLING_INTERVALS = {
  SLOW: 60000,
  FAST: 2500,
};

export const TRACKED_EVENTS = {
  ACTIVATE: 'activated',
  AUTH_INITIALIZE_CONFIG: 'authInitializedConfig',
  AUTH_UPDATE_CONFIG: 'authUpdatedConfig',
  AUTHORIZE_ACCOUNT_CLICKED: 'authorizeAccountClicked',
  CREATE_MODULE: 'createdModule',
  DELETE_ACCOUNT: 'accountDeleted',
  LINTING_ENABLED: 'lintingEnabled',
  LINTING_DISABLED: 'lintingDisabled',
  RENAME_ACCOUNT: 'accountRenamed',
  RENAME_ACCOUNT_ERROR: 'accountRenameError',
  SELECT_DEFAULT_ACCOUNT: 'selectedDefaultAccount',
  SET_DEFAULT_ACCOUNT: 'setDefaultAccountClicked',
  UPDATE_DEFAULT_ACCOUNT: 'defaultAccountUpdated',
};
