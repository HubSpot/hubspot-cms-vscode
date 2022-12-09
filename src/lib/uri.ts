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
import { COMMANDS, TRACKED_EVENTS } from './constants';

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

const handleAuthRequest = async (
  rootPath: string,
  authParams: URLSearchParams
) => {
  const personalAccessKeyResp = authParams.get('personalAccessKeyResp') || '';
  const env = authParams.get('env') || 'prod';
  const name = authParams.get('name');
  const { key: personalAccessKey } = JSON.parse(personalAccessKeyResp);
  let configPath = loadHubspotConfigFile(rootPath);

  if (configPath) {
    setConfigPath(configPath);
    await trackEvent(TRACKED_EVENTS.AUTH_UPDATE_CONFIG);
  } else {
    configPath = path.resolve(rootPath, 'hubspot.config.yml');
    console.log('Creating empty config: ', configPath);
    await createEmptyConfigFile({ path: configPath });
    await trackEvent(TRACKED_EVENTS.AUTH_INITIALIZE_CONFIG);
  }

  const updatedConfig = await updateConfigWithPersonalAccessKey({
    personalAccessKey,
    name,
    env,
  });

  commands.executeCommand(COMMANDS.ON_CONFIG_FOUND, rootPath, configPath);

  commands.executeCommand('setContext', 'hubspot.auth.isAuthenticating', false);
  window.showInformationMessage(`Successfully added ${name} to the config.`);
  window
    .showInformationMessage(
      `Do you want to set ${name} as the default account?`,
      'Yes',
      'No'
    )
    .then((answer: string | undefined) => {
      if (answer === 'Yes') {
        console.log(`Updating defaultPortal to ${name}.`);
        commands.executeCommand(COMMANDS.CONFIG_SET_DEFAULT_ACCOUNT, name);
      }
    });

  await trackEvent('auth-success', { name });

  return updatedConfig;
};

export const registerURIHandler = (
  context: ExtensionContext,
  rootPath: string
) => {
  // https://github.com/microsoft/vscode-extension-samples/blob/main/uri-handler-sample/package.json
  window.registerUriHandler({
    handleUri(uri: Uri): ProviderResult<void> {
      console.log('URI Handler uri: ', uri);
      if (uri.path === '/auth') {
        const queryObject = getQueryObject(uri);

        console.log('queryObject: ', queryObject);
        handleAuthRequest(rootPath, queryObject);
      }
    },
  });
};
