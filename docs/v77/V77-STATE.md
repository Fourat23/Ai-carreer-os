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
| `LAST_COMPLETED_CP` | **CP14** |
| `CURRENT_CP` | — |
| `CURRENT_BATCH` | — |
| `NEXT_CP` | **CP15** — RAPPORT FINAL |
| `NEXT_ACTION` | écrire `docs/v77/V77-FINAL-REPORT.md` et rendre **le seul rapport conversationnel long du sprint**. Deux verdicts sur les deux axes. Trois questions finales. Ne rien affirmer que les CP0→CP14 n'aient mesuré. |

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
| portes `gates:active` | **49** → **50** au CP14 (`v77:check`) | |
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

## `FROZEN_DECISIONS` — CP1 · `docs/v77/V77-PRACTICE-OBSERVABILITY-CONTRACT-FROZEN.md`

- **15 termes gelés** : `ACTIVITY` `ATTEMPT` `SUBMISSION` `ARTIFACT`
  `ASSESSMENT` `VALIDATION` `EVIDENCE` `EVIDENCE_LEVEL` `EXTERNAL_EVIDENCE`
  `PROJECT_MILESTONE` `SIMULATED_ACTIVITY` `USAGE_EVENT` `NO_FACT`
  `DERIVED_ADVANCEMENT` `OBSERVATION_CAPABILITY`.
- **TROIS NIVEAUX DE PREUVE** : `DECLARED` < `OBSERVED` < `VALIDATED`.
  **Seul `VALIDATED` compte** pour compétence, rétention et récupération.
- **Trois inégalités** : `DECLARED ≠ PASSED` · `OBSERVED ≠ VALIDATED` ·
  `STRUCTURE_VALID ≠ PEDAGOGICALLY_CORRECT`.
- **`NO_FACT` par défaut** : une surface n'écrit rien sans justification
  positive. **Viser 12/12 est un ÉCHEC du sprint**, pas un succès (`H1`).
- **Politique par surface, gelée** : `lab` `transfer` `assessments` `capstones`
  → `VALIDATED` · `missions` → **`OBSERVED` jamais `VALIDATED`** ·
  `kubernetes`/`cloud-lab`/`cloud-foundations`/`security` → `OBSERVED` +
  `simulation` · **`pipelines` et `terminal` → `NO_FACT`/`USAGE_EVENT`** ·
  playbooks + 25 surfaces de lecture → `NO_FACT` · tâches externes →
  `DECLARED` au maximum, non implémentées.
- **DEUX types de faits nouveaux pour six surfaces**, pas six :
  **`AssessmentAttempt`** (assessments + capstones, champ `kind`) et
  **`ArtifactAnalysis`** (les quatre surfaces analytiques).
- **Règle du maillon faible** : le niveau d'une preuve composite est celui de sa
  composante la plus FAIBLE. Une mission vaut donc son auto-évaluation.
- **`simulation` est un CHAMP BOOLÉEN**, jamais du texte libre. Il ne dégrade
  pas le niveau : `VALIDATED` + `simulation: true` sont compatibles.
- **Sémantique des genres capstone** : `capstone-grade` = `VALIDATED`
  (correction serveur) · `capstone-review` = `OBSERVED` (héritage non rejouable,
  **non remonté**) · `self` = `DECLARED`.
- **Double comptage** : une production humaine ne devient jamais deux sources
  qualifiantes. `derivedFrom` obligatoire ; la projection compte les
  PRODUCTIONS, pas les sources. **Le chiffre du CP15 sera celui du CP10, sur les
  compétences CANONIQUES** — le 14 du CP0 ne doit pas être recopié.
- **`USAGE_EVENT` : cinq contraintes** — champ séparé, aucune Evidence, aucun
  moteur, borné et supprimable, jamais de `passed`/`score`.
- **125 → 0 n'est pas un objectif.** Aucune heuristique nouvelle ; seule une
  déclaration explicite adossée à une source, **hors du corpus gelé**.
- **`H1`–`H14`** : quatorze contournements interdits.
- **`O1`–`O20`** : critères d'ingénierie gelés AVANT implémentation, avec la
  règle héritée de V75/V76 — tous atteints ⇒ le verdict **DOIT** être `READY`,
  et l'absence de pilote humain s'exprime **uniquement** sur le second axe.
