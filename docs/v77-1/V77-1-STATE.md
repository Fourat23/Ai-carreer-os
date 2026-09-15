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
| `LAST_COMPLETED_CP` | **CP0** |
| `CURRENT_CP` | — |
| `NEXT_CP` | **CP1** — CONTRAT DE PILOTE GELÉ |
| `NEXT_ACTION` | écrire `docs/v77-1/V77-1-PILOT-CONTRACT-FROZEN.md`. Geler AVANT toute donnée humaine : question principale (**observabilité de la boucle**, pas efficacité), hypothèses `H1`–`H7`, **UN** outcome primaire, outcomes secondaires limités, exploratoires séparés, **délai de rappel**, règles d'arrêt, règles de donnée manquante. Et **remettre le verdict V77 sur l'échelle gelée au CP1 de V77** — `UNIFIED` n'y figure pas. |

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

## `TESTS_RUN`

**CP0** — `npm test` **2177/2177** · `tsc` **0** · `build` **OK** ·
`gates:active` **50 portes, 0 violation** · `reset` traversé en HTTP réel ·
`data/progress.json` **absent**.

## `FILES`

**CP0** — **créés** `docs/v77-1/V77-1-CP0-PRE-PILOT-FORENSICS.md`,
`docs/v77-1/V77-1-STATE.md`. **Aucun fichier de produit modifié** — le CP0 est en
lecture seule.

## `COMMITS`

| CP | sujet |
|---|---|
| CP0 | *(ce commit)* — le verdict V77 a été inventé après coup |

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
