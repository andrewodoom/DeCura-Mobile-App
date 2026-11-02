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
  let key: Promise<string> | undefined;

  function sessionKey(): Promise<string> {
    key ??= (async () => {
      const stored = await keys.get(SESSION_KEY_NAME);
      if (stored) {
        return stored;
      }
      const created = await cipher.generateKey();
      await keys.set(SESSION_KEY_NAME, created);
      return created;
    })().catch((error: unknown) => {
      key = undefined;
      throw error;
    });
    return key;
  }

  return {
    async getItem(name) {
      const ciphertext = await blobs.getItem(name);
      if (ciphertext === null) {
        return null;
      }
      try {
        return await cipher.decrypt(await sessionKey(), ciphertext, name);
      } catch {
        // Wrong key (for example after a reinstall) or a changed ciphertext.
        // The session is unusable: drop it, and the user signs in again.
        // Local journal data is never touched here (REQ-ACC-02b).
        await blobs.removeItem(name);
        return null;
      }
    },
    async setItem(name, value) {
      await blobs.setItem(name, await cipher.encrypt(await sessionKey(), value, name));
    },
    async removeItem(name) {
      await blobs.removeItem(name);
    },
  };
}