- **Axe humain plafonné** à `REAL_HUMAN_LEARNING_EVIDENCE_NOT_MEASURED`.

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
| `D1` | ~~double comptage inter-surfaces~~ **CLOS PAR CONSÉQUENCE au CP10** (CP5 + CP9), et remesuré : **42** paires structurelles · **14** qui chevauchent une compétence (c'était le « 14 » du CP0, un chevauchement STRUCTUREL) · **0** double comptage effectif | sonde `A13` rejouée : 2 preuves, **1** qualifiante |
| `D8` | ~~aucun niveau de confiance sur les preuves~~ **CORRIGÉE aux CP5→CP9** : `evidenceLevel` dérivé, deux plafonds, matrice de 192 lignes publiée et sans incohérence | 12 combinaisons qualifiantes sur 192 |
| `D10` | **125 exercices sans rattachement** | cause : aucun `conceptIds`/`lessonRefs` dans la source |
| `D11` | `placeholder` est un terme du domaine traité comme un marqueur de remplissage | `PLACEHOLDER_RE` |
| `D10` | **125 exercices sans rattachement** — **DÉCLARÉE au CP8, non corrigée** : 4 sources auditées, **0 résolution**. Sous-classée : 112 conséquentes (les candidates couvrent plusieurs compétences), 13 sans conséquence pour la compétence | mécanisme de déclaration hors corpus livré **vide** |
| `D7` | ~~six surfaces calculent et ne gardent rien~~ **SOLDÉE pour 5/6 au CP7** (`terminal` au CP3, les quatre analytiques ici) ; `pipelines` reste en `USAGE_ONLY` par décision, pas par oubli | sans artefact → 0 octet ; avec artefact → 1 fait `OBSERVED` |
| `D4` | ~~la preuve de capstone est dégradée en `self`~~ **CORRIGÉE au CP6** — et la mesure a montré une CONTRADICTION que la dette ne disait pas : le produit archivait `self`/`DECLARED` et créditait `demonstrated` | 13 × `self` → 13 × `capstone-grade` ; niveau `DECLARED` → `VALIDATED` |
| `D5` | ~~`capstone-review` n'est plus produit que par la migration héritée~~ **RETOURNÉE au CP6** : les neuves disent la vérité, les héritées restent plafonnées `OBSERVED` et ne sont PAS remontées | `NIVEAU_MAX_PAR_KIND['capstone-review'] = 'OBSERVED'` |
| `D9` | ~~la marque de simulation vit dans du texte libre~~ **CORRIGÉE au CP6** : champ booléen sur la preuve ET sur le fait ; ne dégrade aucun niveau | 13 × `simulation: true` |
| `D2` | ~~une mission écrit `passed` sur une auto-validation~~ **CORRIGÉE au CP5** | 42 → 0 preuves qualifiantes ; 17 compétences `demonstrated` → `practiced` |
| `D3` | **un document faux mais bien structuré passe** — CONFIRMÉE en HTTP au CP5, et non corrigée : c'est ce qu'un validateur de FORME fait. Le CP5 en tire la conséquence (`OBSERVED`) au lieu de prétendre l'avoir réparé | runbook « pas de rollback prévu » → `structure ok: True` |
| `D6` | ~~un assessment échoué 5× laisse 1 trace~~ **CORRIGÉE au CP4** — et la mesure disait plus que la dette : la clé de preuve ignorant le score, c'est la PREMIÈRE tentative qui survivait, donc `0/5 → 1/5 → 4/5` ne gardait que `0/5` puis `4/5` | 7 soumissions → 7 faits ; doublon réseau → 1 fait |
| `D12` | **CP3** — ~~les faits ne survivaient pas à l'import de leur propre sauvegarde~~ **CORRIGÉE au CP3** : `validateStrict` était une quatrième liste blanche | mesuré `recallAttempts 1 → 0`, `hintViews 1 → 0` ; l'énumération des faits est désormais unique |

## `PROBE_ERRORS`

| # | anomalie | correction |
|---|---|---|
| **n° 1** | ma sonde `A9` employait le mot « placeholder » comme terme du domaine ; le validateur le classe comme texte de remplissage. J'en avais conclu que la structure était refusée à juste titre — c'était faux | mot remplacé, conclusion du §4.2 confirmée · le défaut produit est consigné (`D11`) |
| *(corrigées avant publication)* | identifiant de scénario sécurité erroné (404), corps de requête terminal erroné (400), déclencheur de pipeline erroné (`skipped`) | trois mesures refaites avec les bons paramètres |

## `SECURITY_STATE`

**16 / 16 sondes contenues** (rejouées au CP0). `SEC3` reste **partiel** en
Python, déclaré tel quel. V77 ne doit rien dégrader : la porte `v76:check`
(79 vérifications) reste dans `gates:active`.

## `TESTS_RUN`

**CP14 — GANTELET COMPLET** — `npm test` **2177/2177** · `tsc` **0** ·
`build` **OK** · `gates:active` **50 portes, 0 violation** ·
`v74` `v75` `v76` `v77` ✅✅✅✅ · `v76:negative` **11 vues, 0 trou** ·
`cp14-mutations` **36/36 vues, 0 survivante** · `data/progress.json` **absent**.
**`v73:check` non lancé et NON créé** — il n'a jamais existé ici.

**CP13** — `npm test` **2171/2171** · `gates:active` **49 portes, 0 violation** ·
**6 chaînes E2E en HTTP réel, 6 résultats attendus, 0 écart** ·
`data/progress.json` **absent**.

**CP12** — `npm test` **2162/2162** · `tsc` **0** · `gates:active` **49 portes,
0 violation** · export et `reset` traversés en HTTP réel.

**CP11** — `npm test` **2156/2156** · `tsc` **0** · `build` **OK** ·
`gates:active` **49 portes, 0 violation** · `/history` traversée en HTTP réel ·
`data/progress.json` **absent**.

**CP10** — `npm test` **2142/2142** · `tsc` **0** · `build` **OK** ·
`gates:active` **49 portes, 0 violation** · mesure canonique **42 · 14 · 0**.

**CP9** — `npm test` **2130/2130** · `tsc` **0** · `build` **OK** ·
`gates:active` **49 portes, 0 violation** · `v76:negative` **11 vues échouer,
0 trou** · matrice **192 lignes, 0 incohérence**.

**CP8** — `npm test` **2117/2117** · `tsc` **0** · `build` **OK** ·
`gates:active` **49 portes, 0 violation** · audit de 4 sources, **0 résolution** ·
corpus **intact**.

**CP7** — `npm test` **2103/2103** · `tsc` **0** · `build` **OK** ·
`gates:active` **49 portes, 0 violation** · `v76:negative` **11 vues échouer,
0 trou** · chaîne HTTP réelle des quatre surfaces + pipelines traversée ·
`data/progress.json` **absent**.

**CP6** — `npm test` **2081/2081** · `tsc` **0** · `build` **OK** ·
`gates:active` **49 portes, 0 violation** · BEFORE/AFTER sur **13 capstones** ·
chaîne HTTP réelle d'un capstone traversée · `data/progress.json` **absent**.

**CP5** — `npm test` **2070/2070** · `tsc` **0** · `build` **OK** ·
`gates:active` **49 portes, 0 violation** · `v76:negative` **11 vues échouer,
0 trou** · BEFORE/AFTER sur **42 missions** · chaîne HTTP réelle d'une mission
traversée · `data/progress.json` **absent**.

**CP4** — `npm test` **2047/2047** · `tsc` **0** · `build` **OK** ·
`gates:active` **49 portes, 0 violation** · `v76:negative` **11 vues échouer,
0 trou** · chaîne HTTP réelle des diagnostics traversée · `data/progress.json`
**absent**.

**CP3** — `npm test` **2024/2024** · `tsc` **0** · `build` **OK** ·
`gates:active` **49 portes, 0 violation** · `v76:negative` **11 vues échouer,
0 trou** · chaîne HTTP réelle du terminal traversée · `data/progress.json`
**absent**.

**CP0** — `npm test` **1984/1984** · `tsc` **0** · `build` **OK** ·
`gates:active` **49 portes, 0 violation** · sécurité **16/16**.

## `FILES`

**CP14** — **créés** `scripts/v77-check.mjs` (**146 vérifications**),
`tests/v77-gate.test.mjs` (6 — **JUGE EXTERNE**),
`scripts/v77/cp14-mutations.mjs` (36 mutations), `docs/v77/cp14-mutations.json`,
`docs/v77/V77-CP14-MUTATIONS-PORTE.md`. **Modifiés** : `package.json`
(`v77:check` + `gates:active` → **50 portes**), et **deux tests renforcés**
après survie de mutation (`v77-usage-event`, `v77-assessment-attempt`).

**CP13** — **créés** `scripts/v77/cp13-e2e.mjs` (6 chaînes en HTTP réel),
`docs/v77/cp13-e2e.json`, `tests/v77-e2e.test.mjs` (9),
`docs/v77/V77-CP13-E2E.md`. **Aucun fichier de produit modifié** — le CP13
traverse et constate.

**CP12** — **créés** `docs/v77/V78-PILOT-READINESS.md`,
`tests/v77-pilot-readiness.test.mjs` (6 — le document est RATTACHÉ au code :
surfaces, nombres et faits sont vérifiés contre `practice-model`,
`evidence-matrix` et `FAITS_DU_PRODUIT`).
**Aucun fichier de produit modifié** — le CP12 mesure et déclare.

**CP11** — **créés** `tests/v77-learner-state.test.mjs` (14),
`docs/v77/V77-CP11-ETAT-APPRENANT.md`. **Modifiés** : `lib/learner-history.mjs`
(quatre nouveaux types d'événement · `travail` et `usage` comptés séparément),
`lib/learner-history.d.ts`, `app/history/page.tsx` (icônes, marqueurs
`usage`/`simulé`/`déclaré`, deux compteurs distincts).

**CP10** — **créés** `scripts/v77/cp10-double-comptage.mjs`,
`docs/v77/cp10-double-comptage.json`, `tests/v77-double-comptage.test.mjs` (12),
`docs/v77/V77-CP10-DOUBLE-COMPTAGE.md`. **Modifiés** : `lib/evidence.mjs`
(champ `derivedFrom`, hors clé métier), `lib/evidence.d.ts`,
`lib/mission-state.mjs` (filiation écrite sur la preuve de mission).

**CP9** — **créés** `lib/evidence-matrix.mjs` (**PUR**),
`lib/evidence-matrix.d.ts`, `scripts/v77/cp9-matrice.mjs`,
`docs/v77/cp9-evidence-matrix.json`, `tests/v77-evidence-matrix.test.mjs` (13),
`docs/v77/V77-CP9-MATRICE.md`. **Modifiés** : `lib/evidence.mjs`
(`isQualifying` exige `VALIDATED` · `mission-deliverables` plafonné `DECLARED`),
`lib/evidence.d.ts`, et **6 assertions amendées** dans
`tests/v77-mission-submission.test.mjs` et `tests/v77-capstone.test.mjs`.

**CP8** — **créés** `lib/exercise-declarations.mjs` (**PUR**),
`lib/exercise-declarations.d.ts`, `lib/exercise-declarations-server.ts`,
`scripts/v77/cp8-ambiguite.mjs`, `docs/v77/cp8-ambiguite.json`,
`tests/v77-ambiguite.test.mjs` (14), `docs/v77/V77-CP8-AMBIGUITE.md`.
**Modifiés** : `lib/exercise-mapping.mjs` (règle **R1b**),
`lib/exercise-concepts-server.ts`, `scripts/v75/cp4-mapping.mjs` (contexte
exporté + même source annexe que le produit).
**CORPUS INTACT** — aucun fichier d'exercice, aucun Markdown, aucun `program.json`.

**CP7** — **créés** `lib/artifact-analysis.mjs` (**PUR**),
`lib/artifact-analysis.d.ts`, `lib/artifact-analysis-server.ts` (écriture
partagée, UN seul endroit), `tests/v77-artifact-analysis.test.mjs` (22),
`docs/v77/V77-CP7-ARTEFACTS.md`. **Modifiés** : `lib/progress-store.mjs`,
`lib/learning-engine.mjs` + `.d.ts` (`RECORD_ARTIFACT_ANALYSIS`), `lib/types.ts`,
les QUATRE routes analytiques, `app/api/pipelines/[id]/route.ts`
(`USAGE_ONLY`), `tests/progress-store.test.mjs`.

**CP6** — **créés** `tests/v77-capstone.test.mjs` (11),
`scripts/v77/cp6-capstones-before-after.mjs`, `docs/v77/cp6-capstones-before-after.json`,
`docs/v77/V77-CP6-CAPSTONES.md`. **Modifiés** : `lib/evidence.mjs`
(`capstone-grade` au vocabulaire · `NIVEAU_MAX_PAR_KIND` · champ `simulation`),
`lib/evidence.d.ts`, `app/api/capstones/[id]/route.ts` (fait `kind: 'capstone'`
écrit AVANT la branche `record` · preuve `simulation: true`).
**Aucun fichier de test existant modifié** — rien ne gardait le défaut.

**CP5** — **créés** `lib/mission-submission.mjs` (**PUR**),
`lib/mission-submission.d.ts`, `tests/v77-mission-submission.test.mjs` (23),
`scripts/v77/cp5-missions-before-after.mjs`, `docs/v77/cp5-missions-before-after.json`,
`docs/v77/V77-CP5-MISSIONS.md`. **Modifiés** : `lib/evidence.mjs`
(`evidenceLevel` DÉRIVÉ + `NIVEAU_MAX_PAR_SOURCE`), `lib/mission-state.mjs`
(la mission écrit `manual`, plus `passed`), `lib/progress-store.mjs`,
`lib/learning-engine.mjs` + `.d.ts` (`RECORD_MISSION_SUBMISSION`), `lib/types.ts`,
`app/api/missions/[id]/route.ts`, `tests/progress-store.test.mjs`.

**CP4** — **créés** `lib/assessment-attempt.mjs` (**PUR**),
`lib/assessment-attempt.d.ts`, `tests/v77-assessment-attempt.test.mjs` (23),
`docs/v77/V77-CP4-ASSESSMENTS.md`. **Modifiés** : `lib/event-model.mjs` (grain
`assessment`), `lib/progress-store.mjs` (le fait rejoint l'énumération unique),
`lib/learning-engine.mjs` + `.d.ts` (`RECORD_ASSESSMENT_ATTEMPT`), `lib/types.ts`,
`app/api/assessments/[id]/route.ts` (fait écrit à CHAQUE correction serveur,
**avant** la branche `record`), `tests/progress-store.test.mjs`.

**CP3** — **créés** `lib/usage-event.mjs` (**PUR**), `lib/usage-event.d.ts`,
`tests/v77-usage-event.test.mjs` (21), `docs/v77/V77-CP3-TERMINAL.md`.
**Modifiés** : `lib/progress-store.mjs` (énumération unique des faits —
`normaliserLesFaits` + `FAITS_DU_PRODUIT`), `lib/backup.mjs` (**la quatrième
liste blanche**), `lib/learning-engine.mjs` + `.d.ts` (`RECORD_USAGE_EVENT`),
`lib/types.ts`, `app/api/terminal/[taskId]/route.ts` (émission après `run`),
`scripts/v75-check.mjs` `[A5]` et `scripts/v76-check.mjs` `[B7]` (règles
réécrites en COMPORTEMENT, vérifiées par mutation), `scripts/v76-negative.sh`
N11, `scripts/v75/cp14-mutations.mjs` M15, `scripts/v76/cp14-mutations.mjs` M25,
`tests/progress-store.test.mjs`, `tests/v76-hint-view.test.mjs`.

**CP2** — **créés** `lib/practice-model.mjs` (**PUR**), `lib/practice-model.d.ts`,
`tests/v77-practice-model.test.mjs` (19), `docs/v77/V77-CP2-CANONICAL-PRACTICE-MODEL.md`.
**Aucun fichier de produit modifié** — la carte existe, personne ne la lit encore ;
le branchement a lieu aux CP3 → CP7.

**CP1** — **créé** `docs/v77/V77-PRACTICE-OBSERVABILITY-CONTRACT-FROZEN.md`.
**Aucun fichier de produit modifié** — le CP1 gèle, il n'implémente pas.

### CP0

**Créés** : `scripts/v77/cp0-practice-forensics.mjs` (inventaire statique),
`scripts/v77/cp0-observability-probe.mjs` (13 sondes en direct),
`docs/v77/V77-CP0-PRACTICE-COVERAGE-FORENSICS.md`, `docs/v77/V77-STATE.md`,
`docs/v77/cp0-inventory.json`, `docs/v77/cp0-observability.json`.
**Aucun fichier de produit modifié** — le CP0 est en lecture seule.

## `COMMITS`

| CP | sujet |
|---|---|
| CP0 | `c6aca1c` — la phrase de départ était fausse, dans les deux sens |
| CP1 | `e0c4a80` — contrat d'observabilité gelé |
| CP2 | `98b6849` — la politique devient une donnée |
| CP3 | `5ddbd87` — le terminal : un usage, pas une réussite |
| CP4 | `68fba8a` — cinq échecs ne laissaient qu'une trace |
| CP5 | `6c8c8f5` — une mission ne dit plus `passed` |
| CP6 | `3f411b4` — le capstone était dégradé, pas surclassé |
| CP7 | `96b6d36` — quatre surfaces analysaient vraiment, et n'écrivaient rien |
| CP8 | `39c69c6` — les 125 ambigus : 125 → 125, et c'est le résultat |
| CP9 | `3e2fff5` — la matrice, et la décision qu'elle force |
| CP10 | `2f9cfae` — le double comptage : 42 · 14 · 0 |
| CP11 | `6f89924` — les faits deviennent lisibles, sans nouveau moteur |
| CP12 | `0e266e7` — ce qu'un pilote pourra observer, et ce qu'il ne pourra pas |
| CP13 | `65fabe0` — six chaînes traversées sur le produit qui tourne |
| CP14 | *(ce commit)* — 36 mensonges, zéro survivant, et une porte qui sait rougir |

## Journal des CP

- **CP14** — **36 mensonges plausibles, zéro survivant — après en avoir laissé
  passer deux.**
  - Premier passage : **34/36**. Les deux survivantes étaient des trous **dans
    mes propres tests**, pas dans le produit.
  - **`M01` — un test qui dérivait ses attentes de la chose testée.** Il bouclait
    sur `CHAMPS_INTERDITS` pour construire ses assertions : vider la liste le
    rendait **vert avec zéro assertion**. Même famille que le défaut payé deux
    fois par V76, sous une forme nouvelle. Corrigé en pinant la liste EN CLAIR.
  - **`M10` — l'ordre du texte ne suffit pas.** Glisser une condition sur
    `record` À L'INTÉRIEUR du bloc d'écriture laisse l'ordre intact et rétablit
    la dissymétrie du CP4. La mutation elle-même a dû être RÉÉCRITE — la première
    ne mutait rien — et le test vérifie désormais une propriété : *rien qui parle
    de `record` ne se tient entre la correction et l'enregistrement.*
  - **Porte `v77:check` : 146 vérifications**, `gates:active` passe de **49 à
    50**. Ses règles décisives **exécutent le produit** — `A2` traverse écriture,
    sérialisation, relecture, sauvegarde et restauration ; `A5` parcourt les 192
    lignes de la matrice.
  - **Elle ne se juge pas elle-même** : `tests/v77-gate.test.mjs` est le JUGE
    EXTERNE, et les deux mutations visant la porte (`M35`, `M36`) sont jugées par
    lui. Toutes deux vues.
  - **Une mutation dont le motif a disparu est REFUSÉE**, pas appliquée en
    silence — le défaut que le CP3 avait trouvé dans les harnais de V75 et V76.
  - **`v73:check` n'a pas été créé.** Le brief le suppose ; il n'a jamais existé
    ici. Un test du juge externe vérifie qu'il n'a pas été inventé.
  - **Ce que le harnais ne prouve pas** : 36 mensonges vus sont 36 mensonges
    **auxquels j'ai pensé**. Une mutation qu'on n'écrit pas ne survit pas — elle
    n'existe pas, et son absence n'est pas une preuve.

- **CP13** — **un produit n'est pas une somme de surfaces.**
  - Six chaînes traversées en HTTP réel sur le produit reconstruit. L'état est lu
    **par l'EXPORT du produit**, pas par le fichier sur disque : une sonde qui
    lirait ce qu'elle vient d'écrire mesurerait son appareil — V76 · CP14 a payé
    trois faux survivants pour cette leçon.
  - **La sonde ne contourne AUCUNE garantie** : les corrigés ne sont jamais
    servis par l'API, donc elle les lit dans les fixtures, comme un auteur.
    Ouvrir une porte pour se faciliter la tâche invaliderait à la fois la mesure
    et la garantie. Deux tests gardent ces deux points.
  - **C1, la chaîne du défaut `A13`** : toujours **deux** preuves — rien n'a été
    supprimé, la mission a bien eu lieu — mais **une seule démontre**.
  - **C4, la garde la plus facile à perdre** : `analyze` **sans** artefact
    calcule les mêmes diagnostics et n'écrit **pas un octet** ; deux versions
    postées font deux productions ; aucune preuve n'en naît.
  - **C6 n'écrit RIEN, et c'est la réponse.** Consulter, réinitialiser, demander
    le corrigé du produit : aucun de ces gestes n'est un travail de l'apprenant.
  - **Le résultat est publié ET pinné** par neuf tests : ils ne remplacent pas la
    sonde, ils empêchent qu'un comportement change sans que personne ne la
    rejoue.
  - **Ce que la traversée ne peut pas confirmer** : qu'un humain apprenne quoi que
    ce soit. Elle prouve que le système observe proprement — la valeur
    pédagogique de ces observations est la question de V78.

- **CP12** — **ce qu'un pilote pourra observer, et surtout ce qu'il ne pourra
  pas.**
  - Le document énumère **quatre questions tranchables** et **six qui ne le sont
    pas**. Les secondes comptent plus : un pilote qui les croit tranchées
    produira des conclusions fausses.
  - **Le document est RATTACHÉ AU CODE par six tests.** Un document de readiness
    est le plus facile à écrire et le plus facile à laisser mentir : il vieillit
    sans rougir. Surfaces, nombres et faits sont vérifiés contre
    `practice-model`, `evidence-matrix` et `FAITS_DU_PRODUIT`.
  - **VIE PRIVÉE — les deux points laissés au CP12 par le CP0, mesurés** :
    · l'export contient les **neuf faits** et **aucun identifiant personnel** —
      mais **PAS les journaux de laboratoire**, donc *un participant qui exporte
      « toutes ses données » n'emporte pas son code* ;
    · `reset` efface la progression, **écrit un instantané de secours qui
      contient encore tout**, et **ne touche ni les journaux ni les espaces de
      travail**. C'est délibéré (V76 · CP10 : un `RESET` ne doit pas effacer
      l'histoire d'un échec) — et c'est une réserve qu'un protocole humain doit
      énoncer.
  - **NON CORRIGÉ, et dit comme tel** : changer ce comportement à la veille d'un
    pilote casserait une garantie pédagogique pour en servir une autre, sans
    mesure. C'est une décision de protocole, pas d'ingénierie.
  - **La phrase qu'il ne faudra pas écrire**, nommée dans le document et gardée
    par un test : *« Le système mesure l'apprentissage. »* Il ne le mesure pas.

- **CP11** — **un fait que personne ne peut lire n'est pas encore une
  observation : c'est du stockage.**
  - Les quatre faits des CP3→CP7 étaient écrits, persistés, bornés, exportés,
    restaurés… et **aucune surface ne les lisait**. Mesuré : zéro lecteur dans
    `app/` et `lib/`. **Cinquième sprint d'affilée** où la chose à brancher
    existe déjà débranchée — et cette fois je l'avais construite moi-même.
  - **Aucun nouveau moteur** : l'historique de V65 est une PROJECTION, et les
    quatre faits s'y ajoutent comme les cinq autres. Un test garde le point :
    lire ne doit rien écrire.
  - **LA GARDE QUI COMPTE : usage ≠ travail.** Ajouter l'usage au compteur
    d'événements aurait fait grimper un chiffre **sans qu'un seul exercice de
    plus ait été résolu**. `total = travail + usage`, affichés séparément, et la
    ligne d'usage porte son avertissement DANS SON TEXTE — pas seulement dans un
    champ que personne ne lit.
  - **Aucun score** : un test balaie chaque ligne et refuse `score`, `%`,
    `percentile`, `maîtrise` — dans le texte ET dans les noms de champs.
  - **Mesuré en HTTP, et la sortie la plus parlante est `Preuves 0`** : un
    diagnostic soumis sans conservation n'a produit AUCUNE preuve, et le travail
    est pourtant observé. C'est la correction du CP4, visible à l'écran.
  - **Limite déclarée** : la lisibilité s'arrête à l'historique. Ces faits
    n'apparaissent ni au tableau de bord ni dans les compétences, parce qu'il
    faudrait décider ce qu'ils qualifient — ce que le CP9 a réservé aux preuves.

- **CP10** — **42 · 14 · 0, et confondre les deux premiers était l'erreur.**
  - Le « 14 » du CP0 n'a **pas** été recopié : il datait d'avant les CP5 et CP9,
    qui ont changé ce qu'une preuve de mission VAUT. Un chiffre recopié n'est pas
    une mesure, c'est une citation.
  - **Il se retrouve pourtant — et on sait enfin ce qu'il désignait** : un
    chevauchement STRUCTUREL de compétence entre une mission et l'exercice qui
    valide son livrable `auto`. Pas un double crédit. Les deux se ressemblaient
    tant qu'une preuve de mission qualifiait.
  - **ZÉRO double comptage effectif**, mesuré en construisant les deux preuves
    comme le produit les construit. Le défaut `D1` est clos **par conséquence**
    (CP5 + CP9), pas par une règle dédiée — et ajouter une déduplication là où
    aucun cas ne l'exige serait de la doctrine, pas de la précision.
  - **Sonde `A13` rejouée** : les deux preuves EXISTENT toujours — rien n'a été
    supprimé, la mission a bien eu lieu — mais **une seule démontre**.
  - **La filiation est écrite plutôt que redécouverte** : `derivedFrom` dit de
    quel exercice une preuve de mission dérive. Les 42 la portent, aucune n'est
    muette. Elle n'entre PAS dans la clé métier — sans quoi changer un
    `exerciseRef` créerait une seconde preuve, un double comptage fabriqué par la
    correction du double comptage.
  - **Une garde pour la suite** : un test dit exactement ce qui rouvrirait le
    défaut — si une preuve de mission redevenait qualifiante, **14** doubles
    comptages reviendraient. Le zéro dépend d'une décision, pas d'une structure,
    et c'est écrit.

- **CP9** — **une règle qu'on ne peut lire qu'en recoupant trois fichiers n'est
  pas une règle : c'est une coutume.**
  - Le CP5 avait posé un plafond par SOURCE, le CP6 un par MOYEN. Deux phrases
    vraies séparément, dont la combinaison n'avait **jamais été relue**. La
    matrice énumère les **192 combinaisons** — 80 `DECLARED`, 100 `OBSERVED`,
    **12 `VALIDATED`** — et ne contient aucune incohérence.
  - **LA DÉCISION** : `isQualifying` exige désormais le niveau `VALIDATED`,
    conformément au contrat gelé. La contradiction laissée ouverte au CP6 — une
    preuve annoncée `self` créditant `demonstrated` — est **résolue, pas
    maquillée**.
  - **CE QUE ÇA COÛTE, MESURÉ AVANT DE REGARDER SI LE CHIFFRE EST CONFORTABLE** :
    18 combinaisons cessent de qualifier. Sur une progression héritée
    reconstruite par le seul producteur encore actif, **4 preuves qualifiantes
    tombent à 2**. Un apprenant ancien verra des compétences redescendre de
    `demonstrated` à `practiced`. Aucune donnée n'est réécrite : c'est la règle de
    LECTURE qui s'aligne sur ce que la preuve dit d'elle-même.
  - **LA TENSION DU CP5, TRANCHÉE PAR LA MESURE** : `NIVEAU_MAX_PAR_SOURCE` est
    un PLAFOND, pas une assignation — « pas plus qu'observé » n'interdit pas
    d'être en dessous. Et **42 missions sur 42** portent une revue REQUISE
    auto-signée, donc `mission-deliverables` vaut `DECLARED`. Pas par principe :
    parce que le corpus est ainsi. Un test rougit si une mission sans revue
    apparaît.
  - **Les trois moteurs disent la même chose, et c'est écrit** : le contrat les
    traite ensemble ; inventer trois règles serait ajouter de la doctrine, pas de
    la précision. Une propriété rougit s'ils divergent un jour.
  - **6 assertions des CP5/CP6 amendées**, intention conservée, raison écrite.
    L'une méritait plus qu'une valeur remplacée : son « avant » était devenu
    inatteignable avec le code actuel, et elle le reconstruit désormais
    explicitement plutôt que de prétendre le contraire.

- **CP8** — **125 → 125, et c'est le résultat.**
  - `125 → 0 n'est pas un objectif`, et résoudre par heuristique arbitraire est
    nommément interdit. Le CP8 livre donc un MÉCANISME et une MESURE, pas un
    chiffre amélioré.
  - **Un endroit pour déclarer HORS du corpus gelé** :
    `data/exercise-declarations.json`, règle **R1b**, nommée à part plutôt que
    fondue dans R1 — savoir qu'un rattachement vient d'un fichier annexe change
    ce qu'on peut en dire. Elle vient APRÈS R1 : le corpus fait foi.
  - **Une déclaration SANS SOURCE est refusée**, pas réparée. Sans cette garde,
    le fichier deviendrait l'endroit où écrire ce qu'on aimerait croire.
  - **AUDIT DE QUATRE SOURCES, RENDEMENT PUBLIÉ Y COMPRIS NUL** : aucune ne
    tranche un seul des 125. `S1` touche `cloud-spof-detect`… cité par DEUX
    leçons, donc ne tranche rien. `S2` donne zéro parce que les Markdown de
    journée ne lient pas les exercices — aucune proximité éditoriale à exploiter.
    Un rendement nul MESURÉ permet d'affirmer que le blocage est dans la donnée,
    pas dans l'effort.
  - **LA DISTINCTION QUE PERSONNE N'AVAIT MESURÉE** : les leçons candidates
    portent-elles la même compétence ? **112 conséquentes** (choisir mal
    changerait la compétence créditée) · **13 sans conséquence** (ambiguïté
    réelle au grain du concept seulement). Aucun exercice ne change de classe :
    c'est une carte de priorité pour un auteur, pas une résolution déguisée.
  - **L'invariant gardé par un test** : si `AMBIGUOUS` baisse un jour sans que le
    nombre de déclarations augmente, quelqu'un aura deviné.

- **CP7** — **un compte de diagnostics n'est pas un verdict.**
  - Les quatre surfaces analytiques valident et analysent RÉELLEMENT un artefact
    **rédigé par l'apprenant** — c'est ce qui les sépare du terminal. Elles
    écrivent désormais `ArtifactAnalysis`, niveau `OBSERVED`.
  - **LE PIÈGE ÉVITÉ** : traiter `0 diagnostic` comme une réussite aurait donné
    quatre surfaces de plus en `VALIDATED` et un tableau flatteur. L'analyseur
    signale **ce qu'il sait reconnaître** ; `0 diagnostic` veut dire « rien de ce
    que je sais détecter », jamais « c'est juste ». Récompenser ce silence
    reviendrait à récompenser le vide.
  - **LA GARDE QUI COMPTE LE PLUS, mesurée en HTTP** : `analyze` **sans**
    artefact calcule 7 diagnostics et n'écrit **AUCUN octet** ; le même appel
    **avec** artefact écrit 1 fait et 0 preuve. Les deux calculent la même chose ;
    seul le second est un travail de l'apprenant.
  - **Une seule écriture pour quatre routes** : quatre copies divergeraient, et
    l'une finirait par compter ce que les trois autres refusent. Leçon du CP3
    appliquée AVANT d'en payer le prix.
  - **Une empreinte qui distingue vraiment** : `empreinteReponses` aurait rendu
    `[object Object]` sur un manifeste imbriqué — deux architectures différentes
    auraient eu la même empreinte, l'inverse d'une empreinte.
  - **`pipelines` : `USAGE_ONLY`, par un chemin DIFFÉRENT du terminal.** Le
    terminal n'a aucun critère ; le pipeline en a un, objectif, mais qui porte sur
    **la fixture**. Mesuré : le moteur rend `status: success`, et le fait écrit ne
    porte que `{ adapter: 'manual' }` — le verdict n'est pas recopié.

- **CP6** — **l'erreur de sens INVERSE de celle du CP5, et elle vient du même
  endroit.**
  - `capstone-grade` manquait à `VALIDATION_KINDS` ; `normalizeValidation`
    remplace tout genre inconnu par `self`. Une correction SERVEUR déterministe,
    multi-phases, était donc archivée comme une **auto-déclaration de
    l'apprenant**. Ce n'est pas `capstone-grade` qui était spécial : c'est
    l'absence d'un mot dans une liste.
  - **LA MESURE A MONTRÉ PLUS QUE LA DETTE.** Sur les 13 capstones : genre
    `self`, niveau `DECLARED`… et compétence projetée `demonstrated`. **Les deux
    dernières se contredisent** — `isQualifying` ne regarde ni le genre ni le
    niveau. Le produit disait « déclaration » et créditait « démonstration ».
  - **`isQualifying` n'a PAS été touché.** Décider qu'une preuve qualifiante
    doit aussi exiger un niveau changerait la règle de crédit de tout le produit ;
    c'est le mandat du CP9, pas un détour de checkpoint. L'état est figé par un
    test, pas préjugé.
  - **DEUX plafonds désormais, et le plus sévère gagne** : par SOURCE (ce qu'on
    peut observer) et par MOYEN (ce qu'on peut affirmer). `capstone` + `self` =
    `DECLARED` ; `mission` + `assessment-grade` = `OBSERVED`.
  - **`capstone-review` hérité n'est PAS remonté** (`D5`) : la migration l'a
    reclassé sur la foi d'un identifiant, sans jamais rejouer la correction.
    L'affirmer serait reconstruire un fait historique absent.
  - **La simulation devient un CHAMP** (`D9`) et **ne dégrade aucun niveau** :
    `VALIDATED` + `simulation: true` tiennent ensemble — c'est exactement ce
    qu'un capstone est.
  - **Un seul fait pour deux surfaces** : la route des capstones écrit le même
    `AssessmentAttempt` que les diagnostics, avec `kind: 'capstone'`.

- **CP5** — **`passed` répondait à trois questions à la fois, et c'est pour cela
  qu'il mentait.**
  - Les trois sont désormais séparées : l'**avancement** (`computeMissionStatus`,
    inchangé), le **niveau de validation** (dérivé du MODE de constat), la
    **preuve** (`manual`, non qualifiante, `evidenceLevel: OBSERVED`).
  - **Maillon faible : `DECLARED` pour les 42 missions.** Aucune n'échappe à la
    revue que l'apprenant signe lui-même. Le plafond se calcule sur la
    DÉFINITION : il existe avant la première soumission, et aucune réussite ne le
    lève.
  - **`D3` confirmée en HTTP, et NON corrigée** : un runbook disant « on déploie
    le vendredi soir sans prévenir » et « il n'y a pas de rollback prévu »
    obtient `structure ok: True`. Ce n'est pas un défaut du validateur, c'est ce
    qu'un validateur de FORME fait. Le CP5 en tire la conséquence au lieu de
    prétendre l'avoir réparé.
  - **BEFORE/AFTER mesuré, pas promis** : 42/42 preuves qualifiantes → 0/42, et
    **17 compétences passent de `demonstrated` à `practiced`** quand les missions
    sont la seule pratique. `practiced` et non `unassessed` : le travail compte
    toujours, il cesse de valoir démonstration.
  - **L'AFFIRMATION LA PLUS FORTE DU PRODUIT N'ÉTAIT GARDÉE PAR AUCUN TEST.** En
    retirant `passed`, **une seule assertion a rougi** dans 2 047 tests — la
    forme de `emptyFlat`. Les tests de mission vérifiaient qu'une preuve EXISTE,
    jamais qu'elle qualifie.
  - **Défaut trouvé par la sonde, pas par relecture** : ma `lectureDeLaMission`
    annonçait « 4 livrables rendus » pour une mission qui en a trois, parce
    qu'elle comptait des FAITS. Cliquer deux fois sur « valider » produit bien
    deux actes ; cela ne fait pas deux livrables.
  - **Une tension notée, pas enterrée** : le contrat gèle la mission à
    `OBSERVED`, le maillon faible donne `DECLARED`. Aucune conséquence
    opérationnelle aujourd'hui (les deux sont non qualifiants) — **à trancher au
    CP9**, dont c'est le mandat.

- **CP4** — **le produit gardait la PREMIÈRE tentative et appelait ça un
  historique.**
  - Dette `D6` **remesurée** au lieu d'être recopiée, et la mesure dit plus que
    la dette. Sept soumissions humaines laissaient **2 preuves et 0 tentative**.
    Surtout : `0/5 → 1/5 → 4/5` gardait `0/5` puis `4/5`. La clé de preuve est
    `sourceType:sourceId:compétences:qualifiante` — **elle ignore le score** —
    donc deux échecs de scores différents ont la même clé et c'est le **premier**
    qui survit. Pour un pilote, ce n'est pas une donnée manquante : c'est une
    donnée qui dit le contraire de ce qui s'est passé.
  - **Même cause qu'en V74 · CP2, trois sprints plus tard** : persister la
    PROJECTION (la preuve, dédupliquée par nature) et jeter le FAIT (la
    soumission, qui ne se déduplique pas).
  - **LE POINT DÉCISIF EST L'ENDROIT DE L'ÉCRITURE.** L'interface corrige
    (`submit`, sans conservation) puis conserve (`keep`). Écrire sous `record`
    n'aurait observé que les tentatives dont l'apprenant est assez content pour
    les garder — la dissymétrie exacte de V74. Le fait est donc écrit à **chaque
    correction serveur**.
  - **Deux gardes qui ne disent pas la même chose** : la clé métier écarte la
    même requête livrée deux fois ; `estUnRejeu` écarte la séquence
    « corriger puis conserver » de l'interface. Sans la seconde, chaque
    diagnostic conservé compterait DOUBLE — un mensonge de sens contraire.
  - **Le seuil appartient au fait** : `4/5` est réussi à 0,7 et échoué à 0,9. Le
    recopier rend le calcul refaisable sans retrouver la version de la fixture.
  - **Aucun capstone branché** : le fait porte déjà `kind` et `simulation`, mais
    la route des capstones n'émet rien — c'est le CP6, avec sa justification
    propre. Ouvrir un vocabulaire n'écrit pas un fait.

- **CP3** — **le terminal écrit enfin, et écrit le moins possible.**
  - **Politique `USAGE_ONLY`**, pas `NO_FACT` et surtout pas `TerminalAttempt`.
    Le CP0 avait mesuré les deux moitiés : le terminal **exécute vraiment**
    (`exitCode 0`, 263 octets, bac à sable) et **n'observe aucune réussite** —
    ses trois tâches n'ont aucun critère pédagogique et leurs arguments sont des
    énumérations fermées. *Un apprenant qui choisit `-la` parmi trois options
    valides n'a rien démontré.*
  - Le fait ne dit que **ce qui a eu lieu** : tâche, adaptateur, `exitCode`,
    durée, horodatage serveur. `exitCode: 0` est enregistré **sans être
    interprété** — 0 ne veut pas dire « réussi », il veut dire que le processus
    s'est terminé sans erreur.
  - **Le `detail` est une LISTE BLANCHE, pas un filtre** : retirer les champs
    interdits laisserait passer tout ce qu'on n'a pas pensé à interdire. Un
    `maitrise: 0.9` envoyé par un appelant futur n'entre pas, alors qu'aucune
    liste noire ne l'attendait.
  - Chaîne traversée **en HTTP réel**, pas en test unitaire : `1` usage écrit,
    `0` preuve, `0` fait pédagogique, export fidèle.
  - **LE DÉFAUT DU CHECKPOINT N'EST PAS DANS LE TERMINAL.** En vérifiant que le
    nouveau fait s'exporte, j'ai trouvé une **QUATRIÈME liste blanche** —
    `validateStrict` dans `lib/backup.mjs`. Mesuré avant correction :
    `recallAttempts 1 → 0`, `hintViews 1 → 0`, `usageEvents 1 → 0`. **Les quatre
    faits introduits depuis V66 ne survivaient pas à leur propre sauvegarde**, et
    le registre de preuves était reconstruit depuis `days[*].evidence` — ce qui
    perd toute preuve sans journée et ressemble à une restauration réussie.
  - Correction : l'énumération des faits vit dans **une seule fonction**
    (`normaliserLesFaits`), appelée par les quatre sites. Ajouter `usageEvents`
    à trois endroits sur quatre aurait rejoué `P7` une troisième fois.
  - **Deux règles de porte réécrites en COMPORTEMENT** (`[B7]` de V76, `[A5]` de
    V75) : elles pinçaient une disposition de code et ont rougi pour une
    amélioration. Ce n'est pas un affaiblissement — vérifié par mutation avant de
    conclure, et `[B7]` garde désormais **les six faits** au lieu d'un seul.
    Trois harnais de mutation visaient un texte disparu : laissés tels quels, ils
    auraient appliqué un remplacement **sans effet** et conclu à tort.

- **CP2** — **la politique devient une donnée, et le défaut par défaut cesse
  d'être « ça passe ».**
  - Le CP0 avait mesuré que la politique d'observation **n'existait nulle
    part** : implicite, dispersée dans huit routes, contradictoire. Elle est
    maintenant dans **un** fichier pur que les tests et la porte peuvent
    interroger.
  - **La distinction qui a le plus de conséquences** est
    `ARTIFACT_ANALYSIS` vs `SIMULATED_EXPLORATION` : remettre ce qu'on a
    produit, ou explorer un dispositif fourni. C'est elle qui sépare
    `kubernetes` de `pipelines`, et elle vient des mesures du CP0, pas d'une
    intuition.
  - **Une surface inconnue n'hérite d'aucune politique implicite** :
    `politiqueDe()` rend `null` et `niveauAutorise()` rend `false`. C'est
    l'inverse du comportement qui a permis aux six surfaces silencieuses de le
    rester.
  - **Le maillon faible rend `null` sur une liste vide**, pas `DECLARED` :
    « aucune composante » n'est pas « composante la plus faible », et rendre
    `DECLARED` fabriquerait une preuve à partir de rien.
  - **La moitié qu'on oublie est testée** : une carte qui plafonnerait TOUT à
    `OBSERVED` protégerait aussi bien et rendrait la compétence inatteignable.
    Quatre surfaces doivent atteindre `VALIDATED`, et un test l'exige.
  - **Un de mes tests a cassé pour rien** : il cherchait `OBSERVED` à une
    position de colonne dans le tableau du contrat. La colonne a bougé, aucune
    propriété n'avait changé — la faute que V76 a payée deux fois. Il cherche
    désormais la LIGNE de la surface et y vérifie présence/absence.
  - **Carte introduite, pas branchée.** Faire les deux dans le même checkpoint
    aurait rendu impossible de dire laquelle des deux moitiés casse quelque
    chose.

- **CP1** — **geler à partir de ce que le CP0 a mesuré, pas de ce que le brief
  supposait.**
  - **Le renversement le plus net : `pipelines` passe en `NO_FACT`.** Le brief
    demandait de ne pas jeter son verdict objectif `success`/`failed`/`blocked`.
    Le verdict est bien objectif — mais la route n'accepte **aucun pipeline
    candidat** : l'apprenant choisit un déclencheur et une approbation, puis
    observe un pipeline **fourni par le produit**. Deux apprenants obtiennent le
    même résultat. *Le statut mesure la fixture, pas la personne.*
  - **Et la symétrie inverse** : `kubernetes`, `cloud-lab`, `cloud-foundations`
    et `security` acceptent bien un **artefact rédigé par l'apprenant**. Ce sont
    elles, pas le pipeline, qui observent un travail — d'où un fait commun
    `ArtifactAnalysis`, au niveau `OBSERVED` : **un compte de diagnostics n'est
    pas un verdict**, et `0 diagnostic` ne devient jamais `passed`.
  - **La décision la plus lourde** : une mission ne pourra plus jamais produire
    `VALIDATED`. `STRUCTURE_VALID + SELF_CONFIRMATION → passed` est interdit par
    le contrat. La **règle du maillon faible** le formalise : une preuve
    composite vaut sa composante la plus faible, jamais la plus forte.
  - **Un assessment mérite un fait**, pour une raison sémantique et non de
    commodité : plusieurs tentatives humaines ont réellement lieu, la courbe
    d'échecs est ce qu'un pilote doit lire, et le produit traite déjà ainsi les
    exercices et les transferts. Ne pas le faire ici est une INCOHÉRENCE.
  - **Un capstone est un assessment** au sens observationnel : questionnaire
    multi-phases corrigé contre un corrigé déclaré. Même fait, champ `kind`
    pour la différence pédagogique, champ `simulation` pour l'autre. **Deux
    types de faits pour six surfaces, pas six.**
  - **`capstone-grade` rejoint le vocabulaire**, et ce n'est pas un
    surclassement : c'est la réparation d'un accident. Mais les preuves
    héritées `capstone-review` **ne sont PAS remontées** — leur correction n'est
    pas rejouable, donc on ne peut pas affirmer qu'elle a eu lieu.
  - **`OBSERVED` et `DECLARED` ne comptent pour rien** dans les moteurs. C'est
    délibérément sévère, et déclaré comme un choix : sous-déclarer une maîtrise
    est moins grave que la sur-déclarer.

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
