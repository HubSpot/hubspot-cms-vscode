import * as vscode from 'vscode';

export const getRootPath = () => {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length < 1) {
    throw new Error('No workspace folder found.');
  }

  return workspaceFolders[0].uri.fsPath;
};
