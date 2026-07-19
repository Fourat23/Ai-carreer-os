# Correction — Jour 307 : DocSense : setup et CI vide

[← Retour au jour 307](../days/day-307.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : créer le repo et un README. Solution améliorée : structurer le repo selon l'architecture hexagonale (cœur/adapters/tests/docs), mettre en place une CI qui lint + teste dès le projet quasi vide (facile maintenant, pénible plus tard), vérifier qu'elle passe au ROUGE sur un test cassé (vrai filet), et relire la SPEC à J+2 pour les angles morts. Rendre la qualité automatique AVANT d'écrire le code qui en aura besoin.

## ⚠️ Erreurs probables et points à vérifier
- Reporter la CI « à quand il y aura du code » : l'ajouter tard sur un gros projet est un chantier douloureux — la mettre sur le projet vide est trivial.
- Une CI qui ne teste rien réellement : vérifier qu'elle passe au rouge sur un test cassé, sinon ce n'est pas un filet de sécurité.
- Structure en vrac « on rangera plus tard » : un projet qui grossit en désordre est douloureux à refactorer — structurer dès le départ.
- Oublier le .gitignore des secrets dès le premier commit : une clé committée est compromise (jour 298) — l'exclure AVANT le premier push.

## 🔍 Comment vérifier ta solution
- Le repo est structuré selon l'architecture hexagonale (cœur/adapters/tests/docs).
- La CI (GitHub Actions) tourne à chaque push et passe au vert.
- La CI passe au ROUGE sur un test volontairement cassé (filet vérifié).
- Le .gitignore exclut les secrets dès le premier commit.
- La SPEC est relue à J+2 et les angles morts corrigés.

## 🎤 À savoir expliquer à l'oral
Explique le principe « rendre la qualité automatique tôt » : « je mets la CI sur le projet vide parce que c'est facile maintenant et pénible plus tard ; dès le jour 1, chaque commit est linté et testé — impossible de merger du cassé sans le voir ». Puis la preuve : « je casse un test exprès, la CI passe au rouge — c'est un vrai filet ». Une CI verte dès le premier commit signale une culture de qualité qu'un recruteur remarque immédiatement.
