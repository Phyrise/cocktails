// Fichier généré depuis COCKTAIL_TIME_V1.xlsx le 12 août 2026.
// Ne pas modifier à la main : conserver le classeur de Clément comme source éditoriale.

import type { Cocktail, PantryItem } from '@/types/cocktail';
import { enrichPantryItem } from '@/data/ingredient-profiles';

const generatedPantryItems = [
  {
    "id": "blanc-oeuf",
    "name": "Blanc d'œuf",
    "category": "autre",
    "emoji": "◌"
  },
  {
    "id": "creme",
    "name": "Crème",
    "category": "autre",
    "emoji": "◌"
  },
  {
    "id": "eau-de-coco",
    "name": "Eau de coco",
    "category": "autre",
    "emoji": "◌"
  },
  {
    "id": "espresso",
    "name": "Espresso",
    "category": "autre",
    "emoji": "◌"
  },
  {
    "id": "lait-concentre",
    "name": "Lait concentré",
    "category": "autre",
    "emoji": "◌"
  },
  {
    "id": "lait-de-coco",
    "name": "Lait de coco",
    "category": "autre",
    "emoji": "◌"
  },
  {
    "id": "angostura",
    "name": "Angostura",
    "category": "bitter",
    "emoji": "🔴"
  },
  {
    "id": "chocolate-bitters",
    "name": "Chocolate bitters",
    "category": "bitter",
    "emoji": "🔴"
  },
  {
    "id": "peychauds-bitters",
    "name": "Peychauds Bitters",
    "category": "bitter",
    "emoji": "🔴"
  },
  {
    "id": "fleur-d-oranger",
    "name": "Fleur d'oranger",
    "category": "extrait",
    "emoji": "🌸"
  },
  {
    "id": "fraises-sechees",
    "name": "Fraises séchées",
    "category": "garniture",
    "emoji": "🌿"
  },
  {
    "id": "piment-sel",
    "name": "Piment / Sel",
    "category": "garniture",
    "emoji": "🌿"
  },
  {
    "id": "jus-d-ananas",
    "name": "Jus d'ananas",
    "category": "jus",
    "emoji": "🍋"
  },
  {
    "id": "jus-d-orange",
    "name": "Jus d'orange",
    "category": "jus",
    "emoji": "🍋"
  },
  {
    "id": "citron",
    "name": "Jus de citron jaune",
    "category": "jus",
    "emoji": "🍋"
  },
  {
    "id": "citron-vert",
    "name": "Jus de citron vert",
    "category": "jus",
    "emoji": "🍋"
  },
  {
    "id": "jus-de-cranberry",
    "name": "Jus de cranberry",
    "category": "jus",
    "emoji": "🍋"
  },
  {
    "id": "jus-de-pomme",
    "name": "Jus de pomme",
    "category": "jus",
    "emoji": "🍋"
  },
  {
    "id": "adriatico-blanco",
    "name": "Adriatico blanco",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "adriatico-blanco",
    "name": "Adriatico Blanco",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "amaretto",
    "name": "Amaretto",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "baileys",
    "name": "Baileys",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "campari",
    "name": "Campari",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "chartreuse-verte",
    "name": "Chartreuse verte",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "creme-de-mure",
    "name": "Crème de mûre",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "creme-de-rhum-vanille",
    "name": "Crème de rhum vanille",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "creme-de-rose",
    "name": "Crème de rose",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "creme-de-violette",
    "name": "Crème de violette",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "curacao-bleu",
    "name": "Curacao bleu",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "curacao-orange",
    "name": "Curacao orange",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "liqueur-cafe",
    "name": "Liqueur café",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "liqueur-de-coco",
    "name": "Liqueur de coco",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "liqueur-de-vanille",
    "name": "Liqueur de vanille",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "liqueur-peche",
    "name": "Liqueur pêche",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "maraschino",
    "name": "Maraschino",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "parfait-amour",
    "name": "Parfait amour",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "triple-sec",
    "name": "Triple sec",
    "category": "liqueur",
    "emoji": "🍸"
  },
  {
    "id": "coca-cola",
    "name": "Coca Cola",
    "category": "pétillant",
    "emoji": "✨"
  },
  {
    "id": "ginger-beer",
    "name": "Ginger beer",
    "category": "pétillant",
    "emoji": "✨"
  },
  {
    "id": "limonade",
    "name": "Limonade",
    "category": "pétillant",
    "emoji": "✨"
  },
  {
    "id": "soda",
    "name": "Soda water",
    "category": "pétillant",
    "emoji": "✨"
  },
  {
    "id": "sirop-d-agave",
    "name": "Sirop d'agave",
    "category": "sirop",
    "emoji": "🍯"
  },
  {
    "id": "sirop-d-orgeat",
    "name": "Sirop d'orgeat",
    "category": "sirop",
    "emoji": "🍯"
  },
  {
    "id": "sirop-de-cannelle",
    "name": "Sirop de cannelle",
    "category": "sirop",
    "emoji": "🍯"
  },
  {
    "id": "sirop-de-chocolat",
    "name": "Sirop de chocolat",
    "category": "sirop",
    "emoji": "🍯"
  },
  {
    "id": "sirop-de-grenadine",
    "name": "Sirop de grenadine",
    "category": "sirop",
    "emoji": "🍯"
  },
  {
    "id": "sucre",
    "name": "Sirop de sucre",
    "category": "sirop",
    "emoji": "🍯"
  },
  {
    "id": "bourbon",
    "name": "Bourbon",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "cognac",
    "name": "Cognac",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "gin",
    "name": "Gin",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "gin-peche",
    "name": "Gin pêche",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "gingembre-frais",
    "name": "Gingembre frais",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "mezcal",
    "name": "Mezcal",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "rhum-age",
    "name": "Rhum âgé",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "rhum-ananas",
    "name": "Rhum ananas",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "rhum-blanc",
    "name": "Rhum blanc",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "rhum-epice",
    "name": "Rhum épicé",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "rhum-jamaicain",
    "name": "Rhum jamaïcain",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "tequila",
    "name": "Tequila",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "vodka",
    "name": "Vodka",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "vodka-vanille",
    "name": "Vodka vanille",
    "category": "spiritueux",
    "emoji": "🥃"
  },
  {
    "id": "vermouth-rouge",
    "name": "Vermouth rouge",
    "category": "vin",
    "emoji": "🍷"
  }
];

