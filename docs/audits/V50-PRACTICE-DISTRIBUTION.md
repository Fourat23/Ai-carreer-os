# V50 — Distribution de la pratique (avant → après)

Jours avec ≥1 activité de pratique résolue, par mois (dérivé `monthlyDistribution`).

| Mois | Avant V50 | Après V50 |
|------|:--:|:--:|
| M1 | 15/28 | 28/28 |
| M2 | 12/28 | 27/28 |
| M3 | 13/35 | 28/35 |
| M4 | 7/28 | 20/28 |
| M5 | 6/28 | 20/28 |
| M6 | 3/35 | 28/35 |
| M7 | **0/28** | **19/28** |
| M8 | **0/28** | **13/28** |
| M9 | **0/35** | **18/35** |
| M10 | 1/28 | 24/28 |
| M11 | 4/28 | 17/28 |
| M12 | 0/36 | 5/36 |
| **Total jours avec pratique** | **61/365** | **247/365** |

## Analyse

- **Le second semestre était un désert de pratique** (M7-M9 à 0). C'est
  précisément là qu'enseignent ml/dl/llm/rag/evalia/agents — dont V46-V49 avaient
  construit toute la pratique exécutable, restée orpheline. V50 l'y intègre.
- **Aucune surcharge introduite** : plafond de 5 exercices/jour lors du placement ;
  les seuls jours denses (>10) sont des journées **thématiques héritées**
  (dockerisation, architecture) présentes avant V50 — V50 n'y a rien ajouté.
- **Charge quotidienne réaliste préservée** : 137 jours portent 1 exercice, 50
  en portent 2, la longue traîne au-delà est héritée.

## Rôles pédagogiques (dérivés, pas une source de vérité)

Chaque activité reçoit un rôle calculé : `PRACTICE` (D≤3 hors révision),
`DIAGNOSTIC` (D4/D5), `REVIEW` (jour `isReview`). Le moteur de révision existant
et les 52 jours `isReview` sont réutilisés — aucun second scheduler.

## M12 (comblé à 5/36 seulement) — assumé

M12 (d330-365) est le mois **intégratif** : comm/autonomy (non-code) + projet de
synthèse. Peu de pratique de code neuve y est appropriée. Ce n'est pas un trou,
c'est la nature d'un mois de portfolio.
