# Correction — Jour 22 : Les fonctions comme valeurs : callbacks et fonctions d'ordre supérieur

[← Retour au jour 22](../days/day-022.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le fil des 10 outils : séparer squelette et comportement. monMap = squelette « parcourir et collecter » + comportement fn. memoriser = squelette « vérifier le cache, sinon calculer et stocker » AUTOUR de n'importe quelle fn. Une fois ce découpage vu, tu le verras partout — middlewares Express (mois 3), hooks React (mois 4), decorators Python (mois 5).

## ✅ Une solution simple
```js
function monMap(arr, fn) {
  const resultat = [];
  for (const x of arr) resultat.push(fn(x));
  return resultat;
}
function memoriser(fn) {
  const cache = {};                       // capturée par la closure : privée, persistante
  return (arg) => {
    if (arg in cache) return cache[arg];  // hit : zéro calcul
    cache[arg] = fn(arg);                 // miss : calcule et stocke
    return cache[arg];
  };
}
const composer = (f, g) => (x) => f(g(x));
const pipeline = (...fns) => (x) => {
  let valeur = x;
  for (const fn of fns) valeur = fn(valeur);
  return valeur;
};
```

## 🚀 Une solution améliorée
creerValidateur relie trois jours d'un coup : les règles données-pilotées du jour 5, monFilter d'aujourd'hui, et la closure qui capture les règles : const creerValidateur = (regles) => (valeur) => regles.filter((r) => !r.test(valeur)).map((r) => r.message); — trois lignes qui remplacent le validateur entier du jour 5. QUAND cette ligne te paraîtra limpide, le chapitre sera acquis (relis-la après demain si besoin).

## ⚠️ Erreurs probables et points à vérifier
- arg in cache vs cache[arg] !== undefined : si fn retourne undefined légitimement, la 2e version recalcule à chaque fois — subtilité de vrai code de prod
- pipeline(...fns) : le rest capture les fonctions en tableau — pipeline(double, incrementer)(5) doit donner 11 (double d'abord) ; composer(double, incrementer)(5) donne 12 (incrementer d'abord, ordre mathématique) — la CONVENTION d'ordre diffère, documente la tienne
- monSome/monEvery sur tableau vide : some→false, every→true (vérité vide) — comportement natif à reproduire, et question piège d'entretien

## 🔍 Comment vérifier ta solution
- Chaque outil comparé au natif sur 3 cas (dont le tableau vide)
- memoriser : 2e appel < 1ms là où le 1er prenait 100ms+
- pipeline(x => x+1, x => x*2)(5) === 12 et l'ordre est celui que TU as documenté

## ❓ Réponses du mini-quiz
1. **Qu'est-ce qu'une fonction de première classe ?**
   → Une valeur à part entière : stockable dans une variable, passable en argument, retournable — le statut des fonctions en JS.
2. **Deux compteurs de la même fabrique partagent-ils leur variable compte ?**
   → Non : chaque APPEL de la fabrique crée une nouvelle portée, donc une nouvelle variable capturée. Indépendance totale.
3. **Pourquoi monEvery doit-il s'arrêter au premier false ?**
   → La réponse est déjà connue (un seul contre-exemple suffit) : continuer est du gaspillage — et sur un tableau infini/coûteux, la différence entre marche et gèle.
4. **memoriser échange quoi contre quoi ?**
   → De la mémoire (le cache grossit) contre du temps (zéro recalcul). Le compromis fondamental du jour 15, incarné — et le principe du cache LLM que tu construiras au mois 10.

## 🧩 Questions de réflexion
- La closure donne un état PRIVÉ sans classe ni objet : compare avec le personnage du jour 10 (état public, modifiable par tous). Quand veut-on l'un, quand l'autre ?
- memoriser ne marche QUE sur les fonctions pures : tu tiens là ta première raison DE FOND de préférer les fonctions pures (testables + cachables). Le jour 26 en ajoutera d'autres.
