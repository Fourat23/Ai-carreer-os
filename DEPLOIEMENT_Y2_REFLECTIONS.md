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
| SB5 | 181-210 | 181-209 | 22 | `days-enrich-reflection-181-210.mjs` | ✅ fait |
| SB6 | 211-240 | 212-240 | 24 | `days-enrich-reflection-211-240.mjs` | — |
| SB7 | 241-270 | 242-270 | 23 | `days-enrich-reflection-241-270.mjs` | — |
| SB8 | 271-300 | 271-300 | 24 | `days-enrich-reflection-271-300.mjs` | — |
| SB9 | 301-321 | 303-321 | 16 | `days-enrich-reflection-301-321.mjs` | — |
| SB10 | 322-343 | 323-342 | 17 | `days-enrich-reflection-322-343.mjs` | — |
| SB11 | 344-363 | 344-363 | 17 | `days-enrich-reflection-344-363.mjs` | — |

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
