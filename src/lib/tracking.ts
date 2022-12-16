import { env, version, workspace, ExtensionContext } from 'vscode';
import { platform, release } from 'os';
import { EXTENSION_CONFIG_NAME, EXTENSION_CONFIG_KEYS } from './constants';

let extensionVersion: string;

export const initializeTracking = (context: ExtensionContext) => {
  extensionVersion = context.extension.packageJSON.version;
};

const {
  getAccountId,
  isTrackingAllowed,
  getAccountConfig,
} = require('@hubspot/cli-lib');
const { trackUsage } = require('@hubspot/cli-lib/api/fileMapper');

const getAuthType = (accountId: string) => {
  let authType = 'unknown';

  if (accountId) {
    const accountConfig = getAccountConfig(accountId);
    authType =
      accountConfig && accountConfig.authType
        ? accountConfig.authType
        : 'apikey';
  }

  return authType;
};

const getUserIdentificationInformation = (accountId: string) => {
  return {
    applicationName: 'hubspot.hubl',
    language: env.language,
    machineId: env.machineId,
    os: `${platform()} ${release()}`,
    shell: env.shell,
    version: extensionVersion,
    vscode_version: version,
    authType: getAuthType(accountId),
  };
};

export const trackEvent = async (action: string, options?: object) => {
  if (
    !isTrackingAllowed() ||
    !workspace.getConfiguration().telemetry.enableTelemetry ||
    !workspace
      .getConfiguration(EXTENSION_CONFIG_NAME)
      .get(EXTENSION_CONFIG_KEYS.ALLOW_USAGE_TRACKING)
  ) {
    return;
  }
  const accountId = getAccountId();
  const data = getUserIdentificationInformation(accountId);

  console.log('data: ', data);
  await trackUsage(
    'vscode-extension-interaction',
    'INTERACTION',
    {
      ...options,
      ...data,
      action,
    },
    accountId
  );
};
