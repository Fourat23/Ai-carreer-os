# Audit pédagogique V29 — Socle, Frontend/React, Data/SQL & Software Engineering

> Sprint V29 — CP11. Document en français, lisible par un relecteur non technique. Il
> applique le **standard pédagogique V27/V28** (16 dimensions) aux leçons créées et
> corrigées en V29, poursuit l'**audit rétroactif** du corpus historique (matrice
> P0 → P3), mesure les corrections, conduit des **parcours néophyte** (frontend et
> backend), et énonce honnêtement la dette restante. Aucun score n'est gonflé ; la
> longueur n'est jamais prise pour de la profondeur.

---

## 0. Objectif n°1 (rappel)

Priorité absolue : **la compréhension réelle par un néophyte complet**, puis cohérence des
parcours, pratique, qualité logicielle, fonctionnalités, UI. Critère néophyte complet :

> « Une personne qui ne connaît pas encore cette technologie pourrait-elle comprendre
> *pourquoi* le concept existe, construire un modèle mental correct, puis l'appliquer sans
> recopier aveuglément ? »

Toujours : **situation → intuition → vocabulaire → mécanisme → pratique**.

---

## 1. Méthodologie (trois filtres)

### 1.1 Filtre structurel automatique (gate `v29:check`)
Vérifie, sans juger la profondeur par la longueur : rampe « 🌍 Le problème d'abord » AVANT
l'objectif ; bloc « 🧩 Prérequis » rédigé (≥ 12 mots) ; modèle mental, explication, exemple
guidé, erreurs fréquentes, synthèse, vocabulaire, liens ; liens internes valides ;
`practiceRefs` résolus (obligatoires pour les leçons critiques) ; graphe de prérequis
acyclique ; absence de signaux dangereux. Ajoute deux **signaux pédagogiques en
avertissement** (proxys, non bloquants) : densité conceptuelle et jargon « à froid ».

### 1.2 Filtre rubrique — 16 dimensions (`lib/pedagogy-audit.mjs`)
Notes 0–4 sur 16 axes. Seuils (registre `v29-pedagogy-audit.json`, validé par test) : aucune
dimension < 2 ; moyenne globale ≥ 3,0 ; moyenne des items récents ≥ 3,25 ; planchers
(exactitude, objectif, progression, pratique autonome) ≥ 3.

### 1.3 Filtre néophyte (lecture experte « en marchant »)
Parcours simulés du point de vue d'un débutant (§ 6), vérifiant qu'aucune connaissance non
introduite n'est exigée.

> **Limite assumée** : lecture experte, pas test utilisateur ; les scores sont des proxys.

---

## 2. Grille de priorités (P0 → P3)

| Priorité | Définition | Action |
|---|---|---|
| **P0** | Réellement problématique : leçon de **premier contact** sans rampe ni modèle mental. | Corriger en priorité (additif). |
| **P1** | À fort trafic, modèle mental présent mais ni rampe ni prérequis explicites. | Corriger ensuite. |
| **P2** | Améliorable, position tardive (contexte déjà installé). | Plus tard. |
| **P3** | Conforme au standard V27/V28/V29. | Aucune action. |

Principe : on ne réécrit pas arbitrairement le corpus ; on corrige les P0 de premier contact
et les domaines cibles (Frontend/Data/SE), et on documente le reste. *« Une excellente leçon
vaut mieux que cinq superficielles. »*

---

## 3. Matrice du corpus (109 leçons)

### 3.1 Nouvelles leçons V29 (9) — **P3**
| Leçon | Domaine | Profil | Moyenne 16-dim |
|---|---|---|---|
| browser-dom-rendering | Frontend & React | standard | ~3,56 |
| react-composition-architecture | Frontend & React | dense | ~3,44 |
| react-accessibility | Frontend & React | standard | ~3,56 |
| sql-performance-indexing | Data & SQL | dense | ~3,44 |
| database-transactions-concurrency | Data & SQL | dense | ~3,44 |
| database-migrations | Data & SQL | dense | ~3,44 |
| refactoring-legacy-code | Software Eng. | standard | ~3,56 |
| technical-debt | Software Eng. | standard | ~3,56 |
| breaking-changes-compatibility | Software Eng. | dense | ~3,44 |

### 3.2 Leçons historiques CORRIGÉES en V29 (12) — P0/P1 → **P3**
| Leçon | Domaine | Avant | Après |
|---|---|---|---|
| terminal-shell-filesystem | Fondations | P0 | P3 |
| git-fundamentals | Fondations | P0 | P3 |
| data-structures-intro | Fondations | P0 | P3 |
| typescript-basics | Fondations | P0 | P3 |
| sql-foundations | Data & SQL | P0 | P3 |
| react-fundamentals | Frontend & React | P1 | P3 |
| react-hooks-effects | Frontend & React | P1 | P3 |
| database-modeling | Data & SQL | P1 | P3 |
| testing-foundations | Software Eng. | P0/P1 | P3 |
| error-handling | Software Eng. | P1 | P3 |
| design-patterns-intro | Software Eng. | P0/P1 | P3 |
| architecture-basics | Software Eng. | P0/P1 | P3 |

