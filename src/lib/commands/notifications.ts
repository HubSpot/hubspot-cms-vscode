import { commands, window, ExtensionContext } from 'vscode';
import { COMMANDS, GLOBAL_STATE_KEYS } from '../constants';

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.NOTIFICATIONS.SHOW_FEEDBACK_REQUEST,
      () => {
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
            } else {
              // Delay showing the message again for 60 days when dismissed
              commands.executeCommand(
                COMMANDS.GLOBAL_STATE.UPDATE_DELAY,
                GLOBAL_STATE_KEYS.DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL,
                60,
                'day'
              );
            }
          });
      }
    )
  );
};
