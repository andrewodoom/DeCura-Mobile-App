import { createClient } from '@supabase/supabase-js';

import { supabase } from '../src/data/client';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ auth: { startAutoRefresh: jest.fn(), stopAutoRefresh: jest.fn() } })),
}));

jest.mock('../src/config/env', () => ({
  readSupabaseConfig: () => ({ url: 'https://example.supabase.co', publishableKey: 'sb_publishable_example' }),
}));

const mockStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
jest.mock('../src/data/device-session-storage', () => ({ createDeviceSessionStorage: () => mockStorage }));

describe('REQ-ACC-01a-T05 the Supabase client never signs in through a link', () => {
  it('is created once, with the encrypted session storage and without reading auth links', () => {
    supabase();
    supabase();

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'sb_publishable_example', {
      auth: { storage: mockStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  });
});
