import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const { createModule } = require('@hubspot/cli-lib/modules');

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

          return resolve(edit);
        } catch (e: any) {
          return reject(e);
        }
      })
    );
  };
};
