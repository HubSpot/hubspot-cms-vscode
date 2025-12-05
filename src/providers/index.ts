import { ExtensionContext } from 'vscode';

import { registerProviders as registerCompletionProviders } from './completion';
import { registerProviders as registerTextDocumentContentProviders } from './textDocumentContent';
import { registerProviders as registerTreeDataProviders } from './treeData';

export const registerProviders = (context: ExtensionContext) => {
  registerCompletionProviders();
  registerTextDocumentContentProviders(context);
  registerTreeDataProviders(context);
};
