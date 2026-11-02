# Arturo et Clémentine

Une application mobile française pour choisir un cocktail à partir de ses envies et de ce que l'on possède déjà. Le projet est conçu par Arturo (IA et cocktails) et Clément (histoire et cocktails).

Le dépôt contient déjà un prototype Expo SDK 57 navigable : accueil éditorial, bibliothèque filtrable, disponibilité calculée, inventaire interactif, favoris et fiches recettes.

## Lancer le prototype

L'environnement du Mac est configuré avec Node.js 24 LTS, Watchman, Android Studio, le SDK Android et un appareil virtuel dédié.

```bash
pnpm install
pnpm android
```

La commande `pnpm android` démarre Expo en connexion locale et ouvre l'application dans l'émulateur Android actif. Le mode local évite les erreurs réseau `Failed to download remote update`. Si le téléphone virtuel n'est pas déjà lancé :

```bash
emulator -avd medium_phone
```

Pour un aperçu web rapide :

```bash
pnpm web
```

Pour tester sur un Pixel réel, en Wi-Fi, par USB ou avec un APK alpha, suivre [le guide Android](./docs/TESTER-SUR-ANDROID.md). Le profil EAS `preview` est prêt à produire un APK installable.

Expo recommande actuellement le template SDK 57 pour les nouveaux projets et un *development build* pour l'environnement de développement complet. Sur un téléphone Android physique, la version d'Expo Go disponible peut temporairement imposer un SDK plus ancien pendant la transition ; l'émulateur et le development build évitent cette contrainte.

## Où travailler

- `src/app/` : écrans et navigation Expo Router.
- `src/data/cocktails.ts` : jeu de démonstration (à faire valider par Clément).
- `src/types/cocktail.ts` : contrat de données.
- `src/state/app-state.tsx` : état local provisoire du stock et des favoris.
- `docs/` : cadrage produit, modèle de données et feuille de route.

## Commandes

```bash
pnpm start       # serveur Expo
pnpm android     # émulateur/appareil Android
pnpm web         # aperçu navigateur
pnpm lint        # règles Expo
pnpm typecheck   # vérification TypeScript
```

## Données, profils et laboratoire

La bibliothèque V0.2 réunit les recettes éditoriales initiales et les 44 cocktails du classeur `COCKTAIL_TIME_V1.xlsx` de Clément. L'import généré se trouve dans `src/data/clement-cocktails.generated.ts` et conserve les catégories détaillées ainsi que les doses en ml, traits, gouttes, pièces et garnitures.

Chaque ingrédient porte désormais un profil ABV, sucre, acidité et amertume. Les fiches calculent dynamiquement l'ABV avant/après dilution, le sucre par verre et les indices gustatifs. Les hypothèses de dilution vivent dans `src/utils/cocktail-metrics.ts` et les profils dans `src/data/ingredient-profiles.ts`.

L'onglet **Envies** contient désormais :

- un laboratoire de recettes manuelles avec photo et stockage local ;
- un accès aux réglages ml/oz, également disponible sur tous les autres écrans.

Le comptoir expert se trouve sur l'accueil. Il utilise un score déterministe combinant mots de saveur, proximité entre recettes, favoris, exclusions et indicateurs ABV/sucre/acide/amer. Il est conçu pour être remplacé ou complété plus tard par le modèle serveur.

## Statut

Prototype V0.3. Le stock, les favoris, les préférences d'unité et les créations expérimentales sont conservés localement sur l'appareil. Une synchronisation serveur pourra être ajoutée après validation des parcours et du modèle éditorial.
