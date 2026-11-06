// Logique métier de src/lib/cocktails.ts (chargé directement grâce au retrait des types de Node).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { availability, bestPurchases, computeMetrics, formatAmount, matchesQuery, partyShopping, sanitizeCocktail, sanitizeList, searchText, tasteProfile, tasteScore } from '../../src/lib/cocktails.ts';

const negroni = {
  id: 'negroni', name: 'Negroni', tagline: '', description: '', family: 'Spirit-forward', method: 'Verre à mélange', glass: 'Old fashioned', ice: 'Gros glaçon',
  ingredients: [{ id: 'gin', amount: 30, unit: 'ml' }, { id: 'campari', amount: 30, unit: 'ml' }, { id: 'vermouth-rouge', amount: 30, unit: 'ml' }],
  garnish: '', steps: [], flavors: ['Amer'], difficulty: 1, color: '#B03A2E', origin: 'classique',
};
const daiquiri = {
  ...negroni, id: 'daiquiri', name: 'Daiquiri', family: 'Sour', method: 'Shaker', flavors: ['Acidulé'],
  ingredients: [{ id: 'rhum-blanc', amount: 60, unit: 'ml' }, { id: 'citron-vert', amount: 30, unit: 'ml' }, { id: 'sucre', amount: 15, unit: 'ml' }, { id: 'menthe', amount: 2, unit: 'pièce', optional: true }],
};
const ingredients = new Map([
  ['gin', { id: 'gin', name: 'Gin', abv: 40, sugar: 0, acidity: 0, bitterness: 0.5 }],
  ['campari', { id: 'campari', name: 'Campari', abv: 25, sugar: 245, acidity: 0, bitterness: 4.5 }],
  ['vermouth-rouge', { id: 'vermouth-rouge', name: 'Vermouth rouge', abv: 16, sugar: 140, acidity: 0.5, bitterness: 2 }],
]);

test('disponibilité : manquants, optionnels et basiques', () => {
  const stock = new Set(['gin', 'campari']);
  const value = availability(negroni, stock);
  assert.equal(value.ready, false);
  assert.deepEqual(value.missing.map((item) => item.id), ['vermouth-rouge']);
  // Le sucre est un basique, la menthe est facultative : il ne manque que le rhum et le citron vert.
  assert.deepEqual(availability(daiquiri, new Set()).missing.map((item) => item.id), ['rhum-blanc', 'citron-vert']);
  assert.equal(availability(daiquiri, new Set(), false).missing.length, 3);
  assert.equal(availability(daiquiri, new Set(['rhum-blanc', 'citron-vert-quartiers'])).ready, true, 'quartiers = jus');
});

test('meilleurs achats : ce qui complète une recette passe en premier', () => {
  const [first] = bestPurchases([negroni, daiquiri], new Set(['gin', 'campari']), true);
  assert.equal(first.id, 'vermouth-rouge');
  assert.deepEqual(first.unlocked.map((cocktail) => cocktail.id), ['negroni']);
});

test('quantités : unités et nombre de verres', () => {
  assert.equal(formatAmount({ id: 'gin', amount: 30, unit: 'ml' }, 'ml'), '30 ml');
  assert.equal(formatAmount({ id: 'gin', amount: 30, unit: 'ml' }, 'cl'), '3 cl');
  assert.equal(formatAmount({ id: 'gin', amount: 45, unit: 'ml' }, 'oz'), '1,5 oz');
  assert.equal(formatAmount({ id: 'gin', amount: 30, unit: 'ml' }, 'ml', 4), '120 ml');
  assert.equal(formatAmount({ id: 'angostura', amount: 2, unit: 'trait' }, 'ml'), '2 traits');
  assert.equal(formatAmount({ id: 'citron', amount: 0.5, unit: 'pièce' }, 'ml'), '½ pièce');
});

test('profil : un Negroni tourne autour de 20-25 % une fois dilué', () => {
  const metrics = computeMetrics(negroni, ingredients);
  assert.ok(metrics.abv > 20 && metrics.abv < 26, `${metrics.abv}`);
  assert.ok(metrics.bitterness > 2);
});

test('goûts : saveurs aimées, favoris et ingrédients évités', () => {
  const base = { favorites: new Set(), ratings: {}, likedFlavors: [], avoid: [] };
  const amer = tasteProfile([negroni, daiquiri], { ...base, likedFlavors: ['Amer'] });
  assert.ok(tasteScore(negroni, amer) > tasteScore(daiquiri, amer));
  const fan = tasteProfile([negroni, daiquiri], { ...base, favorites: new Set(['daiquiri']) });
  assert.ok(tasteScore(daiquiri, fan) > tasteScore(negroni, fan));
  const allergic = tasteProfile([negroni, daiquiri], { ...base, avoid: ['campari'] });
  assert.ok(tasteScore(negroni, allergic) < -5);
});

