import * as assert from 'assert';
import * as vscode from 'vscode';

const EXTENSION_ID = 'HubSpot.hubl';

suite('File completion provider (via VS Code pipeline)', () => {
  let workspaceFolder: vscode.WorkspaceFolder;
  let docUri: vscode.Uri;

  suiteSetup(async function () {
    const wf = vscode.workspace.workspaceFolders?.[0];
    if (!wf) {
      return this.skip();
    }
    workspaceFolder = wf;
    await vscode.extensions.getExtension(EXTENSION_ID)!.activate();
    docUri = vscode.Uri.joinPath(
      workspaceFolder.uri,
      '_completion_test.html-hubl'
    );
    // Pre-create the file so openTextDocument always has a valid on-disk URI
    await vscode.workspace.fs.writeFile(docUri, new TextEncoder().encode(''));
  });

  suiteTeardown(async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    try {
      await vscode.workspace.fs.delete(docUri);
    } catch (_) {}
  });

  // Writing to a file that VS Code already has open does NOT update the in-memory
  // document model. Use WorkspaceEdit to patch the model directly so every test
  // sees exactly the content it wrote, regardless of what previous tests left behind.
  async function setDocContent(
    content: string,
    uri: vscode.Uri,
    languageId: string
  ): Promise<void> {
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.languages.setTextDocumentLanguage(doc, languageId);
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
      uri,
      doc.validateRange(new vscode.Range(0, 0, Infinity, Infinity)),
      content
    );
    await vscode.workspace.applyEdit(edit);
    await vscode.window.showTextDocument(doc);
  }

  // Drives VS Code's real completion pipeline so the test covers:
  //   - provider registration (wrong language ID → 0 results)
  //   - trigger character wiring (' and " configured in registerCompletionItemProvider)
  //   - FileCompletionProvider.provideCompletionItems guard logic
  //   - the actual filesystem scan via vscode.workspace.findFiles
  async function getFileCompletions(
    lineContent: string,
    triggerChar: string,
    uri = docUri,
    languageId = 'html-hubl'
  ): Promise<vscode.CompletionItem[]> {
    await setDocContent(lineContent, uri, languageId);

    const list = (await vscode.commands.executeCommand(
      'vscode.executeCompletionItemProvider',
      uri,
      new vscode.Position(0, lineContent.length),
      triggerChar
    )) as vscode.CompletionList;

    return list.items.filter(
      (item) => item.kind === vscode.CompletionItemKind.File
    );
  }

  suite('trigger character registration', () => {
    test('single quote triggers file completions', async () => {
      const items = await getFileCompletions("{% include '", "'");
      assert.ok(
        items.length > 0,
        'Expected FileCompletionProvider to fire for single-quote trigger'
      );
    });

    test('double quote triggers file completions', async () => {
      const items = await getFileCompletions('{% include "', '"');
      assert.ok(
        items.length > 0,
        'Expected FileCompletionProvider to fire for double-quote trigger'
      );
    });
  });

  suite('HubL keyword patterns', () => {
    test('extends keyword', async () => {
      const items = await getFileCompletions("{% extends '", "'");
      assert.ok(items.length > 0, 'extends should trigger file completion');
    });

    test('import keyword', async () => {
      const items = await getFileCompletions("{% import '", "'");
      assert.ok(items.length > 0, 'import should trigger file completion');
    });

    test('path= attribute', async () => {
      const items = await getFileCompletions("<module path='", "'");
      assert.ok(items.length > 0, 'path= should trigger file completion');
    });

    // Verifies the shouldProvideCompletion guard works end-to-end inside VS Code —
    // not just that the function returns [] locally, but that the whole pipeline
    // produces no File-kind items when the line doesn't match the pattern.
    test('non-HubL lines produce no file completions', async () => {
      const items = await getFileCompletions('<div class="', '"');
      assert.strictEqual(
        items.length,
        0,
        'shouldProvideCompletion guard must reject plain HTML lines in the real pipeline'
      );
    });
  });

  // The provider is registered only for html-hubl (see providers/completion/index.ts).
  // This test would catch a regression where someone accidentally adds css-hubl.
  suite('language scope', () => {
    test('no file completions for css-hubl documents', async () => {
      const cssUri = vscode.Uri.joinPath(
        workspaceFolder.uri,
        '_css_completion_test.css-hubl'
      );
      try {
        await vscode.workspace.fs.writeFile(
          cssUri,
          new TextEncoder().encode('')
        );
        await setDocContent("{% include '", cssUri, 'css-hubl');

        const list = (await vscode.commands.executeCommand(
          'vscode.executeCompletionItemProvider',
          cssUri,
          new vscode.Position(0, "{% include '".length),
          "'"
        )) as vscode.CompletionList;

        const fileItems = list.items.filter(
          (item) => item.kind === vscode.CompletionItemKind.File
        );
        assert.strictEqual(
          fileItems.length,
          0,
          'FileCompletionProvider must not be registered for css-hubl'
        );
      } finally {
        try {
          await vscode.workspace.fs.delete(cssUri);
        } catch (_) {}
      }
    });
  });

  suite('completion item shape', () => {
    test('items reference actual files in the workspace', async () => {
      const items = await getFileCompletions("{% include '", "'");
      const labels = items.map((item) =>
        typeof item.label === 'string' ? item.label : item.label.label
      );
      assert.ok(
        labels.some((l) => l.includes('module.html')),
        `module.html not found in: ${labels.join(', ')}`
      );
      assert.ok(
        labels.some((l) => l.includes('partial.html')),
        `partial.html not found in: ${labels.join(', ')}`
      );
    });

    test('labels are relative paths prefixed with "./"', async () => {
      const items = await getFileCompletions("{% include '", "'");
      assert.ok(items.length > 0);
      for (const item of items) {
        const label =
          typeof item.label === 'string' ? item.label : item.label.label;
        assert.ok(
          label.startsWith('./'),
          `Expected relative path, got: "${label}"`
        );
      }
    });

    test('all items have CompletionItemKind.File', async () => {
      const items = await getFileCompletions("{% include '", "'");
      assert.ok(items.length > 0);
      for (const item of items) {
        assert.strictEqual(
          item.kind,
          vscode.CompletionItemKind.File,
          `Unexpected kind for "${item.label}"`
        );
      }
    });

    // When no closing quote already exists on the line, the provider appends
    // the trigger character + space so the cursor lands after the closing quote.
    test('insertText appends closing quote when line has no closing quote', async () => {
      const items = await getFileCompletions("{% include '", "'");
      assert.ok(items.length > 0);
      for (const item of items) {
        if (typeof item.insertText === 'string') {
          assert.ok(
            item.insertText.endsWith("' "),
            `Expected insertText to close the quote, got: "${item.insertText}"`
          );
        }
      }
    });

    test('insertText omits closing quote when line already has one', async () => {
      // Line already has closing quote: {% include ''  — cursor is between the quotes
      const lineContent = "{% include ''";
      await setDocContent(lineContent, docUri, 'html-hubl');

      // Position the cursor between the quotes (after the opening quote)
      const position = new vscode.Position(0, "{% include '".length);
      const list = (await vscode.commands.executeCommand(
        'vscode.executeCompletionItemProvider',
        docUri,
        position,
        "'"
      )) as vscode.CompletionList;

      const fileItems = list.items.filter(
        (item) => item.kind === vscode.CompletionItemKind.File
      );
      assert.ok(fileItems.length > 0);
      for (const item of fileItems) {
        if (typeof item.insertText === 'string') {
          assert.ok(
            !item.insertText.endsWith("' "),
            `Expected no appended closing quote, got: "${item.insertText}"`
          );
        }
      }
    });
  });
});
