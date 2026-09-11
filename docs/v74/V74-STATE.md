# V74 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption : relire ce
> fichier, vérifier Git, reprendre au CP indiqué. **NE PAS refaire un CP terminé.**
> **V73 est terminé et ne doit pas être relancé** — rapport canonique :
> `docs/v73/V73-FINAL-REPORT.md`, verdict `CURRICULUM_INTEGRITY_READY`.

## Position

- **dernier CP terminé** : **CP14**
- **CP courant** : —
- **sous-lot courant** : —
- **NEXT_CP** : **CP15** — rapport final
- **NEXT_ACTION** : écrire `docs/v74/V74-FINAL-REPORT.md` — **long**, avec les 34 sections
  minimales listées dans le brief. Doivent y figurer nommément : **ce que je croyais au CP0 et
  qui était faux** · **les anomalies de mes propres sondes** (il y en a **quatorze**, n° 1 à
  n° 14, et quatre d'entre elles allaient dans le sens qui m'arrangeait) · les décisions
  **abandonnées** et **prises** · la séparation stricte entre **mesuré / interprété / non
  prouvé** · les dettes **D1→D10** · l'état des critères **B1→B12** et **N1→N5** · le verdict
  parmi `RETENTION_ENGINE_NOT_READY / FOUNDATION_READY / CANDIDATE / READY`, avec sa
  justification. **Rappel : `READY` est INTERDIT si le scheduler n'est pas réellement utilisé
  par le produit** — B12 est désormais satisfait ET gardé par la porte `v74:check` (R6).
  C'est le **second et dernier gros rapport visible** demandé par le brief.

## Repères Git

| | |
|---|---|
| dépôt | `Fourat23/Ai-carreer-os` (**deux `r`**) |
| branche canonique | `claude/ai-career-os-saas-phfg49` |
| HEAD au début de V74 | `b353ebd` (fin V73) |
| local == origin | oui |
| working tree | propre · stash vide · `data/progress.json` absent |

## Invariants (à revérifier à chaque CP)

`128` leçons · `365` journées · `365` corrections · `52` semaines · `12` mois ·
corpus des leçons `92d5fae6…` · **`data/progress.json` n'existe pas** — l'invariant est de ne
jamais le créer · `L1 = 0 · L2 = 0/52 · L3 = 6/365` (seuils de charge V73) ·
`1420/1420` tests · `tsc 0` · **47** portes sans violation (dont `v74:check`, créée au CP14) · porte V73 verte ·
R1→R7 = 0 · 376/376 solutions de référence passantes.

## Décisions gelées

