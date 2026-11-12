// Verse des recettes personnelles dans la base publiée (data-src), pour que tout le monde les reçoive.
//
// Source : une sauvegarde exportée depuis l'app (Réglages › Exporter mes données) ou un lien de fiche reçu.
//   pnpm db:perso <sauvegarde.json | lien>            liste ce qui serait ajouté, sans rien écrire
//   pnpm db:perso <sauvegarde.json | lien> --write    écrit dans data-src (puis : pnpm db:build, pnpm test, commit, push)
// Options :
//   --only id1,id2        seulement ces recettes (ids affichés par la liste)
//   --versions            inclut aussi vos versions modifiées de recettes de la base (dans data-src/overrides.json)
//   --origin clement      fiche signée « Sélection de Clément » (par défaut : « Rédaction Arturo et Clémentine »)
//
// Les ids sont gardés tels quels (perso-…) : sur votre téléphone et chez les amis qui ont importé la fiche,
// la recette publiée se confond avec la leur au lieu d'apparaître en double.
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { decodeRecipe, extractRecipeCode } from '../../src/lib/recipe-link.ts';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
};
const input = args.find((arg, index) => !arg.startsWith('--') && !['--only', '--origin'].includes(args[index - 1]));
if (!input) {
  console.log('Usage : pnpm db:perso <sauvegarde.json | lien de fiche> [--write] [--only id1,id2] [--versions] [--origin clement|editorial]');
  process.exit(1);
}
const write = flag('write');
const only = option('only')?.split(',').map((id) => id.trim()).filter(Boolean);
const origin = option('origin') ?? 'editorial';
if (!['clement', 'editorial', 'classique'].includes(origin)) throw new Error(`--origin inconnu : ${origin}`);

const SRC = path.resolve('data-src');
const RECIPES = path.join(SRC, 'recipes');
const TARGET = path.join(RECIPES, 'batch-perso.json');
const OVERRIDES = path.join(SRC, 'overrides.json');
const IMAGES = path.join(SRC, 'images');
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

// ——— Lecture de la source ———
let custom = [];
let customIngredients = [];
const code = extractRecipeCode(input);
if (code) {
  const card = await decodeRecipe(code);
  if (!card) throw new Error('Lien de fiche illisible (coupé ?).');
  custom = [card.cocktail];
  customIngredients = card.ingredients;
} else {
  const file = await readJson(input);
  if (file.kind !== 'arturo-clementine/sauvegarde') throw new Error('Ce fichier n’est pas une sauvegarde « Mes données » (Réglages › Exporter mes données).');
  custom = file.data?.custom ?? [];
  customIngredients = file.data?.customIngredients ?? [];
}

// ——— Base actuelle ———
const catalog = await readJson(path.join(SRC, 'ingredients.json'));
const knownIngredients = new Set(catalog.items.map((row) => row[0]));
const baseIds = new Set();
for (const file of (await readdir(RECIPES)).filter((name) => /^batch-[a-z0-9-]+\.json$/.test(name))) {
  const batch = await readJson(path.join(RECIPES, file));
  for (const row of batch.newIngredients ?? []) knownIngredients.add(row[0]);
  // Le lot perso est réécrit par ce script : ses fiches comptent comme des créations, pas comme la base.
  if (file !== 'batch-perso.json') for (const cocktail of batch.cocktails) baseIds.add(cocktail.id);
}
const overrides = existsSync(OVERRIDES) ? await readJson(OVERRIDES) : {};
const perso = existsSync(TARGET) ? await readJson(TARGET) : { _note: 'Recettes personnelles publiées (scripts/data/add-perso.mjs).', cocktails: [], newIngredients: [] };

// ——— Sélection ———
const selected = custom.filter((cocktail) => !only || only.includes(cocktail.id));
if (only) for (const id of only) if (!custom.some((cocktail) => cocktail.id === id)) console.warn(`! ${id} : absent de la source`);
const creations = selected.filter((cocktail) => !baseIds.has(cocktail.id));
const versions = selected.filter((cocktail) => baseIds.has(cocktail.id));

