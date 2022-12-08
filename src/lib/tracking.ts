import { env, version, workspace } from 'vscode';
import { platform, release } from 'os';
import { EXTENSION_CONFIG_NAME, EXTENSION_CONFIG_KEYS } from './constants';

const {
  getAccountId,
  isTrackingAllowed,
  getAccountConfig,
} = require('@hubspot/cli-lib');
const { trackUsage } = require('@hubspot/cli-lib/api/fileMapper');

export const getUserIdentificationInformation = () => {
  return {
    extensionName: 'hubspot.hubl',
    language: env.language,
    machineId: env.machineId,
    os: `${platform()} ${release()}`,
    shell: env.shell,
    source: env.appName,
    vscodeVersion: version,
  };
};

export const trackAction = async (action: string, options?: object) => {
  if (
    !isTrackingAllowed() ||
    !workspace.getConfiguration().telemetry.enableTelemetry ||
    !workspace
      .getConfiguration(EXTENSION_CONFIG_NAME)
      .get(EXTENSION_CONFIG_KEYS.ALLOW_USAGE_TRACKING)
  ) {
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
    {
      ...options,
      ...getUserIdentificationInformation(),
      authType,
      action,
    },
    accountId
  );
};
