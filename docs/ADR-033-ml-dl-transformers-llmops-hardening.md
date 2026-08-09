# ADR-033 — ML Foundations → Deep Learning → Transformers → LLMOps + Curriculum Graph III

Statut : accepté (Sprint V33). Décision fondée sur l'audit CP0 réel (état vérifié, non
supposé). **Priorité produit : qualité académique > accessibilité néophyte > cohérence du
graphe > pratique reliée > exactitude technique > honnêteté réel/simulé > fonctionnalités.**
Local, mono-utilisateur, sans auth, sans SaaS, sans réseau requis, **sans nouveau moteur**
(progression, exercices, missions, preuves, compétences, catalogue, glossaire, runtimes,
Curriculum Graph restent uniques).

## Problème produit (établi au CP0)

La chaîne « données → features → apprentissage → évaluation → réseaux de neurones →
attention → transformers → LLM → RAG/agents → LLMOps » est correcte sur le FOND, mais
présente trois ruptures :

1. **Structure V33 absente** sur 6 leçons ML/DL/LLM par ailleurs FORTES :
   `feature-engineering`, `scikit-learn-workflow`, `neural-networks`, `transformers`,
   `llm-cost-optimization`, `llm-observability` (h7 : pas d'on-ramp « 🌍 Le problème
   d'abord », pas de prérequis rédigés).
2. **Pratique absente** : la chaîne ML/DL/LLMOps n'a qu'UN exercice (`ml-metric-choice`).
   Théorie→pratique→preuve est cassée.
3. **Couverture de prérequis** : 8 leçons de niveau 3 sans prérequis déclaré dans le graphe
   (warnings `concept-without-foundation`), + 6 `advanced-before-prerequisite`.

Le contenu de ces leçons est de bonne qualité : la correction est **ADDITIVE** (on-ramp +
prérequis + pratique), jamais une réécriture d'un contenu sain (anti-slop).

## Décision

### D1 — Correction additive, pas de réécriture
Ajouter à chaque leçon dette : `## 🌍 Le problème d'abord` (avant l'objectif) et
`## 🧩 Prérequis` (rédigés, ≥12 mots, pourquoi + liens), et un `practiceRef` vers un
exercice déterministe. Ne PAS réécrire les explications déjà solides.

### D2 — Exercices : raisonnement déterministe, jamais de faux ML
Politique de dépendances (CP0) : AUCUNE installation de numpy/pandas/scikit-learn/PyTorch/
TensorFlow. Les exercices manipulent la LOGIQUE (détection de leakage, choix de split,
calcul de métriques depuis une matrice de confusion, diagnostic overfit/underfit, choix
d'encodage, forward-pass d'un neurone, argmax de poids d'attention, estimation de coût LLM)
en node-js, contrat vérifié par exécution, sorties entières/chaînes (pas d'égalité
flottante fragile). Étiquetés SIMULATION. Le programme ne prétend jamais entraîner un
modèle ni exécuter PyTorch — les mentions PyTorch/NumPy dans les leçons décrivent le travail
HORS plateforme de l'apprenant.

### D3 — Pas de nouvelle leçon sauf trou conceptuel réel
`transformers.md` couvre déjà l'attention (QKV, têtes, positions) correctement : **aucune
leçon `attention-mechanism` séparée** (éviter cinq mini-leçons superficielles). Une nouvelle
leçon n'est créée que si l'audit CP démontre un trou qu'aucune leçon existante ne comble.

### D4 — Curriculum Graph III = read-model dérivé ÉTENDU
Réduire les warnings en corrigeant la DONNÉE SOURCE : déclarer les prérequis manquants des
leçons niveau-3 dans `v33-lessons-plan.json` (l'union des plans alimente le graphe).
N'ajouter un nouveau diagnostic que s'il détecte un problème pédagogique réel, déterministe,
testé, non bloquant sur heuristique. Pas de second graphe, pas de Neo4j, pas de persistance.

### D5 — Gate v33:check structurel + playbooks/glossaire via moteurs existants.

## Frontière réel / simulé (non négociable)
RÉEL : calcul déterministe local (métriques, forward-pass, argmax, coûts), tests, graphe.
SIMULÉ (étiqueté) : datasets/scores/poids fournis en entrée (aucun entraînement). JAMAIS
prétendre : entraîner un modèle, exécuter PyTorch/sklearn, appeler un LLM/vector DB, réseau.

## Alternatives rejetées
- **Installer un vrai stack ML (sklearn/torch)** : dépendances lourdes, exécution non
  garantie, contraire au caractère local et à la décision CP0. Rejeté.
- **Réécrire les leçons fortes** : gaspillage et risque de régression ; la dette est
  structurelle, pas de fond. Rejeté.
- **Créer une leçon attention séparée** : redondant avec transformers.md. Rejeté.
- **Activer le parcours `data-ml-v1`** parce que V33 ajoute du contenu : greenwashing ;
  ne l'activer que si l'audit CP10 prouve la cohérence. Différé.
- **Diagnostics de graphe bloquants sur heuristiques** : faux positifs → warning/info.

## Conséquences
Un néophyte peut suivre la chaîne ML→DL→transformers→LLM→LLMOps avec on-ramp, prérequis et
pratique à chaque maillon, et le Curriculum Graph détecte mieux les ruptures d'ordre pendant
que la dette de couverture de prérequis diminue.
