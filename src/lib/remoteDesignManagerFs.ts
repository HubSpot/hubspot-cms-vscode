import { dirname } from 'path';
import { commands } from 'vscode';

import { EVENTS } from './constants';

export const invalidateParentDirectoryCache = (filePath: string) => {
  let parentDirectory = dirname(filePath);
  if (parentDirectory === '.') {
    parentDirectory = '/';
  }
  commands.executeCommand(EVENTS.REMOTE_FS.INVALIDATE_CACHE, parentDirectory);
};
