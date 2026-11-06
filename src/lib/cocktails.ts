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
export const BASICS = new Set(['sucre', 'sucre-morceau', 'sucre-poudre', 'sucre-roux', 'sel', 'poivre', 'soda', 'eau']);

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

// ——— Soirée : quantités totales ———

export type PartyLine = { id: string; name: string; category: string; text: string; detail?: string; volumeMl: number };

const BOTTLES: Record<string, { size: number; label: string }> = {
  spiritueux: { size: 700, label: 'bouteille de 70 cl' },
  liqueur: { size: 700, label: 'bouteille de 70 cl' },
  aperitif_vermouth: { size: 750, label: 'bouteille de 75 cl' },
  vin_bulles: { size: 750, label: 'bouteille de 75 cl' },
  soft_bulle: { size: 1000, label: 'bouteille de 1 L' },
};
const FRUITS: Record<string, { ml: number; label: string }> = {
  citron: { ml: 30, label: 'citron' },
  'citron-vert': { ml: 25, label: 'citron vert' },
  'jus-d-orange': { ml: 80, label: 'orange' },
  'jus-de-pamplemousse': { ml: 150, label: 'pamplemousse' },
};
/** « citron vert » → « citrons verts », « bouteille de 70 cl » → « bouteilles de 70 cl ». */
function plural(count: number, label: string) {
  if (count <= 1) return label;
  const [head, ...tail] = label.split(' de ');
  const words = head.split(' ').map((word) => (/[sx]$/.test(word) ? word : `${word}s`));
  return [words.join(' '), ...tail].join(' de ');
}

/** Additionne les ingrédients de plusieurs cocktails (chacun pour N verres) et les traduit en achats concrets. */
export function partyShopping(entries: { cocktail: Cocktail; glasses: number }[], ingredients: Map<string, Ingredient>): PartyLine[] {
  const totals = new Map<string, { ml: number; others: Map<string, number> }>();
  for (const { cocktail, glasses } of entries) {
    for (const item of cocktail.ingredients) {
      if (item.optional) continue;
      const total = totals.get(item.id) ?? { ml: 0, others: new Map<string, number>() };
      if (item.unit === 'ml') total.ml += item.amount * glasses;
      else total.others.set(item.unit, (total.others.get(item.unit) ?? 0) + item.amount * glasses);
      totals.set(item.id, total);
    }
  }
  return [...totals.entries()].map(([id, total]) => {
    const ingredient = ingredients.get(id);
    const category = ingredient?.category ?? 'frais_garniture';
    const parts: string[] = [];
    if (total.ml) parts.push(total.ml >= 1000 ? `${fmt(total.ml / 1000, 2)} L` : `${fmt(total.ml / 10)} cl`);
    for (const [unit, amount] of total.others) parts.push(formatAmount({ id, amount, unit: unit as RecipeIngredient['unit'] }, 'ml'));
    let detail: string | undefined;
    const fruit = FRUITS[id];
    const bottle = BOTTLES[category];
    if (total.ml && fruit) {
      const count = Math.ceil(total.ml / fruit.ml);
      detail = `≈ ${count} ${plural(count, fruit.label)}`;
    } else if (total.ml && bottle) {
      const count = Math.ceil(total.ml / bottle.size);
      detail = `${count} ${plural(count, bottle.label)}`;
    }
    return { id, name: ingredient?.name ?? id, category, text: parts.join(' + '), detail, volumeMl: total.ml };
  }).sort((a, b) => b.volumeMl - a.volumeMl || a.name.localeCompare(b.name, 'fr'));
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

// ——— Validation des données venues d'un fichier ou du stockage ———

const isString = (value: unknown): value is string => typeof value === 'string';
const strings = (value: unknown) => (Array.isArray(value) ? value.filter(isString) : []);

/** Rend une fiche sûre à afficher (champs manquants complétés), ou null si elle est inutilisable. */
export function sanitizeCocktail(value: unknown): Cocktail | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<Cocktail>;
  if (!isString(raw.id) || !raw.id || !isString(raw.name) || !raw.name.trim()) return null;
  const ingredients = (Array.isArray(raw.ingredients) ? raw.ingredients : [])
    .filter((item): item is RecipeIngredient => !!item && isString(item.id) && typeof item.amount === 'number' && isString(item.unit));
  if (!ingredients.length) return null;
  return {
    ...raw,
    id: raw.id,
    name: raw.name,
    tagline: isString(raw.tagline) ? raw.tagline : '',
    description: isString(raw.description) ? raw.description : '',
    family: isString(raw.family) ? raw.family : 'Sour',
    method: isString(raw.method) ? raw.method : 'Au verre',
    glass: isString(raw.glass) ? raw.glass : 'Old fashioned',
    ice: isString(raw.ice) ? raw.ice : 'Glaçons',
    ingredients,
    garnish: isString(raw.garnish) ? raw.garnish : '',
    steps: strings(raw.steps),
    flavors: strings(raw.flavors),
    aliases: strings(raw.aliases),
    difficulty: raw.difficulty === 1 || raw.difficulty === 3 ? raw.difficulty : 2,
    color: isString(raw.color) && /^#[0-9a-f]{6}$/i.test(raw.color) ? raw.color : '#C9A27A',
    origin: raw.origin ?? 'classique',
  } as Cocktail;
}

