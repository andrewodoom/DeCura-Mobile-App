import { ESLint } from 'eslint';

import projectConfig from '../eslint.config.js';

// The project config is passed in directly: ESLint's own config loader needs
// dynamic import, which Jest does not provide.
const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: projectConfig });

const message = 'Use the typed data layer in src/data instead (REQ-ARC-01).';

async function dataLayerErrors(code: string, filePath: string) {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((entry) => entry.message.includes(message));
}

const importPackage = "import { createClient } from '@supabase/supabase-js';\nexport const c = createClient;\n";
const importClient = "import { supabase } from '../data/client';\nexport const c = supabase;\n";
const requirePackage = "export const c = require('@supabase/supabase-js');\n";
const dynamicImport = "export const c = () => import('@supabase/supabase-js');\n";

describe('REQ-ARC-01-T02 the lint rule keeps Supabase inside the data layer', () => {
  it.each([
    ['the Supabase package from a screen', importPackage, 'src/auth/Example.tsx'],
    ['the client module from a screen', importClient, 'src/auth/Example.tsx'],
    ['the Supabase package from the app root', importPackage, 'App.tsx'],
    ['the Supabase package from a new top-level folder', importPackage, 'app/index.tsx'],
    ['the Supabase package by require()', requirePackage, 'src/auth/Example.ts'],
    ['the Supabase package by import()', dynamicImport, 'src/auth/Example.ts'],
  ])('blocks importing %s', async (_case, code, filePath) => {
    expect(await dataLayerErrors(code, filePath)).toHaveLength(1);
  });

  it('allows importing Supabase in the data layer', async () => {
    expect(await dataLayerErrors(importPackage, 'src/data/example.ts')).toHaveLength(0);
  });
});