- **CP0** : aucune (lecture seule).
- **CP1** : contrat gelé `docs/v74/V74-RETENTION-CONTRACT-FROZEN.md`. Décisions structurantes :
  - **MEANINGFUL_CONTACT** défini par quatre faits écrits (M1 tentative de rappel · M2
    tentative d'exercice réellement exécutée · M3 preuve validée · M4 soumission non vide).
    **`status = 'done'` n'en est PAS un**, ni une page ouverte, ni une compréhension déclarée.
  - **RETRIEVAL** = trois conditions cumulatives : tentative (R-a) · **correction non ouverte
    avant** (R-b) · première tentative de l'artefact ce jour-là (R-c).
  - **PARTIAL ne fait ni progresser ni casser une série** (règle V66 reprise, car prudente).
  - **Les 5 statuts `UNKNOWN/OVERDUE/DUE/SOON/HEALTHY` NE SONT PAS des probabilités de
    mémoire** — états de planification uniquement. Ordre d'évaluation gelé et testé au CP14.
    Seuils : `FENETRE_SOON = 3 j`, `TOLERANCE_DUE = 7 j`.
  - **QUESTION CRITIQUE TRANCHÉE — option A retenue : `ExerciseAttempt` devient un FAIT
    CANONIQUE.** Raison sémantique, pas de commodité : *le système persiste aujourd'hui la
    PROJECTION (la preuve) et jette le FAIT (la tentative)* ; quand l'exercice échoue il n'y a
    pas de projection à écrire, donc rien n'est écrit. C'est le **seul événement du produit à
    verdict objectif**. Champ décisif : **`correctionSeen`**, sans lequel R-b serait décoratif.
  - **Option B retenue additivement** : `RecallAttempt` reçoit `durationMs`, `sourceKind`,
    `evidenceRef`, **avec valeurs par défaut** — aucune donnée historique invalidée.
  - **Option C REFUSÉE en tant qu'équivalence**, retenue en **règle dérivée qualifiée
    `DERIVED_RECALL`** (4 conditions). **Mesure qui commande la décision — CHIFFRES CORRIGÉS AU
    CP7, règle inchangée : 140 exercices sur 376** (et non 207) sont rattachables à un concept
    par déclaration **unique** ; les **236 autres** (et non 169) ont une médiane de 3 leçons
    candidates, max **14**. La sonde du CP1 comptait les exercices déclarés par AU MOINS une
    leçon, alors que la règle exige exactement une. **Le code n'a jamais changé** — il attachait
    déjà 140. **La décision en sort renforcée**, pas fragilisée. Détail : anomalie n° 7.
  - **Option D REFUSÉE** : pas de quatrième moteur.
  - **Idempotence** : clés métier gelées (`exerciseId`+seconde+`passed/total` ;
    `conceptId`+seconde+`format`), **provenance obligatoire**, **horodatage serveur
    uniquement**, tri à la lecture, bornes à 20 000.
  - **Responsabilités DISJOINTES des trois mécanismes** : V19 = relecture de journée depuis la
    compréhension déclarée (devient **un signal d'intention**) · V66 = série de rappels par
    concept (devient **un facteur**) · 52 revues = **le seul rendez-vous FREE_RECALL** (cessent
    de décider QUOI réviser). **L'arbitre est au-dessus, il ne remplace rien.**
  - **Architecture en 8 couches** documentée (entrée, sortie, mutabilité, source de vérité,
    déterminisme, responsabilité) + deux règles transverses : aucune couche n'écrit au-dessus
    d'elle ; toute couche déterministe rend une sortie identique à entrée identique.
  - **DOUZE contournements interdits G1→G12**, dont **G9 « absence d'échec enregistré =
    absence d'échec »** et **G12 « ajouter un bloc de rappel aux 313 journées ferait passer le
    FREE_RECALL de 52 à 365 sans qu'aucune propriété ne change »**.
  - **12 critères BLOQUANTS B1→B12** (dont **B12 : `READY` interdit si le scheduler n'est pas
    réellement utilisé par le produit**) et **5 NON bloquants N1→N5**. **N1 et N2 —
    l'espacement — sont délibérément NON bloquants** : le CP0 a montré que la cause dominante
    est le rattachement des leçons (défaut de curriculum `P1-CP13-1` de V73), et les rendre
    bloquants forcerait V74 à modifier le curriculum pour verdir une métrique de rétention.
  - **4 hypothèses déclarées non prouvées** (H1→H4) et **4 incertitudes**, dont
    `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`, **inchangé par V74**.

## Mesures BEFORE (CP0, à ne jamais reconstruire)

| mesure | valeur |
|---|---|
| intervalles entre contacts, **grain compétence** | n=828 · médiane **1** · P75 **1** · P90 5 · max 316 |
| intervalles entre contacts, **grain concept** | n=1068 · médiane **1** · P75 2 · P90 7 · max 316 |
| **intervalles valant exactement 1 jour** | **647/828 (78 %)** compétence · **785/1068 (74 %)** concept |
| intervalles > 60 jours | **13 / 828** |
| `exposition → première pratique` | **0 sur 19 compétences / 20** |
| `pratique → application` | `dl` **126** · `llm` **140** · `agents` **126** |
| paires leçon × revue | **247** · écart 1 j : **135 (55 %)** · 7 j et + : 29 (12 %) |
| **leçons liées aux SIX journées de leur semaine** | **94 / 247** → écart de 1 **inévitable** |
| leçons de revue issues de sa propre semaine | **218 / 247** |
| `FREE_RECALL` | **52 journées / 365**, **0 journée de travail** |
| `RECONSTRUCTION` | 52 / 365 |
| silences finaux ≥ 180 j | `jsts` 248 · `gitlinux` 288 · `sql` 213 · `python` 183 |
| plus longs trajets contact → projet exigeant | `dl` **58 j** · `ml` 44 · `llm`/`rag`/`agents`/`evalia` **37 j** |
| compétences sans journée de projet | `algo` `ds` `gitlinux` `patterns` `autonomy` |

## Fichiers modifiés

- **CP14** : **créés** `scripts/v74/cp14-mutations.mjs` (harnais 15 mutations),
  `scripts/v74-check.mjs` (**porte V74, 21 vérifications**), `docs/v74/V74-CP14-MUTATIONS.md`.
  **Modifiés** `package.json` (`v74:check` dans `gates:active` → **47 portes**),
  `tests/v74-learner-memory.test.mjs` (trou M06), `tests/v74-retention-priority.test.mjs`
  (sonde G5). **0 fichier de produit modifié.**
- **CP13** : **créés** `scripts/v74/cp13-apprenants.mjs` (8 profils, 6 propriétés),
  `tests/v74-apprenants.test.mjs` (45), `docs/v74/V74-CP13-APPRENANTS.md`.
  **Aucun fichier de produit modifié** — le CP13 mesure, il ne corrige pas.
- **CP12** : **créés** `lib/plan-jour-server.ts`, `lib/daily-plan.d.ts`, `lib/learner-memory.d.ts`,
  `lib/retention-priority.d.ts`, `lib/retention-scheduler.d.ts`, `lib/retrieval-task.d.ts`,
  `tests/v74-b12-branchement.test.mjs` (10), `docs/v74/V74-CP12-INTERFACE.md`.
  **Modifiés** `app/retention/page.tsx`, `app/retention/RecallStation.tsx`,
  `app/api/lab/[exerciseId]/route.ts`, `app/lab/[exerciseId]/LabWorkspace.tsx`,
  `app/globals.css` (**jetons existants uniquement**), `scripts/v651-check.mjs` (C11).
  **Aucun fichier de curriculum touché.**
- **CP11** : **créés** `scripts/v74/cp11-transfert.mjs`, `tests/v74-transfert.test.mjs` (11),
  `docs/v74/V74-CP11-TRANSFERT.md`. **Modifiés** `lib/learner-memory.mjs` (`transfers` redéfini,
  `cooccurrencesCompetences` + `jamaisTransfere` ajoutés, `sourceType` transmis),
  `lib/evidence.mjs` (`transfer-challenge` dans les DEUX listes),
  `tests/v65-evidence.test.mjs` (gel V65 mis à jour **avec sa raison**).
- **CP10** : **créés** `lib/daily-plan.mjs`, `scripts/v74/cp10-charge.mjs`,
  `tests/v74-daily-plan.test.mjs` (14), `docs/v74/V74-CP10-PLAN-JOURNEE.md`.
  **Aucun fichier de curriculum touché.**
- **CP9** : **créés** `scripts/v74/cp9-oubli.mjs` (5 candidats + sensibilité),
  `tests/v74-oubli.test.mjs` (10), `docs/v74/V74-CP9-OUBLI.md`. **Modifiés**
  `lib/retention-scheduler.mjs` (paramètre `echeanceDeOf`, **défaut inchangé**),
  `scripts/v74/cp8-espacement.mjs` (injections `echeanceDeOf` et `oubli`).
- **CP8** : **créés** `scripts/v74/cp8-espacement.mjs`, `tests/v74-espacement.test.mjs` (12).
  **Modifiés** `lib/retention-priority.mjs` (ordre de service EN BANDES),
  `lib/retention-scheduler.mjs` (`PLACES_DECOUVERTE`, séquence à place réservée).
  **Créé** `docs/v74/V74-CP8-ESPACEMENT.md`.
- **CP7** : **créés** `lib/remediation.mjs`, `lib/remediation.d.ts`, `lib/remediation-server.ts`,
  `tests/v74-remediation.test.mjs` (27), `scripts/v74/cp7-remediation-substrat.mjs`,
  `scripts/v74/cp7-rattachement.mjs`, `docs/v74/V74-CP7-REMEDIATION.md`.
  **Modifiés** `docs/v74/V74-RETENTION-CONTRACT-FROZEN.md` (**correction de mesure §3.4, règle
  inchangée**), `lib/learner-memory-server.ts` (commentaire : chiffres corrigés).
- **CP6** : **modifié** `scripts/generate-curriculum.mjs` (`lessonsDeLaRevue` rend des leçons
  **catégorisées** `{file, categorie, raison}` ; `ESPACEMENT_MIN_JOURS = 21`,
  `PLACES_ANCIENNES = 2`, historique `DERNIERE_REVUE`). **Régénérés** : `data/program.json`,
  **46 journées de revue** (`day-042` → `day-364`), `docs/v73/charge-365.json`,
  `docs/v73/curriculum-graph.json`. **Créé** `docs/v74/V74-CP6-REVIEWS-2.md`.
- **CP5** : **créés** `lib/retrieval-task.mjs`, `tests/v74-retrieval-task.test.mjs`.
  **Modifié** `scripts/v651-check.mjs` (liste C11).
- **CP4** : **créés** `lib/retention-scheduler.mjs`, `tests/v74-retention-scheduler.test.mjs`.
  **Modifié** `scripts/v651-check.mjs` (liste C11).
- **CP3** : **créés** `lib/retention-priority.mjs`, `tests/v74-retention-priority.test.mjs`.
  **Modifié** `scripts/v651-check.mjs` (règle C11 étendue **et renforcée**).
- **CP2** : **créés** `lib/exercise-attempt.mjs`, `lib/exercise-attempt.d.ts`,
  `lib/learner-memory.mjs`, `lib/learner-memory-server.ts`,
  `tests/v74-learner-memory.test.mjs`. **Modifiés** `lib/progress-store.mjs` (persistance
  additive), `lib/learning-engine.mjs` (commande `RECORD_EXERCISE_ATTEMPT`), `lib/types.ts`,
  `app/api/lab/[exerciseId]/route.ts` (**écriture de la tentative dans les deux cas**),
  `tests/progress-store.test.mjs` (forme de la progression vide).
- **CP1** : aucun fichier de produit. Créé : `docs/v74/V74-RETENTION-CONTRACT-FROZEN.md`.
- **CP0** : aucun fichier de produit. Créés : `scripts/v74/cp0-forensics.mjs`,
  `scripts/v74/cp0-learner-fields.json`, `docs/v74/cp0-forensics.json`,
  `docs/v74/V74-CP0-RETENTION-FORENSICS.md`, `docs/v74/V74-STATE.md`.

## Tests exécutés

- **CP14** : **1612/1612** (1 nouveau) · tsc 0 · **build OK** · `gates:active` **0 violation**
  (**47 portes**) · **15 mutations sur 15 vues rougir**, 15 fichiers restaurés à l'octet près ·
  `data/progress.json` absent · corpus inchangé.
- **CP13** : **1611/1611** (45 nouveaux) · tsc 0 · `gates:active` **0 violation** (46 portes) ·
  corpus `92d5fae6…` inchangé · `data/progress.json` absent · simulation **déterministe**
  (graine, aucun `Math.random`) · **3 mutations testées, 1 seule rougissait d'abord**
  (anomalie n° 13).
- **CP12** : **1566/1566** (10 nouveaux) · tsc 0 · **build OK** · `gates:active` **0 violation**
  (46 portes) · **responsive 0 débordement / 0 superposition** aux 4 viewports · **0 score
  chiffré** dans le HTML servi · `data/progress.json` absent · **3 mutations VUES rougir**,
  dont **1 ne rougissait pas d'abord** (assertion creuse).
- **CP11** : **1556/1556** (11 nouveaux) · tsc 0 · **build OK** · `gates:active` **0 violation**
  (46 portes) · corpus `92d5fae6…` inchangé · `data/progress.json` absent · **4 mutations VUES
  rougir** · **1 test V65 a rougi et avait raison** (gel du vocabulaire des preuves).
- **CP10** : **1545/1545** (14 nouveaux) · tsc 0 · `gates:active` **0 violation** (46 portes) ·
  corpus `92d5fae6…` inchangé · `data/progress.json` absent · **4 mutations VUES rougir**, dont
  **1 ne rougissait pas d'abord** (anomalie n° 11).
- **CP9** : **1531/1531** (10 nouveaux) · tsc 0 · `gates:active` **0 violation** (46 portes) ·
  corpus `92d5fae6…` inchangé · `data/progress.json` absent · **4 mutations VUES rougir**,
  dont **2 ne rougissaient pas d'abord** (anomalie n° 10) · **aucun modèle adopté**.
- **CP8** : **1521/1521** (12 nouveaux) · tsc 0 · `gates:active` **0 violation** (46 portes) ·
  corpus `92d5fae6…` inchangé · `data/progress.json` absent · **B2 vérifié** (tri total) ·
  **4 mutations VUES rougir** (2 · 4 · 4 · 1) puis restaurées.
- **CP7** : **1509/1509** (27 nouveaux) · tsc 0 · **build OK** · `gates:active` **0 violation**
  (46 portes) · corpus `92d5fae6…` inchangé · `data/progress.json` absent · **B2 et B10
  vérifiés** · **4 mutations VUES rougir** (7 · 1 · 2 · 1 tests) puis restaurées.
- **CP6** : **1482/1482** · tsc 0 · `gates:active` **0 violation** · porte V73 verte ·
  **R1→R7 = 0** · corpus des leçons `92d5fae6…` **inchangé** (seules les journées de revue
  changent) · `data/progress.json` absent · **charge L1 = 0 · L2 = 0/52 · L3 = 6/365**,
  identique au BEFORE.
- **CP5** : **1482/1482** (12 nouveaux) · tsc 0 · `gates:active` 0 violation · corpus
  `92d5fae6…` inchangé · `data/progress.json` absent.
- **CP4** : **1470/1470** (15 nouveaux) · tsc 0 · `gates:active` 0 violation · corpus
  `92d5fae6…` inchangé · `data/progress.json` absent · **B2 vérifié** (3 tests).
- **CP3** : **1455/1455** (15 nouveaux) · tsc 0 · `gates:active` 0 violation · corpus
  `92d5fae6…` inchangé · `data/progress.json` absent · **B10 vérifié**, **B2 amorcé**.
- **CP2** : **1440/1440** (20 nouveaux) · tsc 0 · build OK · `gates:active` 0 violation ·
  porte V73 verte · corpus `92d5fae6…` inchangé · `data/progress.json` absent ·
  **B1 vérifié** (égalité stricte × 2 : rejeu et ordre d'insertion).
- **CP1** : document seul, aucun code modifié — aucun test à rejouer.
- **CP0** : lecture seule, aucun test rejoué (état hérité de V73 : 1420/1420 · tsc 0 ·
  **46** portes · build OK · 376/376).

## Dette découverte

| # | dette | où |
|---|---|---|
| ~~**D1**~~ | ~~un exercice raté n'écrit RIEN~~ — **PAYÉE au CP2** : la tentative est écrite avant toute projection, succès ou échec | `app/api/lab/[exerciseId]/route.ts` |
| ~~**D2**~~ | ~~un exercice réussi n'émet pas de fait de rétention~~ — **PAYÉE au CP2** : `ExerciseAttempt` est persistée et le modèle mémoire la consomme | même fichier |
| **D3** | `RECORD_ATTEMPT` n'est appelé qu'une fois, avec `outcome: 'attempted'` en dur | `app/day/[id]/DayCorrection.tsx:35` |
| **D4** | `evidence[]` porte `competencyIds` (20), jamais `conceptId` (128) — **les grains ne coïncident pas** | `lib/evidence.mjs` |
| **D5** | **trois mécanismes de révision sans arbitre** : V19 journée, V66 concept, 52 revues | `lib/review.mjs`, `lib/retention.mjs`, générateur |
| **D6** | `weeklyReviews{}` est un objet libre, sans schéma normalisé | `lib/learning.mjs` |
| **D7** | aucune durée n'est attachée à une réactivation, aucune preuve d'utilité d'un rappel | `lib/retention.mjs` |
| **D10** *(CP11)* | **les 25 défis de transfert T4/T5 sont inatteignables.** Trois verrous restants : **0/365 journées** n'en cite un · **aucune référence** dans `data/program.json` · **aucune page** (`app/transfer` n'existe pas) alors que `lib/transfer-challenges-server.ts` est prêt. Le 4ᵉ verrou (type de preuve) a été ouvert au CP11 | `curriculum/days/`, `data/program.json`, `app/` |
| **D9** *(CP10)* | **44 journées HEAVY** (302 à 341 min pour un budget de 300), groupées en **six séries de six journées consécutives**. Conséquence directe : **6 séries de 6 jours sans aucune réactivation programmée**, et **735 minutes non placées sur l'année**. **Dette de CURRICULUM** : V73 l'a explicitement laissée, et la corriger ici voudrait dire retirer du contenu pour verdir une métrique de rétention | `curriculum/days/`, 44 journées |
| **D8** *(CP7)* | **192 exercices sur 376 ne se rattachent à AUCUNE leçon sans ambiguïté** (140 par déclaration unique + 44 par journée unique = 184 seulement). Deux marches de remédiation plafonnent à **49 %** pour cette raison, alors que les sections existent sur **128/128** leçons. **Dette de CURRICULUM, pas de moteur** : la corriger voudrait dire enrichir les `practiceRefs` pour verdir une métrique de rétention — ce que N1/N2 interdisent | `data/program.json` (`practiceRefs`) |

## Erreurs de sondes

| # | ce que la sonde mesurait | ce qu'elle prétendait mesurer |
|---|---|---|
| **11** *(CP10)* | **20 minutes perdues par semaine chargée**, parce que le report ÉCRASAIT la valeur entrante (`reste: cible`) au lieu de l'accumuler | **120 minutes** réellement sautées sur six journées consécutives. Sur l'année, ma mesure annonçait **115 minutes non placées ; le chiffre réel est 735** — un facteur **6,4**. Conséquence secondaire : `REPORT_MAX_PAR_JOUR` était **du code mort**, et le test qui le « gardait » veillait sur une propriété inatteignable. **L'erreur allait dans le sens qui m'arrangeait** : elle faisait paraître le coût de mon propre arbitrage six fois plus petit. Trouvée parce qu'une mutation ne faisait rougir personne. |
| **14** *(CP14)* | **une fixture posant le cas où la règle n'a rien à décider** : le test G5 posait `lastSuccessAt` **sans** `lastRetrievalAt` (nul), or le code lit `lastSuccessAt ?? lastRetrievalAt` — **les deux ordres de repli donnaient le même résultat** | la règle G5 « récent ne protège pas ». Le CP3 avait écrit « gardé par un test » : le test existait et **ne gardait rien**. Cas discriminant ajouté (tentative RÉCENTE qui a ÉCHOUÉ + réussite ANCIENNE). **Quatrième occurrence du motif** après les n° 9, 10 et 13. *Et une de mes mutations de contrôle était encore inefficace* : `RECORD_EXERCISE_ATTEMPT_X` **contient** `RECORD_EXERCISE_ATTEMPT`. |
| **13** *(CP13)* | **la cohérence interne du plan avec lui-même** : `minutesPlanifiees > minutesAccordees` | **le respect du budget de la JOURNÉE**. En neutralisant le plancher du CP10, la séance respectait toujours le budget qu'on venait de lui donner — **aussi faux fût-il** : la colonne « budget respecté » aurait affiché ✅ sur une journée à **351 minutes**. Corrigé : le contrôle porte sur charge de curriculum **+** réactivation. La mutation fait désormais rougir **9** tests. |
| **12** *(CP12)* | **la PRÉSENCE D'UNE CHAÎNE** : `includes('getPlanDuJour')` | **l'existence d'un BRANCHEMENT**. Une mutation remplaçant l'appel par un objet vide **passait**, parce que le nom subsistait dans un `as ReturnType<typeof getPlanDuJour>`. Même motif que les anomalies 9 et 10. Corrigé en exigeant la forme d'un **appel affecté**. |
| **10** *(CP9)* | **rien du tout, deux fois.** (a) un test comparait une série de 3 réussites à une série CASSÉE, or `sm2` court-circuite (`serie === 0` rend 1 jour **sans consulter le facteur de facilité**) : **inverser le signe du terme d'échec ne faisait rougir personne** ; (b) une fixture posée sur le **plafond** du facteur (2,8) absorbait encore l'inversion après correction | la sensibilité des candidats à l'échec. **Et une mutation de contrôle était un no-op arithmétique (`1 * 0 + 1` vaut `1`)** — croire qu'une suite « résiste » à une non-mutation est pire que ne pas avoir muté. Trois règles retenues : un court-circuit en amont rend le code en aval intestable · une valeur bornée teste mal · **une mutation doit être vérifiée comme mutation**. |
| **9** *(CP8)* | une **coïncidence de données** : avec des valeurs par défaut, la fiche en retard a naturellement le meilleur score, donc les DEUX ordres de tri donnaient le même résultat | la **règle** « une notion à jour ne passe pas devant une notion en retard ». Le test **passait avant comme après le CP8**, et aurait continué à passer si la règle avait été supprimée. Découvert parce qu'une mutation censée toucher deux tests n'en faisait rougir **qu'un**. Réécrit sur le cas discriminant (fiche saine à **30** contre **20**), avec une assertion qui garde le fait que le cas RESTE discriminant. |
| **8** *(CP7)* | **un nombre que je n'ai jamais compté moi-même** : « 52 portes », repris du rapport final de V73 et répété dans CINQ entrées de journal de V74 | le nombre d'entrées de `gates:active`, qui vaut **46** — et valait déjà 46 au commit `b353ebd`, fin de V73. Aucune porte ne manquait, aucun verdict ne change (le critère est « 0 violation », pas un décompte) : **c'est un chiffre recopié au lieu d'être mesuré**. Corrigé partout dans ce fichier. |
| **7** *(CP7)* | les exercices **déclarés par AU MOINS une leçon** → **207** | les exercices **rattachables à UNE leçon**, ce qu'exige la règle §3.4 → **140**. Les **67** exercices déclarés par 2 à 6 leçons étaient comptés du bon côté alors que le code les écarte depuis toujours. **Aucun comportement de produit ne change** ; **la décision du CP1 en sort RENFORCÉE** (236 exercices à trancher arbitrairement, et non 169). **Une erreur de sonde qui va dans le sens de ma propre conclusion est celle qui a le plus besoin d'être publiée.** |
| **6** *(CP5)* | un motif **ancré en début de chaîne** (`/^objectif/i`) | la présence d'une **section** dont le titre commence par un **émoji**. `FEYNMAN` sortait disponible sur **0 leçon sur 128** alors que ses sections existent partout — **un archétype à zéro aurait pu passer pour un constat de corpus**. |
| **5** *(CP3)* | **ma propre séquence de vérification** : `gates:active > /dev/null` puis lecture du seul code de retour **après le push** | vérifier avant de pousser. Faute de séquence, publiée. |
| **4** *(CP3)* | le nombre de `', et '` dans une phrase | le nombre de **facteurs cités**. La phrase de l'échec contient elle-même « , et » : **la sonde mesurait la ponctuation**. Les identifiants cités sont désormais exposés à part. |
| **1** | « le prochain projet après le **dernier contact** » — une constante | le prochain besoin curriculaire, qui est **relatif à une date**. Donnait « aucun » pour les 20 compétences. **Re-mesuré.** |
| **2** | la **présence d'une section** dans le gabarit d'une journée | une **distribution de formes de révision**. 6 catégories sur 9 sortaient à 313-365 parce que toutes les journées ont ces sections. |
| **3** | `Mini-quiz` en texte libre → **236** journées | V73 comptait la **section** `## ❓ Mini-quiz` → **78**. Les deux sont justes et ne mesurent pas la même chose ; signalé, non tranché. |

## Journal des CP

- **CP14** — **15 mutations sur 15 vues rougir. Mais au premier passage, 13 — et les deux trous
  étaient réels.**
  - **NOTE D'HONNÊTETÉ EN TÊTE DU RAPPORT** : le brief énumérait quinze mutations, **je n'en ai
    plus le texte verbatim**. Les quinze sont **dérivées des décisions gelées** (G1→G12,
    B1→B12), chacune attaquant une décision nommée, du CP2 au CP12. **Reconstruction fidèle à
    l'intention, pas citation** — le dire vaut mieux que de laisser croire à une correspondance
    exacte.
  - **Le harnais fait deux vérifications qu'on oublie** : que la mutation **a réellement muté le
    fichier** (leçon de l'anomalie n° 11 : `1 * 0 + 1` vaut `1`), et que le fichier est
    **restauré à l'octet près**.
  - **PREMIER PASSAGE : 13/15.** Les deux manquantes étaient de vrais défauts de couverture, et
    **elles ont la même forme**.
  - **TROU M06 — la clé métier ne testait qu'une direction sur deux.** Le test vérifiait que
    deux enregistrements à la même seconde FUSIONNENT ; **rien ne vérifiait qu'ils se
    DISTINGUENT** quand les scores diffèrent. **Conséquence réelle** : un apprenant qui relance
    dans la même seconde après avoir corrigé son code verrait sa progression **2/5 → 5/5 écrasée
    par déduplication** — le moteur perdrait le fait le plus intéressant qu'il ait.
  - **TROU M10 — la fixture posait exactement le cas où la règle n'a rien à décider.** Le CP3
    avait écrit « G5 gardé par un test ». **Le test existait et ne gardait rien** : il posait
    `lastSuccessAt` sans poser `lastRetrievalAt` (nul), or le code lit
    `lastSuccessAt ?? lastRetrievalAt` — **les deux ordres de repli donnaient le même
    résultat**. Le cas discriminant, qui est le cas réel visé par G5, est **une tentative
    RÉCENTE qui a ÉCHOUÉ plus une réussite ANCIENNE**. **Quatrième occurrence du motif** après
    les anomalies n° 9, 10 et 13 : *un test vert ne prouve rien tant qu'on ne l'a pas vu
    rougir*.
  - **UNE NOUVELLE PORTE : `v74:check`.** Le brief demandait de rejouer « les portes V74 » —
    **elles n'existaient pas** (V65 et V66 ont chacune la leur). Créée, **21 vérifications**,
    ajoutée à `gates:active` : **46 → 47 portes**. Elle garde des propriétés STRUCTURELLES
    qu'aucune assertion ne voit : R2 (la tentative écrite AVANT la branche de succès), R5
    (modules purs), **R6 · B12 — les cinq modules branchés, la page qui appelle l'arbitre, le
    laboratoire qui appelle la remédiation**, R7 (aucun score de mémoire), R9 (transfert non
    fabriqué), R10 (`progress.json` absent).
  - **LA PORTE A ÉTÉ VUE ROUGIR** sur cinq injections (B12 débranché, commande supprimée,
    tentative écrite après le succès, échelle dans `daily-plan`, co-occurrence rebaptisée).
    **Et une de mes mutations de contrôle était encore inefficace** : renommer
    `RECORD_EXERCISE_ATTEMPT` en `RECORD_EXERCISE_ATTEMPT_X` laisse la chaîne d'origine
    **contenue** dans la nouvelle — `indexOf` la trouvait toujours. Même famille que
    l'anomalie n° 11, refaite correctement.
  - **APRÈS RESTAURATION COMPLÈTE : 0 fichier de PRODUIT modifié** — seuls deux fichiers de test
    ont été corrigés.
  - **1612/1612 · tsc 0 · build OK · 47 portes vertes · corpus inchangé · `progress.json`
    absent.**

- **CP13** — **huit apprenants, six propriétés, 8/8. Et le décompte qui les faisait tous
  échouer était trompeur — en MA défaveur.**
  - **« UNE SIMULATION N'EST PAS UNE PREUVE D'APPRENTISSAGE »**, écrit dans le titre du rapport
    comme le contrat §8.2 l'exige. Ce qui est vérifié est la **ROBUSTESSE** du moteur, pas son
    efficacité pédagogique — `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`, inchangé.
  - **CE QUE LE CP8 N'AVAIT PAS COUVERT** : ses trois apprenants ne différaient que par un
    **taux de réussite constant**. Les profils **B** (irrégulier), **D** (un jour sur dix),
    **F** (oublis sélectifs sur UNE compétence), **G** (arrêt de 30 jours puis reprise) et **H**
    (n'produit jamais de preuve) couvrent ce qui manquait.
  - **Chaque profil passe par le VRAI plan de journée** — `planDuJour` → `planifier` →
    `prioriteDe`, avec la charge réelle des 365 journées. Pas un simulateur parallèle. La
    compétence affaiblie de F est **dérivée du corpus**, pas choisie à la main (la choisir
    permettrait de choisir celle qui arrange) ; un test le garde.
  - **RÉSULTAT : 8 profils sur 8** satisfont les six propriétés — pas de boucle · arriéré non
    explosif · pas de répétition permanente · aucune famine · priorité explicable · budget
    respecté.
  - **LE DÉCOMPTE BRUT LES FAISAIT TOUS ÉCHOUER, ET IL ÉTAIT TROMPEUR** : « 3 à 18 notions
    jamais proposées » mélangeait deux choses — une notion rencontrée **l'avant-veille** n'a pas
    encore eu son tour, une notion rencontrée **il y a trois mois** serait une vraie famine. La
    mesure qui tranche est le nombre de **jours ACTIFS** depuis la première exposition :
    **attente maximale 23 jours actifs, et 0 notion au-delà de 30, sur les huit profils.**
  - **LE SEUIL DE 30 A ÉTÉ CHOISI APRÈS AVOIR VU LE MAXIMUM, et je le dis** : sinon un seuil
    confortable passerait pour une démonstration. **Ce qui prouve la propriété est la BORNE
    MESURÉE (23), pas le seuil.** Un test garde la borne elle-même.
  - **ANOMALIE n° 13 — « budget respecté » ne mesurait presque rien.** Ma sonde comparait
    `minutesPlanifiees > minutesAccordees`, c'est-à-dire **la cohérence interne du plan avec
    lui-même**. En neutralisant le plancher du CP10, la séance respectait toujours le budget
    qu'on venait de lui donner — **aussi faux fût-il** : la colonne aurait affiché ✅ sur une
    journée à **351 minutes**. Corrigé : le contrôle porte sur la **journée entière** (charge +
    réactivation). La mutation fait désormais rougir **9** tests contre **0**.
  - **UNE TROISIÈME MUTATION NE ROUGIT PAS, ET C'EST VRAI** : porter `PLAFOND_UNITES` de 8 à 400
    ne change rien, parce que **le budget de 20 minutes borne la séance bien avant le plafond**
    (~4 unités) — fait déjà établi au CP8. Le plafond ne protège rien à 20 minutes, et **il vaut
    mieux l'écrire que de laisser croire qu'il travaille**.
  - **Lectures qui méritent d'être dites** : C fait **14 jours consécutifs sur `recursion`** —
    comportement ATTENDU, pas défaut (échouer ramène l'intervalle à 1 jour) · D ne couvre que
    24 notions sur 42 parce que **24 journées actives et une place de découverte par séance
    rendent 42 arithmétiquement impossible** — capacité, pas famine · G culmine à 42 d'arriéré
    au retour puis redescend à 28 : **ni blocage, ni noyade**.
  - **H reste servi** (882 tentatives, 85 notions) alors qu'il ne produit aucune preuve : c'est
    la décision du CP2 en action — **la preuve est une projection, la tentative est le fait**.
  - **1611/1611 · tsc 0 · 46 portes vertes · corpus inchangé · aucun fichier de produit
    modifié.**

- **CP12** — **B12 est passé de NON à OUI : le moteur atteint enfin l'apprenant. Et deux défauts
  ne sont apparus qu'en LISANT LA PAGE RENDUE.**
  - **CE QUE L'AUDIT A ÉTABLI** : entre le CP2 et le CP11, **aucun des six modules écrits
    n'était atteignable depuis le produit** — `learner-memory`, `retention-priority`,
    `retention-scheduler`, `retrieval-task`, `remediation`, `daily-plan` : **0 référence** dans
    `app/`, **0 read-model**. Les 7 correspondances de « remediation » étaient toutes des faux
    positifs (capstones, cloud, libellé de phase). **Six modules, des centaines de tests verts,
    et rien qu'un apprenant puisse voir** — exactement ce que B12 vise, et ce qu'un tableau de
    tests verts cache parfaitement.
  - **Constats : 3 P0 · 4 P1 · 1 P2.** Les trois P0 ont la même cause. **Ce qui était déjà bon
    n'a PAS été touché** : responsive 0 débordement aux 4 viewports · `lang="fr"` · 20 règles
    `focus-visible` · `role="alert"` / `role="group"` · aucun score chiffré · le geste
    « consigne d'abord, réponse après » de V66.
  - **AUCUN REDESIGN** : un read-model nouveau, quatre fichiers touchés, composants existants
    réutilisés (`Panel`, `InlineNotice`, `ContextLine`), et **aucune couleur ni motif nouveau** —
    les styles ajoutés n'emploient que des jetons existants (vérifié : les 3 jetons que j'avais
    inventés au premier jet n'existaient pas, remplacés par les vrais).
  - **`lib/plan-jour-server.ts`** assemble la chaîne et **ne décide rien** : faits → CP2 → CP3 →
    CP4 → CP5 → CP10. Aucun seuil, aucune échelle — c'est ce qui l'empêche d'être un sixième
    moteur.
  - **CE QUE L'APPRENANT VOIT, vérifié sur le rendu réel** : *« ta dernière tentative n'a pas
    abouti, il y a 16 jours, et tu n'y es pas revenu depuis »* (pourquoi explicable du CP3, deux
    facteurs) · *« Question posée · environ 3 min »* (forme soutenue après échec, CP4 + coût
    CP10) · *« Réponds à voix haute aux questions d'entretien de la leçon »* (archétype réel du
    CP5) · et la place réservée du CP8 : *« tu l'as rencontré, mais tu ne l'as jamais mis à
    l'épreuve »*.
  - **LA REMÉDIATION DU CP7 EST RENDUE**, vérifiée par un appel réel à l'API : 2/5 tests →
    `SOUS_PROBLEME`, *« Oublie les autres tests. Fais passer celui-ci… »*, prochaine `INDICE`.
    **Au premier échec, l'apprenant ne reçoit PAS la réponse.** L'anti-fuite est préservé : seuls
    les tests PUBLICS échoués sont nommés, et un test le garde.
  - **DEUX DÉFAUTS TROUVÉS EN LISANT LA PAGE RENDUE, PAS LE CODE** — tous deux passés au travers
    de `tsc`, de 1556 tests et du build. (a) **la carte annonçait un exercice et en demandait un
    autre** : le libellé venait de la forme V66 (« Mise en application ») et la consigne de la
    forme CP4 (questions d'entretien) — j'avais remplacé la consigne sans remplacer la forme ;
    (b) **la page se contredisait à deux centimètres** : « Rien n'est dû aujourd'hui » pendant
    que le rail affichait « Écarté aujourd'hui — budget de la session atteint », parce que je
    cherchais les unités dans `s.queue` (file DUE de V66) au lieu de `s.projection` — **le choix
    de l'arbitre était refiltré par la règle d'échéance de V66, soit deux décideurs pour une
    même question**. *Ces deux défauts sont l'argument le plus fort en faveur du CP12 lui-même :
    un moteur qu'on ne regarde pas fonctionner peut être parfaitement testé et parfaitement faux
    à l'écran.*
  - **UNE PORTE A ROUGI, ET ELLE AVAIT RAISON DE REGARDER** : C11 a signalé
    `retention-priority.d.ts` et `retention-scheduler.d.ts`. **Mais un `.d.ts` ne contient aucune
    implémentation** — il ne peut pas être un moteur, et la liste contenait déjà
    `lib/retention.d.ts`. Les `.d.ts` sortent du contrôle **par le NOM** et **restent soumis au
    contrôle par la PROPRIÉTÉ** ; vérifié négativement dans les deux sens (un `.d.ts` portant un
    `INTERVALS` rougit ; un vrai `.mjs` non déclaré rougit).
  - **B12 EST DÉSORMAIS GARDÉ PAR UN TEST, PAS PAR UNE LECTURE** :
    `tests/v74-b12-branchement.test.mjs` teste un **branchement**, pas une fonction.
  - **ANOMALIE n° 12** : une de ses assertions était **creuse**. `includes('getPlanDuJour')`
    passait alors que l'appel avait été remplacé par un objet vide — le nom subsistait dans un
    `as ReturnType<typeof getPlanDuJour>`. **Le test gardait la présence d'une chaîne, pas
    l'existence d'un branchement.** Corrigé en exigeant la forme d'un appel affecté.
  - **RESTE EN DETTE** : `/transfer` toujours en 404 (D10, verrous 1-3 : lier les défis aux
    journées toucherait au curriculum) · D3 non payée · **la tendance de l'arriéré n'est pas
    persistée**, donc le signal reste en « vigilance » — *inventer une tendance aurait été
    fabriquer un fait*, le read-model passe `null` et le dit.
  - **1566/1566 · tsc 0 · build OK · 46 portes vertes · 0 débordement aux 4 viewports · 0 score
    chiffré dans le HTML servi · corpus inchangé.**

- **CP11** — **le moteur était STRUCTURELLEMENT incapable d'observer un transfert, et ce qu'il
  appelait « transfert » s'allumait sur 74 % des journées.**
  - **CE QUE LE COMPTEUR MESURAIT** : les contacts d'une journée dont les leçons portent ≥ 2
    compétences → **269 journées sur 365 (74 %)**. Deux défauts, et le second est le vrai :
    un indicateur qui s'allume trois fois sur quatre ne distingue rien ; **et surtout il ne
    mesure pas le transfert** — *deux compétences enseignées le même jour ne demandent pas de
    transposer l'une dans l'autre*. C'était une **erreur de NOM, pas de seuil** : aucun réglage
    ne l'aurait corrigée.
  - **CE QUE LE PRODUIT POSSÉDAIT DÉJÀ, ET QUI N'ÉTAIT PAS BRANCHÉ** : une taxonomie de distance
    **T0→T5** (`lib/transfer-taxonomy.mjs`, classifieur conservateur) · **25 défis**, dont
    **23 en T5**, **25/25 `crossDomain`**, pont conceptuel exigé · **18 compétences sur 20**
    couvertes (seules `comm` et `autonomy` sans défi) · **aucun moteur de notation propre** —
    `gradeTransferChallenge` compose `lib/assessment.mjs`. **Le CP11 n'a écrit ni taxonomie, ni
    défi, ni barème** : comme le CP7 avec `misconceptions.mjs`, il branche l'existant.
  - **LES QUATRE VERROUS** : **0/365** journées citant un défi · **aucune** référence dans
    `data/program.json` · **aucune page** (`app/transfer` n'existe pas) · et surtout
    **`transfer-challenge` n'était pas un type de preuve** — `createEvidence` aurait REFUSÉ une
    réussite avec `INVALID_SOURCE_TYPE`. **Même en réussissant les 25 défis, rien n'aurait pu
    être écrit nulle part.** C'est le motif du CP0 (« le système n'a jamais observé un échec »)
    appliqué au transfert.
  - **CE QUI CHANGE** : `transfers` compte désormais une **preuve validée issue d'un défi de
    transfert** — donc **0 pour tout le monde aujourd'hui**, et c'est la valeur honnête. *Un
    zéro honnête vaut mieux qu'un compteur saturé*, qui laissait croire que le transfert était
    mesuré (même décision qu'au CP2 pour `exerciseAttempts: []`). La co-occurrence est
    **conservée sous son vrai nom** (`cooccurrencesCompetences`).
  - **LE QUATRIÈME VERROU EST OUVERT** : `transfer-challenge` rejoint `EVIDENCE_SOURCE_TYPES`
    **et** `QUALIFYING_SOURCE_TYPES`, sur la justification que V65 s'était donnée — *« les
    seuils sont ceux qui existaient déjà »* : le seuil **0,7** préexiste dans
    `gradeTransferChallenge`. **Aucun seuil nouveau.**
  - **UN TEST DE V65 A ROUGI, ET IL AVAIT RAISON** : le gel de la liste qualifiante à quatre
    types. *Élargir le vocabulaire des preuves est précisément le genre de changement qui doit
    être vu.* Gel mis à jour **avec sa raison écrite**, pas contourné.
  - **TROISIÈME SIGNAL SILENCIEUX NOMMÉ** : `jamaisTransfere` — **« su, mais jamais hors de son
    contexte d'origine »**, aux côtés de « exposé mais jamais mis à l'épreuve » et « travaillé
    mais jamais sans la réponse sous les yeux » (CP3). Les trois ne déclenchent **aucune alerte
    naturelle** : rien n'échoue, donc rien ne se plaint. Il ne s'allume **que sur une notion
    déjà réussie** — le dire d'une notion jamais réussie confondrait deux manques très
    différents, et un test garde la distinction.
  - **CE QUE LE CP11 NE FAIT PAS** : aucun score de transfert inventé (`UNMEASURABLE` au CP0) ·
    les trois premiers verrous restent fermés (curriculum et UI → **CP12**, dette **D10**) ·
    **aucun facteur de priorité ajouté** sur une valeur structurellement nulle — ce serait le
    code mort que l'anomalie n° 11 vient de me coûter.
  - **CONSÉQUENCE POUR LE CP9** : le candidat `evidence-aware` était aveugle ; le CP11 explique
    la moitié du pourquoi et lève un verrou. Il reste la dette **D4**. Les conditions de
    réouverture posées par le CP9 restent ouvertes, avec **un obstacle de moins**.
  - **Une fixture de test corrigée** : trois tests échouaient **pour une raison sans rapport
    avec le transfert** — `dayConcepts` passé en objet simple a des clés CHAÎNES, alors que
    `dayRef` est un NOMBRE. Le produit était correct, la fixture ne l'était pas.
  - **4 mutations VUES rougir** : co-occurrence rebaptisée transfert (1) · `sourceType` non
    transmis (3) · signal s'allumant sur une notion jamais réussie (1) · preuve non validée
    comptée (1).
  - **1556/1556 · tsc 0 · build OK · 46 portes vertes · corpus inchangé.**

- **CP10** — **le plan cesse d'ajouter des minutes à des journées qui débordent déjà. Et ma
  propre mesure minimisait sa perte d'un facteur six.**
  - **`lib/daily-plan.mjs`** — pur, horloge et charge injectées. **Ce n'est pas un cinquième
    moteur** : il ne définit ni échéance, ni priorité, ni forme, ni échelle — **il alloue des
    minutes** et délègue au scheduler du CP4. C11 reste satisfaite.
  - **TROIS MESURES, ET CHACUNE A TUÉ UNE SOLUTION ÉVIDENTE.** (1) les **44 journées HEAVY**
    (302 à 341 min) se groupent en **six séries de SIX journées consécutives** ; (2) **la
    journée de revue ne peut PAS servir de réservoir — hypothèse réfutée par la mesure** : les
    revues qui suivent ces séries pèsent **293 et 295 min**, soit **5 à 7 minutes de marge**
    (marge minimale sur les 52 revues : **5 min**) ; (3) **mais au grain de la SEMAINE, seules
    3 semaines sur 52 dépassent** (S32 +181, S33 +125, S34 +98) et **la semaine médiane a 693
    minutes de marge**.
  - **CE QUI EN DÉCOULE** : **26 des 44 journées surchargées sont dans des semaines globalement
    tenables** — *le défaut dominant est une RÉPARTITION dans la semaine, pas un excès de
    programme*. Un arbitre peut corriger une répartition sans toucher au curriculum.
  - **RÈGLES** : on raisonne sur la borne **HAUTE** de la charge (*un apprenant qui déborde
    systématiquement cesse de faire ses rappels*) · une journée au-dessus du budget reçoit
    **ZÉRO** minute, et **le scheduler n'est même pas convoqué** — pas de « petite révision
    quand même » · le report reste **dans la semaine**, rattrapage plafonné à 20 min/jour · ce
    qui n'est pas placé est **déclaré perdu**, jamais empilé.
  - **BEFORE → AFTER** : journées hors budget une fois la réactivation ajoutée **54/365 →
    44/365** ; **minutes hors budget DU FAIT DU PLAN : 1798 → 0**. *Les 44 journées encore hors
    budget le sont par le seul fait du curriculum ; le plan n'y ajoute plus une minute.*
  - **LE COÛT, PUBLIÉ** : **44 journées sans aucune réactivation**, dont **six séries de six
    jours consécutifs**, et **735 minutes non placées sur l'année (10 % du volume visé)**.
    Atténuation réelle mais qui ne compense pas : une journée HEAVY est lourde *parce qu'elle
    contient de la pratique*, laquelle est un contact significatif (M2/M4) — **mais ce sont des
    jours sans RETRIEVAL sur les notions ANCIENNES**, exactement ce que le moteur existe pour
    produire.
  - **LES 3 SEMAINES EXCÉDENTAIRES SONT DITES, PAS RÉPARÉES** : marquées avec leur excédent
    exact, **les 7 journées laissées en place**, et un test vérifie que rien n'est supprimé.
  - **LE SIGNAL DE RALENTISSEMENT PROPOSE, IL NE DÉCIDE PAS** : « c'est toi qui décides — le
    programme ne saute rien tout seul ». Un test garde le fait qu'un arriéré **stable** ne
    déclenche pas la proposition ; seul un arriéré qui **croît** le fait. Un autre garde
    qu'aucun message n'expose de score chiffré (§9).
  - **ANOMALIE n° 11 — MA MESURE MINIMISAIT SA PERTE D'UN FACTEUR 6,4.** Le report écrivait
    `reste: cible`, **écrasant la valeur entrante au lieu de l'accumuler** : six journées
    chargées d'affilée déclaraient **20 minutes non placées au lieu de 120**. Sur l'année,
    j'annonçais **115 minutes perdues ; le chiffre réel est 735**. Conséquence secondaire :
    `REPORT_MAX_PAR_JOUR` était **du code mort** et le test qui le « gardait » veillait sur une
    propriété inatteignable. **Trouvée parce qu'une mutation ne faisait rougir personne.**
    **L'erreur allait dans le sens qui m'arrangeait** — troisième cas du sprint après les
    anomalies 7 et 9. Corrigé : le report accumule, et le rattrapage non consommé reste dû —
    *un plafond doit borner le SERVICE, pas la DETTE*.
  - **Dette D9 inscrite** : les 44 journées HEAVY appartiennent au curriculum ; V73 a choisi de
    les laisser, et les corriger ici reviendrait à retirer du contenu pour verdir une métrique
    de rétention.
  - **1545/1545 · tsc 0 · 46 portes vertes · corpus inchangé · aucun fichier de curriculum
    touché.**

- **CP9** — **aucun modèle d'oubli n'est adopté, et c'est le RÉSULTAT MESURÉ, pas une dérobade.**
  - **Cinq candidats** implémentés et comparés : seuils temporels · Leitner (actuel) · SM-2
    inspiré · décroissance exponentielle · evidence-aware. **Aucun ne produit de probabilité de
    mémoire** — le CP0 a déclaré cette grandeur `UNMEASURABLE` et un test le garde.
  - **Ils vivent dans `scripts/`, PAS dans `lib/`, et c'est une décision** : les livrer dans
    `lib/` serait créer les cinq échelles concurrentes que le brief interdit, **et la règle C11
    l'interdirait à juste titre**. Le bon endroit pour une étude est l'étude.
  - **LE PIÈGE, NOMMÉ AVANT D'ÉCRIRE LA MOINDRE LIGNE** : l'apprenant simulé du CP8 réussit avec
    une probabilité **indépendante de l'intervalle** — *dans ce monde, l'oubli n'existe pas*. Y
    classer des modèles d'oubli aurait mesuré l'hypothèse de mon propre simulateur et l'aurait
    présentée comme une propriété des modèles. Et l'alternative — injecter une courbe d'oubli —
    est **circulaire** : elle favorise le modèle dont la forme ressemble à la courbe injectée.
  - **DÉMONSTRATION B1 — le classement se retourne selon l'hypothèse** : sur trois hypothèses
    d'oubli toutes également invérifiables, **trois modèles sur cinq occupent la première
    place**, et « seuils temporels » passe du **1ᵉʳ au 5ᵉ rang**.
  - **DÉMONSTRATION B2, celle que j'ai failli ne pas faire — à hypothèse FIXÉE, la seule graine
    du générateur retourne aussi le classement.** SM-2 va du rang 5 au rang 1 (amplitude
    **3,9 pt**), « seuils » du rang 5 au rang 1 (**2,9 pt**). **L'écart ENTRE modèles (0,1 à
    1,6 pt) est plus PETIT que la variation d'UN modèle d'une graine à l'autre (1,3 à 3,9 pt) :
    le signal est sous le bruit.** Les écarts de B1 étaient minuscules — il fallait mesurer le
    bruit, pas l'affirmer.
  - **`evidence-aware` est AVEUGLE, et ses chiffres identiques à Leitner sont TROMPEURS** : ce
    n'est pas une équivalence mais une **dégénérescence** — la simulation n'injecte aucune
    preuve, donc le multiplicateur vaut 1, donc le candidat *est* Leitner. Cause : **dette D4**
    (les preuves portent `competencyIds`, jamais `conceptId`). *Le seul candidat qui
    s'appuierait sur la donnée la plus objective du produit est celui que le produit ne sait pas
    alimenter au bon grain.*
  - **DÉCISION — Leitner (V66) est CONSERVÉ**, sur des raisons de produit décidables sans
    données de mémoire (même méthode qu'au CP4) : changer une échelle publiée exige une preuve
    et il n'y en a aucune · **Leitner s'explique en une phrase**, aucun autre candidat ne le
    fait (critère B10, bloquant) · il n'introduit **aucun paramètre inventé** là où les autres
    en ajoutent 4 à 5, donc autant d'occasions de **G11**. **Les trois conditions qui rendraient
    la décision révisable sont écrites**, pour qu'on ne puisse pas prétendre plus tard que la
    question n'avait pas été posée.
  - **ANOMALIE DE SONDE n° 10 — DEUX tests aveugles, et une mutation qui ne mutait rien.** Les
    dix tests passaient du premier coup ; sur quatre mutations, **deux ne faisaient rougir
    personne**. (a) `sm2` **court-circuite** — `serie === 0` rend 1 jour *sans jamais consulter
    le facteur de facilité*, donc inverser le signe du terme d'échec restait invisible ; (b)
    après correction, la fixture était posée sur le **plafond** du facteur (2,8), et un plafond
    absorbe les écarts ; (c) **ma mutation de contrôle sur `evidence-aware` était un no-op
    arithmétique** — `1 * 0 + 1` vaut `1`. **Croire qu'une suite « résiste » à une non-mutation
    est pire que ne pas avoir muté du tout.** Trois règles retenues : un court-circuit en amont
    rend le code en aval intestable · une valeur bornée teste mal · **une mutation doit être
    vérifiée comme mutation**.
  - **Le produit n'a PAS changé de modèle** : `planifier` reçoit un paramètre `echeanceDeOf`
    dont le défaut reste `echeanceDe`, et un test vérifie l'égalité stricte des deux appels.
  - **1531/1531 · tsc 0 · 46 portes vertes · corpus inchangé.**

- **CP8** — **l'espacement PRESCRIT est enfin l'espacement SERVI. Et la correction a cassé
  autre chose, que la mesure a dit tout de suite.**
  - **Ce que le CP8 mesure n'est PAS ce qu'a mesuré le CP6** : le CP6 traitait les 52 revues du
    curriculum, objet **statique** lisible dans les fichiers ; le CP8 traite ce que l'ARBITRE
    propose réellement à UN apprenant à partir de SES faits — **cela ne se lit nulle part, il
    faut faire tourner le moteur**. D'où `scripts/v74/cp8-espacement.mjs`, simulation
    déterministe (générateur à graine, **aucun `Math.random`**), 180 à 365 jours, trois
    apprenants à **90 % · 75 % · 50 %** de réussite.
  - **LE DÉFAUT TROUVÉ, chiffré** : chez l'apprenant à 90 %, **44 % des propositions portaient
    sur des notions `HEALTHY`** — que le moteur lui-même déclare à jour — et **222 places**
    avaient été prises par une notion non due **alors qu'une notion due attendait**. Cause :
    `prioriser` triait par **score** puis par statut ; le statut n'était qu'un départage.
  - **RÈGLE 1 — le statut décide de la BANDE, le score décide du rang DANS la bande.** Ordre de
    service `OVERDUE → DUE → UNKNOWN → SOON → HEALTHY`. **À ne pas confondre avec l'ordre
    d'ÉVALUATION gelé au §2 du contrat** (qui dit comment on CALCULE un statut) : les deux sont
    indépendants et **le contrat n'est pas modifié**. Justification : `INTERVALS` est l'échelle
    d'espacement **publiée**, et le §4 en confie la responsabilité à V66 — *laisser un score la
    contredire rendrait cette échelle décorative*. **Rien n'est exclu** : file de retard vide,
    les `SOON` puis `HEALTHY` remplissent le budget restant.
  - **LA RÈGLE 1, SEULE, A CASSÉ AUTRE CHOSE — et j'ai failli publier le beau chiffre.** Elle
    effondrait l'arriéré du 50 % de **61 à 6**… et faisait passer de **0 à 49** le nombre de
    notions rencontrées et **JAMAIS proposées** en 180 jours. **Un arriéré est un problème de
    capacité ; une notion jamais proposée est un défaut de correction.** Les deux ne se
    compensent pas.
  - **RÈGLE 2 — une séance n'est jamais intégralement composée de retard**, et la place est
    réservée aux seules fiches `UNKNOWN`. La raison est une **propriété, pas un réglage** :
    *une notion jamais mise à l'épreuve ne peut pas devenir « en retard » toute seule* — elle
    n'a pas d'échéance, donc rien ne la fera jamais monter. **C'est le seul statut qui peut
    mourir de faim** ; `SOON` et `HEALTHY` deviendront `DUE` d'eux-mêmes.
  - **DEUX VERSIONS DE LA RÈGLE 2 ÉCRITES, MESURÉES, ET LA PREMIÈRE JETÉE.** (a) réservation en
    DERNIÈRE position → **ne servait jamais**, car **le facteur limitant d'une séance n'est pas
    le plafond d'unités mais le BUDGET EN MINUTES** : *une réservation qu'on peut évincer n'en
    est pas une*. (b) réservation tôt mais ouverte à toute fiche non en retard → famine réglée,
    **mais arriéré revenu à son niveau d'avant** (60 contre 61) : *une place vaut le quart d'une
    séance de 20 minutes*. Retenue : **tôt, et réservée aux `UNKNOWN`**.
  - **BEFORE → AFTER (180 j, budget 20 min), y compris là où ça ne s'améliore pas** :
    arriéré au jour 180 **16→1** (90 %) · **41→22** (75 %) · **61→63** (50 %) ; retard p90
    **12→0** · **17→10** · **28→29** ; propositions sur notions à jour **44 %→30 %** ; places
    prises à une notion due **222→16** ; **notions jamais proposées 0→0** aux trois taux.
  - **L'APPRENANT À 50 % NE S'AMÉLIORE PAS, ET JE NE L'ARRONDIS PAS.** Deux mesures tranchent :
    (A) sur 365 jours, 90 % et 75 % **plafonnent** (1 et 21), 50 % **croît linéairement** —
    jamais exponentiellement — jusqu'à **102** ; (B) **tripler le budget ne divise pas l'arriéré
    par trois** : 63 → 53 → 43 → 48. Raison : *à 50 % d'échec, chaque notion servie revient le
    lendemain — servir plus crée mécaniquement plus de retours*. **Ce n'est donc pas un défaut
    d'ordonnancement mais un énoncé VRAI sur cet apprenant** : il absorbe du matériel nouveau
    plus vite qu'il n'en retient. La réponse appartient à l'ENTRÉE, donc au **CP10**.
  - **Ce qui aurait été malhonnête** : déplacer les seuils jusqu'à ce que le tableau du 50 %
    devienne joli (**G11**). `PLACES_DECOUVERTE = 1` est le minimum qui borne l'attente et le
    maximum qui ne rouvre pas le défaut corrigé — **pas le résultat d'un balayage**.
  - **« SEPT JOURS PARTOUT » : L'INTERDICTION EST TENUE, PREUVE PUBLIÉE.** Intervalles réalisés
    — 90 % : médiane **5**, max **56** (étalés) · 75 % : médiane **4**, **bimodale** · 50 % :
    médiane **1** (les échecs ramènent au départ). **C'est l'inverse de l'uniformité, et c'est
    le résultat attendu** — un espacement uniforme signalerait que le moteur ignore l'apprenant.
    Un test garde la propriété.
  - **La médiane du 90 % BAISSE de 11 à 5 jours, et ce n'est pas une régression** : avant, les
    notions étaient servies très en retard, ce qui gonflait les intervalles observés. *Un
    intervalle long obtenu parce qu'on a oublié de proposer la notion n'est pas un espacement,
    c'est une négligence.*
  - **AUCUNE ÉCHELLE NOUVELLE** : le CP8 ne définit aucun intervalle ; C11 reste verte. Il ne
    change que l'ORDRE DE SERVICE et l'ALLOCATION DES PLACES — le métier de l'arbitre.
  - **ANOMALIE DE SONDE n° 9** : le premier test de la règle 1 **passait avant comme après**,
    parce qu'avec des valeurs par défaut la fiche en retard a naturellement le meilleur score —
    **il mesurait une coïncidence de données, pas la règle**. Découvert parce qu'une mutation
    censée toucher deux tests n'en faisait rougir **qu'un**. Réécrit sur le cas discriminant,
    **avec une assertion qui garde le fait que le cas reste discriminant**.
  - **4 mutations VUES rougir** : tri score-d'abord (**2**), suppression de la place réservée
    (**4**), réservation en dernière position (**4**), réservation élargie (**1**).
  - **1521/1521 · tsc 0 · 46 portes vertes · corpus inchangé.**

- **CP7** — **après un échec, la réponse arrive en DERNIER. Sept marches, trois dérogations,
  et deux de mes propres chiffres corrigés.**
  - **`lib/remediation.mjs`** — pur, horloge injectée, ressources injectées. Il ne rédige
    **aucun contenu pédagogique** : comme le CP5, il produit une **consigne** et un **pointeur**
    vers une section réelle, un test réel ou un exercice réel.
  - **Pourquoi donner la réponse trop tôt est un défaut MESURABLE** : le contrat §1.4 (R-b) dit
    qu'une tentative postérieure à l'ouverture de la correction **ne vaut plus récupération**.
    Répondre à chaque échec par la solution ne se contente pas de mal aider — **cela détruit la
    seule mesure objective du produit**. Un test vérifie qu'**aucun chemin, y compris un repli
    pour matière manquante, n'ouvre la correction avant le niveau 5**.
  - **L'échelle, ordonnée par l'assistance donnée** : niveau 1 avec des tests qui passent →
    `SOUS_PROBLEME` (il avance, on le focalise) · niveau 1 avec zéro test → `MODELE_MENTAL`
    (c'est la forme du problème qui manque) · niveau 2 → `INDICE` · niveau 3 **avec**
    progression → `SOUS_PROBLEME` (on ne redescend pas l'échelle de quelqu'un qui progresse) ·
    niveau 3 **sans** progression → `EXEMPLE_ANALOGUE` · niveau 4 → `EXERCICE_PLUS_SIMPLE` ·
    niveau 5 → `CORRECTION_COMPLETE`.
  - **SUBSTRAT MESURÉ AVANT D'ÉCRIRE LA RÈGLE** — *une marche sans matière n'est pas une
    marche, c'est une décoration* : « Modèle mental » **128/128** · « Erreurs fréquentes »
    **128/128** · « Exemple guidé » **128/128** · « Correction attendue » **127/128** ·
    « Anti-patterns » **51/128** · voisin strictement plus simple **331/376** (médiane **7**
    candidats) · misconception nommant l'exercice **121/376** · **0 exercice sans test public**,
    **0 test sans nom**.
  - **AUCUN QUATRIÈME MOTEUR, AUCUN SECOND REGISTRE** : le module ne définit **aucune échéance
    de rappel** (il rend un *délai de reprise de séance* de 20 h, ce qui est autre chose —
    `INTERVALS` de V66 reste seule, règle C11) ; et **`lib/misconceptions.mjs` existait déjà**
    (57 entrées, 18 compétences, **0 référence fantôme**) — le CP7 la **consomme**. Rédiger sept
    indices sur mesure aurait été plus rapide que de brancher un registre existant.
  - **Le voisin plus simple n'est PAS le plus facile** : avec 7 candidats en médiane, tirer au
    hasard serait un aléa déguisé en pédagogie, et prendre le plus facile enverrait quelqu'un
    bloqué au niveau 4 vers un exercice de niveau 1. Règle : **la difficulté la plus haute
    strictement en dessous**, puis le plus de compétences communes, puis l'identifiant (B2).
  - **TROIS DÉROGATIONS, et leur ordre EST la décision.** **D1** — une tentative hors phase
    `run` **ne fait pas monter l'échelle** : sans cela, **trois points-virgules manquants
    suffiraient à faire donner la correction complète**. **D2** — correction déjà vue →
    `TENTATIVE_DIFFEREE` : proposer un indice à quelqu'un qui a la réponse sous les yeux est du
    théâtre. **D3** — **pilonnage** (≥ 4 échecs en ≤ 20 min) → report à 20 h ; *mais la
    dérogation s'arrête au niveau de la correction* — **le report ne doit pas devenir un moyen
    de ne jamais donner la réponse**, et c'est aussi ce qui interdit la boucle que le CP13 ira
    chercher.
  - **COUVERTURE EFFECTIVE DES MARCHES, publiée en nombres** : `MODELE_MENTAL` **184/376
    (49 %)** · `INDICE` **256/376 (68 %)** · `EXEMPLE_ANALOGUE` **184/376 (49 %)** ·
    `EXERCICE_PLUS_SIMPLE` **331/376 (88 %)** · `CORRECTION_COMPLETE` **376/376** ·
    **13/376 (3 %)** sans aucune marche adossée à une leçon ni à un voisin — pour ceux-là le
    `SOUS_PROBLEME` reste disponible.
  - **Les 49 % ne sont PAS un défaut du corpus** (les sections existent sur 128/128) : c'est le
    **rattachement exercice → leçon** qui plafonne à **184/376**. Je ne le corrige pas, et c'est
    délibéré — le corriger voudrait dire enrichir les `practiceRefs` **pour verdir une métrique
    de rétention**, ce que N1/N2 interdisent. Inscrit en **dette D8**.
  - **LA SONDE A CONTREDIT UN CHIFFRE DU CP1, ET C'EST LE CP1 QUI AVAIT TORT (anomalie n° 7).**
    En branchant le rattachement sur la **même fonction** que le produit (`leconUnique`, placée
    dans le module pur exprès pour que sonde et produit ne divergent pas), j'obtiens **140** là
    où le CP1 publiait **207**. La sonde du CP1 comptait les exercices déclarés par **au moins**
    une leçon ; la règle exige **exactement** une. **Le code n'a jamais changé** —
    `slugs.size !== 1` écartait déjà les 67 ambigus. **La décision en sort renforcée** : 236
    exercices à trancher arbitrairement, et non 169. Corrigé dans le contrat gelé, dans le
    commentaire du code et dans ce fichier — **la RÈGLE n'est pas touchée**.
  - **UN SECOND CHIFFRE À MOI CORRIGÉ (anomalie n° 8)** : « 52 portes », que j'ai repris du
    rapport de V73 et répété dans **cinq** entrées de ce journal, vaut **46** — et valait déjà
    46 à `b353ebd`. Aucune porte ne manquait et aucun verdict ne bouge (le critère est
    « 0 violation »), mais **c'était un nombre recopié au lieu d'être mesuré**.
  - **VINGT-SEPT TESTS PASSANT DU PREMIER COUP EST UNE RAISON DE SE MÉFIER** : quatre mutations
    ont donc été injectées et **vues rougir** — correction accessible au niveau 2 (**7 tests**),
    repli sautant à la correction (**1**), échec de compilation faisant monter l'échelle
    (**2**), voisin le plus facile au lieu du plus proche (**1**). Toutes restaurées.
  - **1509/1509 · tsc 0 · build OK · 46 portes vertes · corpus inchangé.**

- **CP6** — **une revue cesse d'être « relis ta semaine ». L'espacement médian passe de 1 à
  3 jours, sans toucher au plafond de charge.**
  - **`scripts/generate-curriculum.mjs`** — `lessonsDeLaRevue` ne rend plus une liste de
    fichiers mais des leçons **catégorisées** : `{file, categorie, raison}` avec
    `RECENT | SPACED | TRANSFER`. Le rendu affiche la raison en clair à côté de la leçon —
    **une revue sans raison visible n'apprend rien à l'apprenant sur POURQUOI il revoit ceci**.
  - **Deux places réservées aux leçons anciennes** (`PLACES_ANCIENNES = 2`) sous une condition
    dure : `ESPACEMENT_MIN_JOURS = 21`. Une leçon vue il y a moins de trois semaines n'est pas
    « espacée », et l'appeler ainsi serait le contournement **G4** (« jour vu récemment = jour
    maîtrisé », dans sa forme symétrique).
  - **Un historique `DERNIERE_REVUE` empêche la boucle** : une leçon déjà rappelée dans une
    revue antérieure ne peut pas revenir immédiatement. Sans cela, les mêmes deux leçons
    anciennes seraient réapparues dans les 46 revues — beaucoup de répétitions, aucune
    couverture.
  - **`WEAK` et `PREREQUISITE` sont VOLONTAIREMENT ABSENTS DU GÉNÉRATEUR, et la raison est
    écrite dans le code** : `WEAK` demande l'état de l'apprenant, or **le curriculum est
    statique et identique pour tous** — le fabriquer à la génération reviendrait à inventer une
    progression que personne n'a faite (interdiction « fabriquer progress.json »). Ces deux
    catégories relèvent de l'ARBITRE d'exécution (CP3/CP4), qui, lui, lit l'apprenant réel.
    `PREREQUISITE` a en plus un obstacle structurel : le graphe de prérequis de V73 est
    construit **à partir du curriculum généré** — l'utiliser pendant la génération serait une
    **dépendance circulaire**.
  - **BEFORE / AFTER MESURÉ, pas estimé** — sur les 52 revues :

    | mesure | BEFORE | AFTER |
    |---|---|---|
    | écart médian leçon → revue | **1 j** | **3 j** |
    | paires à 1 jour d'écart | 135 (**55 %**) | 121 (**39 %**) |
    | paires à 7 jours ou plus | 29 (**12 %**) | 114 (**37 %**) |
    | paires leçon × revue | 247 | **307** |
    | leçons anciennes ajoutées | 0 | **93** |
    | charge `L1 / L2 / L3` | `0 / 0 / 6` | `0 / 0 / 6` |
    | borne haute médiane d'une revue | 186 min | **188 min** |
    | borne haute maximale | 293 min | **295 min** |

  - **LE VOLUME AUGMENTE DE 24 % ET JE LE DIS PLUTÔT QUE DE L'ARRONDIR** : 247 → 307 paires.
    Le brief interdit « augmenter le nombre de reviews pour faire monter un score » (G12) — ce
    n'est pas ce qui se passe ici : **le nombre de revues reste 52**, le plafond de leçons par
    revue reste **7** et n'a pas été relevé, la charge mesurée est **identique au jour près**.
    Ce qui augmente, c'est le nombre de leçons ANCIENNES rappelées — c'est-à-dire exactement la
    propriété visée. **Mais l'augmentation est réelle et devait être publiée**, pas dissimulée
    derrière « à charge constante ».
  - **Le plafond de 7 est respecté sans exception** ; distribution effective des revues par
    nombre de leçons : `3 → 4 · 4 → 6 · 5 → 7 · 6 → 9 · 7 → 26`.
  - **Les 6 premières semaines ne changent PAS** : avant le jour 42, aucune leçon n'a 21 jours
    d'âge. **Le générateur ne fabrique rien pour remplir une case** — il rend moins de leçons
    quand il n'y en a pas d'anciennes, plutôt que d'abaisser le seuil pour que le tableau soit
    plein.
  - **Ce qui n'est PAS corrigé, et pourquoi ce n'est pas un échec du CP6** : les 39 % de paires
    encore à 1 jour viennent des **94 leçons sur 247 rattachées aux SIX journées de leur
    semaine** — mesure du CP0. Pour celles-là l'écart de 1 est **arithmétiquement inévitable**,
    quelle que soit la date de la revue. Le corriger exigerait de modifier le **rattachement
    des leçons** (défaut V73 `P1-CP13-1`), c'est-à-dire de toucher au curriculum pour verdir
    une métrique de rétention — **précisément ce que N1/N2 non bloquants interdisent**.
  - **1482/1482 · tsc 0 · 46 portes vertes · porte V73 verte · R1→R7 = 0 · corpus des leçons
    inchangé.**

- **CP5** — **douze archétypes de rappel, zéro invention.**
  - **`lib/retrieval-task.mjs`** — pur, sans I/O. **Règle absolue du module : une tâche cite
    une section RÉELLE de la leçon, ou elle n'existe pas.** Le module ne rédige aucun contenu
    pédagogique : il produit une **consigne** et un **pointeur** vers l'endroit où comparer.
    Le savoir reste dans les 128 leçons écrites par un humain.
  - **Douze archétypes** (le brief en demandait dix), chacun déclarant sa forme V66, les
    sections sans lesquelles il n'existe pas, son coût en minutes et où vérifier :
    `FREE_RECALL` · `FEYNMAN` · `CONCEPTUAL_QUESTION` · `PREREQUISITE_CHAIN` ·
    `PREDICT_BEFORE_RUN` · `MINI_IMPLEMENTATION` · `HARDER_IMPLEMENTATION` · `DEBUG` ·
    `SOLUTION_COMPARISON` · `TECHNICAL_DECISION` · `PARTIAL_RECONSTRUCTION` ·
    `BUSINESS_TRANSFER`.
  - **COUVERTURE RÉELLE MESURÉE SUR LES 128 LEÇONS, publiée en nombres et non arrondie** :
    `FREE_RECALL` 128 · `FEYNMAN` 128 · `PREREQUISITE_CHAIN` 128 · `DEBUG` 128 ·
    `BUSINESS_TRANSFER` 128 · `PREDICT_BEFORE_RUN` **120** · `MINI_IMPLEMENTATION` **110** ·
    `CONCEPTUAL_QUESTION` **101** · `PARTIAL_RECONSTRUCTION` **93** · `TECHNICAL_DECISION`
    **66** · `SOLUTION_COMPARISON` **51** · `HARDER_IMPLEMENTATION` **31**.
    **0 leçon sans aucun archétype · 5 formes sur 5 couvertes · médiane de 9 archétypes par
    leçon.**
  - **ANOMALIE DE SONDE n° 6, TROUVÉE ET PUBLIÉE** : deux motifs étaient **ancrés en début de
    chaîne** (`/^objectif/i`, `/^correction/i`). Or les titres du corpus commencent par un
    **émoji** — le titre réel est « 🎯 Objectif ». L'archétype **FEYNMAN sortait disponible
    sur 0 leçon sur 128** alors que ses deux sections existent sur les 128. **Un archétype à
    zéro aurait pu passer pour un constat de corpus ; c'était un défaut de motif.** Les motifs
    ne sont plus ancrés et l'émoji est retiré avant comparaison.
  - **Un test garde le piège** : « le titre réel commence par un émoji, et la reconnaissance ne
    s'y trompe pas ». Un autre garde l'essentiel : **aucun archétype ne doit être creux** —
    chacun doit avoir une couverture non nulle sur le corpus réel.
  - **1482/1482 · tsc 0 · 46 portes vertes · corpus inchangé.**

- **CP4** — **scheduler V1 : quoi, quand, sous quelle forme, dans quel budget.**
  - **`lib/retention-scheduler.mjs`** — pur, horloge injectée, **et il ne définit AUCUNE
    échelle d'espacement** : les paliers viennent de `INTERVALS` de V66, dont le contrat §4
    garde la responsabilité de la série. C'est un **arbitre**, pas un moteur.
  - **SM-2 étudié comme repère, puis écarté — trois raisons de produit** : (1) son facteur de
    facilité est un **flottant qui dérive**, réglé par une auto-évaluation, or le CP0 a montré
    que ce produit a **trop d'auto-déclaration** et manque de verdict objectif ; (2) il
    planifie une carte **toujours de la même façon**, alors qu'une compétence technique demande
    tantôt un rappel conceptuel, tantôt un diagnostic, tantôt du code ; (3) il ignore projet à
    venir, prérequis et budget de journée. **Ce qui est gardé** : réussite espace, échec ramène
    au début — ce que `INTERVALS` fait déjà, en entiers publiés plutôt qu'en flottant dérivant.
  - **La forme suit trois règles, et l'ordre EST la décision** : après un **échec** non repris,
    forme **soutenue** (`cued`) — *redemander une restitution libre à quelqu'un qui vient
    d'échouer, c'est le faire échouer deux fois* ; avant un **projet proche**, forme
    **appliquée** — *ce qu'on va devoir faire est ce qu'il faut répéter* ; sinon on **varie**,
    ce qui empêche de mémoriser la question au lieu du concept.
  - **Aucune forme n'est inventée** : `availableFormats` dit ce que la leçon rend possible. Une
    leçon sans section support n'est pas proposée — elle est **écartée en le disant**.
  - **`differes` est une SORTIE, pas un reliquat** : savoir ce qui a été écarté, et pourquoi,
    vaut autant que savoir ce qui a été retenu.
  - **Le budget est une contrainte, pas une variable d'ajustement** (G12) : un **plafond de 8
    unités** borne la session même quand le budget le permettrait.
  - **Les minutes par forme sont des ORDRES DE GRANDEUR DÉCLARÉS, pas des mesures** — aucune
    donnée d'apprenant n'existe pour les calibrer, et le contrat interdit de présenter un
    chiffre inventé comme mesuré. Configurables et publiés.
  - **B2 vérifié par trois tests** : sortie strictement identique à entrée identique · l'ordre
    d'entrée des fiches n'a aucun effet · aucune horloge implicite.
  - **C11 étendue à `lib/retention-scheduler.mjs`** ; la vérification de propriété ajoutée au
    CP3 continue de garantir qu'il **ne porte aucune échelle**.
  - **1470/1470 · tsc 0 · 46 portes vertes · corpus inchangé.**

- **CP3** — **priorité EXPLICABLE : sept facteurs additifs, bornés, publiés.**
  - **`lib/retention-priority.mjs`** — pur, horloge injectée. **Poids entiers dont la somme
    fait exactement 100**, vérifiée en test pour qu'aucune dérive silencieuse ne passe :
    ancienneté du rappel 30 · échec récent 20 · jamais tenté 15 · besoin proche 15 · niveau
    promis 10 · profondeur de prérequis 5 · contact passif 5.
  - **Additifs et bornés, délibérément** : pas de produit, pas d'exponentielle, pas de facteur
    de facilité flottant. On doit pouvoir dire « 40 points sur 100 viennent de ceci » sans
    dérouler un calcul. Un score qu'on ne peut pas décomposer n'a pas le droit d'exister ici.
  - **Le score n'est PAS une probabilité d'oubli** — le CP0 a déclaré cette grandeur
    UNMEASURABLE. C'est un **ordre de passage**, et il n'est jamais montré chiffré à
    l'apprenant (§9 du contrat interdit nommément « memory score = 0.637 »).
  - **B10 vérifié en test** : chaque unité proposée porte ses facteurs, leur valeur observée,
    leurs points, et une phrase lisible. **La justification cite AU PLUS deux facteurs** —
    au-delà, une justification cesse d'en être une et devient un rapport.
  - **G5 gardé par un test** : « récent » ne protège pas. L'ancienneté se compte depuis le
    dernier **rappel RÉUSSI**, pas depuis le dernier contact — avoir rouvert une page hier ne
    dit rien, avoir su la retrouver il y a trois semaines dit quelque chose.
  - **Deux signaux silencieux nommés** : « exposé mais jamais mis à l'épreuve » (rien n'échoue,
    donc rien n'alerte) et « travaillé mais jamais sans la réponse sous les yeux ».
  - **B2 amorcé** : le tri est TOTAL — score, puis statut, puis identifiant. Sans cette
    dernière clé, deux exécutions pourraient rendre deux ordres.
  - **UNE SONDE DE TEST CORRIGÉE, PUBLIÉE** : le test « au plus deux facteurs cités » découpait
    la phrase sur `', et '` — or la phrase de l'échec contient elle-même « , et ». **La sonde
    mesurait la ponctuation, pas la règle.** Les identifiants cités sont désormais exposés
    (`pourquoiFacteurs`) et c'est sur eux que porte le test.
  - **UNE PORTE A ROUGI, ET ELLE AVAIT RAISON — avec une erreur de méthode de ma part,
    publiée.** La règle **C11 de `v651:check`** interdit « un TROISIÈME moteur de répétition
    espacée » et a détecté `lib/retention-priority.mjs`. **J'avais poussé avant de voir le
    résultat** : j'avais lancé `gates:active` en redirigeant la sortie vers `/dev/null` et je
    n'ai lu que le code de retour, après le push. C'est une faute de séquence, pas de
    diagnostic.
  - **Ce que la règle mesure, et sa limite** : elle est écrite sur les **noms de fichiers**, et
    un nom ne distingue pas un MOTEUR d'un ARBITRE. Le contrat §4 place l'arbitre AU-DESSUS des
    deux moteurs — il les lit, il ne les remplace pas, et il ne définit ni échéance ni palier.
  - **La liste est étendue ET la règle est RENFORCÉE**, parce qu'étendre seul serait exactement
    ce que la méthode interdit — élargir un gate après avoir découvert ce qui échoue. Le
    renforcement porte sur la **propriété** plutôt que sur le nom : *hors des deux moteurs
    nommés, aucun fichier de `lib/` ne définit sa propre échelle d'espacement* (tableau
    d'intervalles, facteur de facilité, arithmétique SM-2). **La règle passe de 43 à 45
    vérifications.**
  - **Le renforcement a été VU rougir** : en injectant un `INTERVALS = [...]` dans l'arbitre,
    C11 échoue avec `aucune ÉCHELLE D'ESPACEMENT hors des deux moteurs nommés` ; la mutation
    restaurée, elle repasse au vert.
  - **1455/1455 · tsc 0 · 46 portes vertes · corpus inchangé.**

- **CP2** — **le fait qui manquait existe : `ExerciseAttempt`. Et le laboratoire écrit
  désormais la tentative, qu'elle réussisse OU NON.**
  - **`lib/exercise-attempt.mjs`** — le fait canonique, pur : normalisation, **issue DÉRIVÉE
    des compteurs** (un appelant qui mentirait n'a aucun effet), **producteur obligatoire**
    (un fait sans provenance est refusé, jamais réparé en silence), **clé métier**
    `exerciseId + seconde + passed/total` qui rend le rejeu idempotent, et le champ décisif
    **`correctionSeen`, vrai par défaut : le doute joue CONTRE le compteur**.
  - **`lib/learner-memory.mjs`** — la projection pure aux **deux grains** (128 concepts,
    20 compétences), horloge injectée. Elle applique littéralement le contrat : M1→M4 pour
    MEANINGFUL_CONTACT, **R-a/R-b/R-c** pour RETRIEVAL, et la règle « `partial` gèle la série ».
  - **`app/api/lab/[exerciseId]/route.ts`** — **la dette D1 et D2 du CP0 est payée** : la
    tentative est écrite AVANT toute projection, systématiquement. Il n'y a plus de branche
    manquante ; un exercice raté laisse désormais une trace.
  - **`lib/learner-memory-server.ts`** — le contexte curriculaire, **dérivé de
    `data/program.json` uniquement** (qui porte déjà `skills` et `practiceRefs`), sans lire
    `scripts/`. **Un exercice déclaré par plusieurs leçons n'est rattaché à AUCUNE** : le CP1
    a mesuré que choisir aurait exigé de trancher entre 3 leçons en médiane, jusqu'à 15.
  - **Critère bloquant B1 vérifié en test** : deux appels identiques rendent une **égalité
    stricte**, et **l'ordre d'insertion des faits n'a aucun effet**. Deux tests indépendants.
  - **20 tests V74 ajoutés**, dont ceux qui gardent les contournements interdits : `done`
    n'est pas un contact significatif (**G2**), une preuve non validée ne compte pas (**G8**),
    une correction ouverte avant disqualifie la récupération (**R-b**), et la deuxième
    tentative du même exercice le même jour n'est pas un rappel (**R-c**).
  - **Une régression de forme assumée** : `tests/progress-store.test.mjs` gelait la forme de
    la progression vide. `exerciseAttempts: []` s'y ajoute — **liste vide, jamais absente**,
    sans quoi « aucune tentative » et « aucun échec observable » resteraient indiscernables.
    Le test est mis à jour avec sa raison, pas contourné.
  - **1440/1440 · tsc 0 · build OK · 46 portes vertes · corpus `92d5fae6…` inchangé ·
    `progress.json` absent.**

- **CP1** — **contrat gelé. Aucun fichier de produit modifié.**
  - La décision qui commande tout le sprint : **`ExerciseAttempt` devient un fait canonique**,
    parce que *le système persiste la projection et jette le fait*. Quand l'exercice échoue, il
    n'y a pas de projection à écrire — donc rien n'est écrit. C'est la cause exacte du constat
    CP0 « le système n'a jamais observé un échec ».
  - **Une mesure a tranché l'option C** : 207/376 exercices sont rattachables à un concept par
    déclaration ; les 169 autres ont une médiane de **3** leçons candidates, jusqu'à 15.
    L'équivalence automatique exercice → rappel est donc **refusée**, remplacée par la règle
    qualifiée `DERIVED_RECALL` à quatre conditions.
  - **Les cinq statuts sont déclarés SANS rapport avec une probabilité de mémoire** — ce sont
    des états de planification, et le contrat l'écrit en tête de section.
  - **Les trois mécanismes existants reçoivent des responsabilités disjointes** plutôt qu'une
    fusion : l'arbitre est au-dessus. Pas de quatrième moteur.
  - **N1/N2 (l'espacement) sont NON bloquants, délibérément** : la cause dominante mesurée au
    CP0 est un défaut de curriculum, pas du moteur ; les rendre bloquants pousserait V74 à
    modifier le curriculum pour verdir une métrique — contournement G12.

- **CP0** — **audit forensique, lecture seule. Aucun fichier de produit modifié.**
  - **LE FAIT QUI CHANGE LE CADRAGE : un Retention Engine EXISTE DÉJÀ depuis V66 et il est
    branché au produit** — `lib/retention.mjs` (526 l.), `/retention` « Réactivation » dans la
    nav, `RecallStation`, commande `RECORD_RECALL`, persistance `recallAttempts`. C'est un
    **Leitner honnête** : un seul fait écrit, tout le reste projeté, rejouable. **V74 étend,
    ne réinvente pas.** Ce qu'il ignore : les 376 exercices, le registre de preuves, les
    échecs, les projets, les 52 revues, `expectedScores`, la profondeur de prérequis, la
    proximité d'un projet. **L'échéance ne dépend que du nombre de réussites consécutives.**
  - **TROIS MÉCANISMES SANS ARBITRE** : `lib/review.mjs` (V19, SM-2 par JOURNÉE, piloté par la
    compréhension DÉCLARÉE, page `/revisions`) · `lib/retention.mjs` (V66, Leitner par
    CONCEPT, piloté par les tentatives réelles, page `/retention`) · les 52 revues du
    curriculum (par SEMAINE, générées). Trois grains, trois sources, trois pages.
  - **LE SYSTÈME N'A JAMAIS OBSERVÉ UN ÉCHEC** — trois lignes de code le prouvent :
    `if (attempt.allPassed)` **sans branche else** (un exercice raté n'écrit rien) ; un
    exercice réussi écrit une PREUVE mais **jamais `RECORD_RECALL`** ; et `RECORD_ATTEMPT`
    n'est appelé qu'à un endroit avec `outcome: 'attempted'` **en dur**. *Un modèle d'oubli
    branché sur des données qui n'enregistrent jamais l'oubli ne mesurera jamais rien.*
  - **78 % DE TOUS LES INTERVALLES ENTRE CONTACTS VALENT UN JOUR** (647/828 au grain
    compétence, 785/1068 au grain concept). Seuls **13 intervalles sur 828 dépassent 60 jours**.
    Le défaut V73 « médiane 1 jour sur 15 compétences » n'était que **la partie visible**.
  - **POURQUOI LA MÉDIANE VAUT 1 — décomposition nominative** : 135/247 paires leçon×revue ont
    la leçon liée au **jour 6, la veille** (j7 révise `javascript-basics` vu en j6) ; et
    **94/247 leçons sont liées aux SIX journées de leur semaine**, ce qui rend l'écart de 1
    **inévitable quelle que soit la date de la revue**. **Le terme dominant n'est PAS le
    calendrier hebdomadaire mais le rattachement des leçons** — le défaut `P1-CP13-1` de V73.
    **Déplacer les revues ne corrigerait rien.**
  - **`exposition → première pratique` vaut ZÉRO sur 19 compétences sur 20** : la première
    journée qui porte la notion est déjà une journée d'exercice.
  - **LE RAPPEL LIBRE EXISTE SUR 52 JOURNÉES SUR 365, ET SUR AUCUNE JOURNÉE DE TRAVAIL.**
  - **Inventaire de l'état apprenant, LU dans le code** : AVAILABLE (status, horodatages,
    compréhension **déclarée**, `correctionState`, `review` SM-2, `evidence[]` avec validation
    **vérifiée**, `recallAttempts[]`, `skills{}`) · DERIVABLE (9 champs, sans écriture
    nouvelle) · MISSING (5, dont l'`outcome` typé et le rattachement exercice → concept) ·
    UNMEASURABLE (probabilité de mémoire, setup, effort ressenti, transfert professionnel).
  - **Les 7 questions du brief** : 2 « oui », 2 « partiellement », **3 « non »** (durée d'une
    réactivation, choix relire/rappeler/produire/diagnostiquer/appliquer, preuve d'utilité).
  - **3 anomalies de sonde publiées** (§12 du rapport).
