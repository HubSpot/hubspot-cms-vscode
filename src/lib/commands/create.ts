import {
  ExtensionContext,
  commands,
  FileCreateEvent,
  WorkspaceEdit,
  Uri,
  workspace,
} from 'vscode';
import { COMMANDS } from '../constants';
import { getUniquePathName } from '../fileHelpers';
const findup = require('findup-sync');
const { createTemplate } = require('@hubspot/cli-lib/templates');
const { createModule } = require('@hubspot/cli-lib/modules');
const { createFunction } = require('@hubspot/cli-lib/functions');
import * as path from 'path';

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
      doAfter(uniqueFilePath);
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
      onClickCreateFile('html', (uniqueFilePath: string) => {
        createTemplate(
          path.basename(uniqueFilePath),
          path.dirname(uniqueFilePath),
          'section',
          { allowExisting: true }
        );
      })
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.TEMPLATE,
      onClickCreateFile('html', (uniqueFilePath: string) => {
        createTemplate(
          path.basename(uniqueFilePath),
          path.dirname(uniqueFilePath),
          'page-template',
          { allowExisting: true }
        );
      })
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.PARTIAL,
      onClickCreateFile('html', (uniqueFilePath: string) => {
        createTemplate(
          path.basename(uniqueFilePath),
          path.dirname(uniqueFilePath),
          'partial',
          { allowExisting: true }
        );
      })
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.GLOBAL_PARTIAL,
      onClickCreateFile('html', (uniqueFilePath: string) => {
        createTemplate(
          path.basename(uniqueFilePath),
          path.dirname(uniqueFilePath),
          'global-partial',
          { allowExisting: true }
        );
      })
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.MODULE,
      onClickCreateFolder('module', (folderPath: string) => {
        createModule(
          {
            moduleLabel: '',
            contentTypes: [],
            global: false,
          },
          '',
          folderPath,
          { allowExistingDir: true }
        );
      })
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.SERVERLESS_FUNCTION,
      onClickCreateFile('js', (filePath: string) => {
        const functionsFolderPath = findup('*.functions', {
          cwd: filePath,
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
      })
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.CREATE.SERVERLESS_FUNCTION_FOLDER,
      onClickCreateFolder('functions', (folderPath: string) => {
        const { dir, base } = path.parse(folderPath);
        createFunction(
          {
            functionsFolder: base,
            filename: 'serverless',
            endpointPath: 'serverless',
            endpointMethod: 'GET',
          },
          dir
        );
      })
    )
  );
};