export function sanitizeIngredient(value: unknown): Ingredient | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<Ingredient>;
  if (!isString(raw.id) || !raw.id || !isString(raw.name)) return null;
  const num = (input: unknown) => (typeof input === 'number' && Number.isFinite(input) ? input : 0);
  return {
    id: raw.id, name: raw.name, category: raw.category ?? 'frais_garniture', emoji: isString(raw.emoji) ? raw.emoji : '•',
    abv: num(raw.abv), sugar: num(raw.sugar), acidity: num(raw.acidity), bitterness: num(raw.bitterness),
  };
}

export const sanitizeList = <T,>(value: unknown, sanitize: (item: unknown) => T | null) =>
  (Array.isArray(value) ? value : []).map(sanitize).filter((item): item is T => item !== null);

// ——— Partage ———

/** Recette en texte brut, lisible dans WhatsApp, un SMS ou une note. */
export function cocktailShareText(cocktail: Cocktail, ingredients: Map<string, Ingredient>, unit: MeasurementUnit, servings = 1, url?: string) {
  const name = (id: string) => ingredients.get(id)?.name ?? id;
  const lines = [`🍸 ${cocktail.name}`];
  if (cocktail.tagline) lines.push(cocktail.tagline);
  lines.push('', `Ingrédients (${servings} verre${servings > 1 ? 's' : ''}) :`);
  for (const item of cocktail.ingredients) lines.push(`• ${formatAmount(item, unit, servings)} ${name(item.id)}${item.optional ? ' (facultatif)' : ''}`);
  if (cocktail.garnish) lines.push(`Garniture : ${cocktail.garnish}`);
  if (cocktail.steps.length) {
    lines.push('', 'Préparation :');
    cocktail.steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
  }
  lines.push('', `${cocktail.method} · ${cocktail.glass} · ${cocktail.ice}`);
  if (url) lines.push('', `La fiche : ${url}`);
  return lines.join('\n');
}

// ——— Carafe (batch) ———

/** « de prosecco », « d’eau gazeuse », « d’huile »… */
export const deName = (name: string) => (/^[aeiouyhàâéèêëîïôöûü]/i.test(name) ? `d’${name}` : `de ${name}`);

export type BatchLine = { id: string; name: string; text: string; volumeMl: number };
export type BatchPlan = {
  glasses: number;
  /** Ce qui va dans la carafe à l'avance. */
  batch: BatchLine[];
  /** Eau de dilution ajoutée (0 si non diluée à l'avance). */
  waterMl: number;
  /** Bulles, fruits, herbes… ajoutés au moment de servir, verre par verre. */
  atService: { id: string; name: string; perGlass: string; total: string; sparkling: boolean }[];
  totalMl: number;
  perGlassMl: number;
  /** Taux de dilution habituel de la méthode (eau de fonte de la glace). */
  dilution: number;
  /** Ingrédients qui se conservent mal en carafe (œuf, crème…) ou méthode inadaptée. */
  warnings: string[];
  container: string;
};

