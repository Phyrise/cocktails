# Feuille de route

## Fait — V2 (novembre 2026)

- Web app installable (iPhone, Android, ordinateur), hors ligne, publiable sur GitHub Pages.
- Refonte visuelle : thème clair / sombre, police Fraunces, icônes, fiches lisibles, illustrations de verres.
- Base de 228 recettes (sélection de Clément, IBA, classiques, 26 sans alcool), 145 photos WebP légères.
- Base découpée en tronçons, mise à jour automatique, import / export d'un fichier.
- Bar, meilleurs achats, liste de courses, favoris, à essayer, notes et commentaires, recettes personnelles avec photo.
- Tests automatiques de la base et de la logique.

## Prochaines étapes

- **Relecture par Clément** des 179 classiques (champ `notes` des fiches) et des textes de ses propres recettes.
- **Photos maison** pour les recettes sans photo (déposer `data-src/images/<id>.jpg`, puis `pnpm db:build`).
- **Substitutions** affichées sur la fiche (« pas de Cointreau ? un autre triple sec convient »).
- **Partage** d'une recette personnelle par lien ou QR code.
- **Synchronisation** entre appareils (aujourd'hui : export / import d'une sauvegarde).
- **Android natif** (APK via EAS) si la web app ne suffit pas : le code est commun, seuls l'import/export de fichiers et la
  compression des photos ont une version web à décliner.

## Plus tard (V3)

- Assistant conversationnel devant le modèle local (API étroite : rechercher, comparer, expliquer ; jamais écrire dans
  la base publiée), avec repli sur les suggestions actuelles hors connexion.
- Profil gustatif appris dans le temps, scan d'étiquettes, encyclopédie des techniques.

## Décisions à prendre ensemble

- Conserver « Arturo et Clémentine » comme marque ou comme nom de code.
- Photos : soutenir TheCocktailDB ou produire nos propres photos avant une diffusion large.
- Niveau de précision historique et format des sources affichées.
