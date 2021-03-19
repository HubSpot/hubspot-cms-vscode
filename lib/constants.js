const errors = {
  DISABLED: 'DISABLED',
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  UNKNOWN: 'UNKNOWN',
  BAD_URL: 'UNKNOWN',
  EXCEPTION: 'EXCEPTION',
  MISSING: 'MISSING',
  OTHER: 'OTHER',
};

const WORD_REGEX = /{%.*(.*).*%}/;

module.exports = {
  errors,
  WORD_REGEX
};
