import * as fs from 'fs';
import * as vscode from 'vscode';
const { createModule } = require('@hubspot/cli-lib/modules');

const showNamePrompt = async (
  destinationPath: string,
  existingPromise?: { resolve: Function; reject: Function }
) => {
  if (existingPromise) {
    await vscode.window
      .showInputBox({
        placeHolder: 'What should the module name be?',
      })
      .then(async (name) => {
        if (name) {
          if (fs.existsSync(`${destinationPath}/${name}.module`)) {
            vscode.window.showErrorMessage(
              `A module with the name ${name}.module already exists.`
            );
            await showNamePrompt(destinationPath, existingPromise);
          }
          return existingPromise.resolve(name);
        }

        existingPromise.reject();
      });
  } else {
    return new Promise((resolve, reject) => {
      vscode.window
        .showInputBox({
          placeHolder: 'What should the module name be?',
        })
        .then(async (name) => {
          if (name) {
            // check if module already exists
            if (fs.existsSync(`${destinationPath}/${name}.module`)) {
              vscode.window.showErrorMessage(
                `A module with the name ${name}.module already exists.`
              );
              await showNamePrompt(destinationPath, { resolve, reject });
            }
            return resolve(name);
          }

          reject();
        });
    });
  }
};

const showLabelPrompt = async () => {
  return new Promise((resolve, reject) => {
    vscode.window
      .showInputBox({
        placeHolder: 'What should the module label be?',
      })
      .then((label) => {
        if (label) {
          return resolve(label);
        }

        reject();
      });
  });
};

const showContentTypeSelection = async () => {
  return new Promise((resolve, reject) => {
    vscode.window
      .showQuickPick(
        [
          {
            label: 'Pages',
            value: 'PAGE',
          },
          {
            label: 'Blog Posts',
            value: 'BLOG_POST',
          },
          {
            label: 'Blog Listings',
            value: 'BLOG_LISTING',
          },
          {
            label: 'Email',
            value: 'EMAIL',
          },
          {
            label: 'Quotes',
            value: 'QUOTE',
          },
        ],
        {
          placeHolder: 'Where would you like to use this module?',
          canPickMany: true,
        }
      )
      .then((selection) => {
        if (selection && selection.length) {
          return resolve(selection.map((s) => s.value));
        }

        reject();
      });
  });
};

const showGlobalPrompt = async () => {
  return new Promise((resolve, reject) => {
    vscode.window
      .showQuickPick(
        [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        {
          placeHolder: 'Is this a global module?',
          canPickMany: false,
        }
      )
      .then((selection) => {
        if (selection) {
          return resolve(selection.value);
        }

        reject();
      });
  });
};

export const createModuleFlow = async (
  context: vscode.ExtensionContext,
  destinationPath: string
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const moduleDefinition: {
        moduleLabel: string;
        contentTypes: string[];
        global: boolean;
      } = {
        moduleLabel: '',
        contentTypes: [],
        global: false,
      };
      let moduleName;

      await showNamePrompt(destinationPath).then(async (name) => {
        moduleName = name;
        await showLabelPrompt().then(async (label) => {
          // @ts-ignore
          moduleDefinition.moduleLabel = label;
          await showContentTypeSelection().then(async (contentTypes) => {
            // @ts-ignore
            moduleDefinition.contentTypes = contentTypes;
            await showGlobalPrompt().then(async (global) => {
              // @ts-ignore
              moduleDefinition.global = global;
            });
          });
        });
      });
      console.log('moduleDefinition: ', moduleDefinition);

      resolve(createModule(moduleDefinition, moduleName, destinationPath));
    } catch (e) {
      reject(e);
    }
  });
};
