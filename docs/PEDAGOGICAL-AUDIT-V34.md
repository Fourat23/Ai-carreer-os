# Audit pédagogique V34 — Fondations Data, theory→practice & parcours Data/ML

Sprint V34. Juge de FOND de la qualité pédagogique (le gate `v34:check` juge la structure, le
Curriculum Graph IV la connectivité). Priorité : pédagogie > cohérence des parcours > pratique
> preuves > outillage > UI.

## 1. Méthodologie
- Rubrique v20 (16 dimensions, 0-4). Seuils : aucune dimension < 2, dimensions dures ≥ 3,
  moyenne ≥ 3.25 (récent).
- Périmètre noté (`docs/architecture/v34-pedagogy-audit.json`) : 5 leçons (4 durcies + 1
  rétroactive).
- Constat CP0 : la plupart des dettes étaient des LIENS manquants (docker) ou une STRUCTURE
  absente (on-ramp/prérequis) sur du contenu correct. Correction additive, réutilisation avant
  création.

## 2. Matrice de priorité (P0 → P3)

| Priorité | Leçons | Justification |
| --- | --- | --- |
| **P0** | pandas-data-wrangling, data-cleaning-quality, etl-pipelines | Premiers maillons « comprendre une donnée » du parcours Data/ML, sans on-ramp ni pratique. |
| **P1** | llm-fundamentals (pratique manquante), docker-containers (lien manquant) | Fondations très dépendues (foundation-without-practice). |
| **P2** | recursion | Premier-contact Fondations sans on-ramp (rétroactif). |

## 3. Scores après durcissement

| Leçon | Profil | Moyenne | Pratique |
| --- | --- | --- | --- |
| llm-fundamentals | accessible | 3.69 | llm-context-budget |
| pandas-data-wrangling | accessible | 3.69 | table-groupby, data-quality-detect |
| data-cleaning-quality | accessible | 3.69 | data-quality-detect, data-missing-strategy |
| etl-pipelines | accessible | 3.69 | etl-pipeline-order |
| recursion | mini-exercice | 3.63 | (mini-exercice intégré) |

## 4. Avant / après

| Dimension | Avant V34 | Après V34 |
| --- | --- | --- |
| foundation-without-practice | 2 (docker, llm-fundamentals) | **0** |
| Data foundations avec on-ramp/prérequis/pratique | 0/3 | **3/3** |
| Exercices data/ML déterministes | (V33) | **+6** (context-budget, data-quality, missing-strategy, etl-order, table-groupby, drift) |
| Warnings Curriculum Graph | 13 | **7** (concept-without-foundation 4→0) |
| Parcours data-ml-v1 | annoncé | annoncé (décision honnête, contenu prêt) |
| Leçons sans on-ramp | 16 | 12 (−4 : pandas, cleaning, etl, recursion) |

## 5. Échantillon multi-époques (non-régression) + benchmark

| Leçon (époque) | Constat |
| --- | --- |
| `javascript-basics` (Fondations) | intacte |
| `sql-foundations` (V?) | intacte, sert de prérequis à pandas |
| `neural-networks` (V33) | intacte |
| `agents-fundamentals` (V32) | intacte |
| `rag-fundamentals` (V31) | intacte |
| Benchmark `docker-containers` / `kubernetes-basics` (Cloud, réputées fortes) | niveau conservé ; les leçons data V34 atteignent le même standard structurel |

## 6. Beginner walkthrough — « Je sais à peine ce qu'est une donnée »

Parcours mental d'un débutant complet sur la chaîne Data/ML, avec contrôle des prérequis à
chaque étape :

1. **python-foundations** → variables, listes, fonctions. ✅
2. **pandas-data-wrangling** → on-ramp « 50 000 lignes, CA par région » ; DataFrame = feuille
   programmable ; ligne=observation, colonne=variable. *Pratique* : compter par groupe
   (table-groupby), repérer un défaut (data-quality-detect). ✅ prérequis (python, sql) réels.
