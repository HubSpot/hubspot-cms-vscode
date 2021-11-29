// Can't import json like require
// import { version } from '../package.json';
const version = 'test';

const DEFAULT_USER_AGENT_HEADERS = {
  'User-Agent': `HubSpot CLI/${version}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const getRequestOptions = (options = {}, requestOptions = {}) => {
  const { env } = options;

  return {
    headers: {
      ...DEFAULT_USER_AGENT_HEADERS,
    },
    ...requestOptions,
  };
};

export { getRequestOptions, DEFAULT_USER_AGENT_HEADERS };
