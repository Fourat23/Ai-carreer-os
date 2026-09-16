# V77.1 · CP4 — RÉPÉTITION À BLANC

> Onze étapes, sur le produit réel, en HTTP, **sans aucun humain**.
> Progression hors dépôt, serveur de production reconstruit.
> Rapport brut : `docs/v77-1/cp4-dry-run.json`.

---

## 1. Le résultat

```
11 étapes · 0 non conformes · 9 contrôles · 0 écarts
reconstruction : 0 manque
SESSION_TRACE_RECONSTRUCTABILITY = OUI
```

| n | étape | instant serveur | concept | résultat |
|---|---|---|---|---|
| 1 | `PRETEST` | `11:00:30.404Z` | `networking-http-tls` | `recalled` |
| 1 | `PRETEST_FOCAL` | `11:00:30.435Z` | `api-production-contracts` | `failed` |
| 2 | `LESSON` | — | `api-production-contracts` | `NON_OBSERVABLE` |
| 3 | `EXERCISE_ATTEMPT_FAIL` | `11:00:31.182Z` | `api-production-contracts` | `echoue 2/4` |
| 4 | `HINT_VIEW` | `11:00:31.255Z` | `api-production-contracts` | `SOUS_PROBLEME` |
| 5 | `EXERCISE_ATTEMPT_RETRY` | `11:00:32.487Z` | `api-production-contracts` | `echoue 1/4` |
| 6 | `EXERCISE_ATTEMPT_SUCCESS` | `11:00:33.686Z` | `api-production-contracts` | `passed` |
| 7 | `IMMEDIATE_RETRIEVAL` | `11:00:34.805Z` | `api-production-contracts` | `recalled` |
| 8 | `DELAYED_RETRIEVAL` | `11:00:35.916Z` | `api-production-contracts` | `recalled` |
| 9 | `TRANSFER` | `11:00:37.030Z` | `api-production-contracts` | `reussi` |
| 10 | `CONFUSION_REPORT` | — | — | `NON_OBSERVABLE` |
| 11 | `SESSION_EXPORT` | — | — | `NON_OBSERVABLE` |

**L'échec de l'étape 3 n'a pas été fabriqué** : le code de départ de
`http-rate-limit-decide` contient un bug d'origine — *« ne fait jamais glisser la
fenêtre »*. Le premier lancement échoue tout seul, `2/4`. **L'aide de l'étape 4
n'a pas été demandée** : la route du laboratoire l'a servie et enregistrée
d'elle-même (`SOUS_PROBLEME`, niveau 1, `declenchee: auto`).

---

## 2. Le délai n'a pas été simulé

Le script n'attend pas 24 heures, et **il n'avance aucune horloge**. Avancer une
horloge reviendrait à mesurer sa propre simulation.

Il mesure la **propriété** qui rend le délai fiable — `H3` du contrat, `H12` de
V77 : *une horloge client ne doit rien pouvoir imposer*. La sonde envoie une
commande délibérément menteuse :

```
POST /api/progress
{ command: { type: RECORD_RECALL, …, at: "2019-01-01T00:00:00.000Z",
                                  timestamp: "2019-…", now: "2019-…" } }
→ le fait persisté porte  2026-09-16T11:00:35.916Z   (instant SERVEUR)
```

**Aucun des trois noms de champ n'a d'effet.** Le contrat V74 §3.6 tient :
`normalizeEnvelope` n'accepte `at` que du serveur.

Conséquence pour le rapport : le délai mesuré entre les étapes 7 et 8 vaut
`0,0003 h`, donc `DELAY_OUT_OF_WINDOW`. **C'est correct et c'est écrit tel
quel** — une répétition à blanc ne doit pas prétendre avoir attendu.

---

## 3. L'effet d'observation : mesuré, nul

Empreinte SHA-256 du fichier de progression, avant et après chaque lecture :

