import type { IngredientAmount, MeasurementUnit } from '@/types/cocktail';

const formatNumber = (value: number, digits = 1) => Number(value.toFixed(digits)).toLocaleString('fr-FR');

export function formatIngredientAmount(ingredient: IngredientAmount, preferredUnit: MeasurementUnit) {
  let quantity: string;
  if (ingredient.unit === 'ml') {
    quantity = preferredUnit === 'oz'
      ? `${formatNumber(ingredient.amount / 30, 2)} oz`
      : `${formatNumber(ingredient.amount)} ml`;
  } else if (ingredient.unit === 'top') {
    quantity = 'Top';
  } else {
    const plurals: Record<string, string> = { trait: 'traits', goutte: 'gouttes', pièce: 'pièces', tranche: 'tranches', pincée: 'pincées', cuillère: 'cuillères' };
    const label = ingredient.amount > 1 ? plurals[ingredient.unit] ?? ingredient.unit : ingredient.unit;
    quantity = `${formatNumber(ingredient.amount)} ${label}`;
  }
  return ingredient.note ? `${quantity} · ${ingredient.note}` : quantity;
}
