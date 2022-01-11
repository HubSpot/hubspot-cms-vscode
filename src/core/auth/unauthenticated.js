import 'cross-fetch/polyfill';
import { getRequestOptions } from '../requestOptions';
import { ENVIRONMENTS } from '../constants';

const LOCALDEVAUTH_API_AUTH_PATH = 'localdevauth/v1/auth';

async function fetchAccessToken(
  personalAccessKey,
  env = ENVIRONMENTS.PROD,
  portalId
) {
  const params = portalId ? { portalId } : {};

  var config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cross-Origin-Resource-Policy': '*',
    },
    body: JSON.stringify({
      encodedOAuthRefreshToken: personalAccessKey,
    }),
  };

  return fetch(
    `https://api.hubapi.com/localdevauth/v1/auth/refresh?${new URLSearchParams(
      params
    ).toString()}`,
    config
  );
}

export { fetchAccessToken };
