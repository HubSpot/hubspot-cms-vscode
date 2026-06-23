import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'out/acceptance-test/**/*.test.js',
  workspaceFolder: './acceptance-test/fixtures/workspace',
  mocha: {
    timeout: 20000,
  },
});
