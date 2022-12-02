import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AccountsProvider } from './providers/accountsProvider';
import { COMMANDS, TREE_DATA } from './constants';

export const initializeProviders = (context: vscode.ExtensionContext) => {
  const accountProvider = new AccountsProvider();

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.ACCOUNTS_REFRESH, () => {
      console.log(COMMANDS.ACCOUNTS_REFRESH);
      accountProvider.refresh();
    })
  );
  vscode.window.registerTreeDataProvider(TREE_DATA.ACCOUNTS, accountProvider);

  const filePathHandler = {
    provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position
    ) {
      const linePrefix = document
        .lineAt(position)
        .text.substr(0, position.character);
      if (!linePrefix.endsWith("include '")) {
        return undefined;
      }
      const files: vscode.CompletionItem[] = [];
      try {
        const filePath = document.uri.fsPath;
        const fileDir = path.dirname(filePath);
        fs.readdirSync(fileDir).forEach((file) => {
          files.push(
            new vscode.CompletionItem(
              `./${file}`,
              vscode.CompletionItemKind.File
            )
          );
        });
      } catch (e) {
        console.log('err', e);
      }
      return files;
    },
    // This is triggered when selecting an option- may not need this
    //@ts-ignore
    resolveCompletionItem(item) {
      console.log(item);
    },
  };

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'html-hubl',
      //@ts-ignore
      filePathHandler,
      "'"
    )
  );
};
