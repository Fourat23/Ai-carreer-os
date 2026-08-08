# TSD-031 — Spécification technique : gate v31:check, Curriculum Graph & ledger d'audit

Document de spécification technique du Sprint V31. Complète ADR-031 et HSD-031. Tout est PUR,
local, sans réseau, sans nouveau moteur ni nouveau runtime.

## 1. Plan V31 — `docs/architecture/v31-lessons-plan.json`
```json
{
  "sprint": "V31",
  "baselineRef": "<sha CP1>",
  "newLessons": [],
  "hardenedLegacy": ["rag-fundamentals", "embeddings", "chunking-strategies",
    "vector-databases", "retrieval-reranking", "rag-evaluation", "ai-evaluation",
    "structured-outputs-tools", "agent-workflows-orchestration",
    "prompt-injection-defense", "prompt-engineering"],
  "critical": ["rag-fundamentals", "..."],
  "prereq": { "chunking-strategies": ["embeddings"], "...": [] }
}
```
- `newLessons` : attendu vide (V31 durcit la chaîne existante, ne crée pas de leçon « pour
  faire nombre »).
- `hardenedLegacy` : chaîne RAG + agents/outputs/sécurité durcie.
- `critical` : leçons devant porter au moins un `practiceRef`.
- `prereq` : graphe de prérequis V31 (slug → [slugs]) validé acyclique ; peut référencer des
  slugs hors périmètre (déjà existants).

## 2. Gate `scripts/v31-check.mjs` (structurel)
`npm run v31:check`. Lit le plan V31. Robuste : passe si plan absent/vide. Pour chaque leçon du
périmètre : on-ramp avant objectif ; prérequis ≥ 12 mots (hors liens) ; vocabulaire ; sections
minimales ; pas de placeholder ; liens internes valides ; `practiceRefs` résolus (obligatoires
pour `critical`) ; graphe de prérequis acyclique ; réel/simulé (blockingSignals) ; signaux
densité/jargon en avertissement (proxys non bloquants). Ne juge jamais la profondeur par la
longueur. Ajouté à `gates:active` ; `v26→v30:check` restent actifs.

## 3. Curriculum Graph — `lib/curriculum-graph.mjs` (read-model dérivé, PUR)
Fonction `buildCurriculumGraph({ program, lessons, prereqMaps, exercises, missions, playbooks,
labs })` retournant `{ nodes, edges }` reconstruits depuis les sources EXISTANTES :
- **Nœuds** : `lesson:<slug>`, `exercise:<id>`, `mission:<id>`, `playbook:<id>`, `lab:<id>`,
  `skill:<id>`, `track:<id>`, `day:<n>` (selon disponibilité).
- **Arêtes** : `REQUIRES` (lesson→lesson, union des `prereq` des plans v27→v31), `PRACTICES`
  (lesson→exercise/lab/mission/playbook via `practiceRefs`), `BUILDS_SKILL` (lesson→skill via
  `skills`), `BELONGS_TO_TRACK` (dérivé du catalogue si fourni).
- **Aucune persistance** : le graphe est reconstruit à la demande. Aucune donnée privée
  (solutions, tests privés) n'entre dans le graphe.

Fonction `auditCurriculumGraph(graph)` retournant une liste d'anomalies typées :
`prereq-cycle`, `dead-prereq` (prérequis vers une leçon inconnue), `dead-practiceref`
(practiceRef non résolu), `concept-not-practiced` (leçon d'un domaine « pratiquable » sans
aucun `PRACTICES`), `practice-without-lesson` (exercice référencé par aucune leçon — informatif),
`skill-without-practice`, `orphan-lesson` (ni prérequis entrant/sortant ni pratique ni skill).
Chaque anomalie a une `severity` (`blocking` | `warning` | `info`). Les `blocking` (cycle,
dead-prereq, dead-practiceref) font échouer le test d'intégrité ; les `warning`/`info` sont
rapportées (CP11) sans bloquer.

## 4. Tests
- `tests/v31-pedagogy.test.mjs` : plan + ledger + practiceRefs + graphe de prérequis acyclique.
- `tests/curriculum-graph.test.mjs` : construction pure déterministe, résolution des refs,
  acyclicité globale (union v27→v31), aucune anomalie `blocking`, et cas synthétiques
  (détection d'un cycle injecté, d'un prérequis mort injecté).

## 5. Ledger d'audit `docs/architecture/v31-pedagogy-audit.json`
Même format que v20/v27→v30 (validé par `validateAuditLedger`) : items `{ id, kind:'content',
sourcePath, recent, scores (16 dim 0-4), notes }`. Scores APRÈS ; avant/après et matrice dans
`docs/PEDAGOGICAL-AUDIT-V31.md`. Ne contient que des items conformes.

## 6. Pratique (réutilisation des runtimes existants)
Exercices RAG = raisonnement déterministe en `node-js` (cosine ranking sur vecteurs fournis,
choix de stratégie de chunking, top-k, diagnostic retrieval-vs-generation, validation de sortie
structurée). Contrat standard (starter faux échouant ≥1 test public, référence verte, ≥1 test
privé, aucune fuite, skills connus). Aucune fausse exécution d'embeddings/LLM ; frontière
simulé/réel dans le résumé de l'exercice.

## 7. Surface pédagogique (optionnelle, CP8/17)
Si intégrée, la page leçon lit le Curriculum Graph via une fonction serveur pure ; aucune
logique dupliquée dans le composant ; seules des métadonnées (slugs voisins) transitent, pas
les contenus complets. Mobile obligatoire.

## 8. Contraintes de sûreté
Aucun `eval`/`exec`/shell/réseau ; scripts et graphe purs en lecture seule ; aucune solution ni
test privé exposé (ni via le graphe) ; `progress.json` sauvegardé/restauré, jamais committé ;
génération déterministe (seul `generatedAt` varie) ; runtimes lourds (CodeMirror, Labs)
inchangés et lazy.
