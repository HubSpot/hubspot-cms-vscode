import { commands, ExtensionContext } from 'vscode';
import * as dayjs from 'dayjs';
import { COMMANDS, GLOBAL_STATE_KEYS } from '../lib/constants';

export const maybeShowFeedbackRequest = (context: ExtensionContext) => {
  const feedbackDelayDate: string | undefined = context.globalState.get(
    GLOBAL_STATE_KEYS.DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL
  );

  if (!feedbackDelayDate) {
    // No delay set - first time, show feedback immediately
    commands.executeCommand(COMMANDS.NOTIFICATIONS.SHOW_FEEDBACK_REQUEST);
  } else {
    // Delay exists - check if enough time has passed
    const delayDateHasPassed = dayjs().isAfter(feedbackDelayDate);
    if (delayDateHasPassed) {
      commands.executeCommand(COMMANDS.NOTIFICATIONS.SHOW_FEEDBACK_REQUEST);
    }
  }
};
