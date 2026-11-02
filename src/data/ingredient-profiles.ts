import type { CategoryId, PantryItem } from '@/types/cocktail';

type Profile = Pick<PantryItem, 'category' | 'emoji' | 'abv' | 'sugarGramsPerLiter'>;
type GeneratedItem = { id: string; name: string; category?: string; emoji?: string };

export const categoryDefinitions: { id: CategoryId; label: string; emoji: string; description: string }[] = [
  { id: 'spiritueux', label: 'Spiritueux', emoji: '🥃', description: 'Rhum, gin, vodka, tequila, bourbon, mezcal…' },
  { id: 'aperitif_vermouth', label: 'Apéritifs & Vermouths', emoji: '🍷', description: 'Vins fortifiés et amers d’apéritif.' },
  { id: 'liqueur', label: 'Liqueurs & Crèmes', emoji: '🍸', description: 'Liqueurs sucrées et crèmes de fruits.' },
  { id: 'jus', label: 'Jus & Fruits', emoji: '🧃', description: 'Jus de fruits et agrumes.' },
  { id: 'soft_bulle', label: 'Softs & Bulles', emoji: '🥤', description: 'Sodas, ginger beer et boissons sans alcool.' },
  { id: 'sirop', label: 'Sirops & Sucres', emoji: '🍯', description: 'Sucre, agave, orgeat, grenadine…' },
  { id: 'bitter_arome', label: 'Bitters & Arômes', emoji: '🧪', description: 'Concentrés utilisés en gouttes ou en traits.' },
  { id: 'frais_garniture', label: 'Frais, Épicerie & Garnitures', emoji: '🌿', description: 'Œuf, crème, café, épices et garnitures.' },
];

