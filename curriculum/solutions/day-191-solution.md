# Correction — Jour 191 : Embeddings

[← Retour au jour 191](../days/day-191.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le protocole vaut par ses paires CONSTRUITES : chaque catégorie teste une propriété (sens sans mots, mots sans sens, désambiguïsation). Ta fonction cosinus doit passer cosinus(v, v)=1 et la symétrie avant toute interprétation.

## ⚠️ Erreurs probables et points à vérifier
- Comparer des embeddings de modèles différents (espaces incompatibles).
- Interpréter les valeurs absolues dans l'absolu (0.6 « bon » ? ça dépend du modèle) — ce sont les ÉCARTS entre catégories qui parlent.
- Ré-embedder les mêmes textes à chaque comparaison (coût inutile — cache-les).

## 🔍 Comment vérifier ta solution
- cosinus(v, v) = 1.0 ; cosinus(a, b) = cosinus(b, a).
- Le classement par catégories est respecté (synonymes > domaine > homonymes > sans rapport).
- Au moins UN désaccord intuition/cosinus analysé par écrit.

## 🎤 À savoir expliquer à l'oral
L'exemple « avocat/avocat » en 30 secondes : mêmes mots, sens différents, cosinus plus bas que deux synonymes sans mots communs — la preuve que c'est le SENS qui est mesuré.
