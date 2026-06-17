import * as assert from 'assert';
import * as vscode from 'vscode';

suite('RemoteFileContentProvider', () => {
  suiteSetup(async () => {
    await vscode.extensions.getExtension('HubSpot.hubl')!.activate();
  });

  test('hubl:// scheme is registered — opening a hubl:// URI does not throw "no provider"', async () => {
    const uri = vscode.Uri.parse('hubl://test/some-template.html');
    let threwNoProviderError = false;
    try {
      await vscode.workspace.openTextDocument(uri);
    } catch (e) {
      if (e instanceof Error && e.message.includes('no text content provider')) {
        threwNoProviderError = true;
      }
      // Other errors (API failure, etc.) are acceptable — the scheme IS registered
    }
    assert.strictEqual(threwNoProviderError, false, 'hubl:// scheme must be registered');
  });
});
