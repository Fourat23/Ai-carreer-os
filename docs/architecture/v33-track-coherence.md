# V33 — Audit de cohérence des parcours : la chaîne ML → DL → Transformers → LLMOps

**Sprint** : V33.
**Objet** : prouver qu'un apprenant peut suivre la chaîne
« données → features → apprentissage → évaluation → réseaux de neurones → attention →
transformers → LLM → RAG/agents → observabilité/coût/production » sans trou majeur, et que le
Curriculum Graph détecte les ruptures.
**Méthode** : Curriculum Graph III (`lib/curriculum-graph.mjs`) + `tests/v33-e2e.test.mjs`.
Aucune nouvelle source de vérité.

---

## 1. La chaîne ML/DL/LLMOps : prérequis → leçon → pratique

| # | Leçon | Prérequis directs | Pratique associée |
| --- | --- | --- | --- |
| 1 | `machine-learning-basics` | (fondations ML, V30) | ml-metric-choice |
| 2 | `statistics-for-ml` | (V30) | ml-split-choice |
| 3 | `feature-engineering` | machine-learning-basics, statistics-for-ml | ml-data-leakage, ml-feature-encoding |
| 4 | `model-evaluation` | (V30) | ml-metric-choice, ml-confusion-metric, ml-overfit-diagnose |
| 5 | `scikit-learn-workflow` | machine-learning-basics, feature-engineering, model-evaluation | ml-split-choice, ml-data-leakage |
| 6 | `neural-networks` | machine-learning-basics, statistics-for-ml | nn-forward-neuron, ml-overfit-diagnose |
| 7 | `embeddings` | llm-fundamentals | rag-cosine-rank |
| 8 | `transformers` | neural-networks, embeddings | attention-argmax |
| 9 | `llm-fundamentals` | machine-learning-basics, http-rest-json | (fondations LLM) |
| 10 | `llm-cost-optimization` | llm-fundamentals | llm-cost-estimate |
| 11 | `llm-observability` | llm-fundamentals, observability-fundamentals | llm-cost-estimate |

**Invariants vérifiés** (test e2e) : graphe acyclique ; `transformers` remonte à
`neural-networks` puis à `machine-learning-basics` ; `llm-observability` remonte à
`llm-fundamentals` ; les 6 leçons critiques V33 portent une pratique **résolue**.

### Mécanismes désormais PRATIQUÉS (auparavant : théorie seule)
détection de fuite · choix de split · encodage de features · passe avant d'un neurone ·
diagnostic overfit/underfit · matrice de confusion (precision/recall) · argmax d'attention ·
estimation de coût LLM. Tous déterministes, étiquetés SIMULATION.

---

## 2. Parcours audités

9 entrées de catalogue. **6 parcours réellement dotés de jours** : AI Engineer Foundations
(365 j — contient toute la chaîne ML/DL/LLMOps), Full-Stack TypeScript (119 j), Backend (85 j),
Systems & Cloud (31 j), AppSec & Cloud Security (15 j), Cloud/DevOps (29 j).
**3 entrées annoncées (0 jour résolu)** : `ai-fullstack-v1`, `frontend-engineer-v1`,
`data-ml-v1`.

### Décision sur `data-ml-v1` (parcours Data/ML)
Même après l'enrichissement ML de V33, `data-ml-v1` **résout 0 jour** : il n'a ni mapping de
modules ni séquence de journées propre. Il **reste ANNONCÉ**. L'activer parce que du contenu ML
existe serait du greenwashing (contenu ≠ parcours structuré). Ce qui manque pour l'activer
honnêtement : une structure de modules → jours dédiée Data/ML, des missions/preuves de parcours,
et une revue de cohérence de bout en bout. Reporté (candidat V34).

La chaîne ML/DL/LLMOps est donc pleinement exploitable **via le parcours AI Engineer
Foundations**, qui la contient déjà.

---

## 3. Diagnostics du Curriculum Graph III (données réelles)

**0 anomalie bloquante.** **0 orphan-practice.** Warnings **15 (fin V32) → 13** :

| Type (warning) | Nombre | Note |
| --- | --- | --- |
| `advanced-before-prerequisite` | 6 | inchangé — cross-domaine (technical-documentation, api-design-basics, cloud-finops, k8s-why-architecture, metrics-percentiles) |
| `concept-without-foundation` | 4 | **résorbé de 8 → 4** par les prérequis déclarés V33 ; restants non-ML (caching-performance, git-advanced, monitoring-production, system-design-interview) → V34 |
| `concept-not-practiced` | 1 | skill:patterns (design-patterns-intro, hors thème) → V34 |
| `foundation-without-practice` | 2 | **nouveau (V33)** : llm-fundamentals (prérequis de 9) et docker-containers (prérequis de 3), sans pratique reliée → cibles prioritaires V34 |

**Triage des warnings** (conforme à la consigne « ne pas maquiller ») :
- Les 4 `concept-without-foundation` ML/LLM ont été corrigés à la SOURCE (prérequis déclarés).
- Les 4 restants et le `concept-not-practiced` sont HORS thème V33 (git, cloud, design
  patterns) : documentés comme dette V34, pas masqués.
- Les 6 `advanced-before-prerequisite` sont des ordres de niveau cross-domaine à revoir au cas
  par cas (certains peuvent être légitimes) : documentés.
- Les 2 `foundation-without-practice` sont des signaux actionnables neufs : llm-fundamentals
  mériterait une pratique (candidat V34).

---

## 4. Frontière réel / simulé
Aucun entraînement, aucun appel de modèle, aucune dépendance ML (numpy/sklearn/torch),
aucun réseau. Les exercices calculent RÉELLEMENT en local (métriques, forward-pass, coût) sur
des données fournies ; tous étiquetés SIMULATION (vérifié par test). Les mentions PyTorch/NumPy
dans les leçons décrivent le travail hors plateforme de l'apprenant, sans fausse exécution.

---

## 5. Détection automatique de rupture (récapitulatif)

| Anomalie | Sévérité | Corpus |
| --- | --- | --- |
| prereq-cycle / dead-prereq / dead-practiceref | bloquant | 0 |
| advanced-before-prerequisite | warning | 6 |
| concept-without-foundation | warning | 4 |
| foundation-without-practice | warning | 2 |
| concept-not-practiced | warning | 1 |
| orphan-practice / orphan-lesson | info | 0 |

La chaîne reste gardée par le code : toute rupture bloquante fait échouer la CI ; les
heuristiques restent informatives.
