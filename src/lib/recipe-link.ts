// Fiche de recette transportée dans un lien (…/importer#r=CODE) : un ami qui a l'app l'ajoute à ses recettes.
// Sans dépendance (ni React Native ni alias) : le script scripts/data/add-perso.mjs et les tests l'importent aussi.
import type { Cocktail, Ingredient } from '@/types/cocktail';

export type RecipeCard = { cocktail: Cocktail; ingredients: Ingredient[] };

const FORMAT = 1;
const MARKER = '#r=';

/** Champs propres à un appareil (photo, dates, provenance) : ils ne voyagent pas. */
const LOCAL_FIELDS = ['image', 'imageCredit', 'updatedAt', 'source', 'origin'] as const;

function portable(cocktail: Cocktail): Partial<Cocktail> {
  const rest: Partial<Cocktail> = { ...cocktail };
  for (const key of LOCAL_FIELDS) delete rest[key];
  return rest;
}

const toBase64Url = (bytes: Uint8Array) => {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (text: string) => {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const output = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(output).arrayBuffer());
}

/**
 * Code compact d'une fiche : JSON compressé (deflate) en base64 sans caractères spéciaux.
 * Préfixe « z » compressé, « j » brut (appareil sans CompressionStream).
 */
export async function encodeRecipe(cocktail: Cocktail, ingredientById: Map<string, Ingredient>): Promise<string> {
  // Les ingrédients créés à la main n'existent pas chez l'ami : ils partent avec la fiche.
  const extra = cocktail.ingredients
    .map((item) => ingredientById.get(item.id))
    .filter((item): item is Ingredient => !!item && item.id.startsWith('perso-'));
  const json = JSON.stringify({ v: FORMAT, c: portable(cocktail), ...(extra.length ? { i: extra } : {}) });
  const bytes = new TextEncoder().encode(json);
  if (typeof CompressionStream === 'undefined') return `j${toBase64Url(bytes)}`;
  return `z${toBase64Url(await pipe(bytes, new CompressionStream('deflate-raw')))}`;
}

/** Retrouve le code dans un lien ou dans tout le message reçu (texte WhatsApp collé, par exemple). */
export function extractRecipeCode(text: string): string | null {
  const match = /(?:#|[?&])r=([zj][A-Za-z0-9_-]{8,})/.exec(text);
  return match ? match[1] : null;
}

/** Décode une fiche (données brutes : à valider avant usage). Null si le code est abîmé ou d'un autre format. */
export async function decodeRecipe(code: string): Promise<{ cocktail: unknown; ingredients: unknown[] } | null> {
  try {
    let bytes = fromBase64Url(code.slice(1));
    if (code[0] === 'z') {
      if (typeof DecompressionStream === 'undefined') return null;
      bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    } else if (code[0] !== 'j') return null;
    const data = JSON.parse(new TextDecoder().decode(bytes)) as { v?: number; c?: unknown; i?: unknown };
    if (data.v !== FORMAT || !data.c || typeof data.c !== 'object') return null;
    return { cocktail: data.c, ingredients: Array.isArray(data.i) ? data.i : [] };
  } catch {
    return null;
  }
}

export const recipeLinkPath = (code: string) => `/importer${MARKER}${code}`;
