# V77.1 · CP3 — LE SCOPE DU PILOTE, GELÉ

> **`SCOPE_ID = V78-SCOPE-HTTP-PRODUCTION`** ·
> fixture `data/pilot/v78-pilot-1.json` ·
> `protocolVersion = V78-PILOT-PROTOCOL-1`
>
> Le CP0 avait comparé trois **leçons**. Le CP1 a gelé un outcome primaire qui
> exige que le concept de chaque étape soit lisible **dans l'export seul**. Le
> CP3 remesure les candidats sous cette exigence-là — et le classement change.

---

## 1. La découverte du CP3 : « non ambigu » ne voulait pas dire la même chose

Dans ce produit, **un concept EST une leçon** : `getConceptCatalogue()` fabrique
un concept par `slug`, et la résolution `exercice → concepts` rend des slugs de
leçon.

Un exercice déclaré par **plusieurs** leçons se résout donc en **plusieurs**
concepts — règle `R2 · MULTI_CONCEPT_BY_DESIGN`. Ce n'est pas un défaut : V75 a
mesuré 67 exercices dans ce cas, et le commentaire du module le dit bien,
*« n'en garder qu'une serait perdre un fait, pas en gagner un »*.

**Mais pour CE protocole, c'est une ambiguïté.** Un lecteur de l'export verrait
`concepts: [api-design-basics, api-production-contracts, networking-http-tls]`
et ne saurait pas lequel le participant a pratiqué. Le primaire dit exactement
cela : *sans rien deviner*.

Le CP3 applique donc une règle plus stricte que celle du CP0 :

> **Un exercice n'entre dans le pilote que si le produit le résout en UN SEUL
> concept** — c'est-à-dire s'il est déclaré par une seule leçon (`R1`).

Sous cette règle, les trois candidats du CP0 se réordonnent :

| | exercices **exclusifs** | exercices écartés | formes de rappel | transferts citant la leçon |
|---|---|---|---|---|
| `api-production-contracts` | **2** *(le CP0 disait 4)* | **5** | 2 | 2 |
| `algorithmic-thinking` | **5** | 1 | **5** | 3 |
| `javascript-basics` | 4 | 0 | 4 | 1 |

Mesuré sur tout le corpus (`scripts/v77-1/cp3-scope.mjs`, publié dans
`docs/v77-1/cp3-scope.json`) :

```
concepts du programme            128
éligibles pour ce protocole       75    ≥1 exercice exclusif ET ≥2 formes de rappel
  avec ≥1 exercice exclusif       75
  avec ≥2 formes de rappel       128
  cités par un défi de transfert  37
```

---

## 2. Pourquoi `api-production-contracts` reste le concept focal

Deux exercices exclusifs, c'est peu. `algorithmic-thinking` en a cinq. Le choix
se fait pourtant sur le critère que le CP0 avait nommé comme **le seul qui
invalide un pilote** — le plafond au PRETEST — et sur un second que le CP1 a
rendu décisif : **la lisibilité de la chaîne dans la trace**.

| critère | `api-production-contracts` | `algorithmic-thinking` |
|---|---|---|
| plafond au PRETEST pour le profil visé | **faible** (niveau 3, notions rarement formalisées) | moyen — `fizzbuzz` et `binary-search` sont des classiques |
| chaîne exercice → transfert | **directe** : `http-rate-limit-decide` → `throttling-everywhere`, **même notion**, domaine différent | indirecte |
| proximité du travail réel | **forte** | registre « entretien technique » |
| exercices exclusifs | 2 | **5** |
| formes de rappel | 2 | **5** |

Deux exercices suffisent à ce protocole : il en traverse **un**, et garde le
second en secours. Cinq formes de rappel seraient un luxe pour un protocole qui
en utilise deux.

`algorithmic-thinking` reste le **scope de repli**, gelé lui aussi
(`fallbackScope` dans la fixture), et déclenché par la règle `PRETEST_HIGH`.