Correction commune (additive, contenu conservé) : on-ramp « Le problème d'abord » avant
l'objectif, « Prérequis » rédigés, « Modèle mental » si absent, titres homogénéisés
(Exemple guidé / Erreurs fréquentes / Liens / Vocabulaire / À retenir), et `practiceRefs`
vers des artefacts EXISTANTS (exercices, Lab, playbooks).

### 3.3 Échantillon d'historiques NON modifiées (audit rétroactif indépendant)
Relevé structurel objectif (on-ramp / prérequis / modèle mental), plusieurs époques :

**P0/P1 de premier contact restants (priorité V30) :**
| Leçon | Domaine | Signal |
|---|---|---|
| api-design-basics | Web & backend | 0/0/0 |
| llm-fundamentals | IA appliquée | 0/0/0 |
| agents-fundamentals | IA appliquée | 0/0/0 |
| ai-security | IA appliquée | 0/0/0 |
| statistics-for-ml, machine-learning-basics | Python & ML | 0/0/0 |

**P1 à fort trafic (modèle mental présent, pas de rampe) :**
| Leçon | Domaine |
|---|---|
| async-javascript, recursion, git-advanced | Fondations |
| express-backend, authentication, caching-performance | Web & backend |
| pandas-data-wrangling, data-cleaning-quality, etl-pipelines | Data & SQL |
| observability-logging, monitoring-production, deployment-secrets, docker-containers, ci-cd | Production/DevOps |
| prompt-engineering, embeddings, rag-*, model-evaluation… | IA appliquée |
| readme-documentation, portfolio-github, technical-storytelling, interview-preparation | Carrière |

> Frontière P1/P2 : selon la position dans le parcours (un néophyte arrive « à froid » sur
> api-design-basics ; « réchauffé » sur rag-evaluation). Classement au premier contact.

### 3.4 Domaines déjà conformes P3 (non retouchés)
Systèmes/Linux (5), Réseau (5), Docker (5), Kubernetes (6), Cloud/AWS/Azure/IaC/FinOps (7),
CI/CD (4), Observabilité/SRE (8), + les 5 corrigées V28 (javascript-basics,
algorithmic-thinking, http-rest-json, python-foundations, clean-code).

### 3.5 Synthèse quantitative
| État | Nombre (approché, honnête) |
|---|---|
| Conformes P3 (V26 + V27 + V28 + 9 nouvelles V29 + 12 corrigées V29) | ~66 |
| P0 premier contact restants (hors V29) | ~6 |
| P1/P2 restants (documentés, dette V30) | ~30 |

---

## 4. Avant / après des 12 leçons corrigées

| Élément | Avant | Après |
|---|---|---|
| Rampe « Le problème d'abord » avant l'objectif | ❌ | ✅ |
| Bloc « Prérequis » rédigé (≥ 12 mots) | ❌ | ✅ |
| Modèle mental explicite | selon leçon | ✅ |
| Titres homogènes (exemple/erreurs/liens/vocab/à retenir) | partiel | ✅ |
| `practiceRefs` vers pratique réelle | ❌ | ✅ |
| Contenu technique d'origine | présent | **conservé** |

