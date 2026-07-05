# Correction — Jour 24 : reduce : l'outil universel d'agrégation

[← Retour au jour 24](../days/day-024.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le rapport de ventes, étage par étage : filter (trimestre 2 : mois 4-6) → reduce (regrouper-sommer par vendeur : {vendeur: ca}) → Object.entries + map (vers [{vendeur, ca}]) → sort (décroissant). Quatre étages, chacun trivial — la complexité totale est maîtrisée par la décomposition, exactement le message du jour 9 appliqué aux données.

## ✅ Une solution simple
```js
const rapport = Object.entries(
    ventes
      .filter((v) => v.mois >= 4 && v.mois <= 6)
      .reduce((acc, v) => {
        acc[v.vendeur] = (acc[v.vendeur] ?? 0) + v.montant;
        return acc;
      }, {})
  )
  .map(([vendeur, ca]) => ({ vendeur, ca }))
  .sort((a, b) => b.ca - a.ca);
```
Les preuves :
```js
const mapAvecReduce = (arr, fn) =>
  arr.reduce((acc, x) => { acc.push(fn(x)); return acc; }, []);
const filterAvecReduce = (arr, fn) =>
  arr.reduce((acc, x) => { if (fn(x)) acc.push(x); return acc; }, []);
```

## 🚀 Une solution améliorée
Pourquoi muter l'acc avec push est ici inoffensif : l'acc ([]) est NÉ dans le reduce — personne d'autre ne le référence, la mutation est invisible de l'extérieur (« mutation locale, pureté externe »). La version [...acc, x] recopie tout le tableau à chaque tour : O(n²) pour le style. Retiens la nuance : l'immutabilité protège les données PARTAGÉES ; une donnée privée en cours de construction peut se muter sans péché. C'est une réponse d'entretien qui distingue.

## ⚠️ Erreurs probables et points à vérifier
- acc[v.vendeur] ?? 0 : le premier passage d'un vendeur n'a pas de clé — le ?? (ou ||, mais ?? est plus juste : jour 10) initialise ; sans lui, undefined + montant = NaN qui se propage partout
- Object.entries donne [[clé, valeur], ...] : la destructuration ([vendeur, ca]) dans le map — relis le jour 11 si ce détour objet→tableau reste flou
- La requête 10 (moyenne par service) : somme ET compte par groupe — un acc de forme {service: {somme, n}} PUIS une passe de division ; tenter la moyenne en un seul reduce est le sur-reduce typique

## 🔍 Comment vérifier ta solution
- Rapport : recalcule le CA d'UN vendeur à la calculatrice
- mapAvecReduce([Vide]) → [], filterAvecReduce comparé au natif sur 3 cas
- Ton max sur [-5, -2, -9] → -2 (le test qui tue la mauvaise valeur initiale)

## ❓ Réponses du mini-quiz
1. **Que reçoit et que retourne la callback de reduce ?**
   → Elle reçoit (accumulateur, élément) et DOIT retourner le prochain accumulateur — l'oubli du return est le bug n°1 (acc devient undefined au tour suivant).
2. **[].reduce((a, x) => a + x) : que se passe-t-il ?**
   → TypeError : sans valeur initiale ni élément, reduce ne peut pas démarrer. Avec 0 en initial : retourne 0 proprement. D'où la règle.
3. **Regrouper par clé en reduce : la callback en une ligne ?**
   → (acc, x) => { (acc[x.cle] ??= []).push(x); return acc; } avec {} initial — ou version sans mutation, plus verbeuse.
4. **Quand un reduce doit-il redevenir une boucle ?**
   → Quand la callback dépasse ~3 lignes claires, accumule plusieurs choses à la fois, ou qu'on a besoin d'un arrêt anticipé — la lisibilité juge, pas le style.

## 🧩 Questions de réflexion
- Tu as maintenant les 3 outils (map/filter/reduce) ET leurs équivalents boucle ET leurs versions maison : quelle version choisis-tu par défaut, et qu'est-ce qui te ferait changer ? Écris ta doctrine en 3 lignes dans tes notes — elle évoluera, et c'est le but.
- SQL : SELECT vendeur, SUM(montant) ... GROUP BY vendeur ORDER BY 2 DESC — ton pipeline EST cette requête. Au jour 80, tu traduiras dans l'autre sens.