3. **data-cleaning-quality** → on-ramp « export sale → résultat faux mais crédible » ; garbage
   in/out ; manquants/doublons/types/aberrations. *Pratique* : diagnostiquer (data-quality-
   detect), choisir une stratégie de manquants (data-missing-strategy). ✅
4. **etl-pipelines** → on-ramp « pipeline rejouable » ; extract→clean→transform→load, l'ordre
   compte. *Pratique* : ordonner un pipeline (etl-pipeline-order). ✅
5. **statistics-for-ml → feature-engineering → ml → model-evaluation** (V33) : feature/target,
   split, leakage, métriques, overfit. ✅ pratiques reliées.
6. **neural-networks → transformers** (V33) : intuition avant formule. ✅
7. **llm-fundamentals → RAG → agents** (V30-V32) : token, fenêtre de contexte. *Pratique* :
   budget de contexte (llm-context-budget). ✅
8. **llm-cost-optimization → llm-observability** (V33) : coût, latence, drift. *Pratique* :
   estimer un coût (llm-cost-estimate), détecter une dérive (ml-drift-detect). ✅

**Ruptures détectées** : aucune rupture MAJEURE. L'apprenant va de « qu'est-ce qu'une donnée »
à « je situe production, coût et drift » sans saut conceptuel. Les prérequis annoncés sont
réellement enseignés en amont (vérifié par le graphe acyclique et les reachability e2e).

## 7. Audit des parcours (CP11-D)
6 parcours disponibles inchangés (aucune régression V34). `data-ml-v1` reste annoncé (cf.
`v34-data-ml-track-matrix.md` : contenu prêt, packaging du parcours = blocker structurel V35).
Le parcours `ai-engineer-foundations-v1` (365 j) contient et ordonne toute la chaîne Data/ML.

## 8. Frontière réel / simulé
Aucune dépendance ML/pandas, aucun entraînement, aucun appel LLM/réseau. Les 6 nouveaux
exercices calculent RÉELLEMENT en local sur des données fournies ; tous étiquetés SIMULATION.
docker-containers est relié à des exercices Docker déterministes existants.

## 9. Dette restante (transparence, backlog V35)
- **Parcours data-ml-v1** : packaging (séquence de jours dédiée, modules, missions/preuves).
- **Warnings graphe (7)** : 6 advanced-before-prerequisite (dépendances conceptuelles
  légitimes, niveau = proxy grossier), 1 concept-not-practiced (design-patterns-intro).
- **Leçons sans on-ramp (12 restantes)** : ci-cd, git-advanced, deployment-secrets,
  observability-logging, portfolio-github, readme-documentation, interview-preparation,
  technical-storytelling, system-design-interview, monitoring-production, caching-performance,
  data-cleaning-quality*(faite)*… → backlog rétroactif V35, priorité premier-contact.
- **Débordement 6px** sur data-cleaning-quality @375px (bloc de code, PRÉ-EXISTANT) → V35.

## 10. Limites honnêtes
- La rubrique reste un proxy calibré, pas un test utilisateur réel.
- Le Curriculum Graph juge connectivité/ordre, pas la profondeur.
- Les exercices testent le raisonnement (qualité, ordre de pipeline, budget), pas un vrai
  pandas/entraînement — choix d'honnêteté.
- data-ml-v1 non activé : décision assumée, pas un échec masqué.

## 11. CP12 — non requis
CP11 ne révèle aucune rupture majeure de progression, aucune leçon P0 dans la chaîne Data/ML
principale (toutes P3), aucun warning bloquant, aucune pratique essentielle absente sur le
périmètre, et les parcours disponibles restent cohérents. **CP12 non requis — critères
académiques atteints.**

## 12. Recommandations V35
1. Packager le parcours `data-ml-v1` (séquence dédiée) OU le maintenir annoncé documenté.
2. Poursuivre le hardening rétroactif des 12 leçons sans on-ramp (priorité premier-contact :
   git-advanced, ci-cd, observability-logging).
3. Corriger le débordement 6px (bloc de code @375px) — petit correctif responsive.
4. Résorber le concept-not-practiced (design-patterns-intro) si un exercice pertinent existe.