---

## 3. Les quatre concepts du scope, et leur rôle

Un concept figure dans le scope parce qu'il **occupe une étape du protocole** —
pas parce qu'il est proche du sujet.

| # | `conceptId` | étape | lu ? | pratiqué ? | pourquoi il est là |
|---|---|---|---|---|---|
| `C1` | `networking-http-tls` | `PRETEST_PREREQUISITE` | non | non | la leçon focale suppose HTTP, ses méthodes et ses codes. Ce concept **mesure le prérequis**, rien d'autre. 5 formes de rappel : le prérequis peut être sondé autrement qu'en rappel libre |
| `C2` | `api-production-contracts` | **`FOCAL`** | **oui** | **oui** | la seule leçon lue, la seule pratiquée, la seule sur laquelle portent les deux rappels |
| `C3` | `authentication` | `TRANSFER_TARGET` | non | non | **contexte d'arrivée** du transfert retenu : le limiteur de débit y devient une défense contre le bourrage d'identifiants |
| `C4` | `async-messaging-queues` | `TRANSFER_TARGET_SECOURS` | non | non | contexte d'arrivée du transfert de secours (idempotence HTTP → consommateur de file) |

**C'est ce qui rend « 3 à 6 concepts » compatible avec une séance courte** : le
participant ne lit **qu'une** leçon. Les trois autres concepts définissent le
prérequis et les domaines d'arrivée du transfert — ils sont dans le scope parce
que la **trace les nomme**, pas parce qu'on les enseigne.

---

## 4. Les deux exercices retenus, et les cinq écartés

### 4.1 Retenus

| exercice | rôle | difficulté | tests | déclarants | règle |
|---|---|---|---|---|---|
| `http-rate-limit-decide` | **PRINCIPAL** | 3 | 4 | `api-production-contracts` **seule** | `R1` |
| `api-pagination-choice` | **SECOURS** | 2 | 4 | `api-production-contracts` **seule** | `R1` |

**Pourquoi `http-rate-limit-decide` en principal** : il porte la notion que le
transfert transpose. L'export montrera *pratiqué le limiteur à fenêtre
glissante* puis *transposé le limiteur vers l'authentification* — un lecteur
relie les deux **sans deviner**, ce qui est littéralement la définition du
primaire.

**Pourquoi un exercice de secours** : le protocole compte trois étapes qui
n'existent que si le participant **échoue d'abord** (`EXERCISE_ATTEMPT_FAIL`,
`HINT_VIEW`, `EXERCISE_ATTEMPT_RETRY`). Une réussite du premier coup les rend
inobservables. Dans ce cas le facilitateur passe à `api-pagination-choice` ; si
celui-ci passe aussi du premier coup, les trois étapes sont notées
`NOT_OBSERVED` — **jamais `FAILED`** (règle `M1` du CP1) — et la session reste
`COMPLETE`.

### 4.2 Écartés, nommés, avec leur raison

| exercice | déclarants | raison |
|---|---|---|
| `http-method-idempotent` | 3 | `MULTI_CONCEPT_BY_DESIGN` |
| `api-router` | 4 | `MULTI_CONCEPT_BY_DESIGN` |
| `auth-status-decision` | 2 | `MULTI_CONCEPT_BY_DESIGN` |
| `http-idempotency-dedup` | 2 | `MULTI_CONCEPT_BY_DESIGN` |
| `http-resilient-consumer` | 2 | `MULTI_CONCEPT_BY_DESIGN` |

### 4.3 Ce qu'écarter veut dire — et ce que ça ne veut pas dire

**Aucun de ces cinq exercices n'a été « résolu ».** Aucune déclaration n'a été
ajoutée à `data/exercise-declarations.json`, qui reste vide depuis V77 · CP8.
Les **125 ambiguïtés du corpus sont inchangées.**

