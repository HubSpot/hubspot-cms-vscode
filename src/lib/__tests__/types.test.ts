import { describe, it, expect } from 'vitest';
import { instanceOfLink, instanceOfCommand } from '../types';

describe('instanceOfLink', () => {
  it('returns true when object has a url property', () => {
    expect(
      instanceOfLink({ url: 'https://example.com', label: 'Example' })
    ).toBe(true);
  });

  it('returns true when url is the only property', () => {
    expect(instanceOfLink({ url: 'anything' })).toBe(true);
  });

  it('returns true even when url is null (key presence is what matters)', () => {
    expect(instanceOfLink({ url: null })).toBe(true);
  });

  it('returns true even when url is an empty string', () => {
    expect(instanceOfLink({ url: '' })).toBe(true);
  });

  it('returns true even when url is undefined (key is present)', () => {
    expect(instanceOfLink({ url: undefined })).toBe(true);
  });

  it('returns false when object has no url property', () => {
    expect(instanceOfLink({ label: 'No URL here' })).toBe(false);
  });

  it('returns false for an empty object', () => {
    expect(instanceOfLink({})).toBe(false);
  });

  it('returns false for object with related but non-matching properties', () => {
    expect(instanceOfLink({ href: 'https://example.com' })).toBe(false);
  });

  it('returns false for object with link property instead of url', () => {
    expect(instanceOfLink({ link: 'https://example.com' })).toBe(false);
  });

  it('returns false for a primitive number', () => {
    expect(instanceOfLink(42)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(instanceOfLink('https://example.com')).toBe(false);
  });
});

describe('instanceOfCommand', () => {
  it('returns true for an object with both title and command properties', () => {
    expect(instanceOfCommand({ title: 'Run', command: 'runCommand' })).toBe(
      true
    );
  });

  it('returns true when additional properties are present', () => {
    expect(
      instanceOfCommand({
        title: 'Run',
        command: 'runCommand',
        arguments: [1, 2, 3],
        tooltip: 'Click to run',
      })
    ).toBe(true);
  });

  it('returns false for an object with only title (missing command)', () => {
    expect(instanceOfCommand({ title: 'Run' })).toBe(false);
  });

  it('returns false for an object with only command (missing title)', () => {
    expect(instanceOfCommand({ command: 'runCommand' })).toBe(false);
  });

  it('returns false for an empty object', () => {
    expect(instanceOfCommand({})).toBe(false);
  });

  it('returns false for a Link-shaped object', () => {
    expect(
      instanceOfCommand({ url: 'https://example.com', label: 'link' })
    ).toBe(false);
  });

  it('returns true even when title and command are null (key presence is what matters)', () => {
    expect(instanceOfCommand({ title: null, command: null })).toBe(true);
  });

  it('returns true even when title and command are empty strings', () => {
    expect(instanceOfCommand({ title: '', command: '' })).toBe(true);
  });

  it('returns false for a primitive string', () => {
    expect(instanceOfCommand('not an object')).toBe(false);
  });
});
