# Audit pédagogique V31 — Chaîne RAG / IA appliquée & Curriculum Graph

Sprint V31. Cet audit est le juge de FOND (la qualité pédagogique), là où le
gate `v31:check` juge la structure et le Curriculum Graph juge la connectivité.
Priorité assumée : qualité pédagogique > cohérence des parcours > compréhension
par un néophyte > théorie→pratique→compétence→preuve > exactitude technique >
nouvelles fonctionnalités. **Aucune course à la quantité.**

## 1. Méthodologie

- **Rubrique** : la rubrique partagée v20 (16 dimensions notées 0-4,
  `lib/pedagogy-audit.mjs`). Seuils de sortie : aucune dimension < 2 ; dimensions
  dures (exactitude, objectif, progression, pratique autonome) ≥ 3 ; moyenne ≥
  3.25 pour un contenu récent.
- **Périmètre** : les 11 leçons durcies ce sprint (chaîne RAG + LLM→agents +
  prompt/sécurité). Scores dans `docs/architecture/v31-pedagogy-audit.json`.
- **Preuve de non-régression** : 11 gates vertes, 983 tests, tsc + build OK,
  validation navigateur 5 largeurs, Curriculum Graph sans anomalie bloquante.

## 2. Matrice de priorité (P0 → P3)

| Priorité | Leçons | Justification |
| --- | --- | --- |
| **P0** | rag-fundamentals, ai-evaluation | Pivots : sans eux, tout le reste de la chaîne flotte. |
| **P1** | embeddings, chunking-strategies, vector-databases, retrieval-reranking, rag-evaluation | Étages du pipeline RAG ; chacun un maillon indispensable. |
| **P2** | structured-outputs-tools, agent-workflows-orchestration | Passage LLM → système agentique. |
| **P3** | prompt-engineering, prompt-injection-defense | Transverses (spécification, sécurité) irriguant toute la chaîne. |

## 3. Scores après durcissement (extrait)

| Leçon | Profil | Moyenne | Pratique |
| --- | --- | --- | --- |
| rag-fundamentals | accessible | 3.69 | rag-failure-locate |
| embeddings | accessible | 3.69 | rag-cosine-rank |
| chunking-strategies | accessible | 3.69 | rag-chunking-overlap |
| vector-databases | dense | 3.75 | rag-cosine-rank |
| retrieval-reranking | dense | 3.75 | rag-rrf-fusion, rag-failure-locate |
| ai-evaluation | dense | 3.75 | rag-failure-locate |
| rag-evaluation | dense | 3.75 | rag-failure-locate |
| structured-outputs-tools | accessible | 3.69 | rag-structured-validate |
| agent-workflows-orchestration | sans exéc. | 3.63 | mini-exercice |
| prompt-engineering | sans exéc. | 3.63 | mini-exercice |
| prompt-injection-defense | sans exéc. | 3.63 | mini-exercice |

Aucune dimension sous le seuil ; les quatre dimensions dures ≥ 3 partout.

## 4. Avant / après

| Dimension | Avant V31 | Après V31 |
| --- | --- | --- |
| Rampe « problème d'abord » | absente (attaque directe par l'objectif) | présente sur les 11 leçons |
| Prérequis | listés ou absents | rédigés (≥12 mots, pourquoi ce prérequis) |
| Maths | notation d'emblée | intuition avant formule (cosinus = orientation) |
| Pratique RAG | **0 exercice** | 5 exercices déterministes reliés |
| Frontière réel/simulé | implicite | explicite dans chaque exercice (SIMULATION) |
| Détection de rupture | manuelle | automatique (Curriculum Graph, CI) |

## 5. Échantillon multi-époques (contrôle de régression)

Vérification que le durcissement V31 n'a pas cassé les leçons non ciblées, à
travers plusieurs époques du curriculum :

| Leçon (époque) | Constat |
| --- | --- |
| `javascript-basics` (Fondations) | Intacte, standard complet conservé. |
| `react-hooks-effects` (V29) | Intacte, chaîne React cohérente. |
| `sql-performance-indexing` (V29) | Intacte, modèle mental avant index. |
| `technical-documentation` (V30) | Intacte, practiceRefs missions valides. |
| `llm-fundamentals` (V30) | Intacte ; sert de racine à toute la chaîne RAG. |

