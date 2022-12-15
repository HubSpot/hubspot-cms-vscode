import { commands, window, ExtensionContext } from 'vscode';
import { COMMANDS } from '../constants';

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
            }
          });
      }
    )
  );
};
