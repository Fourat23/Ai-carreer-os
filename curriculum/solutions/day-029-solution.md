# Correction — Jour 29 : Récursion niveau 2 : structures imbriquées réelles

[← Retour au jour 29](../days/day-029.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Tout le jour tient dans le moule. chercherCle l'illustre entièrement : brancher selon le type, et dans la branche objet, AVANT de récurser sur les valeurs, regarder si la clé cherchée est LÀ (Object.entries donne les deux). L'accumulation des résultats : soit un tableau passé en paramètre (style accumulateur), soit concaténer les retours (style remontée) — mêmes deux styles qu'au jour 25, choisis et assume.

## ✅ Une solution simple
```js
function chercherCle(x, cle) {
  if (Array.isArray(x)) {
    return x.flatMap((element) => chercherCle(element, cle));
  }
  if (x !== null && typeof x === "object") {
    const resultats = [];
    for (const [k, v] of Object.entries(x)) {
      if (k === cle) resultats.push(v);            // trouvée ICI
      resultats.push(...chercherCle(v, cle));       // ET on continue en dessous
    }
    return resultats;
  }
  return [];                                        // feuille : rien à trouver dedans
}
function deepMap(x, fn) {
  if (Array.isArray(x)) return x.map((e) => deepMap(e, fn));
  if (x !== null && typeof x === "object")
    return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, deepMap(v, fn)]));
  return fn(x);                                     // feuille : ENFIN on applique
}
```

## 🚀 Une solution améliorée
La version robuste aux cycles (bonus) — le pattern « déjà visité » :
```js
function chercherCleSure(x, cle, vus = new Set()) {
  if (x !== null && typeof x === "object") {
    if (vus.has(x)) return [];                      // déjà exploré : cycle coupé
    vus.add(x);
  }
  // ... le reste du moule, en passant vus aux appels récursifs
}
```
Le Set mémorise les RÉFÉRENCES d'objets visités. Ce pattern exact (marquer les visités) est le cœur de BFS/DFS sur les graphes (semaine 6) — tu viens de le rencontrer par nécessité, la meilleure façon.

## ⚠️ Erreurs probables et points à vérifier
- flatMap dans la branche tableau : map donnerait des tableaux de tableaux de résultats (le problème du bonus jour 23 — boucle bouclée)
- Object.fromEntries : l'inverse d'entries — si inconnu, la boucle qui construit un objet neuf est équivalente
- copieProfonde sur une Date : typeof === "object" → ta fonction la traverse comme un objet vide ({}). structuredClone la gère. Ta version maison a le droit d'être limitée SI tu sais dire où (documenter les limites > prétendre l'universalité)

## 🔍 Comment vérifier ta solution
- chercherCle(data, "email").length correspond au comptage manuel
- deepMap(data, x => x) reproduit la structure À L'IDENTIQUE (le test miroir : fn neutre = clone !)
- La circulaire (bonus) : plus de crash, résultats corrects

## ❓ Réponses du mini-quiz
1. **Le moule à 3 branches, de mémoire ?**
   → Array.isArray(x) → récurse éléments ; sinon x !== null && typeof x === 'object' → récurse valeurs (Object.values) ; sinon → feuille, cas de base.
2. **Pourquoi le x !== null AVANT le typeof === 'object' ?**
   → typeof null === 'object' (bug historique JS) : sans la garde, on tenterait Object.values(null) → crash.
3. **deepMap préserve la structure : qu'est-ce que ça implique pour les objets ?**
   → Reconstruire un objet NEUF avec les mêmes clés (entries → map → fromEntries, ou boucle), pas un tableau — la forme suit la branche du moule.
4. **Quand copieProfonde maison vs structuredClone ?**
   → structuredClone en production (natif, robuste, gère les cycles) ; la version maison pour COMPRENDRE — et dans les entretiens, où on te la demandera telle quelle.

## 🧩 Questions de réflexion
- deepMap avec fn neutre EST une copie profonde : deux fonctions du jour n'en sont qu'une — quelle généralisation vois-tu (indice : chercherCle est-il un deepReduce déguisé ?) ?
- Les chunks de documents du mois 8 seront des arbres (doc → sections → paragraphes) à aplatir intelligemment : reformule aplatirNiveau dans ce vocabulaire (« aplatir jusqu'aux sections, pas jusqu'aux phrases »).