const LOCAL = ['image', 'imageCredit', 'updatedAt', 'source', 'origin', 'basedOn'];
const clean = (cocktail) => Object.fromEntries(Object.entries(cocktail).filter(([key]) => !LOCAL.includes(key)));
const ingredientRow = (item) => [item.id, item.name, item.category, item.abv ?? 0, item.sugar ?? 0, item.acidity ?? 0, item.bitterness ?? 0, item.emoji ?? '•'];

console.log(`Source : ${custom.length} recette${custom.length > 1 ? 's' : ''} personnelle${custom.length > 1 ? 's' : ''}.`);
if (!custom.length) process.exit(0);
console.log('\nCréations (ajoutées à data-src/recipes/batch-perso.json) :');
for (const cocktail of creations) {
  const already = perso.cocktails.some((item) => item.id === cocktail.id);
  console.log(`  + ${cocktail.id}  « ${cocktail.name} »${cocktail.image?.startsWith('data:') ? ' (avec photo)' : ''}${already ? ' — mise à jour' : ''}`);
}
if (!creations.length) console.log('  (aucune)');
if (versions.length) {
  console.log(`\nVersions modifiées de recettes de la base${flag('versions') ? ' (écrites dans data-src/overrides.json)' : ' (ignorées : ajoutez --versions pour les publier)'} :`);
  for (const cocktail of versions) console.log(`  ~ ${cocktail.id}  « ${cocktail.name} »`);
}

// ——— Ingrédients créés à la main ———
const used = new Set([...creations, ...(flag('versions') ? versions : [])].flatMap((cocktail) => cocktail.ingredients.map((item) => item.id)));
const newIngredients = customIngredients.filter((item) => used.has(item.id) && !knownIngredients.has(item.id));
if (newIngredients.length) console.log(`\nIngrédients ajoutés : ${newIngredients.map((item) => `${item.name} (${item.id})`).join(', ')}`);
for (const id of used) {
  if (!knownIngredients.has(id) && !newIngredients.some((item) => item.id === id)) console.warn(`! ingrédient inconnu de la base et de la source : ${id}`);
}

if (!write) {
  console.log('\nRien n’a été écrit. Relancez avec --write pour l’ajouter à data-src.');
  process.exit(0);
}

// ——— Écriture ———
for (const cocktail of creations) {
  const entry = { ...clean(cocktail), origin };
  const index = perso.cocktails.findIndex((item) => item.id === cocktail.id);
  if (index >= 0) perso.cocktails[index] = entry;
  else perso.cocktails.push(entry);
  // Photo prise dans l'app : déposée dans data-src/images, prioritaire au build.
  const photo = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(cocktail.image ?? '');
  if (photo) {
    await mkdir(IMAGES, { recursive: true });
    await writeFile(path.join(IMAGES, `${cocktail.id}.${photo[1] === 'jpeg' ? 'jpg' : photo[1]}`), Buffer.from(photo[2], 'base64'));
  }
}
perso.newIngredients = [
  ...(perso.newIngredients ?? []).filter((row) => !newIngredients.some((item) => item.id === row[0])),
  ...newIngredients.map(ingredientRow),
];
if (creations.length || newIngredients.length) await writeFile(TARGET, `${JSON.stringify(perso, null, 2)}\n`);

if (flag('versions') && versions.length) {
  for (const cocktail of versions) {
    const { id, ...fields } = clean(cocktail);
    overrides[id] = { ...(overrides[id] ?? {}), ...fields };
  }
  await writeFile(OVERRIDES, `${JSON.stringify(overrides, null, 2)}\n`);
}

console.log('\nÉcrit. Ensuite :');
console.log('  pnpm db:build     (vérifie les fiches, refait la base et les photos)');
console.log('  pnpm test');
console.log('  git commit puis git push : chaque app installée reçoit la nouvelle base à sa prochaine ouverture.');
