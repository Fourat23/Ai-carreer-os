# Correction — Jour 253 : Golden set : construction

[← Retour au jour 253](../days/day-253.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le golden set vaut par ses trois propriétés : représentativité (distribution == usage), vérité-terrain exploitable (source + passage pour l'automatisation), stabilité versionnée (figé, jamais pour développer). La taille suit la COUVERTURE des cas, pas le volume. Les questions viennent du besoin, formulées comme un utilisateur.

## ⚠️ Erreurs probables et points à vérifier
- Distribution biaisée vers le facile à écrire (trop de factuelles) : tu mesures un système que personne n'utilise vraiment.
- Questions tirées des documents : elles testent la mémorisation d'un passage, pas la capacité à répondre à un vrai besoin reformulé.
- Pas de passage exact dans la source de vérité : les métriques de retrieval du jour 254 redeviennent manuelles et coûteuses.
- Retoucher le set en cours d'éval « parce qu'une question est mal posée » : version 1.1 figée — note-la pour la 1.2, ne la change pas maintenant.

## 🔍 Comment vérifier ta solution
- Distribution par type mesurée et conforme à la cible d'usage (pas à la facilité).
- Chaque question non-hors-corpus a source + section + passage exact.
- Les cas difficiles (prémisse fausse, hors corpus proche, vocabulaire) sont présents et tagués.
- Aucune question n'est une citation déguisée (test mémorisation passé).
- Version 1.1 taguée avec changelog vs 1.0.

## 🎤 À savoir expliquer à l'oral
Explique le principe train/test appliqué au RAG : « mon golden set est mon jeu de TEST — figé, représentatif, avec vérité-terrain ; il ne sert jamais à développer, sinon je sur-ajuste dessus ». Puis la règle anti-mémorisation : « les questions viennent du besoin, pas des documents ». Deux principes, la crédibilité d'évaluation est établie.
