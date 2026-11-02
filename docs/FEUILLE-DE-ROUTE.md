# Feuille de route

## Lot 0 — prototype (présent)

- Identité visuelle et navigation Android-first.
- 7 recettes de démonstration à relire.
- Inventaire, score de disponibilité, fiche et favoris interactifs.

## Lot 1 — fondations V1

- SQLite, migrations, persistance du stock et des favoris.
- Outil d'import JSON/CSV avec validation de schéma.
- 20 recettes « étalon » entièrement relues.
- Tests unitaires sur quantités, filtres et disponibilité.

## Lot 2 — parcours complets

- Recherche et filtres combinables réellement fonctionnels.
- Substitutions et ingrédients équivalents.
- Liste de courses.
- Accessibilité, états vides, erreurs et petits écrans Android.

## Lot 3 — contenu et bêta

- Passage de 20 à 100 recettes validées.
- Development build partageable avec Clément.
- Mesure locale respectueuse de la vie privée et retours bêta.
- Préparation Play Store (icône, captures, politique de confidentialité).

## Lot 4 — recommandation V2

- API étroite devant le modèle local Qwen.
- Outils autorisés : rechercher, comparer, expliquer ; jamais écrire directement dans la base publiée.
- Évaluations avec scénarios (« Americano plus corsé », contraintes d'allergie, alcool disponible).
- Cache, délai maximal et solution 100 % déterministe si le serveur est indisponible.

## Décisions à prendre ensemble

- Conserver « Arturo et Clémentine » comme marque ou comme nom de code.
- Niveau de précision historique et format des sources affichées.
- Politique sur les marques d'alcool et les substitutions.
- Quantité suivie ou simple présence/absence dans le stock.
- Hébergement futur : serveur personnel seul ou service relais sécurisé.
