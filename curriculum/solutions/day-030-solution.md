# Correction — Jour 30 : Map et Set : les structures du O(1)

[← Retour au jour 30](../days/day-030.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'index inversé : à la construction, pour chaque phrase i, pour chaque mot normalisé → index.get(mot).add(i) (avec l'initialisation si absent). À la recherche : récupérer le Set de chaque mot cherché (un mot inconnu → résultat vide, court-circuit), puis intersecter les Sets (commencer par le plus PETIT : optimisation gratuite). Deux Map/Set imbriqués, et c'est un moteur de recherche.

## ✅ Une solution simple
```js
function construireIndex(phrases) {
  const index = new Map();
  phrases.forEach((phrase, i) => {
    const mots = phrase.toLowerCase().replace(/[.,!?]/g, "").split(/\s+/);
    for (const mot of mots) {
      if (!index.has(mot)) index.set(mot, new Set());
      index.get(mot).add(i);
    }
  });
  return index;
}
function rechercher(index, phrases, ...motsCherches) {
  const sets = motsCherches.map((m) => index.get(m.toLowerCase()) ?? new Set());
  if (sets.some((s) => s.size === 0)) return [];        // un mot inconnu : personne
  sets.sort((a, b) => a.size - b.size);                  // partir du plus petit
  let resultat = [...sets[0]];
  for (const s of sets.slice(1)) resultat = resultat.filter((i) => s.has(i));
  return resultat.map((i) => phrases[i]);
}
```

## 🚀 Une solution améliorée
Le LRU (bonus) — l'élégance de l'ordre d'insertion garanti :
```js
function creerLRU(capacite) {
  const cache = new Map();
  return {
    get(k) {
      if (!cache.has(k)) return undefined;
      const v = cache.get(k);
      cache.delete(k); cache.set(k, v);        // touché → déplacé en fin (récent)
      return v;
    },
    set(k, v) {
      if (cache.has(k)) cache.delete(k);
      cache.set(k, v);
      if (cache.size > capacite)
        cache.delete(cache.keys().next().value); // la 1re clé = la plus ancienne
    },
  };
}
```
Closure (jour 22) + Map (aujourd'hui) + la politique d'éviction : trois briques, un composant de niveau production. Ton cache LLM du mois 10 sera EXACTEMENT ceci, avec un disque derrière.

## ⚠️ Erreurs probables et points à vérifier
- split(/\s+/) vs split(" ") : les espaces multiples créent des mots vides "" avec la version naïve — les données réelles sont sales, toujours
- sets.sort par size : muter l'ordre des sets est ici inoffensif (tableau local) — ton radar mutation (jour 26) doit avoir tiqué PUIS validé : c'est exactement le réflexe visé
- ?? new Set() pour un mot inconnu : sans ça, undefined.size crashe — la frontière (entrée utilisateur) se garde toujours (jour 5, jour 12, toujours)

## 🔍 Comment vérifier ta solution
- frequences(["a","b","a"]) : Map {a→2, b→1} et .size === 2
- intersection mesurée : 100k × 100k éléments en < 100ms (la double boucle : minutes)
- rechercher avec 2 mots : vérifié contre un comptage manuel sur tes 20 phrases

## ❓ Réponses du mini-quiz
1. **Pourquoi Map.has est-il O(1) là où arr.includes est O(n) ?**
   → Le hachage calcule directement OÙ regarder (position dérivée de la clé) ; includes doit parcourir jusqu'à trouver. Structure vs parcours.
2. **Map ou objet simple : le critère de choix ?**
   → Collection dynamique clé→valeur (clés inconnues d'avance, de tout type, besoin de size/itération) → Map. Donnée structurée à champs connus → objet.
3. **L'intersection en O(n+m) : le déroulé ?**
   → Set du premier tableau (O(n)), puis parcours du second en testant has() (O(m) × O(1)). La version double-boucle : O(n×m).
4. **Le grand compromis illustré par tous les refactors du jour ?**
   → Mémoire contre temps : la structure auxiliaire (Set/Map) coûte de l'espace mais supprime les re-parcours. Presque toujours rentable — sauf mémoire contrainte ou n minuscule.

## 🧩 Questions de réflexion
- Regarde le chemin : jour 4 (un objet {} pour les taux), jour 11 (regrouper), jour 22 (cache), jour 30 (index inversé) — la MÊME structure clé→valeur, de plus en plus puissante. Qu'est-ce qui a changé : l'outil, ou ta capacité à VOIR où il s'applique ?
- Demain commence le mois 2 (structures et TypeScript). Relis tes notes du jour 1 : écris 5 lignes à celui que tu étais — c'est ton premier bilan de transformation, il y en aura 11 autres.
