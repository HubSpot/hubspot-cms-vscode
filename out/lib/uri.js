"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerURIHandler = void 0;
const vscode_1 = require("vscode");
const path_1 = require("path");
const url_1 = require("url");
const tracking_1 = require("./tracking");
const auth_1 = require("./auth");
const messaging_1 = require("./messaging");
const constants_1 = require("./constants");
const { updateConfigWithAccessToken, getAccessToken, } = require('@hubspot/local-dev-lib/personalAccessKey');
const config_1 = require("@hubspot/local-dev-lib/config");
const environments_1 = require("@hubspot/local-dev-lib/constants/environments");
const getQueryObject = (uri) => {
    return new url_1.URLSearchParams(uri.query);
};
const handleAuthRequest = async (authParams) => {
    const personalAccessKeyResp = authParams.get('personalAccessKeyResp') || '';
    const envParam = authParams.get('env');
    const env = envParam === environments_1.ENVIRONMENTS.QA ? environments_1.ENVIRONMENTS.QA : environments_1.ENVIRONMENTS.PROD;
    const name = authParams.get('name') || undefined;
    const portalId = authParams.get('portalId');
    const { key: personalAccessKey } = JSON.parse(personalAccessKeyResp);
    const accountIdentifier = name || portalId;
    let rootPath = authParams.get('rootPath') || '';
    let configPath = (0, auth_1.loadHubspotConfigFile)(rootPath);
    // handle windows paths, which look something like /C:/Some/path
    if (/^\/\w:\/.*$/.test(rootPath)) {
        rootPath = rootPath.slice(1);
    }
    if (configPath) {
        (0, config_1.setConfigPath)(configPath);
        await (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.AUTH_UPDATE_CONFIG, { name });
    }
    else {
        configPath = (0, path_1.resolve)(rootPath, 'hubspot.config.yml');
        console.log('Creating empty config: ', configPath);
        await (0, config_1.createEmptyConfigFile)({ path: configPath });
        await (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.AUTH_INITIALIZE_CONFIG, { name });
    }
    let token;
    try {
        token = await getAccessToken(personalAccessKey, env);
    }
    catch (err) {
        throw err;
    }
    const updatedConfig = await updateConfigWithAccessToken(token, personalAccessKey, env, name);
    vscode_1.commands.executeCommand(constants_1.EVENTS.ON_CONFIG_FOUND, rootPath, configPath);
    vscode_1.commands.executeCommand('setContext', 'hubspot.auth.isAuthenticating', false);
    (0, messaging_1.showAutoDismissedStatusBarMessage)(`Successfully added ${accountIdentifier} to the config.`);
    vscode_1.window
        .showInformationMessage(`Do you want to set ${accountIdentifier} as the default account?`, 'Yes', 'No')
        .then(async (answer) => {
        if (answer === 'Yes') {
            await (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.SET_DEFAULT_ACCOUNT);
            console.log(`Updating defaultAccount to ${accountIdentifier}.`);
            vscode_1.commands.executeCommand(constants_1.COMMANDS.CONFIG.SET_DEFAULT_ACCOUNT, accountIdentifier);
        }
    });
    return updatedConfig;
};
const registerURIHandler = (context) => {
    // https://github.com/microsoft/vscode-extension-samples/blob/main/uri-handler-sample/package.json
    vscode_1.window.registerUriHandler({
        handleUri(uri) {
            console.log('URI Handler uri: ', uri);
            if (uri.path === '/auth') {
                const queryObject = getQueryObject(uri);
                console.log('queryObject: ', queryObject);
                handleAuthRequest(queryObject);
            }
        },
    });
};
exports.registerURIHandler = registerURIHandler;
//# sourceMappingURL=uri.js.map