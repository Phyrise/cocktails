# Arturo et Clémentine

Une app française pour choisir un cocktail selon ses envies et ce qu'on a dans son bar. Projet d'Arturo (IA et cocktails)
et de Clément (histoire et cocktails).

**Version 2** : web app installable (iPhone et Android) construite avec Expo, base de 228 recettes avec photos légères,
fonctionnement hors connexion.

## Ce que fait l'app

- **Accueil** : cocktail du jour, ce que vous pouvez préparer maintenant, ce qui est « à un ingrédient près », envies
  (rafraîchissant, amer, sans alcool…), cocktail au hasard.
- **Cocktails** : recherche par nom, ingrédient ou saveur ; filtres faisable / manque 1 / sans alcool / favoris, alcool
  de base, famille, saveurs, préparation ; tris par disponibilité, goûts, note, degré.
- **Fiche** : ingrédients cochés selon votre bar, nombre de verres, ml / cl / oz, étapes, profil (degré, sucre, acidité,
  amertume), histoire, note sur 5 et commentaire, favoris, « à essayer », recettes proches, ajout des manquants aux courses.
- **Mon bar** : ingrédients par catégorie, meilleurs achats (ce qui débloque le plus de recettes), liste de courses.
- **Mes listes** : favoris, à essayer, notés, recettes personnelles.
- **Créer / modifier** une recette (avec photo, compressée sur le téléphone). Modifier une recette de la base crée
  « ma version », réversible.
- **Réglages** : unités, thème clair / sombre, mise à jour de la base, photos hors ligne, import / export (sauvegarde de
  vos données ou base complète en un fichier).

## Démarrer

Prérequis : Node.js 24 ou plus et pnpm 10 (`npm install -g pnpm@10`).

```bash
pnpm install
```

```bash
pnpm web
```

L'app s'ouvre dans le navigateur (`http://localhost:8081`). `pnpm android` lance la version Android dans un émulateur.

## Commandes

```bash
pnpm web          # développement, navigateur
pnpm typecheck    # TypeScript
pnpm lint         # règles Expo
pnpm test         # cohérence de la base + logique (disponibilité, quantités, recherche)
pnpm db:build     # reconstruit public/db à partir de data-src (fiches, photos WebP, tronçons)
pnpm db:fetch     # retélécharge le catalogue TheCocktailDB (rarement utile)
pnpm build:web    # site statique installable dans dist/ (base /cocktails)
pnpm serve:web    # sert dist/ comme GitHub Pages sur http://localhost:8090/cocktails/
pnpm icons        # régénère les icônes
```

Publication : voir [docs/PUBLIER.md](./docs/PUBLIER.md).

## Où travailler

| Dossier | Contenu |
|---|---|
| `src/app/` | Écrans (Expo Router) : `(tabs)/` accueil, cocktails, bar, listes ; `cocktail/[id]`, `editor`, `settings`. |
| `src/components/` | Interface : `ui.tsx` (boutons, puces, cartes…), `cocktail-card.tsx`, `cocktail-image.tsx` (photo ou verre dessiné), `icon.tsx`. |
| `src/lib/` | Logique : `cocktails.ts` (disponibilité, quantités, profil, recherche, suggestions), `database.ts` (téléchargement par tronçons), `filters.ts`, stockage. |
| `src/state/store.tsx` | État : base de recettes + données personnelles (IndexedDB sur le web), thème. |
| `data-src/` | Sources de la base : fiches par lots, catalogue d'ingrédients, corrections, consignes de rédaction. |
| `public/db/` | Base publiée (générée par `pnpm db:build`, ne pas modifier à la main). |
| `scripts/` | Données, build du site, icônes, tests. |
| `docs/` | Produit, modèle de données, feuille de route, publication. |

## Données

228 recettes : les 44 de la sélection de Clément (doses inchangées, textes réécrits), 5 fiches éditoriales et 179
classiques (spécifications IBA ou recettes de référence, rédigées en français), dont 24 sans alcool et 89 cocktails officiels IBA. 145 ont une photo
(TheCocktailDB, recadrée en WebP 480 px) ; les autres ont une illustration de leur verre teintée à la couleur de la boisson.
Détails : [docs/MODELE-DONNEES.md](./docs/MODELE-DONNEES.md).

## Statut

V2.0, prête à publier. Les données personnelles restent sur l'appareil (exportables en un fichier). Les recettes
classiques ont été relues mais méritent une validation par Clément (voir `notes` dans `data-src/recipes/`).
