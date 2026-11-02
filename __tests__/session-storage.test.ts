import {
  SESSION_KEY_NAME,
  createEncryptedSessionStorage,
  type BlobStore,
  type Cipher,
  type KeyStore,
} from '../src/data/session-storage';

// AES-256-GCM from Web Crypto, standing in for expo-crypto. Same layout as
// AESSealedData.combined(): 12-byte nonce, then ciphertext with its 16-byte tag.
const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const base64ToBytes = (base64: string) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
const importKey = (key: string) => crypto.subtle.importKey('raw', base64ToBytes(key), 'AES-GCM', false, ['encrypt', 'decrypt']);

const webAesGcm: Cipher = {
  async generateKey() {
    return bytesToBase64(crypto.getRandomValues(new Uint8Array(32)));
  },
  async encrypt(key, plaintext, context) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const additionalData = new TextEncoder().encode(context);
    const body = new Uint8Array(
      await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData }, await importKey(key), new TextEncoder().encode(plaintext)),
    );
    const combined = new Uint8Array(iv.length + body.length);
    combined.set(iv);
    combined.set(body, iv.length);
    return bytesToBase64(combined);
  },
  async decrypt(key, ciphertext, context) {
    const bytes = base64ToBytes(ciphertext);
    const additionalData = new TextEncoder().encode(context);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bytes.subarray(0, 12), additionalData },
      await importKey(key),
      bytes.subarray(12),
    );
    return new TextDecoder().decode(plaintext);
  },
};

function memoryKeys(): KeyStore & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    get: async (name) => values.get(name) ?? null,
    set: async (name, value) => {
      values.set(name, value);
    },
  };
}

function memoryBlobs(): BlobStore & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: async (name) => values.get(name) ?? null,
    setItem: async (name, value) => {
      values.set(name, value);
    },
    removeItem: async (name) => {
      values.delete(name);
    },
  };
}

const session = JSON.stringify({ access_token: 'token-value', user: { email: 'tëst@example.com' } });

describe('SEC-03-T02 session stored encrypted, key in the secure store', () => {
  it('round-trips a session without storing it in plain text', async () => {
    const keys = memoryKeys();
    const blobs = memoryBlobs();
    const storage = createEncryptedSessionStorage({ keys, blobs, cipher: webAesGcm });

    await storage.setItem('sb-session', session);

    const stored = blobs.values.get('sb-session')!;
    expect(stored).not.toContain('token-value');
    expect(new TextDecoder().decode(base64ToBytes(stored))).not.toContain('token-value');
    expect(keys.values.has(SESSION_KEY_NAME)).toBe(true);
    expect(await storage.getItem('sb-session')).toBe(session);
  });

  it('keeps using the same key across app launches', async () => {
    const keys = memoryKeys();
    const blobs = memoryBlobs();
    await createEncryptedSessionStorage({ keys, blobs, cipher: webAesGcm }).setItem('sb-session', session);
    const key = keys.values.get(SESSION_KEY_NAME);

    const relaunched = createEncryptedSessionStorage({ keys, blobs, cipher: webAesGcm });

    expect(await relaunched.getItem('sb-session')).toBe(session);
    expect(keys.values.get(SESSION_KEY_NAME)).toBe(key);
  });

  it('drops the session, not other data, when the key is gone', async () => {
    const keys = memoryKeys();
    const blobs = memoryBlobs();
    await createEncryptedSessionStorage({ keys, blobs, cipher: webAesGcm }).setItem('sb-session', session);
    blobs.values.set('other', 'kept');
    keys.values.clear();

    const storage = createEncryptedSessionStorage({ keys, blobs, cipher: webAesGcm });

    expect(await storage.getItem('sb-session')).toBeNull();
    expect(blobs.values.has('sb-session')).toBe(false);
    expect(blobs.values.get('other')).toBe('kept');
  });

  it('rejects a ciphertext moved to another storage name', async () => {
    const keys = memoryKeys();
    const blobs = memoryBlobs();
    const storage = createEncryptedSessionStorage({ keys, blobs, cipher: webAesGcm });
    await storage.setItem('sb-session', session);
    blobs.values.set('sb-other', blobs.values.get('sb-session')!);

    expect(await storage.getItem('sb-other')).toBeNull();
  });

  it('creates one key even when several reads start together', async () => {
    const keys = memoryKeys();
    const set = jest.spyOn(keys, 'set');
    const blobs = memoryBlobs();
    const storage = createEncryptedSessionStorage({ keys, blobs, cipher: webAesGcm });

    await Promise.all([storage.setItem('a', '1'), storage.setItem('b', '2')]);

    expect(set).toHaveBeenCalledTimes(1);
    expect(await storage.getItem('a')).toBe('1');
    expect(await storage.getItem('b')).toBe('2');
  });

  it('removes a stored session', async () => {
    const blobs = memoryBlobs();
    const storage = createEncryptedSessionStorage({ keys: memoryKeys(), blobs, cipher: webAesGcm });
    await storage.setItem('sb-session', session);

    await storage.removeItem('sb-session');

    expect(await storage.getItem('sb-session')).toBeNull();
  });
});
