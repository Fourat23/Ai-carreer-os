<!-- keep -->
# Leçon — JavaScript asynchrone

## 🎯 Objectif
Comprendre pourquoi JS est asynchrone, maîtriser Promises et async/await, gérer les erreurs async, et paralléliser proprement. Tout ton avenir en dépend : chaque fetch, chaque appel LLM, chaque accès base est asynchrone.

## 🧠 Modèle mental
JS est **un serveur de restaurant seul en salle** : il ne reste jamais planté devant une table en attendant que le plat soit prêt (I/O). Il prend la commande, la passe en cuisine, sert d'autres tables, et REVIENT quand la cuisine sonne. L'asynchrone, c'est cette organisation : ne jamais bloquer pendant qu'on attend.

## 📖 Explication complète
- **Pourquoi** : JS n'a qu'UN fil d'exécution. Une attente bloquante (réseau : des dizaines de ms ; LLM : des secondes) gèlerait tout — l'UI, le serveur entier. Les opérations lentes sont donc DÉLÉGUÉES, et ton code fournit « la suite à exécuter quand c'est prêt ».
- **La Promise** : un reçu pour une valeur FUTURE. Trois états : en attente → tenue (resolved) ou rompue (rejected). `.then` branche la suite, `.catch` l'échec.
- **async/await** : le sucre qui rend l'asynchrone lisible comme du synchrone. `await` suspend LA FONCTION (pas le programme !) jusqu'à la résolution. Une fonction `async` retourne toujours une Promise.
- **Les erreurs** : `try/catch` autour des `await` (l'équivalent du `.catch`). Une Promise rejetée non attrapée = crash différé — toujours un chemin d'erreur.
- **Séquentiel vs parallèle** : deux `await` à la suite = l'un APRÈS l'autre (2 × la latence). Indépendants ? `Promise.all([a, b])` les lance ENSEMBLE (1 × la latence). `Promise.all` échoue si UNE échoue ; `Promise.allSettled` rapporte tout.
- **L'ordre d'exécution** : le code synchrone se termine d'abord, PUIS les suites asynchrones s'exécutent (event loop). D'où le piège : `console.log` après un fetch non attendu s'affiche AVANT la réponse.

## 🔧 Exemple simple
```js
async function chargerLivre(id) {
  const res = await fetch(`/livres/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```
`await` suspend la fonction, le reste de l'app continue de tourner.

## 🧭 Exemple guidé
**Énoncé** : charger 5 documents — séquentiel vs parallèle.
**Raisonnement** : indépendants → parallèle ; mesurer pour le prouver.
**Solution** :
```js
// Séquentiel : ~5 × 200 ms = 1 s
for (const id of ids) docs.push(await charger(id));
// Parallèle : ~200 ms au total
const docs = await Promise.all(ids.map((id) => charger(id)));
```
**Explication** : `map` lance les 5 Promises immédiatement, `Promise.all` attend le tout. **Variante** : 100 documents avec une API à rate limit → paralléliser par LOTS de 10 (boucle sur les lots, `Promise.all` dans le lot).

## 🤖 Exemple appliqué (IA / data / architecture)
Ton pipeline RAG embedde 50 chunks : en séquentiel, 50 × 300 ms = 15 s ; par lots parallèles, ~2 s. Tes appels LLM sont des Promises avec timeout et retry (leçon error-handling). Le streaming des réponses LLM est de l'asynchrone incrémental. Maîtriser cette leçon = des pipelines 10× plus rapides.

## ⚠️ Erreurs fréquentes
- Oublier `await` → tu manipules une Promise au lieu de sa valeur (`[object Promise]`).
- `await` dans une boucle pour des tâches indépendantes (lenteur ×n).
- Promise rejetée sans catch → crash différé mystérieux.
- `forEach(async …)` : n'attend RIEN (utiliser `for...of` + await, ou map + Promise.all).

## 🚫 Anti-patterns
- Mélanger `.then` et `await` dans la même fonction (choisir un style).
- `Promise.all` sur 1000 appels d'une API à rate limit (batcher).

## ✍️ Mini-exercice
Prédis l'ordre d'affichage : `console.log(1); fetch(url).then(() => console.log(2)); console.log(3);` — puis vérifie et explique.

## 🔥 Exercice plus difficile
Écris `parLots(items, n, fn)` : exécute fn sur tous les items, parallélisés par lots de n, en collectant résultats ET échecs (allSettled). Mesure le gain vs séquentiel sur une fonction lente simulée.

## ✅ Correction attendue
(1, 3, 2 — le synchrone d'abord, la suite async ensuite.) La logique : Promise = valeur future ; await suspend la fonction ; indépendant → paralléliser ; toujours un chemin d'erreur. Vérifie : ton parLots respecte n, rapporte les échecs sans tout annuler, et le gain est mesuré.

## 🎤 Questions d'entretien
- « Que fait `await` exactement ? » → Suspend la fonction courante jusqu'à résolution ; le programme continue (un seul fil, jamais bloqué).
- « Deux appels indépendants : comment les optimiser ? » → `Promise.all` (latence divisée) ; par lots si rate limit.
- « Que se passe-t-il si une Promise rejette sans catch ? » → Unhandled rejection : crash différé — toujours gérer l'échec.

## 🧾 À retenir
- Un seul fil : on n'attend jamais en bloquant, on branche des suites.
- `await` suspend la fonction, pas le programme ; try/catch pour les erreurs.
- Indépendant → `Promise.all` (ou lots) : c'est le levier de performance n°1 des pipelines.

## 📚 Vocabulaire
**event loop** · **Promise (pending/resolved/rejected)** · **async/await** · **Promise.all / allSettled** · **unhandled rejection** · **parallélisation par lots** · **rate limit** · **streaming**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je prédis l'ordre d'exécution sync/async sans hésiter.
- [ ] Je parallélise les tâches indépendantes (et par lots sous rate limit).
- [ ] Chaque chemin async a sa gestion d'erreur.

## 🔗 Liens avec le programme
Mois 3 (fetch, API), mois 4 (React async), mois 8+ (appels LLM, pipelines). Leçons liées : `javascript-basics`, `error-handling`, `http-rest-json`.
