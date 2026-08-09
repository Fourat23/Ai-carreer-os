# V34 — Matrice du parcours Data/ML & décision d'activation

**Sprint** : V34. **Objet** : décider, sur preuve, si le parcours `data-ml-v1` (annoncé) peut
devenir disponible. **Règle** : activer UNIQUEMENT si un néophyte peut le suivre dans un ordre
cohérent, sans greenwashing.

## 1. Chaîne pédagogique Data/ML — état du contenu (après V34)

| Maillon | Leçon(s) | Jours (skill) | Pratique | État |
| --- | --- | --- | --- | --- |
| Python & données | python-foundations, pandas-data-wrangling | python 82-147 | py-*, table-groupby, data-quality-detect | P3 |
| Nettoyage / qualité | data-cleaning-quality | (data) | data-quality-detect, data-missing-strategy | P3 (durci V34) |
| SQL / relationnel | sql-foundations → migrations | sql 55-140 | sql-inner-join, fix-nplus1… | P3 |
| ETL | etl-pipelines | (data) | etl-pipeline-order | P3 (durci V34) |
| Statistiques | statistics-for-ml | ml 148-182 | ml-split-choice | P3 |
| Feature engineering | feature-engineering | ml | ml-data-leakage, ml-feature-encoding | P3 (durci V33) |
| ML classique | machine-learning-basics, scikit-learn-workflow | ml | ml-metric-choice, ml-split-choice | P3 |
| Évaluation | model-evaluation | evalia 253-322 | ml-metric-choice, ml-confusion-metric, ml-overfit-diagnose | P3 |
| Deep learning | neural-networks | dl 183-203 | nn-forward-neuron, ml-overfit-diagnose | P3 (durci V33) |
| Transformers | transformers | dl/llm | attention-argmax | P3 (durci V33) |
| LLM & production | llm-fundamentals, llm-cost-optimization, llm-observability | llm 197-224 | llm-context-budget, llm-cost-estimate, ml-drift-detect | P3 |

**Conclusion contenu** : la chaîne est **complète et cohérente au niveau des LEÇONS et de la
PRATIQUE** (toutes P3 après V33-V34). C'est le gain réel du sprint.

## 2. Décision d'activation : **RESTE ANNONCÉ**

Malgré un contenu prêt, `data-ml-v1` **n'est PAS activé**. Raison honnête (pas de greenwashing) :

Le programme de 365 jours est un cursus **AI Engineer INTÉGRÉ** où les journées data/ML/DL/LLM
sont **entrelacées** avec le reste (jsts 4-119, python 82-147, sql 55-140, ml 148-182…).
Construire un parcours Data/ML *disponible* imposerait l'une de deux voies, toutes deux
insatisfaisantes aujourd'hui :

- **Par plages de jours contiguës** (comme les autres parcours) : une plage cohérente
  couvrirait ~jours 1→329, soit ≈ la colonne vertébrale du parcours AI Engineer Foundations
  déjà disponible → **pas un parcours distinct**, simple re-libellé.
- **Par filtrage de compétence** (python/sql/ml/dl/llm/evalia) : produit un ensemble de jours
  **non contigus** avec des sauts (ex. 147 → 148 → 253) déroutants pour un néophyte, sans
  séquence d'apprentissage lisse.

Aucune des deux ne constitue un parcours **distinct ET cohérent** au sens « un néophyte suit un
ordre clair ». Activer maintenant serait du greenwashing (re-libellé) ou incohérent (sauts).

## 3. Blockers précis pour l'activation (backlog V35)
1. **Séquence de jours dédiée** : définir une progression Data/ML **contiguë et distincte**
   (entrée data-oriented, exclusion des stretches purement frontend/React), soit par une
   re-numérotation de journées, soit par une structure de modules à jours explicitement
   curée — sans dupliquer le curriculum.
2. **Modules → jours** : écrire `dataMlModules(program)` (spécifications de modules) une fois la
   séquence décidée, puis promouvoir le track de `announced` à `available` dans le catalogue.
3. **Missions/preuves de parcours** : vérifier qu'au moins une mission et une preuve jalonnent
   la fin de parcours Data/ML.
4. **E2E parcours** : module → jour → leçon → exercice → compétence → preuve sans trou.

## 4. Ce qui EST acquis en V34 (progrès réel)
Le prérequis n°1 de l'activation — **un contenu Data/ML complet, durci et pratiqué** — est
désormais atteint (fondations data durcies, theory→practice complétée, 6 exercices data ajoutés).
Le blocker restant est **structurel (packaging du parcours)**, pas pédagogique.

## 5. Parcours réellement suivable aujourd'hui
La chaîne Data/ML est **pleinement suivable via `ai-engineer-foundations-v1`** (365 jours), qui
la contient dans son ordre intégré. Le track dédié `data-ml-v1` reste une commodité de
packaging à livrer en V35.
