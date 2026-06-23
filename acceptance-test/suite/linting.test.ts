import * as assert from 'assert';
import * as vscode from 'vscode';

const EXTENSION_ID = 'HubSpot.hubl';
const LINTING_DEBOUNCE_MS = 1200; // triggerValidate uses 1000ms setTimeout

suite('HubL linting', () => {
  let workspaceFolder: vscode.WorkspaceFolder;

  suiteSetup(async function () {
    const wf = vscode.workspace.workspaceFolders?.[0];
    if (!wf) return this.skip();
    workspaceFolder = wf;
    await vscode.extensions.getExtension(EXTENSION_ID)!.activate();
  });

  function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  test('no HubL diagnostics produced for non-HubL files', async () => {
    const uri = vscode.Uri.joinPath(workspaceFolder.uri, '_lint_test.ts');
    await vscode.workspace.fs.writeFile(
      uri,
      new TextEncoder().encode('const x = 1;')
    );
    try {
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc);
      const edit = new vscode.WorkspaceEdit();
      edit.insert(uri, new vscode.Position(0, 0), '// ');
      await vscode.workspace.applyEdit(edit);
      await wait(LINTING_DEBOUNCE_MS);
      const diagnostics = vscode.languages.getDiagnostics(uri);
      assert.strictEqual(
        diagnostics.length,
        0,
        'TypeScript files must not receive HubL diagnostics'
      );
    } finally {
      await vscode.commands.executeCommand('workbench.action.closeAllEditors');
      await vscode.workspace.fs.delete(uri);
    }
  });

  test('HubL diagnostic collection is cleared when switching from html-hubl to plaintext', async () => {
    const uri = vscode.Uri.joinPath(
      workspaceFolder.uri,
      '_lint_switch_test.html-hubl'
    );
    await vscode.workspace.fs.writeFile(
      uri,
      new TextEncoder().encode('{{ content }}')
    );
    try {
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.languages.setTextDocumentLanguage(doc, 'html-hubl');
      await vscode.window.showTextDocument(doc);

      // Switch language away from html-hubl — triggerValidate should clear diagnostics
      await vscode.languages.setTextDocumentLanguage(doc, 'plaintext');
      const edit = new vscode.WorkspaceEdit();
      edit.insert(uri, new vscode.Position(0, 0), ' ');
      await vscode.workspace.applyEdit(edit);
      await wait(LINTING_DEBOUNCE_MS);

      const diagnostics = vscode.languages.getDiagnostics(uri);
      assert.strictEqual(
        diagnostics.length,
        0,
        'Diagnostics must be cleared for non-HubL language'
      );
    } finally {
      await vscode.commands.executeCommand('workbench.action.closeAllEditors');
      await vscode.workspace.fs.delete(uri);
    }
  });
});
