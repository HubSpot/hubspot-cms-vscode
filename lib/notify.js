const { window, workspace, ConfigurationTarget } = require('vscode');
const { EXTENSION_CONFIG_NAME, EXTENSION_CONFIG_KEYS } = require('./constants');

const HAS_SEEN_BETA = 'HS_HAS_SEEN_BETA';
const BETA_NOTIFICATION_MESSAGE =
  'Now in Beta: HubL Error Linting. Opt-in to beta feautures to enable this feature.';
const BETA_NOTIFICATION_BUTTON = 'Enable Beta Features';

const notifyBeta = (ctx) => {
  if (ctx.globalState.get(HAS_SEEN_BETA) === true) {
    return;
  }
  window
    .showInformationMessage(BETA_NOTIFICATION_MESSAGE, BETA_NOTIFICATION_BUTTON)
    .then((selection) => {
      if (selection === BETA_NOTIFICATION_BUTTON) {
        workspace
          .getConfiguration(EXTENSION_CONFIG_NAME)
          .update(EXTENSION_CONFIG_KEYS.BETA, true, ConfigurationTarget.Global);
      }
    });
  ctx.globalState.update(HAS_SEEN_BETA, true);
};

module.exports = { notifyBeta };
