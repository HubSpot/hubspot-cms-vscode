import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      vscode: path.resolve(__dirname, 'src/__mocks__/vscode.ts'),
    },
  },
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', 'acceptance-test/**', 'out/**'],
  },
});
