# TSD-039 — Schémas d'évaluation, gate v39 & extension du graphe

Document technique détaillé. Complète ADR-039 / HSD-039. Fige les schémas, les invariants de
correction déterministe, le contrat du gate et l'extension du Curriculum Graph.

## 1. Schéma d'une évaluation (`data/assessments/<id>.json`)

```jsonc
{
  "id": "system-design-scaling-diagnose",     // kebab, unique, = nom de fichier
  "title": "Diagnostiquer un système qui sature",
  "domain": "System Design",                   // libellé humain (affichage)
  "skills": ["archi", "se"],                    // COMPÉTENCES DE PROGRAMME (allowlist skill du programme)
  "lessonRefs": ["system-design-scaling"],     // leçons enseignant le sujet (slugs existants)
  "remediation": ["system-design-scaling"],    // leçons à revoir si échec (slugs existants)
  "simulationNote": "Système décrit ; aucun vrai cluster.",  // optionnel (domaines simulés)
  "passThreshold": 0.7,                          // optionnel, défaut 0.7 : part de questions à réussir
  "questions": [
    {
      "id": "q1",
      "taxonomy": "DIAGNOSIS",                  // RECALL|UNDERSTANDING|APPLICATION|DIAGNOSIS|TRANSFER
      "kind": "mcq",                            // mcq | multi | predict
      "prompt": "Le CPU d'une seule instance est à 100 %...",
      "options": ["Ajouter un index", "Scaler horizontalement", "Changer de langage"],
      "answer": 1,                              // mcq : index entier de la bonne option
      "explanation": "Une instance saturée en CPU se traite par scaling horizontal + LB."
    },
    {
      "id": "q2", "taxonomy": "APPLICATION", "kind": "multi",
      "prompt": "Quelles conditions rendent le scaling horizontal possible ?",
      "options": ["Service stateless", "État en session locale", "Load balancer", "Une seule DB non répliquée"],
      "answer": [0, 2],                         // multi : sous-ensemble EXACT d'indices (égalité ensembliste)
      "explanation": "Stateless + LB. L'état local et la DB unique l'empêchent."
    },
    {
      "id": "q3", "taxonomy": "TRANSFER", "kind": "predict",
      "prompt": "10 000 req/s, 800 req/s par instance, marge 25 % → nombre d'instances ?",
      "answer": "17",                           // predict : chaîne OU entier ; JAMAIS de flottant
      "explanation": "ceil(10000/800)=13 ; ceil(13×1,25)=ceil(16,25)=17 instances."
    }
  ]
}
```

### Invariants de correction déterministe (obligatoires)
- `mcq` : `answer` = entier ∈ [0, options.length). `options` ≥ 2, non vides.
- `multi` : `answer` = tableau d'entiers **distincts et triés** ∈ [0, options.length), non vide.
  Correction = **égalité d'ensemble** entre réponse apprenant et `answer`.
- `predict` : `answer` = chaîne **ou** entier. Correction = comparaison stricte après `trim` (chaînes).
  **Interdit** : flottant en `answer` (égalité de flottant non déterministe → rejet au gate).
- Chaque question : `explanation` non vide (feedback), `taxonomy` ∈ allowlist, `id` unique dans l'éval.

## 2. API du modèle pur (`lib/assessment.mjs`)

```
export const TAXONOMY = ['RECALL','UNDERSTANDING','APPLICATION','DIAGNOSIS','TRANSFER'];
export const QUESTION_KINDS = ['mcq','multi','predict'];

validateAssessment(a) -> { ok, errors[] }          // structure + invariants déterministes
gradeQuestion(q, response) -> { id, taxonomy, passed, expected, given, explanation }
gradeAssessment(a, responsesById) -> {
  assessmentId, total, passed, ratio, passedOverall,   // passedOverall = ratio >= passThreshold
  byTaxonomy: { [level]: { total, passed } },
  weakSkills: string[],            // skills de l'éval si échec global (indice, PAS preuve)
  results: [...gradeQuestion]
}
assessmentTaxonomySummary(list) -> { [level]: count }  // couverture du catalogue
assessmentToEvidence(a, result, now) -> Evidence|null   // PONT : null si échec ; sinon {type:'assessment', skills, title, createdAt}
```

