import type { IconName } from '@/components/icon';
import { computeMetrics, isAlcoholFree } from '@/lib/cocktails';
import type { Cocktail, Family, Ingredient } from '@/types/cocktail';

export const FAMILIES: Family[] = ['Sour', 'Highball', 'Spirit-forward', 'Fizz & Collins', 'Pétillant & Spritz', 'Tiki & Tropical', 'Crémeux & Dessert', 'Chaud', 'Shot', 'Punch & Partage', 'Sans alcool'];
export const FLAVORS = ['Acidulé', 'Amer', 'Sucré', 'Fruité', 'Agrume', 'Herbacé', 'Épicé', 'Fumé', 'Boisé', 'Crémeux', 'Café', 'Floral', 'Frais', 'Pétillant', 'Corsé', 'Sec', 'Tropical', 'Salé'];
export const METHODS = ['Shaker', 'Verre à mélange', 'Au verre', 'Blender'] as const;
export const GLASSES = ['Coupe', 'Martini', 'Old fashioned', 'Highball', 'Flûte', 'Verre à vin', 'Tiki', 'Mug cuivre', 'Tasse', 'Hurricane', 'Shot', 'Pinte', 'Julep'];
export const ICES = ['Glaçons', 'Glace pilée', 'Gros glaçon', 'Sans glace'];

export const BASES: { id: string; label: string; match: (id: string) => boolean }[] = [
  { id: 'gin', label: 'Gin', match: (id) => ['gin', 'gin-peche', 'old-tom-gin', 'sloe-gin'].includes(id) },
  { id: 'vodka', label: 'Vodka', match: (id) => id.startsWith('vodka') },
  { id: 'rhum', label: 'Rhum', match: (id) => id.startsWith('rhum-') || id === 'cachaca' },
  { id: 'agave', label: 'Tequila & mezcal', match: (id) => id.startsWith('tequila') || id === 'mezcal' },
  { id: 'whisky', label: 'Whisky', match: (id) => ['bourbon', 'rye', 'scotch', 'scotch-tourbe', 'whisky-irlandais'].includes(id) },
  { id: 'brandy', label: 'Cognac & eaux-de-vie', match: (id) => ['cognac', 'calvados', 'applejack', 'pisco'].includes(id) },
  { id: 'bulles', label: 'Vins & bulles', match: (id) => ['champagne', 'prosecco', 'vin-blanc', 'vin-rouge', 'vin-rose', 'biere-blonde'].includes(id) },
  { id: 'amers', label: 'Apéritifs amers', match: (id) => ['campari', 'aperol', 'suze', 'fernet-branca', 'amaro-nonino', 'cynar', 'picon'].includes(id) },
];

export type Mood = { id: string; label: string; icon: IconName; test: (cocktail: Cocktail, ingredients: Map<string, Ingredient>) => boolean };

const has = (cocktail: Cocktail, ...flavors: string[]) => cocktail.flavors.some((flavor) => flavors.includes(flavor));

export const MOODS: Mood[] = [
  { id: 'frais', label: 'Rafraîchissant', icon: 'sparkles', test: (c) => has(c, 'Frais', 'Pétillant') || ['Highball', 'Fizz & Collins', 'Pétillant & Spritz'].includes(c.family) },
  { id: 'amer', label: 'Amer', icon: 'leaf', test: (c) => has(c, 'Amer') },
  { id: 'acidule', label: 'Acidulé', icon: 'sparkles', test: (c) => has(c, 'Acidulé') || c.family === 'Sour' },
  { id: 'fruite', label: 'Fruité & tropical', icon: 'sun', test: (c) => has(c, 'Fruité', 'Tropical') || c.family === 'Tiki & Tropical' },
  { id: 'corse', label: 'Corsé', icon: 'flame', test: (c) => has(c, 'Corsé') || c.family === 'Spirit-forward' },
  { id: 'gourmand', label: 'Crémeux & café', icon: 'moon', test: (c) => has(c, 'Crémeux', 'Café') || c.family === 'Crémeux & Dessert' },
  { id: 'leger', label: 'Léger', icon: 'glass', test: (c, ing) => { const abv = computeMetrics(c, ing).abv; return abv > 0.5 && abv < 10; } },
  { id: 'sans-alcool', label: 'Sans alcool', icon: 'leaf', test: (c, ing) => isAlcoholFree(c, ing) },
];

export type Collection = { id: string; title: string; subtitle: string; test: (cocktail: Cocktail, ingredients: Map<string, Ingredient>) => boolean };

const uses = (cocktail: Cocktail, ids: string[]) => cocktail.ingredients.some((item) => ids.includes(item.id));
const requiredCount = (cocktail: Cocktail) => cocktail.ingredients.filter((item) => !item.optional).length;

/** Sélections thématiques proposées sur l'accueil (un toucher ouvre la liste filtrée). */
export const COLLECTIONS: Collection[] = [
  { id: 'clement', title: 'La sélection de Clément', subtitle: 'Ses recettes, ses doses', test: (c) => c.origin === 'clement' },
  { id: 'iba', title: 'Les classiques IBA', subtitle: 'La liste officielle des barmen', test: (c) => !!c.iba },
  { id: 'italien', title: 'Apéritif à l’italienne', subtitle: 'Bitter, vermouth et amaro', test: (c) => uses(c, ['campari', 'aperol', 'vermouth-rouge', 'amaro-nonino', 'cynar', 'fernet-branca']) },
  { id: 'trois', title: 'Trois ingrédients max', subtitle: 'Simples et vite faits', test: (c) => requiredCount(c) <= 3 },
  { id: 'bulles', title: 'Bulles & spritz', subtitle: 'Légers et pétillants', test: (c) => c.family === 'Pétillant & Spritz' || uses(c, ['champagne', 'prosecco']) },
  { id: 'tiki', title: 'Tiki & tropical', subtitle: 'Rhum, fruits et glace pilée', test: (c) => c.family === 'Tiki & Tropical' },
  { id: 'dessert', title: 'Après le dîner', subtitle: 'Crémeux, café, digestifs', test: (c) => c.family === 'Crémeux & Dessert' || c.flavors.includes('Café') },
  { id: 'sans-alcool', title: 'Sans alcool', subtitle: 'De vrais cocktails, zéro degré', test: (c, ing) => isAlcoholFree(c, ing) },
  { id: 'chaud', title: 'Boissons chaudes', subtitle: 'Pour l’hiver', test: (c) => c.family === 'Chaud' },
];

export type SortKey ='nom' | 'dispo' | 'note' | 'force' | 'gouts';
export const SORTS: { id: SortKey; label: string }[] = [
  { id: 'dispo', label: 'Disponibilité' },
  { id: 'nom', label: 'Nom' },
  { id: 'gouts', label: 'Mes goûts' },
  { id: 'note', label: 'Ma note' },
  { id: 'force', label: 'Degré' },
];