Le gain ne vient pas d'un allongement : il vient de l'**accessibilité au néophyte** (le
*pourquoi* avant le *quoi*) et du **lien théorie → pratique**. Exemples de « pourquoi avant
quoi » désormais présents :
- **typescript-basics** : « rien n'empêche d'appeler une fonction avec le mauvais type » →
  insiste ensuite sur compile-time vs runtime (TS ne valide pas les données à l'exécution).
- **sql-foundations** : « on te demande les 3 meilleurs clients ce trimestre » avant SELECT.
- **react-fundamentals** : « mettre à jour le DOM à la main devient ingérable » → UI = f(état).
- **testing-foundations** : « comment être sûr qu'un changement n'a rien cassé sans tout
  re-cliquer ? » avant Arrange/Act/Assert.

---

## 5. Registre d'audit (`v29-pedagogy-audit.json`)
21 items (9 nouvelles + 12 corrigées), notés sur 16 dimensions. Moyenne globale **3,527**,
tous ≥ seuil récent 3,25, planchers respectés, validé par `tests/v29-pedagogy.test.mjs`
(4 tests). Le registre ne contient que des items conformes ; les historiques non modifiées
et les évaluations de densité vivent dans CE document (les y injecter masquerait la dette).

---

## 6. Parcours néophyte « en marchant » (walkthroughs)

### 6.1 Séquence FRONTEND (débutant absolu → React)
1. **browser-dom-rendering** (P3) — prérequis : JavaScript de base uniquement. Rampe :
   « qui change le contenu quand je clique, et comment ? ». Construit HTML/CSS/JS → DOM →
   cycle événement→état→DOM, et montre à la MAIN pourquoi ça devient fragile. → practiceRefs
   web-semantic, web-counter, web-debug-selector (exercices DOM réels).
2. **react-fundamentals** (P3) — prérequis annoncés : browser-dom-rendering + JS. La rampe
   REPREND exactement la douleur installée en 1 (« mettre à jour le DOM à la main devient
   ingérable ») → UI = f(état). Chaîne cohérente. → react-hello, react-counter, react-list…
3. **react-hooks-effects** (P3) — prérequis : react-fundamentals + async-javascript. Passe de
   « afficher un état » à « synchroniser avec l'extérieur » ; 3 états async, race conditions.
   → react-form-name, react-search, react-toggle.
4. **react-composition-architecture** (P3) — prérequis : les deux précédentes + clean-code.
   Organise à grande échelle (composition, context, hooks perso, quand mémoïser). → react-profile,
   playbook frontend-regression.
   **Verdict** : aucune connaissance non introduite exigée ; chaque leçon consomme exactement
   ce que la précédente installe.

### 6.2 Séquence BACKEND / DONNÉES
1. **http-rest-json** (P3, V28) → 2. **sql-foundations** (P3) — prérequis : tableaux d'objets
   JS ; « les 3 meilleurs clients » avant la syntaxe. → sql-inner-join, sys-log-level-counts.
3. **database-modeling** (P3) → 4. **sql-performance-indexing** (P3) — prérequis :
   sql-foundations + algorithmique/structures (l'index EST l'arbre équilibré). → fix-nplus1,
   playbook slow-sql-query.
Parallèlement, **testing-foundations** (P3) → **refactoring-legacy-code** (P3) →
**technical-debt** (P3) forment une chaîne SE cohérente (tester → changer sans casser →
décider de la dette). **Verdict** : chaîne cohérente, prérequis honnêtes, pratique reliée.

### 6.3 Question centrale — réponse
Pour chaque leçon testée : un néophyte peut-il comprendre POURQUOI le concept existe,
construire un modèle mental correct, puis l'appliquer ? Sur les séquences auditées : **oui**.

---

## 7. Leçons encore faibles / dette pédagogique restante

- **P0 premier contact hors V29 (priorité V30)** : api-design-basics, llm-fundamentals,
  agents-fundamentals, ai-security, statistics-for-ml, machine-learning-basics.
- **P1 fort trafic** : async-javascript, recursion, git-advanced, express-backend,
  authentication, caching-performance, pandas/cleaning/etl, prompt-engineering,
  observability-logging, monitoring-production.
- **Parcours Frontend/Data** : la connaissance est renforcée, mais la CURATION jour-par-jour
  d'un parcours autonome n'existe pas encore (restent `announced`).

Limites : scores = proxys (pas de test utilisateur) ; audit rétroactif partiel par
conception ; pratique SQL simulée en JS (raisonnement relationnel), étiquetée.

---

## 8. Recommandations pour V30

1. **Continuer le hardening rétroactif** sur les P0 hors V29 (api-design-basics + fondations
   IA/ML de premier contact), même patron additif.
2. **Rattraper les P1 par lots cohérents** (async-javascript, express-backend, authentication ;
   puis un lot IA/ML ; puis carrière).
3. **Approfondir React** (routing, data-fetching avancé, formulaires complexes) et **Data**
   (data quality, ETL au standard) si l'audit le justifie.
4. **Envisager la curation jour-par-jour** des parcours Frontend/Data pour les faire passer de
   `announced` à `available` (avec projets fil rouge), sans greenwashing.
5. Garder la règle qualité > quantité et le walkthrough néophyte comme juge final.

---

## 9. Conclusion
V29 a (a) **éliminé la dette P0 de premier contact** (5/5 corrigées), (b) bâti un **corpus
Frontend/React cohérent** (5 leçons) en réutilisant la pratique existante, (c) **approfondi
Data/SQL** (index/plans, transactions/concurrence, migrations) et **Software Engineering**
(refactoring/legacy, dette technique, changements cassants), (d) relié le tout à la pratique
(exercices, playbooks) et enrichi le glossaire (+21). 12 leçons historiques passent de
P0/P1 à P3. Le corpus atteint **109 leçons**, avec une dette restante honnêtement
cartographiée pour V30. Aucun score gonflé, aucune leçon rallongée « pour faire riche ».
