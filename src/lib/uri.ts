import {
  commands,
  window,
  ExtensionContext,
  ProviderResult,
  Uri,
  Webview,
} from 'vscode';
import { resolve } from 'path';
import { URLSearchParams } from 'url';
import { trackEvent } from './tracking';
import { loadHubspotConfigFile } from './config';
import { showAutoDismissedStatusBarMessage } from './statusBar';
import { COMMANDS, EVENTS, TRACKED_EVENTS } from './constants';

const {
  updateConfigWithAccessToken,
  getAccessToken,
} = require('@hubspot/local-dev-lib/personalAccessKey');
import {
  createEmptyConfigFile,
  setConfigPath,
} from '@hubspot/local-dev-lib/config';
import { ENVIRONMENTS } from '@hubspot/local-dev-lib/constants/environments';
import { Environment } from '@hubspot/local-dev-lib/types/Config';

/**
 * A helper function which will get the webview URI of a given file or resource
 * @param webview A reference to the extension webview
 * @param extensionUri The URI of the directory containing the extension
 * @param pathList An array of strings representing the path to a file/resource
 * @returns A URI pointing to the file/resource
 */
export function getUri(
  webview: Webview,
  extensionUri: Uri,
  pathList: string[]
) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

const getQueryObject = (uri: Uri) => {
  return new URLSearchParams(uri.query);
};

const handleAuthRequest = async (authParams: URLSearchParams) => {
  const personalAccessKeyResp = authParams.get('personalAccessKeyResp') || '';
  const envParam = authParams.get('env');
  const env: Environment =
    envParam === ENVIRONMENTS.QA ? ENVIRONMENTS.QA : ENVIRONMENTS.PROD;
  const name = authParams.get('name') || undefined;
  const portalId = authParams.get('portalId');
  const { key: personalAccessKey } = JSON.parse(personalAccessKeyResp);
  const accountIdentifier = name || portalId;
  let rootPath = authParams.get('rootPath') || '';
  let configPath = loadHubspotConfigFile(rootPath);

  // handle windows paths, which look something like /C:/Some/path
  if (/^\/\w:\/.*$/.test(rootPath)) {
    rootPath = rootPath.slice(1);
  }

  if (configPath) {
    setConfigPath(configPath);
    await trackEvent(TRACKED_EVENTS.AUTH_UPDATE_CONFIG, { name });
  } else {
    configPath = resolve(rootPath, 'hubspot.config.yml');
    console.log('Creating empty config: ', configPath);
    await createEmptyConfigFile({ path: configPath });
    await trackEvent(TRACKED_EVENTS.AUTH_INITIALIZE_CONFIG, { name });
  }
  let token;
  try {
    token = await getAccessToken(personalAccessKey, env);
  } catch (err) {
    throw err;
  }
  const updatedConfig = await updateConfigWithAccessToken(
    token,
    personalAccessKey,
    env,
    name
  );

  commands.executeCommand(EVENTS.ON_CONFIG_FOUND, rootPath, configPath);

  showAutoDismissedStatusBarMessage(
    `Successfully added ${accountIdentifier} to the config.`
  );
  window
    .showInformationMessage(
      `Do you want to set ${accountIdentifier} as the default account?`,
      'Yes',
      'No'
    )
    .then(async (answer: string | undefined) => {
      if (answer === 'Yes') {
        await trackEvent(TRACKED_EVENTS.SET_DEFAULT_ACCOUNT);
        console.log(`Updating defaultAccount to ${accountIdentifier}.`);
        commands.executeCommand(
          COMMANDS.CONFIG.SET_DEFAULT_ACCOUNT,
          accountIdentifier
        );
      }
    });

  return updatedConfig;
};

export const registerURIHandler = (context: ExtensionContext) => {
  // https://github.com/microsoft/vscode-extension-samples/blob/main/uri-handler-sample/package.json
  window.registerUriHandler({
    handleUri(uri: Uri): ProviderResult<void> {
      console.log('URI Handler uri: ', uri);
      if (uri.path === '/auth') {
        const queryObject = getQueryObject(uri);

        console.log('queryObject: ', queryObject);
        handleAuthRequest(queryObject);
      }
    },
  });
};
