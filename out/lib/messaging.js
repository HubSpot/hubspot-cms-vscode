"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showAutoDismissedStatusBarMessage = void 0;
const vscode_1 = require("vscode");
const showAutoDismissedStatusBarMessage = (message, timeout = 5000) => {
    const dispose = vscode_1.window.setStatusBarMessage(message);
    setTimeout(() => {
        dispose.dispose();
    }, timeout);
    return dispose;
};
exports.showAutoDismissedStatusBarMessage = showAutoDismissedStatusBarMessage;
//# sourceMappingURL=messaging.js.map