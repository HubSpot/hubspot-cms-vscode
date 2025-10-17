import { dirname } from 'path';
import { commands, workspace } from 'vscode';

import { COMMANDS } from './constants';

export const getRootPath = () => {
  const workspaceFolders = workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length < 1) {
    return;
  }
  return workspaceFolders[0].uri.fsPath;
};
