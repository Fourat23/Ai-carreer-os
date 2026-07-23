# NEXT_STEPS_FABLE — plan de qualité des 365 jours

Fichier de pilotage du chantier « rendre les 365 jours réellement qualitatifs ».
Mis à jour à chaque batch. **Reprends toujours ce fichier en premier.**

---

## Batch 0 — Audit initial (FAIT)

### État mesuré (au démarrage du chantier)
| Élément | Valeur |
|---|---|
| Jours | 365/365 |
| Corrections | 365/365 (313 détaillées + 52 grilles de revue) |
| Semaines / Mois | 52 / 12 |
| Leçons de fond | **21** (cible : ≥ 60) |

### Qualité moyenne par tranche (mots/jour, jours de travail)
| Tranche | Jours travail | Moy. mots | Exemple guidé | Vraie question d'entretien | Théorie inline |
|---|---|---|---|---|---|
| 1-30 | 26 | **1263** | 26/26 ✅ | oui (quiz + oral) | riche ✅ |
| 31-90 | 52 | 565 | **52/52 ✅** (31-60 Batch 5G ; 61-90 Batch 5H) | oui (Q+relance+oral) | riche ✅ |
| 91-180 | 77 | 366 | **0/77** ❌ | non | **mince** (surtout liens leçons) |
| 181-270 | 77 | 366 | **0/77** ❌ | non | **mince** |
| 271-365 | 81 | 358 | **0/81** ❌ | non | **mince** |

> Note : « entretien » est cité partout mais via le bloc générique « Pourquoi ça comptera plus tard » — **ce ne sont pas de vraies questions d'entretien** hors jours 1-30.

