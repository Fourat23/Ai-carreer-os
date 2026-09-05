<!-- keep -->
# Leçon — Cache et performance

## 🌍 Le problème d'abord
Ta page met trois secondes à charger. Ton premier réflexe : « ajoutons un cache » ou « réécrivons en plus rapide ». Mauvaise idée : tu optimises à l'aveugle, souvent au mauvais endroit, et parfois tu casses la justesse des données. La vérité, c'est qu'on ne devine JAMAIS d'où vient une lenteur — on la MESURE d'abord. Beaucoup de lenteurs viennent de causes classiques (requêtes N+1, requêtes non indexées) qui se corrigent sans cache. Et quand le cache est justifié, il apporte un nouveau problème : savoir quand la copie ment (invalidation). Cette leçon t'apprend à mesurer avant d'optimiser, puis à cacher consciemment — un levier de vitesse ET, en IA, de coût.

## 🎯 Objectif
Savoir MESURER avant d'optimiser, corriger les problèmes de performance classiques (N+1, requêtes lentes), et mettre en place un cache avec une stratégie d'invalidation consciente. En IA, le cache est aussi un levier de COÛT majeur (appels LLM évités).

## 🧩 Prérequis
Tu dois comprendre comment une requête traverse une application (`/doc/lessons/http-rest-json`). La notion de compromis (fraîcheur vs vitesse) et les bases d'architecture (`/doc/lessons/architecture-basics`) aident. Aucun système de cache particulier n'est supposé, et **aucune connaissance des index n'est nécessaire** : l'exemple guidé construit lui-même le ralentissement qu'il mesure, à partir d'une table vide, et compte les allers-retours plutôt que les millisecondes.

> **Où trouver le détail.** `/doc/lessons/sql-performance-indexing` traite ce que la base fait de chaque requête — plan d'exécution, index, règle du préfixe gauche. Elle est **programmée plus loin** dans le parcours, et rien ici ne suppose que tu l'as lue : cette leçon-ci s'occupe du travail qu'on peut **éviter**, celle-là du travail qu'on ne peut pas éviter mais qu'on peut accélérer.

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

## 🧭 Exemple guidé — le cache qui ne sert à rien, et ce qu'il fallait faire

Le réflexe, devant un écran lent, est d'ajouter un cache. C'est presque toujours le mauvais
premier geste, et voici une mesure qui le montre sans discussion.

> Tout ce qui suit est **exécuté** par `scripts/v70-verifications/n-plus-un.mjs` : une base
> SQLite de **200 000 commandes** et **20 000 clients**, quatre implémentations du même écran,
> requêtes comptées et durées chronométrées.

### L'écran, et son code

« Les 50 dernières commandes, avec le nom du client. » Écrit naturellement :

```js
const commandes = await db.all(
  'SELECT id, client_id, montant FROM commandes ORDER BY creee_le DESC LIMIT 50');

for (const c of commandes) {
  c.nom = (await db.get('SELECT nom FROM clients WHERE id = ?', c.client_id)).nom;
}
```

C'est lisible, c'est correct, et ça envoie **51 requêtes** : une pour la liste, une par ligne.
Ce motif porte un nom, le **N+1** — *une requête, plus N requêtes*. Il est la première cause
de lenteur des API de liste, et il est presque invisible en lisant le code, parce que la
cinquante-et-unième requête est cachée derrière une boucle de trois lignes.

### La mesure, et le piège du « ça va, c'est rapide »

| Stratégie | Requêtes | Durée locale | Durée si la base est à 1 ms |
|---|---:|---:|---:|
| **1. N+1** | 51 | 0,444 ms | **51,4 ms** |
| **2. N+1 + cache mémoire** | **51** | 0,441 ms | **51,4 ms** |
| **3. lot : une requête `IN`** | 2 | 0,232 ms | 2,2 ms |
| **4. jointure** | **1** | 0,066 ms | **1,1 ms** |

Lis d'abord la colonne « durée locale » : **0,444 ms contre 0,066 ms**. Un facteur 7, sur un
écran qui s'affiche instantanément dans les deux cas. En développement, avec la base sur la
même machine, le N+1 ne se voit pas. C'est pour cela qu'il survit jusqu'en production.

