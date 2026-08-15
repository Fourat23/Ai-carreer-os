# V45.3 — Ré-examen contradictoire des 7 MINOR_FIX de V45.2

Pour chaque MINOR_FIX de V45.2 : classification du défaut (STYLE_ONLY,
PEDAGOGICAL_MINOR, CONCEPTUAL_GAP, PRACTICE_GAP, TRANSFER_GAP, PREREQUISITE_GAP,
MISCONCEPTION_RISK, TECHNICAL_RISK), verdict V45.3 à l'aveugle, et **action
minimale recommandée** (aucune correction appliquée — audit-only).

| # | Leçon | Défaut (V45.3) | Grade V45.2 | Grade V45.3 | Action minimale |
|---|-------|----------------|:---:|:---:|-----------------|
| 1 | pandas-data-wrangling | **PRACTICE_GAP** | A | **B** | Ajouter une pratique pandas exécutable (sandbox Python) ; contenu inchangé. |
| 2 | observability-logging | **CONCEPTUAL_GAP** (redondance) | A | **B** | Désigner une source canonique du log structuré (080) ; réduire 055 à un renvoi ciblé SW-eng. |
| 3 | rag-evaluation | **PEDAGOGICAL_MINOR** (overlap) | A | **A** | Clarifier en tête la frontière avec ai-evaluation (072) ; ne pas fusionner. |
| 4 | prompt-injection-defense | **PEDAGOGICAL_MINOR** (overlap) | A | **A** | Clarifier la frontière avec ai-security (076) : vecteur précis vs défense en profondeur. |
| 5 | iac-fundamentals | **STYLE_ONLY** (coquille) | A | **A** | Corriger « réutation » → « réutilisation ». Rien d'autre. |
| 6 | docker-containers | **CONCEPTUAL_GAP** (récap redondant) | A | **B** | Fusionner son ancrage projet dans la série 097-101 ; repositionner/archiver le récap. |
| 7 | ci-cd | **CONCEPTUAL_GAP** (récap redondant) | A | **B** | Fusionner l'apport propre (éval smoke LLM en CI) dans 102-103 ; repositionner le récap. |

## Analyse

- **4 des 7 MINOR_FIX se confirment comme des B sous la grille REFERENCE-GRADE**
  (pandas, observability-logging, docker-containers, ci-cd). V45.2 les avait
  détectés (d'où le drapeau MINOR_FIX) mais les avait **maintenus au grade A**.
  V45.3, avec une définition stricte de A (« ressource PRINCIPALE choisissable »)
  et deux dimensions supplémentaires, les classe **B**. C'est le cœur de la
  divergence : la grille V45.2 était **légèrement trop permissive sur le grade**,
  pas sur la détection.
- **3 des 7 restent légitimement A** : rag-evaluation et prompt-injection-defense
  (overlaps défendables, contenu réellement de référence pour leur angle
  spécialisé) ; iac-fundamentals (une simple coquille, contenu de référence).
- **Aucun MINOR_FIX ne cache un TECHNICAL_RISK ni un MISCONCEPTION_RISK.** Les
  défauts sont de nature **curriculaire** (redondance) ou de **pratique**
  (exécutable manquant), jamais de fausseté.

## Conséquence

Les MINOR_FIX n'étaient pas des faux positifs : ils pointaient de vrais défauts.
Le désaccord porte sur la **conséquence de grade** : V45.2 = « A avec réserve »,
V45.3 = « B » pour 4 d'entre eux. Cela nourrit le verdict global
(`V45-3-CALIBRATION.md`) : certification **partiellement confirmée**.
