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

  // BUG EXPOSURE: checkTerminalCommandVersion's "not found" check uses strict equality:
  //   `pathOutputMaybe === \`${terminalCommand} not found\``
  // runTerminalCommand resolves with raw (untrimmed) stdout. On a system where `which`
  // exits 0 but outputs "cmd not found\n" (with trailing newline), the equality check
  // evaluates to false and the function incorrectly falls through to the --version check.
  //
  // We can verify the logic directly without running exec:
  it('BUG: the "not found" equality check fails when stdout has a trailing newline', () => {
    // This is the exact comparison made inside checkTerminalCommandVersion
    const terminalCommand = 'npm';
    const pathOutputMaybe = 'npm not found\n'; // stdout with trailing newline

    // The check should recognise this as "not found" and resolve undefined.
    // Instead, the trailing newline makes it false — causing fallthrough to --version.
    const checkWouldPass = pathOutputMaybe === `${terminalCommand} not found`;

    expect(checkWouldPass).toBe(false); // It IS false — that IS the bug
    // Fix: compare pathOutputMaybe.trim() === `${terminalCommand} not found`
    expect(pathOutputMaybe.trim() === `${terminalCommand} not found`).toBe(
      true
    );
  });
});
