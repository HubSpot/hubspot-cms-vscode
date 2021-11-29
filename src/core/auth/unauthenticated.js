import axios from 'axios';
import * as vscode from 'vscode';
import { getRequestOptions } from '../requestOptions';
import { ENVIRONMENTS } from '../constants';

const LOCALDEVAUTH_API_AUTH_PATH = 'localdevauth/v1/auth';

async function fetchAccessToken(
  personalAccessKey,
  env = ENVIRONMENTS.PROD,
  portalId
) {
  const params = portalId ? { portalId } : {};

  var data = JSON.stringify({
    encodedOAuthRefreshToken:
      'CiQ3MmU5ZTg1Ny0zMzE1LTQwY2QtYTFlYi02ZDAxMDU1YTU2NDUQ1_p1GK-akwEqGQAF5pGCRKPbGB5FPjDLlDcMxdDzVLVD4wBKA25hMQ',
  });

  var config = {
    method: 'post',
    url: 'https://api.hubapi.com/localdevauth/v1/auth/refresh',
    headers: {
      'Content-Type': 'application/json',
    },
    params,
    data,
  };

  try {
    const authData = await axios(config);
    return authData.data;
  } catch (error) {
    orange.appendLine(JSON.stringify('error'));
  }
}

export { fetchAccessToken };
