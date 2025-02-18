import pluginJs from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['dist'] },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-imports': 'error',
      'perfectionist/sort-exports': 'error',
      'perfectionist/sort-array-includes': 'error',
      'perfectionist/sort-intersection-types': 'error',
      'perfectionist/sort-jsx-props': 'error',
      'perfectionist/sort-interfaces': 'error',
      'perfectionist/sort-named-exports': 'error',
      'perfectionist/sort-union-types': 'error',
    },
    settings: {
      perfectionist: {
        type: 'natural',
      },
    },
  },
];
