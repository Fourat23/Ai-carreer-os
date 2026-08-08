# ADR-031 — AI/ML Pedagogical Hardening IV (RAG & IA appliquée) + Curriculum Graph

Statut : accepté (Sprint V31). Décision fondée sur l'audit CP0 réel (état vérifié, non
supposé). **Priorité produit : qualité pédagogique > cohérence des parcours > compréhension
néophyte > théorie→pratique→compétence→preuve > exactitude technique > fonctionnalités/UI.**
Local, mono-utilisateur, sans auth, sans SaaS, sans réseau requis, **sans nouveau moteur**
(progression, exercices, missions, preuves, compétences, catalogue, glossaire, runtimes restent
uniques).

## Problème produit (établi au CP0)

Après V30, les FONDATIONS AI/ML sont au standard (stats, ML, évaluation, LLM, agents, sécurité).
Mais la **chaîne IA appliquée avancée** — surtout le RAG — reste une dette majeure :

1. **Chaîne RAG quasi entièrement P0/P1 et sans pratique.** `rag-fundamentals` (le hub) et
   `ai-evaluation` sont **P0** (ni rampe, ni prérequis, ni modèle mental) ; `embeddings`,
   `chunking-strategies`, `vector-databases`, `retrieval-reranking`, `rag-evaluation`,
   `structured-outputs-tools`, `agent-workflows-orchestration`, `prompt-engineering`,
   `prompt-injection-defense` sont **P1** (modèle mental présent mais ni rampe ni prérequis).
   **Aucun exercice RAG n'existe.** Un néophyte ne peut pas suivre la chaîne
   texte→embeddings→chunking→vector store→retrieval→reranking→génération→évaluation.
2. **Aucun read-model dérivé du graphe pédagogique.** Les prérequis (`prereq`) sont dispersés
   dans les plans v27–v30 ; les `practiceRefs`, `skills`, jours et parcours vivent dans
   d'autres sources. Rien ne permet de DÉRIVER et d'AUDITER la cohérence
   prérequis→leçon→pratique→compétence→parcours comme un graphe.

## Décision 1 — Durcir la chaîne RAG / IA appliquée (CP3→CP6)

Corriger de façon ADDITIVE (contenu conservé) un sous-ensemble PRIORITAIRE rendant la chaîne
RAG suivable de bout en bout, puis les agents/outputs/sécurité :
- **RAG fondations (CP3)** : `rag-fundamentals` (P0), `embeddings`, `chunking-strategies`,
  `vector-databases`.
- **Retrieval avancé & évaluation (CP4)** : `retrieval-reranking`, `rag-evaluation`,
  `ai-evaluation` (P0) — avec la distinction cruciale *retrieval failure* vs *generation
  failure* et une méthode de diagnostic.
- **Structured outputs, tools & agents (CP5)** : `structured-outputs-tools`,
  `agent-workflows-orchestration`.
- **Sécurité IA appliquée (CP6)** : `prompt-injection-defense`, `prompt-engineering`.

Chaque leçon : on-ramp « Le problème d'abord » avant l'objectif, prérequis rédigés, modèle
mental si absent, vocabulaire au premier usage, maths/mécanismes expliqués PAR L'INTUITION
(cosine = orientation avant formule), `practiceRefs` vers des artefacts existants ou créés en
CP7. **Frontière réel/simulé explicite** : aucun vrai embedding/vector DB/LLM ; les exercices
sont des raisonnements déterministes étiquetés.

## Décision 2 — Curriculum Graph : read-model PUR et DÉRIVÉ (CP8)

Créer `lib/curriculum-graph.mjs` : une fonction pure qui RECONSTRUIT un graphe pédagogique à
partir des sources EXISTANTES, sans persistance ni seconde source de vérité :
- **Nœuds** : lesson, exercise, lab, mission, playbook, skill, day, track (dérivés de
  program.json, lessons-map, data/*, catalogue).
- **Arêtes dérivées** : REQUIRES (union des `prereq` des plans v27–v30), PRACTICES
  (`practiceRefs`), BUILDS_SKILL (`skills`), BELONGS_TO_TRACK (catalogue).
- **Anomalies détectables** : cycle de prérequis, prérequis mort, lien mort, concept enseigné
  jamais pratiqué, pratique sans théorie, compétence sans pratique, nœud orphelin, cul-de-sac.

Aucun Neo4j, aucune base. Tests purs. Le graphe est un OUTIL D'AUDIT, pas un moteur.

## Décision 3 — Gate `v31:check` (structurel) + registre

Nouveau `scripts/v31-check.mjs` (esprit v27→v30) validant le périmètre V31 déclaré : mêmes
contrôles structurels + signaux densité/jargon (proxy non bloquant). En complément, un test
d'intégrité du Curriculum Graph (acyclicité globale, résolution des refs, absence d'anomalies
bloquantes). `v26→v30:check` restent actifs.

## Décision 4 — Surface pédagogique minimale (si propre)

Si l'architecture le permet SANS logique dupliquée, enrichir la page leçon d'informations
DÉRIVÉES du Curriculum Graph (« Avant / Ensuite / Utilisé dans… »). Sinon, s'abstenir. Aucune
refonte UI.

## Alternatives rejetées
- **Vrai vector DB / vrai LLM / embeddings réels** : rejeté (local, sans réseau ; simulation
  déterministe étiquetée suffit à enseigner le raisonnement).
- **Persister le graphe pédagogique** : rejeté — read-model dérivé (pas de seconde source).
- **Corriger les 16 leçons IA appliquée d'un coup** : rejeté — sous-ensemble prioritaire
  (chaîne RAG complète + agents/sécurité), reste documenté V32.
- **Créer des leçons pour atteindre un nombre** : rejeté (qualité > quantité).
- **Refonte UI / graphe visuel interactif** : hors périmètre V31.

## Risques et limites
- Pratique RAG SIMULÉE en JS (raisonnement déterministe), étiquetée ; aucune vraie mesure.
- Audit IA appliquée partiel par conception (chaîne RAG prioritaire) ; dette hors-chaîne
  documentée.
- Le Curriculum Graph agrège des `prereq` dispersés : sa complétude dépend de ces plans
  (limite documentée). Les scores d'audit restent des proxys ; le walkthrough néophyte (CP11)
  reste une lecture experte.

## Migration additive
Durcissement de leçons, ajout de `practiceRefs`/exercices, un read-model dérivé, un gate et un
registre, enrichissement du glossaire. Aucune donnée détruite, aucun jour réécrit,
`progress.json` (runtime, gitignoré) sauvegardé et restauré.
