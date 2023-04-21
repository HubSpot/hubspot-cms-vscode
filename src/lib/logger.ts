import { window } from "vscode";

const { setLogger } = require('@hubspot/cli-lib/logger');

class Logger {
    error(...args: any[]) {
        window.showErrorMessage(`[CLI-error]: ${args}`);
    }
    warn(...args:any[]){
        window.showWarningMessage(`[CLI-warning] ${args}`);
    }
    log(...args:any[]){
        window.showInformationMessage(`[CLI-log] ${args}`);
    }
    success(...args: any[]) {
        window.showInformationMessage(`[CLI-success] ${args}`);
    }
    info(...args: any[]) {
        window.showInformationMessage(`[CLI-info] ${args}`);
    }
    debug(...args: any[]) {
        window.showWarningMessage(`[CLI-debug]: ${args}`);
    }
    group(...args: any[]) {
        console.group(...args)
    }
    groupEnd(...args: any[]) {
        console.groupEnd()
    }
}
export const initializeCliLibLogger = () => {
    const vsceLogger = new Logger();
    setLogger(vsceLogger);
}