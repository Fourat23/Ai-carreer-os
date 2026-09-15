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
| `LAST_COMPLETED_CP` | **CP5** |
| `CURRENT_CP` | — |
| `CURRENT_BATCH` | — |
| `NEXT_CP` | **CP6** — CAPSTONES |
| `NEXT_ACTION` | réparer l'accident `D4` **sans surclasser** : un capstone est corrigé par le serveur contre un corrigé déclaré, et son `kind` `capstone-grade` est absent de `VALIDATION_KINDS` — la preuve retombe donc sur `self`, c'est-à-dire une auto-déclaration. Ajouter `capstone-grade` au vocabulaire ; brancher `AssessmentAttempt` avec `kind: 'capstone'` et `simulation: true` (le fait existe depuis le CP4, la route n'émet rien). **NE PAS remonter les preuves héritées `capstone-review`** (`D5`) : leur correction n'est pas rejouable, donc on ne peut pas affirmer qu'elle a eu lieu. 13/13 capstones testés. |

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
| `D10` | **125 exercices sans rattachement** | cause : aucun `conceptIds`/`lessonRefs` dans la source |
| `D11` | `placeholder` est un terme du domaine traité comme un marqueur de remplissage | `PLACEHOLDER_RE` |
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
| CP5 | *(ce commit)* — une mission ne dit plus `passed` |

## Journal des CP

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
