import * as vscode from 'vscode';
const { download } = require('@hubspot/cli-lib/api/fileMapper');
const { getPortalId } = require('@hubspot/cli-lib');

export const RemoteFileProvider = new (class
  implements vscode.TextDocumentContentProvider
{
  onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this.onDidChangeEmitter.event;

  async provideTextDocumentContent(
    uri: vscode.Uri
  ): Promise<string | undefined> {
    const filepath = uri.toString().split(':')[1];
    try {
      const file = await download(getPortalId(), `/${filepath}`);
      return file.source;
    } catch (e) {
      console.log(e);
    }
  }
})();