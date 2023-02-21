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
  DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL: 'DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL',
  HAS_SEEN_LINTING_MESSAGE: 'HS_HAS_SEEN_LINTING_MESSAGE',
  HAS_SEEN_TELEMETRY_MESSAGE: 'HS_HAS_SEEN_TELEMETRY_MESSAGE',
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
  CREATE: {
    MODULE: 'hubspot.create.module',
    SECTION: 'hubspot.create.section',
    TEMPLATE: 'hubspot.create.template',
    PARTIAL: 'hubspot.create.partial',
    GLOBAL_PARTIAL: 'hubspot.create.globalPartial',
    SERVERLESS_FUNCTION: 'hubspot.create.serverlessFunction',
    SERVERLESS_FUNCTION_FOLDER: 'hubspot.create.serverlessFunctionFolder',
  },
  GLOBAL_STATE: {
    UPDATE_DELAY: 'hubspot.globalState.updateDelay',
  },
  HUBSPOT_CLI: {
    INSTALL: 'hubspot.hs.install',
    UPDATE: 'hubspot.hs.update',
  },
  NOTIFICATIONS: {
    SHOW_FEEDBACK_REQUEST: 'hubspot.notifications.showFeedbackRequest',
  },
  PANELS: {
    OPEN_FEEDBACK_PANEL: 'hubspot.modals.openFeedbackPanel',
  },
  REMOTE_FS: {
    REFRESH: 'hubspot.remoteFs.refresh'
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
  REMOTE: 'hubspot.treedata.remoteFs',
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
  CREATE: {
    MODULE: 'createdModule',
    SECTION: 'createdSection',
    TEMPLATE: 'createdTemplate',
    PARTIAL: 'createdPartial',
    GLOBAL_PARTIAL: 'createdGlobalPartial',
    SERVERLESS_FUNCTION: 'createdServerlessFunction',
    SERVERLESS_FUNCTION_FOLDER: 'createdServerlessFunctionFolder',
  },
  DELETE_ACCOUNT: 'accountDeleted',
  FEEDBACK: {
    FEEDBACK_REQUEST_SHOWN: 'feedbackRequestShown',
    FEEDBACK_REQUEST_DISMISSED: 'feedbackRequestDismissed',
    FEEDBACK_REQUEST_ACCEPTED: 'feedbackRequestAccepted',
    FEEDBACK_PANEL_OPENED: 'feedbackPanelOpened',
    FEEDBACK_PANEL_ERROR: 'feedbackPanelError',
    FEEDBACK_PANEL_SUBMITTED: 'feedbackPanelSubmitted',
  },
  LINTING_ENABLED: 'lintingEnabled',
  LINTING_DISABLED: 'lintingDisabled',
  RENAME_ACCOUNT: 'accountRenamed',
  RENAME_ACCOUNT_ERROR: 'accountRenameError',
  SELECT_DEFAULT_ACCOUNT: 'selectedDefaultAccount',
  SET_DEFAULT_ACCOUNT: 'setDefaultAccountClicked',
  UPDATE_DEFAULT_ACCOUNT: 'defaultAccountUpdated',
};

export const TEMPLATE_NAMES = {
  SECTION: 'section',
  TEMPLATE: 'page-template',
  PARTIAL: 'partial',
  GLOBAL_PARTIAL: 'global-partial',
};
