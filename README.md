# Code secret

Le jeu de déduction des codes de couleurs : l'ordinateur cache une combinaison de 4 couleurs, et tu as 10 essais pour la retrouver grâce aux indices donnés après chaque proposition.

*English version: [README.en.md](README.en.md)*

## Comment jouer

1. Compose ta proposition : **clic sur une couleur** de la palette, ou touches **1 à 6**. Les fiches se remplissent de gauche à droite.
2. **Clic sur une fiche posée** pour l'enlever, ou **Retour** pour effacer la dernière.
3. **Entrée** ou le bouton Valider envoie la ligne (il faut 4 fiches).

## Les indices

À côté de chaque ligne validée :

- une **fiche noire** pour chaque couleur juste **et à la bonne place** ;
- une **fiche blanche** pour chaque couleur juste mais **placée ailleurs**.

Les indices ne disent pas quelles fiches sont concernées : c'est à toi de le déduire, ligne après ligne. Quatre fiches noires : le code est trouvé.

## Règles

- Le code utilise 6 couleurs possibles.
- **Couleurs en double possibles** (case cochée par défaut) : une même couleur peut apparaître plusieurs fois dans le code. Décoche-la pour une partie plus facile, avec 4 couleurs toutes différentes ; changer l'option lance une nouvelle partie.
- Au bout de 10 essais sans succès, la partie est perdue. Dans les deux cas, le code est dévoilé en bas ; un clic relance.

## Statistiques

Le panneau Records montre tes **parties gagnées** sur le nombre de parties, ta **moyenne d'essais** par victoire et ta **meilleure partie** (le moins d'essais).

## Données et synchronisation

Tes parties gagnées, tes essais et ton choix pour les doubles sont enregistrés par NeoDex, sauvegardés et synchronisés entre tes PC si la synchro est activée.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Code secret → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
