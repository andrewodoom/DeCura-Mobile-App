// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'reports/*', 'ios/*', 'android/*', '.expo/*'],
  },
  // REQ-ARC-01: app code reaches Supabase only through the typed data layer in
  // src/data. Tests may import Supabase to build fixtures.
  {
    files: ['App.tsx', 'index.ts', 'src/**'],
    ignores: ['src/data/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@supabase/*'],
              message: 'Use the typed data layer in src/data instead (REQ-ARC-01).',
            },
          ],
        },
      ],
    },
  },
]);
