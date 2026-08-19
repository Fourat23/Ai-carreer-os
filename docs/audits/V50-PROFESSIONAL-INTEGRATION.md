# V50 — Intégration professionnelle, contrats externes & non-code

## 1. Scénarios professionnels (CP8) — placement

Les 13 capstones/scénarios ne sont pas mappés dans `day-exercises.json` (celui-ci
n'accueille que des exercices `/lab`) : ils vivent sur `/capstones`. Leur
**placement temporel** est vérifié analytiquement — chaque scénario doit arriver
APRÈS l'introduction et une pratique suffisante de ses compétences :

| Scénario | Compétences | Prérequis introduits avant | Placement conseillé |
|----------|-------------|:--:|:--:|
| `perf-quadratic-incident` | algo, ds, python | d82 (python) | fin S1 / M5-6 |
| `backend-latency-after-release` | http, sql, se | d140 (sql) | M5 |
| `data-ml-validation-production-gap` | ml, evalia | d182 (ml) | M6-7 |
| `ml-imbalance-fraud-incident` | ml, evalia | d182 | M7 |
| `dl-training-diverges` | dl, ml | d203 (dl) | M7 |
| `applied-ai-rag-regression` | rag, llm, evalia | d253 (evalia) | M9 |
| `rag-hallucination-grounding` | rag, llm, evalia | d253 | M9 |
| `llm-context-budget-regression` | llm, evalia | d253 | M9 |
| `agent-tool-loop-incident` | agents, se | d274 (agents) | M10 |
| `legacy-service-refactor` | archi, patterns, se | d111 (se) | M4+ |
| `least-privilege-incident` | secu, gitlinux | d67 (secu) | M3+ |
| `cloud-k8s-partial-outage` | cloud, se | external | M10-11 |
| `frontend-react-regression` | jsts, comm | d119 (jsts) | M4 |

Chaque scénario est un aboutissement de synthèse : ses prérequis sont bien
introduits avant sa fenêtre. Aucun scénario n'arrive avant ses fondations.

## 2. External Practice Contracts (CP10) — Cloud honnête

`cloud` reste `EXTERNAL_ENVIRONMENT_REQUIRED` : aucune fausse infrastructure. Le
curriculum énonce des **contrats de pratique externe** (déjà présents dans
`data/external-tasks.json`, 7 labs Docker/Compose/K8s/AWS). Chaque contrat
précise : ce que l'apprenant fait DANS AI Career OS (raisonnement, manifests,
diagnostic sur artefacts), ce qu'il doit réaliser DEHORS (build/run/apply réels),
à quel moment (M10-11, après secu/archi), l'objectif observable et **la preuve à
conserver** (sortie de `docker inspect`, `kubectl get endpoints`, refus
`AccessDenied`).

Frontière : `LOCAL_REAL` (raisonnement/diagnostic exécuté) vs
`EXTERNAL_ENVIRONMENT_REQUIRED` (exécution d'infra) — jamais confondus.

## 3. Communication & Autonomie (CP11) — non-code, sans faux score

`comm` et `autonomy` sont `NON_CODE`. On ne fabrique aucune note magique. Leur
preuve est **qualitative et structurée**, adossée aux artefacts existants :

- **comm** : la phase `communication` des 13 scénarios exige un résumé honnête
  (cause → correctif → preuve) ; les débriefs de capstone (`debrief.expectedReasoning`)
  fournissent la référence attendue. Évidence : « expliquer une décision »,
  « annoncer un risque », « écrire un post-mortem ».
- **autonomy** : s'observe sur les capstones (mener une investigation multi-phase
  sans guidage) et les missions (livrable). Évidence : « justifier un compromis »,
  « documenter une investigation », « décider sous contraintes ».

Aucun exercice `/lab` n'est fabriqué pour ces compétences : ce serait un faux
signal. Leur intégration au parcours passe par les phases de scénario et les
jours de mission/projet déjà présents (comm enseigné jusqu'à d364, autonomy
jusqu'à d365).
