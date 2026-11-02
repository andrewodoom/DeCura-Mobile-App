// Binds the encrypted session storage to the device: expo-secure-store for the
// key, AsyncStorage for the ciphertext and expo-crypto for AES-256-GCM. Tested
// on physical devices (SEC-03-T01); the logic is unit tested in session-storage.ts.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AESEncryptionKey, AESKeySize, AESSealedData, aesDecryptAsync, aesEncryptAsync } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { createEncryptedSessionStorage, type Cipher, type SessionStorage } from './session-storage';

// Readable only while the device is unlocked, and never copied to a backup or
// another device.
const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(base64: string): string {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const aesGcm: Cipher = {
  async generateKey() {
    const key = await AESEncryptionKey.generate(AESKeySize.AES256);
    return key.encoded('base64');
  },
  async encrypt(key, plaintext, context) {
    const sealed = await aesEncryptAsync(toBase64(plaintext), await AESEncryptionKey.import(key, 'base64'), {
      additionalData: toBase64(context),
    });
    return sealed.combined('base64');
  },
  async decrypt(key, ciphertext, context) {
    const plaintext = await aesDecryptAsync(
      AESSealedData.fromCombined(ciphertext),
      await AESEncryptionKey.import(key, 'base64'),
      { output: 'base64', additionalData: toBase64(context) },
    );
    return fromBase64(plaintext);
  },
};

export function createDeviceSessionStorage(): SessionStorage {
  return createEncryptedSessionStorage({
    keys: {
      get: (name) => SecureStore.getItemAsync(name, secureStoreOptions),
      set: (name, value) => SecureStore.setItemAsync(name, value, secureStoreOptions),
    },
    blobs: AsyncStorage,
    cipher: aesGcm,
  });
}
