import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  {
    files: ['**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'curly': ['error', 'all'],
      'eqeqeq': ['error', 'always'],
      'no-throw-literal': 'error',
      'prefer-const': 'error',
    },
  },
  {
    ignores: ['.agents/', '.claude/', '.direnv/'],
  },
]);
