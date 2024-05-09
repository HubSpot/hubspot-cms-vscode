import { ExtensionContext, commands, window } from 'vscode';
import { COMMANDS, TRACKED_EVENTS } from '../constants';
import { onClickCreateFile, onClickCreateFolder } from '../fileHelpers';
import { basename, dirname, join, parse } from 'path';
import { trackEvent } from '../tracking';

const findup = require('findup-sync');
const { createFunction } = require('@hubspot/local-dev-lib/cms/functions');

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.SERVERLESS_FUNCTION,
      onClickCreateFile('js', (filePath: string) => {
        if (!new RegExp('(.*).functions(.*)').test(filePath)) {
          window.showErrorMessage('Could not find parent .functions folder!');
          return;
        }
        const functionsFolderPath = findup('*.functions', {
          cwd: join(filePath, '..'),
          nocase: true,
        });
        const functionsFolderDest = dirname(functionsFolderPath);
        const functionsFolderName = basename(functionsFolderPath);
        const functionFileName = filePath.slice(functionsFolderPath.length + 1);
        createFunction(
          {
            functionsFolder: functionsFolderName,
            filename: functionFileName,
            endpointPath: functionFileName.slice(0, -3),
            endpointMethod: 'GET',
          },
          functionsFolderDest,
          {
            allowExistingFile: true,
          }
        );
        trackEvent(TRACKED_EVENTS.CREATE.SERVERLESS_FUNCTION);
      })
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.SERVERLESS_FUNCTION_FOLDER,
      onClickCreateFolder('functions', (folderPath: string) => {
        const { dir, base } = parse(folderPath);
        if (new RegExp('(.*).functions(.*)').test(dir)) {
          window.showErrorMessage(
            'Cannot create functions folder within another functions folder!'
          );
          return;
        }
        createFunction(
          {
            functionsFolder: base,
            filename: 'serverless',
            endpointPath: 'serverless',
            endpointMethod: 'GET',
          },
          dir
        );
        trackEvent(TRACKED_EVENTS.CREATE.SERVERLESS_FUNCTION_FOLDER);
      })
    )
  );
};
