export const commands = {
  executeCommand: () => Promise.resolve(),
};

export const workspace = {
  onDidCreateFiles: () => ({ dispose: () => {} }),
  onWillCreateFiles: () => ({ dispose: () => {} }),
  onDidOpenTextDocument: () => ({ dispose: () => {} }),
  applyEdit: () => Promise.resolve(true),
  fs: {
    stat: () => Promise.resolve({}),
    readFile: () => Promise.resolve(new Uint8Array()),
  },
  workspaceFolders: undefined as any[] | undefined,
  getConfiguration: (_section?: string) =>
    ({
      get: (_key: string) => undefined,
      update: () => Promise.resolve(),
      telemetry: { enableTelemetry: true },
    }) as any,
  findFiles: () => Promise.resolve([]),
};

export const window = {
  activeTextEditor: undefined as any,
  showInformationMessage: (..._args: any[]) =>
    Promise.resolve(undefined as any),
  showWarningMessage: (..._args: any[]) => Promise.resolve(undefined as any),
  setStatusBarMessage: (_message: string) => ({ dispose: () => {} }),
  createStatusBarItem: (_alignment?: any) => ({
    text: '',
    show: () => {},
    hide: () => {},
    dispose: () => {},
  }),
  createTerminal: () => ({
    show: () => {},
    sendText: () => {},
    dispose: () => {},
  }),
  registerUriHandler: () => ({ dispose: () => {} }),
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

  static joinPath(uri: Uri, ...pathSegments: string[]): Uri {
    const joined =
      pathSegments.length > 0
        ? uri.path + '/' + pathSegments.join('/')
        : uri.path;
    return new Uri(joined);
  }

  static parse(value: string): Uri {
    return new Uri(value);
  }

  with(change: { path?: string; scheme?: string }): Uri {
    return new Uri(change.path ?? this.path);
  }
}

export class WorkspaceEdit {
  renameFile(_oldUri: Uri, _newUri: Uri): void {}
}

export const DiagnosticSeverity = {
  Error: 0,
  Warning: 1,
  Information: 2,
  Hint: 3,
} as const;

export class Position {
  readonly line: number;
  readonly character: number;
  constructor(line: number, character: number) {
    this.line = line;
    this.character = character;
  }
}

export class Range {
  readonly start: Position;
  readonly end: Position;
  constructor(
    startLine: number,
    startChar: number,
    endLine: number,
    endChar: number
  ) {
    this.start = new Position(startLine, startChar);
    this.end = new Position(endLine, endChar);
  }
}

export const StatusBarAlignment = { Left: 1, Right: 2 } as const;

export const ConfigurationTarget = {
  Global: 1,
  Workspace: 2,
  WorkspaceFolder: 3,
} as const;

export const env = {
  language: 'en',
  machineId: 'test-machine-id',
  shell: '/bin/zsh',
  openExternal: () => Promise.resolve(true),
};

export const version = '1.0.0';
