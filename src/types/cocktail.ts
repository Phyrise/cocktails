export type CategoryId =
  | 'spiritueux'
  | 'aperitif_vermouth'
  | 'liqueur'
  | 'vin_bulles'
  | 'jus'
  | 'soft_bulle'
  | 'sirop'
  | 'bitter_arome'
  | 'frais_garniture';

export type MeasurementUnit = 'ml' | 'cl' | 'oz';
export type IngredientUnit = 'ml' | 'trait' | 'goutte' | 'pièce' | 'tranche' | 'pincée' | 'cuillère';

export type Family =
  | 'Sour'
  | 'Highball'
  | 'Spirit-forward'
  | 'Fizz & Collins'
  | 'Pétillant & Spritz'
  | 'Tiki & Tropical'
  | 'Crémeux & Dessert'
  | 'Chaud'
  | 'Shot'
  | 'Punch & Partage'
  | 'Sans alcool';

export type Method = 'Shaker' | 'Verre à mélange' | 'Au verre' | 'Blender';
export type Origin = 'clement' | 'editorial' | 'classique' | 'perso';

export type Ingredient = {
  id: string;
  name: string;
  category: CategoryId;
  /** Degré d'alcool en % vol. */
  abv: number;
  /** Sucre en g/L. */
  sugar: number;
  /** 0 à 5. */
  acidity: number;
  /** 0 à 5. */
  bitterness: number;
  emoji: string;
};

export type RecipeIngredient = {
  id: string;
  amount: number;
  unit: IngredientUnit;
  note?: string;
  optional?: boolean;
};

export type Cocktail = {
  id: string;
  name: string;
  aliases?: string[];
  tagline: string;
  description: string;
  family: Family;
  method: Method;
  glass: string;
  ice: string;
  ingredients: RecipeIngredient[];
  garnish: string;
  steps: string[];
  flavors: string[];
  difficulty: 1 | 2 | 3;
  iba?: string | null;
  /** Couleur de la boisson, pour l'illustration quand il n'y a pas de photo. */
  color: string;
  /** Chemin relatif à la base (`img/negroni.webp`) ou data URL d'une photo personnelle. */
  image?: string | null;
  imageCredit?: string | null;
  origin: Origin;
  source?: { label: string; url?: string };
  /** Pour une recette personnelle dérivée d'une recette de la base. */
  basedOn?: string;
  updatedAt?: string;
};

export type DatabaseChunkInfo = { file: string; count: number; bytes: number };

export type DatabaseManifest = {
  format: 1;
  version: string;
  generatedAt: string;
  cocktailCount: number;
  imageCount: number;
  imageBytes: number;
  ingredients: string;
  chunks: DatabaseChunkInfo[];
  images: string[];
};

export type Database = {
  version: string;
  generatedAt: string;
  cocktails: Cocktail[];
  ingredients: Ingredient[];
  /** Base d'URL des images de cette version (vide si les images sont intégrées). */
  imageBase: string;
};
