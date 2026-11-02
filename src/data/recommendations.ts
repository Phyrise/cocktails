import type { Cocktail, PantryItem } from '@/types/cocktail';
import { calculateCocktailMetrics } from '@/utils/cocktail-metrics';

export type Recommendation = { cocktail: Cocktail; score: number; reason: string };

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const flavorTerms: Record<string, string[]> = {
  'Pétillant': ['petillant', 'bulles', 'fizz'], 'Boisé': ['boise', 'whisky', 'bourbon', 'mezcal'],
  'Fruité': ['fruite', 'fruit'], 'Tropical': ['tropical', 'ananas', 'coco'], 'Amer': ['amer', 'amertume'],
  'Acidulé': ['acidule', 'acide', 'citron'], 'Gourmand': ['gourmand', 'sucre', 'creme'],
  'Épicé': ['epice', 'gingembre', 'piment'], 'Herbacé': ['herbace', 'vegetal', 'herbes'],
  'Corsé': ['corse', 'fort', 'puissant'], 'Frais': ['frais', 'rafraichissant'],
};

const overlap = (left: string[], right: string[]) => {
  const a = new Set(left);
  const b = new Set(right);
  const common = [...a].filter((value) => b.has(value)).length;
  return common / Math.max(1, new Set([...a, ...b]).size);
};

export function recommendCocktails(prompt: string, cocktails: Cocktail[], favorites: Set<string>, pantryItems: PantryItem[]): Recommendation[] {
  const request = normalize(prompt);
  const requestedFlavors = Object.entries(flavorTerms).filter(([, terms]) => terms.some((term) => request.includes(term))).map(([flavor]) => flavor);
  const disliked = cocktails.filter((cocktail) => {
    const position = request.indexOf(normalize(cocktail.name));
    if (position < 0) return false;
    const before = request.slice(Math.max(0, position - 35), position);
    return /deteste|n'aime pas|sans|eviter|pas de/.test(before);
  });
  const liked = cocktails.filter((cocktail) => request.includes(normalize(cocktail.name)) && !disliked.includes(cocktail));
  const wantsLowSugar = /peu sucre|pas trop sucre|moins sucre|sec/.test(request);
  const wantsStrong = /plus fort|corse|puissant|alcoolise/.test(request);
  const wantsLight = /leger|peu alcoolise|moins fort/.test(request);
  const wantsBitter = /amer|amertume/.test(request);
  const wantsAcid = /acidule|acide|citronne/.test(request);

  return cocktails.filter((cocktail) => !disliked.includes(cocktail)).map((cocktail) => {
    const cocktailFlavors = cocktail.flavors.map(normalize);
    const ingredientIds = cocktail.ingredients.map((ingredient) => ingredient.ingredientId);
    let score = favorites.has(cocktail.slug) ? 1 : 0;
    const matched = requestedFlavors.filter((flavor) => cocktailFlavors.includes(normalize(flavor)));
    score += matched.length * 4;
    for (const reference of liked) score += overlap([...cocktailFlavors, ...ingredientIds], [...reference.flavors.map(normalize), ...reference.ingredients.map((item) => item.ingredientId)]) * 5;
    for (const reference of disliked) score -= overlap([...cocktailFlavors, ...ingredientIds], [...reference.flavors.map(normalize), ...reference.ingredients.map((item) => item.ingredientId)]) * 7;
    const metrics = calculateCocktailMetrics(cocktail, pantryItems);
    if (wantsLowSugar) score += Math.max(0, 4 - metrics.sugarGrams / 6);
    if (wantsStrong) score += metrics.servedAbv / 8;
    if (wantsLight) score += Math.max(0, 4 - metrics.servedAbv / 6);
    if (wantsBitter) score += metrics.bitterness;
    if (wantsAcid) score += metrics.acidity;
    const reasonParts = [];
    if (matched.length) reasonParts.push(matched.join(', ').toLowerCase());
    if (liked.length) reasonParts.push(`dans l’esprit du ${liked[0].name}`);
    if (wantsLowSugar) reasonParts.push(`${Number(metrics.sugarGrams.toFixed(1)).toLocaleString('fr-FR')} g de sucre estimé`);
    if (wantsStrong || wantsLight) reasonParts.push(`${Number(metrics.servedAbv.toFixed(1)).toLocaleString('fr-FR')}% ABV servi`);
    if (!reasonParts.length) reasonParts.push('une découverte issue de la sélection');
    return { cocktail, score, reason: `Recommandé pour ${reasonParts.join(' et ')}.` };
  }).filter((item) => item.score > 0 || (!requestedFlavors.length && !liked.length))
    .sort((a, b) => b.score - a.score || a.cocktail.name.localeCompare(b.cocktail.name, 'fr')).slice(0, 3);
}
