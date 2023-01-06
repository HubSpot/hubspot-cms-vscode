import {
  ExtensionContext,
  commands,
  FileCreateEvent,
  WorkspaceEdit,
  Uri,
  workspace,
  window,
} from 'vscode';
import { COMMANDS, TRACKED_EVENTS, TEMPLATE_NAMES } from '../constants';
import { getUniquePathName } from '../fileHelpers';
const findup = require('findup-sync');
const { createTemplate } = require('@hubspot/cli-lib/templates');
const { createModule } = require('@hubspot/cli-lib/modules');
const { createFunction } = require('@hubspot/cli-lib/functions');
import * as path from 'path';
import { trackEvent } from '../tracking';

// returns a listener that deletes the created file and then allows a given callback to run
// doAfter receives unique filepath with the given extension
// ex: extension given is "html", user types "example", but "example.html" already exists. doAfter receives "example1.html"
const buildFileCreateListener = (
  extension: string,
  folderPath: string,
  doAfter: Function,
  cleanupCallback: Function
) => {
  return async (e: FileCreateEvent) => {
    if (
      e.files?.length === 1 &&
      new RegExp(`${folderPath}/.*`).test(e.files[0].fsPath)
    ) {
      cleanupCallback();
      const uniqueFilePath = getUniquePathName(e.files[0].fsPath, extension);
      if (e.files[0].fsPath !== uniqueFilePath) {
        const edit = new WorkspaceEdit();
        edit.renameFile(e.files[0], Uri.file(uniqueFilePath));
        await workspace.applyEdit(edit);
      }
      await doAfter(uniqueFilePath);
    }
  };
};

// doAfter receives (filepath: string)
const onClickCreateFile = (extension: string, doAfter: Function) => {
  return (clickContext: any) => {
    if (clickContext.scheme === 'file') {
      const createFileSubscription = workspace.onDidCreateFiles(
        buildFileCreateListener(extension, clickContext.fsPath, doAfter, () =>
          createFileSubscription.dispose()
        )
      );
      commands.executeCommand('explorer.newFile');
    }
  };
};
const onClickCreateFolder = (extension: string, doAfter: Function) => {
  return (clickContext: any) => {
    if (clickContext.scheme === 'file') {
      const createFileSubscription = workspace.onDidCreateFiles(
        buildFileCreateListener(extension, clickContext.fsPath, doAfter, () =>
          createFileSubscription.dispose()
        )
      );
      commands.executeCommand('explorer.newFolder');
    }
  };
};

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.SECTION,
      onClickCreateFile('html', async (uniqueFilePath: string) => {
        await createTemplate(
          path.basename(uniqueFilePath),
          path.dirname(uniqueFilePath),
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
          path.basename(uniqueFilePath),
          path.dirname(uniqueFilePath),
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
          path.basename(uniqueFilePath),
          path.dirname(uniqueFilePath),
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
          path.basename(uniqueFilePath),
          path.dirname(uniqueFilePath),
          TEMPLATE_NAMES.GLOBAL_PARTIAL,
          { allowExisting: true }
        );
        trackEvent(TRACKED_EVENTS.CREATE.GLOBAL_PARTIAL);
      })
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.MODULE,
      onClickCreateFolder('module', async (folderPath: string) => {
        await createModule(
          {
            moduleLabel: '',
            contentTypes: [],
            global: false,
          },
          '',
          folderPath,
          { allowExistingDir: true }
        );
        trackEvent(TRACKED_EVENTS.CREATE.MODULE);
      })
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.SERVERLESS_FUNCTION,
      onClickCreateFile('js', (filePath: string) => {
        if (!new RegExp('(.*).functions(.*)').test(filePath)) {
          window.showErrorMessage('Could not find parent .functions folder!');
          return;
        }
        const functionsFolderPath = findup('*.functions', {
          cwd: path.join(filePath, '..'),
          nocase: true,
        });
        const functionsFolderDest = path.dirname(functionsFolderPath);
        const functionsFolderName = path.basename(functionsFolderPath);
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
        const { dir, base } = path.parse(folderPath);
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
