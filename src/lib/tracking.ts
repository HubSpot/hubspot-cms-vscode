import { env, version, workspace, ExtensionContext, Uri, window } from 'vscode';
import { platform, release } from 'os';
import { GLOBAL_STATE_KEYS } from './constants';

const {
  getAccountId,
  isTrackingAllowed,
  getAccountConfig,
} = require('@hubspot/cli-lib');
const { trackUsage } = require('@hubspot/cli-lib/api/fileMapper');

const vscodeTelemetryDocsUrl =
  'https://code.visualstudio.com/docs/getstarted/telemetry';
let extensionVersion: string;

export const initializeTracking = (context: ExtensionContext) => {
  extensionVersion = context.extension.packageJSON.version;
  if (
    context.globalState.get(GLOBAL_STATE_KEYS.HAS_SEEN_TELEMETRY_MESSAGE) ===
    undefined
  ) {
    context.globalState.update(
      GLOBAL_STATE_KEYS.HAS_SEEN_TELEMETRY_MESSAGE,
      true
    );
    showTelemetryPrompt();
  }
};

const showTelemetryPrompt = async () => {
  const selection = await window.showInformationMessage(
    "The HubSpot VSCode Extension collects basic usage data in order to improve the extension's experience. If you'd like to opt out, we respect the global telemetry setting in VSCode.",
    ...['Read More', 'Okay']
  );
  if (!selection) return;
  if (selection === 'Read More') {
    env.openExternal(Uri.parse(vscodeTelemetryDocsUrl));
  }
};

const isTrackingAllowedInVSCode = () => {
  return (
    isTrackingAllowed() &&
    workspace.getConfiguration().telemetry.enableTelemetry
  );
};

const getAuthType = (accountId?: string) => {
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

export const getUserIdentificationInformation = (accountId?: string) => {
  if (!isTrackingAllowedInVSCode()) {
    return {};
  }

  return {
    applicationName: 'hubspot.hubl',
    language: env.language,
    machineId: env.machineId,
    os: `${platform()} ${release()}`,
    shell: env.shell,
    version: extensionVersion,
    vscodeVersion: version,
    authType: getAuthType(accountId),
  };
};

export const trackEvent = async (action: string, options?: object) => {
  if (!isTrackingAllowedInVSCode()) {
    return;
  }
  const accountId = getAccountId();

  trackUsage(
    'vscode-extension-interaction',
    'INTERACTION',
    {
      ...options,
      ...getUserIdentificationInformation(accountId),
      action,
    },
    accountId
  ).then(
    (val: any) => {},
    (err: any) => {
      console.error(`trackUsage failed: ${err}`);
    }
  );
};
