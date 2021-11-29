import * as vscode from 'vscode';
//@ts-ignore
import * as http from './core/http';
console.log(http);
const {
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
} = require('./lib/constants');

async function activate(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length < 1) {
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;

  if (!rootPath) {
    return;
  }
  const accountId = 1932631;
  // try {
  //   const x = await http.get(accountId, {
  //     uri: `/cos-rendering/v1/internal/validate`,
  //   });
  //   console.log(x);
  //   vscode.window.showInformationMessage(x.status);
  // } catch (err: any) {
  //   console.log(err);
  //   vscode.window.showInformationMessage(err);
  // }
  const FILE_MAPPER_API_PATH = 'content/filemapper/v1';
  /**
   * Track CMS CLI usage
   *
   * @async
   * @returns {Promise}
   */
  async function trackUsage(eventName, eventClass, meta = {}, accountId) {
    const usageEvent = {
      accountId,
      eventName,
      eventClass,
      meta,
    };
    const EVENT_TYPES = {
      VSCODE_EXTENSION_INTERACTION: 'vscode-extension-interaction',
      CLI_INTERACTION: 'cli-interaction',
    };

    let analyticsEndpoint;

    switch (eventName) {
      case EVENT_TYPES.CLI_INTERACTION:
        analyticsEndpoint = 'cms-cli-usage';
        break;
      case EVENT_TYPES.VSCODE_EXTENSION_INTERACTION:
        analyticsEndpoint = 'vscode-extension-usage';
        break;
      default:
        console.debug(
          `Usage tracking event '${eventName}' is not a valid event type.`
        );
    }

    const path = `${FILE_MAPPER_API_PATH}/${analyticsEndpoint}`;

    // const accountConfig = accountId && getAccountConfig(accountId);

    // if (accountConfig && accountConfig.authType === 'personalaccesskey') {
    console.debug('Sending usage event to authenticated endpoint');
    try {
      const x = await http.post(accountId, {
        uri: `${path}/authenticated`,
        data: usageEvent,
        resolveWithFullResponse: true,
      });
      console.log('r', x);
      return x;
    } catch (err) {
      console.error('e', err);
    }
    // }

    // const env = getEnv(accountId);
    const requestOptions = http.getRequestOptions(
      { env },
      {
        uri: path,
        body: usageEvent,
        resolveWithFullResponse: true,
      }
    );
    console.debug('Sending usage event to unauthenticated endpoint');
    return http.post(requestOptions);
  }

  // const path = findConfig(rootPath);

  // if (!path) {
  //   return;
  // }

  // loadConfig(path);

  // if (!validateConfig()) {
  //   return;
  // }

  // const trackAction = async (action: string) => {
  //   if (!isTrackingAllowed()) {
  //     return;
  //   }

  //   let authType = 'unknown';
  //   const accountId = getAccountId();

  //   if (accountId) {
  //     const accountConfig = getAccountConfig(accountId);
  //     authType =
  //       accountConfig && accountConfig.authType
  //         ? accountConfig.authType
  //         : 'apikey';
  //   }

  await trackUsage(
    'vscode-extension-interaction',
    'INTERACTION',
    { authType: 'personalAccessKey' },
    accountId
  );
  // };

  // await trackAction('extension-activated');

  if (
    vscode.workspace
      .getConfiguration(EXTENSION_CONFIG_NAME)
      .get(EXTENSION_CONFIG_KEYS.HUBL_LINTING)
  ) {
    // enableLinting();
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (
        e.affectsConfiguration(
          `${EXTENSION_CONFIG_NAME}.${EXTENSION_CONFIG_KEYS.HUBL_LINTING}`
        )
      ) {
        if (
          vscode.workspace
            .getConfiguration(EXTENSION_CONFIG_NAME)
            .get(EXTENSION_CONFIG_KEYS.HUBL_LINTING)
        ) {
          // enableLinting();
          // await trackAction('linting-enabled');
        } else {
          // disableLinting();
          // await trackAction('linting-disabled');
        }
      }
    })
  );
}

module.exports = {
  activate,
};
