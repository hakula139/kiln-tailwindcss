import base from '@hakula139/eslint-config';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  {
    files: ['**/*.mjs'],
    extends: [base],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    ignores: ['.direnv/'],
  },
]);