Le Curriculum Graph confirme : 0 prérequis mort, 0 practiceRef mort, 0 cycle.

## 6. Parcours néophyte — RAG (déroulé complet)

Un débutant complet peut suivre, sans trou :
1. **llm-fundamentals** — ce qu'est un LLM, non-déterminisme, hallucination.
2. **embeddings** — « deux phrases, mots différents, même sens » → vecteurs
   proches ; cosinus = même DIRECTION (avant la formule). *Pratique* : classer
   des chunks par cosinus (rag-cosine-rank).
3. **rag-fundamentals** — « examen à livre ouvert » ; DOCUMENT→CHUNKS→EMBEDDINGS
   →INDEX→QUERY→RETRIEVAL→CONTEXTE→GÉNÉRATION. *Pratique* : localiser une panne
   (rag-failure-locate).
4. **chunking-strategies** — pourquoi le recouvrement. *Pratique* :
   rag-chunking-overlap.
5. **vector-databases** — retrouver vite dans 1M vecteurs (ANN) ; « vector DB ≠
   RAG ».
6. **retrieval-reranking** — « le vrai coupable est avant le LLM » ; hybride +
   RRF. *Pratique* : rag-rrf-fusion.
7. **ai-evaluation / rag-evaluation** — mesurer par étage (rappel@k gratuit,
   fidélité par juge calibré) ; « améliorer à l'aveugle dégrade ».

À aucune étape le néophyte ne rencontre un concept non introduit auparavant
(prouvé par l'ordre topologique, `tests/v31-e2e.test.mjs`).

## 7. Parcours néophyte — LLM → agents

1. **prompt-engineering** — un prompt est une SPÉCIFICATION, pas une incantation ;
   la sortie se VALIDE dans le code.
2. **structured-outputs-tools** — JSON validé + function calling ; le modèle
   PROPOSE, ton code EXÉCUTE. *Pratique* : rag-structured-validate (piège
   `amount="42"`).
3. **agents-fundamentals** → **agent-workflows-orchestration** — boucle bornée,
   puis orchestration (état + reprise + budgets), décision agent vs workflow par
   les CHIFFRES.
4. **ai-security** → **prompt-injection-defense** — injection directe vs
   INDIRECTE (menace n°1 des RAG), défense en couches, suite adverse.

## 8. Frontière réel / simulé (honnêteté)

Le programme ne prétend JAMAIS appeler OpenAI/Anthropic, interroger un vrai
vector store, calculer de vrais embeddings, ni entraîner un modèle. Les 5
exercices manipulent le RAISONNEMENT sur des données fournies (vecteurs =
tableaux, texte = longueurs, listes déjà classées, signaux mesurés ailleurs) et
portent tous la mention SIMULATION, vérifiée par test.

## 9. Dette pédagogique restante

- Pas d'exercice exécutable déterministe pour `agent-workflows-orchestration`,
  `prompt-engineering`, `prompt-injection-defense` : le raisonnement
  d'orchestration et adverse ne se teste pas honnêtement en `call-equals` sans
  simuler un LLM (refusé). Ces leçons gardent un mini-exercice intégré.
- Warning `concept-not-practiced` résiduel pour certaines compétences
  transverses enseignées sans exercice dédié (suivi, non bloquant).

## 10. Limites honnêtes

- La rubrique reste une auto-évaluation calibrée, pas un test utilisateur réel.
- Le Curriculum Graph garantit la CONNECTIVITÉ, pas la profondeur : une leçon
  peut être bien reliée et médiocre — d'où cet audit humain.
- Les scores « accessibilité » restent à 3 sur les leçons denses : c'est assumé
  (sujet intrinsèquement avancé), pas un défaut à masquer.

## 11. Recommandations V32

1. Exercices déterministes pour la couche agents : budget d'itérations / arrêt
   propre, classification instruction-vs-donnée multi-source, query rewriting.
2. Étendre la suite adverse (prompt injection) en cas de test rejouables.
3. Envisager un runtime SQLite/DuckDB pour la pratique data réelle (décision
   ADR-030 différée).
4. Résorber les warnings `concept-not-practiced` restants.
