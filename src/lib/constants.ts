export const VSCODE_SEVERITY = {
  DISABLED: 'Information',
  SYNTAX_ERROR: 'Error',
  UNKNOWN: 'Error',
  BAD_URL: 'Warning',
  EXCEPTION: 'Error',
  MISSING: 'Warning',
  OTHER: 'Information',
} as const;

export const EXTENSION_CONFIG_NAME = 'hubspot';
export const HUBL_HTML_ID = 'html-hubl';
export const HUBL_CSS_ID = 'css-hubl';

export const EXTENSION_CONFIG_KEYS = {
  BETA: 'beta',
  HUBL_LINTING: 'hublLinting',
  NEVER_USE_HUBL: 'neverUseHubl',
};

export const GLOBAL_STATE_KEYS = {
  DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL: 'DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL',
  HAS_SEEN_LINTING_MESSAGE: 'HS_HAS_SEEN_LINTING_MESSAGE',
  HAS_SEEN_TELEMETRY_MESSAGE: 'HS_HAS_SEEN_TELEMETRY_MESSAGE',
};

// Constants that are used to register user-facing commands with VS Code (configured in package.json)
export const COMMANDS = {
  ACCOUNT: {
    AUTHORIZE: 'hubspot.account.onClickAuthorize',
    OPEN_DESIGN_MANAGER: 'hubspot.account.openDesignManager',
    VIEW_PERSONAL_ACCESS_KEY: 'hubspot.account.viewPersonalAccessKey',
  },
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
  HUBSPOT_CLI: {
    INSTALL: 'hubspot.hs.install',
    UPDATE: 'hubspot.hs.update',
  },
  PANELS: {
    OPEN_FEEDBACK_PANEL: 'hubspot.modals.openFeedbackPanel',
  },
  REMOTE_FS: {
    HARD_REFRESH: 'hubspot.remoteFs.hardRefresh',
    FETCH: 'hubspot.remoteFs.fetch',
    DELETE: 'hubspot.remoteFs.delete',
    UPLOAD: 'hubspot.remoteFs.upload',
    WATCH: 'hubspot.remoteFs.watch',
    END_WATCH: 'hubspot.remoteFs.endWatch',
  },
};

// Constants that are used to register internal events with VS Code (not configured in package.json)
export const EVENTS = {
  ACCOUNT: {
    REFRESH: 'hubspot.accounts.refresh',
  },
  CONFIG: {
    ON_CONFIG_FOUND: 'hubspot.auth.onConfigFound',
    ON_CONFIG_UPDATED: 'hubspot.auth.onConfigUpdated',
  },
  GLOBAL_STATE: {
    UPDATE_DELAY: 'hubspot.globalState.updateDelay',
  },
  NOTIFICATIONS: {
    SHOW_FEEDBACK_REQUEST: 'hubspot.notifications.showFeedbackRequest',
  },
  REMOTE_FS: {
    INVALIDATE_CACHE: 'hubspot.remoteFs.invalidateCache',
    REFRESH: 'hubspot.remoteFs.refresh',
    START_WATCH: 'hubspot.remoteFs.startWatch',
  },
};

export const PROVIDERS = {
  TREE_DATA: {
    ACCOUNTS: 'hubspot.treedata.accounts',
    HELP_AND_FEEDBACK: 'hubspot.treedata.helpAndFeedback',
    REMOTE: 'hubspot.treedata.remoteFs',
  },
};

export const INTERVALS = {
  POLLING: {
    SLOW: 60000,
    FAST: 2500,
  },
  DEBOUNCE: 250,
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
  REMOTE_FS: {
    WATCH: 'remoteFsWatch',
    UPLOAD_FILE: 'remoteFsUploadFile',
    UPLOAD_FOLDER: 'remoteFsUploadFolder',
    DELETE: 'remoteFsDelete',
    FETCH: 'remoteFsFetch',
  },
  RENAME_ACCOUNT: 'accountRenamed',
  RENAME_ACCOUNT_ERROR: 'accountRenameError',
  SELECT_DEFAULT_ACCOUNT: 'selectedDefaultAccount',
  SET_DEFAULT_ACCOUNT: 'setDefaultAccountClicked',
  UPDATE_DEFAULT_ACCOUNT: 'defaultAccountUpdated',
  AUTO_DETECT: {
    DETECTED: 'hublDetected',
    YES: 'useHubl',
    NO: 'doNotUseHubl',
    NEVER: 'neverUseHubl',
  },
};

export const IDE_NAMES = {
  CURSOR: 'cursor',
  VSCODE: 'vscode',
} as const;
