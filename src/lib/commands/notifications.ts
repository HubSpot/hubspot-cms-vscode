import { commands, window, ExtensionContext } from 'vscode';
import { COMMANDS, GLOBAL_STATE_KEYS, TRACKED_EVENTS } from '../constants';
import { trackEvent } from '../tracking';

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.NOTIFICATIONS.SHOW_FEEDBACK_REQUEST,
      () => {
        trackEvent(TRACKED_EVENTS.FEEDBACK.FEEDBACK_REQUEST_SHOWN);
        window
          .showInformationMessage(
            'Have a minute to give us some feedback?',
            {
              title: 'Provide Feedback',
            },
            { title: 'Not now', isCloseAffordance: true }
          )
          .then((selection) => {
            if (selection && selection.title === 'Provide Feedback') {
              commands.executeCommand(COMMANDS.PANELS.OPEN_FEEDBACK_PANEL);
              trackEvent(TRACKED_EVENTS.FEEDBACK.FEEDBACK_REQUEST_ACCEPTED);
            } else {
              // Delay showing the message again for 60 days when dismissed
              commands.executeCommand(
                COMMANDS.GLOBAL_STATE.UPDATE_DELAY,
                GLOBAL_STATE_KEYS.DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL,
                60,
                'day'
              );
              trackEvent(TRACKED_EVENTS.FEEDBACK.FEEDBACK_REQUEST_DISMISSED);
            }
          });
      }
    )
  );
};
