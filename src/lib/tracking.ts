import { env, version, workspace, ExtensionContext } from 'vscode';
import { platform, release } from 'os';
import { EXTENSION_CONFIG_NAME, EXTENSION_CONFIG_KEYS } from './constants';

let extensionVersion: string;

export const initializeTracking = (context: ExtensionContext) => {
  // @ts-ignore TODO - Why is extension not available, when it is?
  extensionVersion = context.extension.packageJSON.version;
};

const {
  getAccountId,
  isTrackingAllowed,
  getAccountConfig,
} = require('@hubspot/cli-lib');
const { trackUsage } = require('@hubspot/cli-lib/api/fileMapper');

export const getUserIdentificationInformation = () => {
  return {
    extensionName: 'hubspot.hubl',
    source: env.appName,
    vscodeVersion: version,
    extensionVersion,
    language: env.language,
    machineId: env.machineId,
    os: `${platform()} ${release()}`,
    shell: env.shell,
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
