"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
const tracking_1 = require("../tracking");
const registerCommands = (context) => {
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.NOTIFICATIONS.SHOW_FEEDBACK_REQUEST, () => {
        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.FEEDBACK.FEEDBACK_REQUEST_SHOWN);
        vscode_1.window
            .showInformationMessage('Have a minute to give us some feedback?', {
            title: 'Provide Feedback',
        }, { title: 'Not now', isCloseAffordance: true })
            .then((selection) => {
            if (selection && selection.title === 'Provide Feedback') {
                vscode_1.commands.executeCommand(constants_1.COMMANDS.PANELS.OPEN_FEEDBACK_PANEL);
                (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.FEEDBACK.FEEDBACK_REQUEST_ACCEPTED);
            }
            else {
                // Delay showing the message again for 60 days when dismissed
                vscode_1.commands.executeCommand(constants_1.COMMANDS.GLOBAL_STATE.UPDATE_DELAY, constants_1.GLOBAL_STATE_KEYS.DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL, 60, 'day');
                (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.FEEDBACK.FEEDBACK_REQUEST_DISMISSED);
            }
        });
    }));
};
exports.registerCommands = registerCommands;
//# sourceMappingURL=notifications.js.map