import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'out/acceptance-test/**/*.test.js',
  workspaceFolder: './acceptance-test/fixtures/workspace',
  mocha: {
    timeout: 20000,
  },
  // Short path to avoid the 103-char Unix domain socket limit when running
  // from deep worktree paths.
  launchArgs: ['--user-data-dir', '/tmp/vsc-ext-test'],
});
