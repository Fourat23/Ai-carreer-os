# V77.1 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption :
> relire ce fichier, vérifier Git, reprendre au CP indiqué. **NE PAS refaire un
> CP terminé.**
>
> **V77 est terminé.** NE PAS refaire V77, NE PAS refaire son CP0, NE PAS
> reconstruire les moteurs, NE PAS toucher au curriculum.
>
> **V77.1 est volontairement PETIT, CIBLÉ et FERMÉ.** Il ne doit pas devenir V78.
> **Aucun participant humain n'est recruté pendant ce sprint.**

## Position

| | |
|---|---|
| `REPO` | `Fourat23/Ai-carreer-os` (**deux `r`**) |
| `BRANCH` | `claude/ai-career-os-saas-phfg49` |
| `LAST_COMPLETED_CP` | **CP3** |
| `CURRENT_CP` | — |
| `NEXT_CP` | **CP4** — RÉPÉTITION À BLANC (DONNÉES SYNTHÉTIQUES) |
| `NEXT_ACTION` | traverser la boucle complète **sans humain** : `PRETEST` → `LESSON` → `EXERCISE_FAIL` → `HINT` → `RETRY` → `SUCCESS` → `IMMEDIATE_RETRIEVAL` → délai → `DELAYED_RETRIEVAL` → `TRANSFER` → `CONFUSION_REPORT` → `SESSION_EXPORT`. Vérifier pour chaque étape : fait, horodatage, session, `protocolVersion`, concept, provenance, résultat, **aucun doublon**. Prouver que le délai est imposé par l'**horloge serveur** (un horodatage client ne suffit pas). Tester l'**effet d'observation**. Vérifier que l'export de session suffit à **reconstruire sans deviner**. **Lever le risque `R8`** : `/retention` propose-t-elle le concept focal ? |

## Repères Git

| | |
|---|---|
| `HEAD` au début de V77.1 | `ad567b0` (fin V77) |
| `ORIGIN_HEAD` | à re-vérifier après chaque push |
| `WORKING_TREE` | propre · aucun serveur résiduel |
| `PUSH_STATE` | local == origin |

## `BASELINE` — mesurée au CP0, pas recopiée

| mesure | valeur |
|---|---|
| `npm test` | **2177 / 2177** |
| `npx tsc --noEmit` | **0** |
| `npx next build` | **OK** |
| `gates:active` | **50 portes, 0 violation** |
| `v74` `v75` `v76` `v77` | ✅ ✅ ✅ ✅ |
| `v73:check` | **INEXISTANT** — ne pas l'inventer |
| `data/progress.json` | **absent** |

## `FINDINGS` — CP0

| # | constat | gravité |
|---|---|---|
| `F1` | **le verdict V77 `UNIFIED` ne figure PAS dans le contrat gelé** du CP1, qui fixe une échelle à 4 valeurs et impose `READY` si `O1`–`O20` sont atteints | **haute** |
| `F2` | **`O1` n'est PAS atteint** : `lib/practice-model.mjs` n'est importé par **aucun** code produit — seulement la porte et 2 tests | moyenne |
| `F3` | **`O18` est PARTIEL** : l'export couvre les 9 faits, mais `reset` crée un instantané qui les conserve tous | moyenne |
| `F4` | **aucune route `DELETE ALL` n'existe** ; `app/api/progress/` = `export`, `import`, `reset` | **haute** |
| `F5` | l'interface dit « Efface **toute** ta progression […] **irréversible** » **et** « sauvegardé automatiquement » — dans le même bloc | **haute** |
| `F6` | l'interface dit « Télécharge **toutes tes données locales** » — **faux** : les journaux de laboratoire, qui contiennent le **code de l'apprenant**, ne sont pas exportés | **haute** |
| `F7` | `reset` conserve `lab-journals/` (code apprenant) et `lab-workspaces/` — délibéré (V76 · CP10), mais non dit | moyenne |

## `SCOPE GELÉ` — CP3

