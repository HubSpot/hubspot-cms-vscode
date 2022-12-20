import { env, version, workspace, ExtensionContext, Uri, window } from 'vscode';
import { platform, release } from 'os';

const doNotPromptTelemetryKey = 'hubspotDoNotShowTelemetry';
const vscodeTelemetryDocsUrl =
  'https://code.visualstudio.com/docs/getstarted/telemetry';
let extensionVersion: string;

export const initializeTracking = (context: ExtensionContext) => {
  extensionVersion = context.extension.packageJSON.version;
  if (context.globalState.get(doNotPromptTelemetryKey) === undefined) {
    context.globalState.update(doNotPromptTelemetryKey, true);
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
    vscodeVersion: version,
    authType: getAuthType(accountId),
  };
};

export const trackEvent = async (action: string, options?: object) => {
  if (
    !isTrackingAllowed() ||
    !workspace.getConfiguration().telemetry.enableTelemetry
  ) {
    return;
  }
  const accountId = getAccountId();

  await trackUsage(
    'vscode-extension-interaction',
    'INTERACTION',
    {
      ...options,
      ...getUserIdentificationInformation(accountId),
      action,
    },
    accountId
  );
};
