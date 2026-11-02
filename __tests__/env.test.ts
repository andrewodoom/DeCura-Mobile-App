import { ConfigError, parseSupabaseConfig } from '../src/config/env';

const url = 'https://fkqwophvgvprissnvumw.supabase.co';
const publishableKey = 'sb_publishable_example';

describe('SEC-01-T02 only public Supabase values reach the app', () => {
  it('accepts the project address and a publishable key', () => {
    expect(parseSupabaseConfig({ url, publishableKey })).toEqual({ url, publishableKey });
  });

  it.each([
    ['a secret key', 'sb_secret_example'],
    ['a legacy service key', 'eyJhbGciOiJIUzI1NiJ9.example.signature'],
    ['nothing', undefined],
  ])('rejects %s in the publishable key variable without echoing it', (_case, value) => {
    expect(() => parseSupabaseConfig({ url, publishableKey: value })).toThrow(ConfigError);
    try {
      parseSupabaseConfig({ url, publishableKey: value });
    } catch (error) {
      if (value) {
        expect((error as Error).message).not.toContain(value);
      }
    }
  });

  it.each([
    ['plain HTTP', 'http://fkqwophvgvprissnvumw.supabase.co'],
    ['another host', 'https://example.com'],
    ['nothing', undefined],
  ])('rejects %s as the project address', (_case, value) => {
    expect(() => parseSupabaseConfig({ url: value, publishableKey })).toThrow(ConfigError);
  });
});
