# V77 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption :
> relire ce fichier, vérifier Git, reprendre au CP indiqué. **NE PAS refaire un
> CP terminé. NE PAS reconstruire l'état depuis la conversation** — Git, ce
> fichier et les artefacts persistés font foi.
>
> **V76 est terminé** — verdicts `PRACTICE_WORKBENCH_READY` et
> `HUMAN_PRACTICE_EFFICACY_NOT_MEASURED`, rapport
> `docs/v76/V76-FINAL-REPORT.md`. **NE PAS refaire V76. NE PAS reconstruire le
> Workbench, le bac à sable, le Retention Engine ni l'Adaptive Recovery Engine.
> NE PAS retoucher le curriculum.**

## Position

| | |
|---|---|
| `REPO` | `Fourat23/Ai-carreer-os` (**deux `r`**) |
| `BRANCH` | `claude/ai-career-os-saas-phfg49` |
| `LAST_COMPLETED_CP` | **CP0** |
| `CURRENT_CP` | — |
| `CURRENT_BATCH` | — |
| `NEXT_CP` | **CP1** — CONTRAT D'OBSERVABILITÉ GELÉ |
| `NEXT_ACTION` | écrire `docs/v77/V77-PRACTICE-OBSERVABILITY-CONTRACT-FROZEN.md` : geler le vocabulaire (`ACTIVITY`, `ATTEMPT`, `SUBMISSION`, `ARTIFACT`, `ASSESSMENT`, `VALIDATION`, `EVIDENCE`, `EXTERNAL_EVIDENCE`, `DECLARED`/`OBSERVED`/`VALIDATED`, `PROJECT_MILESTONE`, `TERMINAL_ACTION`, `SIMULATED_ACTIVITY`), la règle **`NO_FACT` par défaut** avec justification par surface, les règles de conception d'événement, et les critères de verdict **avant** toute modification |

## Repères Git

| | |
|---|---|
| `HEAD` au début de V77 | `56d852b` (fin V76) |
| `ORIGIN_HEAD` | à re-vérifier après chaque push |
| `WORKING_TREE` | propre · stash vide · aucun serveur résiduel |
| `PUSH_STATE` | local == origin |

## `BASELINE_METRICS` — recomptées au CP0, pas recopiées

| mesure | valeur | note |
|---|---|---|
| exercices | **376** | conforme |
| tests d'exercice | **1 357** | conforme |
| runtimes | **6** | conforme |
| tests applicatifs | **1 984** | conforme |
| portes `gates:active` | **49** | conforme |
| sondes de sécurité V76 | **16 / 16 contenues** | conforme |
| `v74:check` `v75:check` `v76:check` | ✅ ✅ ✅ | conformes |
| `v73:check` | **INEXISTANT** | le brief le suppose ; il n'a jamais existé ici |
| `data/progress.json` | **absent** | conforme |
| surfaces (routes + API) | **36** | *le brief en annonçait 11* |
| surfaces de pratique | **12** | agissantes, contenu à l'appui |
| assessments · capstones · missions | 16 · 13 · 42 | |
| terminal · pipelines · sécurité · manifestes · topologies · architectures | 3 · 3 · 4 · 3 · 3 · 8 | |
| playbooks | 45 | contenu, pas pratique |
| exercices `AMBIGUOUS` | **125** / 376 | cause unique : `R5` |

## `FROZEN_DECISIONS`

*(vide jusqu'au CP1 — c'est le CP1 qui gèle)*

## `OPEN_DEBTS` — mesurées au CP0

| # | dette | mesure |
|---|---|---|
| `D1` | **double comptage inter-surfaces** : un exercice résolu valide un livrable de mission ; les deux preuves portent la même compétence canonique | sonde `A13` : `exercise:react-search [jsts]` + `mission:… [jsts]` |
| `D2` | **une mission écrit `passed` sur une auto-validation** | 42/42 missions ont un livrable `review` auto-validé |
| `D3` | **un document faux mais bien structuré passe** | sonde `A9` : `structure ok: true` sur un texte délibérément mauvais |
| `D4` | **la preuve de capstone est dégradée en `self`** | `capstone-grade` absent de `VALIDATION_KINDS` → repli `self` |
| `D5` | **`capstone-review` n'est plus produit que par la migration héritée** | les vieilles preuves sont mieux étiquetées que les neuves |
| `D6` | **un assessment échoué 5× laisse 1 trace** | sondes `A7`/`A8` — aucun `AssessmentAttempt` |
| `D7` | **six surfaces calculent et ne gardent rien** | `A1`–`A6` : 200, résultat substantiel, 0 octet écrit |
| `D8` | **aucun niveau de confiance sur les preuves** | 5 tests en bac à sable et un clic portent le même `passed` |
| `D9` | **la marque de simulation vit dans du texte libre** | `detail`, pas un champ ; rien ne la garde |
| `D10` | **125 exercices sans rattachement** | cause : aucun `conceptIds`/`lessonRefs` dans la source |
| `D11` | `placeholder` est un terme du domaine traité comme un marqueur de remplissage | `PLACEHOLDER_RE` |