const NOT_BATCHABLE = new Set(['blanc-oeuf', 'oeuf', 'creme', 'glace-vanille', 'yaourt', 'banane', 'espresso', 'cafe']);
const FRESH_CITRUS = new Set(['citron', 'citron-vert', 'jus-de-pamplemousse', 'jus-d-orange']);

/** Dilution apportée par la glace selon la méthode (fonte pendant la préparation). */
export const methodDilution = (cocktail: Cocktail) =>
  cocktail.method === 'Shaker' ? 0.25 : cocktail.method === 'Verre à mélange' ? 0.2 : cocktail.method === 'Blender' ? 0.3 : 0;

function containerFor(ml: number) {
  if (ml <= 500) return 'une bouteille de 50 cl';
  if (ml <= 750) return 'une bouteille de 75 cl';
  if (ml <= 1000) return 'une carafe de 1 L';
  if (ml <= 1500) return 'une bouteille de 1,5 L';
  if (ml <= 2000) return 'un pichet de 2 L';
  return `${Math.ceil(ml / 1500)} bouteilles de 1,5 L`;
}

const roundMl = (ml: number) => (ml >= 100 ? Math.round(ml / 5) * 5 : Math.round(ml));

/**
 * Prépare un cocktail en carafe : tout ce qui se garde est multiplié et mélangé à l'avance,
 * avec l'eau que la glace aurait apportée si `dilute` ; les bulles et le frais attendent le service.
 */
export function batchPlan(cocktail: Cocktail, ingredients: Map<string, Ingredient>, glasses: number, unit: MeasurementUnit, dilute: boolean): BatchPlan {
  const n = Math.max(1, Math.round(glasses));
  const name = (id: string) => ingredients.get(id)?.name ?? id;
  const batch: BatchLine[] = [];
  const atService: BatchPlan['atService'] = [];
  const warnings: string[] = [];
  for (const item of cocktail.ingredients) {
    const profile = ingredients.get(item.id);
    const sparkling = profile?.category === 'vin_bulles' || profile?.category === 'soft_bulle';
    const volume = liquidVolume(item) * n;
    if (NOT_BATCHABLE.has(item.id)) warnings.push(`${name(item.id)} : se conserve mal mélangé, à ajouter verre par verre.`);
    if (sparkling || NOT_BATCHABLE.has(item.id) || !volume) {
      atService.push({ id: item.id, name: name(item.id), perGlass: formatAmount(item, unit, 1), total: formatAmount(item, unit, n), sparkling });
      continue;
    }
    // Traits et cuillères : au-delà de quelques verres, on mesure en ml.
    const inMl = formatAmount({ id: item.id, amount: roundMl(volume), unit: 'ml' }, unit, 1);
    const text = item.unit === 'ml' ? inMl : `${formatAmount(item, unit, n)} (≈ ${inMl})`;
    batch.push({ id: item.id, name: name(item.id), text, volumeMl: volume });
  }
  if (cocktail.method === 'Blender') warnings.push('Recette mixée : préparez la base en carafe, puis mixez avec la glace par petites quantités.');
  if (cocktail.ingredients.some((item) => FRESH_CITRUS.has(item.id))) warnings.push('Jus d’agrumes frais : préparez la carafe le jour même et gardez-la au frais.');
  const dilution = methodDilution(cocktail);
  const liquids = batch.reduce((sum, line) => sum + line.volumeMl, 0);
  const waterMl = dilute && dilution ? roundMl(liquids * dilution) : 0;
  const totalMl = liquids + waterMl;
  return { glasses: n, batch, waterMl, atService, totalMl, perGlassMl: totalMl / n, dilution, warnings, container: containerFor(totalMl) };
}
