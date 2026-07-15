# Correction — Jour 263 : Le refus comme feature

[← Retour au jour 263](../days/day-263.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le refus est une feature à trois déclencheurs (hors corpus, corpus insuffisant, échec de vérification), au seuil calibré sur DEUX erreurs symétriques (trop laxiste = hallucine, trop strict = frustre) mesurées sur le golden set. Le message explique et oriente. C'est la fonctionnalité qui préserve la confiance et rend le système déployable auprès d'experts.

## ⚠️ Erreurs probables et points à vérifier
- Traiter le refus comme un échec à minimiser : c'est une feature — un système qui répond toujours est un système qui ment parfois.
- Calibrer le seuil sur les seuls cas hors-corpus : sans les questions COUVERTES, tu ne vois pas les refus injustifiés (le côté frustrant).
- Un refus-mur (« je ne sais pas ») sans explication ni orientation : l'utilisateur ne sait pas quoi faire, il abandonne.
- Régler le seuil sur les questions évidentes : le vrai test est la question PROCHE du corpus (jour 236) — c'est elle qui piège les seuils naïfs.

## 🔍 Comment vérifier ta solution
- Les trois déclencheurs de refus sont implémentés et testés.
- Le seuil est calibré sur le golden set avec la matrice des deux erreurs (justifiés/injustifiés).
- 3/3 questions hors corpus refusées, 0 question couverte refusée à tort.
- Le message de refus explique la cause ET oriente l'utilisateur.
- Le cas « proche mais absent » (jour 236) est correctement refusé.

## 🎤 À savoir expliquer à l'oral
Défends le refus comme une force : « un RAG qui répond toujours hallucine parfois, et un seul mensonge découvert par un expert détruit la confiance ; savoir dire je-ne-sais-pas est ce qui donne le droit d'être cru le reste du temps ». Puis le calibrage : « deux erreurs symétriques, réglées sur le golden set ». Positionner le refus comme feature, pas comme bug : un renversement qui marque.
