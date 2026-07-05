# Correction — Jour 11 : Tableaux d'objets : le format de 90% des données réelles

[← Retour au jour 11](../days/day-011.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Chaque requête = un des 6 gestes ou une combinaison. La 10 est la plus riche : regrouper (geste 6) PUIS agréger chaque groupe (geste 4). Quand tu combines des gestes simples et nommés, la complexité reste maîtrisée — c'est toute la philosophie.

## ✅ Une solution simple
```js
const fs = require("node:fs");
const employes = JSON.parse(fs.readFileSync("data/employes.json", "utf8"));

// 8. tri à deux critères : le second départage quand le premier est ex æquo
const parServicePuisNom = [...employes].sort((a, b) => {
  if (a.service !== b.service) return a.service.localeCompare(b.service);
  return a.nom.localeCompare(b.nom);
});

// 9-10. regrouper puis agréger
const parService = {};
for (const e of employes) {
  parService[e.service] ??= [];
  parService[e.service].push(e);
}
const moyenneParService = {};
for (const [service, liste] of Object.entries(parService)) {
  let somme = 0;
  for (const e of liste) somme += e.salaire;
  moyenneParService[service] = Math.round(somme / liste.length);
}
```

## 🚀 Une solution améliorée
La requête bonus, geste par geste :
```js
const couts = [];                                   // transformation groupes → tableau
for (const [service, liste] of Object.entries(parService)) {
  let cout = 0;
  for (const e of liste) cout += e.salaire;
  couts.push({ service, cout });
}
couts.sort((a, b) => b.cout - a.cout);              // tri décroissant
const top3 = couts.slice(0, 3);                     // découpage
```
Garde ce fichier précieusement : au jour 24 tu le réécriras en reduce, au jour 80 en SQL (GROUP BY + ORDER BY + LIMIT), au jour 130 en pandas (groupby + sort_values + head). QUATRE syntaxes, UN SEUL modèle mental — c'est ça, apprendre en profondeur.

## ⚠️ Erreurs probables et points à vérifier
- localeCompare pour les strings (gère accents) vs soustraction pour les nombres — mélanger les deux est LE bug du tri multi-critères
- Object.entries te donne [clé, valeur] : la destructuration const [service, liste] rend la boucle lisible
- ??= (assigne si null/undefined) : si tu ne le connais pas, if (!groupes[cle]) groupes[cle] = [] est équivalent

## 🔍 Comment vérifier ta solution
- Masse salariale recalculée à la calculatrice sur tes 12 entrées
- Tri à 2 critères : les ex æquo de service sont bien par ordre alphabétique
- Regroupement : la somme des tailles des groupes = 12

## ❓ Réponses du mini-quiz
1. **Que donne [10, 9, 1].sort() et pourquoi ?**
   → [1, 10, 9] — sans comparateur, sort convertit en strings et trie alphabétiquement. Toujours passer (a,b) => a-b pour des nombres.
2. **Comment trier sans modifier l'original ?**
   → Copier d'abord : [...arr].sort(cmp) (ou arr.toSorted(cmp) en JS récent).
3. **Le pattern du regroupement par clé, de mémoire ?**
   → const groupes = {}; pour chaque x : groupes[x.cle] ??= []; groupes[x.cle].push(x).
4. **Pourquoi JSON.parse(JSON.stringify(obj)) est-il une technique de copie (et ses limites) ?**
   → L'aller-retour texte crée une copie PROFONDE — mais perd fonctions, dates (devenues strings), undefined. OK pour des données simples.

## 🧩 Questions de réflexion
- Ces 10 requêtes existent dans TOUS les outils de données (SQL, pandas, MongoDB, Excel). Pourquoi l'humanité réinvente-t-elle sans cesse les mêmes 6 gestes ?
- Quelle requête a été la plus dure ? C'est probablement une combinaison de gestes — laquelle ?
