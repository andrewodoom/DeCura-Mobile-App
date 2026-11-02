// SEC-03: the Supabase session is stored encrypted. The 256-bit key lives in the
// secure store (iOS Keychain, Android Keystore) and never leaves this device;
// the ciphertext lives in ordinary app storage, where a backup copy is useless
// without the key.

export type KeyStore = {
  get(name: string): Promise<string | null>;
  set(name: string, value: string): Promise<void>;
};

export type BlobStore = {
  getItem(name: string): Promise<string | null>;
  setItem(name: string, value: string): Promise<void>;
  removeItem(name: string): Promise<void>;
};

// AES-256-GCM. Keys and ciphertexts are base64; `context` is authenticated but
// not encrypted, and binds each ciphertext to the storage name it was written to.
export type Cipher = {
  generateKey(): Promise<string>;
  encrypt(key: string, plaintext: string, context: string): Promise<string>;
  decrypt(key: string, ciphertext: string, context: string): Promise<string>;
};

export type SessionStorage = {
  getItem(name: string): Promise<string | null>;
  setItem(name: string, value: string): Promise<void>;
  removeItem(name: string): Promise<void>;
};

export const SESSION_KEY_NAME = 'decura.session-key.v1';

export function createEncryptedSessionStorage(deps: {
  keys: KeyStore;
  blobs: BlobStore;
  cipher: Cipher;
}): SessionStorage {
  const { keys, blobs, cipher } = deps;
  let cached: string | undefined;
  let creating: Promise<string> | undefined;

  // Reads the key. A failure to read (for example the Keychain while the device
  // is locked) is thrown, never treated as "no key": the stored session must
  // survive a key store that is only temporarily unavailable.
  async function readKey(): Promise<string | null> {
    cached ??= (await keys.get(SESSION_KEY_NAME)) ?? undefined;
    return cached ?? null;
  }

  // Creates the key only when writing, and only after a successful read found none.
  function keyForWriting(): Promise<string> {
    creating ??= (async () => {
      const existing = await readKey();
      if (existing) {
        return existing;
      }
      const created = await cipher.generateKey();
      await keys.set(SESSION_KEY_NAME, created);
      cached = created;
      return created;
    })().finally(() => {
      creating = undefined;
    });
    return creating;
  }

  return {
    async getItem(name) {
      const ciphertext = await blobs.getItem(name);
      if (ciphertext === null) {
        return null;
      }
      const key = await readKey();
      try {
        if (key === null) {
          throw new Error('No session key');
        }
        return await cipher.decrypt(key, ciphertext, name);
      } catch {
        // The key store was read and has no matching key (for example after a
        // backup restore to a new device), or the ciphertext was changed. The
        // session can never be decrypted: drop it, and the user signs in again.
        // Local journal data is never touched here (REQ-ACC-02b).
        await blobs.removeItem(name);
        return null;
      }
    },
    async setItem(name, value) {
      await blobs.setItem(name, await cipher.encrypt(await keyForWriting(), value, name));
    },
    async removeItem(name) {
      await blobs.removeItem(name);
    },
  };
}
