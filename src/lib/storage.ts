import AsyncStorage from '@react-native-async-storage/async-storage';

// Stockage clé/valeur JSON. Sur le web, `storage.web.ts` utilise IndexedDB (pas de limite de 5 Mo).
export async function getItem<T>(key: string): Promise<T | undefined> {
  const raw = await AsyncStorage.getItem(key);
  return raw == null ? undefined : (JSON.parse(raw) as T);
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
