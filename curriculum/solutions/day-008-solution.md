# Correction — Jour 8 : Tableaux : la structure de données que tu utiliseras chaque jour

[← Retour au jour 8](../days/day-008.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Playlist : chaque fonction suit valider → agir → informer. `monter` = trouver l'index, vérifier qu'il est > 0, échanger arr[i] et arr[i-1]. `melanger` sans mutation = copier D'ABORD ([...]) puis mélanger la copie.

## ✅ Une solution simple
```js
function monter(playlist, titre) {
  const i = playlist.indexOf(titre);
  if (i === -1) { console.log(`"${titre}" introuvable`); return; }
  if (i === 0) { console.log(`"${titre}" est déjà en tête`); return; }
  [playlist[i - 1], playlist[i]] = [playlist[i], playlist[i - 1]]; // échange
}
function melanger(playlist) {
  const copie = [...playlist];
  for (let i = copie.length - 1; i > 0; i--) {          // Fisher-Yates
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}
```

## 🚀 Une solution améliorée
Pourquoi sort(() => Math.random() - 0.5) est mauvais : sort attend un comparateur COHÉRENT (si a<b maintenant, a<b toujours). Un comparateur aléatoire viole ce contrat → le mélange est biaisé (certaines permutations sortent plus souvent) et dépend de l'implémentation du moteur. Fisher-Yates garantit l'uniformité en O(n). Moralité générale : respecter le CONTRAT d'une API, pas juste 'ça a l'air de marcher'.

## ⚠️ Erreurs probables et points à vérifier
- sansDoublons avec includes est en O(n²) — parfaitement acceptable aujourd'hui, et tu la réécriras en O(n) au jour 30 avec un Set : note-le
- L'échange par destructuration [a,b]=[b,a] : si tu ne le connais pas, la version avec variable temporaire est très bien
- matrice : arr[ligne][colonne] — fixe une convention et tiens-t'y

## 🔍 Comment vérifier ta solution
- afficher() après le scénario : l'ordre reflète exactement les opérations
- L'originale est intacte après melanger (compare les join(","))
- monter du 1er élément → message, pas de crash

## ❓ Réponses du mini-quiz
1. **Différence slice / splice ?**
   → slice(a,b) copie sans toucher l'original (fin exclue) ; splice(a,n) modifie l'original en retirant/insérant. Copie vs mutation.
2. **Après `const b = a; b.push(9)`, que contient a ?**
   → Le 9 aussi : a et b référencent le MÊME tableau. Il n'y a pas eu de copie.
3. **Comment copier un tableau (2 façons) ?**
   → [...a] ou a.slice(). Attention : copie superficielle — les objets À L'INTÉRIEUR restent partagés.
4. **Que renvoie indexOf pour un élément absent, et pourquoi c'est piégeux ?**
   → -1, qui est truthy ! `if (arr.indexOf(x))` bugge quand x est en position 0. Utiliser includes ou comparer !== -1.

## 🧩 Questions de réflexion
- Pourquoi préférer les fonctions qui RETOURNENT une nouvelle valeur à celles qui modifient (pense : tests, imprévisibilité) ? Où est-ce que muter reste OK ?
- La playlist est un tableau de strings. Demain, des objets {titre, artiste, durée} : qu'est-ce qui changerait dans chaque fonction ?
