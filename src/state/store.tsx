import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';

import { dark, light, type Palette } from '@/constants/theme';
import { sanitizeCocktail, sanitizeIngredient, sanitizeList, searchText } from '@/lib/cocktails';
import { defaultDbUrl, downloadDatabase, fetchManifest, FILE_KINDS, isNewerVersion, loadStoredDatabase, type Progress, saveDatabase, validateDatabase } from '@/lib/database';
import { getItem, setItem } from '@/lib/storage';
import type { Cocktail, Database, Ingredient, MeasurementUnit } from '@/types/cocktail';

// ——— Données personnelles ———

export type ThemeChoice = 'auto' | 'light' | 'dark';
export type Settings = {
  unit: MeasurementUnit;
  theme: ThemeChoice;
  assumeBasics: boolean;
  autoUpdate: boolean;
  installHintDismissed?: boolean;
  /** Affichage de l'onglet Cocktails. */
  layout?: 'list' | 'grid';
};

export type UserData = {
  version: 1;
  stock: string[];
  favorites: string[];
  toTry: string[];
  ratings: Record<string, number>;
  notes: Record<string, string>;
  shopping: string[];
  recent: string[];
  /** Créations et recettes modifiées (même id qu'une recette de la base = version personnelle). */
  custom: Cocktail[];
  customIngredients: Ingredient[];
  /** Saveurs recherchées et ingrédients à éviter : orientent les suggestions. */
  likedFlavors: string[];
  avoid: string[];
  settings: Settings;
};

const USER_KEY = 'user/v1';
const LEGACY_KEY = '@arturo-clementine/v1';

export const emptyUserData = (): UserData => ({
  version: 1, stock: [], favorites: [], toTry: [], ratings: {}, notes: {}, shopping: [], recent: [], custom: [], customIngredients: [],
  likedFlavors: [], avoid: [],
  settings: { unit: 'ml', theme: 'auto', assumeBasics: true, autoUpdate: true },
});

function sanitizeUserData(value: Partial<UserData> | undefined): UserData {
  const base = emptyUserData();
  if (!value || typeof value !== 'object') return base;
  const list = (input: unknown) => (Array.isArray(input) ? input.filter((item): item is string => typeof item === 'string') : []);
  return {
    version: 1,
    stock: list(value.stock),
    favorites: list(value.favorites),
    toTry: list(value.toTry),
    ratings: value.ratings && typeof value.ratings === 'object' ? value.ratings : {},
    notes: value.notes && typeof value.notes === 'object' ? value.notes : {},
    shopping: list(value.shopping),
    recent: list(value.recent).slice(0, 20),
    custom: sanitizeList(value.custom, sanitizeCocktail).map((cocktail) => ({ ...cocktail, origin: 'perso' as const })),
    customIngredients: sanitizeList(value.customIngredients, sanitizeIngredient),
    likedFlavors: list(value.likedFlavors),
    avoid: list(value.avoid),
    settings: { ...base.settings, ...(value.settings ?? {}) },
  };
}

// ——— Contextes ———

type CatalogStatus = 'loading' | 'ready' | 'error';

export type Catalog = {
  status: CatalogStatus;
  error?: string;
  db: Database | null;
  cocktails: Cocktail[];
  byId: Map<string, Cocktail>;
  baseById: Map<string, Cocktail>;
  ingredients: Ingredient[];
  ingredientById: Map<string, Ingredient>;
  searchIndex: Map<string, string>;
  progress: Progress | null;
  remoteVersion: string | null;
  updateAvailable: boolean;
  downloadLatest: (url?: string) => Promise<Database>;
  checkForUpdate: () => Promise<string | null>;
  replaceDatabase: (db: Database) => Promise<void>;
};

type UserActions = {
  data: UserData;
  ready: boolean;
  stock: Set<string>;
  favorites: Set<string>;
  toTry: Set<string>;
  shopping: Set<string>;
  toggleStock: (id: string) => void;
  setStockMany: (ids: string[], owned: boolean) => void;
  toggleFavorite: (id: string) => void;
  toggleToTry: (id: string) => void;
  setRating: (id: string, rating: number) => void;
  setNote: (id: string, note: string) => void;
  toggleShopping: (id: string) => void;
  toggleLikedFlavor: (flavor: string) => void;
  toggleAvoid: (id: string) => void;
  addShopping: (ids: string[]) => void;
  clearShopping: (onlyOwned?: boolean) => void;
  markViewed: (id: string) => void;
  saveCocktail: (cocktail: Cocktail) => void;
  removeCustom: (id: string) => void;
  addIngredient: (ingredient: Ingredient) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  replaceUserData: (data: UserData) => void;
  backupFile: () => object;
};

const CatalogContext = createContext<Catalog | null>(null);
const UserContext = createContext<UserActions | null>(null);
const ThemeContext = createContext<{ colors: Palette; scheme: 'light' | 'dark' }>({ colors: light, scheme: 'light' });

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);

