import * as fs from 'fs';
import * as vscode from 'vscode';
const { createModule } = require('@hubspot/cli-lib/modules');

const showNamePrompt = async (
  destinationPath: string
): Promise<string | undefined> => {
  return await vscode.window
    .showInputBox({
      placeHolder: 'What should the module name be?',
    })
    .then(async (name) => {
      if (name) {
        if (fs.existsSync(`${destinationPath}/${name}.module`)) {
          vscode.window.showErrorMessage(
            `A module with the name ${name}.module already exists.`
          );
          return await showNamePrompt(destinationPath);
        }
        return name;
      }
    });
};

const showLabelPrompt = async () => {
  return await vscode.window
    .showInputBox({
      placeHolder: 'What should the module label be?',
    })
    .then((label) => {
      if (label) {
        return label;
      }
    });
};

const showContentTypeSelection = async () => {
  return await vscode.window
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
        return selection.map((s) => s.value);
      }
    });
};

const showGlobalPrompt = async () => {
  return await vscode.window
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
        return selection.value;
      }
    });
};

export const createModuleFlow = async (destinationPath: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const moduleDefinition: {
        moduleLabel: string | undefined;
        contentTypes: string[] | undefined;
        global: boolean | undefined;
      } = {
        moduleLabel: '',
        contentTypes: [],
        global: false,
      };
      let moduleName: string | undefined;

      await showNamePrompt(destinationPath).then(async (name) => {
        moduleName = name;
        await showLabelPrompt().then(async (label) => {
          moduleDefinition.moduleLabel = label;
          await showContentTypeSelection().then(async (contentTypes) => {
            moduleDefinition.contentTypes = contentTypes;
            await showGlobalPrompt().then(async (global) => {
              moduleDefinition.global = global;
              resolve(
                createModule(moduleDefinition, moduleName, destinationPath)
              );
            });
          });
        });
      });
    } catch (e: any) {
      reject(e);
    }
  });
};
