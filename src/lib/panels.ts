import { commands, ExtensionContext } from 'vscode';

import { COMMANDS } from './constants';
import { FeedbackPanel } from './panels/feedback';

export const initializePanels = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.PANELS.OPEN_FEEDBACK_PANEL, () => {
      console.log('triggered');
      FeedbackPanel.render(context.extensionUri);
    })
  );
};