test('soirée : quantités additionnées et traduites en bouteilles et en fruits', () => {
  const byId = new Map([...ingredients, ['rhum-blanc', { id: 'rhum-blanc', name: 'Rhum blanc', category: 'spiritueux' }], ['citron-vert', { id: 'citron-vert', name: 'Jus de citron vert', category: 'jus' }], ['gin', { id: 'gin', name: 'Gin', category: 'spiritueux' }]]);
  const lines = partyShopping([{ cocktail: negroni, glasses: 10 }, { cocktail: daiquiri, glasses: 6 }], byId);
  const rhum = lines.find((line) => line.id === 'rhum-blanc');
  assert.equal(rhum.text, '36 cl');
  assert.equal(rhum.detail, '1 bouteille de 70 cl');
  assert.equal(lines.find((line) => line.id === 'gin').text, '30 cl');
  assert.equal(lines.find((line) => line.id === 'citron-vert').detail, '≈ 8 citrons verts');
  assert.ok(!lines.some((line) => line.id === 'menthe'), 'les facultatifs ne comptent pas');
});

test('fichier abîmé : fiches complétées ou écartées, jamais de plantage', () => {
  const repaired = sanitizeCocktail({ id: 'x', name: 'X', ingredients: [{ id: 'gin', amount: 30, unit: 'ml' }] });
  assert.deepEqual(repaired.steps, []);
  assert.deepEqual(repaired.flavors, []);
  assert.equal(sanitizeCocktail({ id: 'y', name: 'Y' }), null, 'sans ingrédient');
  assert.equal(sanitizeCocktail({ name: 'Z', ingredients: [] }), null, 'sans id');
  assert.equal(sanitizeList([negroni, null, 42, { id: 'a' }], sanitizeCocktail).length, 1);
  assert.deepEqual(sanitizeList('pas une liste', sanitizeCocktail), []);
});

test('recherche : accents ignorés, nom prioritaire', () => {
  const haystack = searchText(negroni, ingredients);
  assert.ok(matchesQuery(negroni, haystack, 'negro') > matchesQuery(negroni, haystack, 'campari'));
  assert.ok(matchesQuery(negroni, haystack, 'vermouth'));
  assert.equal(matchesQuery(negroni, haystack, 'tequila'), 0);
});

test('partage : texte de la recette, doses à l’échelle et lien', async () => {
  const { cocktailShareText } = await import('../../src/lib/cocktails.ts');
  const text = cocktailShareText({ ...negroni, steps: ['Remuer sur glace.', 'Filtrer.'], garnish: 'Zeste d’orange' }, ingredients, 'ml', 2, 'https://exemple.fr/cocktail/negroni');
  assert.match(text, /^🍸 Negroni/);
  assert.match(text, /Ingrédients \(2 verres\)/);
  assert.match(text, /• 60 ml Gin/);
  assert.match(text, /2\. Filtrer\./);
  assert.match(text, /Garniture : Zeste d’orange/);
  assert.ok(text.endsWith('La fiche : https://exemple.fr/cocktail/negroni'));
});

test('carafe : dilution, bulles au service, avertissements', async () => {
  const { batchPlan } = await import('../../src/lib/cocktails.ts');
  const plan = batchPlan(negroni, ingredients, 10, 'ml', true);
  assert.equal(plan.batch.length, 3);
  assert.equal(plan.batch[0].text, '300 ml');
  assert.equal(plan.waterMl, 180); // 900 ml × 20 % (verre à mélange)
  assert.equal(plan.totalMl, 1080);
  assert.equal(Math.round(plan.perGlassMl), 108);
  assert.equal(plan.container, 'une bouteille de 1,5 L');
  assert.equal(batchPlan(negroni, ingredients, 10, 'ml', false).waterMl, 0);

  const withSoda = new Map([...ingredients, ['prosecco', { id: 'prosecco', name: 'Prosecco', category: 'vin_bulles', abv: 11 }], ['blanc-oeuf', { id: 'blanc-oeuf', name: 'Blanc d’œuf', category: 'frais_garniture', abv: 0 }]]);
  const spritz = { ...negroni, method: 'Au verre', ingredients: [{ id: 'campari', amount: 60, unit: 'ml' }, { id: 'prosecco', amount: 90, unit: 'ml' }, { id: 'angostura', amount: 2, unit: 'trait' }, { id: 'blanc-oeuf', amount: 1, unit: 'pièce' }] };
  const spritzPlan = batchPlan(spritz, withSoda, 6, 'cl', true);
  assert.deepEqual(spritzPlan.atService.map((line) => line.id), ['prosecco', 'blanc-oeuf']);
  assert.equal(spritzPlan.atService[0].perGlass, '9 cl');
  assert.equal(spritzPlan.waterMl, 0); // construit au verre : la glace du verre suffit
  assert.equal(spritzPlan.batch[1].text, '12 traits (≈ 1,1 cl)');
  assert.equal(spritzPlan.warnings.length, 1);
});

test('carafe : élision du « de »', async () => {
  const { deName } = await import('../../src/lib/cocktails.ts');
  assert.equal(deName('eau gazeuse'), 'd’eau gazeuse');
  assert.equal(deName('prosecco'), 'de prosecco');
  assert.equal(deName('blanc d’œuf'), 'de blanc d’œuf');
});
