// The public values the app needs to reach Supabase (docs/environments.md).
// Expo inlines EXPO_PUBLIC_ variables only when they are read by their literal
// name, so they are read here and nowhere else.

export type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

export class ConfigError extends Error {}

type RawEnv = {
  url: string | undefined;
  publishableKey: string | undefined;
};

// SEC-01: only the project address and the publishable key may reach the app
// bundle. Anything that looks like a secret stops the app before it is used.
export function parseSupabaseConfig(raw: RawEnv): SupabaseConfig {
  const url = raw.url?.trim();
  const publishableKey = raw.publishableKey?.trim();

  if (!url) {
    throw new ConfigError('EXPO_PUBLIC_SUPABASE_URL is not set');
  }
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url)) {
    throw new ConfigError('EXPO_PUBLIC_SUPABASE_URL must be https://<reference>.supabase.co');
  }
  if (!publishableKey) {
    throw new ConfigError('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set');
  }
  if (!publishableKey.startsWith('sb_publishable_')) {
    // Never echo the value: it may be a secret pasted into the wrong variable.
    throw new ConfigError('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be a publishable key (sb_publishable_...)');
  }

  return { url, publishableKey };
}

export function readSupabaseConfig(): SupabaseConfig {
  return parseSupabaseConfig({
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
