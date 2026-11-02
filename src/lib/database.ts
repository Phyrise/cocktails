import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { getItem, setItem } from '@/lib/storage';
import type { Cocktail, Database, DatabaseManifest, Ingredient } from '@/types/cocktail';

const DB_KEY = 'database/v1';
/** Adresse publique de la base pour les versions natives (et pour une mise à jour depuis un autre hébergement). */
export const REMOTE_DB_URL = 'https://phyrise.github.io/cocktails/db/';

/** Dossier de la base publiée avec l'app (même origine sur le web). */
export function defaultDbUrl() {
  if (Platform.OS !== 'web') return REMOTE_DB_URL;
  const base = (Constants.expoConfig?.experiments?.baseUrl ?? '').replace(/\/$/, '');
  return `${globalThis.location?.origin ?? ''}${base}/db/`;
}

export async function loadStoredDatabase() {
  return getItem<Database>(DB_KEY);
}

export async function saveDatabase(db: Database) {
  await setItem(DB_KEY, db);
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Téléchargement impossible (${response.status}) : ${url}`);
  return (await response.json()) as T;
}

export async function fetchManifest(dbUrl = defaultDbUrl()) {
  return fetchJson<DatabaseManifest>(`${dbUrl}manifest.json`);
}

export type Progress = { done: number; total: number; label: string };

/** Télécharge la base tronçon par tronçon (manifeste, ingrédients puis chaque fichier de cocktails). */
export async function downloadDatabase(dbUrl = defaultDbUrl(), onProgress?: (progress: Progress) => void): Promise<Database> {
  const manifest = await fetchManifest(dbUrl);
  if (manifest.format !== 1) throw new Error('Format de base inconnu : mettez l’application à jour.');
  const total = manifest.chunks.length + 1;
  onProgress?.({ done: 0, total, label: 'Ingrédients' });
  const ingredients = await fetchJson<Ingredient[]>(`${dbUrl}${manifest.ingredients}`);
  const cocktails: Cocktail[] = [];
  for (const [index, chunk] of manifest.chunks.entries()) {
    onProgress?.({ done: index + 1, total, label: `Tronçon ${index + 1}/${manifest.chunks.length}` });
    const part = await fetchJson<Cocktail[]>(`${dbUrl}${chunk.file}`);
    if (part.length !== chunk.count) throw new Error(`Tronçon incomplet : ${chunk.file}`);
    cocktails.push(...part);
  }
  onProgress?.({ done: total, total, label: 'Terminé' });
  return { version: manifest.version, generatedAt: manifest.generatedAt, cocktails, ingredients, imageBase: dbUrl };
}

export function imageUri(image: string | null | undefined, db: Pick<Database, 'imageBase'> | null) {
  if (!image) return undefined;
  if (/^(data:|https?:|blob:|file:)/.test(image)) return image;
  return `${db?.imageBase ?? defaultDbUrl()}${image}`;
}

/** Précharge les photos pour l'usage hors connexion (le service worker les garde en cache). */
export async function prefetchImages(db: Database, onProgress?: (done: number, total: number) => void) {
  const urls = db.cocktails.map((cocktail) => imageUri(cocktail.image, db)).filter((url): url is string => !!url && url.startsWith('http'));
  let done = 0;
  let failed = 0;
  const queue = [...urls];
  const worker = async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      try {
        const response = await fetch(url);
        if (!response.ok) failed += 1;
      } catch {
        failed += 1;
      }
      done += 1;
      onProgress?.(done, urls.length);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  return { total: urls.length, failed };
}

// ——— Fichiers d'échange ———

export const FILE_KINDS = { database: 'arturo-clementine/base', backup: 'arturo-clementine/sauvegarde' } as const;

export function databaseFile(db: Database) {
  return { kind: FILE_KINDS.database, version: db.version, generatedAt: db.generatedAt, ingredients: db.ingredients, cocktails: db.cocktails };
}

export function parseDatabaseFile(data: unknown, imageBase: string): Database | null {
  if (!data || typeof data !== 'object') return null;
  const file = data as { kind?: string; version?: string; generatedAt?: string; cocktails?: Cocktail[]; ingredients?: Ingredient[] };
  if (file.kind !== FILE_KINDS.database || !Array.isArray(file.cocktails) || !Array.isArray(file.ingredients)) return null;
  return {
    version: file.version ?? 'import',
    generatedAt: file.generatedAt ?? new Date().toISOString(),
    cocktails: file.cocktails,
    ingredients: file.ingredients,
    imageBase,
  };
}