### Zones faibles identifiées
- **Z1 — Jours 31-90** : pas d'exemple guidé ; pas de vraie question d'entretien ; théorie à approfondir.
- **Z2 — Jours 91-365 (235 jours)** : théorie inline mince (~360 mots), pas d'exemple guidé, pas de vraie question d'entretien, pas de cas métier explicite pour les jours IA. C'est la plus grosse zone à traiter.
- **Z3 — Leçons** : seulement 21 (cible ≥ 60) ; structure à étendre (modèle mental, exemple appliqué IA, anti-patterns, exercice difficile + correction, questions d'entretien, checklist « quand je suis prêt », vocabulaire).
- **Z4 — Maintenabilité** : `curriculum/AUTHORING_GUIDE.md`, `curriculum/templates/*`, `prompts/*` ABSENTS.
- **Z5 — Scripts** : n'imposent pas ≥ 60 leçons, structure des leçons, exemple guidé hors 1-30, question d'entretien + cas métier pour jours IA, détection de vague/trop court.

### Architecture (rappel pour la suite)
Les jours sont **générés** depuis `scripts/data/*.mjs` par `scripts/generate-curriculum.mjs`.
- Jours 1-15 / 16-30 : `days-01-15.mjs`, `days-16-30.mjs` (riches) + `days-01-30-guided.mjs` (exemples guidés).
- Jours 31-90 : `days-31-90.mjs` + `days-31-90-extras.mjs` (théorie/critères).
- Jours 91-365 : `days-plan.mjs` (WEEK_PLANS, 1 entrée/semaine × 6 jours) + `lessons-map.mjs`.
- **Levier clé** : enrichir les leçons + faire injecter par le générateur (exemple guidé, cas métier, question d'entretien) depuis des données par jour ou par compétence améliore massivement 91-365 sans réécrire 275 fichiers à la main.

---

## Plan des batchs

### Batch 1 — Bibliothèque de leçons (→ ≥ 60 leçons)
Enrichir la structure des leçons (nouveau gabarit) et en ajouter ~40 réparties par catégorie
(fondations, JS/TS, algo/DS, web/API/backend, data/SQL, SE/archi, Python/ML/DL,
LLM/RAG/agents/éval/sécurité, DevOps/cloud/prod, portfolio/carrière).
Gabarit : objectif · modèle mental · explication · exemple simple · exemple guidé ·
exemple appliqué IA/data/archi · erreurs fréquentes · anti-patterns · mini-exercice ·
exercice difficile · correction · questions d'entretien · à retenir · vocabulaire ·
checklist « quand je suis prêt » · liens programme.

### Batch 2 — Qualité jours 1-90
Exemples guidés pour 31-90 ; théorie approfondie ; corrections plus explicatives ;
liens vers les bonnes leçons ; vraies questions d'entretien.

### Batch 3 — Qualité jours 91-180 (Python, data, SQL avancé, pipelines, stats, ML)
Théorie inline substantielle + exemple guidé + correction exploitable + cas métier + question d'entretien.

### Batch 4 — Qualité jours 181-270 (LLM, embeddings, RAG, vector DB, chunking, retrieval, reranking, agents, tool calling, éval, sécurité IA)
Bloc le plus critique (cœur « bankable IA ») : profondeur maximale + cas métier + questions d'entretien.

### Batch 5 — Qualité jours 271-365 (projet final, prod, tests, monitoring, coûts, sécurité, portfolio, carrière)
Transformer les compétences en preuves employables.

### Batch 6 — Scripts d'audit
`curriculum:check` et `curriculum:depth-check` : imposer ≥ 60 leçons, structure des leçons,
cours substantiel, exemple guidé, correction, livrable, critères, lien futur, cas métier +
question d'entretien pour jours IA, alerte vague/court.

### Batch 7 — Documentation maintenable
`AUTHORING_GUIDE.md`, `templates/day|lesson|solution|project-template.md`,
`prompts/enrich-day|create-lesson|audit-curriculum|deepen-theory|improve-solution|map-lessons-to-days.md`.

---

## Règle de sécurité (chaque batch)
`npm run generate` (si besoin) → `curriculum:check` → `curriculum:depth-check` → `npm test` → `npm run build` → corriger → commit + push.

## ✅ CHANTIER C TERMINÉ — « Questions de réflexion » du palier 91-365 rendues spécifiques → **235/235 jours, 705 questions**

- Suite au diagnostic `DIAGNOSTIC_Y2_Y3.md` : **Y3 → OPTION A** (faux positif, aucune correction touchée) ; **Y2 → OPTION B1** ciblée : remplacer les 3 « Questions de réflexion » **génériques et identiques** des 235 journées d'apprentissage 91-365 par 3 questions **spécifiques au jour** (compréhension · diagnostic/arbitrage · transfert/recul).
- **Résultat : 235/235 jours couverts, 705 questions spécifiques (3/jour), 0 réflexion générique restante** (conformité structurelle automatisée). **Audit manuel stratifié** : 16/16 jours classés A (0 B, 0 C dans l'échantillon) ; pas de relecture humaine des 235 jours.
- **Mécanisme isolé** : champ `reflection` par jour dans **12 fichiers** `scripts/data/days-enrich-reflection-*.mjs`, fusion **par jour** (`REFLECTION_SOURCES` + merge-by-day) dans `scripts/generate-curriculum.mjs`. **Seul** le rendu des « Questions de réflexion » change ; corrections, théorie, guidés, exercices, études de cas, entretien, revues, leçons, projets, glossaire et interface **intacts** (`git diff` sur `curriculum/solutions/` = vide).
- **Similarité globale** (anti-générique) : réflexion↔réflexion max **0,120** ; ↔313 questions d'entretien **0,094** ; ↔exercice même jour **0,132** ; ↔étude de cas même jour **0,088**. **18 réécritures** ciblées sur signaux de similarité.
- **Sous-batchs** : pilote (22 j) `86a2948` → SB1-SB11. Derniers : SB10 (323-342) `6072d3a`, SB11 (344-363) `2901cb5`. Journal détaillé : `DEPLOIEMENT_Y2_REFLECTIONS.md`.
- Checks (chaque sous-batch + final) : `curriculum:check` **365/365** ✅ · `depth-check` ✅ · **43/43** tests · build ✅ · scan glyphes propre.

## ✅ BATCH 1 TERMINÉ — 60/60 leçons

- **60 leçons de fond** dans `curriculum/lessons/` (39 au gabarit complet neuf, 21 au gabarit d'origine — toutes structurées, avec exercices et vocabulaire).
- **Métadonnées par leçon** (catégorie, niveau 1-3, durée en minutes, compétences) dans `LESSONS` de `lessons-map.mjs`, exportées dans `program.json`, affichées sur **/lessons** (ordre recommandé, badges niveau/durée/compétences, 8 catégories).
- **Audits durcis** : `curriculum:check` et `curriculum:depth-check` ÉCHOUENT désormais sous 60 leçons (exigence, plus un warning).
- Mappings compétence→leçons complets (chaque compétence pointe vers ses leçons de référence, y compris avancées).

### Leçons ajoutées cette session (sous-batchs 4-7)
- Production/LLMOps : observability-logging, monitoring-production, deployment-secrets, error-handling, llm-observability, llm-cost-optimization.
- IA avancée & carrière : prompt-injection-defense, rag-evaluation, agent-workflows-orchestration, readme-documentation, portfolio-github, interview-preparation.
- Fondations & web : recursion, async-javascript, react-fundamentals, react-hooks-effects, express-backend, authentication.
- ML/DL & data : neural-networks, transformers, scikit-learn-workflow, database-modeling, caching-performance, git-advanced.

### Retrofit optionnel (non bloquant)
Les 21 leçons d'origine n'ont pas les sections « Modèle mental / Exemple guidé / Questions d'entretien / Checklist » du nouveau gabarit (39/60 les ont). Les upgrader ferait 60/60 au gabarit complet. Prompt : `prompts/create-lesson.md` en mode réécriture.

## ✅ BATCH 4A TERMINÉ — jours 181-210 (cœur IA : ML final, DL, LLM)

- **25 jours d'apprentissage enrichis en profondeur** (181, 183-188, 190-195, 197-202, 204-209 ; les jours 182/189/196/203/210 sont des revues générées).
- Chaque jour a désormais : **cours théorique substantiel avec modèle mental**, **exemple guidé** (code commenté + variante), **cas métier concret**, **question d'entretien réaliste avec réponse attendue**, **section bankable** (`future`), et une **correction exigeante** (logique, pièges, vérifications, + nouvelle section « 🎤 À savoir expliquer à l'oral »).
- **Fichiers de données** : `scripts/data/days-enrich-181-196.mjs` (ENRICH_W26_28), `days-enrich-197-210.mjs` (ENRICH_W29_30), agrégés par `days-enrich-181-210.mjs` (ENRICH_181_210) et fusionnés dans le générateur avec `days-enrich.mjs`.
- **Générateur étendu** : les jours planifiés acceptent désormais `future` et `solution` par jour ; les corrections savent rendre une section `oral`.
- Thèmes couverts : reproductibilité ML, neurone/gradient/autograd/MLP/MNIST/régularisation, tokenisation, embeddings, attention, transformer, fonctionnement LLM, API, température, tokens/coûts, hallucinations/grounding, banc d'essai/évaluation, prompts-spécifications, structured outputs, few-shot, function calling/tool use, intégration app, consolidation « LLM = composant d'ingénierie ».

## ✅ BATCH 4B TERMINÉ — jours 211-240 (LLM prod, RAG v1, DocQA, Chroma)

- **26 jours d'apprentissage enrichis en profondeur** (211-216, 218-223, 225-230, 232-237, 239-240 ; les jours 217/224/231/238 sont des revues générées). Même gabarit complet que le Batch 4A.
- Thèmes couverts : prompts versionnés en production, guardrails entrée/sortie, function calling avancé (matrice de robustesse), composant appel-LLM robuste, pourquoi le RAG, chunking (fixe + structurel), embeddings/ingestion idempotente, similarité cosinus maison, génération avec citations et refus honnête, pipeline modulaire, ingestion PDF/Markdown, ré-ingestion sans doublons, DocQA v0 + diagnostic retrieval/génération, 6 décisions de conception avec critères d'échec, dimensionnement d'index, filtrage par métadonnées, ADR stockage vecteurs, cadrage projet évalué, interface de confiance, multi-tours avec réécriture de requête, optimisation mesurée du prompt, cas limites (hors corpus / ambiguë / multi-docs / prémisse fausse), bilan + golden set, migration Chroma validée par double-run, chunking par structure.
- **Fichier de données** : `scripts/data/days-enrich-211-240.mjs` (ENRICH_211_240), fusionné dans le générateur (remplace l'ancien exemplaire du jour 211).

## ✅ BATCH 4C TERMINÉ — jours 241-270 (retrieval avancé, évaluation, sécurité, Projet 6) → CŒUR IA 181-270 COMPLET

- **27 jours d'apprentissage enrichis** (241-244, 246-251, 253-258, 260-265, 267-270) + **4 revues enrichies** (245, 252, 259, 266).
- Thèmes : comparaison mesurée du chunking, chunking structurel, versioning index & réindexation, comparaison d'embeddings, BM25/FTS5, hybride + RRF, filtrage métadonnées, reranking cross-encoder, ablation du pipeline, budget coûts/latence ; golden sets, rappel@k/MRR, LLM-as-judge + limites, fidélité/pertinence/exactitude, harnais d'éval, validation du juge (kappa) ; prompt injection directe/indirecte, défense en profondeur, citations vérifiables, refus comme feature, suite adverse ; Projet 6 (baseline chiffrée, améliorations pilotées, intégration qualité/sécurité).
- **Fichier** : `scripts/data/days-enrich-241-270.mjs` (ENRICH_241_270). Le générateur rend désormais les sections enrichies des revues (synthèse, grille, remédiation, entretien).
- **Audit Fable des jours 251-260** : au standard 241-250 (profondeur ≥, gabarit complet, corrections avec oral) — **aucune correction nécessaire**.
- **Périmètre** : les thèmes agents/tool-calling/orchestration sont au **mois 10 (jours 274-289)**, hors 241-270 — non touchés (zone 271-365).
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés **104/313**) · 20/20 tests · build ✅.

## ✅ BATCH 5A TERMINÉ — jours 271-300 (agents, workflows, architecture, sécurité) → MOIS 10 COMPLET

- **26 jours d'apprentissage enrichis** (271-272, 274-279, 281-286, 288-293, 295-300) + **4 revues enrichies** (273, 280, 287, 294).
- Thèmes (titres réels du plan) : Projet 6 finalisé (rapport/README/ADR/démo) ; agents (boucle, modes d'échec, cas d'usage, mémoire, agent vs workflow, doctrine) ; workflows (explicites, 4 patterns, orchestration, cache, coûts, doctrine) ; architecture (clean, hexagonale, event-driven, monolithe vs microservices, patterns, design système) ; sécurité IA (OWASP LLM, données, observabilité, secrets, threat model, consolidation).
- **Fichier** : `scripts/data/days-enrich-271-300.mjs` (ENRICH_271_300). Gabarit complet + exemple simple + mini-quiz embarqués dans le champ `guided` (aucun changement d'architecture du générateur).
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés **130/313**) · 20/20 tests · build ✅.

## ✅ CHANTIER M2 TERMINÉ — audit manuel du mois 7 (183-210) + remédiation technique ciblée

- Réponse à l'anomalie « mois LLM le plus léger » : **audit manuel journée par journée** des 24 journées d'apprentissage (diagnostic complet dans **`DIAGNOSTIC_M2.md`**), remédiation **minimale**, pas de réécriture.
- **Diagnostic** : **22 journées SOLIDES** (dont toute la tranche LLM 197-209), **2 à consolider** (183/184), **0 insuffisante**, **0 anomalie** automatique dans 183-210. La légèreté des corrections DL est relative (guidés excellents, code-centrés), pas une insuffisance.
- **Vérité technique tranchée** : `pred - y` (183/184) = gradient **BCE+sigmoïde** exact (vérifié : 0,055025 vs 0,0218 pour la MSE), **pas** la MSE affichée. Le code est juste → **clarification d'étiquette**, aucun changement de code.
- **Remédiation (validée « minimal + théorie DL », zéro remplissage)** : 183 (clarif. loss/gradient), 184 (théorie backpropagation approfondie + clarif. loss), 187 (théorie : anatomie d'un pas d'entraînement + batching/shuffle). **SEULS 183/184/187 touchés** ; format 91-365 respecté (pas de `simple`/`improved`).
- **Constats invalidés** : objectifs courts (style global), théorie « trop brève » (dense), ajout `simple`/`improved` (n'existe que sur 1-90). Commit : `85e44cf`.
- Checks : `curriculum:check` **365/365** ✅ · `depth-check` ✅ · **43/43** tests · build ✅ · scan glyphes propre.

## ✅ CHANTIER B TERMINÉ — questions d'entretien génériques des jours 1-30 remplacées → **313/313 distinctes**

- Suite à l'audit (problème M1), les **3 groupes** de questions d'entretien génériques par compétence (git commit ; valeur-vs-référence ; complexité), réutilisés sur **25 jours** de 1-30, ont été remplacés par des questions **distinctes et spécifiques au contenu exact** de chaque jour.
- **25 jours corrigés** : 1,2,3,4,5,6,8,9,10 (B1) ; 11,12,13,15,16,17,18,19,20 (B2) ; 22,23,24,25,26,27,29 (B3). Non touchés : jour 30 (déjà distinct), revues 7/14/21/28.
- Chaque question : mise en situation, ce qu'elle évalue, réponse attendue, niveaux débutant/correct/excellent, relance, à éviter, formulation orale. Teste le raisonnement/diagnostic/arbitrage, jamais une définition récitée. Aucun concept postérieur au jour.
- **Recalcul : 291 → 313/313 textes d'entretien distincts** ; groupes de duplication 1-30 : **3 → 0**. Aucune collision avec 31-365 (similarité max n-grammes tech-normalisés 0,037 ; entre les 25 nouvelles 0,024).
- **Fichier** : `scripts/data/days-enrich-interviews-1-30.mjs` (champ `interview` seulement) + câblage minimal. SEUL le bloc « Question d'entretien » change par jour. Sous-batchs : B1 `930a37a`, B2 `2ebb3f5`, B3 `c7ffd8c`.
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ · 43/43 tests · build ✅.

## ✅ CHANTIER A TERMINÉ — 13 revues incomplètes enrichies → **52/52 revues au standard complet**

- Suite à l'audit pédagogique global (`AUDIT_PEDAGOGIQUE_365.md`, problème Y1), les **13 revues** restées à la structure de base ont reçu la couche d'évaluation enrichie : **7, 14, 21, 28** (mois 1) ; **182, 189, 196, 203** (ML/DL/NLP/LLM) ; **210, 217, 224, 231, 238** (LLM appliqué/RAG).
- Chaque revue (contenu de base **conservé**) : synthèse structurée, test théorique spécifique, exercice pratique/conception, **grille /100 mesurable + seuils acquis/fragile/insuffisant**, diagnostic erreur→compétence, remédiation conditionnelle + rattrapage + décision + livrables, 3-5 questions d'entretien distinctes. **Ancrage sur les jours réels** (pas le thème générique).
- **Recalcul : 39 → 52/52 revues enrichies.** Anomalies `revue` de l'audit : 13 → 0. Unicité vérifiée (0 doublon exact des 4 sections sur les 52 revues).
- **Fichier** : `scripts/data/days-enrich-reviews.mjs` (ENRICH_REVIEWS) + câblage minimal du générateur. Aucun jour d'apprentissage, leçon, projet ni autre revue modifié. Sous-batchs : A1 `b841946`, A2 `802a91e`, A3 `896306a`.
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ · 43/43 tests · build ✅.

## ✅ BATCH 5H TERMINÉ — jours 61-90 (Projet 2 LivreAPI, sécurité, culture d'ingénieur, architecture, Python, full-stack React) → **313/313 exemples guidés**

- **26 jours d'apprentissage enrichis** + **4 revues enrichies** (63, 70, 77, 84). Sous-batchs : 5H1 (61-70), 5H2 (71-80), 5H3 (81-90).
- **Objectif structurel atteint : 313/313 exemples guidés.** La tranche 61-90 était la dernière sans enrichissement ; tous les jours de travail de 1 à 365 ont désormais exemple guidé, question d'entretien réelle, cas métier, section bankable et correction exigeante.
- **Tranche fidèle au programme réel** (fin du trimestre 1) : titres, objectifs, exercices et livrables réels respectés ; enrichissement en complément de `days-31-90-extras.mjs` (rendu en `theoryExtra`).
- Thèmes (titres réels) : **Projet 2 LivreAPI** (socle CRUD SQLite, relations/emprunt transactionnel 409, recherche/pagination/OFFSET, tests d'intégration, doc/ADR/démo, durcissement + test de charge, storytelling STAR) ; **sécurité** (OWASP, auth token/secrets) ; **refactoring sous tests** ; **culture d'ingénieur** (réseau DNS/TCP/TLS/HTTP2, Linux/scripts, Git rebase, doc technique, lecture de code, modularité) ; **architecture** (3-tiers/MVC, observabilité, cache/N+1, trade-offs/anti-patterns) ; **Python** d'introduction ; **full-stack React** (UI=f(state), fetch/états async, mini-app de bout en bout) ; **bilans** (mois 3, trimestre 1).
- **Même gabarit complet** que 91-365 : modèle mental distinct, exemple guidé exécutable, mini-quiz (4 Q), cas métier distinct, question d'entretien + relance, section bankable, correction exigeante (logique + simple + améliorée, pièges, vérifications, oral), leçons de fond ciblées.
- **Fichier** : nouveau `scripts/data/days-enrich-61-90.mjs` (ENRICH_61_90), fusionné dans `generate-curriculum.mjs`. Le câblage de la branche 31-90 (enrich.future/solution/quiz) existait déjà (Batch 5G).
- **Audit anti-générique** : 26 modèles mentaux distincts, **0 question d'entretien dupliquée**, **0 cas métier dupliqué** (vérifié programmatiquement) ; jours proches différenciés (66/74 doc, 76/78 archi, 83/90 bilans, 88/89 full-stack).
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés **313/313**) · 43/43 tests · build ✅.
- **Périmètre** : jours 1-60 et 91-365 inchangés ; interface, glossaire, leçons, architecture inchangés. **Plus aucun jour de travail sans enrichissement.**

## ✅ BATCH 5G TERMINÉ — jours 31-60 (structures de données, TypeScript/POO, Projet 1 TaskFlow, HTTP/REST/Express, SQL, Projet 2)

- **26 jours d'apprentissage enrichis** + **4 revues enrichies** (35, 42, 49, 56). Sous-batchs : 5G1 (31-40), 5G2 (41-50), 5G3 (51-60).
- **Tranche fidèle au programme réel** (mois 2-3) : titres, objectifs, exercices et livrables réels des jours 31-60 respectés ; l'enrichissement complète la théorie existante (`days-31-90-extras.mjs`) sans l'écraser (rendu en `theoryExtra`).
- Thèmes (titres réels) : réflexe hash map/twoSum, backtracking, stacks/queues, listes chaînées/BST ; TypeScript (typage-contrat), types avancés, POO/polymorphisme, design patterns, clean code, débogage méthodique ; FP typée, **Projet 1 TaskFlow** (interface Store/inversion de dépendance, JsonStore robuste + ids max+1, CRUD immuable + filtres, tests/README/ADR), consolidation/entretien blanc ; HTTP sans état, REST design, Node natif→Express, middlewares + 3 couches, validation + erreurs centralisées ; SQL (JOIN/GROUP BY/WHERE vs HAVING), SQLite branché anti-injection, modélisation/normalisation/index/transactions, Postman avancé, **cadrage Projet 2 LivreAPI**.
- **Même gabarit complet** que 91-365 : cours + modèle mental distinct, exemple guidé exécutable avec exemple simple + raisonnement pas-à-pas, **mini-quiz** (4 questions, réponses en correction), cas métier distinct, question d'entretien avec réponse attendue + relance, section bankable, correction exigeante (logique + solution simple + améliorée, pièges, vérifications, oral), leçons de fond ciblées (data-structures-intro, algorithmic-thinking, recursion, typescript-basics, design-patterns-intro, clean-code, testing-foundations, architecture-basics, error-handling, http-rest-json, api-design-basics, express-backend, sql-foundations, database-modeling, readme-documentation, interview-preparation).
- **Fichier** : `scripts/data/days-enrich-31-60.mjs` (ENRICH_31_60), fusionné dans `generate-curriculum.mjs`. La branche 31-90 consomme désormais `enrich.future`, `enrich.solution` et `enrich.quiz` (sans effet sur 61-90, enrichissement vide).
- **Audit anti-générique** : 26 modèles mentaux tous distincts, **0 question d'entretien dupliquée**, **0 cas métier dupliqué** (vérifié programmatiquement) ; exemples guidés réellement liés au titre.
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés **287/313**, vs 261 avant) · 43/43 tests · build ✅.
- **Périmètre** : jours 1-30 et 61-365 inchangés ; interface, glossaire, leçons, architecture inchangés. **Premier jour restant : jour 61** (début du Projet 2 LivreAPI, tranche 61-90 non enrichie).

## ✅ BATCH 5F TERMINÉ — jours 151-180 (machine learning classique + Projet 5 ChurnScope)

- **26 jours d'apprentissage enrichis** + **4 revues enrichies** (154, 161, 168, 175). Sous-batchs : 5F1 (151-160), 5F2 (161-170), 5F3 (171-180).
- **Tranche authentiquement ML** (mois 6-7) : titres réels respectés.
- Thèmes (titres réels du plan) : stats/proba pour le ML (Bayes/taux de base, biais d'échantillonnage, étude honnête) ; workflow scikit-learn ; régression linéaire/logistique, train/test + baseline + **data leakage** ; métriques de régression et de classification ; arbres, random forests ; cross-validation, overfitting/régularisation, analyse d'erreurs ; feature engineering, encodage/préprocessing, pipelines, clustering k-means, interprétabilité ; cadrage + **Projet 5 ChurnScope** (EDA/baseline, modèles, features, optimisation, rapport orienté décision).
- **Même gabarit complet** que 181-365 : cours + modèle mental distinct, exemple guidé exécutable (scikit-learn) avec exemple simple + mini-quiz, cas métier distinct, question d'entretien avec réponse attendue, section bankable, correction exigeante (solution simple + améliorée, pièges, vérifications, oral), leçons de fond ciblées (statistics-for-ml, machine-learning-basics, scikit-learn-workflow, model-evaluation, feature-engineering, data-cleaning-quality).
- **Concepts ML depuis les fondations** : Bayes/base rate, biais de données, moindres carrés/coefficients, leakage démontré, MAE/RMSE/R², sigmoïde/seuil/matrice de confusion, précision/rappel/F1/AUC selon le coût métier, impureté/profondeur, bagging/vote, k-fold moyenne±variabilité, biais-variance/régularisation, feature engineering mesuré + anti-leakage temporel, one-hot vs label, Pipeline anti-leakage, k-means (normaliser/choisir k/interpréter), permutation importance.
- **Fichier** : `scripts/data/days-enrich-151-180.mjs` (ENRICH_151_180), fusionné dans `generate-curriculum.mjs`.
- **Audit anti-générique** : 26 modèles mentaux vérifiés tous distincts, aucune question d'entretien dupliquée, cas métier propres à chaque sujet ; tous les jours ≥ 1202 mots.
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés **261/313**) · 43/43 tests · build ✅.

## ✅ CHANTIER GLOSSAIRE IT TERMINÉ — page `/glossary` (indépendant du curriculum)

- **254 entrées** (132 acronymes, 122 termes non acronymiques, 18 ambigus), 17 catégories couvertes, **0 référence non résolue**, 784 relations, 381 alias.
- Source éditable : `curriculum/glossary/glossary.json` (format documenté dans `curriculum/glossary/README.md`).
- Logique partagée : `lib/glossary-core.mjs` (+ `.d.ts`) ; loader `lib/glossary.ts` ; page `app/glossary/*` ; validateur `scripts/glossary-check.mjs` (`npm run glossary:check` / `:validate`) ; tests `tests/glossary.test.mjs`.
- Recherche insensible casse/accents et **par jeton** (pas de faux positifs type « PR » dans « entreprise »). Filtres catégorie/niveau, A–Z, vues compacte/détaillée, termes liés cliquables, URL, focus clavier, mobile.
- Acronymes ambigus documentés (sens multiples) : PR, PM, PO, SME, MVP, POC, TSD, CD, CI, ADR, QA, UAT, NLP, EDA, IP, token…
- **Aucune modification** du curriculum (jours, leçons, corrections, générateur).
- Checks : `glossary:check` ✅ · 43/43 tests · build ✅ · `curriculum:check` ✅ · `curriculum:depth-check` ✅.

## ✅ BATCH 5E TERMINÉ — jours 121-150 (Python cœur, pandas, SQL avancé + ETL, Projet 4 DataPulse, entrée statistiques)

- **26 jours d'apprentissage enrichis** + **4 revues enrichies** (126, 133, 140, 147). Sous-batchs : 5E1 (121-130), 5E2 (131-140), 5E3 (141-150).
- **Tranche authentiquement Python/data** (contrairement à 91-120) : les titres réels correspondent bien au thème data.
- Thèmes (titres réels du plan) : Python cœur (fonctions/modules/fichiers, exceptions, POO pythonique, pytest, venv/outils) ; pandas (charger/inspecter, nettoyer, filtrer/trier, grouper, merge, data quality en fonctions pures) ; SQL avancé (normalisation 3NF, index, transactions ACID, requêtes analytiques) ; ETL (concevoir, robustesse/idempotence) ; Projet 4 DataPulse (cadrage par questions, extract, transform, load, dashboard, README/ADR/démo) ; statistiques (tendance/dispersion, distributions/visu, corrélation/causalité).
- **Même gabarit complet** que 181-365 : cours + modèle mental distinct, exemple guidé (exemple simple + mini-quiz), cas métier distinct, question d'entretien avec réponse attendue, section bankable, correction exigeante (solution simple + améliorée, pièges, vérifications, section orale), leçons de fond ciblées (python-foundations, error-handling, clean-code, testing-foundations, pandas-data-wrangling, data-cleaning-quality, database-modeling, sql-foundations, etl-pipelines, statistics-for-ml, architecture-basics, readme-documentation).
- **Concepts data expliqués depuis zéro** : EAFP vs LBYL, dataclass/composition, fixtures pytest, vectorisation/split-apply-combine, masque booléen et \`SettingWithCopyWarning\`, cardinalité des jointures, 3NF et anomalies, index B-tree/EXPLAIN, ACID/rollback, fonctions fenêtre vs GROUP BY, séparation extract/transform/load, idempotence, quand la moyenne ment, quartet d'Anscombe, corrélation ≠ causalité. Comparaisons JS/SQL/pandas là où elles aident.
- **Fichier** : \`scripts/data/days-enrich-121-150.mjs\` (ENRICH_121_150), fusionné dans \`generate-curriculum.mjs\`.
- **Audit anti-générique** : 26 modèles mentaux vérifiés tous distincts, aucune question d'entretien dupliquée, cas métier propres à chaque sujet ; tous les jours ≥ 1107 mots (niveau des meilleurs 181-365).
- Checks : \`curriculum:check\` ✅ · \`curriculum:depth-check\` ✅ (exemples guidés **235/313**) · 20/20 tests · build ✅.

## ✅ BATCH 5D TERMINÉ — jours 91-120 (React, ingénierie logicielle front, Projet 3 BiblioApp, entrée Python)

- **25 jours d'apprentissage enrichis** + **5 revues enrichies** (91, 98, 105, 112, 119). Sous-batchs : 5D1 (91-100), 5D2 (101-110), 5D3 (111-120).
- **Note de cadrage** : la consigne évoquait « début du parcours Python/data », mais les titres RÉELS des jours 91-120 (`days-plan.mjs`) sont React (92-97, 99-104), ingénierie logicielle front / tests (106-111), Projet 3 BiblioApp (113-118) et **un seul** jour Python (120). Conformément à la règle « respecter les titres réels, ne forcer aucun sujet », les vrais intitulés ont été enrichis. Les différences JS→Python (comprehensions vs boucles-push, dict/.get, enumerate/zip, snake_case, venv) sont explicitées au jour 120 où elles s'appliquent réellement.
- Thèmes (titres réels du plan) : React (composants/props/JSX, useState immuable, listes/keys, useEffect/3 états, formulaires contrôlés, couche api.ts, routing, lever l'état, Context, performance/re-renders, accessibilité, cadrage Projet 3) ; ingénierie front (tests Vitest, tests de composants, mocks/intégration, clean code front, hooks personnalisés, gestion d'erreur robuste) ; Projet 3 BiblioApp (socle, CRUD, recherche/filtres, tests, polish, README/schéma-3-tiers/ADR/démo) ; Python idiomatique.
- **Même gabarit complet** que 181-365 : cours + modèle mental distinct, exemple guidé (exemple simple + mini-quiz), cas métier distinct, question d'entretien avec réponse attendue, section bankable, correction exigeante (solution simple + améliorée, pièges, vérifications, section orale), leçons de fond React/testing/Python ciblées.
- **Fichier** : `scripts/data/days-enrich-91-120.mjs` (ENRICH_91_120), fusionné dans `generate-curriculum.mjs`.
- **Audit anti-générique** : 25 modèles mentaux vérifiés tous distincts, aucune question d'entretien dupliquée, cas métier propres à chaque sujet.
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés **209/313**) · 20/20 tests · build ✅.

## ✅ BATCH 5B/5C TERMINÉ — jours 301-365 (projet final DocSense, DevOps, portfolio, carrière) → JOURS 181-365 ENRICHIS AU STANDARD COMPLET

- **55 jours d'apprentissage enrichis** + **10 revues enrichies** (301, 308, 315, 322, 329, 336, 343, 350, 357, 364). Sous-batchs : 5B1 (301-315), 5B2 (316-330), 5C1 (331-347), 5C2 (348-365).
- Thèmes (titres réels du plan) : construction de DocSense (cadrage, RAG build, évaluation, fonctionnalités, polish v1.0), portfolio (README, démo, storytelling, GitHub, schéma, cohérence), carrière (CV, LinkedIn, ciblage, pitch, analyse d'offres, dossier, révision algo, questions IA, simulations, dossier d'entretien, négociation, candidatures, entretiens blancs, bilan, PLAN-90-JOURS, clôture).
- **Fichier** : `scripts/data/days-enrich-301-365.mjs` (ENRICH_301_365). Le générateur a reçu le support d'enrichissement du jour 365 (cas spécial de clôture).
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés **185/313**) · 20/20 tests · build ✅.

## ✅ OBJECTIF ATTEINT : JOURS 181-365 ENRICHIS AU STANDARD COMPLET
Les 185 jours de travail des jours 181 à 365 (cœur IA, agents/archi/sécurité, projet final DocSense, portfolio, carrière) + 24 revues enrichies sont au gabarit complet. Chaque jour est vraiment exploitable pour apprendre (théorie substantielle, modèle mental, exemple guidé + mini-quiz, cas métier, question d'entretien, correction exigeante avec section orale, section bankable).

## PROCHAINES PISTES OPTIONNELLES (non prioritaires)
- **Batch 2/3** : enrichir les jours 31-180 (exemples guidés, théorie inline) via le même mécanisme — voir ci-dessous.
- **Retrofit leçons** : passer les 21 leçons d'origine au gabarit complet neuf (39/60 → 60/60).
Référence de mécanisme : créer `scripts/data/days-enrich-XXX.mjs` sur le modèle exact de
`days-enrich-211-240.mjs` (champs `theory`, `guided`, `caseStudy`, `interview`, `future`,
`solution {logic, pitfalls, checks, oral}`) et le fusionner dans `generate-curriculum.mjs`.
Les jours 241-248 (comparaison chunking, versioning index, embeddings, hybride BM25/RRF,
reranking, ablation, latence) prolongent directement les fils posés aux jours 226-240.
Ensuite : Batch 2 (31-90), Batch 3 (91-180), Batch 5 (271-365).

## Journal d'avancement
- **Batch 0** : ✅ FAIT — audit + ce fichier.
- **Batch 7 (anticipé)** : ✅ FAIT — `AUTHORING_GUIDE.md`, `templates/*`, `prompts/*`.
- **Mécanisme d'enrichissement** : ✅ FAIT — `INTERVIEW_BY_SKILL` + `CASE_BY_SKILL` (chaque jour a une vraie question d'entretien ; jours data/IA ont un cas métier), `days-enrich.mjs` (override par jour), blocs générés « Cas métier » et « Question d'entretien ».
- **Batch 1** : ✅ TERMINÉ — **60/60 leçons** (voir section « BATCH 1 TERMINÉ » ci-dessus).
- **Batch 6** : ✅ FAIT — scripts d'audit renforcés (compte de leçons + cible 60, structure des leçons, question d'entretien + cas métier obligatoires pour jours data/IA, alerte vague/court, kit d'auteur requis).
- **Batch 4A** : ✅ TERMINÉ — jours 181-210 enrichis en profondeur (25 jours d'apprentissage ; voir section « BATCH 4A TERMINÉ » ci-dessus).
- **Batch 4B** : ✅ TERMINÉ — jours 211-240 enrichis en profondeur (26 jours d'apprentissage ; voir section « BATCH 4B TERMINÉ » ci-dessus).
- **Batch 4C** : ✅ TERMINÉ — jours 241-270 enrichis (27 jours + 4 revues) → **cœur IA 181-270 COMPLET** (voir section « BATCH 4C TERMINÉ » ci-dessus).
- **Batch 5A** : ✅ TERMINÉ — jours 271-300 enrichis (26 jours + 4 revues) → **mois 10 COMPLET** (voir section « BATCH 5A TERMINÉ » ci-dessus).
- **Batch 5B/5C** : ✅ TERMINÉ — jours 301-365 enrichis (55 jours + 10 revues) → **JOURS 181-365 AU STANDARD COMPLET** (voir section « BATCH 5B/5C TERMINÉ » ci-dessus).
- **Batch 5F** : ✅ TERMINÉ — jours 151-180 enrichis (26 jours + 4 revues).
- **Batch 5G** : ✅ TERMINÉ — jours 31-60 enrichis (26 jours + 4 revues) (voir section « BATCH 5G TERMINÉ » ci-dessus).
- **Batch 5H** : ✅ TERMINÉ — jours 61-90 enrichis (26 jours + 4 revues) → **313/313 exemples guidés ; PLUS AUCUN jour de travail sans enrichissement** (voir section « BATCH 5H TERMINÉ » ci-dessus).

### État qualité actuel (mesuré)
- 313/313 jours de travail : Cours approfondi, Question d'entretien, Pourquoi, correction. Exemple guidé : **313/313 ✅** (COMPLET — tous les jours 1-365). Plus aucun jour de travail sans exemple guidé.
- **Tous les jours 31-365** (et 1-30 depuis l'origine) au niveau « cours complet », corrections avec section orale. Jours 31-90 enrichis aux Batchs 5G (31-60) et 5H (61-90). **Les 52/52 revues hebdomadaires sont enrichies** (couche synthèse + grille de notation mesurable + plan de remédiation + questions d'entretien + décision de passage) — les 13 dernières (7/14/21/28/182/189/196/203/210/217/224/231/238) l'ont été au **Chantier A**, après l'audit qui avait recalculé 39/52 seulement.
- Leçons : **60/60** (39 au gabarit complet neuf).

## RESTE À FAIRE (pistes optionnelles, non prioritaires)

### Batch 2 (jours 31-90) — ✅ TERMINÉ
Jours 31-60 (Batch 5G) et 61-90 (Batch 5H) enrichis au standard complet. **313/313 exemples guidés atteint.**

### Batch 3 (jours 91-180) — ✅ TERMINÉ
Enrichis lors des batchs précédents (React/front/Projet 3 ; Python/pandas/SQL/ETL/Projet 4/stats ; ML/Projet 5).

### Retrofit optionnel
Les 21 leçons d'origine suivent un gabarit plus ancien (sans « Modèle mental / Exemple guidé / Questions d'entretien / Checklist »). Les faire passer au gabarit complet ferait 60/60 au gabarit neuf (39/60 aujourd'hui). Non bloquant.

## Où j'en suis (dernier point stable)
Batchs 4A (181-210), 4B (211-240), 4C (241-270) → **cœur IA COMPLET** ; 5A (271-300) → **mois 10 COMPLET** ; 5B/5C (301-365) → **JOURS 181-365 AU STANDARD COMPLET**. Tout commité et poussé. `curriculum:check` OK, `curriculum:depth-check` OK (185/313 exemples guidés), 20/20 tests, build OK. Objectif atteint : les 185 jours de travail de 181 à 365 + 24 revues sont enrichis au gabarit complet. Pistes optionnelles restantes : Batch 2 (31-90), Batch 3 (91-180), retrofit des 21 leçons d'origine.
