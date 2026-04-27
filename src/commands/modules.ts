import { ExtensionContext, commands, workspace } from 'vscode';
const path = require('path');

import {
  COMMANDS,
  TRACKED_EVENTS,
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
} from '../lib/constants';
import { onClickCreateFolder } from '../lib/fileHelpers';
import { trackEvent } from '../lib/tracking';

const { createModule } = require('@hubspot/local-dev-lib/cms/modules');

const getDefaultModuleContentTypes = (): string[] => {
  const configured = workspace
    .getConfiguration(EXTENSION_CONFIG_NAME)
    .get<
      string[]
    >(EXTENSION_CONFIG_KEYS.DEFAULT_MODULE_CONTENT_TYPES, ['SITE_PAGE', 'LANDING_PAGE']);

  return Array.isArray(configured) ? configured : ['SITE_PAGE', 'LANDING_PAGE'];
};

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.MODULE,
      onClickCreateFolder('module', async (folderPath: string) => {
        const { dir, base } = path.parse(folderPath);
        await createModule(
          {
            moduleLabel: '',
            contentTypes: getDefaultModuleContentTypes(),
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
