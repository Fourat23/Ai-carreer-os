# V72 — CP9. Pratiques : le niveau d'exigence, pas le style

**Ce que le contrat demande** (§6) : homogénéiser le **niveau d'exigence**, jamais la longueur
ni le style. Ne corriger que les leçons où l'apprenant doit **deviner** ce qu'il faut produire
(P1) ou comment savoir qu'il a réussi (P3).

**Résultat** : **P1 et P3 sont satisfaits par les 128 leçons.** Deux références d'exercice
mortes ont été corrigées. Aucune consigne n'a été réécrite.

---

## 1. L'asymétrie de longueur est réelle, et elle n'est pas le problème

| domaine | n | mots de pratique min / médiane / max |
|---|---:|---|
| Frontend | 11 | 228 / **507** / 1021 |
| Frontend hors parcours | 8 | 248 / 480 / 582 |
| Carrière | 5 | 55 / 405 / 449 |
| IA appliquée | 13 | 54 / 302 / 547 |
| Kubernetes | 6 | 218 / 296 / 335 |
| Données & ML | 14 | 49 / 267 / 836 |
| Systèmes | 29 | 61 / 263 / 739 |
| Cloud | 7 | 234 / 252 / 330 |
| Fondations | 25 | 46 / 241 / 986 |
| Web & Backend | 10 | 47 / **220** / 284 |

Un facteur 2,3 entre la médiane frontend et la médiane web/backend. **Cette différence n'est
pas corrigée**, et le contrat l'interdisait d'avance : « un exercice data de 40 mots peut être
excellent ; un exercice frontend de 500 mots peut être médiocre ».

La vérification l'a confirmé sur pièce. `recursion`, 61 mots :

> « Écris `compterFeuilles(structure)` sur une donnée mixte… Teste sur un JSON à quatre niveaux
> contenant au moins un `null`. […] Puis `fib` mémoïsé : chronomètre `fib(35)` avant et après,
> et note les deux chiffres. »

Trois livrables, deux chiffres à relever, un cas limite imposé. Rien n'y manque.

---

## 2. P1 — « qu'est-ce que je dois produire ? »

**124 leçons sur 128** nomment un livrable ou emploient un verbe de production avec son objet.

**Les 4 restantes sont des renvois** vers les exercices déterministes du produit :
`api-production-contracts`, `async-messaging-queues`, `system-design-scaling`,
`distributed-systems-failures`.

Le §6 du contrat les déclare conformes **si et seulement si** tous les identifiants cités
existent et que l'exercice cité satisfait P1 et P3. Vérification faite exercice par exercice :

| leçon | exercices cités | état |
|---|---|---|
| `system-design-scaling` | `cloud-scaling-choice`, `cloud-scaling-kind`, `cloud-replica-count`, `cloud-detect-spof`, `cloud-spof-detect`, `cloud-stateful-autoscale` | **6/6 existent** |
| `distributed-systems-failures` | `cloud-detect-spof`, `cloud-spof-detect`, `cloud-replica-count`, `queue-idempotent-consumer`, `replication-lag-reason` | **5/5 existent** |
| `api-production-contracts` | `http-method-idempotent`, `auth-status-decision`, `api-router`, `api-pagination-choice`, **`api-idempotency`** | **1 morte** |
| `async-messaging-queues` | `queue-idempotent-consumer`, **`dlq-duplicate`** | **1 morte** |

### Les deux références mortes, corrigées

Aucun des 508 identifiants du dépôt ne portait ces deux noms. Les exercices que les gloses
décrivaient existent, sous un autre nom :

| citation morte | glose d'origine | exercice réel |
|---|---|---|
| `api-idempotency` | « rejouer sans doubler » | **`http-idempotency-dedup`** — « API : déduplication par clé d'idempotence » |
| `dlq-duplicate` | « compter les effets réels sous re-livraison / router vers DLQ » | la glose couvrait **deux** exercices : `queue-idempotent-consumer` (déjà cité, pour le comptage sous re-livraison) et **`dlq-routing`** — « router vers la dead letter queue » |

La seconde correction a aussi supprimé une redite introduite par la citation elle-même : la
phrase citait `queue-idempotent-consumer` puis redécrivait sa fonction sous le nom mort.

**Références mortes restantes dans une section de pratique : 0** (contrôle rejouable,
`scripts/v72/`). Aucun gate ne les voyait : les gates vérifient les catalogues, pas la prose.

---

## 3. P3 — « comment je sais que c'est réussi ? »

**128 leçons sur 128** portent une vérification décidable.

**Et il faut publier comment ce chiffre a été obtenu, parce que c'est la neuvième fois.** Ma
première sonde cherchait la chaîne « critère de réussite » au singulier : elle a signalé
**10 leçons défaillantes**. Lecture faite, les dix l'écrivaient au pluriel, ou autrement :

- `transformers` — « **Critères de réussite, vérifiables seul.** »
- `readme-documentation` — « **Critères de réussite, vérifiables seul.** »
- `error-handling` — « **Comment vérifier que tu as raison.** Ne teste pas l'échec, teste le
  *temps* de l'échec. »
- `javascript-basics` — pas de formule du tout, mais une pratique A→E où chaque partie nomme
  son livrable (« Livrable : tes prédictions, les résultats, et la règle derrière chaque
  écart »), suivie d'une correction dont les valeurs sont **exécutées** par un script. La
  vérification est la comparaison prédiction / exécution : plus décidable qu'une phrase.

Sonde élargie : 10 → 1 → **0 après lecture**. Neuvième occurrence du défaut de méthode
documenté par V71, attrapée avant publication pour la deuxième fois d'affilée dans V72.

---

## 4. Ce que le CP9 a modifié

| | |
|---|---|
| consignes de pratique réécrites | **0** |
| citations d'exercice corrigées | **2** (`api-production-contracts`, `async-messaging-queues`) |
| leçons échouant à P1 | **0** |
| leçons échouant à P3 | **0** |
| seuil **C5** (≤ 2 leçons échouant à P1 ou P3) | **ATTEINT** — 0 |
| seuil **C4** (références mortes = 0) | **ATTEINT** |
| `npm test` | 1420 / 1420 |
| `npm run gates:active` | vert |
