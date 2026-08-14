# TSD-040 — Schéma capstone, scoring, evidence & gate v40

Document technique détaillé. Complète ADR-040 / HSD-040. Fige le schéma des capstones, le scoring par
phases (réutilisant `assessment`), le pont evidence/remédiation et le contrat du gate.

## 1. Schéma d'un capstone (`data/capstones/<id>.json`)

```jsonc
{
  "id": "backend-latency-after-release",     // kebab, unique, = nom de fichier
  "title": "L'API ralentit après une release",
  "domain": "Backend / Incident",
  "difficulty": 3,                            // 1..5
  "estimatedMinutes": 25,
  "skills": ["http", "sql", "se"],            // COMPÉTENCES DE PROGRAMME mobilisées
  "lessonRefs": ["sql-performance-indexing", "incident-response"],   // leçons reliées
  "exerciseRefs": ["api-pagination-choice"],  // exercices reliés (remédiation)
  "playbookRefs": ["queue-backlog"],          // playbooks reliés (remédiation)
  "dayRefs": [],                               // jours reliés (optionnel)
  "simulationNote": "Logs/métriques factices ; aucun service réel exécuté.",
  "passThreshold": 0.7,                        // part de questions à réussir (défaut 0.7)
  "context": "Une PME ... le service Commandes ... contraintes ...",  // compréhensible d'un néophyte
  "signal": "Ticket : depuis la release de 14h, les pages de listing sont lentes.", // NE donne PAS la cause
  "artifacts": [
    { "id": "a-p95", "kind": "metrics", "title": "Latence p95", "content": "p95 120ms → 850ms à 14h05", "useful": true },
    { "id": "a-cpu", "kind": "metrics", "title": "CPU", "content": "CPU stable ~40%", "useful": true },
    { "id": "a-sql", "kind": "log", "title": "Requêtes SQL / requête HTTP", "content": "1 → 51 requêtes par page", "useful": true },
    { "id": "a-diff", "kind": "diff", "title": "Diff ORM", "content": "boucle chargeant l'auteur par commande", "useful": true },
    { "id": "a-cache", "kind": "config", "title": "Config cache CDN", "content": "TTL images 24h (inchangé)", "useful": false }
  ],
  "phases": [
    {
      "id": "hypotheses", "kind": "hypotheses", "title": "Hypothèses",
      "prompt": "Quelles causes sont plausibles au vu des artefacts ?",
      "questions": [ { "id": "h1", "taxonomy": "APPLICATION", "kind": "multi",
        "prompt": "...", "options": ["...","..."], "answer": [0,2], "explanation": "..." } ]
    },
    { "id": "diagnosis", "kind": "diagnosis", "title": "Diagnostic",
      "prompt": "Quelle est la cause la plus probable ?",
      "questions": [ { "id": "d1", "taxonomy": "DIAGNOSIS", "kind": "mcq", "prompt": "...",
        "options": ["N+1 introduit par l'ORM","CPU saturé","Cache CDN expiré"], "answer": 0, "explanation": "..." } ] }
    // ... decision / remediation / validation / communication
  ],
  "debrief": {
    "expectedReasoning": "p95 en hausse + CPU stable + explosion du nombre de requêtes SQL → N+1.",
    "keySignals": ["1→51 requêtes SQL/page", "diff ORM en boucle"],
    "redHerrings": ["CPU stable", "config cache CDN inchangée"],
    "alternatives": ["Index manquant (plausible mais le diff montre la boucle)"],
    "tradeoffs": ["Correctif rapide (eager loading) vs structurel (revue des accès)"],
    "conceptsMobilized": ["N+1", "observabilité", "rollback vs roll-forward"],
    "commonMistakes": ["Scaler alors que le CPU n'est pas le goulet"]
  }
}
```

### Familles de questions & invariants
Les questions de phase RÉUTILISENT le modèle d'`assessment` (`mcq`/`multi`/`predict`) et ses invariants
déterministes (index bornés, pas de flottant, `multi` ensembliste). Validées par `validateQuestion` de
`lib/assessment.mjs`.

