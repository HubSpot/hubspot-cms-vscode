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
  HUBL_LINTING: 'hublLinting',
};

const GLOBAL_STATE_KEYS = {
  HAS_SEEN_LINTING_MESSAGE: 'HS_HAS_SEEN_LINTING_MESSAGE',
};

// Used when VS Code attempts to find the correct range of characters to select
const HUBL_TAG_DEFINITION_REGEX = /{%.*(.*).*%}/;

const TEMPLATE_TYPES = {
  unmapped: 0,
  email_base_template: 1,
  email: 2,
  landing_page_base_template: 3,
  landing_page: 4,
  blog_base: 5,
  blog: 6,
  blog_listing: 42,
  site_page: 8,
  blog_listing_context: 9,
  blog_post_context: 10,
  error_page: 11,
  subscription_preferences: 12,
  unsubscribe_confirmation: 13,
  unsubscribe_simple: 14,
  optin_email: 15,
  optin_followup_email: 16,
  optin_confirmation_page: 17,
  global_group: 18,
  password_prompt_page: 19,
  resubscribe_email: 20,
  unsubscribe_confirmation_email: 21,
  resubscribe_confirmation_email: 22,
  custom_module: 23,
  css: 24,
  js: 25,
  search_results: 27,
  membership_login: 29,
  membership_register: 30,
  membership_reset: 31,
  membership_reset_request: 32,
  drag_drop_email: 34,
  knowledge_article: 35,
  membership_email: 36,
  section: 37,
  global_content_partial: 38,
  simple_landing_page_template: 39,
  proposal: 40,
  blog_post: 41,
  quote: 43,
};

export {
  TEMPLATE_ERRORS_TYPES,
  VSCODE_SEVERITY,
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
  GLOBAL_STATE_KEYS,
  HUBL_TAG_DEFINITION_REGEX,
  TEMPLATE_TYPES,
};
