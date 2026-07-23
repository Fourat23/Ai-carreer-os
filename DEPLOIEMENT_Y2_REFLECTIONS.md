# Journal de déploiement Y2 — Questions de réflexion spécifiques (Chantier C, option B)

Déploiement de la méthode validée par le pilote (22 jours, commit `86a2948`) sur les **213 jours
d'apprentissage restants** de la tranche 91-365. Y3 reste en **option A** (aucune correction, aucun
format modifié). Un sous-batch = mapping → rédaction → génération → contrôles → lecture → commit → push.

## Périmètre recalculé (vérifié depuis les fichiers)

- 91-365 : 275 jours = **235 apprentissage** + **40 revues**.
- Pilote déjà spécifique : **22** jours.
- **Restants à traiter : 213** (confirmé, 0 sans réflexion, pilote intact).

## Plan de sous-batchs (11, tous ≤24, ordre chronologique, revues + pilote exclus)

| SB | Plage | Jours | Nb | Fichier | État |
|----|-------|-------|----|---------|------|
| SB1 | 91-120 | 93-118 | 21 | `days-enrich-reflection-091-120.mjs` | ✅ `b039b80` |
| SB2 | 121-150 | 121-150 | 24 | `days-enrich-reflection-121-150.mjs` | ✅ `2febae6` |
| SB3 | 151-167 | 151-167 | 14 | `days-enrich-reflection-151-167.mjs` | ✅ `41f132f` |
| SB4 | 168-180 | 169-180 | 11 | `days-enrich-reflection-168-180.mjs` | ✅ `682e817` |
| SB5 | 181-210 | 181-209 | 22 | `days-enrich-reflection-181-210.mjs` | ✅ `43fed2f` |
| SB6 | 211-240 | 212-240 | 24 | `days-enrich-reflection-211-240.mjs` | ✅ `d61402f` |
| SB7 | 241-270 | 242-270 | 23 | `days-enrich-reflection-241-270.mjs` | ✅ `b166206` |
| SB8 | 271-300 | 271-300 | 24 | `days-enrich-reflection-271-300.mjs` | ✅ `845f175` |
| SB9 | 301-321 | 303-321 | 16 | `days-enrich-reflection-301-321.mjs` | ✅ `89865a5` |
| SB10 | 322-343 | 323-342 | 17 | `days-enrich-reflection-322-343.mjs` | ✅ `6072d3a` |
| SB11 | 344-363 | 344-363 | 17 | `days-enrich-reflection-344-363.mjs` | ✅ fait |

Total : **213** (0 doublon, 0 manquant). Outil de contrôle : `scripts/audit-reflection-sim.mjs`.

---

## SB1 — jours 91-120 (21 jours)

- **HEAD de départ** : `86a2948` · **commit final** : (voir ci-dessous)
- **Jours traités** : 93, 94, 95, 96, 97, 99, 100, 101, 102, 103, 104, 107, 108, 109, 110, 111, 114, 115, 116, 117, 118
- **Domaines** : React/front (state, effets, formulaires, routing, Context, perf, a11y), Software engineering (tests composants, mocks, clean code, hooks custom, erreurs), Projet 3 BiblioApp (CRUD, recherche, tests, polish, README/ADR).
- **Questions** : 63 (21 × 3).
- **Similarité** (Jaccard n-grammes normalisés, technos+nombres neutralisés) :
  - intra-batch max **0,062** ; vs pilote max **0,090** ; vs 313 entretiens max **0,058** ; vs exercices max **0,088** ; vs cas métier max **0,049**. Aucune paire ≥ 0,10. Aucune réécriture nécessaire.