### Phases (allowlist)
`hypotheses` · `investigation` · `diagnosis` · `decision` · `remediation` · `validation` ·
`communication`. Au moins une phase `diagnosis`. La phase `communication` reste déterministe (choisir les
bons éléments d'un compte rendu), sans jugement rédactionnel.

## 2. API du modèle pur (`lib/capstone.mjs`)
```
export const PHASE_KINDS = ['hypotheses','investigation','diagnosis','decision','remediation','validation','communication'];
export const ARTIFACT_KINDS = ['code','log','metrics','stacktrace','config','manifest','http','sql','architecture','ticket','ci','trace','diff','incident'];

validateCapstone(c) -> { ok, errors[] }          // structure + invariants + ≥1 diagnosis + ≥1 artefact non déterminant
gradeCapstonePhase(phase, responsesById) -> { id, kind, total, passed, ratio, results[] }
gradeCapstone(c, responsesById) -> {
  capstoneId, total, passed, ratio, passedOverall,      // passedOverall = ratio >= passThreshold
  byPhase: [...], mobilizedSkills, weakSkills,           // weakSkills si échec (indice, PAS preuve)
  results[]
}
capstoneToEvidence(c, result, now) -> Evidence|null      // null si échec ; sinon {type:'capstone', skills, title, url, createdAt}
capstoneRemediation(c, result) -> { weakSkills, lessons, exercises, playbooks }  // {} si réussi
capstoneDomainSummary(list) -> { [domain]: count }
```
- **PUR** : aucun I/O, horloge injectée, aucune dépendance réseau/LLM.
- `gradeCapstone` appelle `gradeQuestion` (assessment) pour chaque question — **aucune logique de scoring
  nouvelle**.
- `capstoneToEvidence` calque `mission-state.recordMissionCompletion` (type de preuve + skills), url
  `/capstones/<id>`.

## 3. Extension `lib/learning.mjs`
`EVIDENCE_TYPES` += `'capstone'` (additif, rétro-compatible ; normalisation inchangée).

## 4. Extension `lib/curriculum-graph.mjs`
- `NODE_KINDS` += `'capstone'`.
- `buildCurriculumGraph({ ..., capstones })` : `capstones` =
  `{ id, skills[], lessonRefs[], exerciseRefs[], playbookRefs[] }`. Produit :
  - nœuds `capstone:<id>` ;
  - arêtes `ASSESSES` : `capstone:<id> → skill:<s>` (réutilise le type d'arête V39) ;
  - arêtes `REMEDIATES` : `capstone:<id> → <lessonSlug>` (leçons reliées).
- Anomalie **bloquante** `dead-capstone-ref` : skill inconnu, ou lesson/exercise/playbook introuvable.
  Objectif : **0 bloquant, 0 warning ajouté**.

## 5. Gate `scripts/v40-check.mjs`
Échoue (exit 1) si :
1. `data/capstones/` absent/vide, ou un fichier invalide (`validateCapstone`).
2. `id` fichier ≠ `id` interne, ou `id` dupliqué.
3. Un `skill` hors taxonomie skill du programme.
4. Un `lessonRefs`/`exerciseRefs`/`playbookRefs`/`dayRefs` non résolu.
5. < 3 phases, ou aucune phase `diagnosis`, ou < 3 artefacts, ou aucun artefact `useful:false` (pas de bruit).
6. Invariant déterministe de question violé.
7. **Anti-leak** : la bonne réponse (texte de l'option correcte) d'une question `diagnosis` apparaît
   littéralement dans `signal` ou `context` (la cause serait donnée d'avance).
8. `debrief.expectedReasoning` vide, ou domaine simulé sans `simulationNote`.
9. Couverture minimale : ≥ 4 capstones (sauf réduction honnête documentée), couvrant ≥ 4 domaines.
Le graphe enrichi des capstones reste sans anomalie bloquante. Câblé dans `gates:active`.

## 6. Serveur (`lib/capstones-server.ts`)
Miroir d'`assessments-server.ts` : lit `data/capstones/*.json`, valide, expose `listCapstones()` /
`getCapstone(id)`. Lecture seule.

## 7. Tests (CP4/CP10/CP14)
- `tests/v40-capstone-model.test.mjs` : validation, scoring par phases, evidence, remédiation.
- `tests/v40-catalogue.test.mjs` : catalogue réel valide, refs résolues, auto-cohérence, ≥1 diagnosis,
  ≥1 artefact bruit, anti-leak.
- `tests/v40-graph.test.mjs` : arêtes capstone, `dead-capstone-ref`, 0 bloquant, 0 warning ajouté.
- `tests/v40-loop.test.mjs` : capstone réussi → evidence → `skillStats` `demonstrated` ; échec →
  remédiation exploitable ; jamais « mastered » automatique.

## 8. Sûreté
- Bornes strictes (phases, questions, artefacts, tailles). Clés dangereuses neutralisées.
- `progress.json` jamais écrit par gate/tests/UX ; baseline restaurée au CP15.
