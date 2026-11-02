// Cohérence de la base publiée (public/db) : tronçons, ingrédients, photos, champs obligatoires.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const DB = path.resolve('public/db');
const read = (file) => JSON.parse(readFileSync(path.join(DB, file), 'utf8'));
const manifest = read('manifest.json');
const ingredients = read(manifest.ingredients);
const cocktails = manifest.chunks.flatMap((chunk) => read(chunk.file));
const ingredientIds = new Set(ingredients.map((item) => item.id));

test('le manifeste décrit exactement les tronçons', () => {
  assert.equal(manifest.format, 1);
  assert.equal(cocktails.length, manifest.cocktailCount);
  for (const chunk of manifest.chunks) assert.equal(read(chunk.file).length, chunk.count, chunk.file);
});

test('environ 200 cocktails, ids et noms uniques', () => {
  assert.ok(cocktails.length >= 200, `${cocktails.length} cocktails`);
  assert.equal(new Set(cocktails.map((cocktail) => cocktail.id)).size, cocktails.length);
  assert.equal(new Set(cocktails.map((cocktail) => cocktail.name.toLowerCase())).size, cocktails.length);
});

test('chaque fiche est complète', () => {
  for (const cocktail of cocktails) {
    assert.ok(cocktail.name && cocktail.tagline && cocktail.description, `${cocktail.id} : textes`);
    assert.ok(cocktail.steps.length >= 1, `${cocktail.id} : étapes`);
    assert.ok(cocktail.ingredients.length >= 1, `${cocktail.id} : ingrédients`);
    assert.match(cocktail.color, /^#[0-9a-f]{6}$/i, `${cocktail.id} : couleur`);
    assert.ok(['clement', 'editorial', 'classique'].includes(cocktail.origin), `${cocktail.id} : origine`);
  }
});

test('tous les ingrédients des recettes existent', () => {
  for (const cocktail of cocktails) {
    for (const item of cocktail.ingredients) {
      assert.ok(ingredientIds.has(item.id), `${cocktail.id} → ${item.id}`);
      assert.ok(item.amount > 0, `${cocktail.id} → ${item.id} : quantité`);
    }
  }
});

test('les photos référencées existent et restent légères', () => {
  for (const cocktail of cocktails.filter((item) => item.image)) {
    const file = path.join(DB, cocktail.image.split('?')[0]);
    assert.ok(existsSync(file), `${cocktail.id} : ${file}`);
    assert.ok(readFileSync(file).length < 60 * 1024, `${cocktail.id} : photo trop lourde`);
  }
  assert.ok(manifest.imageBytes / manifest.imageCount < 30 * 1024, 'photo moyenne < 30 Ko');
});

test('les recettes de Clément sont toutes présentes', () => {
  assert.ok(cocktails.filter((cocktail) => cocktail.origin === 'clement').length >= 44);
});