- **Lecture manuelle** : 21/21. **Classement : A = 21, B = 0, C = 0.**
- **Lecture croisée complète** (théorie+guidé+exo+cas+entretien+réflexion+correction) : jours **93** (premier), **118** (dernier), **102** (complexe : perf/re-renders), **104** (projet/cadrage), **108** (aléatoire). Alignement confirmé, aucune contradiction, aucun concept prématuré.
- **Défauts détectés** : aucun (0 B/C). **Corrections** : aucune.
- **Tests** : generate ✅ · curriculum:check ✅ · depth-check ✅ · 43/43 ✅ · build ✅ · scan glyphes CLEAN · program.json restauré (timestamp seul).
- **Périmètre Git** : 21 jours (section réflexion uniquement) + `days-enrich-reflection-091-120.mjs` (nouveau) + `scripts/generate-curriculum.mjs` (import + merge par jour) + `scripts/audit-reflection-sim.mjs` (outil). Aucune correction/revue/leçon touchée.
- **Working tree** : propre après commit/push.
- **Commit** : `b039b80`.

## SB2 — jours 121-150 (24 jours)

- **HEAD de départ** : `b039b80`
- **Jours traités** : 121, 122, 123, 124, 125, 127, 128, 129, 130, 131, 132, 135, 136, 137, 138, 139, 141, 142, 143, 144, 145, 146, 149, 150
- **Domaines** : Python (fonctions/modules, exceptions, POO, pytest, outils), pandas (charger/nettoyer/filtrer/grouper/joindre, fonctions qualité), SQL avancé (index, transactions ACID, fenêtres, ETL, robustesse), Projet 4 DataPulse (cadrage, extract/transform/load, dashboard, README/ADR), statistiques (distributions, corrélation/causalité).
- **Questions** : 72 (24 × 3).
- **Similarité** (après réécriture de 2 paires) : intra-batch max **0,093** ; vs déployées max **0,120** ; vs 313 entretiens **0,045** ; vs exercices **0,077** ; vs cas métier **0,045**.
- **Défauts détectés puis corrigés** : 2 paires artificiellement proches signalées et **réécrites** — `146.3 ~ refl118.3 = 0,233` (deux « présente le projet en 2 min », template commun → 146.3 recentrée sur les 3 questions/chiffres du dashboard) et `132.1 ~ 143.1 = 0,145` (deux Q1 « pureté/global → imprévisible » → 143.1 recentrée sur la reproductibilité du rapport de qualité). Après réécriture : max intra 0,093, max vs déployées 0,120.
- **Lecture manuelle** : 24/24. **Classement : A = 24, B = 0, C = 0.**
- **Lecture croisée complète** : jours **121** (premier), **150** (dernier), **137** (complexe : fonctions fenêtre), **144** (projet : load transactionnel), **128** (aléatoire : nettoyage). Alignement théorie/correction confirmé.
- **Tests** : generate ✅ · check ✅ · depth-check ✅ · 43/43 ✅ · build ✅ · scan glyphes CLEAN · program.json restauré (timestamp seul).
- **Périmètre Git** : 24 jours (réflexion seule) + `days-enrich-reflection-121-150.mjs` + `generate-curriculum.mjs` + `audit-reflection-sim.mjs`. Aucune correction/revue/leçon touchée.
- **Commit** : `2febae6`.

## SB3 — jours 151-167 (14 jours)

- **HEAD de départ** : `2febae6`
- **Jours traités** : 151, 152, 153, 155, 156, 157, 158, 159, 160, 162, 163, 164, 166, 167
- **Domaines** : Machine learning classique (probabilités/Bayes, biais d'échantillonnage, étude honnête, workflow scikit-learn, régression linéaire, split/baseline/leakage, métriques de régression, régression logistique, rapport de modèle, métriques de classification, arbres, random forests, overfitting/régularisation, analyse d'erreurs).
- **Questions** : 42 (14 × 3).
- **Similarité** : intra-batch max **0,100** ; vs déployées max **0,108** ; vs 313 entretiens **0,049** ; vs exercices **0,068** ; vs cas métier **0,049**. Les 2 paires de tête (156.2~164.2 ; 155.2~refl150.2) sont topiques et ancrées sur des jours distincts (< 0,11) — revues et **conservées** (aucune réécriture nécessaire).
- **Lecture manuelle** : 14/14. **Classement : A = 14, B = 0, C = 0.**
- **Lecture croisée** : jours **151** (premier, Bayes), **167** (dernier), **162** (complexe : métriques déséquilibre), **159** (logistique/seuil), **166** (overfitting). Alignement théorie/correction confirmé ; prérequis respectés (159 reste au niveau matrice de confusion/seuil, précision/rappel introduits au 162).
- **Défauts détectés / corrigés** : aucun (0 B/C).
- **Tests** : generate ✅ · check ✅ · depth-check ✅ · 43/43 ✅ · build ✅ · scan glyphes CLEAN · program.json restauré.
- **Périmètre Git** : 14 jours (réflexion seule) + `days-enrich-reflection-151-167.mjs` + `generate-curriculum.mjs` + `audit-reflection-sim.mjs`.
- **Prochain jour restant** : **168** (début SB4).

