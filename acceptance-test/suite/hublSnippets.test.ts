import * as assert from 'assert';
import * as vscode from 'vscode';

const EXTENSION_ID = 'HubSpot.hubl';

suite('HubL snippets', () => {
  let workspaceFolder: vscode.WorkspaceFolder;

  suiteSetup(async function () {
    const wf = vscode.workspace.workspaceFolders?.[0];
    if (!wf) return this.skip();
    workspaceFolder = wf;
    await vscode.extensions.getExtension(EXTENSION_ID)!.activate();
  });

  async function getSnippetsAt(lineContent: string, uri: vscode.Uri) {
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.languages.setTextDocumentLanguage(doc, 'html-hubl');
    const edit = new vscode.WorkspaceEdit();
    edit.replace(uri, doc.validateRange(new vscode.Range(0, 0, Infinity, Infinity)), lineContent);
    await vscode.workspace.applyEdit(edit);
    await vscode.window.showTextDocument(doc);

    const list = await vscode.commands.executeCommand(
      'vscode.executeCompletionItemProvider',
      uri,
      new vscode.Position(0, lineContent.length)
    ) as vscode.CompletionList;

    return list.items.filter(i => i.kind === vscode.CompletionItemKind.Snippet);
  }

  // Tag snippets use "~" as their prefix (e.g. ~block, ~blog_comments).
  test('HubL tag snippets available in html-hubl files', async () => {
    const uri = vscode.Uri.joinPath(workspaceFolder.uri, '_snippets_test.html-hubl');
    await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(''));
    try {
      const snippets = await getSnippetsAt('~', uri);
      assert.ok(snippets.length > 0, 'Expected HubL tag snippets after ~');
    } finally {
      await vscode.workspace.fs.delete(uri);
    }
  });

  // Variable/expression snippets use plain-word prefixes (e.g. content.absolute_url).
  test('HubL variable snippets available in html-hubl files', async () => {
    const uri = vscode.Uri.joinPath(workspaceFolder.uri, '_snippets_test2.html-hubl');
    await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(''));
    try {
      const snippets = await getSnippetsAt('content', uri);
      assert.ok(snippets.length > 0, 'Expected HubL variable snippets after "content"');
    } finally {
      await vscode.workspace.fs.delete(uri);
    }
  });

  test('snippets are NOT provided in plain html files', async () => {
    const uri = vscode.Uri.joinPath(workspaceFolder.uri, '_snippets_test.html');
    await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(''));
    try {
      const doc = await vscode.workspace.openTextDocument(uri);
      // Plain html — do NOT set html-hubl language
      await vscode.window.showTextDocument(doc);

      const edit = new vscode.WorkspaceEdit();
      edit.replace(uri, doc.validateRange(new vscode.Range(0, 0, Infinity, Infinity)), '{%');
      await vscode.workspace.applyEdit(edit);

      const list = await vscode.commands.executeCommand(
        'vscode.executeCompletionItemProvider',
        uri,
        new vscode.Position(0, 2)
      ) as vscode.CompletionList;

      const hublSnippets = list.items.filter(
        i =>
          i.kind === vscode.CompletionItemKind.Snippet &&
          typeof i.label === 'string' &&
          i.label.startsWith('{%')
      );
      assert.strictEqual(hublSnippets.length, 0, 'HubL snippets must not appear in plain html');
    } finally {
      await vscode.workspace.fs.delete(uri);
    }
  });
});
