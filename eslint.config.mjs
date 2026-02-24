import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/', 'tmp/'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2018,
      globals: { ...globals.node, ...globals.commonjs },
    },
    rules: {
      'no-console': 'off',
      'no-return-await': 'error',
    },
  },
  {
    files: ['**/__tests__/**/*.js', '**/__mocks__/**/*.js'],
    languageOptions: {
      globals: { ...globals.jest, ...globals.node },
    },
  },
];