Trancher l'un d'eux pour les besoins d'un pilote reviendrait à **fabriquer une
donnée pédagogique pour servir un protocole** — l'inversion exacte que V77 a
refusée en livrant ce fichier vide. *Le pilote se restreint ; le corpus ne bouge
pas.*

Un test le vérifie : si `data/exercise-declarations.json` cesse d'être vide, il
rougit.

---

## 5. Les onze étapes, et le fait que chacune doit laisser

| n | étape | concept | fait attendu | grain | surface | niveau max |
|---|---|---|---|---|---|---|
| 1 | `PRETEST` | `networking-http-tls` | `recallAttempts` | concept | `/retention` | `DECLARED` |
| 1 | `PRETEST_FOCAL` | `api-production-contracts` | `recallAttempts` | concept | `/retention` | `DECLARED` |
| 2 | `LESSON` | `api-production-contracts` | **aucun** | — | `/doc/lessons/…` | — |
| 3 | `EXERCISE_ATTEMPT_FAIL` | `api-production-contracts` | `exerciseAttempts` | exercise | `/lab/http-rate-limit-decide` | `VALIDATED` |
| 4 | `HINT_VIEW` | `api-production-contracts` | `hintViews` | exercise | `/lab/…` | — |
| 5 | `EXERCISE_ATTEMPT_RETRY` | `api-production-contracts` | `exerciseAttempts` | exercise | `/lab/…` | `VALIDATED` |
| 6 | `EXERCISE_ATTEMPT_SUCCESS` | `api-production-contracts` | `evidence` | exercise | `/lab/…` | `VALIDATED` |
| 7 | `IMMEDIATE_RETRIEVAL` | `api-production-contracts` | `recallAttempts` | concept | `/retention` | `DECLARED` |
| 8 | `DELAYED_RETRIEVAL` | `api-production-contracts` | `recallAttempts` | concept | `/retention` | `DECLARED` |
| 9 | `TRANSFER` | `api-production-contracts` | `transferAttempts` | concept | `/transfer/throttling-everywhere` | `VALIDATED` |
| 10 | `CONFUSION_REPORT` | — | **aucun** | — | hors produit | — |
| 11 | `SESSION_EXPORT` | — | **aucun** | — | `/api/progress/export-all` | — |

**Trois étapes ne laissent aucun fait, et la fixture le déclare** au lieu de
rester muette. `LESSON` est une lecture — V77 a classé les surfaces de lecture
en `NO_FACT` par contrat, et le CP3 ne revient pas dessus. `CONFUSION_REPORT`
vit hors du produit. `SESSION_EXPORT` est la lecture finale.

> **Conséquence à énoncer maintenant, pas après** : l'étape `LESSON` ne laissant
> rien, la reconstruction ne pourra pas prouver que le participant a lu la
> leçon — seulement qu'il a fait les étapes d'avant et d'après. C'est une
> **limite connue du primaire**, déclarée ici, et non un défaut à découvrir au
> CP4.

---

## 6. Les règles de PRETEST, chiffrées

| règle | mesure | seuil | décision |
|---|---|---|---|
| `PRETEST_HIGH` | 2 amorces de rappel sur `api-production-contracts`, **avant lecture** | **2 sur 2** déclarées `recalled` | bascule sur `V78-SCOPE-ALGO`. Si le repli plafonne aussi → session **`INVALID`** (`N6`), **jamais `ABORTED`** |
| `MISSING_PREREQUISITE` | 2 amorces sur `networking-http-tls`, **avant tout** | **0 sur 2** déclarée `recalled` | session **`INVALID`** (`N7`) |

### 6.1 La limite du PRETEST, déclarée

`RECORD_RECALL` **reçoit** l'issue de l'appelant : c'est le participant qui
déclare `recalled` / `partial` / `failed`. Le produit ne corrige pas cette
déclaration, et c'est cohérent — `/retention` révèle une amorce et demande
« as-tu su ? ».