| | |
|---|---|
| `SCOPE_ID` | **`V78-SCOPE-HTTP-PRODUCTION`** |
| fixture | `data/pilot/v78-pilot-1.json` |
| concept focal | `api-production-contracts` (lu, pratiqué, rappelé) |
| prérequis | `networking-http-tls` (PRETEST seulement) |
| cibles de transfert | `authentication` (principal) · `async-messaging-queues` (secours) |
| exercices retenus | `http-rate-limit-decide` (d3, PRINCIPAL) · `api-pagination-choice` (d2, SECOURS) |
| exercices écartés | **5**, tous `MULTI_CONCEPT_BY_DESIGN` — **aucun résolu** |
| transfert | `throttling-everywhere` (T5, crossDomain, seuil 0,7) |
| repli | `V78-SCOPE-ALGO` — `algorithmic-thinking`, 5 exercices exclusifs, 5 formats |
| `PRETEST_HIGH` | 2 sur 2 `recalled` → repli ; si le repli plafonne → `INVALID` |
| `MISSING_PREREQUISITE` | 0 sur 2 `recalled` → `INVALID` |

## `PILOT_SCOPE_CANDIDATES` — CP0.D *(remesurés au CP3, voir ci-dessus)*

| | A · `api-production-contracts` | B · `algorithmic-thinking` | C · `javascript-basics` |
|---|---|---|---|
| niveau | 3 | 1 | 1 |
| exercices non ambigus | 4 (`d2`–`d3`) | 5 (`d1`–`d4`) | 4 (`d1`–`d2`) |
| formats de rappel | 2 | **5** | 4 |
| transfert | `idempotence-http-to-queue` | `greedy-is-not-optimal` | `stale-value-in-async` |
| risque de plafond au PRETEST | **faible** | moyen | **élevé** |
| **recommandation CP0** | **candidat principal** | repli | écarté |

## `DECISIONS GELÉES` — CP1

| champ | valeur |
|---|---|
| `PROTOCOL_VERSION` | `V78-PILOT-PROTOCOL-1` |
| `PRIMARY_OUTCOME` | `SESSION_TRACE_RECONSTRUCTABILITY` (un seul) |
| `DELAYED_RETRIEVAL_DELAY` | **24 h**, fenêtre `[18 h, 36 h]`, horloge **serveur** |
| `PARTIAL_AFTER` | 72 h |
| `PARTICIPANTS` | cible 3 · min 1 · max 5 |
| `V77_ENGINEERING_VERDICT_CANONICAL` | **`PRACTICE_OBSERVABILITY_NOT_READY`** — `O1` non atteint, `O18` partiel, application littérale de l'échelle gelée |
| `HUMAN_AXIS` | `REAL_HUMAN_LEARNING_EVIDENCE_NOT_MEASURED` — **inchangé, et ne peut pas changer en V77.1** |

## `TESTS_RUN`

**CP0** — `npm test` **2177/2177** · `tsc` **0** · `build` **OK** ·
`gates:active` **50 portes, 0 violation** · `reset` traversé en HTTP réel ·
`data/progress.json` **absent**.

**CP1** — aucun test lancé : le CP1 **gèle**, il n'implémente pas. Une seule
vérification, une ligne : les importeurs de `lib/practice-model.mjs` →
**aucun code produit** (confirme `O1` non atteint).

**CP3** — `npm test` **2231/2231** (2213 + 18) · `tsc` **0** · `build` **OK** ·
`gates:active` **50 portes, 0 violation** · mesure de scope publiée
(`docs/v77-1/cp3-scope.json`) · `data/progress.json` **absent**.

**CP2** — `npm test` **2213/2213** (2177 + 36) · `tsc` **0** · `build` **OK** ·
`gates:active` **50 portes, 0 violation** · **traversée HTTP réelle** de
`export`, `export-all`, `delete-all` (refus sans confirmation, refus sur
minuscule, suppression effective des 4 catégories, curriculum intact) ·
`data/progress.json` **absent**.

## `FILES`

**CP0** — **créés** `docs/v77-1/V77-1-CP0-PRE-PILOT-FORENSICS.md`,
`docs/v77-1/V77-1-STATE.md`. **Aucun fichier de produit modifié** — le CP0 est en
lecture seule.

