# V32 — Audit de cohérence des parcours : la chaîne AGENTS / TOOL USE / SÛRETÉ

**Sprint** : V32 — Applied AI II.
**Objet** : prouver qu'un apprenant peut suivre la chaîne
« intention → plan → choix d'outil → validation d'arguments → action → observation →
état → décision → terminaison → HITL → sécurité → évaluation » sans trou pédagogique
majeur, et que le Curriculum Graph détecte davantage de ruptures.
**Méthode** : appuyé sur le Curriculum Graph II (`lib/curriculum-graph.mjs`) et
`tests/v32-e2e.test.mjs`. Aucune nouvelle source de vérité : agrégation des leçons,
prérequis (union v27→v32), pratiques, compétences, niveaux.

---

## 1. La chaîne agentique : prérequis → leçon → pratique

| # | Leçon | Prérequis directs | Pratique associée |
| --- | --- | --- | --- |
| 1 | `llm-fundamentals` | machine-learning-basics, http-rest-json | (fondations LLM, V30) |
| 2 | `structured-outputs-tools` | llm-fundamentals, typescript-basics, api-design-basics | rag-structured-validate |
| 3 | `agents-fundamentals` | llm-fundamentals, api-design-basics | **agent-tool-select, agent-state-transition** |
| 4 | `agent-workflows-orchestration` | agents-fundamentals, structured-outputs-tools, architecture-basics | **agent-loop-detect, agent-state-transition, agent-tool-validate, agent-retry-policy** |
| 5 | `prompt-engineering` | llm-fundamentals, error-handling | rag-structured-validate |
| 6 | `prompt-injection-defense` | llm-fundamentals, rag-fundamentals, agents-fundamentals, ai-security | prompt-injection-classify, **agent-hitl-decision** |

**Invariant vérifié** (test e2e) : `agent-workflows-orchestration` et
`prompt-injection-defense` remontent transitivement jusqu'à `llm-fundamentals`. Aucune
leçon avancée ne flotte sans fondement. Les 4 leçons critiques V32 portent toutes une
pratique **résolue**.

### Mécanismes désormais PRATIQUÉS (auparavant : théorie seule)
choix d'outil · machine à états (transition légale/illégale) · détection de boucle
(budget + cycle) · validation d'arguments (type/enum/inconnu) · escalade
human-in-the-loop · politique de retry (retry/fail/ask-human). Tous déterministes,
étiquetés SIMULATION.

---

## 2. Parcours audités

9 parcours dans le catalogue (6 disponibles + 3 annoncés). La chaîne agentique
appartient au parcours **AI Engineer Foundations** (`ai-engineer-foundations-v1`) et
irrigue **AI Full-Stack** (`ai-fullstack-v1`). Aucune journée/parcours n'a été modifié :
l'audit ne détecte aucune incohérence structurelle nécessitant une mutation. **Aucun
nouveau parcours « agents avancés » créé** — le corpus enrichi s'intègre aux parcours
existants (pas de greenwashing).

---

## 3. Diagnostics du Curriculum Graph II (données réelles)

**0 anomalie bloquante.** **0 orphan-practice** (tous les exercices sont atteignables
par un practiceRef de leçon ou par une journée). **15 warnings honnêtes**, documentés,
non maquillés :

| Type (warning) | Nombre | Sujets |
| --- | --- | --- |
| `advanced-before-prerequisite` | 6 | api-design-basics, cloud-finops, k8s-why-architecture, metrics-percentiles, technical-documentation (×2) |
| `concept-without-foundation` | 8 | caching-performance, git-advanced, llm-cost-optimization, llm-observability, monitoring-production, neural-networks, system-design-interview, transformers |
| `concept-not-practiced` | 1 | skill:patterns (design-patterns-intro) |

**Lecture** : ces warnings signalent une **dette de couverture de prérequis** — des
leçons (souvent avancées) dont aucun plan de sprint n'a encore déclaré les prérequis, et
quelques ordres de niveau à revoir. Ce ne sont PAS des ruptures bloquantes ; ce sont
précisément les cibles naturelles de V33 (Curriculum Completion). Le graphe rend cette
dette VISIBLE et mesurable au lieu de la laisser tacite.

---

## 4. Frontière réel / simulé

Aucun vrai LLM, outil externe, ni réseau. Les exercices agent manipulent la LOGIQUE
d'ingénierie (règles de sélection, table de transitions, détection de répétition,
validation de schéma, règles d'escalade, tri d'erreurs) sur des données fournies. Tous
étiquetés SIMULATION (vérifié par test).

---

## 5. Détection automatique de rupture (récapitulatif)

| Anomalie | Sévérité | Statut sur le corpus |
| --- | --- | --- |
| prereq-cycle / dead-prereq / dead-practiceref | bloquant | **0** |
| advanced-before-prerequisite | warning | 6 (documentés) |
| concept-without-foundation | warning | 8 (documentés) |
| concept-not-practiced | warning | 1 (documenté) |
| orphan-practice | info | 0 |
| orphan-lesson | info | 0 |

La chaîne pédagogique reste gardée par le code : toute rupture bloquante fait échouer la
CI ; les heuristiques restent informatives et n'empêchent jamais le build.
