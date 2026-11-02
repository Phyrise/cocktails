import type { Cocktail, Ingredient, MeasurementUnit, RecipeIngredient } from '@/types/cocktail';

export const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/œ/g, 'oe');

// Formes interchangeables d'un même ingrédient pour le calcul « faisable avec mon bar ».
const equivalents: string[][] = [
  ['sucre', 'sucre-morceau', 'sucre-poudre', 'sucre-roux'],
  ['citron', 'citron-quartiers'],
  ['citron-vert', 'citron-vert-quartiers'],
  ['rhum-ambre', 'rhum-age'],
  ['champagne', 'prosecco'],
  ['blanc-oeuf', 'oeuf'],
];
const equivalentOf = new Map<string, string[]>();
for (const group of equivalents) for (const id of group) equivalentOf.set(id, group);

/** Ingrédients du placard que l'on considère toujours disponibles (réglage « basiques »). */
export const BASICS = new Set(['sucre', 'sucre-morceau', 'sucre-poudre', 'sucre-roux', 'sel', 'poivre', 'soda']);

export function hasIngredient(id: string, stock: Set<string>, assumeBasics: boolean) {
  if (assumeBasics && BASICS.has(id)) return true;
  if (stock.has(id)) return true;
  return (equivalentOf.get(id) ?? []).some((other) => stock.has(other));
}

export type Availability = { owned: number; required: number; missing: RecipeIngredient[]; ready: boolean };

export function availability(cocktail: Cocktail, stock: Set<string>, assumeBasics = true): Availability {
  const required = cocktail.ingredients.filter((item) => !item.optional);
  const missing = required.filter((item) => !hasIngredient(item.id, stock, assumeBasics));
  return { owned: required.length - missing.length, required: required.length, missing, ready: missing.length === 0 };
}

/**
 * Ingrédients absents qui rapprochent le plus de recettes : une recette à laquelle il ne manque que lui compte
 * pleinement, une recette à qui il manque deux ingrédients compte un peu (utile quand le bar est presque vide).
 */
export function bestPurchases(cocktails: Cocktail[], stock: Set<string>, assumeBasics: boolean) {
  const entries = new Map<string, { id: string; unlocked: Cocktail[]; score: number; uses: number }>();
  for (const cocktail of cocktails) {
    const { missing } = availability(cocktail, stock, assumeBasics);
    if (!missing.length || missing.length > 3) continue;
    const weight = [0, 1, 0.3, 0.08][missing.length];
    for (const item of missing) {
      const entry = entries.get(item.id) ?? { id: item.id, unlocked: [], score: 0, uses: 0 };
      entry.score += weight;
      entry.uses += 1;
      if (missing.length === 1) entry.unlocked.push(cocktail);
      entries.set(item.id, entry);
    }
  }
  return [...entries.values()].sort((a, b) => b.score - a.score);
}

export const isAlcoholFree = (cocktail: Cocktail, ingredients: Map<string, Ingredient>) =>
  cocktail.family === 'Sans alcool' || cocktail.ingredients.every((item) => (ingredients.get(item.id)?.abv ?? 0) === 0);

// ——— Quantités ———

const fmt = (value: number, digits = 1) => Number(value.toFixed(digits)).toLocaleString('fr-FR');

const plurals: Record<string, string> = { trait: 'traits', goutte: 'gouttes', pièce: 'pièces', tranche: 'tranches', pincée: 'pincées', cuillère: 'cuillères' };

function fraction(value: number) {
  const whole = Math.floor(value);
  const rest = value - whole;
  const fractions: [number, string][] = [[0.25, '¼'], [0.33, '⅓'], [0.5, '½'], [0.66, '⅔'], [0.75, '¾']];
  const match = fractions.find(([target]) => Math.abs(rest - target) < 0.05);
  if (rest < 0.05) return String(whole);
  if (match) return whole ? `${whole} ${match[1]}` : match[1];
  return fmt(value);
}

export function formatAmount(item: RecipeIngredient, unit: MeasurementUnit, servings = 1) {
  const amount = item.amount * servings;
  if (item.unit === 'ml') {
    if (unit === 'oz') return `${fmt(amount / 30, 2)} oz`;
    if (unit === 'cl') return `${fmt(amount / 10)} cl`;
    return `${fmt(amount, 0)} ml`;
  }
  const label = amount > 1 ? plurals[item.unit] ?? item.unit : item.unit;
  return `${fraction(amount)} ${label}`;
}

// ——— Profil calculé ———

export type Metrics = { abv: number; volume: number; sugar: number; acidity: number; bitterness: number; alcoholMl: number; dilution: number };

const liquidVolume = (item: RecipeIngredient) => {
  if (item.unit === 'ml') return item.amount;
  if (item.unit === 'trait') return item.amount * 0.9;
  if (item.unit === 'goutte') return item.amount * 0.05;
  if (item.unit === 'cuillère') return item.amount * 5;
  return 0;
};