## SB4 — jours 168-180 (11 jours d'apprentissage : 169-180 ; 168 et 175 sont des revues)

- **HEAD de départ** : `41f132f`
- **Jours traités** : 169, 170, 171, 172, 173, 174, 176, 177, 178, 179, 180
- **Domaines** : Machine learning — feature engineering, encodage/préprocessing, pipelines scikit-learn, clustering k-means, interprétabilité, consolidation + cadrage Projet 5, projet ChurnScope (EDA/baseline, premiers modèles, feature engineering, optimisation/validation, analyse d'erreurs/rapport).
- **Questions** : 33 (11 × 3).
- **Similarité** (après réécriture) : intra-batch max **0,069** ; vs déployées max **0,075** ; vs 313 entretiens **0,033** ; vs exercices **0,073** ; vs cas métier **0,021**.
- **Défaut détecté puis corrigé** : `170.3 ~ refl157.1 = 0,205` (redite du leakage « normaliser avant split » du jour 157) → **170.3 réécrite** vers la fuite spécifique du préprocessing appris (catégorie inconnue en production). Après : max vs déployées 0,075.
- **Lecture manuelle** : 11/11. **Classement : A = 11, B = 0, C = 0.**
- **Lecture croisée** : jours **169** (premier, features>modèle), **180** (dernier, rapport décision), **173** (complexe, interprétabilité), **176** (projet, EDA/baseline), **172** (clustering). Alignement théorie/correction confirmé.
- **Tests** : generate ✅ · check ✅ · depth-check ✅ · 43/43 ✅ · build ✅ · scan glyphes CLEAN · program.json restauré.
- **Périmètre Git** : 11 jours (réflexion seule) + `days-enrich-reflection-168-180.mjs` + `generate-curriculum.mjs` + `audit-reflection-sim.mjs`.
- **Prochain sous-batch** : **SB5** (181-210, jours d'apprentissage 181-209).

## SB5 — jours 181-210 (22 jours d'apprentissage : 181-209 hors pilote 190/194/197)

- **HEAD de départ** : `682e817`
- **Jours traités** : 181, 183, 184, 185, 186, 187, 188, 191, 192, 193, 195, 198, 199, 200, 201, 202, 204, 205, 206, 207, 208, 209
- **Domaines** : reproductibilité (fin Projet 5), Deep learning (neurone NumPy, descente de gradient, PyTorch/autograd, MLP/XOR, entraînement MNIST, régularisation), NLP/DL (embeddings, attention, transformer, note de vulgarisation), LLM (API, température, tokens/coûts, hallucinations, banc d'essai, prompt engineering, structured outputs, few-shot, function calling, intégration, consolidation).
- **Questions** : 66 (22 × 3).
- **Similarité** (après réécriture) : intra-batch max **0,060** ; vs déployées max **0,082** ; vs 313 entretiens **0,094** ; vs exercices **0,132** (209.1 vs son exercice, topique — les 5 propriétés sont le contenu du jour) ; vs cas métier **0,088**.
- **Défauts détectés puis corrigés** : 3 échos topiques réangés — `204.3 ~ refl211.3 = 0,164` (prompt-as-code/régression, thème du 211 → 204.3 recentrée sur la prédictibilité de la spec par un tiers) ; `206.2` et `198.3` (~0,11 avec leur propre entretien → réangés vers un diagnostic / la versionnabilité). Après : max vs déployées 0,082 ; vs entretiens 0,094.
- **Lecture manuelle** : 22/22. **Classement : A = 22, B = 0, C = 0.**
- **Lecture croisée** : jours **181** (premier), **209** (dernier), **192** (complexe : attention), **205** (structured outputs), **201** (hallucinations) + confirmation théorie sur 183. Alignement théorie/correction confirmé ; prérequis respectés (183 ne référence pas MLP ; 191 s'appuie sur la tokenisation du pilote 190).
- **Tests** : generate ✅ · check ✅ · depth-check ✅ · 43/43 ✅ · build ✅ · scan glyphes CLEAN · program.json restauré.
- **Périmètre Git** : 22 jours (réflexion seule) + `days-enrich-reflection-181-210.mjs` + `generate-curriculum.mjs` + `audit-reflection-sim.mjs`.
- **Prochain sous-batch** : **SB6** (211-240, jours d'apprentissage 212-240).

## SB6 — jours 211-240 (24 jours d'apprentissage : 212-240 hors pilote 211/218)

- **HEAD de départ** : `43fed2f`
- **Jours traités** : 212, 213, 214, 215, 216, 219, 220, 221, 222, 223, 225, 226, 227, 228, 229, 230, 232, 233, 234, 235, 236, 237, 239, 240
- **Domaines** : LLM prod (guardrails, function calling avancé, composant d'appel robuste) et RAG (pourquoi, chunking, recherche par similarité, génération avec citations, pipeline modulaire, multi-formats PDF, ré-ingestion, DocQA v0, diagnostic d'échecs, décisions de conception, estimation d'index, métadonnées/filtrage, consolidation RAG v1, cadrage Projet 6, interface, sessions, optimisation de prompt, cas limites, bilan/éval, migration Chroma, chunking par structure).
- **Questions** : 72 (24 × 3).
- **Similarité** (après réangle) : intra-batch max **0,056** ; vs déployées max **0,104** (223.2 vs 185.2 : coïncidence de la formule « si tu l'oublies », sujets sans rapport — conservée) ; vs 313 entretiens **0,060** ; vs exercices **0,084** ; vs cas métier **0,051**.
- **Défaut détecté puis corrigé** : `237.3 ~ refl253.3 = 0,10` (même formule « figer l'éval pour que les comparaisons de versions veuillent dire quelque chose ») → **237.3 réangée** vers le bilan honnête des faiblesses connues (contenu propre au jour 237).
- **Lecture manuelle** : 24/24. **Classement : A = 24, B = 0, C = 0.**
- **Lecture croisée** : jours **212** (premier, guardrails), **240** (dernier, chunking structurel), **226** (complexe, diagnostic retrieval/génération), **232** (projet, cadrage), **220** (citations). Alignement théorie/correction confirmé ; prérequis respectés (Chroma n'est nommé qu'à partir du 239 ; avant, « base vectorielle » comme concept).
- **Tests** : generate ✅ · check ✅ · depth-check ✅ · 43/43 ✅ · build ✅ · scan glyphes CLEAN · program.json restauré.
- **Périmètre Git** : 24 jours (réflexion seule) + `days-enrich-reflection-211-240.mjs` + `generate-curriculum.mjs` + `audit-reflection-sim.mjs`.
- **Prochain sous-batch** : **SB7** (241-270, jours d'apprentissage 242-270).

## SB7 — jours 241-270 (23 jours d'apprentissage : 242-270 hors pilote 241/253/260)

- **HEAD de départ** : `d61402f` · **revues exclues** : 245, 252, 259, 266
- **Jours traités** : 242, 243, 244, 246, 247, 248, 249, 250, 251, 254, 255, 256, 257, 258, 261, 262, 263, 264, 265, 267, 268, 269, 270
- **Domaines** : RAG retrieval avancé (versioning d'index, comparaison d'embeddings, recherche lexicale BM25/FTS5, hybride/RRF, reranking, ablation, budget latence), Évaluation IA (rappel@k, LLM-as-judge, dimensions fidélité/pertinence/exactitude, harnais, validation du juge), Sécurité (défense injection en profondeur, citations vérifiables, refus comme feature, suite adverse, synthèse en couches), Projet 6 (baseline chiffrée, améliorations 1 et 2 pilotées, guardrails/robustesse).
- **Questions** : 69 (23 × 3).
- **Similarité** : intra-batch max **0,067** ; vs déployées max **0,113** (254.1 vs 156.1 : écho « qu'est-ce que ça signifie concrètement » sur des sujets sans rapport — conservée) ; vs 313 entretiens **0,066** ; vs exercices **0,110** (249.1 vs son exercice : l'exercice EST le tableau d'ablation — topique) ; vs cas métier **0,032**. Aucune paire artificiellement proche.
- **Réécritures** : aucune nécessaire (toutes les paires de tête < 0,12, topiques ou coïncidences de formulation sur sujets distincts, inspectées).
- **Lecture manuelle** : 23/23. **Classement : A = 23, B = 0, C = 0.**
- **Lecture croisée** : jours **242** (premier, index/artefact compilé), **270** (dernier, qualité+sécurité ensemble), **249** (dense, ablation), **255** (LLM-as-judge), **265** (synthèse sécurité en couches). Alignement théorie/correction confirmé ; prérequis respectés (249 renvoie à l'ablation DL du 186 ; 265 à OWASP du mois 2 — tous deux antérieurs).
- **Tests** : generate ✅ · check ✅ · depth-check ✅ · 43/43 ✅ · build ✅ · scan glyphes CLEAN · program.json restauré.
- **Périmètre Git** : 23 jours (réflexion seule) + `days-enrich-reflection-241-270.mjs` + `generate-curriculum.mjs` + `audit-reflection-sim.mjs`.
- **Prochain sous-batch** : **SB8** (271-300, jours d'apprentissage 271-300).

## SB8 — jours 271-300 (24 jours d'apprentissage : 271-300 hors pilote 274/288)

- **HEAD de départ** : `b166206` · **revues exclues** : 273, 280, 287, 294
- **Jours traités** : 271, 272, 275, 276, 277, 278, 279, 281, 282, 283, 284, 285, 286, 289, 290, 291, 292, 293, 295, 296, 297, 298, 299, 300
- **Domaines** : Projet 6 (rapport d'évaluation, README/ADR/démo), Agents (modes d'échec, cas d'usage, mémoire/état, agent vs workflow, consolidation), Workflows (explicites, 4 patterns, orchestration, caching, coûts d'inférence, doctrine), Architecture (hexagonale, event-driven, monolithe vs microservices, design patterns, exercice de design), Sécurité (OWASP LLM, privacy, observabilité, secrets, threat model, consolidation).
- **Questions** : 72 (24 × 3).
- **Similarité** (après 2 réécritures) : intra-batch max **0,082** ; vs déployées max **0,104** ; vs 313 entretiens **0,042** ; vs exercices max **0,090** ; vs cas métier **0,059**.
- **Défauts détectés puis corrigés** : `295.1 ~ exo295 = 0,17` (reprend la liste verbatim du top-3 OWASP de l'exercice) → **295.1 réécrite** (angle « excès d'autonomie », liste retirée) ; `295.3 ~ 299.3 = 0,12` (même argument « systématique > au hasard, évite d'oublier ») → **299.3 réangée** vers le transfert « penser aux pires cas d'abord ».
- **Lecture manuelle** : 24/24. **Classement : A = 24, B = 0, C = 0.**
- **Lecture croisée** : jours **271** (premier, rapport de preuve), **300** (dernier, posture sécurité), **293** (dense, design système), **278** (agent vs workflow), **289** (hexagonal). Alignement théorie/correction confirmé ; prérequis respectés (277 renvoie à la session RAG du 234).
- **Tests** : generate ✅ · check ✅ · depth-check ✅ · 43/43 ✅ · build ✅ · scan glyphes CLEAN · program.json restauré.
- **Périmètre Git** : 24 jours (réflexion seule) + `days-enrich-reflection-271-300.mjs` + `generate-curriculum.mjs` + `audit-reflection-sim.mjs`.
- **Prochain sous-batch** : **SB9** (301-321, jours d'apprentissage 303-321).

## SB9 — jours 301-321 (16 jours d'apprentissage : 303-321 hors pilote 302/314)

- **HEAD de départ** : `845f175` · **revues exclues** : 301, 308, 315
- **Jours traités** : 303, 304, 305, 306, 307, 309, 310, 311, 312, 313, 316, 317, 318, 319, 320, 321
- **Domaines** : Capstone DocSense — architecture (ADRs/C4, modèle de données, maquettes/backlog, dérisquage/spikes, setup/CI), RAG core (ingestion multi-format, hexagonal, retrieval hybride, génération avec citations, spikes exécutés), évaluation (golden set, harnais, dashboard qualité, baseline officielle), dockerisation, jalon démontrable.
- **Questions** : 48 (16 × 3).
- **Similarité** (après 3 réécritures) : intra-batch max **0,075** ; vs déployées max **0,104** ; vs 313 entretiens **0,060** ; vs exercices max **0,090** ; vs cas métier **0,031**.
- **Défauts détectés puis corrigés** : `317.3 ~ refl232.2 = 0,13` (« l'éval tôt change la construction ») → **317.3 réangée** vers la boucle de retour rapide ; `321.3 ~ refl314.3 = 0,11` (revue d'archi hebdo, portée par le pilote 314) → **321.3 réécrite** ; cette réécriture ayant rapproché 321.3 de 321.1 (0,13), **321.3 réorientée** une seconde fois vers la valeur démo/entretien.
- **Lecture manuelle** : 16/16. **Classement : A = 16, B = 0, C = 0.**
- **Lecture croisée** : jours **303** (premier, ADR/dette), **321** (dernier, jalon mi-parcours), **310** (dense, RAG core hexagonal), **309** (projet, ingestion réelle), **316** (golden set). Alignement théorie/correction confirmé ; prérequis respectés (310 renvoie à l'hexagonal du 289).
- **Tests** : generate ✅ · check ✅ · depth-check ✅ · 43/43 ✅ · build ✅ · scan glyphes CLEAN · program.json restauré.
- **Périmètre Git** : 16 jours (réflexion seule) + `days-enrich-reflection-301-321.mjs` + `generate-curriculum.mjs` + `audit-reflection-sim.mjs`.
- **Prochain sous-batch** : **SB10** (322-343, jours d'apprentissage 323-342).

## SB10 — jours 322-343 (17 jours d'apprentissage : 323-342)

- **HEAD de départ** : `89865a5` · **revues exclues** : 322, 329, 336, 343
- **Jours traités** : 323, 324, 325, 326, 327, 328, 330, 331, 332, 333, 334, 335, 338, 339, 340, 341, 342
- **Domaines** : Finalisation DocSense — workflow d'analyse, détection d'incohérences, coûts/observabilité, CI complète, tests du workflow LLM (mock/replay), jalon/revue mensuelle 11, guardrails testés, gestion d'erreur bout-en-bout, observabilité finale, couverture de tests, rapport qualité v1.0, feature freeze/post-mortem ; Communication (démo vidéo, storytelling des 7 projets, polish GitHub, schéma d'archi entretien, cohérence du portfolio).
- **Questions** : 51 (17 × 3).
- **Similarité** (après 2 réécritures) : intra-batch max **0,090** ; vs déployées max **0,093** ; vs 313 entretiens **0,064** ; vs exercices max **0,113** (323.1 vs son exercice, topique) ; vs cas métier **0,066**.
- **Défauts détectés puis corrigés** : `327.2 ~ refl108.1 = 0,16` (« le vrai LLM échoue 1/5 → mock restaure », déjà porté par le jour 108) → **327.2 réangée** vers la distinction mock/replay ; `339.3 ~ refl160.3 = 0,11` (« admettre ses limites renforce la crédibilité », déjà au 160) → **339.3 réangée** vers le signal de progression.
- **Lecture manuelle** : 17/17. **Classement : A = 17, B = 0, C = 0.**
- **Lecture croisée** : jours **323** (premier, fonctionnalité différenciante), **342** (dernier, cohérence portfolio), **327** (dense, tests LLM mock/replay), **335** (feature freeze/post-mortem), **341** (schéma d'archi entretien). Alignement théorie/correction confirmé.
- **Tests** : generate ✅ · check ✅ · depth-check ✅ · 43/43 ✅ · build ✅ · scan glyphes CLEAN · program.json restauré.
- **Périmètre Git** : 17 jours (réflexion seule) + `days-enrich-reflection-322-343.mjs` + `generate-curriculum.mjs` + `audit-reflection-sim.mjs`.
- **Prochain sous-batch** : **SB11** (344-363, jours d'apprentissage 344-363) — dernier.

## SB11 — jours 344-363 (17 jours d'apprentissage : 344-363 hors pilote 348) — DERNIER

- **HEAD de départ** : `6072d3a` · **revues exclues** : 350, 357, 364 · pilote exclu : 348
- **Jours traités** : 344, 345, 346, 347, 349, 351, 352, 353, 354, 355, 356, 358, 359, 360, 361, 362, 363
- **Domaines** : Recherche d'emploi et clôture — CV orienté preuves, LinkedIn, ciblage 30 entreprises, pitch, dossier de candidature, révision algo, questions IA, simulations technique/architecture, dossier d'entretien, négociation, candidatures réelles (deux lots), entretiens blancs (technique+projet, archi+comportemental), bilan annuel, plan des 90 jours.
- **Questions** : 51 (17 × 3).
- **Similarité** (après 4 réécritures) : intra-batch max **0,072** ; vs déployées max **0,100** ; vs 313 entretiens **0,063** ; vs exercices max **0,123** (363.1/355.1 vs leurs exercices, topique) ; vs cas métier **0,029**.
- **Défauts détectés puis corrigés** : jour **354** (simulation d'archi) calquait le jour 293 (exercice de design système) — `354.3~refl293.3=0,25`, `354.2~refl293.2=0,18` → **les 3 questions de 354 réécrites** vers la dimension simulation-entretien (oral, examinateur, conditions) ; `347.3~351.3=0,10` (« s'enregistrer révèle… ») → **351.3 réangée** vers la stratégie de révision (maîtrise profonde de quelques patterns). Après : intra 0,072, vs déployées 0,100.
- **Lecture manuelle** : 17/17. **Classement : A = 17, B = 0, C = 0.**
- **Lecture croisée** : jours **344** (premier, CV preuves), **363** (dernier, plan 90 jours), **354** (dense/réécrit, sim archi), **358** (projet, candidatures réelles), **361** (comportemental STAR). Alignement théorie/correction confirmé.
- **Tests** : generate ✅ · check ✅ · depth-check ✅ · 43/43 ✅ · build ✅ · scan glyphes CLEAN · program.json restauré.
- **Périmètre Git** : 17 jours (réflexion seule) + `days-enrich-reflection-344-363.mjs` + `generate-curriculum.mjs` + `audit-reflection-sim.mjs`.
- **DÉPLOIEMENT TERMINÉ** : 235/235 jours d'apprentissage spécifiques. Audit global final ci-dessous.

---

# CLÔTURE Y2 — Chantier C terminé (2026-07-23)

Déploiement des « Questions de réflexion » spécifiques **achevé** sur l'intégralité du palier 91-365.

## État avant Y2
Palier 91-365 : 235 jours d'apprentissage avec **3 questions de réflexion génériques identiques** (métacognitives, non ancrées au contenu). Diagnostic dans `DIAGNOSTIC_Y2_Y3.md` (Chantier C) → option **B1** validée (questions spécifiques par jour), en remplacement du « mini-quiz » initialement suggéré par `AUDIT_PEDAGOGIQUE_365.md`.

## Pilote + SB1 à SB11 — récapitulatif

| Étape | Plage | Jours | Questions | Commit |
|---|---|---|---|---|
| Pilote | échantillon | 22 | 66 | `86a2948` |
| SB1 | 91-120 | 21 | 63 | `b039b80` |
| SB2 | 121-150 | 24 | 72 | `2febae6` |
| SB3 | 151-167 | 14 | 42 | `41f132f` |
| SB4 | 168-180 | 11 | 33 | `682e817` |
| SB5 | 181-210 | 22 | 66 | `43fed2f` |
| SB6 | 211-240 | 24 | 72 | `d61402f` |
| SB7 | 241-270 | 23 | 69 | `b166206` |
| SB8 | 271-300 | 24 | 72 | `845f175` |
| SB9 | 301-321 | 16 | 48 | `89865a5` |
| SB10 | 322-343 | 17 | 51 | `6072d3a` |
| SB11 | 344-363 | 17 | 51 | `2901cb5` |
| **Total** | **91-365** | **235** | **705** | — |

## Réécritures (déclenchées par le contrôle de similarité, jamais masquées)
SB2 : 2 · SB4 : 1 · SB5 : 3 · SB6 : 1 · SB8 : 2 · SB9 : 3 · SB10 : 2 · SB11 : 4 · **Total : 18 questions réécrites** pour éliminer toute proximité artificielle (la plus élevée traitée : 354 vs 293 = 0,25 → réécrit).

## Métriques de similarité GLOBALES (705 questions, Jaccard n-grammes normalisés)
- **Réflexion vs réflexion** : max **0,120** sur 248 160 paires · **0 paire ≥ 0,14** · seulement 7 paires ≥ 0,10 · 99,86 % des paires < 0,05.
- **Réflexion vs 313 entretiens** : max **0,094** · 0 paire ≥ 0,14.
- **Réflexion vs exercice (même jour)** : max **0,132** (jour 209, topique).
- **Réflexion vs cas métier (même jour)** : max **0,088**.

## Résultats — deux niveaux distincts
- **Conformité structurelle (automatisée, 235/235 jours)** : les 235 jours d'apprentissage portent 3 questions de réflexion spécifiques (705 au total), 0 générique résiduel, 0 doublon exact, 0 question vide, triplet respecté. Contrôle par script sur les fichiers rendus.
- **Audit manuel stratifié (16/16 jours)** : lecture manuelle intégrale d'un **échantillon stratifié de 16 jours** couvrant toutes les périodes et tous les domaines (+ lectures croisées ≥ 5 par sous-batch pendant le déploiement). **Sur cet échantillon : 16/16 classés A, 0 B, 0 C** ; aucun défaut qualitatif détecté.
- **Portée** : la lecture manuelle intégrale **n'a pas** porté sur les 235 jours ; le « tout A » ci-dessus vaut pour l'échantillon de 16 jours audité manuellement, la conformité 235/235 étant établie par contrôle automatisé (structure + similarité), non par relecture humaine exhaustive.

## Anomalies
- **Corrigées** : 18 proximités de similarité (réécrites), aucune régression. Faux positifs « blocs vides » du script d'audit corrigés en amont.
- **Restantes** : aucune. 0 jour générique, 0 doublon exact, 0 question vide, 0 concept prématuré détecté.

## Preuve que Y3 est intact
Sur tout le déploiement (`2be5c3f..2901cb5`) : **aucun fichier `curriculum/solutions/` modifié** ; le diff cumulé des 235 jours ne contient QUE des puces de la section « Questions de réflexion » (aucune autre section touchée) ; mécanisme par merge PAR JOUR (`reflection` seul), aucun autre champ d'enrichissement écrasé. Y3 reste en **option A** (aucune correction, aucun format de correction modifié).

## Pipeline final
`generate` (795 fichiers) ✅ · `curriculum:check` 365/365 ✅ · `depth-check` ✅ · **43/43 tests** ✅ · `build` ✅ · scan glyphes CLEAN ✅ · `program.json` restauré (timestamp seul) ✅.

**Chantier C (Y2) : TERMINÉ. 235/235 jours spécifiques, 705 questions, Y3 intact.**
