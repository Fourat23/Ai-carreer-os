<!-- keep -->
# Leçon — Cache et performance

## 🌍 Le problème d'abord
Ta page met trois secondes à charger. Ton premier réflexe : « ajoutons un cache » ou « réécrivons en plus rapide ». Mauvaise idée : tu optimises à l'aveugle, souvent au mauvais endroit, et parfois tu casses la justesse des données. La vérité, c'est qu'on ne devine JAMAIS d'où vient une lenteur — on la MESURE d'abord. Beaucoup de lenteurs viennent de causes classiques (requêtes N+1, requêtes non indexées) qui se corrigent sans cache. Et quand le cache est justifié, il apporte un nouveau problème : savoir quand la copie ment (invalidation). Cette leçon t'apprend à mesurer avant d'optimiser, puis à cacher consciemment — un levier de vitesse ET, en IA, de coût.

## 🎯 Objectif
Savoir MESURER avant d'optimiser, corriger les problèmes de performance classiques (N+1, requêtes lentes), et mettre en place un cache avec une stratégie d'invalidation consciente. En IA, le cache est aussi un levier de COÛT majeur (appels LLM évités).

## 🧩 Prérequis
Tu dois comprendre comment une requête traverse une application et interroge une base de données (`/doc/lessons/http-rest-json`, `/doc/lessons/sql-performance-indexing`), car les lenteurs classiques (N+1, requêtes lentes) y naissent. La notion de compromis (fraîcheur vs vitesse) et les bases d'architecture (`/doc/lessons/architecture-basics`) aident. Aucun système de cache particulier n'est supposé.

## 🧠 Modèle mental
Un cache, c'est **garder la réponse sous la main au lieu de la recalculer** — échanger de la FRAÎCHEUR contre de la VITESSE (et en IA, contre des euros). Le prix caché : savoir quand la copie ment (invalidation), l'un des « deux problèmes difficiles de l'informatique ».

## 📖 Explication complète
- **Règle n°1 : mesurer d'abord.** L'intuition se trompe presque toujours sur l'emplacement du goulot. Profiler (temps par endpoint, nombre de requêtes SQL, latence par étage), corriger LE poste dominant, re-mesurer pour prouver le gain. Optimiser sans mesure = complexifier au hasard.
- **Le N+1** : afficher 50 emprunts en faisant 1 requête pour la liste + 50 pour les livres = 51 allers-retours. Symptôme : le nombre de requêtes CROÎT avec la taille de la liste. Correction : un JOIN, ou un batch (`WHERE id IN (…)`). Le bug de perf n°1 des APIs.
- **Les niveaux de cache** : en mémoire applicative (une Map/LRU — ton jour 30), HTTP (headers de cache), base (résultats coûteux), et côté FOURNISSEUR LLM (prompt caching des préfixes stables).
- **La clé de cache** : elle identifie exactement CE qui rend le résultat unique (pour un appel LLM : hash(prompt + modèle + paramètres)). Une clé trop large sert des réponses fausses ; trop fine, le cache ne sert jamais.
- **L'invalidation** : quand la donnée source change, la copie ment. Stratégies : **TTL** (expirer après N minutes — simple, borne le mensonge), invalidation **explicite** (à l'écriture, on purge les clés concernées), ou versionnage de clé. Choisir CONSCIEMMENT selon la tolérance métier à la staleness.
- **Mesurer le cache lui-même** : le taux de hit. Un cache à 5 % de hits est une complexité gratuite.

## 🔧 Exemple simple
Ton LRU du jour 30 devant une fonction coûteuse : premier appel 800 ms, suivants < 1 ms. La structure (Map + éviction) tenait en 20 lignes.

## 🧭 Exemple guidé
**Énoncé** : cacher les appels LLM d'un harnais d'évaluation (mêmes questions rejouées à chaque run).
**Raisonnement** : entrées identiques → réponse identique souhaitée (température 0) → cache par hash, persistant sur disque.
**Solution (pseudo)** :
```js
async function llmCache(messages, params) {
  const cle = hash(JSON.stringify({ messages, model: params.model, t: params.temp }));
  const connu = await disque.get(cle);
  if (connu) { hits++; return connu; }
  const r = await llm(messages, params);
  await disque.set(cle, r);
  return r;
}
// Invalidation : la clé contient modèle+params → changer de modèle = nouvelles clés.
```
**Explication** : la clé encode TOUT ce qui influence la réponse ; le run d'éval passe de 30 appels payants à 2-3 (questions modifiées seulement). **Variante** : ajoute un TTL et mesure le taux de hit sur 3 runs.

## 🤖 Exemple appliqué (IA / data / architecture)
Dans DocSense : cache des embeddings (un document ré-ingéré inchangé ne se re-embedde pas), cache des réponses aux questions fréquentes, prompt caching du system prompt. Résultat mesurable en euros ET en latence — et une ligne de plus pour l'entretien (« mon cache a un taux de hit de 60 % sur les relances d'éval »).

## ⚠️ Erreurs fréquentes
- Optimiser sans profiler (le goulot n'était pas là).
- N+1 invisible en dev (10 lignes) qui explose en prod (10 000).
- Cache sans stratégie d'invalidation → données périmées servies en silence.
- Clé de cache incomplète (oublier le modèle/les params → réponses croisées fausses).

## 🚫 Anti-patterns
- Le cache posé « au cas où » sans mesure de hit.
- L'optimisation prématurée qui complexifie sans gain prouvé.

## ✍️ Mini-exercice
Trouve le N+1 dans une de tes APIs (compte les requêtes SQL d'un endpoint de liste), corrige par JOIN/batch, mesure avant/après.

## 🔥 Exercice plus difficile
Implémente le cache LLM persistant ci-dessus sur ton harnais d'éval : clé complète, TTL, taux de hit affiché. Prouve la réduction de coût sur 3 runs consécutifs.

## ✅ Correction attendue
La logique : mesurer → corriger le dominant → re-mesurer ; cache = clé exacte + invalidation choisie + hit mesuré. Vérifie : le gain est chiffré (avant/après), la clé encode tous les paramètres influents, et tu sais dire QUAND ton cache peut mentir (et pourquoi c'est acceptable).

## 🎤 Questions d'entretien
- « Ton API est lente, que fais-tu ? » → Profiler d'abord (endpoint ? SQL ? N+1 ?), corriger le poste dominant, re-mesurer.
- « Les deux problèmes difficiles du cache ? » → L'invalidation et le nommage (la clé) — avec un exemple vécu.
- « Que caches-tu dans un système LLM ? » → Embeddings, réponses (clé = hash prompt+modèle+params), préfixes stables (prompt caching) — pour la latence ET le coût.

## 🧾 À retenir
- Mesurer avant, re-mesurer après : jamais d'optimisation à l'aveugle.
- N+1 : le bug de perf n°1 — JOIN ou batch.
- Cache = clé exacte + invalidation consciente + taux de hit mesuré ; en IA, c'est aussi un levier de coût.

## 📚 Vocabulaire
**profiling / goulot** · **N+1** · **batch** · **clé de cache** · **TTL / staleness** · **invalidation** · **taux de hit** · **LRU** · **prompt caching**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je profile avant d'optimiser et je prouve mes gains par des chiffres.
- [ ] Je détecte et corrige un N+1.
- [ ] Mes caches ont une clé complète, une invalidation choisie et un hit mesuré.

## 🔗 Liens avec le programme
Mois 4 (jours ~108-110), mois 10 (jours ~281-283, cache LLM), DocSense. Leçons liées : `data-structures-intro` (LRU), `llm-cost-optimization`, `sql-foundations`.
