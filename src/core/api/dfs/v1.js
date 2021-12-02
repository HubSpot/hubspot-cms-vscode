import * as http from '../../http';
import { getRequestOptions } from '../../requestOptions';

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

  console.debug('Sending usage event to authenticated endpoint');
  try {
    return http.post(accountId, {
      uri: `${path}/authenticated`,
      data: usageEvent,
      resolveWithFullResponse: true,
    });
  } catch (err) {
    console.error(err);
  }
  // TODO: Add env to config
  const env = 'prod';
  const requestOptions = getRequestOptions(
    { env },
    {
      uri: path,
      data: usageEvent,
      resolveWithFullResponse: true,
    }
  );
  console.debug('Sending usage event to unauthenticated endpoint');
  return http.post(requestOptions);
}

export { trackUsage };
