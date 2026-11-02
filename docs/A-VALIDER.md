# À valider avec Clément

Points relevés pendant la rédaction et la relecture de la base V2 (novembre 2026). Les corrections se font dans
`data-src/recipes/batch-09.json` et `batch-10.json` (recettes de Clément) ou `data-src/overrides.json`, puis `pnpm db:build`.

## Recettes de Clément

Les ingrédients et les doses du classeur `COCKTAIL_TIME_V1` ont été gardés tels quels. Seuls les textes (accroche,
histoire, étapes, garniture) ont été réécrits. À relire :

- **Méthodes modifiées par la rédaction** : Alien Brain Damage monté au verre (au lieu du shaker), 1910 au verre à
  mélange, Charro Negro et Chartreuse Mule au verre.
- **Écarts avec les spécifications IBA** (gardés volontairement) : Aviation, Last Word (20 ml au lieu de 22,5), Bramble,
  White Lady (verre old fashioned, avec blanc d'œuf) et Garibaldi (60 ml de Campari au shaker, contre 45 ml monté au verre).
- **Doses de 22 ml et 8 ml** : conservées telles quelles, alors que le reste de la base est arrondi à 2,5 ou 5 ml.
- **Attributions historiques** prudentes à confirmer : Gun Metal Blue (bar Anvil, Houston), Amaretto Sour Bourbon
  (version de Jeffrey Morgenthaler).
- Dans le classeur, le Mud Slide n'a pas de Baileys (contrairement à la recette courante) et la Pineapple Bourbon
  Lemonade pas d'eau gazeuse : à confirmer.

## Recettes classiques (179)

- Rédigées d'après les spécifications IBA (89 cocktails officiels, catégories vérifiées sur la liste actuelle) ou la
  recette de référence la plus courante. 31 fiches ont été corrigées à la relecture.
- Recettes sans référence unique, proportions à goûter : Bahama Mama, Hurricane, Miami Vice, Rum Runner, Zombie.
- Substitutions faute d'ingrédient au catalogue : Brooklyn (amaro au lieu de l'Amer Picon), Canchanchara (rhum blanc au
  lieu de l'aguardiente), Mint Julep et Pornstar Martini (sirop au lieu du sucre glace et du sucre vanillé).
- Le Tom Collins se fait à l'Old Tom gin pour le distinguer du John Collins.

## Photos

83 recettes n'ont pas de photo (illustration du verre à la place), dont la plupart des recettes de Clément. Pour en
ajouter : déposer `data-src/images/<id>.jpg` (carré de préférence, n'importe quelle taille), puis `pnpm db:build` ;
l'image est recadrée en WebP 480 px et passe devant celle de TheCocktailDB.
