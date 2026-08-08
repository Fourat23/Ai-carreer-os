# V31 — Audit de cohérence des parcours : la chaîne RAG / IA appliquée

**Sprint** : V31 — AI/ML Pedagogical Hardening IV
**Objet** : prouver qu'un apprenant peut suivre la chaîne
« texte → embeddings → similarité → vector store → chunking → retrieval →
hybride → reranking → contexte → génération → évaluation », puis
« LLM → sorties structurées → outils → agent → orchestration → garde-fous →
sécurité → évaluation », **sans trou pédagogique majeur**, et que le système
détecte automatiquement quand cette chaîne est cassée.
**Méthode** : cet audit s'appuie sur le *Curriculum Graph* (modèle de lecture
dérivé, `lib/curriculum-graph.mjs`) et sur les invariants vérifiés par
`tests/v31-e2e.test.mjs` et `tests/curriculum-graph.test.mjs`. Il ne crée aucune
nouvelle source de vérité : il agrège les leçons de `data/program.json`, les
graphes de prérequis des plans v27→v31, et les artefacts pratiques réels.

---

## 1. Vue d'ensemble du graphe dérivé

| Mesure | Valeur |
| --- | --- |
| Leçons (nœuds) | 110 |
| Nœuds portant des prérequis | 82 |
| Arêtes de pratique (PRACTICES résolues) | 227 |
| Compétences distinctes (BUILDS_SKILL) | 19 |
| Anomalies **bloquantes** | **0** |
| Cycles de prérequis | 0 |

Le graphe est un **DAG** : un tri topologique valide existe (test e2e « un ordre
topologique valide existe »), donc il existe au moins un ordre d'apprentissage
où aucun prérequis n'arrive après la leçon qui en dépend.

---

## 2. La chaîne RAG : prérequis → leçon → pratique

Ordre pédagogique (chaque ligne suppose les précédentes acquises) :

| # | Leçon | Prérequis directs | Pratique associée |
| --- | --- | --- | --- |
| 1 | `llm-fundamentals` | machine-learning-basics, http-rest-json | (fondations LLM) |
| 2 | `embeddings` | llm-fundamentals | `rag-cosine-rank` |
| 3 | `rag-fundamentals` | llm-fundamentals, embeddings | `rag-failure-locate` |
| 4 | `chunking-strategies` | rag-fundamentals, embeddings | `rag-chunking-overlap` |
| 5 | `vector-databases` | embeddings, rag-fundamentals, data-structures-intro | `rag-cosine-rank` |
| 6 | `retrieval-reranking` | embeddings, rag-fundamentals, vector-databases | `rag-rrf-fusion`, `rag-failure-locate` |
| 7 | `ai-evaluation` | model-evaluation, rag-fundamentals, statistics-for-ml | `rag-failure-locate` |
| 8 | `rag-evaluation` | ai-evaluation, rag-fundamentals, retrieval-reranking | `rag-failure-locate` |

**Invariant vérifié** : chaque leçon avancée (rag-evaluation,
retrieval-reranking, chunking-strategies, vector-databases, ai-evaluation)
**remonte transitivement jusqu'à `llm-fundamentals`** (test e2e « chaque leçon
RAG avancée remonte jusqu'à llm-fundamentals »). Aucune leçon avancée ne
« flotte » sans fondement.

### Lecture de la chaîne pour un néophyte
- On n'attaque JAMAIS le retrieval hybride (6) sans avoir vu ce qu'est un index
  vectoriel (5), lui-même précédé par la similarité d'embeddings (2).
- L'évaluation RAG (8) exige d'abord les principes d'évaluation IA (7) ET le
  retrieval (6) : impossible de mesurer un étage qu'on ne connaît pas.

---

## 3. La chaîne « du LLM au système agentique »

| # | Leçon | Prérequis directs | Pratique associée |
| --- | --- | --- | --- |
| 1 | `structured-outputs-tools` | llm-fundamentals, typescript-basics, api-design-basics | `rag-structured-validate` |
| 2 | `agents-fundamentals` | llm-fundamentals, api-design-basics | (boucle décider→agir→observer) |
| 3 | `agent-workflows-orchestration` | agents-fundamentals, structured-outputs-tools, architecture-basics | (voir §5) |
| 4 | `prompt-engineering` | llm-fundamentals, error-handling | (voir §5) |
| 5 | `prompt-injection-defense` | llm-fundamentals, rag-fundamentals, agents-fundamentals, ai-security | (voir §5) |

Le passage « sortie structurée → validation → outil → agent → orchestration »
est **monotone** : chaque maillon n'introduit qu'un concept nouveau, appuyé sur
le précédent. La défense contre l'injection (5) est placée APRÈS le RAG et les
agents — c'est cohérent : on ne peut comprendre l'injection *indirecte* (la
menace n°1) qu'après avoir vu un pipeline qui ingère des documents.

---

## 4. Frontière réel / simulé (non négociable)

Toutes les nouvelles pratiques sont **déterministes et étiquetées SIMULATION**
(test e2e dédié) : aucun vrai embedding, vector DB, LLM, ni appel réseau.

| Concept | Ce qui est RÉEL (le raisonnement) | Ce qui est SIMULÉ |
| --- | --- | --- |
| Similarité cosinus | la formule et le tri top-k | vecteurs = petits tableaux fournis |
| Chunking | l'arithmétique des fenêtres et du recouvrement | « texte » = longueur entière |
| RRF | la fusion de rangs 1/(K+rang) | listes déjà classées |
| Diagnostic RAG | l'arbre retrieval-d'abord | signaux (goldInTopK…) fournis |
| Sortie structurée | la validation type+enum | objet déjà parsé |

Le programme ne prétend jamais appeler OpenAI/Anthropic ni entraîner un modèle.

---

## 5. Trous connus / dette résiduelle (transparence)

- **Pas d'exercice dédié** pour `agent-workflows-orchestration`,
  `prompt-engineering`, `prompt-injection-defense` : ces leçons restent durcies
  (on-ramp, prérequis, exemples guidés, mini-exercices intégrés) mais sans
  practiceRef exécutable propre. C'est un choix : le raisonnement d'orchestration
  et d'attaque adverse se prête mal à un test `call-equals` déterministe honnête
  sans simuler un LLM — ce que l'on refuse. Candidat V32 : un exercice de
  *budget d'itérations / arrêt propre* (déterministe) et un de *classification
  instruction/donnée multi-source* (extension de `prompt-injection-classify`).
- **`concept-not-practiced`** (warning, non bloquant) subsiste pour certaines
  compétences transverses enseignées sans exercice dédié : suivi, non-régression.

---

## 6. Détection automatique de rupture

Le Curriculum Graph rend la rupture **mesurable** :

| Anomalie | Sévérité | Déclencheur |
| --- | --- | --- |
| `prereq-cycle` | bloquant | un cycle rend un parcours impossible |
| `dead-prereq` | bloquant | un prérequis pointe une leçon inexistante |
| `dead-practiceref` | bloquant | une leçon pointe une pratique absente |
| `concept-not-practiced` | warning | une compétence enseignée sans aucune pratique |
| `orphan-lesson` | info | une leçon hors du graphe |

Les tests d'intégration échouent dès qu'une anomalie **bloquante** apparaît :
si demain quelqu'un renomme un exercice sans mettre à jour la leçon, ou
introduit un cycle de prérequis, la CI le refuse. **La chaîne pédagogique est
désormais gardée par le code.**
