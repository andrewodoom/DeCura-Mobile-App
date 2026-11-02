import { ESLint } from 'eslint';

import projectConfig from '../eslint.config.js';

const importClient = "import { createClient } from '@supabase/supabase-js';\nexport const c = createClient;\n";

// The project config is passed in directly: ESLint's own config loader needs
// dynamic import, which Jest does not provide.
const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: projectConfig });

async function restrictedImportErrors(filePath: string) {
  const [result] = await eslint.lintText(importClient, { filePath });
  return result.messages.filter((message) => message.ruleId === 'no-restricted-imports');
}

describe('REQ-ARC-01-T02 the lint rule keeps Supabase inside the data layer', () => {
  it('blocks importing Supabase from a screen', async () => {
    expect(await restrictedImportErrors('src/auth/Example.tsx')).toHaveLength(1);
  });

  it('blocks importing Supabase from the app root', async () => {
    expect(await restrictedImportErrors('App.tsx')).toHaveLength(1);
  });

  it('allows importing Supabase in the data layer', async () => {
    expect(await restrictedImportErrors('src/data/example.ts')).toHaveLength(0);
  });
});
