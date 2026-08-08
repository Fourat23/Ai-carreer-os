# ADR-032 — Applied AI II : Agents, Tool Use & AI Safety + Curriculum Graph II

Statut : accepté (Sprint V32). Décision fondée sur l'audit CP0 réel (état vérifié, non
supposé). **Priorité produit : qualité pédagogique > cohérence des parcours > compréhension
néophyte > théorie→pratique→compétence→preuve > exactitude technique > fonctionnalités/UI.**
Local, mono-utilisateur, sans auth, sans SaaS, sans réseau requis, **sans nouveau moteur**
(progression, exercices, missions, preuves, compétences, catalogue, glossaire, runtimes,
Curriculum Graph restent uniques).

## Problème produit (établi au CP0)

Après V31, la chaîne RAG est durcie ET pratiquée (5 exercices déterministes). Mais l'audit CP0
révèle une **rupture théorie→pratique→preuve** sur la chaîne AGENTS/SÉCURITÉ :

1. `agents-fundamentals`, `agent-workflows-orchestration`, `prompt-engineering`,
   `prompt-injection-defense` ont une **théorie de haut niveau** (h9, on-ramp + prérequis
   rédigés, modèles mentaux, failure modes) mais **aucune pratique exécutable déterministe**.
   Un apprenant lit d'excellentes explications sur la boucle d'agent, le choix d'outil, la
   validation d'arguments, la terminaison, les retries, le human-in-the-loop — sans jamais
   MANIPULER ces mécanismes.
2. Les **playbooks IA/agents sont quasi inexistants** (0 sur 31 couvre boucle d'agent, mauvais
   outil, arguments dangereux, injection indirecte, sortie invalide, explosion de coûts,
   régression RAG/prompt).
3. Le **Curriculum Graph** (V31) détecte cycle / prérequis mort / practiceRef mort / concept
   non pratiqué / orphelin, mais ne sait pas encore détecter les ruptures d'ORDRE
   (concept avancé avant son prérequis, compétence jamais évaluée, pratique orpheline).

## Dette explicitement HORS périmètre V32 (reportée V33)

La dette **ML classique** — `feature-engineering`, `scikit-learn-workflow`, `neural-networks`,
`transformers`, `llm-cost-optimization` (h7, sans on-ramp/prérequis/pratique) — est réelle mais
**hors thème** « Agents, Tool Use & AI Safety ». La forcer dans V32 diluerait la qualité. Elle
est documentée comme recommandation V33 (cf. `docs/PEDAGOGICAL-AUDIT-V32.md`).

## Décision

### D1 — Cible pédagogique : la chaîne agentique en PRATIQUE
Rendre exploitable la chaîne :
`intention → plan → choix d'outil → validation d'arguments → action → observation → mise à
jour d'état → décision → terminaison → évaluation`, et enseigner ses modes de panne PAR LA
PRATIQUE. La théorie étant déjà solide (CP0), l'effort porte sur la **pratique déterministe** et
les **liaisons practiceRefs**, pas sur une réécriture des leçons saines.

### D2 — Exercices : mécanismes déterministes, jamais de faux LLM
Les nouveaux exercices manipulent la LOGIQUE d'ingénierie autour d'un agent (sélection d'outil
par règles, validation de schéma d'arguments, transitions de machine à états, détection de
boucle, classification retryable/non-retryable, décision HITL, séparation donnée/instruction).
Aucun appel LLM, embedding provider, vector DB, ni réseau. Tout est **RÉEL** (calcul local
déterministe) ; ce qui serait fourni par un modèle est **SIMULÉ** et étiqueté. node-js,
contrat vérifié par exécution (starter faux, référence 100 % verte, tests privés non exposés).

### D3 — Curriculum Graph = read-model dérivé ÉTENDU (pas de second moteur)
`lib/curriculum-graph.mjs` gagne de nouveaux diagnostics DÉRIVÉS des sources existantes, sans
persistance ni seconde vérité : `advanced-before-prerequisite`, `skill-never-evaluated`,
`orphan-practice`, `concept-without-foundation`. Sévérités honnêtes : seules les anomalies
objectivement fausses sont BLOQUANTES ; les heuristiques discutables (distance de prérequis)
restent WARNING/INFO. Le build ne casse jamais sur une heuristique douteuse.

### D4 — Playbooks IA via le moteur existant
Ajouter les scénarios agent/IA réellement absents avec le schéma de playbook EXISTANT
(mêmes rubriques), sans nouveau moteur.

### D5 — Gate v32:check structurel
Vérifie des propriétés (références valides, graphe sain, practiceRefs résolus, labels
réel/simulé présents, contenus V32 au standard), jamais un comptage figé
(`lessonCount === N`, `trackCount === 6`).

## Frontière réel / simulé (non négociable)
RÉEL : calcul, parsing, validation de schéma, machine à états, détection de boucle, classement
local, règles de décision. SIMULÉ (étiqueté) : réponses de modèle, embeddings fournis, résultats
d'outils externes, latence/coûts/disponibilité fournisseur. Ne JAMAIS prétendre appeler
OpenAI/Anthropic, un vrai vector store, un vrai agent, ni le réseau.

## Alternatives rejetées
- **Vrai runtime LLM / provider / vector DB** : contraire au caractère local ; masquerait les
  mécanismes derrière une API. Rejeté.
- **Framework d'agents** : l'objectif est de COMPRENDRE les mécanismes, pas de livrer un
  framework. Rejeté.
- **Second moteur de graphe / graphe persisté (Neo4j)** : violerait « une seule source de
  vérité ». Rejeté.
- **Forcer la dette ML classique dans V32** : diluerait la qualité, hors thème. Reporté V33.
- **Diagnostics de graphe bloquants sur heuristiques** (distance de prérequis) : trop de faux
  positifs → WARNING seulement.

## Conséquences
Un apprenant peut suivre « pourquoi un agent → boucle → état → outil → validation → observation
→ retry → terminaison → HITL → sécurité → évaluation » avec des exercices à l'appui, et le
système détecte davantage de ruptures pédagogiques automatiquement.
