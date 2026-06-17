export const commands = {
  executeCommand: () => Promise.resolve(),
};

export const workspace = {
  onDidCreateFiles: () => ({ dispose: () => {} }),
  onWillCreateFiles: () => ({ dispose: () => {} }),
  applyEdit: () => Promise.resolve(true),
  fs: {
    stat: () => Promise.resolve({}),
  },
};

export class Uri {
  readonly fsPath: string;
  readonly path: string;
  readonly scheme: string;

  constructor(uriPath: string) {
    this.path = uriPath;
    this.fsPath = uriPath;
    this.scheme = 'file';
  }

  static file(filePath: string): Uri {
    return new Uri(filePath);
  }

  with(change: { path?: string; scheme?: string }): Uri {
    return new Uri(change.path ?? this.path);
  }
}

export class WorkspaceEdit {
  renameFile(_oldUri: Uri, _newUri: Uri): void {}
}
