import 'cross-fetch/polyfill';
import { URLSearchParams } from 'url';
import { accessTokenForPersonalAccessKey } from './auth/personalAccessKey';
import { getConfig } from './config';
import { getRequestOptions } from './requestOptions';

// const {
//   FileSystemErrorContext,
//   logFileSystemErrorInstance,
// } = require('./errorHandlers/fileSystemErrors');

const withPersonalAccessKey = async (
  accountId,
  accountConfig,
  requestOptions
) => {
  const { headers } = requestOptions;
  const accessToken = await accessTokenForPersonalAccessKey(accountId);

  return {
    ...requestOptions,
    withCredentials: true,
    headers: {
      ...headers,
      Authorization: `Bearer ${accessToken}`,
    },
  };
};

const withPortalId = (portalId, requestOptions) => {
  const { params } = requestOptions;

  return {
    ...requestOptions,
    params: {
      ...params,
      portalId,
    },
  };
};

const withAuth = async (accountId, options) => {
  const accountConfig = getConfig(accountId);
  const env = 'prod';
  // const { env } = accountConfig;
  const requestOptions = withPortalId(
    accountId,
    getRequestOptions({ env: 'prod' }, options)
  );

  return withPersonalAccessKey(accountId, accountConfig, requestOptions);
};

const addQueryParams = (requestOptions, additionalParams = {}) => {
  const { params } = requestOptions;
  return {
    ...requestOptions,
    params: {
      ...params,
      ...additionalParams,
    },
  };
};

const getRequest = async (accountId, options) => {
  const { uri, query, ...rest } = options;
  const requestOptions = addQueryParams(rest, query);

  const requestConfig = {
    timeout: 15000,
    method: 'GET',
    ...(await withAuth(accountId, requestOptions)),
  };

  return fetch('https://api.hubapi.com/' + uri, requestConfig);
};

const postRequest = async (accountId, options) => {
  const { uri, body, query, ...rest } = options;
  const requestOptions = addQueryParams(rest, query);
  const { params, ...rconfig } = await withAuth(accountId, requestOptions);

  const requestConfig = {
    timeout: 15000,
    method: 'POST',
    body: JSON.stringify(body),
    ...rconfig,
  };

  const response = await fetch(
    'https://api.hubapi.com/' +
      uri +
      '?' +
      new URLSearchParams(params).toString(),
    requestConfig
  );

  if (response.status >= 400) {
    throw new Error('Bad response from server');
  }

  const x = await response.json();
  return;
};

const putRequest = async (accountId, options) => {
  // TODO: implement
};

const patchRequest = async (accountId, options) => {
  // TODO: implement
};

const deleteRequest = async (accountId, options) => {
  // TODO: implement
};

export {
  getRequest as get,
  postRequest as post,
  putRequest as put,
  patchRequest as patch,
  deleteRequest as delete,
};
