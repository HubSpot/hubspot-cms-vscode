import {
  commands,
  window,
  ExtensionContext,
  ProviderResult,
  Uri,
} from 'vscode';
import * as path from 'path';
import { URLSearchParams } from 'url';
import { trackEvent } from './tracking';
import { loadHubspotConfigFile } from './auth';
import { COMMANDS, EVENTS, TRACKED_EVENTS } from './constants';

const {
  updateConfigWithPersonalAccessKey,
} = require('@hubspot/cli-lib/personalAccessKey');
const {
  createEmptyConfigFile,
  setConfigPath,
} = require('@hubspot/cli-lib/lib/config');

const getQueryObject = (uri: Uri) => {
  return new URLSearchParams(uri.query);
};

const handleAuthRequest = async (authParams: URLSearchParams) => {
  const personalAccessKeyResp = authParams.get('personalAccessKeyResp') || '';
  const env = authParams.get('env') || 'prod';
  const name = authParams.get('name');
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
    configPath = path.resolve(rootPath, 'hubspot.config.yml');
    console.log('Creating empty config: ', configPath);
    await createEmptyConfigFile({ path: configPath });
    await trackEvent(TRACKED_EVENTS.AUTH_INITIALIZE_CONFIG, { name });
  }

  const updatedConfig = await updateConfigWithPersonalAccessKey({
    personalAccessKey,
    name,
    env,
  });

  commands.executeCommand(EVENTS.ON_CONFIG_FOUND, rootPath, configPath);

  commands.executeCommand('setContext', 'hubspot.auth.isAuthenticating', false);
  window.showInformationMessage(
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
        console.log(`Updating defaultPortal to ${accountIdentifier}.`);
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
