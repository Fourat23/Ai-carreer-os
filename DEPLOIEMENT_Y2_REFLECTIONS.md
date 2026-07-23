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
| SB2 | 121-150 | 121-150 | 24 | `days-enrich-reflection-121-150.mjs` | ✅ fait |
| SB3 | 151-167 | 151-167 | 14 | `days-enrich-reflection-151-167.mjs` | — |
| SB4 | 168-180 | 169-180 | 11 | `days-enrich-reflection-168-180.mjs` | — |
| SB5 | 181-210 | 181-209 | 22 | `days-enrich-reflection-181-210.mjs` | — |
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
- **Prochain jour restant** : **151** (début SB3).
