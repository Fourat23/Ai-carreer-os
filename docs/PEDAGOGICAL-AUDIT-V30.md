# Audit pédagogique V30 — Backend/API, dette AI/ML historique & documentation SE

> Sprint V30 — CP11. Document en français, lisible par un relecteur non technique. Il agit
> comme une **quality gate pédagogique indépendante** : il ré-audite les leçons V30, un
> échantillon d'anciennes leçons de plusieurs époques, conduit des **walkthroughs néophyte**,
> et distingue explicitement le **proxy structurel** de la **compréhension humaine réelle**.
> Aucun score n'est gonflé ; la longueur n'est jamais prise pour de la profondeur.

---

## 0. Objectif n°1 (rappel)
Priorité : **qualité pédagogique des cours** > cohérence des parcours > progression néophyte >
articulation théorie→pratique→mission→compétence→preuve > qualité technique > fonctionnalités.
Critère néophyte : « en ne connaissant que les prérequis annoncés, puis-je réellement suivre
cette leçon, comprendre POURQUOI le concept existe, et l'appliquer sans recopier ? »

## 1. Méthodologie (trois filtres + honnêteté du proxy)
- **Filtre structurel** (gate `v30:check`) : on-ramp avant objectif, prérequis rédigés, modèle
  mental, sections, liens valides, `practiceRefs` résolus (obligatoires pour les critiques),
  graphe acyclique, absence de signaux dangereux ; signaux densité/jargon en avertissement.
- **Filtre rubrique** (16 dimensions, `lib/pedagogy-audit.mjs`) : seuils aucune dim < 2, moyenne
  ≥ 3,0, récents ≥ 3,25, planchers ≥ 3.
- **Filtre néophyte** (walkthrough, § 6) : lecture experte simulant un débutant.
- **Honnêteté du proxy** : le gate et les scores sont des PROXYS structurels. Ils ne prouvent
  pas la compréhension humaine réelle — seule une lecture experte (et, idéalement, un test
  utilisateur non réalisé ici) le ferait. Ce document ne cache aucune dette derrière une moyenne.

## 2. Grille de priorités (P0 → P3)
| Priorité | Définition | Action |
|---|---|---|
| **P0** | Premier contact sans rampe ni modèle mental. | Corriger en priorité (additif). |
| **P1** | Fort trafic, modèle mental présent, sans rampe/prérequis. | Corriger ensuite. |
| **P2** | Améliorable, position tardive. | Plus tard. |
| **P3** | Conforme au standard V27→V30. | Aucune action. |

## 3. Matrice V30

### 3.1 Leçon créée (1) — P3
| Leçon | Domaine | Moyenne 16-dim |
|---|---|---|
| technical-documentation | Software Eng. | ~3,56 |

### 3.2 Leçons corrigées (Backend/API) — P0/P1 → P3
| Leçon | Avant | Après |
|---|---|---|
| api-design-basics | P0 | P3 |
| express-backend | P1 | P3 |
| authentication | P1 | P3 |
| async-javascript | P1 | P3 |

### 3.3 Leçons corrigées (dette AI/ML historique, flagship) — P0/P1 → P3
| Leçon | Avant | Après | Note « maths honnêtes » |
|---|---|---|---|
| statistics-for-ml | P0 | P3 | Bayes/écart-type par l'intuition, aucune formule imposée |
| machine-learning-basics | P0 | P3 | overfitting/leakage par analogie ; code illustratif |
| model-evaluation | P1 | P3 | precision/recall par le coût des erreurs |
| llm-fundamentals | P0 | P3 | « prédire le token suivant », plausible ≠ vrai |
| agents-fundamentals | P0 | P3 | boucle while + outils, démystifié |
| ai-security | P0 | P3 | « le texte est exécutable », défense en profondeur |

Correction commune (additive) : on-ramp « Le problème d'abord » avant l'objectif, « Prérequis »
rédigés, « Modèle mental » si absent, titres homogénéisés, `practiceRefs` vers artefacts
EXISTANTS ou créés en CP7. **Contenu technique d'origine conservé.**

### 3.4 Data/SQL — durcissement mineur (note réel/simulé)
Les 5 leçons Data (déjà P3 en V29) reçoivent une note explicite « la pratique est simulée en
JS, pas un vrai SGBD » (décision runtime ADR-030). Pas de re-notation (restent P3 V29).

### 3.5 Échantillon d'historiques NON modifiées (audit rétroactif indépendant, plusieurs époques)
| Leçon | Époque | Signal | Verdict |
|---|---|---|---|
| terminal-shell-filesystem | pré-V26 (corrigée V29) | on-ramp+prérequis+mental | P3 ✅ |
| cloud-aws-core | V26/V27 | on-ramp+prérequis | P3 ✅ |
| metrics-percentiles | V28 | on-ramp+prérequis+critique | P3 ✅ |
| react-hooks-effects | V29 | on-ramp+prérequis, useEffect correct | P3 ✅ |
| prompt-engineering | pré-V26, **non traitée V30** | 0 on-ramp / 0 prérequis / modèle mental | **P1 (dette V31)** |
| embeddings, rag-fundamentals, chunking-strategies | pré-V26, **non traitées** | rampe partielle/absente | **P1 (dette V31)** |
| feature-engineering, scikit-learn-workflow, neural-networks, transformers | pré-V26, **non traitées** | 0/0/1 | **P1 (dette V31)** |
| caching-performance, recursion, git-advanced | pré-V26, **non traitées** | 0/0/1 | **P1 (dette V31)** |

> L'audit indépendant confirme que les époques V26–V29 tiennent, et identifie les prochaines
> dettes prioritaires (IA appliquée avancée + Backend/Fondations P1) — voir § 7.

