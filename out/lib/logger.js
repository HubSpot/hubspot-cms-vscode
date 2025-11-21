"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCliLibLogger = void 0;
const vscode_1 = require("vscode");
const { setLogger } = require('@hubspot/local-dev-lib/logger');
class Logger {
    error(...args) {
        vscode_1.window.showErrorMessage(`[error]: ${args}`);
    }
    warn(...args) {
        vscode_1.window.showWarningMessage(`[warning] ${args}`);
    }
    log(...args) {
        vscode_1.window.showInformationMessage(`[log] ${args}`);
    }
    success(...args) {
        vscode_1.window.showInformationMessage(`[success] ${args}`);
    }
    info(...args) {
        vscode_1.window.showInformationMessage(`[info] ${args}`);
    }
    debug(...args) {
        vscode_1.window.showWarningMessage(`[debug]: ${args}`);
    }
    group(...args) {
        console.group(...args);
    }
    groupEnd(...args) {
        console.groupEnd();
    }
}
const initializeCliLibLogger = () => {
    const vsceLogger = new Logger();
    setLogger(vsceLogger);
};
exports.initializeCliLibLogger = initializeCliLibLogger;
//# sourceMappingURL=logger.js.map