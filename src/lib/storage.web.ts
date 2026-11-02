import { createStore, del, get, set } from 'idb-keyval';

let store: ReturnType<typeof createStore> | null = null;
const getStore = () => (store ??= createStore('arturo-clementine', 'kv'));

export async function getItem<T>(key: string): Promise<T | undefined> {
  if (typeof indexedDB === 'undefined') return undefined;
  return get<T>(key, getStore());
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  await set(key, value, getStore());
}

export async function removeItem(key: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  await del(key, getStore());
}
