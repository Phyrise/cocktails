# Modèle de données cible

Le prototype utilise des objets TypeScript. La V1 les stockera dans SQLite sur l'appareil, avec import de contenu éditorial versionné.

## Entités

- `cocktail` : identité, famille, verre, méthode, difficulté, statut et version.
- `cocktail_ingredient` : quantité, unité, facultatif, ordre et rôle.
- `ingredient` : nom canonique, catégorie et substituts acceptables.
- `flavor` : axes contrôlés (amer, sucré, acidulé, fruité, fumé, épicé…).
- `cocktail_flavor` : intensité de 0 à 5, validée éditorialement.
- `story` : texte historique, auteur, sources et niveau de confiance.
- `pantry_item` : ingrédient possédé, quantité facultative et date d'ouverture.
- `favorite` et `shopping_item` : listes personnelles.

## Calcul de disponibilité V1

Le score actuel est le pourcentage d'ingrédients obligatoires possédés. Avant publication, le calcul doit :

1. distinguer l'ingrédient exact, une famille compatible et un substitut éditorial ;
2. ignorer garnitures facultatives et consommables communs selon les réglages ;
3. donner plus de poids à l'alcool de base qu'au condiment ;
4. afficher le score et surtout la liste explicable des manquants.

## Préparation à la recommandation IA

La future IA ne doit pas inventer de recette : elle produit des filtres ou des identifiants de cocktails, puis l'application récupère les données validées. Une recherche hybride pourra combiner filtres SQL, scores gustatifs et embeddings du texte éditorial.

## Provenance et droits

Une liste d'ingrédients et des proportions factuelles sont généralement distinctes du texte créatif, mais les textes, photographies et mises en forme d'un livre ne doivent pas être copiés. Les 3 000 entrées d'un ouvrage commercial exigent une analyse des droits et, idéalement, une licence. Conserver pour chaque champ : source, contributeur, date, licence et notes de vérification.