**CP1** — **créé** `docs/v77-1/V77-1-PILOT-CONTRACT-FROZEN.md`. **Aucun fichier
de produit modifié.** `docs/v77/V77-FINAL-REPORT.md` **délibérément non
réécrit** : il porte `UNIFIED`, le CP1 porte la correction et sa raison.

**CP2** — **créés** `lib/learner-data.mjs` · `.d.ts` · `lib/learner-data-fs.mjs`
· `.d.ts` · `lib/learner-data-server.ts` · `app/api/progress/delete-all/route.ts`
· `app/api/progress/export-all/route.ts` · `tests/v771-learner-data.test.mjs`
(22) · `tests/v771-data-rights-ux.test.mjs` (14) ·
`docs/v77-1/V77-1-CP2-DATA-RIGHTS.md` · `docs/v77-1/V78-DATA-RIGHTS.md`.
**Modifiés** `app/api/progress/reset/route.ts` (rend sa portée, comportement
inchangé) · `app/settings/SettingsPanel.tsx` (wording + suppression totale) ·
`app/globals.css` · `lib/progress-server.ts` (`progressSnapshotPath`) ·
`lib/workspace-server.ts` (`workspacesRoot`) · `lib/attempt-journal-server.ts`
(`journalsRoot`). **Format de sauvegarde NON touché.**

**CP3** — **créés** `data/pilot/v78-pilot-1.json` (fixture gelée) ·
`lib/pilot-scope.mjs` · `.d.ts` · `lib/pilot-scope-server.ts` ·
`scripts/v77-1/cp3-scope.mjs` · `docs/v77-1/cp3-scope.json` ·
`tests/v771-pilot-scope.test.mjs` (18) ·
`docs/v77-1/V77-1-CP3-PILOT-SCOPE-FROZEN.md`. **Modifié** `lib/learner-data.mjs`
(`data/pilot` protégé de la suppression). **Curriculum NON touché** ·
`data/exercise-declarations.json` **toujours vide**.

## `COMMITS`

| CP | sujet |
|---|---|
| CP0 | `0458f30` — le verdict V77 a été inventé après coup |
| CP1 | `94935a7` — le contrat gelé, et V77 remis sur son échelle |
| CP2 | `c956ed3` — réinitialiser n'est pas supprimer |
| CP3 | *(ce commit)* — le scope gelé, et « non ambigu » remesuré |

## Journal des CP

- **CP0** — **le verdict de V77 ne figurait pas dans sa propre échelle gelée.**
  - Le contrat du CP1 de V77 gèle **quatre** valeurs et impose `READY` si
    `O1`–`O20` sont atteints. **`UNIFIED` n'y apparaît nulle part.** Ce n'est ni
    un affaiblissement ni un renforcement : c'est un **contournement de
    l'échelle**, et un label hors échelle est incomparable.
  - **Audit `O1`–`O20` refait** : `O1` **non atteint** (la carte canonique n'est
    lue par aucun code produit), `O18` **partiel** (l'instantané de secours
    conserve les faits que `reset` efface). Les 18 autres sont atteints.
  - **`DELETE ALL` n'existe pas**, et l'interface promet pourtant une
    suppression « irréversible » de « tout » — dans le même bloc qui annonce une
    sauvegarde automatique.
  - **L'export dit « toutes tes données locales » et c'est faux** : le code de
    l'apprenant (`lab-journals/`) n'y est pas. La phrase se contredit d'ailleurs
    elle-même, annonçant « toutes » puis énumérant un sous-ensemble.
  - **Trois scopes candidats** pour le pilote, avec un critère décisif : le
    plafond au PRETEST est le seul risque qui **invalide** un pilote. D'où
    `api-production-contracts` en principal, `algorithmic-thinking` en repli.

