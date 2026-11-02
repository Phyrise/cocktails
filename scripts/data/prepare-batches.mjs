// Prépare les fichiers d'entrée des lots de rédaction : pour chaque nom de data-src/selection.json,
// retrouve la fiche TheCocktailDB (catalogue local, sinon recherche par nom) et en garde l'essentiel.
// Usage : node scripts/data/prepare-batches.mjs
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = path.resolve('data-src');
const raw = JSON.parse(await readFile(path.join(SRC, 'cocktaildb/raw.json'), 'utf8'));
const selection = JSON.parse(await readFile(path.join(SRC, 'selection.json'), 'utf8'));
const byName = new Map(raw.map((drink) => [drink.strDrink.toLowerCase(), drink]));

const compact = (drink) => {
  const ingredients = [];
  for (let i = 1; i <= 15; i += 1) {
    const name = drink[`strIngredient${i}`];
    if (name) ingredients.push([(drink[`strMeasure${i}`] ?? '').trim(), name.trim()]);
  }
  return {
    cocktailDbId: drink.idDrink, name: drink.strDrink, iba: drink.strIBA, alcoholic: drink.strAlcoholic,
    glass: drink.strGlass, ingredients, instructions: drink.strInstructions, instructionsFR: drink.strInstructionsFR, thumb: drink.strDrinkThumb,
  };
};

async function search(name) {
  const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`);
  if (!response.ok) return null;
  const json = await response.json();
  const drinks = Array.isArray(json.drinks) ? json.drinks : [];
  return drinks.find((drink) => drink.strDrink.toLowerCase() === name.toLowerCase()) ?? null;
}

await mkdir(path.join(SRC, 'batches'), { recursive: true });
const found = [];
for (const [index, names] of selection.batches.entries()) {
  const entries = [];
  for (const name of names) {
    let drink = byName.get(name.toLowerCase());
    if (!drink) {
      drink = await search(name);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    entries.push({ requestedName: name, cocktailDb: drink ? compact(drink) : null });
    found.push(`${drink ? '✓' : '·'} ${name}`);
  }
  const file = path.join(SRC, 'batches', `input-${String(index + 1).padStart(2, '0')}.json`);
  await writeFile(file, JSON.stringify(entries, null, 1));
}
console.log(found.join('\n'));
