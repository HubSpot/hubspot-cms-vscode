"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackEvent = exports.getUserIdentificationInformation = exports.initializeTracking = void 0;
const vscode_1 = require("vscode");
const os_1 = require("os");
const constants_1 = require("./constants");
const config_1 = require("@hubspot/local-dev-lib/config");
const { trackUsage } = require('@hubspot/local-dev-lib/trackUsage');
const vscodeTelemetryDocsUrl = 'https://code.visualstudio.com/docs/getstarted/telemetry';
let extensionVersion;
let prettierPluginVersion = null;
const setPrettierPluginVersion = async () => {
    const prettierPluginPackageJson = await vscode_1.workspace.findFiles('**/node_modules/@hubspot/prettier-plugin-hubl/package.json');
    if (!prettierPluginPackageJson.length) {
        return;
    }
    try {
        const fileContents = await vscode_1.workspace.fs.readFile(prettierPluginPackageJson[0]);
        const { version } = JSON.parse(fileContents.toString());
        console.log(`Found HubL Prettier Plugin version: ${version}`);
        prettierPluginVersion = version;
    }
    catch (e) {
        console.log(e);
    }
};
const initializeTracking = async (context) => {
    extensionVersion = context.extension.packageJSON.version;
    if (context.globalState.get(constants_1.GLOBAL_STATE_KEYS.HAS_SEEN_TELEMETRY_MESSAGE) ===
        undefined) {
        context.globalState.update(constants_1.GLOBAL_STATE_KEYS.HAS_SEEN_TELEMETRY_MESSAGE, true);
        showTelemetryPrompt();
    }
    await setPrettierPluginVersion();
};
exports.initializeTracking = initializeTracking;
const showTelemetryPrompt = async () => {
    const selection = await vscode_1.window.showInformationMessage("The HubSpot VSCode Extension collects basic usage data in order to improve the extension's experience. If you'd like to opt out, we respect the global telemetry setting in VSCode.", ...['Read More', 'Okay']);
    if (!selection)
        return;
    if (selection === 'Read More') {
        vscode_1.env.openExternal(vscode_1.Uri.parse(vscodeTelemetryDocsUrl));
    }
};
const isTrackingAllowedInVSCode = () => {
    return ((0, config_1.isTrackingAllowed)() &&
        vscode_1.workspace.getConfiguration().telemetry.enableTelemetry);
};
const getAuthType = (accountId) => {
    let authType = 'unknown';
    if (accountId) {
        const accountConfig = (0, config_1.getAccountConfig)(Number(accountId));
        authType =
            accountConfig && accountConfig.authType
                ? accountConfig.authType
                : 'apikey';
    }
    return authType;
};
const getUserIdentificationInformation = (accountId) => {
    if (!isTrackingAllowedInVSCode()) {
        return {};
    }
    return {
        applicationName: 'hubspot.hubl',
        language: vscode_1.env.language,
        machineId: vscode_1.env.machineId,
        os: `${(0, os_1.platform)()} ${(0, os_1.release)()}`,
        shell: vscode_1.env.shell,
        version: extensionVersion,
        vscodeVersion: vscode_1.version,
        authType: getAuthType(accountId),
        prettierPluginVersion,
    };
};
exports.getUserIdentificationInformation = getUserIdentificationInformation;
const trackEvent = async (action, options) => {
    if (!isTrackingAllowedInVSCode()) {
        return;
    }
    const accountId = (0, config_1.getAccountId)();
    trackUsage('vscode-extension-interaction', 'INTERACTION', {
        ...options,
        ...(0, exports.getUserIdentificationInformation)(accountId === null || accountId === void 0 ? void 0 : accountId.toString()),
        action,
    }, accountId).then((val) => { }, (err) => {
        console.error(`trackUsage failed: ${err}`);
    });
};
exports.trackEvent = trackEvent;
//# sourceMappingURL=tracking.js.map