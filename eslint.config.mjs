// eslint.config.mjs
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';

export default [
  // Ignore stuff that shouldn't be linted
  {
    ignores: ['node_modules', 'build', 'dist', 'coverage', 'playwright-report'],
  },

  // App/JSX defaults
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      // Browser + test globals you use
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        alert: 'readonly',
        XMLSerializer: 'readonly',
        // vitest
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      react, // enables react/* rules
    },
    rules: {
      ...js.configs.recommended.rules,
      // keep your underscore convention
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // THIS is what makes <TreeEditor /> count as “used”
      'react/jsx-uses-vars': 'error',
      // No need for React in scope with the new JSX transform
      'react/react-in-jsx-scope': 'off',
    },
    settings: { react: { version: 'detect' } },
  },

  // Playwright config is CommonJS
  {
    files: ['playwright.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { require: 'readonly', module: 'readonly', process: 'readonly' },
    },
  },
];
