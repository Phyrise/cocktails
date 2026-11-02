export type CategoryId = 'spiritueux' | 'aperitif_vermouth' | 'liqueur' | 'jus' | 'soft_bulle' | 'sirop' | 'bitter_arome' | 'frais_garniture';
export type IngredientCategory = CategoryId;

export type MeasurementUnit = 'ml' | 'oz';
export type IngredientUnit = 'ml' | 'trait' | 'goutte' | 'pièce' | 'tranche' | 'pincée' | 'top' | 'cuillère';

export type IngredientAmount = {
  ingredientId: string;
  name: string;
  amount: number;
  unit: IngredientUnit;
  note?: string;
  category?: IngredientCategory;
  optional?: boolean;
};

export type Cocktail = {
  slug: string;
  name: string;
  subtitle: string;
  story: string;
  glass: string;
  method: 'Au verre' | 'Shaker' | 'Verre à mélange';
  type: string;
  flavors: string[];
  difficulty: 1 | 2 | 3;
  ingredients: IngredientAmount[];
  garnish: string;
  steps: string[];
  featured?: boolean;
  image?: number | { uri: string };
  experimental?: boolean;
  source: { kind: 'éditorial' | 'domaine-public' | 'adaptation' | 'sélection-clément' | 'expérimental'; credit: string };
};

export type PantryItem = {
  id: string;
  name: string;
  category: IngredientCategory;
  emoji: string;
  abv: number;
  sugarGramsPerLiter: number;
  acidityScore: number;
  bitternessScore: number;
};
