# TSD-033 — Gate v33:check, Curriculum Graph III & ledger

Document de conception technique (Sprint V33). Complète ADR-033 / HSD-033.

## 1. Plan de sprint : `docs/architecture/v33-lessons-plan.json`
Forme habituelle : `{ sprint, baselineRef, note, newLessons[], hardenedLegacy[], critical[],
prereq{} }`. `prereq` fusionné dans l'union du Curriculum Graph (v27→v33). `critical` =
leçons devant porter ≥1 practiceRef résolu. Le `prereq` V33 sert AUSSI à déclarer les
prérequis manquants des leçons niveau-3 (réduction des warnings `concept-without-foundation`).

## 2. Gate `v33:check` (`scripts/v33-check.mjs`)
Adapté de `v32-check.mjs`. Lit `v33-lessons-plan.json`. Vérifie STRUCTURELLEMENT : slugs du
périmètre existants ; on-ramp avant l'objectif ; prérequis rédigés ; sections requises ;
practiceRefs résolus (obligatoires pour `critical`) ; graphe de prérequis acyclique ; labels
réel/simulé. Interdits : comptages figés, longueur = qualité. Ajouté à `gates:active` après
`v32:check`.

## 3. Ledger : `docs/architecture/v33-pedagogy-audit.json`
Scaffold `{ sprint, rubricVersion, note, scanGlobs, items: [] }` ; rempli au CP11 (leçons
durcies V33, rubrique v20), validé par `validateAuditLedger`.

## 4. Curriculum Graph III
Priorité : réduire les warnings par CORRECTION DE LA DONNÉE SOURCE (déclarer les prérequis
manquants dans `v33-lessons-plan.json`), pas par affaiblissement des diagnostics. Nouveaux
diagnostics ajoutés seulement si un mode de rupture réel non couvert apparaît ; chacun
déterministe, testé (fixture positive/négative), non bloquant sur heuristique. Réutilise
`lib/curriculum-graph.mjs` (aucun second moteur).

## 5. Tests
- `tests/v33-pedagogy.test.mjs` : plan structuré, prereq acyclique, practiceRefs résolus,
  ledger valide.
- `tests/v33-exercises.test.mjs` : contrat des nouveaux exercices ML/DL/LLMOps (exécuté).
- `tests/v33-e2e.test.mjs` : chaîne ML→DL→transformers→LLMOps franchissable + réel/simulé.
- `tests/curriculum-graph.test.mjs` : étendu si de nouveaux diagnostics sont ajoutés.

## 6. Exercices — contrat
node-js, `validateExercise` OK, ≥1 test public + ≥1 privé, starter faux, référence 100 %
verte, aucune fuite, compétences connues (`lib/skill-taxonomy.mjs`), sorties entières/chaînes
(pas d'égalité flottante), résumé étiqueté SIMULATION. Politique : aucune dépendance ML.

## 7. progress.json
Baseline V33 capturée au CP0 (blob `323604021055588a9528a86875f36598dbdc7758`), restaurée à
l'identique après toute campagne de validation. Gitignoré, jamais commité.
