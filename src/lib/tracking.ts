const {
  getAccountId,
  isTrackingAllowed,
  getAccountConfig,
} = require('@hubspot/cli-lib');
const { trackUsage } = require('@hubspot/cli-lib/api/fileMapper');

const trackAction = async (action: string) => {
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

  await trackUsage(
    'vscode-extension-interaction',
    'INTERACTION',
    { authType, action },
    accountId
  );
};

module.exports = {
  trackAction,
};
