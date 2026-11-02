import type { Cocktail, PantryItem } from '@/types/cocktail';
import { clementCocktails, clementPantryItems } from '@/data/clement-cocktails.generated';

const heroAmericano = require('../../assets/images/cocktails/americano-hero.png');
const mintPantryItem: PantryItem = { id: 'menthe', name: 'Menthe', category: 'frais_garniture', emoji: '🌱', abv: 0, sugarGramsPerLiter: 0, acidityScore: 0, bitternessScore: 0 };

export const pantryItems: PantryItem[] = [
  ...clementPantryItems,
  mintPantryItem,
].filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index);

const curatedCocktails: Cocktail[] = [
  {
    slug: 'americano', name: 'Americano', subtitle: "L'amertume à l'italienne, tout en légèreté",
    story: "Né à la fin du XIXᵉ siècle dans les cafés milanais, l'Americano aurait gagné son nom auprès des voyageurs américains. Son équilibre entre amer, douceur vineuse et bulles en fait un apéritif d'une modernité intacte.",
    glass: 'Old fashioned', method: 'Au verre', type: 'Long drink', flavors: ['Amer', 'Herbacé', 'Pétillant'], difficulty: 1,
    ingredients: [
      { ingredientId: 'campari', name: 'Campari', amount: 30, unit: 'ml' },
      { ingredientId: 'vermouth-rouge', name: 'Vermouth rouge', amount: 30, unit: 'ml' },
      { ingredientId: 'soda', name: 'Eau gazeuse', amount: 30, unit: 'ml' },
    ],
    garnish: "Demi-rondelle d'orange", steps: ['Remplir le verre de glaçons.', 'Verser le bitter puis le vermouth.', "Allonger d'eau gazeuse et remuer délicatement."],
    featured: true, image: heroAmericano, source: { kind: 'éditorial', credit: 'Texte Arturo et Clémentine' },
  },
  {
    slug: 'negroni', name: 'Negroni', subtitle: 'Corsé, amer et parfaitement égalitaire', story: "À Florence, vers 1919, le comte Camillo Negroni aurait demandé que son Americano soit renforcé de gin à la place de l'eau gazeuse.",
    glass: 'Old fashioned', method: 'Au verre', type: 'Short drink', flavors: ['Amer', 'Herbacé', 'Corsé'], difficulty: 1,
    ingredients: [{ ingredientId: 'gin', name: 'Gin', amount: 30, unit: 'ml' }, { ingredientId: 'campari', name: 'Campari', amount: 30, unit: 'ml' }, { ingredientId: 'vermouth-rouge', name: 'Vermouth rouge', amount: 30, unit: 'ml' }],
    garnish: "Zeste d'orange", steps: ['Verser tous les ingrédients sur un gros glaçon.', 'Remuer une quinzaine de secondes.', "Exprimer un zeste d'orange."], source: { kind: 'éditorial', credit: 'Texte Arturo et Clémentine' },
  },
  {
    slug: 'amaretto-sour', name: 'Amaretto Sour', subtitle: "La gourmandise équilibrée par l'agrume", story: "Popularisé dans les années 1970, ce sour a retrouvé ses lettres de noblesse grâce à des recettes moins sucrées et plus structurées.",
    glass: 'Old fashioned', method: 'Shaker', type: 'Sour', flavors: ['Gourmand', 'Acidulé', 'Amande'], difficulty: 2,
    ingredients: [{ ingredientId: 'citron', name: 'Jus de citron jaune', amount: 30, unit: 'ml' }, { ingredientId: 'amaretto', name: 'Amaretto', amount: 60, unit: 'ml' }, { ingredientId: 'blanc-oeuf', name: "Blanc d'œuf", amount: 15, unit: 'ml', note: '½ blanc' }, { ingredientId: 'angostura', name: 'Angostura', amount: 3, unit: 'goutte' }, { ingredientId: 'sucre', name: 'Sirop de sucre', amount: 8, unit: 'ml' }],
    garnish: 'Zeste de citron', steps: ["Shaker d'abord sans glace si vous utilisez le blanc d'œuf.", 'Ajouter la glace et shaker vivement.', 'Filtrer sur un gros glaçon.'], source: { kind: 'adaptation', credit: 'Adaptation maison à valider' },
  },
  {
    slug: 'daiquiri', name: 'Daiquiri', subtitle: 'Trois ingrédients, aucun endroit où se cacher', story: "Ce grand classique cubain du début du XXᵉ siècle démontre que la précision compte davantage que la complication.",
    glass: 'Coupe', method: 'Shaker', type: 'Sour', flavors: ['Vif', 'Acidulé', 'Sec'], difficulty: 2,
    ingredients: [{ ingredientId: 'rhum-blanc', name: 'Rhum blanc', amount: 60, unit: 'ml' }, { ingredientId: 'citron-vert', name: 'Jus de citron vert', amount: 30, unit: 'ml' }, { ingredientId: 'sucre', name: 'Sirop de sucre', amount: 15, unit: 'ml' }],
    garnish: 'Aucune', steps: ['Shaker vivement avec des glaçons.', 'Double-filtrer dans une coupe refroidie.'], source: { kind: 'domaine-public', credit: 'Recette classique' },
  },
  {
    slug: 'margarita', name: 'Margarita', subtitle: 'Tequila, orange et citron vert en tension', story: "Ses origines sont disputées, mais sa parenté avec la famille des Daisy explique probablement son nom espagnol.",
    glass: 'Coupe', method: 'Shaker', type: 'Sour', flavors: ['Acidulé', 'Agrume', 'Salin'], difficulty: 2,
    ingredients: [{ ingredientId: 'tequila', name: 'Tequila', amount: 50, unit: 'ml' }, { ingredientId: 'triple-sec', name: 'Triple sec', amount: 20, unit: 'ml' }, { ingredientId: 'citron-vert', name: 'Jus de citron vert', amount: 25, unit: 'ml' }],
    garnish: 'Demi-croûte de sel', steps: ['Saler la moitié du bord de la coupe.', 'Shaker avec de la glace.', 'Double-filtrer dans la coupe.'], source: { kind: 'domaine-public', credit: 'Recette classique' },
  },
  {
    slug: 'mojito', name: 'Mojito', subtitle: 'Frais, herbacé et cubain', story: "Descendant de mélanges anciens à base d'aguardiente, le Mojito devient une icône cubaine au XXᵉ siècle.",
    glass: 'Highball', method: 'Au verre', type: 'Highball', flavors: ['Frais', 'Herbacé', 'Pétillant'], difficulty: 2,
    ingredients: [{ ingredientId: 'rhum-blanc', name: 'Rhum blanc', amount: 50, unit: 'ml' }, { ingredientId: 'citron-vert', name: 'Jus de citron vert', amount: 25, unit: 'ml' }, { ingredientId: 'sucre', name: 'Sirop de sucre', amount: 15, unit: 'ml' }, { ingredientId: 'menthe', name: 'Menthe', amount: 8, unit: 'pièce' }, { ingredientId: 'soda', name: 'Eau gazeuse', amount: 50, unit: 'ml' }],
    garnish: 'Bouquet de menthe', steps: ['Déposer la menthe et les liquides dans le verre.', 'Ajouter de la glace pilée et remuer.', "Compléter d'eau gazeuse."], source: { kind: 'domaine-public', credit: 'Recette classique' },
  },
  {
    slug: 'mule', name: 'Moscow Mule', subtitle: 'Le coup de fouet du gingembre', story: "Créé aux États-Unis dans les années 1940, il a uni le destin commercial de la vodka, de la ginger beer et de la fameuse timbale en cuivre.",
    glass: 'Mug ou highball', method: 'Au verre', type: 'Highball', flavors: ['Épicé', 'Frais', 'Pétillant'], difficulty: 1,
    ingredients: [{ ingredientId: 'tequila', name: 'Tequila (variation maison)', amount: 50, unit: 'ml' }, { ingredientId: 'citron-vert', name: 'Jus de citron vert', amount: 15, unit: 'ml' }, { ingredientId: 'ginger-beer', name: 'Ginger beer', amount: 100, unit: 'ml' }],
    garnish: 'Quartier de citron vert', steps: ['Verser les ingrédients sur glace.', 'Remuer doucement.'], source: { kind: 'adaptation', credit: 'Variation maison à valider' },
  },
];

const curatedNames = new Set(curatedCocktails.map((cocktail) => cocktail.name.toLocaleLowerCase('fr')));
const normalizedClementCocktails: Cocktail[] = clementCocktails.map((cocktail) => ({
  ...cocktail,
  ingredients: cocktail.ingredients.map((ingredient) => ingredient.ingredientId === 'soda' ? { ...ingredient, name: 'Eau gazeuse' } : ingredient),
  steps: cocktail.steps.map((step) => step.replace(/soda water/gi, 'eau gazeuse')),
}));
export const cocktails: Cocktail[] = [
  ...curatedCocktails,
  ...normalizedClementCocktails.filter((cocktail) => !curatedNames.has(cocktail.name.toLocaleLowerCase('fr'))),
];

export function getCocktail(slug: string) {
  return cocktails.find((cocktail) => cocktail.slug === slug);
}

export function availability(cocktail: Cocktail, stock: Set<string>) {
  const required = cocktail.ingredients.filter((ingredient) => !ingredient.optional);
  const owned = required.filter((ingredient) => stock.has(ingredient.ingredientId));
  return { percentage: required.length ? Math.round((owned.length / required.length) * 100) : 100, missing: required.filter((ingredient) => !stock.has(ingredient.ingredientId)) };
}
