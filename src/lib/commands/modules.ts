import { ExtensionContext, commands } from 'vscode';
import { COMMANDS, TRACKED_EVENTS } from '../constants';
import { onClickCreateFolder } from '../fileHelpers';
import { trackEvent } from '../tracking';
const path = require('path');

const { createModule } = require('@hubspot/local-dev-lib/cms/modules');

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.MODULE,
      onClickCreateFolder('module', async (folderPath: string) => {
        const { dir, base } = path.parse(folderPath);
        await createModule(
          {
            moduleLabel: '',
            contentTypes: [],
            global: false,
          },
          base,
          dir,
          false,
          { allowExistingDir: true }
        );
        trackEvent(TRACKED_EVENTS.CREATE.MODULE);
      })
    )
  );
};
