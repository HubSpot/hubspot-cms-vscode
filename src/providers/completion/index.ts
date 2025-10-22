import { languages } from 'vscode';

import { FileCompletionProvider } from './FileCompletionProvider';
import { HUBL_HTML_ID } from '../../lib/constants';

export const registerProviders = () => {
  const fileCompletionProvider = new FileCompletionProvider();

  languages.registerCompletionItemProvider(
    HUBL_HTML_ID,
    fileCompletionProvider,
    "'",
    '"'
  );
};
