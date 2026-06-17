import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import { workspace, commands, Uri } from 'vscode';
import {
  getUniquePathName,
  doesFileExist,
  dirname,
  onClickCreateFile,
} from '../fileHelpers';

vi.mock('fs');

describe('getUniquePathName', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns path as-is when it already has the correct extension', () => {
    const result = getUniquePathName('/some/path/folder.module', 'module');
    expect(result).toBe('/some/path/folder.module');
    expect(fs.existsSync).not.toHaveBeenCalled();
  });

  it('appends extension when file does not already exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = getUniquePathName('/some/path/folder', 'module');
    expect(result).toBe('/some/path/folder.module');
  });

  it('increments suffix when file with extension already exists', () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true).mockReturnValue(false);
    const result = getUniquePathName('/some/path/folder', 'module');
    expect(result).toBe('/some/path/folder1.module');
  });

  it('increments multiple times to find a unique name', () => {
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValue(false);
    const result = getUniquePathName('/some/path/folder', 'module');
    expect(result).toBe('/some/path/folder3.module');
  });

  it('does not check filesystem when path already ends with the target extension', () => {
    const result = getUniquePathName(
      '/some/path/my-functions.functions',
      'functions'
    );
    expect(result).toBe('/some/path/my-functions.functions');
    expect(fs.existsSync).not.toHaveBeenCalled();
  });

  it('treats a dotted name whose final segment matches extension as already having it', () => {
    // 'my.module.module' → split('.').pop() === 'module' → hasExtension = true → no-op
    const result = getUniquePathName('/some/path/my.module.module', 'module');
    expect(result).toBe('/some/path/my.module.module');
    expect(fs.existsSync).not.toHaveBeenCalled();
  });

  it('does NOT treat intermediate dot segments as the extension', () => {
    // 'my.module' with extension 'functions' → pop() is 'module' !== 'functions'
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = getUniquePathName('/some/path/my.module', 'functions');
    expect(result).toBe('/some/path/my.module.functions');
  });

  it('handles path with no directory separator', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = getUniquePathName('folder', 'module');
    expect(result).toBe('folder.module');
  });

  it('strips a trailing dot before appending the extension', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = getUniquePathName('/some/path/folder.', 'module');
    expect(result).toBe('/some/path/folder.module');
  });

  it('BUG: empty string path produces a bare ".module" path', () => {
    // folderPath = '' → folderName = '' → hasExtension = false → newFolderPath = '.module'
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = getUniquePathName('', 'module');
    expect(result).toBe('.module');
  });
});

describe('doesFileExist', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when workspace.fs.stat resolves successfully', async () => {
    vi.spyOn(workspace.fs, 'stat').mockResolvedValue({} as any);
    const uri = Uri.file('/some/existing/file.html');
    expect(await doesFileExist(uri)).toBe(true);
  });

  it('returns false when workspace.fs.stat rejects with an Error', async () => {
    vi.spyOn(workspace.fs, 'stat').mockRejectedValue(new Error('FileNotFound'));
    const uri = Uri.file('/nonexistent/file.html');
    expect(await doesFileExist(uri)).toBe(false);
  });

  it('returns false for any thrown value (not just Error instances)', async () => {
    vi.spyOn(workspace.fs, 'stat').mockRejectedValue('string error');
    const uri = Uri.file('/some/path');
    expect(await doesFileExist(uri)).toBe(false);
  });
});

describe('dirname', () => {
  it('returns the parent directory of a nested file URI', () => {
    const uri = Uri.file('/a/b/c/file.html');
    expect(dirname(uri).path).toBe('/a/b/c');
  });

  it('returns the root for a top-level file URI', () => {
    const uri = Uri.file('/file.html');
    expect(dirname(uri).path).toBe('/');
  });

  it('returns a Uri (not a string)', () => {
    const uri = Uri.file('/some/path/file.html');
    expect(dirname(uri)).toBeInstanceOf(Uri);
  });
});

describe('onClickCreateFile', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when clickContext scheme is not "file"', () => {
    const executeCommandSpy = vi.spyOn(commands, 'executeCommand');
    const onDidCreateFilesSpy = vi.spyOn(workspace, 'onDidCreateFiles');

    const handler = onClickCreateFile('module', vi.fn());
    handler({ scheme: 'http', fsPath: '/some/path' });

    expect(executeCommandSpy).not.toHaveBeenCalled();
    expect(onDidCreateFilesSpy).not.toHaveBeenCalled();
  });

  it('does nothing when clickContext scheme is "vscode-remote"', () => {
    const executeCommandSpy = vi.spyOn(commands, 'executeCommand');

    const handler = onClickCreateFile('module', vi.fn());
    handler({ scheme: 'vscode-remote', fsPath: '/some/path' });

    expect(executeCommandSpy).not.toHaveBeenCalled();
  });

  it('registers a file create listener and triggers explorer.newFile when scheme is "file"', () => {
    const executeCommandSpy = vi.spyOn(commands, 'executeCommand');
    const onDidCreateFilesSpy = vi.spyOn(workspace, 'onDidCreateFiles');

    const handler = onClickCreateFile('module', vi.fn());
    handler({ scheme: 'file', fsPath: '/some/path' });

    expect(onDidCreateFilesSpy).toHaveBeenCalled();
    expect(executeCommandSpy).toHaveBeenCalledWith('explorer.newFile');
  });
});