## 4. Avant / après (11 leçons V30)
| Élément | Avant | Après |
|---|---|---|
| Rampe « Le problème d'abord » avant l'objectif | ❌ | ✅ |
| Prérequis rédigés (≥ 12 mots) | ❌ | ✅ |
| Modèle mental explicite | selon leçon | ✅ |
| `practiceRefs` vers pratique réelle | ❌ (sauf rares) | ✅ (8 critiques) |
| Maths masquées derrière une formule (AI/ML) | risque | **non** (intuition d'abord) |
| Contenu technique d'origine | présent | **conservé** |

Registre `v30-pedagogy-audit.json` : 11 items, moyenne **3,551**, tous ≥ 3,25, planchers
respectés, validé par `tests/v30-pedagogy.test.mjs`.

## 5. Vérification spécifique « maths honnêtes » (AI/ML)
- **statistics-for-ml** : la distribution normale, l'écart-type et Bayes sont introduits par
  des exemples chiffrés concrets (test médical, latence p95), jamais par une formule nue. Le
  prérequis dit explicitement « aucune mathématique avancée requise ».
- **machine-learning-basics** : overfitting = « apprendre le corrigé par cœur » ; le code
  scikit-learn est étiqueté illustratif. Le niveau requis est précisé (stats de base).
- **model-evaluation** : precision/recall expliqués par le COÛT métier (spam vs dépistage),
  pas par la formule.
→ Exigence du prompt respectée : intuition avant formule, niveau requis précisé, aucun concept
masqué.

## 6. Walkthroughs néophyte

### 6.1 Séquence BACKEND (« je ne connais que les prérequis annoncés »)
`http-rest-json` (P3) → `async-javascript` (P3 : prérequis JS+HTTP annoncés, rampe « le
programme ne doit pas se figer en attendant ») → `api-design-basics` (P3 : prérequis HTTP+REST,
rampe « comment deux programmes se mettent d'accord ») → `express-backend` (P3 : prérequis
api-design+async+error-handling, chaîne de guichets) → `authentication` (P3 : prérequis HTTP+
express, 401 vs 403). Pratique : api-router, http-status, async-sum, auth-status-decision.
**Verdict** : aucune connaissance non introduite exigée ; chaque leçon consomme ce que la
précédente installe.

### 6.2 Séquence AI/ML (le parcours phare, néophyte complet)
`python-foundations` (P3) → `statistics-for-ml` (P3 : aucune maths avancée, « la moyenne
ment ») → `machine-learning-basics` (P3 : prérequis stats, « données+réponses→règles ») →
`model-evaluation` (P3 : precision/recall par le coût) → `llm-fundamentals` (P3 : prérequis ML,
« prédire le token suivant ») → `agents-fundamentals` (P3 : prérequis LLM, boucle while) →
`ai-security` (P3 : prérequis LLM+agents+auth, « le texte est exécutable »). Pratique :
ml-metric-choice, prompt-injection-classify.
**Verdict** : la chaîne des fondations IA est désormais suivable par un néophyte complet, sans
saut de jargon ni maths masquées. C'est la correction du déséquilibre central visé par V30.

### 6.3 Question centrale — réponse
Sur les séquences auditées : **oui**, un débutant qui ne connaît que les prérequis annoncés
peut comprendre le POURQUOI, construire un modèle mental correct, et pratiquer.

## 7. Défauts détectés & dette restante
- **Défauts V30 bloquants** : aucun (gate vert, walkthroughs OK). Faux positifs du scan
  d'authoring évités par reformulation de prose (pas d'affaiblissement du gate).
- **Dette AI/ML P1 (prioritaire V31)** : prompt-engineering, structured-outputs-tools,
  embeddings, rag-fundamentals, chunking-strategies, vector-databases, retrieval-reranking,
  ai-evaluation, rag-evaluation, agent-workflows-orchestration, prompt-injection-defense,
  llm-cost-optimization, llm-observability, feature-engineering, scikit-learn-workflow,
  neural-networks, transformers.
- **Backend/Fondations P1** : caching-performance, recursion, git-advanced.
- **Structurel** : runtime SQL réel différé ; parcours Frontend/Data non curés (annoncés).

## 8. Limites de l'audit
Les scores et le gate sont des **proxys structurels**, pas une preuve de compréhension. Le
walkthrough est une **lecture experte**, pas un test utilisateur réel (non réalisé).
L'audit AI/ML est **partiel par conception** (P0 prioritaires). La pratique SQL/AI est
**simulée** en JS, étiquetée comme telle.

## 9. Recommandations V31
1. **Vague IV AI/ML** : traiter les P1 IA appliquée par lots cohérents (prompt-engineering →
   structured-outputs ; puis RAG : embeddings/chunking/vector-databases/retrieval/rag-*).
2. **Rattraper Backend/Fondations P1** (caching-performance, recursion, git-advanced).
3. **Compléter le graphe de prérequis** global (cohérence inter-domaines).
4. **Décider du runtime SQL réel** (Option B) si un besoin pédagogique décisif émerge.
5. Garder la règle qualité > quantité et le walkthrough néophyte comme juge final.

## 10. Conclusion
V30 a corrigé le **déséquilibre central** du corpus : les fondations AI/ML du parcours phare
passent de P0/P1 à un standard accessible au néophyte (maths honnêtes), le Backend/API est
cohérent et relié, la documentation technique existe enfin. 11 leçons touchées (1 créée + 10
corrigées, dont 6 fondations IA), +3 exercices, +3 playbooks, +14 termes. La dette restante —
surtout l'IA appliquée avancée — est cartographiée honnêtement pour V31, sans être masquée.
