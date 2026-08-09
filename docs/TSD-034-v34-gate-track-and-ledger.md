# TSD-034 — Gate v34:check, activation du parcours Data/ML & ledger

Document de conception technique (Sprint V34). Complète ADR-034 / HSD-034.

## 1. Plan de sprint : `docs/architecture/v34-lessons-plan.json`
Forme habituelle `{ sprint, baselineRef, note, newLessons[], hardenedLegacy[], critical[],
prereq{} }`. `hardenedLegacy` rempli au fil des CP (gate verte en continu). `prereq` déclare
AUSSI les prérequis manquants des leçons non-ML `concept-without-foundation` (git-advanced,
caching-performance, monitoring-production, system-design-interview) pour réduire les warnings.

## 2. Gate `v34:check` (`scripts/v34-check.mjs`)
Adapté de `v33-check.mjs`. Vérifie STRUCTURELLEMENT le périmètre (on-ramp, prérequis rédigés,
sections, practiceRefs résolus pour `critical`, graphe acyclique, réel/simulé). Jamais de
comptage figé (« nombre de caractères ≥ X »). Ajouté à `gates:active`.

## 3. Ledger : `docs/architecture/v34-pedagogy-audit.json`
Scaffold rempli au CP11 (leçons durcies V34, rubrique v20), validé par `validateAuditLedger`.

## 4. Activation du parcours Data/ML
`data-ml-v1` vit dans `lib/catalogue.mjs`. L'activation dépend d'un mapping modules→jours
DÉRIVÉ des journées réelles (pas de nombre codé en dur, pas de duplication de curriculum). Si
le catalogue expose déjà les journées d'un parcours via une structure de modules, on la
renseigne pour data-ml-v1 ; sinon on documente le blocker et on laisse le parcours annoncé.
Toute modification du catalogue est couverte par un test.

## 5. Curriculum Graph IV
Réutilise `lib/curriculum-graph.mjs`. Aucun nouveau diagnostic requis a priori (les 9 existants
couvrent les ruptures observées) ; on ajoute un diagnostic uniquement si un mode de rupture
réel non couvert apparaît. Rapport warnings avant/après par type dans `v34-track-coherence.md`.

## 6. Tests
- `tests/v34-pedagogy.test.mjs` : plan structuré, prereq acyclique, practiceRefs résolus, ledger.
- `tests/v34-exercises.test.mjs` : contrat des nouveaux exercices (exécuté).
- `tests/v34-e2e.test.mjs` : chaîne data foundations + theory→practice + réel/simulé + (si
  activé) cohérence du parcours data-ml-v1.

## 7. Contrat d'exercices & progress.json
Exercices : node-js, validateExercise OK, ≥1 public + ≥1 privé, starter faux, référence 100 %
verte, aucune fuite, compétences connues, sorties entières/chaînes, SIMULATION. progress.json :
baseline CP0 (`323604021055588a9528a86875f36598dbdc7758`) restaurée à l'identique, gitignorée.
