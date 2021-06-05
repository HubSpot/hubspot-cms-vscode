const { window } = require('vscode');

const HAS_SEEN_BETA = 'has-seen-beta';
const BETA_NOTIFICATION_MESSAGE =
  'Now in Beta: HubL Error Linting. Opt-in to beta feautures to enable this feature.';

const notifyBeta = (ctx) => {
  if (ctx.globalState.get(HAS_SEEN_BETA) === true) {
    return;
  }
  window.showInformationMessage(BETA_NOTIFICATION_MESSAGE);
};

module.exports = { notifyBeta };
