# TSD-043 — Read-model de couverture, feedback & gate v43

Document technique. Complète ADR/HSD-043. Fige l'API et le contrat du gate.

## 1. `lib/practice-coverage.mjs` (PUR)
```
export const COVERAGE_DIMENSIONS = ['foundation','practice','autonomy','diagnostic','variation','transfer','professional'];
export const READINESS_LEVELS = ['not-ready','foundational','guided','junior-ready','strong-junior'];
export const FINE_TO_PROGRAM = { /* projection documentée fine → 21 compétences programme */ };

projectSkill(fineId) -> programSkillId            // via FINE_TO_PROGRAM (+ canonicalSkill)

// sources = { lessons:[{slug,skills}], exercises:[{id,skills,difficulty}], assessments:[...],
//             capstones:[...], transferChallenges:[...], missions:[...], playbooks:[...], misconceptions:[...] }
skillCoverage(programSkillId, sources) -> {
  skill, name,
  dimensions: { [dim]: { level:'full'|'partial'|'none', from:string[] } },
  readiness: <READINESS_LEVELS>,
  gaps: string[]                                  // dimensions 'none' nommées
}
coverageMatrix(program, sources) -> SkillCoverage[]   // une ligne par compétence de programme
coverageSummary(matrix) -> { byReadiness:{...}, gapsByDimension:{...} }

// Feedback diagnostique (compose misconceptions V42) :
diagnosticFeedback({ skill?, exerciseId? }, misconceptions) -> {
  candidates: [ { id, wrong, right, lessonRefs, exerciseRefs } ]   // « erreur COMPATIBLE avec … »
}
```
Règles de dérivation : voir HSD-043 §3. `readiness` : `not-ready` si pas de foundation+practice ;
`foundational` si foundation+practice ; `guided` si +autonomy ; `junior-ready` si +diagnostic +(variation
ou transfer) ; `strong-junior` si les 7 dimensions ≥ partial dont transfer=full. **Jamais** dérivé du seul
nombre d'exercices.

## 2. Extension `lib/misconceptions.mjs`
Ajout (additif) d'`exerciseRefs` déjà présents ; `diagnosticFeedback` lit `skill` et `exerciseRefs`.
Langage : « cette erreur est COMPATIBLE avec la misconception X », jamais « tu ne comprends pas ».

## 3. Gate `scripts/v43-check.mjs`
Échoue si : une source concurrente interdite existe (`data/skills-v2.json`, `data/practice-database*`,
`lib/practice-engine-v2*`, `lib/progression-v2*`) ; un exercice a une compétence fine non projetable ;
un mapping misconception→exercice pointe un exercice inexistant ; la matrice ne classe pas toutes les
compétences de programme. Avertit : compétences en `not-ready`/`foundational`, dimensions `none`
fréquentes. Produit un résumé lisible. Câblé dans `gates:active`.

## 4. Comblement transfert (data/transfer-challenges)
Nouveaux défis T4/T5 pour algo/ds, jsts, secu, cloud — réutilisent `validateTransferChallenge`. Anti-faux-
transfert : pont réel + changement de domaine + multi-étapes + distracteurs (vérifié au gate v42 et par le
classifieur conservateur).

## 5. Tests
- `tests/v43-practice-coverage.test.mjs` : projection, dérivation des dimensions, readiness (pas dérivée du
  volume), matrice couvre toutes les compétences, feedback diagnostique.
- `tests/v43-transfer-gaps.test.mjs` : nouveaux défis valides, refs résolues, auto-cohérence, couvrent les
  compétences ciblées.
- `tests/v42-transfer-challenges.test.mjs` : reste vert (catalogue élargi).

## 6. Sûreté
`progress.json` jamais écrit ; baseline restaurée. Aucune dépendance réseau. Anti-leak préservé sur les
défis.
