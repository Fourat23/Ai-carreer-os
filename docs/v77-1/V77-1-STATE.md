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
| `LAST_COMPLETED_CP` | **CP1** |
| `CURRENT_CP` | — |
| `NEXT_CP` | **CP2** — DROITS SUR LES DONNÉES |
| `NEXT_ACTION` | distinguer `RESET LEARNING PROGRESS` de `DELETE ALL LOCAL LEARNER DATA` ; **implémenter et tester réellement sur disque** la suppression totale des données appartenant à l'apprenant (progression, instantané, `lab-workspaces/`, `lab-journals/`) **sans jamais toucher** au curriculum, aux leçons, aux définitions d'exercices, aux corrigés ni au code source ; rendre l'export honnête (Option A = complet, ou Option B = nommé exactement) ; documenter les droits sur les données. Utiliser les mesures **réelles** du CP0.B / CP0.C, ne pas re-mesurer. |

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

## `PILOT_SCOPE_CANDIDATES` — CP0.D

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

## `FILES`

**CP0** — **créés** `docs/v77-1/V77-1-CP0-PRE-PILOT-FORENSICS.md`,
`docs/v77-1/V77-1-STATE.md`. **Aucun fichier de produit modifié** — le CP0 est en
lecture seule.

**CP1** — **créé** `docs/v77-1/V77-1-PILOT-CONTRACT-FROZEN.md`. **Aucun fichier
de produit modifié.** `docs/v77/V77-FINAL-REPORT.md` **délibérément non
réécrit** : il porte `UNIFIED`, le CP1 porte la correction et sa raison.

## `COMMITS`

| CP | sujet |
|---|---|
| CP0 | `0458f30` — le verdict V77 a été inventé après coup |
| CP1 | *(ce commit)* — le contrat gelé, et V77 remis sur son échelle |

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
