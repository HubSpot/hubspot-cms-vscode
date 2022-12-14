import { workspace, FileWillCreateEvent, Uri, WorkspaceEdit } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const findup = require('findup-sync');

const { createModule } = require('@hubspot/cli-lib/modules');
const { createFunction } = require('@hubspot/cli-lib/functions');

const copySampleModuleFilesToFolder = (folderPath: string) => {
  return createModule(
    {
      moduleLabel: '',
      contentTypes: [],
      global: false,
    },
    '',
    folderPath,
    { allowExistingDir: true }
  );
};

const copySampleFunctionFilesToFolder = (folderPath: string) => {
  const { dir, base } = path.parse(folderPath);
  return createFunction(
    {
      functionsFolder: base,
      filename: 'serverless',
      endpointPath: 'serverless',
      endpointMethod: 'GET',
    },
    dir
  );
};

/*
 * Returns a non-duplicate folder name with the format <folderName>.<extension>
 * It will add a number to the end of the folder name if it already exists
 * @param folderName - name of a folder
 * @param extension - name of extension
 */
const getUniqueFolderName = (folderPath: string, extension: string) => {
  const folderName = folderPath.split(path.sep).pop() || '';
  const hasExtension = folderName.split('.').pop() === extension;
  let newFolderPath = hasExtension ? folderPath : `${folderPath}.${extension}`;
  let uniqueFolderPath = newFolderPath;

  if (!hasExtension) {
    let incrementor = 0;
    // Add incremental number to folder name if it already exists
    while (fs.existsSync(uniqueFolderPath)) {
      incrementor++;
      const folderPathParts = newFolderPath.split('.');
      folderPathParts.pop();
      uniqueFolderPath = `${folderPathParts.join(
        '.'
      )}${incrementor}.${extension}`;
    }
  }
  return uniqueFolderPath;
};

export const convertFolderToModule = (
  folderPath: string,
  cleanupCallback: Function
) => {
  return (e: FileWillCreateEvent) => {
    return e.waitUntil(
      new Promise((resolve, reject) => {
        try {
          const edit = new WorkspaceEdit();

          if (
            e.files &&
            e.files.length === 1 &&
            new RegExp(`${folderPath}/.*`).test(e.files[0].fsPath)
          ) {
            cleanupCallback();
            const uniqueModulePath = getUniqueFolderName(
              e.files[0].fsPath,
              'module'
            );

            edit.renameFile(e.files[0], Uri.file(uniqueModulePath));

            workspace.applyEdit(edit).then(() => {
              copySampleModuleFilesToFolder(uniqueModulePath);
              resolve(edit);
            });
          }
          reject(edit);
        } catch (e: any) {
          reject(e);
        }
      })
    );
  };
};

export const convertFolderToServerlessFunction = (
  folderPath: string,
  cleanupCallback: Function
) => {
  return (e: FileWillCreateEvent) => {
    return e.waitUntil(
      new Promise((resolve, reject) => {
        try {
          const edit = new WorkspaceEdit();

          if (
            e.files &&
            e.files.length === 1 &&
            new RegExp(`${folderPath}/.*`).test(e.files[0].fsPath)
          ) {
            cleanupCallback();
            const uniqueFunctionsFolderPath = getUniqueFolderName(
              e.files[0].fsPath,
              'functions'
            );

            edit.renameFile(e.files[0], Uri.file(uniqueFunctionsFolderPath));

            workspace.applyEdit(edit).then(() => {
              copySampleFunctionFilesToFolder(uniqueFunctionsFolderPath);
              resolve(edit);
            });
          }
          reject(edit);
        } catch (e: any) {
          reject(e);
        }
      })
    );
  };
};

export const convertFileToServerlessFunction = (
  filePath: string,
  cleanupCallback: Function
) => {
  return (e: FileWillCreateEvent) => {
    return e.waitUntil(
      new Promise((resolve, reject) => {
        try {
          const edit = new WorkspaceEdit();

          if (
            e.files &&
            e.files.length === 1 &&
            new RegExp(`${filePath}/.*`).test(e.files[0].fsPath)
          ) {
            cleanupCallback();
            const uniqueFilePath = getUniqueFolderName(e.files[0].fsPath, 'js');
            const functionsFolderPath = findup('*.functions', {
              cwd: filePath,
              nocase: true,
            });
            const functionsFolderDest = path.dirname(functionsFolderPath);
            const functionsFolderName = path.basename(functionsFolderPath);
            const functionFileName = uniqueFilePath.slice(
              functionsFolderPath.length + 1
            );

            edit.renameFile(e.files[0], Uri.file(uniqueFilePath));

            workspace.applyEdit(edit).then(() => {
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
              resolve(edit);
            });
          }

          reject(edit);
        } catch (e: any) {
          reject(e);
        }
      })
    );
  };
};
