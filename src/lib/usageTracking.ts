import { getDefaultAccountConfig } from './config';
import { trackUsage } from '../core/api/dfs/v1';

const trackAction = async (action: string) => {
  // TODO:
  // if (!isTrackingAllowed()) {
  //   return;

  const { portalId: accountId, authType } = getDefaultAccountConfig();

  await trackUsage(
    'vscode-extension-interaction',
    'INTERACTION',
    { authType: authType || 'apikey', action },
    accountId
  );
};

export { trackAction };
