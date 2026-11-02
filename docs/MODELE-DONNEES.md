# Modèle de données (V2)

## Chaîne de fabrication

```
TheCocktailDB (catalogue brut) ─┐
Sélection de Clément ───────────┼─► data-src/recipes/batch-XX.json ─► pnpm db:build ─► public/db/
Recettes classiques / IBA ──────┘        + data-src/overrides.json            (manifeste, tronçons, photos)
```

1. `pnpm db:fetch` télécharge le catalogue TheCocktailDB (`data-src/cocktaildb/raw.json`).
2. `data-src/selection.json` liste les cocktails retenus ; `scripts/data/prepare-batches.mjs` en extrait les fiches brutes
   (`data-src/batches/input-XX.json`).
3. Les fiches sont rédigées en français selon `data-src/REDACTION.md` (doses en ml, ingrédients normalisés, textes
   originaux). Les lots 09 et 10 reprennent la sélection de Clément sans toucher aux doses.
4. `pnpm db:build` valide tout (familles, verres, unités, ingrédients connus, doublons), applique `overrides.json`,
   télécharge et recadre les photos, puis écrit `public/db/`.

## Fichiers publiés (`public/db/`)

| Fichier | Contenu |
|---|---|
| `manifest.json` | format, version (`date-empreinte`), nombre de recettes, liste des tronçons et des photos. |
| `ingredients.json` | catalogue d'ingrédients : id, nom, catégorie, degré, sucre g/L, acidité et amertume (0-5), emoji. |
| `cocktails-01.json`… | les fiches, par tronçons de 80. |
| `img/<id>.webp` | photos 480 × 480, ≈ 13 Ko. Les fiches les référencent avec `?v=<empreinte>` pour invalider le cache. |

## Une fiche

```ts
{
  id, name, aliases?, tagline, description,
  family,      // Sour, Highball, Spirit-forward, Fizz & Collins, Pétillant & Spritz, Tiki & Tropical, Crémeux & Dessert, Chaud, Shot, Punch & Partage, Sans alcool
  method,      // Shaker | Verre à mélange | Au verre | Blender
  glass, ice,
  ingredients: [{ id, amount, unit /* ml, trait, goutte, pièce, tranche, pincée, cuillère */, note?, optional? }],
  garnish, steps[], flavors[], difficulty /* 1-3 */, iba?, color /* teinte de la boisson */,
  image?, imageCredit?, origin /* clement | editorial | classique | perso */, source
}
```

Toutes les doses liquides sont en ml ; l'affichage convertit en cl ou oz et multiplie par le nombre de verres.

## Côté app

- La base est téléchargée tronçon par tronçon puis gardée dans IndexedDB : l'app démarre hors ligne.
- Au lancement, si `manifest.json` annonce une autre version, la nouvelle base est installée en arrière-plan.
- Les données personnelles (bar, favoris, à essayer, notes, commentaires, liste de courses, recettes personnelles,
  réglages) sont stockées à part (`user/v1`). Une recette personnelle qui porte l'id d'une recette de la base la remplace
  à l'affichage (« ma version ») ; la supprimer rétablit l'originale.
- Import / export : un fichier `arturo-clementine/sauvegarde` (données personnelles, fusion ou remplacement) ou
  `arturo-clementine/base` (toutes les recettes, pour une diffusion sans connexion).

## Disponibilité et suggestions

- Un cocktail est **faisable** si tous ses ingrédients non facultatifs sont dans le bar. Formes équivalentes acceptées
  (jus / quartiers de citron, sucre en sirop / morceau / poudre, champagne / prosecco…). Sucre, sel, poivre et eau gazeuse
  peuvent être considérés comme toujours présents (réglage).
- **Meilleurs achats** : chaque ingrédient manquant reçoit un score selon les recettes qu'il complète (1 point s'il est le
  seul manquant, 0,3 s'il en manque deux, 0,08 s'il en manque trois).
- **Mes goûts** : similarité (ingrédients et saveurs) avec les favoris et les recettes notées 4-5, pénalité pour celles
  notées 1-2.
- **Profil** : degré, sucre, acidité et amertume estimés à partir du catalogue d'ingrédients, avec une dilution selon la
  méthode (shaker 25 %, verre à mélange 20 %, blender 30 %, au verre 10 %).

## Provenance et droits

Les listes d'ingrédients et les proportions sont des faits ; les textes sont rédigés pour l'app. Les photos viennent de
TheCocktailDB (voir `docs/PUBLIER.md`). Chaque fiche garde son origine (`origin`, `source`, `imageCredit`), affichée en bas
de la fiche.
