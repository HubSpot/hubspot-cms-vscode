import { ExtensionContext, commands } from 'vscode';
import { COMMANDS, TRACKED_EVENTS, TEMPLATE_NAMES } from '../constants';
import { onClickCreateFile } from '../fileHelpers';
import { basename, dirname } from 'path';
import { trackEvent } from '../tracking';

const { createTemplate } = require('@hubspot/cli-lib/templates');

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.SECTION,
      onClickCreateFile('html', async (uniqueFilePath: string) => {
        await createTemplate(
          basename(uniqueFilePath),
          dirname(uniqueFilePath),
          TEMPLATE_NAMES.SECTION,
          { allowExisting: true }
        );
        trackEvent(TRACKED_EVENTS.CREATE.SECTION);
      })
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.TEMPLATE,
      onClickCreateFile('html', async (uniqueFilePath: string) => {
        await createTemplate(
          basename(uniqueFilePath),
          dirname(uniqueFilePath),
          TEMPLATE_NAMES.TEMPLATE,
          { allowExisting: true }
        );
        trackEvent(TRACKED_EVENTS.CREATE.TEMPLATE);
      })
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.PARTIAL,
      onClickCreateFile('html', async (uniqueFilePath: string) => {
        await createTemplate(
          basename(uniqueFilePath),
          dirname(uniqueFilePath),
          TEMPLATE_NAMES.PARTIAL,
          { allowExisting: true }
        );
        trackEvent(TRACKED_EVENTS.CREATE.PARTIAL);
      })
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.GLOBAL_PARTIAL,
      onClickCreateFile('html', async (uniqueFilePath: string) => {
        await createTemplate(
          basename(uniqueFilePath),
          dirname(uniqueFilePath),
          TEMPLATE_NAMES.GLOBAL_PARTIAL,
          { allowExisting: true }
        );
        trackEvent(TRACKED_EVENTS.CREATE.GLOBAL_PARTIAL);
      })
    )
  );
};
