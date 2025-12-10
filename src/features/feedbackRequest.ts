import { commands, ExtensionContext } from 'vscode';

import { getDayjsDateFromNow, getDayJsHasDatePassed } from '../lib/helpers';
import { EVENTS, GLOBAL_STATE_KEYS } from '../lib/constants';

export const maybeShowFeedbackRequest = (context: ExtensionContext) => {
  const feedbackDelayDate: string | undefined = context.globalState.get(
    GLOBAL_STATE_KEYS.DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL
  );

  if (!feedbackDelayDate) {
    // First time - set initial 3-day delay, don't show yet
    context.globalState.update(
      GLOBAL_STATE_KEYS.DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL,
      getDayjsDateFromNow(3)
    );
  } else if (getDayJsHasDatePassed(feedbackDelayDate)) {
    commands.executeCommand(EVENTS.NOTIFICATIONS.SHOW_FEEDBACK_REQUEST);
  }
};
