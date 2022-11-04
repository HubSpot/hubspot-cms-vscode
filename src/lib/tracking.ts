const {
  getAccountId,
  isTrackingAllowed,
  getAccountConfig,
} = require('@hubspot/cli-lib');
const { trackUsage } = require('@hubspot/cli-lib/api/fileMapper');

export const trackAction = async (action: string, options?: object) => {
  if (!isTrackingAllowed()) {
    return;
  }

  let authType = 'unknown';
  const accountId = getAccountId();

  if (accountId) {
    const accountConfig = getAccountConfig(accountId);
    authType =
      accountConfig && accountConfig.authType
        ? accountConfig.authType
        : 'apikey';
  }

  // TODO - Pass options!
  await trackUsage(
    'vscode-extension-interaction',
    'INTERACTION',
    { authType, action },
    accountId
  );
};
