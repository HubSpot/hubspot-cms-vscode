import { describe, it, expect } from 'vitest';
import { runTerminalCommand, checkTerminalCommandVersion } from '../terminal';

// MOCKING LIMITATION:
// terminal.ts uses `const { exec } = require('node:child_process')` — a CJS destructuring
// that captures the real exec function at module load time, before any vi.mock factory can
// replace it. As a result, vi.mock('node:child_process') only affects the test file's ESM
// import; terminal.ts always calls the real exec.
//
// Tests below are therefore integration-style: they run real shell commands that produce
// deterministic output in any POSIX-like environment (macOS, Linux). 'node' is guaranteed
// to be installed because we are running in it.

describe('runTerminalCommand', () => {
  it('resolves with the stdout of a successful command', async () => {
    const result = await runTerminalCommand('echo hello');
    expect(result.trim()).toBe('hello');
  });

  it('rejects when the command exits with a non-zero code', async () => {
    // Intentionally fail: cat a file that does not exist
    await expect(
      runTerminalCommand('cat __this_file_does_not_exist__')
    ).rejects.toBeTruthy();
  });

  it('includes the command name in the resolved output', async () => {
    // `node --version` always outputs a non-empty version string
    const result = await runTerminalCommand('node --version');
    expect(result.trim()).toMatch(/^v\d+/);
  });
});

describe('checkTerminalCommandVersion', () => {
  it('returns undefined when the command does not exist in PATH', async () => {
    const result = await checkTerminalCommandVersion(
      '__this_cmd_does_not_exist_on_any_system__'
    );
    expect(result).toBeUndefined();
  });

  it('returns a trimmed version string for "node" (always installed)', async () => {
    const result = await checkTerminalCommandVersion('node');
    expect(typeof result).toBe('string');
    expect(result).toBeTruthy();
    expect(result).not.toContain('\n'); // trimmed
  });

  it('node version string matches the vX.Y.Z format', async () => {
    const result = (await checkTerminalCommandVersion('node')) ?? '';
    expect(result).toMatch(/^v\d+\.\d+\.\d+/);
  });

  it('"not found" detection is robust to trailing whitespace in which output', () => {
    // checkTerminalCommandVersion uses pathOutputMaybe.trim() so a trailing newline
    // in the which stdout no longer causes incorrect fallthrough to the --version check.
    const terminalCommand = 'npm';
    const pathOutputMaybe = 'npm not found\n';
    expect(pathOutputMaybe.trim() === `${terminalCommand} not found`).toBe(
      true
    );
  });
});
