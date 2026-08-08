# Sprint V31 — AI/ML Pedagogical Hardening IV : RAG, IA appliquée & Curriculum Graph Completion

Rapport de sprint (français). Sprint d'abord PÉDAGOGIQUE : durcir la chaîne
RAG / IA appliquée pour qu'un néophyte la suive sans trou, ajouter la première
couche de PRATIQUE RAG (jusque-là inexistante), et rendre la rupture de la
chaîne DÉTECTABLE automatiquement via un Curriculum Graph dérivé. Aucune course
à la quantité, aucune refonte UI, aucun second moteur.

## 1. État initial constaté (CP0)
Dépôt propre, socle vert. HEAD `b4f6db3` (fin V30). 110 leçons, 198 exercices,
40 missions, 31 playbooks, 645 termes de glossaire, 6 parcours, 965 tests.
`progress.json` gitignoré (SHA `598f27c2…`), sauvegardé hors repo.

## 2. Anomalies
Aucune anomalie bloquante au départ. Seule dette réelle : la chaîne RAG / IA
appliquée durcie partiellement en V30 (6 leçons P0), mais **zéro exercice RAG**
et pas de vue transversale prérequis→pratique.

## 3. Architecture réellement trouvée
`lib/catalogue.mjs`, `lib/runtime.mjs` (node-js/typescript/python3/react-tsx/web,
pas de runtime SQL), `lib/exercise.mjs`, `lib/pedagogy-audit.mjs`, `practiceRefs`,
gates v26→v30, moteur missions/Labs, progression v3, glossaire. Réutilisés tels
quels — aucun second moteur créé.

## 4. Objectifs V31
(A) Durcir la chaîne RAG/IA appliquée (rampe « problème d'abord » + prérequis
rédigés + frontière réel/simulé) ; (B) créer la première couche de pratique RAG
déterministe ; (C) Curriculum Graph = read-model dérivé qui audite
prérequis→leçon→pratique→compétence et détecte les ruptures.

## 5. Décisions ADR/HSD/TSD-031 (CP1)
ADR-031 : durcissement additif de la chaîne RAG/IA appliquée ; Curriculum Graph
= modèle de LECTURE dérivé (pas de seconde source de vérité, pas de Neo4j, pas
de persistance) ; réel/simulé explicite (aucun vrai LLM/vector DB/embedding).
HSD-031 : maths par intuition avant notation, contrat de leçon, anti-slop.
TSD-031 : gate `v31:check`, ledger, graphe acyclique, réutilisation des runtimes.

## 6. Chaîne RAG durcie (CP3–CP4)
`rag-fundamentals` (P0), `embeddings`, `chunking-strategies`, `vector-databases`,
`retrieval-reranking`, `ai-evaluation` (P0), `rag-evaluation` : rampe « problème
d'abord » (examen à livre ouvert, deux phrases même sens, 1M vecteurs, le vrai
coupable est avant le LLM…), prérequis rédigés (≥12 mots), cosine par
l'orientation avant la formule, retrieval vs génération explicité.

## 7. LLM → agents durcis (CP5)
`structured-outputs-tools`, `agent-workflows-orchestration` : rampe (belles
phrases inutilisables / démo puis production), frontière modèle-propose /
code-exécute, décision agent vs workflow par les CHIFFRES, orchestration = état
+ reprise + budgets + traces.

## 8. Prompt & sécurité durcis (CP6)
`prompt-engineering` (prompt = spécification vérifiée par le code) et
`prompt-injection-defense` (injection directe vs INDIRECTE, défense en couches,
suite adverse non-régressive). Prérequis rédigés, rampes concrètes.

## 9. Première couche de pratique RAG (CP7)
5 exercices node-js **déterministes**, contrat vérifié par exécution, étiquetés
SIMULATION : `rag-chunking-overlap`, `rag-cosine-rank` (cosinus/top-k),
`rag-rrf-fusion` (hybride), `rag-failure-locate` (diagnostic retrieval vs
génération), `rag-structured-validate` (piège `amount="42"`). Chaque starter est
FAUX, chaque référence 100 % verte, ≥1 test public + ≥1 privé, aucune fuite.
`practiceRefs` câblés sur 8 leçons, ces leçons passées `critical`.

## 10. Curriculum Graph (CP8)
`lib/curriculum-graph.mjs` : read-model PUR agrégeant leçons + prérequis (union
v27→v31) + pratiques + compétences. `auditCurriculumGraph` détecte
`prereq-cycle`, `dead-prereq`, `dead-practiceref` (bloquants),
`concept-not-practiced` (warning), `orphan-lesson` (info). 9 tests, dont 2
d'intégration prouvant zéro anomalie bloquante sur le curriculum réel.

## 11. Cohérence des parcours (CP9)
`docs/architecture/v31-track-coherence.md` + `tests/v31-e2e.test.mjs` (6 tests) :
graphe acyclique, ordre topologique valide, chaque leçon RAG avancée remonte à
`llm-fundamentals`, chaque exercice relié, frontière réel/simulé étiquetée.

## 12. Glossaire (+16) (CP10)
`cosine similarity`, `chunk`, `top-k`, `ANN`, `semantic/lexical/hybrid search`,
`RRF`, `groundedness`, `golden set`, `rappel@k`, `agent loop`, `guardrail`,
`indirect prompt injection`, `excessive agency`, `human-in-the-loop`. Termes
déjà présents (embedding, reranking, prompt injection) non dupliqués.

## 13. Métriques avant/après
| | Avant (V30) | Après (V31) |
| --- | --- | --- |
| Leçons | 110 | 110 |
| Exercices | 198 | 203 (+5 RAG) |
| Playbooks | 31 | 31 |
| Glossaire | 645 | 661 (+16) |
| Tests | 965 | 983 (+18) |
| Gates actives | 10 | 11 (+v31:check) |
| Exercices RAG | 0 | 5 |

## 14. Validations réellement réalisées
`generate-curriculum` idempotent (days-dirty=0), `v31:check` vert (11 corrigées,
8 critiques), 11 gates actives vertes, 983 tests, `tsc --noEmit` OK, `next build`
OK, validation navigateur 375/768/1024/1440/1920 (5 pages, 0 erreur console, 0
débordement horizontal), aucun serveur résiduel.

## 15. Réel vs simulé (non négociable)
Aucun vrai embedding, vector DB, LLM ni appel réseau. Les exercices manipulent le
RAISONNEMENT (formule cosinus, fenêtres de chunking, fusion de rangs, arbre de
diagnostic, validation type+enum) sur des données fournies, tous étiquetés
SIMULATION. Le programme ne prétend jamais appeler OpenAI/Anthropic.

## 16. Dette restante (transparence)
Pas d'exercice déterministe honnête pour `agent-workflows-orchestration`,
`prompt-engineering`, `prompt-injection-defense` (le raisonnement d'orchestration
et adverse se simule mal en `call-equals` sans falsifier un LLM). Candidats V32 :
exercice de budget d'itérations / arrêt propre, extension multi-source de
`prompt-injection-classify`, query rewriting.

## 17. Limites honnêtes
Le Curriculum Graph ne juge pas la QUALITÉ d'une leçon (seulement la structure et
la connectivité) ; l'audit pédagogique humain (`docs/PEDAGOGICAL-AUDIT-V31.md`)
reste le juge de fond. Le `concept-not-practiced` warning subsiste pour des
compétences transverses enseignées sans exercice dédié.
