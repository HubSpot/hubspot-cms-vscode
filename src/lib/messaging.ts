import { window } from 'vscode';

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
