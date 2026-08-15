# V45.3 — Recalibration du transfert (T0-T5, preuve exigée)

## Ce qui change vs V45.2

V45.2 notait le transfert sur **T0-T4** et a classé **68/128 leçons T4**
(≈ 53 %). V45.3 note sur **T0-T5** avec une règle stricte : **T4/T5 exigent une
preuve** que l'apprenant doit COMBINER plusieurs idées ou arbitrer des
informations concurrentes. Un exemple métier, une mention « production », un
mini-exercice ou plusieurs technologies citées ne suffisent PAS à justifier T4.

## Rappel : un transfert bas n'est PAS une mauvaise note académique

Une leçon de fondation excellente (A) peut légitimement être **T2**. On mesure la
distance entre ce que la leçon enseigne et un problème réellement nouveau — pas la
qualité de la leçon.

## Distribution sur l'échantillon (38 leçons)

| Niveau | V45.3 | Interprétation |
|--------|:---:|----------------|
| T2 (application proche) | 17 | fondations + concepts appliqués à un exercice quasi identique |
| T3 (application avec variation réelle) | 19 | diagnostic / design / décision sur un cas varié |
| T4 (multi-étapes, infos concurrentes) | 2 | architecture-basics, system-design-interview |
| T0/T1/T5 | 0 | — |

## Comparaison au classement V45.2 sur ces mêmes 38 leçons

Sur l'échantillon, V45.2 aurait attribué une majorité de **T3/T4** (le corpus
V45.2 est à 53 % T4 global). V45.3 abaisse fortement : **seulement 2 T4** sur 38.

Exemples de reclassement (V45.2 → V45.3) et justification :

| Leçon | V45.2 | V45.3 | Pourquoi |
|-------|:---:|:---:|----------|
| git-fundamentals | T4/T3 | **T2** | La pratique applique les mêmes gestes à un dépôt quasi identique ; pas d'infos concurrentes. |
| css-fundamentals | T3/T4 | **T2** | Application directe cascade/box-model ; pas de combinaison multi-concepts sous contrainte. |
| embeddings | T4 | **T2** | Excellent, mais l'usage reste « cosinus + tri » ; le transfert lointain vit dans retrieval-reranking. |
| neural-networks | T4 | **T2** | Diagnostic par courbes, mais entraînement non exécuté ; pas de tâche multi-étapes réelle. |
| retrieval-reranking | T4 | **T3** | Ablation par étage = variation réelle, mais dans un cadre balisé (pas T4). |
| machine-learning-basics | T4 | **T3** | Workflow honnête avec variation ; reste guidé (pas d'infos concurrentes fortes). |
| architecture-basics | T4 | **T4** | **Confirmé** : combine contraintes concurrentes → arbitrage multi-étapes. |
| system-design-interview | T4 | **T4** | **Confirmé** : clarifier→trade-offs→échelle/pannes sur un problème ouvert. |

## Conclusion de la recalibration

- **Le transfert V45.2 était matériellement surévalué.** L'inflation T4 vient de
  ce que V45.2 comptait comme « transfert » la présence d'un exemple métier ou
  d'un mini-exercice, sans exiger la combinaison d'idées / l'arbitrage d'infos
  concurrentes.
- **Ce n'est PAS un défaut de contenu.** Les leçons restent excellentes ; c'est
  l'ÉCHELLE de transfert qui était trop généreuse. La majorité du corpus est
  légitimement **T2/T3** (fondation + application), avec de rares **T4** réels
  (architecture, system design).
- **Implication produit** : un néophyte sortira du corpus avec une compréhension
  solide et une capacité d'application proche/variée — mais le **far transfer**
  (T4/T5 : problèmes nouveaux, multi-domaines) reste porté par une poignée de
  leçons et surtout par la PRATIQUE (capstones, missions, transfer-challenges),
  qui relève de la dette Barre B déjà documentée.