const profiles: Record<string, Profile> = {
  'bourbon': { category: 'spiritueux', emoji: '🥃', abv: 40, sugarGramsPerLiter: 0 },
  'cognac': { category: 'spiritueux', emoji: '🥃', abv: 40, sugarGramsPerLiter: 2 },
  'gin': { category: 'spiritueux', emoji: '🍸', abv: 40, sugarGramsPerLiter: 0 },
  'gin-peche': { category: 'spiritueux', emoji: '🍸', abv: 30, sugarGramsPerLiter: 120 },
  'mezcal': { category: 'spiritueux', emoji: '🌵', abv: 40, sugarGramsPerLiter: 0 },
  'rhum-age': { category: 'spiritueux', emoji: '🥃', abv: 40, sugarGramsPerLiter: 10 },
  'rhum-ananas': { category: 'spiritueux', emoji: '🍹', abv: 35, sugarGramsPerLiter: 60 },
  'rhum-blanc': { category: 'spiritueux', emoji: '🍹', abv: 40, sugarGramsPerLiter: 0 },
  'rhum-epice': { category: 'spiritueux', emoji: '🍹', abv: 35, sugarGramsPerLiter: 40 },
  'rhum-jamaicain': { category: 'spiritueux', emoji: '🍹', abv: 40, sugarGramsPerLiter: 0 },
  'tequila': { category: 'spiritueux', emoji: '🌵', abv: 40, sugarGramsPerLiter: 0 },
  'vodka': { category: 'spiritueux', emoji: '🧊', abv: 40, sugarGramsPerLiter: 0 },
  'vodka-vanille': { category: 'spiritueux', emoji: '🧊', abv: 37.5, sugarGramsPerLiter: 15 },
  'campari': { category: 'aperitif_vermouth', emoji: '🔴', abv: 25, sugarGramsPerLiter: 245 },
  'vermouth-rouge': { category: 'aperitif_vermouth', emoji: '🍷', abv: 16, sugarGramsPerLiter: 140 },
  'adriatico-blanco': { category: 'liqueur', emoji: '🍾', abv: 16, sugarGramsPerLiter: 200 },
  'amaretto': { category: 'liqueur', emoji: '🌰', abv: 28, sugarGramsPerLiter: 300 },
  'baileys': { category: 'liqueur', emoji: '🥛', abv: 17, sugarGramsPerLiter: 200 },
  'chartreuse-verte': { category: 'liqueur', emoji: '🌱', abv: 55, sugarGramsPerLiter: 250 },
  'creme-de-mure': { category: 'liqueur', emoji: '🫐', abv: 16, sugarGramsPerLiter: 400 },
  'creme-de-rhum-vanille': { category: 'liqueur', emoji: '🍦', abv: 17, sugarGramsPerLiter: 250 },
  'creme-de-rose': { category: 'liqueur', emoji: '🌹', abv: 18, sugarGramsPerLiter: 300 },
  'creme-de-violette': { category: 'liqueur', emoji: '🪻', abv: 18, sugarGramsPerLiter: 300 },
  'curacao-bleu': { category: 'liqueur', emoji: '🌊', abv: 20, sugarGramsPerLiter: 250 },
  'curacao-orange': { category: 'liqueur', emoji: '🍊', abv: 25, sugarGramsPerLiter: 250 },
  'liqueur-cafe': { category: 'liqueur', emoji: '☕', abv: 20, sugarGramsPerLiter: 380 },
  'liqueur-de-coco': { category: 'liqueur', emoji: '🥥', abv: 20, sugarGramsPerLiter: 200 },
  'liqueur-de-vanille': { category: 'liqueur', emoji: '🍦', abv: 20, sugarGramsPerLiter: 250 },
  'liqueur-peche': { category: 'liqueur', emoji: '🍑', abv: 18, sugarGramsPerLiter: 200 },
  'maraschino': { category: 'liqueur', emoji: '🍒', abv: 32, sugarGramsPerLiter: 330 },
  'parfait-amour': { category: 'liqueur', emoji: '💜', abv: 25, sugarGramsPerLiter: 300 },
  'triple-sec': { category: 'liqueur', emoji: '🍊', abv: 40, sugarGramsPerLiter: 240 },
  'citron': { category: 'jus', emoji: '🍋', abv: 0, sugarGramsPerLiter: 20 },
  'citron-vert': { category: 'jus', emoji: '🍏', abv: 0, sugarGramsPerLiter: 15 },
  'jus-d-ananas': { category: 'jus', emoji: '🍍', abv: 0, sugarGramsPerLiter: 120 },
  'jus-d-orange': { category: 'jus', emoji: '🍊', abv: 0, sugarGramsPerLiter: 90 },
  'jus-de-cranberry': { category: 'jus', emoji: '🍒', abv: 0, sugarGramsPerLiter: 120 },
  'jus-de-pomme': { category: 'jus', emoji: '🍎', abv: 0, sugarGramsPerLiter: 100 },
  'coca-cola': { category: 'soft_bulle', emoji: '🥤', abv: 0, sugarGramsPerLiter: 106 },
  'eau-de-coco': { category: 'soft_bulle', emoji: '🥥', abv: 0, sugarGramsPerLiter: 35 },
  'ginger-beer': { category: 'soft_bulle', emoji: '🫚', abv: 0, sugarGramsPerLiter: 110 },
  'limonade': { category: 'soft_bulle', emoji: '🍋', abv: 0, sugarGramsPerLiter: 80 },
  'soda': { category: 'soft_bulle', emoji: '✨', abv: 0, sugarGramsPerLiter: 0 },
  'sirop-d-agave': { category: 'sirop', emoji: '🍯', abv: 0, sugarGramsPerLiter: 750 },
  'sirop-d-orgeat': { category: 'sirop', emoji: '🌾', abv: 0, sugarGramsPerLiter: 650 },
  'sirop-de-cannelle': { category: 'sirop', emoji: '🪵', abv: 0, sugarGramsPerLiter: 650 },
  'sirop-de-chocolat': { category: 'sirop', emoji: '🍫', abv: 0, sugarGramsPerLiter: 600 },
  'sirop-de-grenadine': { category: 'sirop', emoji: '🔴', abv: 0, sugarGramsPerLiter: 650 },
  'sucre': { category: 'sirop', emoji: '🍬', abv: 0, sugarGramsPerLiter: 650 },
  'angostura': { category: 'bitter_arome', emoji: '🧪', abv: 44.7, sugarGramsPerLiter: 100 },
  'chocolate-bitters': { category: 'bitter_arome', emoji: '🍫', abv: 40, sugarGramsPerLiter: 100 },
  'peychauds-bitters': { category: 'bitter_arome', emoji: '🧪', abv: 35, sugarGramsPerLiter: 150 },
  'fleur-d-oranger': { category: 'bitter_arome', emoji: '🌸', abv: 0, sugarGramsPerLiter: 0 },
  'blanc-oeuf': { category: 'frais_garniture', emoji: '🥚', abv: 0, sugarGramsPerLiter: 0 },
  'creme': { category: 'frais_garniture', emoji: '🥛', abv: 0, sugarGramsPerLiter: 30 },
  'espresso': { category: 'frais_garniture', emoji: '☕', abv: 0, sugarGramsPerLiter: 0 },
  'fraises-sechees': { category: 'frais_garniture', emoji: '🍓', abv: 0, sugarGramsPerLiter: 500 },
  'gingembre-frais': { category: 'frais_garniture', emoji: '🫚', abv: 0, sugarGramsPerLiter: 0 },
  'lait-concentre': { category: 'frais_garniture', emoji: '🥛', abv: 0, sugarGramsPerLiter: 550 },
  'lait-de-coco': { category: 'frais_garniture', emoji: '🥥', abv: 0, sugarGramsPerLiter: 30 },
  'piment-sel': { category: 'frais_garniture', emoji: '🌶️', abv: 0, sugarGramsPerLiter: 0 },
  'menthe': { category: 'frais_garniture', emoji: '🌱', abv: 0, sugarGramsPerLiter: 0 },
};

