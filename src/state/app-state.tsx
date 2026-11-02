import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { cocktails as baseCocktails, pantryItems as basePantryItems } from '@/data/cocktails';
import { reconcilePantryItem } from '@/data/ingredient-profiles';
import type { Cocktail, MeasurementUnit, PantryItem } from '@/types/cocktail';

const STORAGE_KEY = '@arturo-clementine/v1';
const legacyCategories: Record<string, PantryItem['category']> = { bitter: 'bitter_arome', pétillant: 'soft_bulle', vin: 'aperitif_vermouth', extrait: 'bitter_arome', garniture: 'frais_garniture', autre: 'frais_garniture' };

type PersistedState = {
  stock: string[];
  favorites: string[];
  customCocktails: Cocktail[];
  customPantryItems: PantryItem[];
  measurementUnit: MeasurementUnit;
};

type AppState = {
  stock: Set<string>;
  favorites: Set<string>;
  cocktails: Cocktail[];
  pantryItems: PantryItem[];
  customCocktails: Cocktail[];
  measurementUnit: MeasurementUnit;
  toggleStock: (id: string) => void;
  toggleFavorite: (slug: string) => void;
  addCustomCocktail: (cocktail: Cocktail, ingredients: PantryItem[]) => void;
  removeCustomCocktail: (slug: string) => void;
  setMeasurementUnit: (unit: MeasurementUnit) => void;
};

const Context = createContext<AppState | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [stock, setStock] = useState(() => new Set(['gin', 'campari', 'vermouth-rouge', 'citron', 'soda']));
  const [favorites, setFavorites] = useState(() => new Set<string>(['americano']));
  const [customCocktails, setCustomCocktails] = useState<Cocktail[]>([]);
  const [customPantryItems, setCustomPantryItems] = useState<PantryItem[]>([]);
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('ml');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!active || !raw) return;
      const saved = JSON.parse(raw) as Partial<PersistedState>;
      if (saved.stock) setStock(new Set(saved.stock));
      if (saved.favorites) setFavorites(new Set(saved.favorites));
      if (saved.customCocktails) setCustomCocktails(saved.customCocktails);
      if (saved.customPantryItems) setCustomPantryItems(saved.customPantryItems.map((item) => reconcilePantryItem({
        ...item, category: legacyCategories[item.category] ?? item.category ?? 'frais_garniture', abv: item.abv ?? 0,
        sugarGramsPerLiter: item.sugarGramsPerLiter ?? 0, acidityScore: item.acidityScore ?? 0, bitternessScore: item.bitternessScore ?? 0,
      })));
      if (saved.measurementUnit) setMeasurementUnit(saved.measurementUnit);
    }).finally(() => {
      if (active) setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: PersistedState = {
      stock: [...stock], favorites: [...favorites], customCocktails, customPantryItems, measurementUnit,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [customCocktails, customPantryItems, favorites, hydrated, measurementUnit, stock]);

  const allCocktails = useMemo(() => [...baseCocktails, ...customCocktails], [customCocktails]);
  const allPantryItems = useMemo(() => [...basePantryItems, ...customPantryItems]
    .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index), [customPantryItems]);

  const value = useMemo<AppState>(() => ({
    stock,
    favorites,
    cocktails: allCocktails,
    pantryItems: allPantryItems,
    customCocktails,
    measurementUnit,
    toggleStock: (id) => setStock((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    }),
    toggleFavorite: (slug) => setFavorites((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    }),
    addCustomCocktail: (cocktail, ingredients) => {
      setCustomCocktails((current) => [...current.filter((item) => item.slug !== cocktail.slug), cocktail]);
      const incoming = new Set(ingredients.map((item) => item.id));
      setCustomPantryItems((current) => [...current.filter((item) => !incoming.has(item.id)), ...ingredients]);
    },
    removeCustomCocktail: (slug) => {
      setCustomCocktails((current) => {
        const remaining = current.filter((cocktail) => cocktail.slug !== slug);
        const usedIngredients = new Set(remaining.flatMap((cocktail) => cocktail.ingredients.map((ingredient) => ingredient.ingredientId)));
        setCustomPantryItems((items) => items.filter((item) => usedIngredients.has(item.id)));
        return remaining;
      });
      setFavorites((current) => { const next = new Set(current); next.delete(slug); return next; });
    },
    setMeasurementUnit,
  }), [allCocktails, allPantryItems, customCocktails, favorites, measurementUnit, stock]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAppState() {
  const context = useContext(Context);
  if (!context) throw new Error('useAppState doit être utilisé dans AppStateProvider');
  return context;
}
