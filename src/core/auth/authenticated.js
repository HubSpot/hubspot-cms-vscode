// const http = require('../../http');
import fetch from 'cross-fetch';

const getRequestUri = (options) => {
  return 'https://api.hubapi.com' + options.uri;
};

async function fetchScopeData(accountId, scopeGroup) {
  return fetch(getRequestUri('localdevauth/v1/auth/check-scopes'), {
    query: {
      scopeGroup,
    },
  });
}

module.exports = {
  fetchScopeData,
};