- **PUR** : aucun I/O, aucune exécution, aucune horloge implicite (injectée).
- `gradeAssessment` ne dépend d'aucun réseau/LLM : uniquement des comparaisons de données.
- `assessmentToEvidence` matérialise la décision D2 : une évaluation **réussie** peut devenir une
  preuve typée `assessment` consommée par `skill-state.mjs` (aucune nouvelle règle d'état).

## 3. Extension `lib/learning.mjs` (additif, rétro-compatible)
`EVIDENCE_TYPES` : ajout de `'assessment'` en fin de liste (les anciens types restent valides ;
normalisation inchangée). Aucun autre champ modifié ; le schéma V6 reste un sur-ensemble.

## 4. Extension du Curriculum Graph (`lib/curriculum-graph.mjs`)
- `NODE_KINDS` += `'assessment'` ; `EDGE_KINDS` += `'ASSESSES'`, `'REMEDIATES'`.
- `buildCurriculumGraph({ ..., assessments })` : `assessments` = tableau
  `{ id, skills[], lessonRefs[], remediation[] }`. Produit :
  - nœuds `assessment:<id>` ;
  - arêtes `ASSESSES` : `assessment:<id> → skill:<s>` (compétence évaluée) ;
  - arêtes `REMEDIATES` : `assessment:<id> → <lessonSlug>` (leçon de remédiation).
- Nouvelle anomalie **bloquante** `dead-assessment-ref` : `remediation`/`lessonRefs` pointant une
  leçon inexistante, ou `skills` hors des compétences connues. Objectif : **0 bloquant**.
- Aucune anomalie d'ordre nouvelle (pas de faux positif) → warnings stables.

## 5. Gate `scripts/v39-check.mjs` (structure, jamais longueur)
Vérifie et **échoue (exit 1)** si :
1. `data/assessments/` absent ou vide, ou un fichier JSON invalide (`validateAssessment`).
2. Un `skill` hors de la taxonomie **skill du programme** (`data/program.json.skills`).
3. Un `lessonRefs`/`remediation` pointant une leçon inexistante.
4. Une `taxonomy`/`kind` hors allowlist, ou un invariant déterministe violé (flottant, index hors
   bornes, `answer` mal formé, `multi` non ensembliste).
5. Couverture minimale non atteinte : au moins **1 question `TRANSFER`** et **1 `DIAGNOSIS`** dans le
   catalogue, et ≥ 12 évaluations.
6. Un `id` de fichier ≠ `id` interne, ou un `id` dupliqué.
Affiche un résumé (nb évaluations, répartition taxonomie, compétences couvertes). Câblé en fin de
`gates:active`.

## 6. Serveur de chargement (`lib/assessments-server.ts`)
Miroir de `lib/exercises-server.ts` : lit `data/assessments/*.json`, valide, expose `getAssessments()`
et `getAssessment(id)`. Utilisé par `app/evaluations` et les reliures. Lecture seule.

## 7. Tests (CP9)
- `tests/v39-assessment-model.test.mjs` : validate (cas valides/invalides), grade déterministe (mcq/
  multi/predict), byTaxonomy, pont evidence (échec → null).
- `tests/v39-catalogue.test.mjs` : chaque fichier valide ; skills ⊂ programme ; lessonRefs/remediation
  résolus ; couverture taxonomie ; ids uniques.
- `tests/v39-graph.test.mjs` : arêtes ASSESSES/REMEDIATES construites ; `dead-assessment-ref` détecté
  sur données fabriquées ; graphe réel 0 bloquant.
- `tests/v39-skill-state-integration.test.mjs` : une preuve `assessment` fait passer une compétence à
  `demonstrated` (non-régression des règles existantes).

## 8. Sécurité & sûreté
- Bornes strictes (nb questions, nb options, tailles de chaînes) comme dans `exercise.mjs`.
- Clés dangereuses (`__proto__`…) neutralisées.
- `progress.json` jamais écrit par le gate/les tests ; baseline restaurée au CP13.
