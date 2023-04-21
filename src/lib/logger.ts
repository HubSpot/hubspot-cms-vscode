import { window } from 'vscode';

const { setLogger } = require('@hubspot/cli-lib/logger');

class Logger {
  error(...args: any[]) {
    window.showErrorMessage(`[error]: ${args}`);
  }
  warn(...args: any[]) {
    window.showWarningMessage(`[warning] ${args}`);
  }
  log(...args: any[]) {
    window.showInformationMessage(`[log] ${args}`);
  }
  success(...args: any[]) {
    window.showInformationMessage(`[success] ${args}`);
  }
  info(...args: any[]) {
    window.showInformationMessage(`[info] ${args}`);
  }
  debug(...args: any[]) {
    window.showWarningMessage(`[debug]: ${args}`);
  }
  group(...args: any[]) {
    console.group(...args);
  }
  groupEnd(...args: any[]) {
    console.groupEnd();
  }
}
export const initializeCliLibLogger = () => {
  const vsceLogger = new Logger();
  setLogger(vsceLogger);
};
