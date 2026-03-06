import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['node_modules', 'mochawesome-report', 'performance', 'resources', 'frontend/**/dist'],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-console': 'warn',
    },
  },
  {
    files: ['test/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['frontend/test/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['frontend/src/**/*.{js,mjs,cjs}'],
    rules: {
      'no-console': 'off',
    },
  },
]);
