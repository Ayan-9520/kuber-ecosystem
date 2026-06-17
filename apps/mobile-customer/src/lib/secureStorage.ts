import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { getWebLocalStorage } from './webStorage';

const isWeb = Platform.OS === 'web';

export async function secureGet(key: string): Promise<string | null> {
  if (isWeb) {
    return getWebLocalStorage()?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

export async function secureSet(key: string, value: string): Promise<void> {
  if (isWeb) {
    getWebLocalStorage()?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function secureDelete(key: string): Promise<void> {
  if (isWeb) {
    getWebLocalStorage()?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
