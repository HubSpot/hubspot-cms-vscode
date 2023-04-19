import { TextDocumentContentProvider, EventEmitter, Uri } from 'vscode';
const { download } = require('@hubspot/cli-lib/api/fileMapper');
const { getPortalId } = require('@hubspot/cli-lib');

export const RemoteFileProvider = new (class
  implements TextDocumentContentProvider
{
  onDidChangeEmitter = new EventEmitter<Uri>();
  onDidChange = this.onDidChangeEmitter.event;

  async provideTextDocumentContent(uri: Uri): Promise<string | undefined> {
    const filepath = uri.toString().split(':')[1];
    // filepath must be de-encoded since it gets reencoded by download in cli-lib
    const decodedFilePath = decodeURIComponent(filepath);
    try {
      const file = await download(getPortalId(), decodedFilePath);
      return `[[ READONLY: @remote/${decodedFilePath} ]]\n` + file.source;
    } catch (e) {
      console.log(e);
    }
  }
})();
