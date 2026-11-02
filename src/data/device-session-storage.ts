// Binds the encrypted session storage to the device: expo-secure-store for the
// key, AsyncStorage for the ciphertext and expo-crypto for AES-256-GCM. The
// storage logic is unit tested (__tests__/session-storage.test.ts, SEC-03-T02);
// this binding is to be verified on iOS and Android development builds by
// SEC-03-T01, which has not yet run. Expo Go does not count as that evidence:
// there the Keychain belongs to Expo Go.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AESEncryptionKey, AESKeySize, AESSealedData, aesDecryptAsync, aesEncryptAsync } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { createEncryptedSessionStorage, type Cipher, type SessionStorage } from './session-storage';

// Readable only while the device is unlocked, and never copied to a backup or
// another device.
const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const aesGcm: Cipher = {
  async generateKey() {
    const key = await AESEncryptionKey.generate(AESKeySize.AES256);
    return key.encoded('base64');
  },
  async encrypt(key, plaintext, context) {
    const sealed = await aesEncryptAsync(
      new TextEncoder().encode(plaintext),
      await AESEncryptionKey.import(key, 'base64'),
      { additionalData: new TextEncoder().encode(context) },
    );
    return sealed.combined('base64');
  },
  async decrypt(key, ciphertext, context) {
    const plaintext = await aesDecryptAsync(
      AESSealedData.fromCombined(ciphertext),
      await AESEncryptionKey.import(key, 'base64'),
      { output: 'bytes', additionalData: new TextEncoder().encode(context) },
    );
    return new TextDecoder().decode(plaintext);
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
