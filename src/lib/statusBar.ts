import { window, StatusBarAlignment } from 'vscode';

export const buildStatusBarItem = (text: string) => {
  const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right);
  statusBarItem.text = text;
  return statusBarItem;
};

export const showAutoDismissedStatusBarMessage = (
  message: string,
  timeout: number = 5000
) => {
  const dispose = window.setStatusBarMessage(message);
  setTimeout(() => {
    dispose.dispose();
  }, timeout);

  return dispose;
};
