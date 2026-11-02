// REQ-ARC-01: the only place the Supabase client is created. Every Supabase
// call goes through modules in src/data; a lint rule blocks importing
// @supabase/* anywhere else (eslint.config.js).

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { readSupabaseConfig } from '../config/env';
import type { Database } from './database.types';
import { createDeviceSessionStorage } from './device-session-storage';

let client: SupabaseClient<Database> | undefined;

export function supabase(): SupabaseClient<Database> {
  if (!client) {
    const { url, publishableKey } = readSupabaseConfig();
    const created = createClient<Database>(url, publishableKey, {
      auth: {
        storage: createDeviceSessionStorage(),
        persistSession: true,
        autoRefreshToken: true,
        // Sign-in is by typed code only; the app never opens auth links (REQ-ACC-01a).
        detectSessionInUrl: false,
      },
    });

    // Refresh tokens only while the app is in the foreground, as Supabase
    // recommends for React Native.
    AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        created.auth.startAutoRefresh();
      } else {
        created.auth.stopAutoRefresh();
      }
    });

    client = created;
  }
  return client;
}
