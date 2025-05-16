import { TextDocumentContentProvider, EventEmitter, Uri } from 'vscode';
import { download } from '@hubspot/local-dev-lib/api/fileMapper';
import { getAccountId } from '@hubspot/local-dev-lib/config';
import { requireAccountId } from '../helpers';

export const RemoteFileProvider = new (class
  implements TextDocumentContentProvider
{
  onDidChangeEmitter = new EventEmitter<Uri>();
  onDidChange = this.onDidChangeEmitter.event;

  async provideTextDocumentContent(uri: Uri): Promise<string | undefined> {
    requireAccountId();
    const filepath = uri.toString().split(':')[1];
    // filepath must be de-encoded since it gets reencoded by download in cli-lib
    const decodedFilePath = decodeURIComponent(filepath);
    try {
      const { data: file } = await download(getAccountId()!, decodedFilePath);
      return `[[ READONLY: @remote/${decodedFilePath} ]]\n` + file.source;
    } catch (e) {
      console.log(e);
    }
  }
})();
