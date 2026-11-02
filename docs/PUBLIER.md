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
