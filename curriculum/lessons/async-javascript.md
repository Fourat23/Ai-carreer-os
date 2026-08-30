<!-- keep -->
# Leçon — JavaScript asynchrone

## 🌍 Le problème d'abord
Ton programme doit aller chercher une donnée sur le réseau — ça prend quelques centaines de
millisecondes, parfois plusieurs secondes pour un appel à un modèle d'IA. Pendant ce temps,
que fait le reste du programme ? Si tout s'arrête pour attendre, l'interface se fige et le
serveur ne répond plus à personne. JavaScript n'a qu'un seul fil d'exécution : il ne PEUT PAS
se permettre d'attendre les bras croisés. La solution s'appelle l'**asynchrone** : lancer la
tâche longue, continuer à faire autre chose, et revenir traiter le résultat quand il arrive.
Cette leçon t'apprend à écrire et raisonner ce code non bloquant — sur lequel repose chaque
appel réseau, base de données et LLM de ta carrière.

## 🎯 Objectif
Comprendre pourquoi JS est asynchrone, maîtriser Promises et async/await, gérer les erreurs async, et paralléliser proprement. Tout ton avenir en dépend : chaque fetch, chaque appel LLM, chaque accès base est asynchrone.

## 🧠 Modèle mental
JS est **un serveur de restaurant seul en salle** : il ne reste jamais planté devant une table en attendant que le plat soit prêt (I/O). Il prend la commande, la passe en cuisine, sert d'autres tables, et REVIENT quand la cuisine sonne. L'asynchrone, c'est cette organisation : ne jamais bloquer pendant qu'on attend.

**Limite de l'analogie, et c'est la confusion la plus coûteuse de tout le sujet.** Un vrai serveur peut porter deux assiettes à la fois ; JavaScript, jamais. Il n'exécute JAMAIS deux de tes fonctions en même temps. Ce qui se déroule en parallèle, c'est **l'attente** — la cuisine, c'est-à-dire le réseau, le disque, le système — pas ton code. D'où la conséquence pratique qui surprend tout le monde : `Promise.all` sur cinq appels réseau divise le temps par cinq, alors que `Promise.all` sur cinq calculs lourds ne gagne **rien du tout** et fige l'application exactement comme une boucle bloquante. L'asynchrone accélère ce qui attend, jamais ce qui calcule.

## 🧩 Prérequis
Tu dois savoir écrire des fonctions et des callbacks (fonctions passées en argument) en
JavaScript (`/doc/lessons/javascript-basics`), car une opération asynchrone consiste à
fournir « la suite à exécuter quand ce sera prêt ». Une intuition de ce qu'est un appel réseau
(client → serveur → réponse) aide (`/doc/lessons/http-rest-json`). Les Promises et
`async/await` sont construits ici, à partir de zéro.

