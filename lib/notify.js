const { window } = require('vscode');

const HAS_SEEN_BETA = 'HS_HAS_SEEN_BETA';
const BETA_NOTIFICATION_MESSAGE =
  'Now in Beta: HubL Error Linting. Opt-in to beta feautures to enable this feature.';

const notifyBeta = (ctx) => {
  if (ctx.globalState.get(HAS_SEEN_BETA) === true) {
    return;
  }
  window.showInformationMessage(BETA_NOTIFICATION_MESSAGE);
  ctx.globalState.update(HAS_SEEN_BETA, true);
};

module.exports = { notifyBeta };
