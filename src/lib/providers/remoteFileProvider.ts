import {
  TextDocumentContentProvider,
  EventEmitter,
  Uri
} from 'vscode';
const { download } = require('@hubspot/cli-lib/api/fileMapper');
const { getPortalId } = require('@hubspot/cli-lib');

export const RemoteFileProvider = new (class implements TextDocumentContentProvider
{
  onDidChangeEmitter = new EventEmitter<Uri>();
  onDidChange = this.onDidChangeEmitter.event;

  async provideTextDocumentContent(
    uri: Uri
  ): Promise<string | undefined> {
    const filepath = uri.toString().split(':')[1];
    try {
      // filepath must be de-encoded since it gets reencoded by download in cli-lib
      const file = await download(
        getPortalId(),
        `/${decodeURIComponent(filepath)}`
      );
      return file.source;
    } catch (e) {
      console.log(e);
    }
  }
})();