**Le PRETEST est donc un auto-report, et son niveau de preuve plafonne à
`DECLARED`.** La fixture l'écrit, et un test vérifie que les quatre étapes de
rappel ne prétendent pas dépasser `DECLARED`.

L'atténuation est **une procédure, pas du code** : le facilitateur fait énoncer
la réponse **à voix haute avant de révéler** l'amorce, et consigne l'écart
éventuel. Écrire un moteur de correction automatique pour un pilote de trois
personnes serait exactement le genre de chantier que V77.1 s'interdit.

---

## 7. Le risque que le CP4 devra lever

`/retention` n'affiche pas n'importe quelle notion : elle sert **le plan du
jour**, qui dépend de la position de l'apprenant dans le programme et de
l'échéance de chaque concept. Un participant qui démarre à zéro pourrait donc ne
**pas voir** `api-production-contracts` dans la station de rappel.

> **`R8` — la station de rappel pourrait ne pas proposer le concept focal au
> moment voulu.**

Ce n'est pas tranché ici : le CP3 gèle un scope, il ne simule pas. **Le CP4 le
mesure en traversant la boucle**, et, s'il se confirme, la procédure du CP5
devra nommer le chemin de repli (commande directe sur `/api/progress`) au lieu
de laisser un facilitateur improviser devant un participant.

---

## 8. La fixture, et ce qui la garde

`data/pilot/v78-pilot-1.json` — **contenu du produit**, pas donnée d'apprenant.
Ajouté à `REPERTOIRES_DU_PRODUIT` : la suppression totale du CP2 **refuse** un
plan qui la viserait, et un test le vérifie.

`lib/pilot-scope.mjs` (pur, corpus injecté) confronte la fixture au corpus réel.
`tests/v771-pilot-scope.test.mjs` — **18 tests** :

| ce qui est tenu |
|---|
| **zéro** incohérence entre la fixture et le corpus réel |
| la version de protocole, l'outcome primaire, le délai et la fenêtre sont **pinnés en clair** |
| 3 à 6 concepts, **exactement un** focal |
| chaque exercice du pilote a **exactement un** déclarant, et c'est son concept |
| chaque exercice porte une justification d'au moins 40 caractères |
| chaque exercice écarté a **réellement** plusieurs déclarants — l'écarter sans raison rougit |
| aucun exercice n'est à la fois retenu et écarté |
| les formes de rappel demandées existent **vraiment** dans la leçon |
| les onze étapes sont présentes, dans un ordre croissant |
| les étapes de rappel **plafonnent à `DECLARED`** |
| le transfert du protocole est celui du concept focal |
| les deux règles de PRETEST sont **chiffrées**, pas décrites |
| le scope de repli existe **vraiment**, ses 5 exercices sont exclusifs |
| `data/exercise-declarations.json` est **toujours vide** |
| la fixture est **protégée** de la suppression totale |

---

## 9. Le gantelet

| | |
|---|---|
| `npm test` | **2231 / 2231** (2213 + 18) |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **50 portes, 0 violation** |
| `data/progress.json` | **absent** |

---

## 10. Ce que le CP3 n'a PAS fait

- **Aucune ambiguïté du corpus résolue.** 125 avant, 125 après.
  `data/exercise-declarations.json` reste vide, et un test le garde.
- **Aucun fichier de curriculum touché.** Ni les 376 exercices, ni
  `program.json`, ni un Markdown de leçon.
- **Aucun exercice « rattaché » pour l'occasion.** Les cinq écartés le sont
  parce que leur trace serait illisible, pas parce qu'ils seraient mauvais.
- **Aucune simulation.** Le CP3 gèle un scope sur mesure ; le CP4 le traverse.
- **Aucun seuil de réussite pédagogique inventé.** Les deux seuils gelés
  (`2 sur 2`, `0 sur 2`) décident de l'**admissibilité d'une session**, jamais
  de la valeur d'un apprentissage.
