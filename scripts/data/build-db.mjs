// Assemble la base publiée dans public/db/ à partir des fiches rédigées (data-src/recipes/batch-*.json, dont batch-perso.json) :
// validation, fusion des ingrédients, découpage en tronçons JSON et images WebP légères.
// Usage : node scripts/data/build-db.mjs [--chunk 80] [--size 480] [--quality 64]
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? Number(args[index + 1]) : fallback;
};
const CHUNK = option('chunk', 80);
const SIZE = option('size', 480);
const QUALITY = option('quality', 64);

const ROOT = path.resolve('.');
const SRC = path.join(ROOT, 'data-src');
const OUT = path.join(ROOT, 'public', 'db');
const CACHE = path.join(SRC, 'cache', 'img');
const LOCAL_IMAGES = path.join(SRC, 'images');

const FAMILIES = ['Sour', 'Highball', 'Spirit-forward', 'Fizz & Collins', 'Pétillant & Spritz', 'Tiki & Tropical', 'Crémeux & Dessert', 'Chaud', 'Shot', 'Punch & Partage', 'Sans alcool'];
const METHODS = ['Shaker', 'Verre à mélange', 'Au verre', 'Blender'];
const GLASSES = ['Coupe', 'Martini', 'Old fashioned', 'Highball', 'Flûte', 'Verre à vin', 'Tiki', 'Mug cuivre', 'Tasse', 'Hurricane', 'Shot', 'Pinte', 'Julep'];
const ICES = ['Glaçons', 'Glace pilée', 'Gros glaçon', 'Sans glace'];
const UNITS = ['ml', 'trait', 'goutte', 'pièce', 'tranche', 'pincée', 'cuillère'];
const FLAVORS = ['Acidulé', 'Amer', 'Sucré', 'Fruité', 'Agrume', 'Herbacé', 'Épicé', 'Fumé', 'Boisé', 'Crémeux', 'Café', 'Floral', 'Frais', 'Pétillant', 'Corsé', 'Sec', 'Tropical', 'Salé'];

const warnings = [];
const warn = (message) => warnings.push(message);
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

// ——— Ingrédients ———
const catalog = await readJson(path.join(SRC, 'ingredients.json'));
const toIngredient = ([id, name, category, abv, sugar, acidity, bitterness, emoji]) => ({ id, name, category, abv, sugar, acidity, bitterness, emoji });
const ingredients = new Map(catalog.items.map((row) => [row[0], toIngredient(row)]));

// ——— Fiches ———
const batchFiles = (await readdir(path.join(SRC, 'recipes'))).filter((file) => /^batch-[a-z0-9-]+\.json$/.test(file)).sort();
const cocktails = [];
for (const file of batchFiles) {
  const batch = await readJson(path.join(SRC, 'recipes', file));
  for (const row of batch.newIngredients ?? []) {
    if (!ingredients.has(row[0])) ingredients.set(row[0], toIngredient(row));
  }
  for (const cocktail of batch.cocktails) cocktails.push({ ...cocktail, _batch: file });
}

// Corrections éditoriales décidées à la relecture (appliquées après les lots, avant validation).
const overridesFile = path.join(SRC, 'overrides.json');
const overrides = existsSync(overridesFile) ? await readJson(overridesFile) : {};

const seen = new Map();
const valid = [];
for (const raw of cocktails) {
  const cocktail = { ...raw, ...(overrides[raw.id] ?? {}) };
  const label = `${cocktail.id} (${raw._batch})`;
  if (overrides[raw.id]?.exclude) continue;
  if (!cocktail.id || !/^[a-z0-9-]+$/.test(cocktail.id)) { warn(`id invalide : ${label}`); continue; }
  if (seen.has(cocktail.id)) { warn(`doublon ignoré : ${label} (déjà dans ${seen.get(cocktail.id)})`); continue; }
  const nameKey = cocktail.name.toLowerCase();
  const sameName = valid.find((other) => other.name.toLowerCase() === nameKey);
  if (sameName) { warn(`nom en double ignoré : ${label} = ${sameName.id}`); continue; }
  seen.set(cocktail.id, raw._batch);

  if (!FAMILIES.includes(cocktail.family)) warn(`famille inconnue « ${cocktail.family} » : ${label}`);
  if (!METHODS.includes(cocktail.method)) warn(`méthode inconnue « ${cocktail.method} » : ${label}`);
  if (!GLASSES.includes(cocktail.glass)) warn(`verre inconnu « ${cocktail.glass} » : ${label}`);
  if (!ICES.includes(cocktail.ice)) warn(`glace inconnue « ${cocktail.ice} » : ${label}`);
  cocktail.flavors = (cocktail.flavors ?? []).filter((flavor) => {
    if (FLAVORS.includes(flavor)) return true;
    warn(`saveur ignorée « ${flavor} » : ${label}`);
    return false;
  });
  for (const item of cocktail.ingredients) {
    if (!ingredients.has(item.id)) warn(`ingrédient inconnu « ${item.id} » : ${label}`);
    if (!UNITS.includes(item.unit)) warn(`unité inconnue « ${item.unit} » : ${label}`);
    if (!(item.amount > 0)) warn(`quantité invalide pour ${item.id} : ${label}`);
  }
  if (![1, 2, 3].includes(cocktail.difficulty)) cocktail.difficulty = 2;
  if (!/^#[0-9a-fA-F]{6}$/.test(cocktail.color ?? '')) { warn(`couleur invalide : ${label}`); cocktail.color = '#C9A27A'; }
  valid.push(cocktail);
}

// ——— Images ———
const raw = await readJson(path.join(SRC, 'cocktaildb', 'raw.json'));
const thumbs = new Map(raw.map((drink) => [drink.idDrink, drink.strDrinkThumb]));
const rawByName = new Map(raw.map((drink) => [drink.strDrink.toLowerCase(), drink]));
for (const file of (await readdir(path.join(SRC, 'batches'))).filter((name) => name.endsWith('.json'))) {
  for (const entry of await readJson(path.join(SRC, 'batches', file))) {
    if (entry.cocktailDb) thumbs.set(entry.cocktailDb.cocktailDbId, entry.cocktailDb.thumb);
  }
}

await mkdir(CACHE, { recursive: true });
await rm(OUT, { recursive: true, force: true });
await mkdir(path.join(OUT, 'img'), { recursive: true });

async function download(url, file) {
  if (existsSync(file)) return true;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await writeFile(file, Buffer.from(await response.arrayBuffer()));
      return true;
    } catch (error) {
      if (attempt === 3) { warn(`image non téléchargée ${url} : ${error.message}`); return false; }
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
  }
  return false;
}

