// Télécharge le catalogue complet de TheCocktailDB (clé de développement publique « 1 »)
// dans data-src/cocktaildb/raw.json, puis écrit un résumé lisible pour la sélection.
// Usage : node scripts/data/fetch-cocktaildb.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?f=';
const OUT = path.resolve('data-src/cocktaildb');
const letters = [...'abcdefghijklmnopqrstuvwxyz0123456789'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchLetter(letter) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(API + letter);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      return Array.isArray(json.drinks) ? json.drinks : [];
    } catch (error) {
      if (attempt === 4) throw error;
      await sleep(1000 * attempt);
    }
  }
  return [];
}

const drinks = [];
for (const letter of letters) {
  const batch = await fetchLetter(letter);
  drinks.push(...batch);
  process.stdout.write(`${letter}:${batch.length} `);
  await sleep(250);
}

const unique = [...new Map(drinks.map((drink) => [drink.idDrink, drink])).values()];
await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, 'raw.json'), JSON.stringify(unique, null, 1));

const summary = unique.map((drink) => {
  const ingredients = [];
  for (let i = 1; i <= 15; i += 1) {
    const name = drink[`strIngredient${i}`];
    if (name) ingredients.push(`${(drink[`strMeasure${i}`] ?? '').trim()} ${name}`.trim());
  }
  return [drink.idDrink, drink.strDrink, drink.strIBA ?? '', drink.strAlcoholic ?? '', drink.strCategory ?? '', ingredients.join(' | ')].join('\t');
});
await writeFile(path.join(OUT, 'summary.tsv'), ['id\tname\tiba\talcoholic\tcategory\tingredients', ...summary].join('\n'));
console.log(`\n${unique.length} cocktails enregistrés.`);