## `PROBE_ERRORS`

| # | anomalie | correction |
|---|---|---|
| **n° 1** | ma sonde `A9` employait le mot « placeholder » comme terme du domaine ; le validateur le classe comme texte de remplissage. J'en avais conclu que la structure était refusée à juste titre — c'était faux | mot remplacé, conclusion du §4.2 confirmée · le défaut produit est consigné (`D11`) |
| *(corrigées avant publication)* | identifiant de scénario sécurité erroné (404), corps de requête terminal erroné (400), déclencheur de pipeline erroné (`skipped`) | trois mesures refaites avec les bons paramètres |

## `SECURITY_STATE`

**16 / 16 sondes contenues** (rejouées au CP0). `SEC3` reste **partiel** en
Python, déclaré tel quel. V77 ne doit rien dégrader : la porte `v76:check`
(79 vérifications) reste dans `gates:active`.

## `TESTS_RUN` au CP0

`npm test` **1984/1984** · `tsc` **0** · `build` **OK** ·
`gates:active` **49 portes, 0 violation** · sécurité **16/16**.

## `FILES` — CP0

**Créés** : `scripts/v77/cp0-practice-forensics.mjs` (inventaire statique),
`scripts/v77/cp0-observability-probe.mjs` (13 sondes en direct),
`docs/v77/V77-CP0-PRACTICE-COVERAGE-FORENSICS.md`, `docs/v77/V77-STATE.md`,
`docs/v77/cp0-inventory.json`, `docs/v77/cp0-observability.json`.
**Aucun fichier de produit modifié** — le CP0 est en lecture seule.

## `COMMITS`

| CP | sujet |
|---|---|
| CP0 | *(ce commit)* |

## Journal des CP

- **CP0** — **la phrase de départ du brief était fausse, dans les deux sens.**
  - Le brief reprend la conclusion de V76 : « 11 surfaces, 2 écrivent un fait ».
    **`assessments` et `capstones` écrivent déjà** une preuve depuis V65 ; et le
    disque porte **36 surfaces**, dont **12** où l'on agit vraiment. Recopier la
    phrase aurait fait combler des trous inexistants pendant que les vrais
    restaient ouverts.
  - **Cinquième sprint d'affilée où la chose à construire existe déjà,
    débranchée** : six surfaces (`terminal`, `kubernetes`, `cloud-lab`,
    `cloud-foundations`, `security`, `pipelines`) **valident, analysent ou
    exécutent réellement** — et n'écrivent pas un octet.
  - **LE DÉFAUT PRINCIPAL N'EST PAS UN TROU, C'EST UN MENSONGE DE NOMMAGE.**
    Mesuré de bout en bout : un exercice résolu + un document délibérément faux
    + un clic d'auto-validation produisent **deux preuves qualifiantes portant
    la même compétence canonique**. C'est le défaut du CP11 de V76, revenu
    ENTRE surfaces — V76 l'avait corrigé dans le laboratoire seulement.
  - **Deux erreurs de sens opposé** : le capstone, corrigé par le serveur, est
    archivé `kind: 'self'` (dégradé par un vocabulaire incomplet) ; la mission,
    validée par un clic, est archivée `passed` (surclassée). Un pilote humain
    lancé aujourd'hui produirait des données faussées **dans les deux
    directions**.
  - **Le terminal est le cas où « aucun fait » est probablement la bonne
    réponse** : ses trois tâches n'ont aucun critère de réussite, leurs
    arguments sont des énumérations fermées, et leur description dit
    elle-même « démonstration d'exécution bornée ».
  - **ANOMALIE DE SONDE n° 1** : mon document de test employait le mot
    « placeholder » comme terme du domaine ; il figure dans la liste noire des
    marqueurs de remplissage. J'ai d'abord cru que le validateur avait raison de
    refuser. Corrigé — et le produit hérite d'une petite dette réelle (`D11`).