async function lookupThumb(dbId) {
  try {
    const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${dbId}`);
    const json = await response.json();
    return json.drinks?.[0]?.strDrinkThumb ?? null;
  } catch {
    warn(`fiche TheCocktailDB ${dbId} introuvable`);
    return null;
  }
}

let imageBytes = 0;
const images = [];
const localImages = existsSync(LOCAL_IMAGES) ? await readdir(LOCAL_IMAGES) : [];
const queue = [...valid];
async function worker() {
  for (let cocktail = queue.shift(); cocktail; cocktail = queue.shift()) {
    let source = null;
    let credit = null;
    const local = localImages.find((file) => file.replace(/\.[a-z]+$/i, '') === cocktail.id);
    if (local) {
      source = path.join(LOCAL_IMAGES, local);
      credit = 'Photo Arturo et Clémentine';
    } else {
      let dbId = cocktail.cocktailDbId ?? null;
      if (!dbId) {
        const match = [cocktail.name, ...(cocktail.aliases ?? [])].map((name) => rawByName.get(name.toLowerCase())).find(Boolean);
        if (match && cocktail.origin !== undefined && !overrides[cocktail.id]?.noAutoImage) dbId = match.idDrink;
      }
      if (dbId && !thumbs.has(String(dbId))) thumbs.set(String(dbId), await lookupThumb(dbId));
      const thumb = dbId ? thumbs.get(String(dbId)) : null;
      if (thumb) {
        const file = path.join(CACHE, `${dbId}.jpg`);
        if (await download(thumb, file)) { source = file; credit = 'Photo TheCocktailDB'; }
      }
    }
    if (!source) { cocktail.image = null; continue; }
    const target = path.join(OUT, 'img', `${cocktail.id}.webp`);
    await sharp(source).resize(SIZE, SIZE, { fit: 'cover', position: 'centre' }).webp({ quality: QUALITY, effort: 5 }).toFile(target);
    const { size } = await stat(target);
    imageBytes += size;
    images.push(`img/${cocktail.id}.webp`);
    // Le suffixe de version fait recharger une photo modifiée malgré le cache hors ligne.
    const version = createHash('sha256').update(await readFile(target)).digest('hex').slice(0, 8);
    cocktail.image = `img/${cocktail.id}.webp?v=${version}`;
    cocktail.imageCredit = credit;
  }
}
await Promise.all(Array.from({ length: 6 }, worker));

// ——— Écriture ———
const origins = { clement: 'Sélection de Clément', editorial: 'Rédaction Arturo et Clémentine', classique: 'Recette classique (IBA et ouvrages de référence)' };
const published = valid
  .map(({ _batch, notes, cocktailDbId, ...cocktail }) => ({
    ...cocktail,
    origin: cocktail.origin ?? 'classique',
    source: { label: origins[cocktail.origin ?? 'classique'] },
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

const usedIngredients = new Set(published.flatMap((cocktail) => cocktail.ingredients.map((item) => item.id)));
const ingredientList = [...ingredients.values()].filter((item) => usedIngredients.has(item.id) || catalog.items.some((row) => row[0] === item.id));
const write = async (name, data) => {
  const body = JSON.stringify(data);
  await writeFile(path.join(OUT, name), body);
  return Buffer.byteLength(body);
};

await write('ingredients.json', ingredientList);
const chunks = [];
for (let index = 0; index * CHUNK < published.length; index += 1) {
  const part = published.slice(index * CHUNK, (index + 1) * CHUNK);
  const file = `cocktails-${String(index + 1).padStart(2, '0')}.json`;
  chunks.push({ file, count: part.length, bytes: await write(file, part) });
}

const digest = createHash('sha256').update(JSON.stringify([published, ingredientList])).digest('hex').slice(0, 8);
const today = new Date().toISOString().slice(0, 10);
const manifest = {
  format: 1,
  version: `${today}-${digest}`,
  generatedAt: new Date().toISOString(),
  cocktailCount: published.length,
  imageCount: images.length,
  imageBytes,
  ingredients: 'ingredients.json',
  chunks,
  images: images.sort(),
};
await write('manifest.json', manifest);

const totalJson = chunks.reduce((sum, chunk) => sum + chunk.bytes, 0);
console.log(`${published.length} cocktails, ${ingredientList.length} ingrédients, ${chunks.length} tronçons (${(totalJson / 1024).toFixed(0)} Ko)`);
console.log(`${images.length} images WebP (${(imageBytes / 1024 / 1024).toFixed(2)} Mo, moyenne ${(imageBytes / Math.max(1, images.length) / 1024).toFixed(1)} Ko)`);
console.log(`Sans photo : ${published.filter((cocktail) => !cocktail.image).map((cocktail) => cocktail.name).join(', ')}`);
if (warnings.length) console.log(`\n${warnings.length} avertissements :\n- ${warnings.join('\n- ')}`);
