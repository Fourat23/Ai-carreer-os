# V35 — Design pédagogique du parcours Data/ML Engineer

**Sprint** : V35, CP4. **Objet** : spécifier le parcours `data-ml-v1` composé à partir des
journées RÉELLES via le mécanisme de sélection non contiguë existant (ADR-035). Aucune copie de
journée/leçon. La durée dérive des jours sélectionnés. Activation décidée au CP8.

## 1. Principe
Chaque module référence une LISTE de jours réels (non contiguë autorisée). L'identité du
parcours vient de l'ORDRE et du CADRAGE, pas d'un nouveau contenu. Le parcours exclut
volontairement les stretches purement frontend/React et backend-web non essentiels au métier
Data/ML, ce qui le rend DISTINCT du parcours AI Engineer Foundations (365 j).

## 2. Modules proposés (jours dérivés des compétences réelles)

| # | Module | Objectif | Source (compétences → jours) |
| --- | --- | --- | --- |
| 1 | Fondations informatique | Terminal, Git, bases de programmation pour manipuler données et scripts | gitlinux (1,2,3,7) + jsts d'introduction (4-10) |
| 2 | Python & données | Python, manipulation tabulaire, qualité, ETL | python (82, 120-147) |
| 3 | SQL & modèle relationnel | Interroger et modéliser des données | sql (55, 57, 58, 84, 134-140) |
| 4 | Statistiques & ML classique | Stats intuitives, features, ML supervisé/non supervisé | ml (148-182) |
| 5 | Évaluation & fiabilité | Métriques, train/val/test, leakage, overfit, workflow | evalia (sous-ensemble 253-266) |
| 6 | Deep learning | Réseaux de neurones, entraînement par gradient | dl (183-203) |
| 7 | Transformers & LLM | Attention, transformers, LLM | llm (197-224) |
| 8 | IA appliquée & production | RAG, agents, évaluation IA, LLMOps | rag/agents/evalia production (sélection) |

Chaque module : objectif, prérequis (module précédent), leçons (via les jours), pratique (via
practiceRefs des leçons), compétences de sortie (skills dérivés des jours), critères
d'achèvement (jours terminés). La durée totale = union des jours, dérivée à la génération.

## 3. Progression pédagogique (pourquoi cet ordre)
Fondations → Python/données → SQL → statistiques/ML → évaluation → deep learning → transformers
/LLM → IA appliquée/production. C'est la trajectoire validée par les audits V33/V34 (chaîne
complète, toutes leçons P3). Un néophyte part de « qu'est-ce qu'une donnée » et arrive à
« situer RAG/agents et raisonner sur la production ».

## 4. Réutilisation stricte (une seule source de vérité)
- Jours : `program.days` (référencés, jamais copiés).
- Leçons/exercices/practiceRefs : existants.
- Mécanisme : module-spec avec `from` = liste de jours (déjà supporté).
- Progression, recherche, backup : read-model catalogue existant.

## 5. Décision d'activation (CP8)
Le parcours sera promu `announced → available` SI l'audit CP8 confirme : progression sans trou
majeur, prérequis cohérents, pratiques reliées, identité distincte du parcours AI Engineer.
Sinon il reste annoncé avec blocker matrix. La spécification ci-dessus est la base de cette
décision.