Puis la dernière colonne. En production, la base est sur une autre machine ; chaque
aller-retour coûte de l'ordre d'une milliseconde, souvent plus. Le nombre de requêtes **devient
alors le temps de réponse** : 51 ms contre 1,1 ms, soit un facteur 46, et une page qui passe de
« instantanée » à « on sent le chargement ».

Enseignement principal : **pour un accès distant, compte les requêtes, pas les millisecondes de
ta machine.** Le nombre de requêtes est la seule mesure qui se transporte de ton portable à la
production.

### La ligne 2, et pourquoi elle est là

Ajoutons un cache mémoire des noms de clients — le geste que tout le monde propose en premier :

```js
const cache = new Map();
for (const c of commandes) {
  if (!cache.has(c.client_id)) cache.set(c.client_id, await lireNom(c.client_id));
  c.nom = cache.get(c.client_id);
}
```

Résultat mesuré : **51 requêtes**. Exactement autant qu'avant. Le cache n'a **jamais** servi.

La raison est arithmétique et vaut la peine d'être vue : il y a 20 000 clients pour 200 000
commandes. Sur les 50 commandes les plus récentes, les clients sont **presque tous
différents** — donc chaque recherche est un défaut de cache. On a ajouté une structure de
données, une case mémoire par ligne et un raisonnement supplémentaire, pour un gain de zéro.

C'est le défaut central de cette leçon : **un cache ne va pas plus vite, il évite de refaire.
S'il n'y a rien à refaire, il ne sert à rien.** Et personne ne s'en aperçoit, parce que
l'écran est aussi lent qu'avant et qu'on conclut « il faudrait un vrai cache, genre Redis ».

D'où la métrique non négociable : **le taux de succès du cache**. Un cache dont on ne mesure
pas le taux de succès est un cache dont on ignore s'il fonctionne — et l'expérience montre
qu'un cache sur trois ne sert à rien.

### Ce qu'il fallait faire : réduire le nombre d'allers-retours

**Le lot** — deux requêtes au lieu de 51 :

```js
const ids = [...new Set(commandes.map((c) => c.client_id))];
const noms = await db.all(`SELECT id, nom FROM clients WHERE id IN (${'?'.repeat(ids.length)})`, ids);
```

**La jointure** — une seule :

```sql
SELECT co.id, co.montant, cl.nom
  FROM commandes co JOIN clients cl ON cl.id = co.client_id
 ORDER BY co.creee_le DESC LIMIT 50;
```

Les deux sont bonnes, et le choix entre elles n'est pas une question de performance :

| | Quand la préférer |
|---|---|
| **jointure** | les deux tables sont dans la même base, et on veut le minimum d'allers-retours |
| **lot (`IN`)** | les données viennent de deux sources différentes — deux bases, un service distant, un cache — où la jointure est impossible |

Le lot est aussi ce que font les chargeurs par lot des bibliothèques d'accès aux données :
regrouper N demandes unitaires en une seule, sans changer le code appelant.

### L'ordre des gestes

C'est la conclusion, et elle est valable bien au-delà du cache :

1. **Mesurer** — combien de requêtes, combien de millisecondes, où ?
2. **Supprimer le travail inutile** — le N+1, la colonne qu'on ne lit pas, le tri fait deux
   fois. Ici, on est passé de 51 requêtes à 1 **sans aucun cache**.
3. **Cacher seulement ce qui reste**, et seulement si les mêmes clés reviennent.
4. **Re-mesurer**, taux de succès du cache compris.

Le cache est la **dernière** étape parce que c'est la seule qui ajoute un mensonge possible :
une donnée servie depuis un cache est une donnée d'avant. Corriger un N+1 n'a aucun risque de
ce genre — c'est le même résultat, obtenu avec moins de travail.

### Le cas où le cache est la bonne réponse

Il existe, et il est net : quand le calcul est **coûteux**, **déterministe**, et que les mêmes
entrées reviennent.

L'exemple canonique est un harnais d'évaluation de modèle de langage, qui rejoue les mêmes
questions à chaque exécution :

