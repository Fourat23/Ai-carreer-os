# Audit pédagogique V33 — ML → DL → Transformers → LLMOps

Sprint V33. Juge de FOND de la qualité pédagogique (le gate `v33:check` juge la structure, le
Curriculum Graph III la connectivité/l'ordre). Priorité : qualité académique > accessibilité
néophyte > cohérence du graphe > pratique reliée > exactitude > honnêteté réel/simulé.

## 1. Méthodologie
- **Rubrique** v20 (16 dimensions, 0-4). Seuils : aucune dimension < 2 ; dimensions dures ≥ 3 ;
  moyenne ≥ 3.25 (contenu récent).
- **Périmètre noté** : les 6 leçons durcies (`docs/architecture/v33-pedagogy-audit.json`).
- **Constat CP0** : contenu déjà FORT sur ces 6 leçons ; la dette était structurelle (on-ramp +
  prérequis absents) et surtout l'ABSENCE de pratique. Correction additive, pas de réécriture.
- **Benchmark** : les nouvelles leçons sont comparées aux meilleures leçons existantes
  (Cloud/SRE, RAG V31), pas seulement aux seuils.

## 2. Matrice de priorité (P0 → P3)

| Priorité | Leçons | Justification |
| --- | --- | --- |
| **P0** | neural-networks, transformers | Cœur DL/LLM ; sans pratique, la compréhension restait passive. |
| **P1** | feature-engineering, scikit-learn-workflow | Fondations ML tabulaires (leakage, workflow). |
| **P2** | llm-cost-optimization, llm-observability | LLMOps : ce qui change en production. |

## 3. Scores après durcissement

| Leçon | Profil | Moyenne | Pratique |
| --- | --- | --- | --- |
| feature-engineering | accessible | 3.69 | ml-data-leakage, ml-feature-encoding |
| scikit-learn-workflow | accessible | 3.69 | ml-split-choice, ml-data-leakage |
| neural-networks | dense | 3.69 | nn-forward-neuron, ml-overfit-diagnose |
| transformers | dense | 3.69 | attention-argmax |
| llm-cost-optimization | dense | 3.69 | llm-cost-estimate |
| llm-observability | dense | 3.69 | llm-cost-estimate |

`autonomous-practice` : 3 (mini-exercice) → **4** (exercice exécutable relié) sur les 6 leçons.
Aucune dimension sous le seuil ; dimensions dures ≥ 3 partout.

## 4. Avant / après

| Dimension | Avant V33 | Après V33 |
| --- | --- | --- |
| On-ramp « problème d'abord » | absent (6 leçons) | présent (6 leçons) |
| Prérequis rédigés | absents (6 leçons) | présents (6 leçons) |
| Pratique ML/DL/LLMOps exécutable | 1 exercice (ml-metric-choice) | **9 exercices** reliés |
| Leçons ML/DL/LLMOps critiques (practiceRef résolu) | 0 | 6 |
| Playbooks ML « Que faire dans ce cas ? » | 0 | 3 |
| Warnings Curriculum Graph | 15 | 13 (concept-without-foundation 8→4) |
| Diagnostics de graphe | 8 | 9 (+foundation-without-practice) |

## 5. Échantillon multi-époques (non-régression)

| Leçon (époque) | Constat |
| --- | --- |
| `javascript-basics` (Fondations) | intacte |
| `sql-performance-indexing` (V29) | intacte |
| `technical-documentation` (V30) | intacte |
| `rag-fundamentals` (V31) | intacte |
| `agents-fundamentals` (V32) | intacte |
| `machine-learning-basics` (V30, non modifiée) | intacte, sert de racine à la chaîne |

Benchmark Cloud/DevOps (réputées excellentes) : `docker-containers`, `kubernetes-basics` —
niveau conservé ; les nouvelles leçons ML atteignent le même standard structurel (on-ramp,
prérequis, pratique).

## 6. Beginner walkthrough — « Je ne connais quasiment rien au ML »

Parcours suivi maillon par maillon, avec les 8 questions de contrôle :

1. **machine-learning-basics** → feature/label/split : introduits, exemple churn. *Pratique* :
   choisir une métrique (ml-metric-choice). ✅ aucun terme non expliqué.
2. **feature-engineering** → on-ramp « présenter l'information » ; leakage expliqué par un cas
   concret (date de résiliation). *Pratique* : détecter une fuite (ml-data-leakage), choisir un
   encodage (ml-feature-encoding). ✅
3. **model-evaluation** → precision/recall par les faux positifs/négatifs ; matrice de
   confusion. *Pratique* : calculer precision/recall (ml-confusion-metric), diagnostiquer
   overfit (ml-overfit-diagnose). ✅ deux métriques → deux décisions montré.
4. **scikit-learn-workflow** → le WORKFLOW reproductible anti-leakage (pas l'API). *Pratique* :
   choix de split (ml-split-choice). ✅
5. **neural-networks** → « machine à régler des boutons » ; neurone→loss→gradient→backprop ;
   overfit par les courbes. *Pratique* : passe avant d'un neurone (nn-forward-neuron). ✅
   intuition AVANT la formule.
6. **embeddings → transformers** → attention « salle de réunion » AVANT QKᵀ/√d ; token,
   position, têtes, couches ; coût quadratique → RAG. *Pratique* : argmax d'attention
   (attention-argmax). ✅ chaque terme défini au bon moment.
7. **llm-fundamentals → RAG/agents** (V30-V32) → positionnés après les fondations. ✅
8. **llm-cost-optimization / llm-observability** → ce qui change en production : coût (entrée +
   sortie), latence, traces, régression, dérive. *Pratique* : estimer un coût
   (llm-cost-estimate). ✅ compromis qualité↔coût↔latence↔fiabilité explicite.

**Ruptures détectées** : aucune rupture MAJEURE. L'apprenant peut aller de « je ne sais pas ce
qu'est une feature » à « je situe RAG et agents dans la chaîne et je raisonne sur la
production » sans saut conceptuel. Rupture MINEURE documentée : `llm-fundamentals` n'a pas
encore de pratique exécutable propre (warning `foundation-without-practice`) — candidat V34.

## 7. Frontière réel / simulé
Aucune dépendance ML installée (numpy/sklearn/torch), aucun entraînement, aucun appel de
modèle, aucun réseau. Les 9 exercices calculent RÉELLEMENT en local (fuite, split, encodage,
métriques, forward-pass, attention, coût) sur des données fournies ; tous étiquetés SIMULATION
(vérifié par test). Les mentions PyTorch/NumPy dans les leçons décrivent le travail hors
plateforme de l'apprenant — jamais une exécution de la plateforme.

## 8. Dette restante (transparence)
- **Parcours Data/ML** (`data-ml-v1`) : reste annoncé (0 jour résolu) — structure de modules à
  bâtir (V34).
- **Warnings graphe** : 4 `concept-without-foundation` non-ML (git-advanced, caching-performance,
  monitoring-production, system-design-interview), 6 `advanced-before-prerequisite`
  cross-domaine, 1 `concept-not-practiced` (design-patterns-intro), 2
  `foundation-without-practice` (llm-fundamentals, docker-containers) → backlog V34 ordonné par
  impact.
- **ML avancé** : NLP classique, séries temporelles, modèles tabulaires avancés non couverts
  (hors périmètre V33).

## 9. Limites honnêtes
- La rubrique reste une auto-évaluation calibrée, pas un test utilisateur réel.
- Le Curriculum Graph garantit connectivité et ordre, pas la profondeur — d'où cet audit humain.
- Les scores « accessibilité » à 3 sur les leçons denses (DL/transformers) sont assumés : sujet
  intrinsèquement avancé, pas un défaut masqué.
- Les exercices testent le RAISONNEMENT (règles, calculs), pas la mise en œuvre d'un vrai
  entraînement — c'est un choix d'honnêteté, pas une couverture complète du métier ML.

## 10. Recommandations V34
1. Doter `llm-fundamentals` (et docker-containers) d'une pratique reliée (foundation-without-practice).
2. Résorber les 4 `concept-without-foundation` non-ML en déclarant leurs prérequis.
3. Structurer et évaluer honnêtement le parcours `data-ml-v1` (ou le laisser annoncé).
4. ML avancé (séries temporelles, NLP classique) si l'audit le justifie.

## 11. CP12 — non requis
CP11 n'a révélé aucune rupture majeure de progression, aucune leçon P0 dans la chaîne
principale, aucun warning bloquant, aucune pratique essentielle absente sur le périmètre V33,
et le parcours AI Engineer reste cohérent. **CP12 non requis — critères académiques atteints.**
