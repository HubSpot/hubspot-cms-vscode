"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePanels = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
const feedback_1 = require("./panels/feedback");
const initializePanels = (context) => {
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.PANELS.OPEN_FEEDBACK_PANEL, () => {
        feedback_1.FeedbackPanel.render(context.extensionUri);
    }));
};
exports.initializePanels = initializePanels;
//# sourceMappingURL=panels.js.map