```js
async function llmCache(messages, params) {
  const cle = hash(JSON.stringify({ messages, model: params.model, t: params.temperature }));
  const connu = await disque.get(cle);
  if (connu) { succes++; return connu; }
  total++;
  const r = await appelLLM(messages, params);
  await disque.set(cle, r);
  return r;
}
```

Ici les trois conditions sont réunies : chaque appel coûte de l'argent et une seconde, la
température est à zéro donc la réponse est reproductible, et **les mêmes questions reviennent
à chaque exécution** — le taux de succès est proche de 100 % dès la seconde.

Deux détails décident de la justesse de ce cache :

- **la clé encode tout ce qui influence la réponse** : les messages, le modèle, la température.
  Oublier le modèle dans la clé, c'est servir la réponse de l'ancien modèle après une mise à
  jour — et conclure que le nouveau modèle n'a rien changé ;
- **l'invalidation est gratuite** parce qu'elle est portée par la clé : changer de modèle
  produit de nouvelles clés, sans qu'on ait à vider quoi que ce soit.

C'est la forme la plus sûre de cache : celle où **la clé contient l'intégralité de ce dont le
résultat dépend**. Quand c'est le cas, un cache ne peut pas mentir.

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

## ✅ Correction

### La démarche

*Mesurer → supprimer le travail inutile → cacher ce qui reste → re-mesurer.* L'ordre est le
contenu de la correction, pas une formalité : appliqué à l'envers, il produit un cache posé
sur un N+1, c'est-à-dire la ligne 2 du tableau de l'exemple guidé — **zéro gain, complexité en
plus**.

### Compter les requêtes, pas les millisecondes

Le mini-exercice demande de **compter** les requêtes SQL d'un point d'entrée de liste. C'est
la bonne unité, pour une raison mesurée plus haut : sur une base locale, 51 requêtes prennent
0,444 ms et personne ne les remarque ; à 1 ms de latence réseau, elles prennent 51 ms.

Comment compter, concrètement, sans outil dédié :

```js
let n = 0;
db.on('query', () => n++);          // ou un décorateur autour de db.query
// … rendre la page …
console.log('requêtes :', n);
```

La plupart des bibliothèques d'accès aux données ont un mode de journalisation des requêtes ;
l'activer trente secondes sur un point d'entrée suffit à trouver les N+1 d'une application
entière. Le signe qui ne trompe pas : **la même requête répétée, avec un paramètre différent
à chaque fois.**

Le seuil utile, pour se situer : un point d'entrée de liste devrait tenir en **1 à 3
requêtes**. Au-delà de 10, il y a presque certainement une boucle qui interroge la base.

### Le gain, chiffré

Le critère « le gain est chiffré (avant/après) » est atteint quand on peut écrire un tableau
comme celui-ci, avec **ses propres** mesures :

| | Requêtes | Durée locale | Durée à 1 ms de latence |
|---|---:|---:|---:|
| avant (N+1) | 51 | 0,444 ms | 51,4 ms |
| après (jointure) | 1 | 0,066 ms | 1,1 ms |

Deux exigences dans ce tableau : le nombre de requêtes **et** une estimation à latence réelle.
Publier seulement la durée locale donne « on gagne 0,4 ms », ce qui ne convainc personne et
sous-estime le gain d'un facteur 40.

### La clé de cache, et ce qu'elle doit contenir

Le critère « la clé encode tous les paramètres influents » a une formulation opérationnelle :

> **Deux appels qui produisent le même résultat doivent avoir la même clé ; deux appels qui
> produisent des résultats différents doivent avoir des clés différentes.**

La seconde moitié est celle qu'on rate. Faire l'inventaire de ce qui influence le résultat :

| Ce qu'on oublie | Ce qui arrive alors |
|---|---|
| l'identité de l'utilisateur | un utilisateur voit les données d'un autre |
| la langue / la locale | un francophone reçoit la page en anglais |
| les droits ou le rôle | un lecteur voit une réponse calculée pour un administrateur |
| la version du modèle ou de l'algorithme | après mise à jour, on sert encore les anciens résultats et on conclut que la mise à jour n'a rien changé |
| la pagination, le tri, les filtres | la page 2 renvoie le contenu de la page 1 |

