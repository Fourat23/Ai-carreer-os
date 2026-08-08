# TSD-032 — Gate v32:check, diagnostics Curriculum Graph II & ledger

Document de conception technique (Sprint V32). Complète ADR-032 / HSD-032. Décrit les artefacts
techniques et leurs invariants.

## 1. Plan de sprint : `docs/architecture/v32-lessons-plan.json`
Même forme que v27→v31 : `{ sprint, baselineRef, note, newLessons[], hardenedLegacy[],
critical[], prereq{} }`. `prereq` fusionné dans l'union du Curriculum Graph (v27→v32). `critical`
= leçons devant porter ≥1 practiceRef résolu.

## 2. Gate `v32:check` (`scripts/v32-check.mjs`)
Adapté de `v31-check.mjs`. Lit `v32-lessons-plan.json`. Vérifie STRUCTURELLEMENT :
- slugs du périmètre existants ;
- on-ramp avant l'objectif, prérequis rédigés (≥ seuil de mots), sections requises ;
- practiceRefs résolus (obligatoires pour `critical`) ;
- graphe de prérequis acyclique (DFS) ;
- labels réel/simulé présents sur les contenus concernés.
Interdits : `lessonCount === N`, `trackCount === 6`, longueur = qualité, nombre de sections =
profondeur. Ajouté à `gates:active` après `v31:check`.

## 3. Ledger : `docs/architecture/v32-pedagogy-audit.json`
Scaffold `{ sprint, rubricVersion, note, scanGlobs, items: [] }` ; rempli au CP11 avec les
leçons durcies V32 (rubrique v20, 16 dimensions), validé par `validateAuditLedger`.

## 4. Curriculum Graph II — nouveaux diagnostics (`lib/curriculum-graph.mjs`)
Extension PURE et dérivée. Nouveaux types d'anomalies, sévérités honnêtes :

| Type | Sévérité | Règle |
| --- | --- | --- |
| `advanced-before-prerequisite` | warning | une leçon de niveau N a un prérequis de niveau > N (ordre pédagogique suspect) |
| `skill-never-evaluated` | warning | une compétence enseignée (BUILDS_SKILL) mais portée par aucune leçon ayant une pratique résolue |
| `orphan-practice` | info | un exercice présent sur disque référencé par aucune leçon |
| `concept-without-foundation` | warning | une leçon de niveau ≥3 sans aucun prérequis déclaré dans l'union des plans |

Contrainte : ces diagnostics ne deviennent JAMAIS bloquants (heuristiques). Seuls
`prereq-cycle`, `dead-prereq`, `dead-practiceref` (V31) restent bloquants. `auditCurriculumGraph`
accepte les artefacts connus (exercices sur disque) pour calculer `orphan-practice`.

## 5. Tests
- `tests/v32-pedagogy.test.mjs` : plan structuré, prereq acyclique, practiceRefs résolus,
  ledger valide.
- `tests/v32-exercises.test.mjs` : contrat des nouveaux exercices agent (exécuté).
- `tests/curriculum-graph.test.mjs` (étendu) : fixtures des nouveaux diagnostics + intégration
  (0 bloquant sur le corpus réel).
- `tests/v32-e2e.test.mjs` : chaîne agentique franchissable (ordre, pratique reliée, réel/simulé).

## 6. Réutilisation stricte
`lib/exercise.mjs` (validateExercise, deepEqual), `lib/skill-taxonomy.mjs` (isKnownSkill),
`lib/pedagogy-audit.mjs` (validateAuditLedger), moteur playbooks/missions, catalogue. Aucun
nouveau moteur, aucune nouvelle base, aucun runtime ajouté.

## 7. progress.json
Baseline V32 capturée au CP0 (blob `323604021055588a9528a86875f36598dbdc7758`) ; restaurée à
l'identique après toute campagne de validation. Gitignoré, jamais commité.
