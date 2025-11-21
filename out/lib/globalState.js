"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeGlobalState = void 0;
const vscode_1 = require("vscode");
const dayjs = require("dayjs");
const constants_1 = require("./constants");
const initializeGlobalState = (context) => {
    const feedbackDelayDate = context.globalState.get(constants_1.GLOBAL_STATE_KEYS.DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL);
    if (!feedbackDelayDate) {
        vscode_1.commands.executeCommand(constants_1.COMMANDS.GLOBAL_STATE.UPDATE_DELAY, constants_1.GLOBAL_STATE_KEYS.DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL, 3, 'day');
    }
    else {
        const delayDateHasPassed = dayjs().isAfter(feedbackDelayDate);
        if (delayDateHasPassed) {
            vscode_1.commands.executeCommand(constants_1.COMMANDS.NOTIFICATIONS.SHOW_FEEDBACK_REQUEST);
        }
    }
};
exports.initializeGlobalState = initializeGlobalState;
//# sourceMappingURL=globalState.js.map