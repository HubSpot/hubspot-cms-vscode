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

  async function findInitialFiles(fileDir: string) {
    const files = [];
    const pattern = new vscode.RelativePattern(fileDir, '**/*');
    for (const file of await vscode.workspace.findFiles(pattern)) {
      files.push(path.relative(fileDir, file.path));
    }
    return files;
  }

  const shouldProvideCompletion = (linePrefix: string) => {
    return /((?:include)|(?:import)|(?:extends)|(?:path=))\s*?(?:'|")$/.test(
      linePrefix
    );
  };

  const checkIfClosingQuoteExists = (
    lineSuffix: string,
    triggerCharacter?: string
  ) => {
    return triggerCharacter && !lineSuffix.startsWith(triggerCharacter);
  };
  const filePathHandler = {
    async provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position,
      token: vscode.CancellationToken,
      { triggerCharacter }: vscode.CompletionContext
    ) {
      const linePrefix = document.getText(
        new vscode.Range(position.line, 0, position.line, position.character)
      );

      if (!shouldProvideCompletion(linePrefix)) {
        return undefined;
      }

      const lineSuffix = document.getText(
        new vscode.Range(position.line, position.character, position.line, 999)
      );

      try {
        // TODO: getCompletionItems()
        const currentFileDir = path.dirname(document.uri.fsPath);
        const filesInDir = await findInitialFiles(currentFileDir);

        return filesInDir.map((file) => {
          const item = new vscode.CompletionItem(
            `./${file}`,
            vscode.CompletionItemKind.File
          );
          if (checkIfClosingQuoteExists(lineSuffix, triggerCharacter)) {
            item.insertText = `./${file}${triggerCharacter} `;
            return item;
          }
        });
      } catch (e) {
        console.log('There was an error reading the directory');
      }
      return [];
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
      "'",
      '"'
    )
  );
};
