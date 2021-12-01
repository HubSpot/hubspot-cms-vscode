import axios from 'axios';
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

const http = axios.create({
  baseURL: 'https://api.hubapi.com',
  timeout: 1000,
});

const getRequest = async (accountId, options) => {
  const { uri, query, ...rest } = options;
  const requestOptions = addQueryParams(rest, query);

  const requestConfig = {
    url: uri,
    method: 'get',
    ...(await withAuth(accountId, requestOptions)),
  };
  return http(requestConfig);
};

const postRequest = async (accountId, options) => {
  const { uri, query, ...rest } = options;
  const requestOptions = addQueryParams(rest, query);

  const requestConfig = {
    url: uri,
    method: 'post',
    ...(await withAuth(accountId, requestOptions)),
  };

  return http(requestConfig);
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
