import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import { getUniquePathName } from '../fileHelpers';

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
});
