# Audit pédagogique V32 — Agents, Tool Use & AI Safety

Sprint V32. Cet audit est le juge de FOND (qualité pédagogique), là où le gate `v32:check`
juge la structure et le Curriculum Graph II juge la connectivité et l'ordre. Priorité
assumée : qualité pédagogique > cohérence des parcours > compréhension néophyte >
théorie→pratique→compétence→preuve > exactitude technique > fonctionnalités/UI.

## 1. Méthodologie
- **Rubrique** : rubrique partagée v20 (16 dimensions, 0-4, `lib/pedagogy-audit.mjs`).
  Seuils : aucune dimension < 2 ; dimensions dures (exactitude, objectif, progression,
  pratique autonome) ≥ 3 ; moyenne ≥ 3.25 (contenu récent).
- **Périmètre noté** : les 4 leçons de la chaîne agents/sûreté câblées ce sprint
  (`docs/architecture/v32-pedagogy-audit.json`).
- **Constat CP0** : la théorie de ces 4 leçons était DÉJÀ au standard V31 (on-ramp,
  prérequis rédigés, modèles mentaux, failure modes). La dette réelle était l'ABSENCE de
  pratique exécutable. V32 a donc porté l'effort sur la pratique et les liaisons, pas sur
  une réécriture de théorie saine.

## 2. Matrice de priorité (P0 → P3)

| Priorité | Leçons | Justification |
| --- | --- | --- |
| **P0** | agents-fundamentals, agent-workflows-orchestration | Cœur de la chaîne agentique ; sans pratique, la compétence restait déclarative. |
| **P1** | prompt-injection-defense | Sûreté : injection indirecte = menace n°1 des RAG/agents. |
| **P2** | prompt-engineering | Transverse (spécification vérifiée) irriguant toute la chaîne. |

## 3. Scores après câblage de la pratique

| Leçon | Profil | Moyenne | Pratique reliée |
| --- | --- | --- | --- |
| agents-fundamentals | accessible | 3.69 | agent-tool-select, agent-state-transition |
| agent-workflows-orchestration | dense | 3.75 | agent-loop-detect, agent-state-transition, agent-tool-validate, agent-retry-policy |
| prompt-engineering | accessible | 3.69 | rag-structured-validate |
| prompt-injection-defense | dense | 3.75 | prompt-injection-classify, agent-hitl-decision |

`autonomous-practice` passe de 3 (mini-exercice) à **4** (exercice exécutable relié) sur
les 4 leçons — c'est le gain central du sprint. Aucune dimension sous le seuil.

## 4. Avant / après

| Dimension | Avant V32 | Après V32 |
| --- | --- | --- |
| Théorie agents/sûreté | forte (h9, V31) | inchangée (déjà au standard) |
| Pratique agent exécutable | **0** | 6 exercices déterministes reliés |
| Leçons agent critiques (practiceRef résolu) | 0/4 | **4/4** |
| Playbooks IA « Que faire dans ce cas ? » | 0 | 5 |
| Diagnostics de graphe | 5 types | **8 types** (ordre, fondation, pratique orpheline) |
| Détection auto de rupture d'ORDRE | non | oui (warning, non bloquant) |

## 5. Échantillon multi-époques (contrôle de non-régression)

| Leçon (époque) | Constat |
| --- | --- |
| `javascript-basics` (Fondations) | intacte |
| `react-hooks-effects` (V29) | intacte |
| `sql-performance-indexing` (V29) | intacte |
| `technical-documentation` (V30) | intacte |
| `rag-fundamentals` (V31) | intacte, pratique RAG conservée |
| `llm-fundamentals` (V30) | intacte, racine des chaînes RAG et agents |

Le Curriculum Graph confirme : 0 prérequis mort, 0 practiceRef mort, 0 cycle, 0 pratique
orpheline.

## 6. Walkthrough néophyte — « Je sais seulement ce qu'est un LLM »

1. **structured-outputs-tools** — le modèle PROPOSE une sortie/appel, le code VÉRIFIE.
   *Pratique* : valider une extraction (rag-structured-validate).
2. **agents-fundamentals** — « un agent = une boucle décider→agir→observer, pas de la
   magie » ; workflow vs agent tranché par les chiffres. *Pratique* : choisir le bon outil
   (agent-tool-select), transitions d'états (agent-state-transition).
3. **agent-workflows-orchestration** — orchestration = état + reprise + budgets + traces.
   *Pratique* : détecter une boucle (agent-loop-detect), valider les arguments d'outil
   (agent-tool-validate), trier les erreurs (agent-retry-policy).
4. **prompt-injection-defense** — donnée vs instruction ; injection indirecte ; défense en
   couches. *Pratique* : classer donnée/instruction (prompt-injection-classify), escalader
   à un humain (agent-hitl-decision).

À aucune étape le néophyte ne rencontre un concept non introduit (ordre topologique validé,
`tests/v32-e2e.test.mjs`). Chaque mécanisme théorique a désormais un exercice qui le fait
MANIPULER.

## 7. Frontière réel / simulé (honnêteté)
Aucun vrai LLM, outil externe, embedding, vector DB, ni réseau. Les 6 exercices manipulent
la LOGIQUE d'ingénierie (règles de sélection, table de transitions, détection de répétition,
validation de schéma, escalade, tri d'erreurs) sur des données fournies ; tous étiquetés
SIMULATION (vérifié par test). Le programme ne prétend jamais appeler OpenAI/Anthropic.

## 8. Dette pédagogique restante (transparence)

- **ML classique** (hors thème V32) : `feature-engineering`, `scikit-learn-workflow`,
  `neural-networks`, `transformers`, `llm-cost-optimization` restent P1 (h7, sans on-ramp/
  prérequis/pratique). → cible V33.
- **Warnings Curriculum Graph** (dette de couverture de prérequis, non bloquante) :
  - `advanced-before-prerequisite` ×6 (ex. technical-documentation, api-design-basics) ;
  - `concept-without-foundation` ×8 (leçons niveau 3 sans prérequis déclaré : neural-networks,
    transformers, llm-cost-optimization, llm-observability, monitoring-production,
    caching-performance, git-advanced, system-design-interview) ;
  - `concept-not-practiced` ×1 (skill:patterns / design-patterns-intro).
  Ces signaux sont documentés, pas maquillés : ce sont les cibles de V33.

## 9. Limites honnêtes
- La rubrique reste une auto-évaluation calibrée, pas un test utilisateur réel.
- Le Curriculum Graph garantit connectivité et ordre, pas la profondeur : une leçon peut
  être bien reliée et médiocre — d'où cet audit humain.
- `skill-never-evaluated` n'est pas implémenté (taxonomies compétences leçon/exercice
  disjointes → il produirait du bruit trompeur) — choix documenté dans le code.
- Les scores « accessibilité » restent à 3 sur les leçons denses (sujet avancé) : assumé.

## 10. Recommandations V33
1. Résorber la dette ML classique (feature-engineering, scikit-learn, neural-networks,
   transformers) au standard actuel + pratique.
2. LLMOps : llm-cost-optimization, llm-observability (durcissement + pratique).
3. Résorber les warnings `concept-without-foundation` en déclarant les prérequis manquants
   dans un plan (couverture du graphe de prérequis).
4. Étendre la suite de diagnostics du Curriculum Graph si de nouveaux modes de rupture
   apparaissent.
