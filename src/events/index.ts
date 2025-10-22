import { ExtensionContext } from 'vscode';

import { registerEvents as registerFeedbackEvents } from './feedback';
import { registerEvents as registerConfigEvents } from './config';

// Events are commands that are triggered within our extension's own codebase
// and are not configured in the package.json file.
export const registerEvents = (context: ExtensionContext) => {
  registerFeedbackEvents(context);
  registerConfigEvents(context);
};
