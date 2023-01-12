import { commands, ExtensionContext } from 'vscode';
import * as dayjs from 'dayjs';
import { COMMANDS, GLOBAL_STATE_KEYS } from './constants';

export const initializeGlobalState = (context: ExtensionContext) => {
  const feedbackDelayDate: string | undefined = context.globalState.get(
    GLOBAL_STATE_KEYS.DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL
  );

  if (!feedbackDelayDate) {
    commands.executeCommand(
      COMMANDS.GLOBAL_STATE.UPDATE_DELAY,
      GLOBAL_STATE_KEYS.DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL,
      3,
      'day'
    );
  } else {
    const delayDateHasPassed = dayjs().isAfter(feedbackDelayDate);
    if (delayDateHasPassed) {
      commands.executeCommand(COMMANDS.NOTIFICATIONS.SHOW_FEEDBACK_REQUEST);
    }
  }
};
