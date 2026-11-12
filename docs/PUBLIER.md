# Publier la web app (GitHub Pages)

Même principe qu'A²-Med : un dépôt GitHub, et GitHub Pages sert le site. L'app s'ouvre ensuite sur
`https://phyrise.github.io/cocktails/` et s'installe sur l'écran d'accueil de l'iPhone comme sur Android.

## Première publication (≈ 10 minutes)

1. Sur github.com, créer un dépôt **vide** nommé `cocktails` (public, ou privé avec un compte qui autorise Pages en privé).
   Le nom du dépôt devient le chemin du site : `/cocktails/`.
2. Dans ce dossier, sur la branche `v2` :

   ```bash
   git remote add origin https://github.com/Phyrise/cocktails.git
   git push -u origin v2:main
   ```

   (`v2:main` publie la branche de travail `v2` comme branche `main` du dépôt.)
3. Sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
4. Onglet **Actions** : le workflow « Publier la web app » se lance (tests, build, déploiement). Au bout de 2-3 minutes,
   l'adresse s'affiche dans le résumé du job `deploy`.

Ensuite, chaque `git push` sur `main` republie automatiquement le site.

## Installer sur un téléphone

- **iPhone (Safari)** : ouvrir l'adresse, bouton **Partager**, puis **Sur l'écran d'accueil**.
- **Android (Chrome)** : menu ⋮, puis **Installer l'application**.

L'app fonctionne ensuite hors connexion : l'interface et la base de recettes sont gardées sur le téléphone. Les photos
s'enregistrent au fil de la navigation, ou toutes d'un coup depuis **Réglages → Télécharger toutes les photos** (≈ 2 Mo).

## Mettre à jour les recettes

1. Modifier les fiches dans `data-src/recipes/*.json` (ou `data-src/overrides.json` pour une correction ponctuelle).
2. `pnpm db:build` : vérifie les fiches, refait les tronçons et les photos dans `public/db/`.
3. `pnpm test`, puis commit et push.

Au prochain lancement, l'app de chacun télécharge la nouvelle base (réglage « Mise à jour automatique », activé par défaut).
Les favoris, notes, bar et recettes personnelles sont stockés à part et ne sont jamais écrasés.

## Ajouter vos recettes perso à la base

Les recettes créées dans l'app restent sur le téléphone. Pour les publier (tout le monde les reçoit à la mise à jour) :

1. Dans l'app : **Réglages › Exporter mes données**, puis récupérer le fichier sur l'ordinateur (AirDrop, mail…).
   Pour une seule recette, un lien de fiche suffit (Partager › La fiche, à ajouter dans l'app).
2. Voir ce qui serait ajouté, sans rien écrire :

   ```bash
   pnpm db:perso chemin/vers/arturo-clementine-sauvegarde-AAAA-MM-JJ.json
   ```

3. Écrire dans `data-src` (fiches dans `data-src/recipes/batch-perso.json`, photos dans `data-src/images/`) :

   ```bash
   pnpm db:perso chemin/vers/arturo-clementine-sauvegarde-AAAA-MM-JJ.json --write
   ```

   Options : `--only id1,id2` pour en choisir quelques-unes, `--origin clement` pour les signer « Sélection de Clément »,
   `--versions` pour publier aussi vos versions modifiées de recettes de la base (dans `overrides.json`).
4. `pnpm db:build`, `pnpm test`, relire le diff, puis commit et push.

Les ids sont gardés : sur votre téléphone (et chez les amis qui avaient importé la fiche), la recette publiée se fond avec la
copie perso au lieu d'apparaître en double. Elle s'affiche alors comme « ma version » : « Revenir à la recette d'origine »
supprime la copie perso.

## Taille et découpage

| Élément | Taille |
|---|---|
| Application (JS, polices, icônes) | ≈ 1,6 Mo, ≈ 450 Ko une fois compressée par GitHub |
| Base de recettes | 3 tronçons JSON de ≈ 90 Ko (`public/db/cocktails-0X.json`) |
| Photos | 145 WebP 480 px, ≈ 13 Ko chacune, 1,8 Mo en tout |

Le découpage en tronçons est réglable (`node scripts/data/build-db.mjs --chunk 80`). À 200-300 recettes, on reste loin des
limites de GitHub (100 Mo par fichier) et de Safari. Si la base devient très grosse (photos plus grandes, milliers de
recettes), augmenter le nombre de tronçons suffit : l'app les télécharge un par un et vérifie chacun.

## Tester le site construit en local

```bash
pnpm build:web
```

```bash
pnpm serve:web
```

Puis ouvrir `http://localhost:8090/cocktails/`. Le terminal affiche aussi l'adresse à ouvrir depuis un téléphone sur le même
Wi-Fi (sans HTTPS, le mode hors ligne ne s'active pas sur le téléphone : il faut passer par GitHub Pages pour ça).

## Droits

- Recettes : listes d'ingrédients et proportions (faits), textes réécrits ; sélection de Clément.
- Photos : TheCocktailDB. Leur API gratuite est prévue pour un usage personnel ou de développement ; pour une diffusion
  publique large (Play Store, App Store), soutenir le projet sur leur Patreon ou remplacer les photos par les nôtres
  (déposer `data-src/images/<id>.jpg` : elles sont prioritaires sur celles de TheCocktailDB).
