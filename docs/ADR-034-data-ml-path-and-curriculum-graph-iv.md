# ADR-034 — Data/ML Learning Path + Curriculum Graph IV + Theory→Practice Completion

Statut : accepté (Sprint V34). Décision fondée sur l'audit CP0 réel (état vérifié, non
supposé). **Priorité : pédagogie > cohérence des parcours > pratique > preuves > outillage >
UI.** Local, mono-utilisateur, sans auth/SaaS/réseau, **sans nouveau moteur**, sans dépendance
ML lourde, sans faux runtime.

## Problème produit (établi au CP0)

1. **Theory→practice incomplète** : `docker-containers` (prérequis de 3 leçons) et
   `llm-fundamentals` (prérequis de 9) sont signalés `foundation-without-practice`. L'audit
   montre que **10 exercices Docker existent déjà** (lien manquant, pas de création), tandis que
   `llm-fundamentals` n'a **aucun** exercice de bases (vrai trou → 1 exercice).
2. **Data foundations sous le standard** : `pandas-data-wrangling`, `data-cleaning-quality`,
   `etl-pipelines` (niveau 2) sont h7 (sans on-ramp/prérequis) et sans pratique — pourtant ce
   sont les premiers maillons « comprendre une donnée » du parcours Data/ML.
3. **Parcours `data-ml-v1` annoncé** : défini dans le catalogue mais sans mapping modules→jours
   (0 jour résolu). Le contenu de la chaîne existe ; la structure de parcours manque.
4. **Warnings Curriculum Graph (13)** : à trier honnêtement (vrai trou / relation manquante /
   acceptable / faux positif / hors périmètre).

## Décision

### D1 — RÉUTILISER → RELIER → DURCIR → CRÉER (dans cet ordre)
On ne crée un contenu que si l'audit prouve un trou réel. `docker-containers` est RELIÉ à des
exercices existants (aucune création). `llm-fundamentals` reçoit UN exercice déterministe
(budget de contexte / grounding), car aucun exercice de bases n'existe.

### D2 — Data foundations durcies, additivement
`pandas-data-wrangling`, `data-cleaning-quality`, `etl-pipelines` reçoivent on-ramp « 🌍 Le
problème d'abord » + prérequis rédigés + pratique déterministe. Le contenu existant est
conservé ; principe « comprendre une donnée (ligne/colonne/observation/variable/qualité) avant
DataFrame/feature/modèle ».

### D3 — Exercices : raisonnement déterministe, jamais de faux ML
Politique inchangée (V33) : aucune dépendance ML (numpy/pandas/sklearn/torch), aucun
entraînement, aucun appel LLM/vector DB/réseau. Les exercices testent le RAISONNEMENT
(qualité de données, ordre de pipeline, budget de contexte…) en node-js, sorties
entières/chaînes, étiquetés SIMULATION.

### D4 — Curriculum Graph IV = read-model dérivé, warnings triés (pas maquillés)
- `docker-containers` : résolu par le lien (relation manquante → corrigée).
- `concept-without-foundation` non-ML (git-advanced, caching-performance, monitoring-production,
  system-design-interview) : déclarer les prérequis réels dans le plan v34, après vérification
  du contenu (relation manquante → corrigée à la source).
- `advanced-before-prerequisite` ×6 : dépendances CONCEPTUELLES légitimes où le « niveau » est
  un proxy grossier (ex. documenter une architecture suppose d'en connaître les bases) →
  **acceptées et documentées**, PAS supprimées (ne pas détruire un prérequis valide).
- `concept-not-practiced: skill:patterns` : hors thème Data/ML → backlog V35.
Aucun « warning suppression » arbitraire ; un warning ne disparaît que si la donnée source est
réellement corrigée.

### D5 — Parcours `data-ml-v1` : activation conditionnelle, data-driven
Le parcours n'est promu « disponible » QUE si un mapping modules→jours cohérent est
démontrable à partir des journées réelles. Sinon il reste ANNONCÉ avec une matrice précise de
blockers. Aucun greenwashing. La durée dérive des jours réellement sélectionnés (pas de nombre
codé en dur).

## Frontière réel / simulé
RÉEL : calcul local des exercices, tests, graphe. SIMULÉ (étiqueté) : datasets/scores/budgets
fournis. JAMAIS : entraîner un modèle, exécuter pandas/sklearn, appeler un LLM, réseau.

## Alternatives rejetées
- **Créer des exercices Docker** : ils existent déjà → simple lien. Rejeté (anti-doublon).
- **Activer data-ml-v1 parce que le contenu existe** : greenwashing. Rejeté sauf cohérence
  démontrée.
- **Supprimer les prérequis `advanced-before-prerequisite`** : détruirait des relations
  conceptuelles valides pour faire baisser un compteur. Rejeté.
- **Réécrire les data-foundations** : contenu correct, dette structurelle → durcissement
  additif. Rejeté.

## Conséquences
Theory→practice devient plus traçable (docker relié, llm-fundamentals pratiqué), les data
foundations atteignent le standard, les warnings du graphe sont mieux compris et réduits
uniquement là où c'est légitime, et l'activation du parcours Data/ML est décidée sur preuve.
