# Correction — Jour 214 : Le composant 'appel LLM robuste'

[← Retour au jour 214](../days/day-214.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le composant réussit si l'appelant devient simple : un appel, un résultat validé ou une erreur nette, zéro gestion de retry/log/coût côté appelant. Les trois stratégies de retry selon la nature de l'erreur sont le cœur intelligent ; l'injection du client rend le tout testable sans réseau.

## ⚠️ Erreurs probables et points à vérifier
- Retry uniforme sur tout (y compris clé invalide ou requête malformée) : tu retardes l'échec inévitable et tu masques le vrai problème.
- Logger le prompt complet avec données personnelles : le log de production se réfléchit (hash ou troncature) — réflexe RGPD.
- Cacher des réponses à température > 0 : tu figes UN tirage aléatoire comme s'il était LA réponse.
- Interface qui fuit (l'appelant doit encore parser/valider) : la factorisation a échoué si les appelants gardent leur plomberie.

## 🔍 Comment vérifier ta solution
- Les 4 tests de panne passent (429→backoff, JSON cassé→retry informé, échec total→fallback, clé invalide→échec immédiat sans retry).
- L'extracteur ET l'app migrés : moins de lignes chez les appelants qu'avant.
- Chaque appel produit un log structuré complet.
- Le cache démontre un hit (même appel deux fois → un seul appel API).

## 🎤 À savoir expliquer à l'oral
Présente l'interface AVANT l'implémentation (« voici ce que voit l'appelant, voici ce que le composant lui épargne ») — c'est le réflexe design d'API qui impressionne. Puis un test de panne raconté : le 429 simulé, le backoff, le succès au 3e essai.
