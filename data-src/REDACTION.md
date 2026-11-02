# Consignes de rédaction des fiches (base V2)

Chaque lot produit un fichier JSON `data-src/recipes/batch-XX.json`, en UTF-8, de la forme :

```json
{
  "cocktails": [ /* fiches, voir ci-dessous */ ],
  "newIngredients": [ ["id", "Nom affiché", "catégorie", 40, 0, 0, 0, "🥃"] ]
}
```

## Une fiche

```json
{
  "id": "whiskey-sour",
  "name": "Whiskey Sour",
  "aliases": ["Whisky Sour"],
  "tagline": "Le sour originel, rond et vif",
  "description": "Deux à trois phrases en français…",
  "family": "Sour",
  "method": "Shaker",
  "glass": "Old fashioned",
  "ice": "Gros glaçon",
  "ingredients": [
    { "id": "bourbon", "amount": 45, "unit": "ml" },
    { "id": "citron", "amount": 25, "unit": "ml" },
    { "id": "sucre", "amount": 20, "unit": "ml" },
    { "id": "blanc-oeuf", "amount": 20, "unit": "ml", "optional": true, "note": "pour la mousse" }
  ],
  "garnish": "Zeste d'orange et cerise",
  "steps": ["Shaker à sec (sans glace) si vous utilisez le blanc d'œuf.", "Ajouter la glace et shaker vivement.", "Filtrer sur un gros glaçon."],
  "flavors": ["Acidulé", "Boisé", "Sucré"],
  "difficulty": 2,
  "iba": "Unforgettables",
  "color": "#E8B04A",
  "cocktailDbId": "11004",
  "notes": ""
}
```

### Champs

- `id` : slug en minuscules, sans accents, mots séparés par des tirets. Unique.
- `name` : le nom usuel le plus courant (ne pas traduire les noms propres : « Whiskey Sour », « Piña Colada », « Old Fashioned »). Corriger les graphies fautives de la source (ex. « Martinez 2 » → « Martinez », « Tuxedo Cocktail » → « Tuxedo », « Pina Colada » → « Piña Colada », « Egg-Nog - Classic Cooked » → « Eggnog », « Mulled Wine » → « Vin chaud », « Lassi - Mango » → « Lassi mangue »).
- `aliases` : autres noms connus (peut être vide).
- `tagline` : accroche française de 60 caractères maximum, concrète et évocatrice (pas de formule creuse).
- `description` : 2 à 3 phrases françaises **originales** (ne recopier aucun site ni livre) : origine ou contexte, puis profil gustatif. Les origines incertaines sont formulées comme telles (« aurait été créé », « selon la légende »). Pas d'affirmation inventée : en cas de doute, rester général.
- `family` : une valeur parmi `Sour`, `Highball`, `Spirit-forward`, `Fizz & Collins`, `Pétillant & Spritz`, `Tiki & Tropical`, `Crémeux & Dessert`, `Chaud`, `Shot`, `Punch & Partage`, `Sans alcool`. Tout cocktail sans alcool prend `Sans alcool`.
- `method` : `Shaker`, `Verre à mélange`, `Au verre` ou `Blender`.
- `glass` : une valeur parmi `Coupe`, `Martini`, `Old fashioned`, `Highball`, `Flûte`, `Verre à vin`, `Tiki`, `Mug cuivre`, `Tasse`, `Hurricane`, `Shot`, `Pinte`, `Julep`.
- `ice` : `Glaçons`, `Glace pilée`, `Gros glaçon`, `Sans glace` (servi « up » ou chaud).
- `ingredients` : dans l'ordre d'ajout logique (alcools forts d'abord, puis liqueurs, jus, sirops, allongeur).
  - `id` : **obligatoirement** un identifiant de `data-src/ingredients.json`. S'il n'existe vraiment aucun équivalent, créer un id et le déclarer dans `newIngredients` (même format que `ingredients.json`). Réutiliser plutôt que multiplier : Cointreau → `triple-sec`, Kahlúa → `liqueur-cafe`, brandy → `cognac`, rhum léger → `rhum-blanc`, rhum foncé → `rhum-brun`, sweet vermouth → `vermouth-rouge`, dry vermouth → `vermouth-sec`, Prosecco → `prosecco`, champagne → `champagne`, simple syrup → `sucre`, lime juice → `citron-vert`, lemon juice → `citron`, club soda → `soda`.
  - `amount` + `unit` : unités permises `ml`, `trait`, `goutte`, `pièce`, `tranche`, `pincée`, `cuillère` (cuillère à café). **Tout liquide en ml**, arrondi à 5 ml (2,5 ou 7,5 accepté pour les petites doses). Conversion : 1 oz = 30 ml, 1 shot = 45 ml, 1 tsp = 5 ml. Pour un allongeur « compléter avec », donner un volume réaliste en ml et `"note": "pour compléter"`.
  - Les garnitures purement décoratives vont dans `garnish`, pas dans les ingrédients. La menthe d'un Mojito, le sucre d'une Caipirinha ou le sel d'une Margarita restent des ingrédients s'ils font partie de la recette (sel : `optional` si c'est la croûte).
  - `optional: true` pour ce qui n'est pas indispensable.
- `garnish` : en français, `""` si aucune.
- `steps` : 2 à 5 phrases courtes à l'impératif, précises sur la technique (temps de shake, filtrer / double-filtrer, rincer le verre, etc.).
- `flavors` : 2 à 4 valeurs parmi `Acidulé`, `Amer`, `Sucré`, `Fruité`, `Agrume`, `Herbacé`, `Épicé`, `Fumé`, `Boisé`, `Crémeux`, `Café`, `Floral`, `Frais`, `Pétillant`, `Corsé`, `Sec`, `Tropical`, `Salé`.
- `difficulty` : 1 (verser et remuer), 2 (shaker, dosage précis), 3 (technique particulière, préparation maison, flambage, multiples étapes).
- `iba` : catégorie officielle IBA (`Unforgettables`, `Contemporary Classics`, `New Era Drinks`) ou `null`.
- `color` : couleur réaliste de la boisson servie (hex), utilisée pour l'illustration quand il n'y a pas de photo.
- `cocktailDbId` : l'id TheCocktailDB fourni dans l'entrée, sinon `null`.
- `notes` : facultatif, pour signaler à la relecture un écart avec la source.

## Fiabilité

- Les fiches TheCocktailDB sont souvent approximatives (doses fantaisistes, instructions bancales). Elles servent de point de départ, **pas de vérité**.
- Pour un cocktail IBA, suivre la spécification IBA actuelle (doses et méthode). Sinon, suivre la recette classique la plus reconnue (Difford's, PDT, Death & Co, ouvrages de référence), en la réécrivant avec vos propres mots.
- Si la fiche source décrit en réalité un autre cocktail que le nom l'indique, rédiger la recette classique correspondant au nom et signaler l'écart dans `notes` ; mettre `cocktailDbId` à `null` si la photo ne correspond pas au cocktail.
- Recettes sans alcool : vraies recettes équilibrées (acidité, sucre, dilution), pas de simples mélanges de jus.
