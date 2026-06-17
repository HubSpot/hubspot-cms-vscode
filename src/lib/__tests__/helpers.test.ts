import { describe, it, expect, afterEach } from 'vitest';
import dayjs from 'dayjs';
import { workspace } from 'vscode';
import {
  getRootPath,
  getDayJsHasDatePassed,
  getDayjsDateFromNow,
} from '../helpers';

describe('getRootPath', () => {
  afterEach(() => {
    (workspace as any).workspaceFolders = undefined;
  });

  it('returns undefined when workspaceFolders is undefined', () => {
    (workspace as any).workspaceFolders = undefined;
    expect(getRootPath()).toBeUndefined();
  });

  it('returns undefined when workspaceFolders is an empty array', () => {
    (workspace as any).workspaceFolders = [];
    expect(getRootPath()).toBeUndefined();
  });

  it('returns the fsPath of the first workspace folder', () => {
    (workspace as any).workspaceFolders = [
      { uri: { fsPath: '/first/workspace' } },
    ];
    expect(getRootPath()).toBe('/first/workspace');
  });

  it('returns only the first folder path when multiple workspace folders exist', () => {
    (workspace as any).workspaceFolders = [
      { uri: { fsPath: '/project-a' } },
      { uri: { fsPath: '/project-b' } },
    ];
    expect(getRootPath()).toBe('/project-a');
  });
});

describe('getDayJsHasDatePassed', () => {
  it('returns true for a date one day in the past', () => {
    const pastDate = dayjs().subtract(1, 'day').toISOString();
    expect(getDayJsHasDatePassed(pastDate)).toBe(true);
  });

  it('returns false for a date one day in the future', () => {
    const futureDate = dayjs().add(1, 'day').toISOString();
    expect(getDayJsHasDatePassed(futureDate)).toBe(false);
  });

  it('returns true for a date far in the past', () => {
    expect(getDayJsHasDatePassed('2020-01-01T00:00:00.000Z')).toBe(true);
  });

  it('returns false for a date far in the future', () => {
    expect(getDayJsHasDatePassed('2099-01-01T00:00:00.000Z')).toBe(false);
  });

  it('returns true for one second ago', () => {
    const oneSecondAgo = dayjs().subtract(1, 'second').toISOString();
    expect(getDayJsHasDatePassed(oneSecondAgo)).toBe(true);
  });
});

describe('getDayjsDateFromNow', () => {
  it('returns a valid ISO string', () => {
    const result = getDayjsDateFromNow(1);
    expect(typeof result).toBe('string');
    expect(dayjs(result).isValid()).toBe(true);
  });

  it('returns a future date when given positive days', () => {
    const result = getDayjsDateFromNow(7);
    expect(dayjs(result).isAfter(dayjs())).toBe(true);
  });

  it('returns a past date when given negative days', () => {
    const result = getDayjsDateFromNow(-7);
    expect(dayjs(result).isBefore(dayjs())).toBe(true);
  });

  it('returns approximately now when given 0 days', () => {
    const result = getDayjsDateFromNow(0);
    const diff = Math.abs(dayjs(result).diff(dayjs(), 'second'));
    expect(diff).toBeLessThan(2);
  });

  it('result for +7 days is approximately 7 days from now', () => {
    const result = getDayjsDateFromNow(7);
    const expected = dayjs().add(7, 'day');
    const diffMinutes = Math.abs(dayjs(result).diff(expected, 'minute'));
    expect(diffMinutes).toBeLessThan(1);
  });

  it('result for -30 days is approximately 30 days in the past', () => {
    const result = getDayjsDateFromNow(-30);
    const expected = dayjs().subtract(30, 'day');
    const diffMinutes = Math.abs(dayjs(result).diff(expected, 'minute'));
    expect(diffMinutes).toBeLessThan(1);
  });
});