export const clementPantryItems: PantryItem[] = generatedPantryItems.map(enrichPantryItem);

export const clementCocktails: Cocktail[] = [
  {
    "slug": "negroni",
    "name": "Negroni",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Old Fashioned",
    "method": "Verre à mélange",
    "type": "Stir",
    "flavors": [
      "Amer",
      "Herbacé",
      "Corsé"
    ],
    "difficulty": 1,
    "ingredients": [
      {
        "ingredientId": "campari",
        "name": "Campari",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "vermouth-rouge",
        "name": "Vermouth rouge",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "gin",
        "name": "Gin",
        "amount": 30,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un verre à mélange rempli de glaçons.",
      "Remuer jusqu’à dilution puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "amaretto-sour",
    "name": "Amaretto Sour",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Old Fashioned",
    "method": "Shaker",
    "type": "Sour",
    "flavors": [
      "Acidulé",
      "Gourmand",
      "Amer"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "amaretto",
        "name": "Amaretto",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "blanc-oeuf",
        "name": "Blanc d'œuf",
        "amount": 15,
        "unit": "ml",
        "note": "1/2"
      },
      {
        "ingredientId": "angostura",
        "name": "Angostura",
        "amount": 3,
        "unit": "goutte"
      },
      {
        "ingredientId": "sucre",
        "name": "Sirop de sucre",
        "amount": 8,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "corazon-solitario",
    "name": "Corazon Solitario",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Sour",
    "flavors": [
      "Acidulé",
      "Gourmand"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "tequila",
        "name": "Tequila",
        "amount": 40,
        "unit": "ml"
      },
      {
        "ingredientId": "creme-de-rose",
        "name": "Crème de rose",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "citron-vert",
        "name": "Jus de citron vert",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "sirop-d-agave",
        "name": "Sirop d'agave",
        "amount": 10,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "mud-slide",
    "name": "Mud Slide*",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Tasse espresso",
    "method": "Shaker",
    "type": "Nog",
    "flavors": [
      "Gourmand"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "vodka",
        "name": "Vodka",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "creme-de-rhum-vanille",
        "name": "Crème de rhum vanille",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "liqueur-cafe",
        "name": "Liqueur café",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "creme",
        "name": "Crème",
        "amount": 20,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "mezcal-mule",
    "name": "Mezcal Mule",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Moscow Mule",
    "method": "Shaker",
    "type": "Mule",
    "flavors": [
      "Acidulé",
      "Pétillant",
      "Boisé",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "mezcal",
        "name": "Mezcal",
        "amount": 50,
        "unit": "ml"
      },
      {
        "ingredientId": "citron-vert",
        "name": "Jus de citron vert",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "sirop-d-agave",
        "name": "Sirop d'agave",
        "amount": 10,
        "unit": "ml"
      },
      {
        "ingredientId": "ginger-beer",
        "name": "Ginger beer",
        "amount": 90,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "gun-metal-blue",
    "name": "Gun Metal Blue",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Création",
    "flavors": [
      "Acidulé",
      "Fruité",
      "Boisé",
      "Épicé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "citron-vert",
        "name": "Jus de citron vert",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "liqueur-peche",
        "name": "Liqueur pêche",
        "amount": 7.5,
        "unit": "ml"
      },
      {
        "ingredientId": "curacao-bleu",
        "name": "Curacao bleu",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "sirop-de-cannelle",
        "name": "Sirop de cannelle",
        "amount": 7.5,
        "unit": "ml"
      },
      {
        "ingredientId": "mezcal",
        "name": "Mezcal",
        "amount": 40,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "castaway",
    "name": "Castaway",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Tiki",
    "flavors": [
      "Gourmand",
      "Fruité",
      "Tropical",
      "Boisé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "rhum-age",
        "name": "Rhum âgé",
        "amount": 45,
        "unit": "ml"
      },
      {
        "ingredientId": "liqueur-cafe",
        "name": "Liqueur café",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-d-ananas",
        "name": "Jus d'ananas",
        "amount": 90,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "amaretto-sour-bourbon",
    "name": "Amaretto Sour Bourbon",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Old Fashioned",
    "method": "Shaker",
    "type": "Sour",
    "flavors": [
      "Acidulé",
      "Gourmand",
      "Boisé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "amaretto",
        "name": "Amaretto",
        "amount": 45,
        "unit": "ml"
      },
      {
        "ingredientId": "bourbon",
        "name": "Bourbon",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "sucre",
        "name": "Sirop de sucre",
        "amount": 10,
        "unit": "ml"
      },
      {
        "ingredientId": "blanc-oeuf",
        "name": "Blanc d'œuf",
        "amount": 15,
        "unit": "ml",
        "note": "1/2"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "pineapple-bourbon-lemonade",
    "name": "Pineapple Bourbon Lemonade",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Long Drink",
    "method": "Shaker",
    "type": "Fizz",
    "flavors": [
      "Acidulé",
      "Fruité",
      "Tropical",
      "Pétillant"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "bourbon",
        "name": "Bourbon",
        "amount": 75,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-d-ananas",
        "name": "Jus d'ananas",
        "amount": 120,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "bad-santa-bourbon-bomb",
    "name": "Bad Santa Bourbon Bomb",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Mug",
    "method": "Shaker",
    "type": "Nog",
    "flavors": [
      "Gourmand",
      "Boisé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "bourbon",
        "name": "Bourbon",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "baileys",
        "name": "Baileys",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "liqueur-cafe",
        "name": "Liqueur café",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "creme",
        "name": "Crème",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "sirop-de-chocolat",
        "name": "Sirop de chocolat",
        "amount": 15,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "scorpion-reef",
    "name": "Scorpion Reef",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Tiki",
    "flavors": [
      "Acidulé",
      "Fruité",
      "Tropical",
      "Amer"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "mezcal",
        "name": "Mezcal",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "rhum-jamaicain",
        "name": "Rhum jamaïcain",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-d-ananas",
        "name": "Jus d'ananas",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "sirop-d-orgeat",
        "name": "Sirop d'orgeat",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "chocolate-bitters",
        "name": "Chocolate bitters",
        "amount": 3,
        "unit": "trait"
      },
      {
        "ingredientId": "angostura",
        "name": "Angostura",
        "amount": 5,
        "unit": "trait"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "orange-whip",
    "name": "Orange Whip",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Nog",
    "flavors": [
      "Gourmand",
      "Fruité"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "rhum-blanc",
        "name": "Rhum blanc",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "vodka",
        "name": "Vodka",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "triple-sec",
        "name": "Triple sec",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-d-orange",
        "name": "Jus d'orange",
        "amount": 120,
        "unit": "ml"
      },
      {
        "ingredientId": "creme",
        "name": "Crème",
        "amount": 60,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "bear-fart",
    "name": "Bear Fart",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Verre à mélange",
    "type": "Nog",
    "flavors": [
      "Gourmand",
      "Boisé"
    ],
    "difficulty": 1,
    "ingredients": [
      {
        "ingredientId": "liqueur-cafe",
        "name": "Liqueur café",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "baileys",
        "name": "Baileys",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "tequila",
        "name": "Tequila",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "mezcal",
        "name": "Mezcal",
        "amount": 7.5,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un verre à mélange rempli de glaçons.",
      "Remuer jusqu’à dilution puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "nickel-city-pineapple-mai-tai",
    "name": "Nickel City Pineapple Mai Tai",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Mai Tai",
    "flavors": [
      "Acidulé",
      "Fruité",
      "Tropical",
      "Boisé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "citron-vert",
        "name": "Jus de citron vert",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "sirop-d-orgeat",
        "name": "Sirop d'orgeat",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "curacao-orange",
        "name": "Curacao orange",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "rhum-age",
        "name": "Rhum âgé",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "rhum-ananas",
        "name": "Rhum ananas",
        "amount": 30,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "espresso-martini-amaretto",
    "name": "Espresso Martini Amaretto",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Martini",
    "flavors": [
      "Gourmand",
      "Corsé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "vodka",
        "name": "Vodka",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "liqueur-cafe",
        "name": "Liqueur café",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "amaretto",
        "name": "Amaretto",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "espresso",
        "name": "Espresso",
        "amount": 30,
        "unit": "ml",
        "note": "1 espresso"
      },
      {
        "ingredientId": "sucre",
        "name": "Sirop de sucre",
        "amount": 5,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "blue-hawaiian",
    "name": "Blue Hawaiian",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Long Drink",
    "method": "Shaker",
    "type": "Highball",
    "flavors": [
      "Fruité",
      "Tropical"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "rhum-blanc",
        "name": "Rhum blanc",
        "amount": 40,
        "unit": "ml"
      },
      {
        "ingredientId": "curacao-bleu",
        "name": "Curacao bleu",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-d-ananas",
        "name": "Jus d'ananas",
        "amount": 80,
        "unit": "ml"
      },
      {
        "ingredientId": "lait-de-coco",
        "name": "Lait de coco",
        "amount": 40,
        "unit": "ml"
      },
      {
        "ingredientId": "sucre",
        "name": "Sirop de sucre",
        "amount": 20,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "amaretto-sunset",
    "name": "Amaretto Sunset",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Long Drink",
    "method": "Shaker",
    "type": "Highball",
    "flavors": [
      "Gourmand",
      "Fruité"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "jus-d-orange",
        "name": "Jus d'orange",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "triple-sec",
        "name": "Triple sec",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "vodka",
        "name": "Vodka",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "amaretto",
        "name": "Amaretto",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-de-cranberry",
        "name": "Jus de cranberry",
        "amount": 90,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "aviation",
    "name": "Aviation",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Sour",
    "flavors": [
      "Acidulé",
      "Gourmand",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "gin",
        "name": "Gin",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "maraschino",
        "name": "Maraschino",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "creme-de-violette",
        "name": "Crème de violette",
        "amount": 7.5,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 22,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "ramos-gin-fizz",
    "name": "Ramos Gin Fizz",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Highball",
    "method": "Shaker",
    "type": "Fizz",
    "flavors": [
      "Acidulé",
      "Gourmand",
      "Fruité",
      "Pétillant"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "gin",
        "name": "Gin",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "creme",
        "name": "Crème",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "citron-vert",
        "name": "Jus de citron vert",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "sucre",
        "name": "Sirop de sucre",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "fleur-d-oranger",
        "name": "Fleur d'oranger",
        "amount": 1,
        "unit": "trait"
      },
      {
        "ingredientId": "blanc-oeuf",
        "name": "Blanc d'œuf",
        "amount": 15,
        "unit": "ml",
        "note": "1/2"
      },
      {
        "ingredientId": "soda",
        "name": "Soda water",
        "amount": 30,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "white-lady",
    "name": "White lady",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Old Fashioned",
    "method": "Shaker",
    "type": "Sour",
    "flavors": [
      "Acidulé",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "gin",
        "name": "Gin",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "triple-sec",
        "name": "Triple sec",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "sucre",
        "name": "Sirop de sucre",
        "amount": 7.5,
        "unit": "ml"
      },
      {
        "ingredientId": "blanc-oeuf",
        "name": "Blanc d'œuf",
        "amount": 15,
        "unit": "ml",
        "note": "1/2"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "mezcal-sour",
    "name": "Mezcal Sour",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Sour",
    "flavors": [
      "Acidulé",
      "Boisé",
      "Épicé",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "mezcal",
        "name": "Mezcal",
        "amount": 50,
        "unit": "ml"
      },
      {
        "ingredientId": "citron-vert",
        "name": "Jus de citron vert",
        "amount": 25,
        "unit": "ml"
      },
      {
        "ingredientId": "sirop-d-agave",
        "name": "Sirop d'agave",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "blanc-oeuf",
        "name": "Blanc d'œuf",
        "amount": 15,
        "unit": "ml",
        "note": "1/2"
      },
      {
        "ingredientId": "gingembre-frais",
        "name": "Gingembre frais",
        "amount": 2,
        "unit": "tranche"
      },
      {
        "ingredientId": "fraises-sechees",
        "name": "Fraises séchées",
        "amount": 1,
        "unit": "pincée"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "brighton",
    "name": "Brighton",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Sour",
    "flavors": [
      "Acidulé",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "gin",
        "name": "Gin",
        "amount": 40,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-de-pomme",
        "name": "Jus de pomme",
        "amount": 40,
        "unit": "ml"
      },
      {
        "ingredientId": "citron-vert",
        "name": "Jus de citron vert",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "sirop-de-grenadine",
        "name": "Sirop de grenadine",
        "amount": 10,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "blue-lagoon",
    "name": "Blue Lagoon",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Sour",
    "flavors": [
      "Acidulé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "vodka",
        "name": "Vodka",
        "amount": 40,
        "unit": "ml"
      },
      {
        "ingredientId": "curacao-bleu",
        "name": "Curacao bleu",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 20,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "june-sour",
    "name": "June Sour",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Sour",
    "flavors": [
      "Acidulé",
      "Fruité",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "gin-peche",
        "name": "Gin pêche",
        "amount": 50,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "sucre",
        "name": "Sirop de sucre",
        "amount": 10,
        "unit": "ml"
      },
      {
        "ingredientId": "blanc-oeuf",
        "name": "Blanc d'œuf",
        "amount": 15,
        "unit": "ml",
        "note": "1/2"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "holy-water",
    "name": "Holy Water",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Highball",
    "method": "Shaker",
    "type": "Fizz",
    "flavors": [
      "Fruité",
      "Tropical",
      "Pétillant"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "vodka",
        "name": "Vodka",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "rhum-blanc",
        "name": "Rhum blanc",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "curacao-bleu",
        "name": "Curacao bleu",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "limonade",
        "name": "Limonade",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-d-ananas",
        "name": "Jus d'ananas",
        "amount": 30,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "cadillac-marg",
    "name": "Cadillac Marg",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Sour",
    "flavors": [
      "Acidulé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "tequila",
        "name": "Tequila",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "sirop-d-agave",
        "name": "Sirop d'agave",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "citron-vert",
        "name": "Jus de citron vert",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "triple-sec",
        "name": "Triple sec",
        "amount": 15,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "fat-penguin",
    "name": "Fat Penguin",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Nog",
    "flavors": [
      "Gourmand",
      "Fruité",
      "Épicé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "vodka-vanille",
        "name": "Vodka vanille",
        "amount": 45,
        "unit": "ml"
      },
      {
        "ingredientId": "rhum-epice",
        "name": "Rhum épicé",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "curacao-bleu",
        "name": "Curacao bleu",
        "amount": 15,
        "unit": "ml",
        "note": "Sur le côté du verre"
      },
      {
        "ingredientId": "jus-d-orange",
        "name": "Jus d'orange",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "creme",
        "name": "Crème",
        "amount": 30,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "sky-juice",
    "name": "Sky Juice",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Nog",
    "flavors": [
      "Gourmand",
      "Fruité",
      "Tropical",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "gin",
        "name": "Gin",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "lait-concentre",
        "name": "Lait concentré",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "eau-de-coco",
        "name": "Eau de coco",
        "amount": 120,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "the-incredible-turquoise-hulk",
    "name": "The Incredible Turquoise Hulk",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Création",
    "flavors": [
      "Acidulé",
      "Fruité",
      "Tropical",
      "Boisé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "citron-vert",
        "name": "Jus de citron vert",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "sucre",
        "name": "Sirop de sucre",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "curacao-bleu",
        "name": "Curacao bleu",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-d-ananas",
        "name": "Jus d'ananas",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "vodka",
        "name": "Vodka",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "cognac",
        "name": "Cognac",
        "amount": 22,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "racquet-club-fizz",
    "name": "Racquet Club Fizz",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Highball",
    "method": "Shaker",
    "type": "Fizz",
    "flavors": [
      "Acidulé",
      "Fruité",
      "Tropical",
      "Pétillant"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "sucre",
        "name": "Sirop de sucre",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-d-ananas",
        "name": "Jus d'ananas",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "rhum-blanc",
        "name": "Rhum blanc",
        "amount": 50,
        "unit": "ml"
      },
      {
        "ingredientId": "blanc-oeuf",
        "name": "Blanc d'œuf",
        "amount": 15,
        "unit": "ml",
        "note": "1/2"
      },
      {
        "ingredientId": "soda",
        "name": "Soda water",
        "amount": 0,
        "unit": "top"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "1910",
    "name": "1910",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Création",
    "flavors": [
      "Amer",
      "Boisé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "mezcal",
        "name": "Mezcal",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "cognac",
        "name": "Cognac",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "maraschino",
        "name": "Maraschino",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "peychauds-bitters",
        "name": "Peychauds Bitters",
        "amount": 2,
        "unit": "trait"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "garibaldi",
    "name": "Garibaldi",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Long Drink",
    "method": "Shaker",
    "type": "Highball",
    "flavors": [
      "Fruité",
      "Amer"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "campari",
        "name": "Campari",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-d-orange",
        "name": "Jus d'orange",
        "amount": 120,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "alien-brain-damage",
    "name": "Alien Brain Damage",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Shot",
    "method": "Shaker",
    "type": "Shot",
    "flavors": [
      "Gourmand",
      "Fruité",
      "Corsé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "liqueur-peche",
        "name": "Liqueur pêche",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "sirop-de-grenadine",
        "name": "Sirop de grenadine",
        "amount": 10,
        "unit": "ml"
      },
      {
        "ingredientId": "curacao-bleu",
        "name": "Curacao bleu",
        "amount": 10,
        "unit": "ml"
      },
      {
        "ingredientId": "baileys",
        "name": "Baileys",
        "amount": 20,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "godmother-sour",
    "name": "Godmother Sour",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Old Fashioned",
    "method": "Shaker",
    "type": "Sour",
    "flavors": [
      "Acidulé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "adriatico-blanco",
        "name": "Adriatico Blanco",
        "amount": 35,
        "unit": "ml"
      },
      {
        "ingredientId": "vodka",
        "name": "Vodka",
        "amount": 40,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "blanc-oeuf",
        "name": "Blanc d'œuf",
        "amount": 15,
        "unit": "ml",
        "note": "1/2"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "tropical-beach",
    "name": "Tropical Beach",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Tiki",
    "flavors": [
      "Fruité",
      "Tropical"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "liqueur-de-vanille",
        "name": "Liqueur de vanille",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "liqueur-de-coco",
        "name": "Liqueur de coco",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-d-orange",
        "name": "Jus d'orange",
        "amount": 100,
        "unit": "ml"
      },
      {
        "ingredientId": "sirop-de-grenadine",
        "name": "Sirop de grenadine",
        "amount": 40,
        "unit": "ml"
      },
      {
        "ingredientId": "curacao-bleu",
        "name": "Curacao bleu",
        "amount": 20,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "green-eyes",
    "name": "Green Eyes",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Création",
    "flavors": [
      "Acidulé",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "citron-vert",
        "name": "Jus de citron vert",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "sucre",
        "name": "Sirop de sucre",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "chartreuse-verte",
        "name": "Chartreuse verte",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "gin",
        "name": "Gin",
        "amount": 45,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "jasmine",
    "name": "Jasmine",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Création",
    "flavors": [
      "Acidulé",
      "Amer",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "gin",
        "name": "Gin",
        "amount": 45,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "campari",
        "name": "Campari",
        "amount": 7.5,
        "unit": "ml"
      },
      {
        "ingredientId": "triple-sec",
        "name": "Triple sec",
        "amount": 7.5,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "bramble",
    "name": "Bramble",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Création",
    "flavors": [
      "Acidulé",
      "Gourmand",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "gin",
        "name": "Gin",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 22,
        "unit": "ml"
      },
      {
        "ingredientId": "sucre",
        "name": "Sirop de sucre",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "creme-de-mure",
        "name": "Crème de mûre",
        "amount": 7.5,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "charro-negro",
    "name": "Charro Negro",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Création",
    "flavors": [
      "Acidulé",
      "Pétillant"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "citron-vert",
        "name": "Jus de citron vert",
        "amount": 15,
        "unit": "ml"
      },
      {
        "ingredientId": "tequila",
        "name": "Tequila",
        "amount": 60,
        "unit": "ml"
      },
      {
        "ingredientId": "coca-cola",
        "name": "Coca Cola",
        "amount": 120,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "grand-duc",
    "name": "Grand-Duc",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Old Fashioned",
    "method": "Shaker",
    "type": "Création",
    "flavors": [
      "Acidulé",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "chartreuse-verte",
        "name": "Chartreuse verte",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "vodka",
        "name": "Vodka",
        "amount": 10,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 5,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-de-pomme",
        "name": "Jus de pomme",
        "amount": 100,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "swampwater",
    "name": "Swampwater",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Création",
    "flavors": [
      "Acidulé",
      "Fruité",
      "Tropical",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "chartreuse-verte",
        "name": "Chartreuse verte",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 10,
        "unit": "ml"
      },
      {
        "ingredientId": "jus-d-ananas",
        "name": "Jus d'ananas",
        "amount": 100,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "last-word",
    "name": "Last Word",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Martini",
    "method": "Shaker",
    "type": "Création",
    "flavors": [
      "Acidulé",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "chartreuse-verte",
        "name": "Chartreuse verte",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "gin",
        "name": "Gin",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "maraschino",
        "name": "Maraschino",
        "amount": 20,
        "unit": "ml"
      },
      {
        "ingredientId": "citron-vert",
        "name": "Jus de citron vert",
        "amount": 20,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "chartreuse-mule",
    "name": "Chartreuse Mule",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Old Fashioned",
    "method": "Shaker",
    "type": "Mule",
    "flavors": [
      "Acidulé",
      "Pétillant",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "chartreuse-verte",
        "name": "Chartreuse verte",
        "amount": 30,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 10,
        "unit": "ml"
      },
      {
        "ingredientId": "ginger-beer",
        "name": "Ginger beer",
        "amount": 100,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  },
  {
    "slug": "blue-bird",
    "name": "Blue Bird",
    "subtitle": "Une recette sélectionnée par Clément.",
    "story": "Cette recette appartient à la sélection personnelle de Clément. Son histoire détaillée sera enrichie au fil de la validation éditoriale.",
    "glass": "Coupe ou verre adapté",
    "method": "Shaker",
    "type": "Création",
    "flavors": [
      "Acidulé",
      "Herbacé"
    ],
    "difficulty": 2,
    "ingredients": [
      {
        "ingredientId": "gin",
        "name": "Gin",
        "amount": 40,
        "unit": "ml"
      },
      {
        "ingredientId": "triple-sec",
        "name": "Triple sec",
        "amount": 10,
        "unit": "ml"
      },
      {
        "ingredientId": "curacao-bleu",
        "name": "Curacao bleu",
        "amount": 5,
        "unit": "ml"
      },
      {
        "ingredientId": "citron",
        "name": "Jus de citron jaune",
        "amount": 15,
        "unit": "ml"
      }
    ],
    "garnish": "Selon la recette et la saison.",
    "steps": [
      "Verser les ingrédients dans un shaker avec des glaçons.",
      "Shaker vivement puis filtrer dans le verre indiqué."
    ],
    "source": {
      "kind": "sélection-clément",
      "credit": "COCKTAIL_TIME_V1 — sélection de Clément"
    }
  }
];
