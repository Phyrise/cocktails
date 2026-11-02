// Logique métier de src/lib/cocktails.ts (chargé directement grâce au retrait des types de Node).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { availability, bestPurchases, computeMetrics, formatAmount, matchesQuery, searchText, tasteProfile, tasteScore } from '../../src/lib/cocktails.ts';

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

test('recherche : accents ignorés, nom prioritaire', () => {
  const haystack = searchText(negroni, ingredients);
  assert.ok(matchesQuery(negroni, haystack, 'negro') > matchesQuery(negroni, haystack, 'campari'));
  assert.ok(matchesQuery(negroni, haystack, 'vermouth'));
  assert.equal(matchesQuery(negroni, haystack, 'tequila'), 0);
});
