# TSD-042 — Schémas transfert, rubrique, misconceptions & gate v42

Document technique. Complète ADR/HSD-042. Fige les schémas et contrats.

## 1. `lib/transfer-taxonomy.mjs` (PUR)
```
export const TRANSFER_LEVELS = ['T0','T1','T2','T3','T4','T5'];
export const TRANSFER_LABEL = { T0:'Recall', T1:'Understanding', T2:'Application proche',
  T3:'Diagnostic', T4:'Near transfer', T5:'Deep / Far transfer' };
// Mapping documenté vers la taxonomie de Bloom d'assessment.mjs.
export const BLOOM_TO_TRANSFER = { RECALL:'T0', UNDERSTANDING:'T1', APPLICATION:'T2', DIAGNOSIS:'T3', TRANSFER:'T4' };

export const TRANSFER_RUBRIC = [ // 10 critères, notés 0..3 lors des audits humains
  'conceptual-recognition','contextual-novelty','distractor-quality','hypothesis-competition',
  'reasoning-depth','justification-requirement','ambiguity-control','professional-authenticity',
  'feedback-quality','remediability' ];

isTransferLevel(x) -> boolean
// Classifieur CONSERVATEUR : renvoie un niveau PLANCHER prudent + refuse T5 sans preuve structurelle.
suggestTransferLevel(question, meta) -> { level, reasons[], canBeT5 }
//   meta = { bridge?:string, crossDomain?:boolean, steps?:number }
//   Règles : multi/predict + bridge + crossDomain + steps>=2 → T4 (T5 si bridge riche ET crossDomain ET steps>=2 ET distractors>=3) ;
//            mcq simple sans bridge → borne à T2/T3 ; jamais T5 sans (bridge && crossDomain).
```

## 2. Schéma `data/transfer-challenges/<id>.json`
```jsonc
{
  "id": "idempotence-http-to-queue",
  "title": "Reconnaître l'idempotence hors de son contexte d'origine",
  "sourceSkill": "http",                 // compétence de programme (concept source)
  "skills": ["http", "archi"],           // compétences mobilisées (programme)
  "transferLevel": "T5",                 // ∈ TRANSFER_LEVELS (T4|T5 pour un défi)
  "bridge": "idempotence HTTP → consumer de file : rejouer sans dommage",  // pont conceptuel, non vide pour T5
  "crossDomain": true,
  "targetContext": "Traitement de messages d'une file (contexte différent de l'API HTTP)",
  "lessonRefs": ["api-production-contracts", "async-messaging-queues"],
  "simulationNote": "File décrite ; aucun broker réel.",
  "questions": [ /* modèle assessment EXACT : mcq|multi|predict, invariants déterministes */ ]
}
```
Invariants : `transferLevel ∈ {T4,T5}` ; T5 ⇒ `bridge` non vide ET `crossDomain:true` ; questions valides
via `validateQuestion` ; ≥ 1 question `multi` ou `predict` (discrimination/raisonnement) ; auto-cohérence
(réponses déclarées → 100 %).

## 3. `lib/transfer-challenge.mjs` (PUR)
```
validateTransferChallenge(c) -> { ok, errors[] }   // structure + invariants + réutilise validateQuestion
gradeTransferChallenge(c, responsesById) -> {...}   // réutilise gradeQuestion ; { total, passed, ratio, passedOverall, transferLevel, results }
```

## 4. `lib/misconceptions.mjs` (PUR)
```
export const MISCONCEPTIONS = [
  { id:'retry-equals-idempotence', skill:'archi', wrong:'réessayer suffit, pas besoin d\'idempotence',
    right:'un retry PEUT dupliquer un effet ; l\'idempotence rend la répétition sans dommage',
    lessonRefs:['async-messaging-queues','api-production-contracts'], exerciseRefs:['queue-idempotent-consumer'] },
  ... // percentile≠moyenne, index-accélère-tout, secret-k8s-chiffré, useEffect-lifecycle, retrieval≠génération, correlation≠causalité
];
listMisconceptions(skill?) -> Misconception[]
remediateMisconception(id) -> { id, right, lessonRefs, exerciseRefs } | null
```
Chaque entrée est reliée à des leçons/exercices RÉELS (vérifié par le gate).

## 5. Curriculum Graph
- `buildCurriculumGraph({ ..., transferChallenges })` : nœud `transfer` + arête `ASSESSES` (→ skill) ;
  anomalie **bloquante** `dead-transfer-ref` (skill/leçon inconnu).
- Diagnostic **avertissement** `skill-without-transfer` : une compétence de `known.structuralSkills`
  enseignée (buildsSkill) + pratiquée (practices) mais sans transfer-challenge relié. Jamais bloquant,
  jamais émis hors de la liste structurante (pas de faux positif).

## 6. Gate `scripts/v42-check.mjs`
Échoue si : challenge invalide ; id ≠ fichier ou dupliqué ; skill hors programme ; lessonRefs non résolus ;
`transferLevel` hors allowlist ; T5 sans bridge/crossDomain ; auto-incohérence ; misconception pointant une
leçon/exo inexistant ; graphe (avec challenges) contient un `dead-transfer-ref`. Avertit si aucun T5. Câblé
dans `gates:active`.

## 7. Tests
- `tests/v42-transfer-taxonomy.test.mjs` : niveaux, mapping, classifieur (refuse T5 sans preuve).
- `tests/v42-transfer-challenges.test.mjs` : catalogue valide, refs, auto-cohérence, T5⇒bridge, ≥1 T5.
- `tests/v42-misconceptions.test.mjs` : refs résolues, résolveur.
- `tests/v42-graph.test.mjs` : arêtes transfer, dead-transfer-ref, skill-without-transfer, 0 bloquant.

## 8. Sûreté
`progress.json` jamais écrit ; baseline restaurée. Bornes strictes ; clés dangereuses neutralisées.