const acidity: Record<string, number> = {
  'citron': 5, 'citron-vert': 5, 'jus-de-cranberry': 3.5, 'jus-d-orange': 2.5, 'jus-d-ananas': 2.5,
  'jus-de-pomme': 1.5, 'ginger-beer': 1.5, 'limonade': 2, 'coca-cola': 1.5, 'eau-de-coco': 0.5,
};
const bitterness: Record<string, number> = {
  'angostura': 5, 'chocolate-bitters': 5, 'peychauds-bitters': 5, 'campari': 4.5, 'vermouth-rouge': 2,
  'chartreuse-verte': 2, 'espresso': 2.5, 'fleur-d-oranger': 0.5,
};

export function enrichPantryItem(item: GeneratedItem): PantryItem {
  const profile = profiles[item.id] ?? { category: 'frais_garniture' as const, emoji: item.emoji ?? '◌', abv: 0, sugarGramsPerLiter: 0 };
  return { ...item, name: item.id === 'soda' ? 'Eau gazeuse' : item.name, ...profile, acidityScore: acidity[item.id] ?? 0, bitternessScore: bitterness[item.id] ?? 0 };
}

const normalizeId = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/œ/g, 'oe').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const legacyAliases: Record<string, string> = {
  'citron-jaune': 'citron',
  'jus-de-citron': 'citron',
  'jus-de-citron-jaune': 'citron',
  'jus-de-citron-vert': 'citron-vert',
  'soda-water': 'soda',
  'eau-gazeuse': 'soda',
};

/** Reclasse aussi les anciens ingrédients du labo dont l'identifiant était préfixé par `custom-`. */
export function reconcilePantryItem(item: PantryItem): PantryItem {
  const candidates = [item.id, item.id.replace(/^custom-/, ''), normalizeId(item.name)];
  const canonicalId = candidates.map((id) => legacyAliases[id] ?? id).find((id) => profiles[id]);
  if (!canonicalId) return item;
  const profile = profiles[canonicalId];
  return {
    ...item,
    name: canonicalId === 'soda' ? 'Eau gazeuse' : item.name,
    ...profile,
    acidityScore: acidity[canonicalId] ?? 0,
    bitternessScore: bitterness[canonicalId] ?? 0,
  };
}