- **CP1** — **le contrat est gelé avant la première donnée humaine.**
  - **`V77` est `PRACTICE_OBSERVABILITY_NOT_READY`** par application littérale de
    l'échelle gelée. `CANDIDATE` a été **refusé** : il exigerait de lire `O1`
    comme « existe » en laissant tomber « et est lue par le produit » **après
    avoir vu le résultat** — c'est `H14`. L'échelle n'a pas de case pour « tout
    atteint sauf un critère de définition » ; c'est un défaut de l'échelle,
    constaté, **et non corrigé après coup**.
  - **Rien n'a été fait pour rattraper le verdict** : la carte n'a pas été
    branchée dans du code produit, le rapport de V77 n'a pas été réécrit.
  - **Un seul outcome primaire** — `SESSION_TRACE_RECONSTRUCTABILITY`, binaire
    par session, jugé par quelqu'un qui n'a pas assisté à la session, à partir
    du **seul export**. Cinq candidats écartés, chacun avec sa raison.
  - **Aucun seuil de succès n'a été fixé.** Un seuil posé avant toute idée de la
    distribution ne sert qu'à permettre de déclarer victoire.
  - **Le délai de rappel n'est pas inventé** : `INTERVALS[0] = 1 jour` dans
    `lib/retention.mjs`. Le pilote observe la boucle **telle que le produit la
    planifie déjà**.
  - **Cinq exploratoires portent chacun leur interdiction de conclusion**, pour
    rendre visible toute promotion en résultat.

- **CP2** — **réinitialiser n'est pas supprimer, et l'interface le dit enfin.**
  - `F5` et `F6` n'étaient pas des bugs mais **deux phrases fausses**. Le
    comportement de `reset` est **inchangé** (V76 · CP10 tient) ; seul le mot a
    été corrigé.
  - **Une carte des données est la source** (`lib/learner-data.mjs`) : quatre
    catégories, quatre opérations. `couvreToutesLesDonnees()` décide qui a le
    **droit** de dire « toutes mes données » — `deleteAll` et l'archive, pas
    `reset`, pas la sauvegarde. Un test rougit si l'interface diverge.
  - **`POST /api/progress/delete-all`** supprime réellement les 4 catégories,
    **sans aucun filet**, et exige `{"confirmation":"SUPPRIMER"}` — la
    minuscule est refusée.
  - **Deux verrous contre la catastrophe** : `data/` **contient le curriculum**.
    La suppression ne connaît que 4 chemins nommés un par un, et un garde-fou
    **refuse le plan entier** — donc ne supprime **rien** — s'il vise le
    produit. Comparaison par **segments** : `/a/data` n'est pas le parent de
    `/a/database`.
  - **`GET /api/progress/export-all`** : une seconde route, pas un champ de plus
    dans la sauvegarde — le format restaurable n'a pas été remué à la veille
    d'un pilote.
  - **Vérifié en HTTP réel** : suppression effective sur le disque, curriculum ·
    exercices · leçons · code source **intacts**, archive rejouée après
    suppression → vide.

- **CP3** — **« non ambigu » ne voulait pas dire la même chose au CP0 et au CP1.**
  - Dans ce produit **un concept EST une leçon**. Un exercice déclaré par
    plusieurs leçons se résout en **plusieurs** concepts (`R2`) — ce n'est pas un
    défaut, mais pour CE protocole sa trace ne dit pas lequel a été pratiqué.
  - Sous la règle stricte « un seul déclarant », `api-production-contracts`
    tombe de **4 à 2** exercices ; `algorithmic-thinking` en a **5**.
    `api-production-contracts` reste focal quand même : plafond au PRETEST plus
    faible, et **chaîne exercice → transfert directe** (`http-rate-limit-decide`
    → `throttling-everywhere`, même notion, autre domaine).
  - **Quatre concepts, chacun sur une étape différente** : c'est ce qui rend
    « 3 à 6 concepts » compatible avec une séance courte — une seule leçon est
    lue.
  - **Aucune ambiguïté résolue.** 125 avant, 125 après.
    `data/exercise-declarations.json` reste vide, et un test le garde.
  - **Une limite du primaire déclarée d'avance** : l'étape `LESSON` ne laisse
    aucun fait (surface de lecture, `NO_FACT` par contrat V77), donc la
    reconstruction ne prouvera jamais que la leçon a été lue.
  - **Risque `R8` ouvert pour le CP4** : `/retention` sert le plan du jour ; un
    participant partant de zéro pourrait ne pas y voir le concept focal.
