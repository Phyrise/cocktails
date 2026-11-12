// Fiche partagée par lien (src/lib/recipe-link.ts) : aller-retour, extraction depuis un message, codes abîmés.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { decodeRecipe, encodeRecipe, extractRecipeCode, recipeLinkPath } from '../../src/lib/recipe-link.ts';

const ingredients = new Map([
  ['gin', { id: 'gin', name: 'Gin', category: 'spiritueux', abv: 40, sugar: 0, acidity: 0, bitterness: 0.5, emoji: '🍸' }],
  ['perso-sirop-romarin', { id: 'perso-sirop-romarin', name: 'Sirop de romarin', category: 'sirop', abv: 0, sugar: 600, acidity: 0, bitterness: 0, emoji: '•' }],
]);
const recipe = {
  id: 'perso-romarin-fizz-a1b2', name: 'Romarin Fizz', tagline: 'Herbacé, frais, à l’apéro', description: 'Une création maison.',
  family: 'Fizz & Collins', method: 'Shaker', glass: 'Highball', ice: 'Glaçons',
  ingredients: [{ id: 'gin', amount: 45, unit: 'ml' }, { id: 'perso-sirop-romarin', amount: 20, unit: 'ml' }],
  garnish: 'Brin de romarin', steps: ['Shaker avec glace.', 'Allonger d’eau gazeuse.'], flavors: ['Herbacé'], difficulty: 1, color: '#9CC5A1',
  origin: 'perso', image: 'data:image/jpeg;base64,' + 'A'.repeat(20000), updatedAt: '2026-11-01T10:00:00Z',
};

test('une fiche fait l’aller-retour, sans photo ni champs propres à l’appareil', async () => {
  const code = await encodeRecipe(recipe, ingredients);
  assert.match(code, /^z[A-Za-z0-9_-]+$/);
  assert.ok(code.length < 1200, `code trop long : ${code.length}`);
  const card = await decodeRecipe(code);
  assert.equal(card.cocktail.name, 'Romarin Fizz');
  assert.deepEqual(card.cocktail.ingredients, recipe.ingredients);
  assert.equal(card.cocktail.image, undefined);
  assert.equal(card.cocktail.updatedAt, undefined);
  // Seuls les ingrédients créés à la main voyagent avec la fiche.
  assert.deepEqual(card.ingredients.map((item) => item.id), ['perso-sirop-romarin']);
});

test('le code se retrouve dans le message partagé entier', async () => {
  const code = await encodeRecipe(recipe, ingredients);
  const message = `🍸 Romarin Fizz\n\nOuvre ce lien :\n\nhttps://phyrise.github.io/cocktails${recipeLinkPath(code)}\n\nSur iPhone…`;
  assert.equal(extractRecipeCode(message), code);
  assert.equal(extractRecipeCode('Salut, ça va ?'), null);
});

test('un code coupé ou inventé est refusé sans planter', async () => {
  const code = await encodeRecipe(recipe, ingredients);
  assert.equal(await decodeRecipe(code.slice(0, 40)), null);
  assert.equal(await decodeRecipe('jnimportequoi'), null);
  assert.equal(await decodeRecipe('x' + code.slice(1)), null);
});
