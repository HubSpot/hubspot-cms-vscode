import { dirname } from 'path';
import { commands } from 'vscode';

import { COMMANDS } from './constants';

export const invalidateParentDirectoryCache = (filePath: string) => {
  let parentDirectory = dirname(filePath);
  if (parentDirectory === '.') {
    parentDirectory = '/';
  }
  commands.executeCommand(COMMANDS.REMOTE_FS.INVALIDATE_CACHE, parentDirectory);
};
