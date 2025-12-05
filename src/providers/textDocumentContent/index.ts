import { ExtensionContext, workspace } from 'vscode';

import { RemoteFileContentProvider } from './RemoteFileContentProvider';

export const registerProviders = (context: ExtensionContext) => {
  const remoteFileContentProvider = RemoteFileContentProvider;
  const scheme = 'hubl';

  context.subscriptions.push(
    workspace.registerTextDocumentContentProvider(
      scheme,
      remoteFileContentProvider
    )
  );
};