| action | empreinte avant → après |
|---|---|
| `GET /api/progress/export-all` | `81e897a09220644b` → `81e897a09220644b` |
| `GET /retention` | `81e897a09220644b` → `81e897a09220644b` |
| `GET /doc/lessons/api-production-contracts` | `81e897a09220644b` → `81e897a09220644b` |

**Observer ne change rien à ce qui est observé.** C'est `H4`, et c'est aussi la
raison pour laquelle l'identité de session vit dans l'**archive** et non dans les
faits (§5.1).

---

## 4. Quatre découvertes

### 4.1 La première sonde était cassée, pas le produit

Premier passage : les six tentatives de rappel écrivaient **zéro fait**. Le
script concluait que le produit ne notait rien.

```
POST /api/progress { type: RECORD_RECALL, … }
→ 400 { code: "NO_COMMAND", error: "Cette API attend { command: { type, … } }." }
```

**La sonde postait la commande à plat.** C'est le défaut que V77 a payé plus
d'une fois sous un autre nom : *mesurer son propre appareil*. Le correctif n'est
pas seulement d'envelopper la commande — c'est que **le client lève désormais
une exception dès qu'une commande est refusée**, au lieu de continuer et de
rapporter un silence.

> Une sonde qui avale une erreur mesure son propre silence.

### 4.2 `RecallAttempt` promettait une provenance et ne l'écrivait pas — **corrigé**

`lib/event-model.mjs` déclare depuis V74, dans son tableau des faits :

```
{ nom: 'RecallAttempt', grain: 'concept', provenance: true, cle: true, … }
```

Le fait persisté, lui, n'en portait aucune. **Le modèle promettait, le fait se
taisait** — et une tentative de rappel exportée ne disait pas qui l'avait
constatée. Pour un pilote dont l'outcome primaire exige le *moyen de constat* de
chaque étape, c'est disqualifiant.

`normalizeAttempt` garde désormais la provenance, et `RECORD_RECALL` nomme son
producteur : `recall-station` / `auto-report`.

**Le point délicat, et il a failli coûter cher** : `normalizeAttempts` **jette**
ce que le normaliseur refuse. Exiger la provenance aurait effacé, en silence,
tout l'historique de rappel de chaque apprenant — le contournement `H13`
(*réécrire un fait historique*), par la porte de derrière. Le mode `legacy`
donne `producer: 'legacy'` aux tentatives anciennes : **visible plutôt que
muette, conservée plutôt que rejetée.** Un test le tient.

La porte `v66:check` `[R1]` pinnait la liste exacte des champs d'une tentative.
Elle a été mise à jour — **liste toujours exhaustive**, plus une vérification de
plus : *une tentative nomme qui l'a constatée*. Les 22 règles négatives de V66
restent vues échouer.

### 4.3 Un ÉCHEC d'exercice ne porte aucun concept — **déclaré, pas corrigé**

