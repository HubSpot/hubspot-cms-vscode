"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCompletionProvider = void 0;
const vscode = require("vscode");
const path = require("path");
async function findInitialFiles(fileDir) {
    const files = [];
    const pattern = new vscode.RelativePattern(fileDir, '**/*');
    for (const file of await vscode.workspace.findFiles(pattern)) {
        files.push(path.relative(fileDir, file.path));
    }
    return files;
}
const shouldProvideCompletion = (linePrefix) => {
    return /((?:include)|(?:import)|(?:extends)|(?:path=))\s*?(?:'|")$/.test(linePrefix);
};
const checkIfClosingQuoteExists = (lineSuffix, triggerCharacter) => {
    return triggerCharacter && !lineSuffix.startsWith(triggerCharacter);
};
const getCompletionItems = (currentFileDir, lineSuffix, triggerCharacter) => {
    return findInitialFiles(currentFileDir).then((files) => {
        return files.map((file) => {
            const item = new vscode.CompletionItem(`./${file}`, vscode.CompletionItemKind.File);
            if (checkIfClosingQuoteExists(lineSuffix, triggerCharacter)) {
                item.insertText = `./${file}${triggerCharacter} `;
            }
            return item;
        });
    });
};
class FileCompletionProvider {
    provideCompletionItems(document, position, token, { triggerCharacter }) {
        const linePrefix = document.getText(new vscode.Range(position.line, 0, position.line, position.character));
        if (!shouldProvideCompletion(linePrefix)) {
            return [];
        }
        const lineSuffix = document.getText(new vscode.Range(position.line, position.character, position.line, 999));
        const currentFileDir = path.dirname(document.uri.fsPath);
        return getCompletionItems(currentFileDir, lineSuffix, triggerCharacter);
    }
}
exports.FileCompletionProvider = FileCompletionProvider;
//# sourceMappingURL=fileCompletion.js.map