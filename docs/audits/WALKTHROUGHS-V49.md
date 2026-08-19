# V49 — Walkthroughs professionnels (bout en bout)

Onze parcours (un par grande famille) : néophyte → cours → exercice → diagnostic
→ variation → transfert → scénario pro → preuve → remédiation. On détecte saut
conceptuel, lien mort, exercice trop simple, D4/D5 artificiel, scénario
inaccessible. Tous les artefacts cités sont RÉELS.

---

### 1. Frontend (jsts) — Léa
Cours `react-application-states` → exercices `react-debug-*` → misconception
`stale-closure` (état figé dans un effet) → scénario `frontend-react-regression`
(divulgation progressive) → preuve : capstone réussi. **RAS**, chaîne complète.

### 2. Backend/API (http) — Karim
Cours HTTP/API → `sqlite-*` + endpoints → transfert `budget-then-escalate`
(retry+DLQ → agent) → scénario `backend-latency-after-release`. Transfert
`llm-schema-to-api-validation` renforce « valider à la frontière ». **RAS**.

### 3. SQL/Data (sql) — Sofia
Cours SQL → `sqlite-index-explain` (EXPLAIN QUERY PLAN réel via sqlite3) →
misconception `sql-concat-input` (injection) → scénario `backend-latency`. D5
`sqlite-transaction-last-seat` (concurrence). **RAS**.

### 4. Python (python) — Tom
Cours Python → `pdx-*` (pandas RÉEL) → misconception `string-numbers-aggregate`
→ scénario `perf-quadratic-incident` (O(n²), profil, index). Le scénario mobilise
python+algo+ds : boucle complète. **RAS**.

### 5. ML (ml) — Amina
Cours `machine-learning-basics` → `skl-pipeline-cv` (fuite en CV, sklearn RÉEL) →
misconceptions `scaler-outside-pipeline`, `baseline-blindness` → scénario
`ml-imbalance-fraud-incident` (accuracy trompeuse, seuil au coût). **RAS**.

### 6. Deep Learning (dl) — Ravi (NOUVEAU V49)
Cours `neural-networks` → `dl-forward-2layer` (NumPy RÉEL) → `dl-lr-stability`,
`dl-vanishing-gradient` (D5) → misconceptions `bigger-lr-faster`,
`deeper-always-better` → transferts `dl-lr-to-stepsize`, `dl-overfit-to-generalization`
→ scénario `dl-training-diverges` (NaN = lr × features non normalisées ; rejette
« ajouter des couches »). Chaîne **désormais complète** (était rompue avant V49).

### 7. RAG (rag) — Yanis
Cours `rag-fundamentals` → `rag-retrieval-vs-generation`, `rag-recall-precision-at-k`
→ misconception `retrieval-equals-generation` → scénario `rag-hallucination-grounding`
(échec de récupération → ancrage). **RAS**.

### 8. LLM (llm) — Nadia (renforcé V49)
Cours `llm-fundamentals` → `llm-context-budget-truncate`, `llm-cost-budget-plan`
(D5) → misconception `more-context-better` → transferts `llm-context-to-eviction`,
`llm-schema-to-api-validation` → scénario `llm-context-budget-regression`. Le
transfert manquant est **comblé**. **RAS**.

### 9. Agents (agents) — Malik
Cours `agents-fundamentals` → `agent-cycle-index`, `agent-excessive-agency` (D5) →
misconception `agent-needs-no-guardrail` → scénario `agent-tool-loop-incident`
(escalade supprimée + garde-boucle). **RAS**.

### 10. Architecture/Patterns (archi/patterns) — Sophie
Cours `architecture-basics`, `design-patterns-intro` → `arch-circuit-breaker` (D5),
`patterns-composition-vs-inheritance` → misconceptions `inherit-to-reuse`,
`layers-any-direction` → transferts `patterns-yagni-to-infra`, **`archi-scale-shift`**
(T0 correct → T1 mauvais) → scénario `legacy-service-refactor`. **RAS** ; le
transfert far d'architecture est le point fort V49.

### 11. Sécurité / Cloud (secu/gitlinux/cloud) — Idris
Cours `linux-filesystem-permissions`, `deployment-secrets` → `sec-secret-*` →
misconception `sql-concat-input`/secrets → transfert `gitlinux-perms-to-iam`
(chmod → IAM) → scénario `least-privilege-incident` (secu+gitlinux). **Cloud** :
labs `EXTERNAL_ENVIRONMENT_REQUIRED` honnêtes (Docker/K8s/AWS) — frontière claire,
non bloquante pour le raisonnement.

---

## Problèmes détectés & traités

- **Aucun lien mort** (gates v42/v49 verts). **Aucun scénario inaccessible**
  (référence gagnante vérifiée pour chaque capstone).
- **D4/D5 artificiels** : contrôlés — la profondeur `ds`/`gitlinux`/`patterns`
  reste mince (signalée honnêtement dans PROFESSIONAL-COVERAGE, dette V50), mais
  aucun exercice n'est faussement étiqueté D4/D5.
- **Saut conceptuel `dl`** (cours → aucune pratique de mécanisme) : **corrigé** par
  les 7 exercices DL exécutables.
