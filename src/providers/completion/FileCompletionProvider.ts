import * as vscode from 'vscode';
import * as path from 'path';

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

const getCompletionItems = (
  currentFileDir: string,
  lineSuffix: string,
  triggerCharacter?: string
) => {
  return findInitialFiles(currentFileDir).then((files) => {
    return files.map((file) => {
      const item = new vscode.CompletionItem(
        `./${file}`,
        vscode.CompletionItemKind.File
      );
      if (checkIfClosingQuoteExists(lineSuffix, triggerCharacter)) {
        item.insertText = `./${file}${triggerCharacter} `;
      }
      return item;
    });
  });
};

export class FileCompletionProvider
  implements vscode.CompletionItemProvider<vscode.CompletionItem>
{
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    { triggerCharacter }: vscode.CompletionContext
  ) {
    const linePrefix = document.getText(
      new vscode.Range(position.line, 0, position.line, position.character)
    );

    if (!shouldProvideCompletion(linePrefix)) {
      return [];
    }

    const lineSuffix = document.getText(
      new vscode.Range(position.line, position.character, position.line, 999)
    );

    const currentFileDir = path.dirname(document.uri.fsPath);

    return getCompletionItems(currentFileDir, lineSuffix, triggerCharacter);
  }
}
