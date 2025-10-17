import { commands, ExtensionContext } from 'vscode';

import { COMMANDS } from '../lib/constants';
import { FeedbackPanel } from './feedback';

export const registerPanels = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.PANELS.OPEN_FEEDBACK_PANEL, () => {
      FeedbackPanel.render(context.extensionUri);
    })
  );
};
