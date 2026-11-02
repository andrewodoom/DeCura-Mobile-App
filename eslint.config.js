// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'reports/*', 'ios/*', 'android/*', '.expo/*'],
  },
  // REQ-ARC-01: app code reaches Supabase only through the typed data layer in
  // src/data: neither the Supabase packages nor the client module are imported
  // anywhere else, by import, require() or import(). Tests may import Supabase
  // to build fixtures.
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['src/data/**', '__tests__/**', 'eslint.config.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@supabase/*', '**/data/client'],
              message: 'Use the typed data layer in src/data instead (REQ-ARC-01).',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='require'][arguments.0.value=/^@supabase\\/|data\\/client$/]",
          message: 'Use the typed data layer in src/data instead (REQ-ARC-01).',
        },
        {
          selector: 'ImportExpression[source.value=/^@supabase\\/|data\\/client$/]',
          message: 'Use the typed data layer in src/data instead (REQ-ARC-01).',
        },
      ],
    },
  },
]);
