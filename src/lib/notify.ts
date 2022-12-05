const { window, workspace, ConfigurationTarget } = require('vscode');
const {
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
  GLOBAL_STATE_KEYS,
} = require('./constants');

const BETA_NOTIFICATION_MESSAGE =
  'Now in Beta: HubL Error Linting. Opt-in to beta feautures to enable this feature.';
const BETA_NOTIFICATION_BUTTON = 'Enable Beta Features';

const notifyBeta = (ctx: any) => {
  if (
    ctx.globalState.get(GLOBAL_STATE_KEYS.HAS_SEEN_LINTING_MESSAGE) === true
  ) {
    return;
  }
  window
    .showInformationMessage(BETA_NOTIFICATION_MESSAGE, BETA_NOTIFICATION_BUTTON)
    .then((selection: any) => {
      if (selection === BETA_NOTIFICATION_BUTTON) {
        workspace
          .getConfiguration(EXTENSION_CONFIG_NAME)
          .update(EXTENSION_CONFIG_KEYS.BETA, true, ConfigurationTarget.Global);
      }
    });
  ctx.globalState.update(GLOBAL_STATE_KEYS.HAS_SEEN_LINTING_MESSAGE, true);
};

module.exports = { notifyBeta };