| fait | porte ses concepts ? |
|---|---|
| `evidence` (la **réussite**) | **oui** — `conceptIds: ['api-production-contracts']` |
| `exerciseAttempts` (l'**échec**, la **reprise**) | **non** |

`lib/event-model.mjs` le déclare explicitement depuis V74 :
`{ nom: 'ExerciseAttempt', …, conceptId: false }`. Ce n'est donc pas un oubli,
c'est une décision ancienne.

**Mais elle a une conséquence que personne n'avait énoncée** : l'information la
plus utile à un moteur de rétention — *sur quelle notion l'apprenant a-t-il
échoué* — est précisément celle que le fait ne porte pas.

Le CP4 **ne la corrige pas** : changer la forme d'`ExerciseAttempt` touche le
moteur, quatre listes blanches et trois portes, pour un besoin qui dépasse ce
sprint. Il la **déclare** : la fixture marque ces deux étapes
`origineDuConcept: "fixture"`, et le reconstructeur publie la liste des étapes
dont le concept vient du protocole gelé plutôt que de la trace.

```
concepts dérivés de la fixture : EXERCISE_ATTEMPT_FAIL, EXERCISE_ATTEMPT_RETRY
```

> Sans la fixture du CP3, un lecteur de l'export ne saurait pas quel concept un
> échec d'exercice concerne. **C'est une entrée de V78, pas un détail.**

### 4.4 Deux tentatives identiques dans la même seconde n'en font qu'une

La clé métier d'une tentative est `exerciseId | seconde | passed/total`. Deux
essais réellement distincts, au même score, dans la même seconde, sont donc
**indiscernables d'un rejeu réseau** — et le second n'est pas écrit. Mesuré :

```
2 lancements identiques, même seconde → exerciseAttempts inchangé
```

C'est la protection contre le rejeu, et elle est voulue. **Pour un humain, elle
est inoffensive** : personne ne relance deux fois en moins d'une seconde. Elle
est notée parce qu'un outil d'automatisation, lui, le ferait — et la répétition
à blanc du CP4 l'a fait, ce qui a d'abord ressemblé à une étape muette.

---

## 5. Ce que le CP4 a ajouté, et ce qu'il a refusé d'ajouter

### 5.1 Une identité de session — dans l'**archive**, pas dans les faits

Le CP0 avait mesuré (`R7`) qu'aucune notion de « session de participant »
n'existe. Deux façons de la créer :

| | estampiller les 9 faits | nommer l'archive |
|---|---|---|
| touche le moteur, la sérialisation, les 4 listes blanches | **oui** | non |
| modifie ce que l'instrumentation observe | **oui** | **non** |
| suffit à reconstruire une session | oui | **oui** |
| distingue un fait produit hors fenêtre | oui | **non** |

La seconde a été retenue. `AICOS_PILOT_SESSION_ID` déclare la session ;
`protocolVersion` et `scopeId` viennent de **la fixture gelée**, jamais de
l'environnement — un facilitateur ne doit pas pouvoir déclarer avoir suivi un
protocole qu'il n'a pas suivi.

**La limite se paie et se dit** : les faits n'étant pas estampillés, un fait
produit hors de la fenêtre de session est indiscernable d'un fait produit
pendant. La parade est **procédurale** — un fichier de progression neuf par
participant, condition `N5` du CP1 — et non logicielle. C'est un choix, pas un
oubli.

### 5.2 Un reconstructeur qui dit ce qu'il ne sait pas

`lib/session-trace.mjs` ne reçoit que l'archive et la fixture. Il n'a accès ni au
serveur, ni aux journaux, ni au souvenir de la session — comme la personne que
le CP1 décrit. **Quand il ne sait pas, il le dit** : six genres de manque, et un
seul suffit à rendre la session non reconstructible.

| genre | ce qu'il attrape |
|---|---|
| `ETAPE_ABSENTE` | l'étape n'a laissé aucun fait |
| `CHAMP_ABSENT` | instant ou producteur manquant |
| `ORDRE_INDETERMINE` | deux faits au même instant, ou un instant qui recule |
| `IDENTITE_ABSENTE` | pas de session, pas de version, ou une version discordante |
| `CONCEPT_MULTIPLE` | le fait ne porte pas l'ensemble de concepts déclaré |
| `AMBIGUITE` | plusieurs faits pourraient être cette étape |

Une difficulté a dû être tranchée : **rien dans un fait de rappel ne dit à quelle
étape il appartient.** Le `PRETEST` et le `IMMEDIATE_RETRIEVAL` produisent le
même genre de fait sur le même concept, via le même `sourceRef` (`/retention`).
Seule leur place dans le temps les distingue, et la lire exige de savoir combien
d'amorces chaque étape consomme.

La fixture le déclare **avant** la session (`occurrences`) : ce n'est donc pas
une devinette. Mais la limite est réelle — **si un participant joue une amorce de
plus que prévu, l'alignement se décale sans que rien ne le signale.** La parade
est la liste de contrôle du facilitateur (CP5), pas le logiciel.

*(Trouvé en le vivant : au deuxième passage, le rappel immédiat héritait de la
seconde amorce du PRETEST, et le rapport annonçait un instant « antérieur à
l'étape précédente ». La trace était juste ; c'est le lecteur qui comptait mal.)*

---

## 6. Le risque `R8`, levé — et la réponse n'est pas celle qu'on espérait

> **`/retention` ne propose PAS le concept focal.**

Mesuré : `api-production-contracts` **n'apparaît pas** dans la page rendue. La
station de rappel sert le **plan du jour**, qui dépend de la position de
l'apprenant dans le programme de 365 jours et de l'échéance de chaque concept.
Un participant qui démarre à zéro n'y trouve pas une leçon du jour 56.

**Le chemin de repli existe et a été exercé neuf fois** pendant cette
répétition :

```
POST /api/progress { command: { type: 'RECORD_RECALL', conceptId, outcome, format, sourceRef } }
```

Il fonctionne, il écrit un fait conforme, avec provenance et instant serveur.

> **Conséquence directe pour le CP5** : la procédure du facilitateur doit
> **nommer ce chemin**, au lieu de laisser quelqu'un improviser devant un
> participant. Une session où le facilitateur cherche comment poser une question
> est une session perdue — et, selon `N1`, non interprétable s'il improvise.

---

## 7. Les tests

`tests/v771-session-trace.test.mjs` — **25 tests**. Ils donnent au
reconstructeur des archives **abîmées** et vérifient qu'il *dit* au lieu de
combler.

| ce qui est tenu |
|---|
| une archive saine : **0 manque**, 11 étapes, instants croissants |
| chaque étape rend son résultat, **lu dans le fait** |
| les étapes dont le concept vient de la fixture sont **nommées** |
| une étape sans fait → `ETAPE_ABSENTE`, résultat `NOT_OBSERVED`, **jamais `FAILED`** |
| un instant absent → manque, **pas une date inventée** |
| un fait sans `provenance.producer` → manque |
| deux faits au même instant → `ORDRE_INDETERMINE` |
| un transfert qui ne porte pas les **deux** concepts attendus → signalé |
| pas de session, ou une version discordante → non reconstructible |
| un fait d'un **autre** exercice ne peut pas tenir lieu d'étape |
| un `PRETEST` amputé d'une amorce → signalé, **pas complété** |
| un délai hors fenêtre est **nommé**, pas arrondi vers la fenêtre |
| un délai non mesurable est `NOT_OBSERVED`, **jamais zéro** |
| un résultat illisible est `INCONNU`, **jamais un défaut favorable** |
| une tentative de rappel porte enfin une provenance |
| **l'historique de rappel survit** à l'ajout de la provenance (`legacy`) |
| un horodatage fourni par le client est **ignoré** |

---

## 8. Le gantelet

| | |
|---|---|
| `npm test` | **2256 / 2256** (2231 + 25) |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **50 portes, 0 violation** |
| `bash scripts/v66-negative.sh` | **22 règles vues échouer, 0 trou** |
| `bash scripts/v76-negative.sh` | **11 règles vues échouer, 0 trou** |
| traversée HTTP réelle | **11 étapes, 0 non conforme** |
| `data/progress.json` | **absent** |

---

## 9. Ce que le CP4 ne prouve pas

- **Que le délai de 24 h fonctionne.** Il prouve qu'une horloge client ne peut
  rien imposer. Ce n'est pas la même chose, et la première session humaine sera
  la première fois qu'un délai réel est observé.
- **Qu'un humain traverserait la boucle ainsi.** Un script ne se perd pas, ne
  fatigue pas, ne clique pas deux fois. Le CP5 s'occupe de cela.
- **Que la trace resterait lisible si le participant sortait du protocole.** La
  reconstruction repose sur le nombre d'amorces déclaré d'avance. Une amorce en
  trop la décale, et rien ne le signale.
- **Que les 9 faits sont tous exercés.** Le protocole en traverse **cinq** :
  `recallAttempts`, `exerciseAttempts`, `hintViews`, `evidence`,
  `transferAttempts`. Les quatre autres — assessment, mission, artefact, usage —
  ne sont pas dans ce scope, et ne le prétendent pas.