## 📖 Explication complète
- **Pourquoi** : JS n'a qu'UN fil d'exécution. Une attente bloquante (réseau : des dizaines de ms ; LLM : des secondes) gèlerait tout — l'UI, le serveur entier. Les opérations lentes sont donc DÉLÉGUÉES, et ton code fournit « la suite à exécuter quand c'est prêt ».
- **La Promise** : un reçu pour une valeur FUTURE. Trois états : en attente → tenue (resolved) ou rompue (rejected). `.then` branche la suite, `.catch` l'échec. Tu connais déjà le geste : au jour 22, tu passais une fonction en argument pour dire « voilà quoi faire ensuite ». Une Promise fait la même chose, avec une différence décisive — cette « suite » devient une VALEUR qu'on peut stocker, retourner, mettre dans un tableau. C'est précisément ce qui rend `Promise.all([a, b])` écrivable ; avec des callbacks nus, il fallait les imbriquer à la main.
- **async/await** : le sucre qui rend l'asynchrone lisible comme du synchrone. `await` suspend LA FONCTION (pas le programme !) jusqu'à la résolution. Une fonction `async` retourne toujours une Promise.
- **Les erreurs** : `try/catch` autour des `await` (l'équivalent du `.catch`). Une Promise rejetée non attrapée = crash différé — toujours un chemin d'erreur.
- **Séquentiel vs parallèle** : deux `await` à la suite = l'un APRÈS l'autre (2 × la latence). Indépendants ? `Promise.all([a, b])` les lance ENSEMBLE (1 × la latence). `Promise.all` échoue si UNE échoue ; `Promise.allSettled` rapporte tout.
- **L'ordre d'exécution** : le code synchrone se termine d'abord, PUIS les suites asynchrones s'exécutent (event loop). D'où le piège : `console.log` après un fetch non attendu s'affiche AVANT la réponse.
- **Ce que fait réellement l'event loop**, parce que « event loop » est un nom, pas une explication. Deux endroits : la **pile d'exécution**, où la fonction en cours se déroule, et une **file d'attente**, où patientent les suites prêtes à repartir. Quand tu écris `await`, le moteur découpe ta fonction en deux : ce qui précède s'exécute maintenant, et **tout ce qui suit est mis de côté** comme une suite à reprendre. La fonction rend la main immédiatement. Le moteur ne va PAS chercher une suite dans la file tant que la pile n'est pas vide — c'est la règle unique dont tout le reste découle. Elle explique le `1, 3, 2` du mini-exercice : `1` et `3` sont sur la pile, `2` attend dans la file que la pile se vide. Et elle explique un bug bien plus vicieux : une boucle `while` de calcul qui tourne cinq secondes ne laisse jamais la pile se vider, donc **aucune** suite ne repart — les réponses réseau sont arrivées, personne ne peut les traiter.

## 🔧 Exemple simple
```js
async function chargerLivre(id) {
  const res = await fetch(`/livres/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```
`await` suspend la fonction, le reste de l'app continue de tourner.

## 🧭 Exemple guidé — charger cent documents sans se faire couper

**La situation.** Une fonction `charger(id)` va chercher un document sur une API. Chaque
appel prend environ 200 ms. On te donne 100 identifiants et on te demande tous les
documents.

**Ce qui rend le cas non trivial.** L'API accepte au plus **10 requêtes simultanées** ;
au-delà, elle répond `429 Too Many Requests`. Les deux réponses évidentes échouent donc
toutes les deux, pour des raisons opposées.

**Décision 1 — pourquoi la boucle `await` est inacceptable.**

```js
for (const id of ids) docs.push(await charger(id));   // 100 × 200 ms = 20 secondes
```

Chaque `await` attend la réponse avant de lancer la suivante. Le mot important est
**attend** : pendant ces 200 ms, ton programme ne fait rien du tout, et il recommence cent
fois. Vingt secondes pour un travail qui, en soi, n'occupe le processeur que quelques
millisecondes.

C'est le piège de `async/await` : il rend l'asynchrone si lisible qu'on écrit du séquentiel
sans s'en apercevoir. **Un `await` dans une boucle mérite toujours qu'on se demande si les
tours sont vraiment dépendants les uns des autres.**

**Décision 2 — pourquoi tout lancer d'un coup échoue aussi.**

```js
const docs = await Promise.all(ids.map((id) => charger(id)));   // 100 requêtes simultanées
```

`map` n'attend rien : il appelle `charger` cent fois de suite, et cent requêtes partent
**immédiatement**. Le total serait de 200 ms — sauf que l'API en refuse quatre-vingt-dix.
Pire, `Promise.all` rejette dès qu'**une seule** promesse échoue : tu perds aussi les dix qui
avaient réussi.

Le point à retenir dépasse cet exemple : **une promesse démarre à sa création, pas à son
`await`.** `map` a déjà tout lancé avant que `Promise.all` ne soit appelé.

**Décision 3 — la forme qui tient : des lots.**

Il faut du parallélisme, mais **borné**. On découpe en tranches de dix, et on attend la fin
d'une tranche avant de lancer la suivante :

```js
async function chargerTout(ids, taille = 10) {
  const docs = [];
  for (let i = 0; i < ids.length; i += taille) {
    const lot = ids.slice(i, i + taille);
    const resultats = await Promise.all(lot.map((id) => charger(id)));
    docs.push(...resultats);            // ...  : on aplatit, sinon on empile des tableaux
  }
  return docs;
}
```

Il reste un `await` dans une boucle — et cette fois c'est **voulu** : les tours sont
réellement dépendants, puisque le lot suivant ne doit partir qu'une fois le précédent
terminé.

**Comment tu sais que ça marche.** Chronomètre : dix lots de 200 ms font environ **2
secondes**, contre 20 en séquentiel et un échec en tout-parallèle. Vérifie aussi que
`docs.length === 100` — si tu obtiens 10, c'est que tu as écrit `docs.push(resultats)` sans
les trois points, et tu as empilé dix tableaux au lieu de cent documents.

**Ce que ça t'a appris.** La question n'est jamais « séquentiel ou parallèle ». Elle est :
**qu'est-ce qui contraint le débit ?** Ici, une limite imposée par autrui. Ailleurs, ce sera
la mémoire, un pool de connexions, ou une facturation. Le parallélisme se règle sur cette
contrainte, il ne se maximise pas.

**Variante qui déplace le problème.** Trois documents sur cent sont indisponibles. Avec le
code ci-dessus, le lot qui les contient rejette et `chargerTout` s'arrête : tu perds tout,
y compris les quatre-vingt-dix-sept documents valides. Remplace `Promise.all` par
`Promise.allSettled`, qui attend **toutes** les promesses et rend pour chacune
`{status: 'fulfilled', value}` ou `{status: 'rejected', reason}`. Tu dois alors trier
toi-même les deux cas et décider quoi faire des échecs — réessayer, ignorer, signaler. C'est
plus de code, et c'est le comportement qu'on veut presque toujours en production :
**`Promise.all` convient quand tout est indispensable, `allSettled` quand le travail partiel
a de la valeur.**

## 🤖 Exemple appliqué (IA / data / architecture)
Ton pipeline RAG embedde 50 chunks : en séquentiel, 50 × 300 ms = 15 s ; par lots parallèles, ~2 s. Tes appels LLM sont des Promises avec timeout et retry (leçon error-handling). Le streaming des réponses LLM est de l'asynchrone incrémental. Maîtriser cette leçon = des pipelines 10× plus rapides.

## 🧪 Ce que la boucle d'événements fait réellement — mesuré

Trois affirmations reviennent constamment sur l'asynchrone, et elles se
vérifient. Le script `scripts/v70-verifications/js-async-et-types.mjs` les
exécute.

### 1. « await dans une boucle, ce n'est pas si grave »

Cinq appels dont les durées sont 120, 90, 150, 110 et 80 millisecondes :

```
somme des durées   : 550 ms
plus longue durée  : 150 ms
boucle avec await  : 552,7 ms
Promise.all        : 150,8 ms
rapport            : ×3,67
```

Une boucle avec `await` attend **la somme**. `Promise.all` attend **le plus
long**. Sur cinq appels réseau, c'est le facteur qui sépare une page lente d'une
page normale, sans qu'aucune requête ne change.

La règle qui en découle est précise et ne dit pas « toujours paralléliser » :
**si les appels sont indépendants, `Promise.all` ; si le second a besoin du
résultat du premier, la boucle est correcte.** Le défaut consiste à écrire la
boucle par réflexe sans se poser la question.

### 2. Ce que `Promise.all` fait des erreurs

```
Promise.all        : REJETÉ dès le premier échec — « service indisponible »
                     les deux résultats réussis sont PERDUS.
Promise.allSettled : fulfilled, rejected, fulfilled
```

`Promise.all` rejette **dès le premier échec** et jette les résultats obtenus,
même ceux qui étaient déjà arrivés. `Promise.allSettled` attend tout le monde et
rend l'état de chacun.

Ce n'est pas « l'un est meilleur » : c'est une décision. **Tout ou rien** contre
**ce qu'on a pu obtenir**. Pour une opération transactionnelle, `all` est correct.
Pour un tableau de bord agrégeant six sources, `allSettled` est le bon choix —
une source indisponible ne doit pas vider la page.

### 3. L'ordre d'exécution, observé

```
1 synchrone
2 synchrone (fin)
3 microtâche
4 promesse résolue
5 setTimeout 0
```

Tout le code synchrone s'exécute d'abord. Puis **toutes** les microtâches
(promesses résolues, `queueMicrotask`). Puis seulement les macrotâches
(`setTimeout`), **même avec un délai de zéro**.

`setTimeout(f, 0)` n'exécute donc pas `f` « tout de suite » : il l'exécute après
tout ce qui est déjà en attente. Le zéro est un minimum, pas une promesse.

### 4. La famine, qui explique les pages figées

```
20 000 microtâches enchaînées avant que la boucle reprenne la main
le setTimeout(0) posé AVANT a-t-il pu s exécuter ? NON
```

Une microtâche qui en programme une autre crée une chaîne que la boucle vide
**entièrement** avant de regarder les macrotâches. Vingt mille maillons plus
tard, le `setTimeout(0)` posé avant n'a toujours pas tourné.

C'est ainsi qu'une page « ne répond plus » alors qu'aucune fonction ne dure
longtemps : **ce n'est pas une tâche lente, c'est une file qui ne se vide
jamais.** Le rendu, les clics et les animations sont des macrotâches ; ils
attendent tous. Le remède est de rendre la main volontairement — découper le
travail et le replanifier via une macrotâche, ce qui laisse le navigateur
respirer entre deux tranches.

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
(1, 3, 2 — le synchrone d'abord, la suite async ensuite.) La logique : Promise = valeur future ; await suspend la fonction ; indépendant → paralléliser ; toujours un chemin d'erreur.

**L'erreur probable sur `parLots`, et pourquoi elle est tentante.** Presque tout le monde écrit d'abord ceci :

```js
const lots = decouper(items, n);
const resultats = await Promise.all(lots.map((lot) => Promise.all(lot.map(fn))));
```

C'est élégant, ça a l'air de respecter les lots, et **ça ne les respecte pas du tout** : le `map` extérieur lance tous les lots au même instant. Les `n` items d'un lot sont bien groupés, mais les lots ne s'attendent pas entre eux — les 100 appels partent ensemble et l'API répond 429. Le piège séduit parce que `Promise.all` imbriqué RESSEMBLE à du séquençage ; en réalité, rien dans ce code ne dit « attends le lot précédent ». Le séquençage exige une vraie boucle :

```js
for (const lot of lots) resultats.push(...await Promise.allSettled(lot.map(fn)));
```

**Alternative défendable** : plutôt que des lots figés, un pool de `n` ouvriers qui piochent dans une file — même plafond de parallélisme, mais aucun temps mort à attendre le traînard d'un lot. Plus rapide, plus difficile à écrire ; à choisir seulement si la latence des items varie beaucoup.

**Vérifie seul** : lance ton `parLots` avec `n = 2` sur 6 items et journalise l'heure de départ de chacun — tu dois voir trois vagues de deux, pas six départs simultanés. Ensuite : les échecs sont rapportés sans annuler le reste, et le gain contre le séquentiel est mesuré, pas supposé.

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
