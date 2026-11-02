import type { Cocktail, IngredientAmount, PantryItem } from '@/types/cocktail';

export type AlcoholContribution = { name: string; volumeMl: number; abv: number; alcoholMl: number };
export type CocktailMetrics = {
  pureAbv: number;
  servedAbv: number;
  sugarGrams: number;
  acidity: number;
  bitterness: number;
  dilutionPercent: number;
  initialVolumeMl: number;
  servedVolumeMl: number;
  totalAlcoholMl: number;
  components: AlcoholContribution[];
  alcohols: AlcoholContribution[];
};

const liquidVolume = (ingredient: IngredientAmount) => {
  if (ingredient.unit === 'ml') return ingredient.amount;
  if (ingredient.unit === 'trait') return ingredient.amount * 0.9;
  if (ingredient.unit === 'goutte') return ingredient.amount * 0.05;
  if (ingredient.unit === 'cuillère') return ingredient.amount * 5;
  if (ingredient.unit === 'top') return 60;
  return 0;
};

const clampScore = (value: number) => Math.max(0, Math.min(5, value));

export function calculateCocktailMetrics(cocktail: Cocktail, pantryItems: PantryItem[]): CocktailMetrics {
  const pantry = new Map(pantryItems.map((item) => [item.id, item]));
  const rows = cocktail.ingredients.map((ingredient) => ({ ingredient, profile: pantry.get(ingredient.ingredientId), volumeMl: liquidVolume(ingredient) }));
  const initialVolumeMl = rows.reduce((sum, row) => sum + row.volumeMl, 0);
  const alcoholMl = rows.reduce((sum, row) => sum + row.volumeMl * ((row.profile?.abv ?? 0) / 100), 0);
  const allLiquidIsAlcoholic = rows.filter((row) => row.volumeMl > 0).every((row) => (row.profile?.abv ?? 0) > 0);
  const dilutionPercent = cocktail.method === 'Shaker' ? 25 : cocktail.method === 'Verre à mélange' || allLiquidIsAlcoholic ? 20 : 10;
  const servedVolumeMl = initialVolumeMl * (1 + dilutionPercent / 100);
  const weighted = (key: 'acidityScore' | 'bitternessScore') => initialVolumeMl
    ? rows.reduce((sum, row) => sum + row.volumeMl * (row.profile?.[key] ?? 0), 0) / initialVolumeMl
    : 0;
  const components = rows.filter((row) => row.volumeMl > 0).map((row) => ({
    name: row.ingredient.name, volumeMl: row.volumeMl, abv: row.profile?.abv ?? 0,
    alcoholMl: row.volumeMl * ((row.profile?.abv ?? 0) / 100),
  }));
  const alcohols = components.filter((component) => component.abv > 0);
  return {
    pureAbv: initialVolumeMl ? alcoholMl / initialVolumeMl * 100 : 0,
    servedAbv: servedVolumeMl ? alcoholMl / servedVolumeMl * 100 : 0,
    sugarGrams: rows.reduce((sum, row) => sum + row.volumeMl * (row.profile?.sugarGramsPerLiter ?? 0) / 1000, 0),
    acidity: clampScore(weighted('acidityScore')),
    bitterness: clampScore(weighted('bitternessScore')),
    dilutionPercent, initialVolumeMl, servedVolumeMl, totalAlcoholMl: alcoholMl, components, alcohols,
  };
}

export const metricNumber = (value: number, digits = 1) => Number(value.toFixed(digits)).toLocaleString('fr-FR');