export function computeMetrics(cocktail: Cocktail, ingredients: Map<string, Ingredient>): Metrics {
  const rows = cocktail.ingredients.map((item) => ({ volume: liquidVolume(item), profile: ingredients.get(item.id) }));
  const volume = rows.reduce((sum, row) => sum + row.volume, 0);
  const alcoholMl = rows.reduce((sum, row) => sum + row.volume * ((row.profile?.abv ?? 0) / 100), 0);
  const dilution = cocktail.method === 'Shaker' ? 0.25 : cocktail.method === 'Verre à mélange' ? 0.2 : cocktail.method === 'Blender' ? 0.3 : cocktail.ice === 'Sans glace' ? 0 : 0.1;
  const served = volume * (1 + dilution);
  const weighted = (key: 'acidity' | 'bitterness') => volume ? rows.reduce((sum, row) => sum + row.volume * (row.profile?.[key] ?? 0), 0) / volume : 0;
  return {
    abv: served ? (alcoholMl / served) * 100 : 0,
    volume: served,
    sugar: rows.reduce((sum, row) => sum + (row.volume * (row.profile?.sugar ?? 0)) / 1000, 0),
    acidity: Math.min(5, weighted('acidity') * 1.8),
    bitterness: Math.min(5, weighted('bitterness') * 1.6),
    alcoholMl,
    dilution,
  };
}

export const strengthLabel = (abv: number) => (abv < 0.5 ? 'Sans alcool' : abv < 8 ? 'Léger' : abv < 15 ? 'Moyen' : abv < 22 ? 'Corsé' : 'Très fort');

// ——— Recherche ———

export function searchText(cocktail: Cocktail, ingredients: Map<string, Ingredient>) {
  return normalize([
    cocktail.name, ...(cocktail.aliases ?? []), cocktail.tagline, cocktail.family, cocktail.glass, ...cocktail.flavors,
    ...cocktail.ingredients.map((item) => ingredients.get(item.id)?.name ?? item.id),
  ].join(' '));
}

export function matchesQuery(cocktail: Cocktail, haystack: string, query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return 0;
  const name = normalize(cocktail.name);
  let score = 0;
  for (const term of terms) {
    if (!haystack.includes(term)) return 0;
    score += name.startsWith(term) ? 6 : name.includes(term) ? 4 : 1;
  }
  return score;
}

// ——— Suggestions ———

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return Math.abs(h);
}

/** Cocktail du jour : stable sur la journée, choisi parmi les recettes avec photo si possible. */
export function cocktailOfTheDay(cocktails: Cocktail[], date = new Date()) {
  const pool = cocktails.filter((cocktail) => cocktail.image && cocktail.origin !== 'perso');
  const list = pool.length ? pool : cocktails;
  if (!list.length) return undefined;
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  return [...list].sort((a, b) => a.id.localeCompare(b.id))[hash(key) % list.length];
}

const jaccard = (left: string[], right: string[]) => {
  const a = new Set(left);
  const b = new Set(right);
  const common = [...a].filter((value) => b.has(value)).length;
  return common / Math.max(1, new Set([...a, ...b]).size);
};

export function similarCocktails(target: Cocktail, cocktails: Cocktail[], count = 6) {
  const features = (cocktail: Cocktail) => [...cocktail.ingredients.filter((item) => !item.optional).map((item) => item.id), ...cocktail.flavors.map((flavor) => `f:${flavor}`), `fam:${cocktail.family}`];
  const reference = features(target);
  return cocktails
    .filter((cocktail) => cocktail.id !== target.id)
    .map((cocktail) => ({ cocktail, score: jaccard(reference, features(cocktail)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((entry) => entry.cocktail);
}

export type TasteProfile = { liked: Cocktail[]; disliked: Cocktail[]; flavors: string[]; avoid: Set<string> };

/** Profil de goûts : favoris et recettes notées 4-5 d'un côté, notées 1-2 de l'autre, plus les préférences déclarées. */
export function tasteProfile(
  cocktails: Cocktail[],
  user: { favorites: Set<string>; ratings: Record<string, number>; likedFlavors: string[]; avoid: string[] },
): TasteProfile {
  return {
    liked: cocktails.filter((cocktail) => user.favorites.has(cocktail.id) || (user.ratings[cocktail.id] ?? 0) >= 4),
    disliked: cocktails.filter((cocktail) => (user.ratings[cocktail.id] ?? 5) <= 2),
    flavors: user.likedFlavors,
    avoid: new Set(user.avoid),
  };
}

export const containsAvoided = (cocktail: Cocktail, avoid: Set<string>) => cocktail.ingredients.some((item) => !item.optional && avoid.has(item.id));

/** Ordonne une liste selon les goûts : favoris, bonnes notes et saveurs aimées rapprochent ; mauvaises notes et ingrédients évités éloignent. */
export function tasteScore(cocktail: Cocktail, profile: TasteProfile) {
  const features = (item: Cocktail) => [...item.ingredients.map((ingredient) => ingredient.id), ...item.flavors];
  const mine = features(cocktail);
  let score = 0;
  for (const reference of profile.liked) score += jaccard(mine, features(reference));
  for (const reference of profile.disliked) score -= jaccard(mine, features(reference)) * 1.5;
  score += cocktail.flavors.filter((flavor) => profile.flavors.includes(flavor)).length * 0.35;
  if (containsAvoided(cocktail, profile.avoid)) score -= 10;
  return score;
}

export const slugify = (value: string) => normalize(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