Les trois premières lignes sont des **failles de confidentialité**, pas des défauts de
performance. C'est la raison pour laquelle la question « à qui ai-je le droit de resservir
cette réponse ? » précède toujours « combien de temps la garder ? » — c'est la même distinction
portée/fraîcheur que dans `/doc/lessons/nextjs-data-production`.

### Le taux de succès, et pourquoi il est obligatoire

Sans lui, on ne sait pas si le cache fonctionne. La mesure de l'exemple guidé le prouve : un
cache mémoire ajouté à un N+1 affiche **51 requêtes sur 51**, soit un taux de succès de zéro,
et rien dans le comportement de l'application ne le signale.

Deux compteurs suffisent :

```js
if (connu) { succes++; return connu; }
total++;
// taux = succes / (succes + total)
```

Les repères d'interprétation :

| Taux mesuré | Ce que ça veut dire |
|---|---|
| > 80 % | le cache travaille — le garder |
| 20–60 % | les clés sont trop spécifiques, ou la durée trop courte |
| < 10 % | **supprime-le** : il coûte de la mémoire, de la complexité et un risque de péremption, pour rien |

La dernière ligne est un vrai geste professionnel, et il est rare : **retirer un cache
inefficace** est aussi utile qu'en ajouter un efficace, et bien plus difficile à faire accepter.

### Quand le cache peut mentir — et pourquoi c'est acceptable

Le dernier critère demande de savoir **dire** quand le cache sert une donnée fausse. Un cache
sert toujours une donnée d'avant ; la seule question est de savoir si ce « avant » est
acceptable, et la réponse dépend du **coût du retard**, jamais de la fréquence de changement.

| Donnée cachée | Retard acceptable | Pourquoi |
|---|---|---|
| appel LLM déterministe | infini | le résultat ne changera pas |
| liste de catégories | heures | un nouvel intitulé peut attendre |
| prix affiché | secondes, ou invalidation sur événement | un litige commercial coûte plus que le calcul |
| solde de compte, stock restant | **aucun** | ne se cache pas, ou seulement avec une invalidation à l'écriture |

La formulation attendue dans ta réponse ressemble à ceci : *« ce cache peut servir un prix
périmé pendant au plus 10 minutes ; c'est acceptable parce que les prix sont modifiés une fois
par semaine et qu'une invalidation est déclenchée à chaque modification, donc le retard réel
est de quelques secondes ; le pire cas est un litige sur une commande, couvert par la règle
d'affichage du prix au panier. »*

Ce qui n'est **pas** acceptable, c'est de ne pas pouvoir répondre à la question.

### La mauvaise solution plausible

Vider tout le cache à chaque écriture — `cache.flushAll()` dans le gestionnaire de mise à
jour.

C'est correct : plus aucune donnée périmée. Et ça détruit le cache : sur une application où
quelqu'un écrit toutes les deux secondes, le taux de succès s'effondre, et l'on paie la
complexité du cache pour n'en tirer aucun bénéfice. Pire, chaque vidage complet provoque une
rafale de recalculs simultanés — le cache aggrave alors la charge qu'il devait réduire.

L'invalidation correcte est **ciblée** : la modification du produit 7 invalide les clés qui
contiennent le produit 7, pas les autres. Cela demande de savoir quelles clés dépendent de
quoi — c'est-à-dire de la conception, ce qui est précisément la difficulté du sujet et la
raison de la formule connue : *les deux choses difficiles en informatique sont l'invalidation
de cache et le choix des noms.*

### Généralisation

Ce que cette leçon installe dépasse le cache : **on n'optimise pas ce qu'on n'a pas mesuré, et
on ne mesure pas dans les conditions du développement.** Les deux mesures les plus trompeuses
de tout le métier sont la durée d'une requête sur une base locale et la vitesse d'une page sur
la machine de celui qui l'a écrite.

Et le geste de conception à retenir : **avant d'accélérer un travail, se demander s'il faut le
faire.** Cinquante requêtes exécutées plus vite restent cinquante requêtes ; une seule requête
qui les remplace est d'un autre ordre — et ne nécessite ni cache, ni invalidation, ni
surveillance.

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
