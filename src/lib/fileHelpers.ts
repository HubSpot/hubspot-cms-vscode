import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
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
      filename: "example", 
      endpointPath: "example", 
      endpointMethod: "GET" 
    },
    dir
  );
};

/*
 * Returns a non-duplicate folder name with the format <folderName>.module
 * It will add a number to the end of the folder name if it already exists
 * @param folderName - name of a folder with or without a .module extension
 */
const getUniqueModuleFolderName = (folderPath: string) => {
  const folderName = folderPath.split(path.sep).pop() || '';
  const hasModuleExtension = folderName.split('.').pop() === 'module';
  let modulePath = hasModuleExtension ? folderPath : `${folderPath}.module`;
  let uniqueModulePath = modulePath;

  if (!hasModuleExtension) {
    let incrementor = 0;
    // Add incremental number to module name if it already exists
    while (fs.existsSync(uniqueModulePath)) {
      incrementor++;
      const modulePathParts = modulePath.split('.');
      modulePathParts.pop();
      uniqueModulePath = `${modulePathParts.join('.')}${incrementor}.module`;
    }
  }
  return uniqueModulePath;
};

export const convertFolderToModule = (
  folderPath: string,
  cleanupCallback: Function
) => {
  return (e: vscode.FileWillCreateEvent) => {
    return e.waitUntil(
      new Promise((resolve, reject) => {
        try {
          const edit = new vscode.WorkspaceEdit();

          if (
            e.files &&
            e.files.length === 1 &&
            new RegExp(`${folderPath}/.*`).test(e.files[0].fsPath)
          ) {
            cleanupCallback();
            const uniqueModulePath = getUniqueModuleFolderName(
              e.files[0].fsPath
            );

            edit.renameFile(e.files[0], vscode.Uri.file(uniqueModulePath));
            vscode.workspace.applyEdit(edit).then(() => {
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

/*
 * Returns a non-duplicate folder name with the format <folderName>.functions
 * It will add a number to the end of the folder name if it already exists
 * @param folderName - name of a folder with or without a .functions extension
 */
const getUniqueFunctionsFolderName = (folderPath: string) => {
  const folderName = folderPath.split(path.sep).pop() || '';
  const hasFunctionsExtension = folderName.split('.').pop() === 'functions';
  let functionsPath = hasFunctionsExtension ? folderPath : `${folderPath}.functions`;
  let uniqueFunctionsPath = functionsPath;

  if (!hasFunctionsExtension) {
    let incrementor = 0;
    // Add incremental number to functions folder name if it already exists
    while (fs.existsSync(uniqueFunctionsPath)) {
      incrementor++;
      const functionsPathParts = functionsPath.split('.');
      functionsPathParts.pop();
      uniqueFunctionsPath = `${functionsPathParts.join('.')}${incrementor}.functions`;
    }
  }
  return uniqueFunctionsPath;
};

export const convertFolderToServerlessFunction = (
  folderPath: string,
  cleanupCallback: Function
) => {
  return (e: vscode.FileWillCreateEvent) => {
    return e.waitUntil(
      new Promise((resolve, reject) => {
        try {
          const edit = new vscode.WorkspaceEdit();

          if (
            e.files &&
            e.files.length === 1 &&
            new RegExp(`${folderPath}/.*`).test(e.files[0].fsPath)
          ) {
            cleanupCallback();
            const uniqueFunctionsFolderPath = getUniqueFunctionsFolderName(
              e.files[0].fsPath
            );

            edit.renameFile(e.files[0], vscode.Uri.file(uniqueFunctionsFolderPath));

            vscode.workspace.applyEdit(edit).then(() => {
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