export function AppProvider({ children }: PropsWithChildren) {
  // Données personnelles
  const [data, setData] = useState<UserData>(emptyUserData);
  const [userReady, setUserReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      let saved = await getItem<UserData>(USER_KEY).catch(() => undefined);
      if (!saved) {
        // Reprise des favoris et du stock du prototype V0.3 (même navigateur).
        try {
          const legacyRaw = globalThis.localStorage?.getItem(LEGACY_KEY);
          const legacy = legacyRaw ? JSON.parse(legacyRaw) as { stock?: string[]; favorites?: string[] } : null;
          if (legacy) saved = { ...emptyUserData(), stock: legacy.stock ?? [], favorites: legacy.favorites ?? [] };
        } catch {
          // Ancien stockage illisible : on repart de zéro.
        }
      }
      if (active) {
        setData(sanitizeUserData(saved));
        setUserReady(true);
      }
      // Demande au navigateur de ne pas effacer ces données en cas de manque de place (Safari, Chrome).
      (globalThis.navigator as Navigator | undefined)?.storage?.persist?.().catch(() => undefined);
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (userReady) setItem(USER_KEY, data).catch(() => undefined);
  }, [data, userReady]);

  // Base de cocktails
  const [db, setDb] = useState<Database | null>(null);
  const [status, setStatus] = useState<CatalogStatus>('loading');
  const [error, setError] = useState<string>();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const checked = useRef(false);

  const downloadLatest = useCallback(async (url = defaultDbUrl()) => {
    try {
      const fresh = await downloadDatabase(url, setProgress);
      await saveDatabase(fresh);
      setDb(fresh);
      setRemoteVersion(fresh.version);
      setStatus('ready');
      setError(undefined);
      return fresh;
    } finally {
      setProgress(null);
    }
  }, []);

  const checkForUpdate = useCallback(async () => {
    const manifest = await fetchManifest();
    setRemoteVersion(manifest.version);
    return manifest.version;
  }, []);

  const replaceDatabase = useCallback(async (next: Database) => {
    await saveDatabase(next);
    setDb(next);
    setStatus('ready');
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      // Une base stockée illisible (import abîmé, ancienne version) est ignorée et retéléchargée.
      const stored = validateDatabase(await loadStoredDatabase().catch(() => undefined));
      if (!active) return;
      if (stored) {
        setDb(stored);
        setStatus('ready');
        return;
      }
      try {
        await downloadLatest();
      } catch (reason) {
        if (!active) return;
        setError((reason as Error).message);
        setStatus('error');
      }
    })();
    return () => { active = false; };
  }, [downloadLatest]);

  // Une fois par lancement : s'il existe une base plus récente, elle est installée en arrière-plan
  // (vos favoris, notes et recettes personnelles sont stockés à part et ne sont pas touchés).
  const autoUpdate = data.settings.autoUpdate;
  useEffect(() => {
    if (status !== 'ready' || !userReady || checked.current) return;
    checked.current = true;
    (async () => {
      const version = await checkForUpdate();
      // Une base importée depuis un fichier n'est jamais remplacée automatiquement.
      if (autoUpdate && isNewerVersion(version, db)) await downloadLatest();
    })().catch(() => undefined);
  }, [autoUpdate, checkForUpdate, db, downloadLatest, status, userReady]);

  const catalog = useMemo<Catalog>(() => {
    const baseCocktails = db?.cocktails ?? [];
    const baseById = new Map(baseCocktails.map((cocktail) => [cocktail.id, cocktail]));
    const customById = new Map(data.custom.map((cocktail) => [cocktail.id, cocktail]));
    const cocktails = [
      ...baseCocktails.map((cocktail) => customById.get(cocktail.id) ?? cocktail),
      ...data.custom.filter((cocktail) => !baseById.has(cocktail.id)),
    ].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    const ingredientById = new Map<string, Ingredient>();
    for (const ingredient of [...(db?.ingredients ?? []), ...data.customIngredients]) ingredientById.set(ingredient.id, ingredient);
    const ingredients = [...ingredientById.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    const searchIndex = new Map(cocktails.map((cocktail) => [cocktail.id, searchText(cocktail, ingredientById)]));
    return {
      status, error, db, cocktails, byId: new Map(cocktails.map((cocktail) => [cocktail.id, cocktail])), baseById,
      ingredients, ingredientById, searchIndex, progress, remoteVersion,
      updateAvailable: isNewerVersion(remoteVersion, db),
      downloadLatest, checkForUpdate, replaceDatabase,
    };
  }, [checkForUpdate, data.custom, data.customIngredients, db, downloadLatest, error, progress, remoteVersion, replaceDatabase, status]);

  const user = useMemo<UserActions>(() => {
    const update = (fn: (current: UserData) => UserData) => setData((current) => fn(current));
    return {
      data,
      ready: userReady,
      stock: new Set(data.stock),
      favorites: new Set(data.favorites),
      toTry: new Set(data.toTry),
      shopping: new Set(data.shopping),
      toggleStock: (id) => update((current) => ({ ...current, stock: toggle(current.stock, id), shopping: current.stock.includes(id) ? current.shopping : current.shopping.filter((item) => item !== id) })),
      setStockMany: (ids, owned) => update((current) => ({
        ...current,
        stock: owned ? [...new Set([...current.stock, ...ids])] : current.stock.filter((item) => !ids.includes(item)),
        shopping: owned ? current.shopping.filter((item) => !ids.includes(item)) : current.shopping,
      })),
      toggleFavorite: (id) => update((current) => ({ ...current, favorites: toggle(current.favorites, id) })),
      toggleToTry: (id) => update((current) => ({ ...current, toTry: toggle(current.toTry, id) })),
      setRating: (id, rating) => update((current) => {
        const ratings = { ...current.ratings };
        if (rating > 0 && ratings[id] !== rating) ratings[id] = rating;
        else delete ratings[id];
        return { ...current, ratings, toTry: rating > 0 ? current.toTry.filter((item) => item !== id) : current.toTry };
      }),
      setNote: (id, note) => update((current) => {
        const notes = { ...current.notes };
        if (note.trim()) notes[id] = note;
        else delete notes[id];
        return { ...current, notes };
      }),
      toggleShopping: (id) => update((current) => ({ ...current, shopping: toggle(current.shopping, id) })),
      toggleLikedFlavor: (flavor) => update((current) => ({ ...current, likedFlavors: toggle(current.likedFlavors, flavor) })),
      toggleAvoid: (id) => update((current) => ({ ...current, avoid: toggle(current.avoid, id) })),
      addShopping: (ids) => update((current) => ({ ...current, shopping: [...new Set([...current.shopping, ...ids])] })),
      clearShopping: () => update((current) => ({ ...current, shopping: [] })),
      markViewed: (id) => update((current) => (current.recent[0] === id ? current : { ...current, recent: [id, ...current.recent.filter((item) => item !== id)].slice(0, 20) })),
      saveCocktail: (cocktail) => update((current) => ({
        ...current,
        custom: [...current.custom.filter((item) => item.id !== cocktail.id), { ...cocktail, updatedAt: new Date().toISOString() }],
      })),
      removeCustom: (id) => update((current) => ({ ...current, custom: current.custom.filter((item) => item.id !== id) })),
      addIngredient: (ingredient) => update((current) => ({ ...current, customIngredients: [...current.customIngredients.filter((item) => item.id !== ingredient.id), ingredient] })),
      updateSettings: (settings) => update((current) => ({ ...current, settings: { ...current.settings, ...settings } })),
      replaceUserData: (next) => setData(sanitizeUserData(next)),
      backupFile: () => ({ kind: FILE_KINDS.backup, exportedAt: new Date().toISOString(), data }),
    };
  }, [data, userReady]);

  const systemScheme = useColorScheme();
  const scheme = data.settings.theme === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : data.settings.theme;
  const theme = useMemo(() => ({ colors: scheme === 'dark' ? dark : light, scheme }), [scheme]);

  return (
    <ThemeContext.Provider value={theme}>
      <CatalogContext.Provider value={catalog}>
        <UserContext.Provider value={user}>{children}</UserContext.Provider>
      </CatalogContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog doit être utilisé dans AppProvider');
  return context;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser doit être utilisé dans AppProvider');
  return context;
}

export const useTheme = () => useContext(ThemeContext);

/** Lit une sauvegarde exportée par l'app (ou renvoie null si ce n'en est pas une). */
export function parseBackupFile(value: unknown): UserData | null {
  if (!value || typeof value !== 'object') return null;
  const file = value as { kind?: string; data?: Partial<UserData> };
  if (file.kind !== FILE_KINDS.backup || !file.data) return null;
  return sanitizeUserData(file.data);
}

/** Fusionne une sauvegarde importée avec les données actuelles (rien n'est perdu). */
export function mergeUserData(current: UserData, incoming: UserData): UserData {
  const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];
  const custom = new Map(current.custom.map((cocktail) => [cocktail.id, cocktail]));
  for (const cocktail of incoming.custom) {
    const existing = custom.get(cocktail.id);
    if (!existing || (cocktail.updatedAt ?? '') > (existing.updatedAt ?? '')) custom.set(cocktail.id, cocktail);
  }
  const ingredients = new Map(current.customIngredients.map((item) => [item.id, item]));
  for (const item of incoming.customIngredients) if (!ingredients.has(item.id)) ingredients.set(item.id, item);
  return {
    ...current,
    stock: union(current.stock, incoming.stock),
    favorites: union(current.favorites, incoming.favorites),
    toTry: union(current.toTry, incoming.toTry),
    shopping: union(current.shopping, incoming.shopping),
    likedFlavors: union(current.likedFlavors, incoming.likedFlavors),
    avoid: union(current.avoid, incoming.avoid),
    ratings: { ...incoming.ratings, ...current.ratings },
    notes: { ...incoming.notes, ...current.notes },
    custom: [...custom.values()],
    customIngredients: [...ingredients.values()],
  };
}
