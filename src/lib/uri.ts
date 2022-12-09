import {
  commands,
  window,
  ExtensionContext,
  ProviderResult,
  Uri,
} from 'vscode';
import * as path from 'path';
import { URLSearchParams } from 'url';
import { trackAction } from './tracking';
import { loadHubspotConfigFile } from './auth';
import { COMMANDS, EVENTS } from './constants';

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
  const rootPath = authParams.get('rootPath') || '';
  const personalAccessKeyResp = authParams.get('personalAccessKeyResp') || '';
  const env = authParams.get('env') || 'prod';
  const name = authParams.get('name');
  const { key: personalAccessKey } = JSON.parse(personalAccessKeyResp);
  let configPath = loadHubspotConfigFile(rootPath);

  if (configPath) {
    setConfigPath(configPath);
  } else {
    configPath = path.resolve(rootPath, 'hubspot.config.yml');
    console.log('Creating empty config: ', configPath);
    await createEmptyConfigFile({ path: configPath });
  }
  const updatedConfig = await updateConfigWithPersonalAccessKey({
    personalAccessKey,
    name,
    env,
  });

  commands.executeCommand(EVENTS.ON_CONFIG_FOUND, rootPath, configPath);

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
        commands.executeCommand(COMMANDS.CONFIG.SET_DEFAULT_ACCOUNT, name);
      }
    });

  await trackAction('auth-success', { name });

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
