# HSD-043 — Carte haute de la couverture de pratique (V43)

Conception haut niveau. Complète l'ADR-043. La nouveauté COMPOSE l'existant ; aucun second moteur.

## 1. Vue d'ensemble
```
 lessons-map (leçons→skills programme)   data/exercises (skills fine)   assessments/capstones/transfer
        │                                       │ (projection FINE_TO_PROGRAM)      │
        └───────────────┬───────────────────────┴──────────────────┬───────────────┘
                        ▼                                           ▼
              lib/practice-coverage.mjs  (PUR, dérivé, aucune vérité propre)
              ├─ skillCoverage(skillId, sources) → { foundation, practice, autonomy,
              │      diagnostic, variation, transfer, professional, readiness }
              ├─ coverageMatrix(program, sources) → [ ...skillCoverage ]
              └─ diagnosticFeedback(skill|exerciseId) → misconception + remédiation (compose V42)
                        │
                        ▼
              scripts/v43-check.mjs (gate)  +  data/transfer-challenges/* (comblement)  +  docs/PRACTICE-AUDIT-V43.md
```

## 2. Responsabilités
| Brique | Rôle | Statut |
|---|---|---|
| `lib/practice-coverage.mjs` (+.d.ts) | matrice de couverture + feedback dérivés | **CRÉÉ** |
| `lib/skill-taxonomy.mjs`, `lib/misconceptions.mjs`, `lib/transfer-challenge.mjs` | sources dérivées | **RÉUTILISÉ** |
| `data/exercises/*`, lessons-map, assessments, capstones, transfer-challenges | sources | **RÉUTILISÉ** (inchangé) |
| `data/transfer-challenges/*` (algo/ds, jsts, secu, cloud) | comblement transfert | **CRÉÉ** |
| `lib/misconceptions.mjs` | + `exerciseRefs` pour le feedback | **ÉTENDU** (additif) |
| `scripts/v43-check.mjs` | gate couverture + orphelins + no-second-source | **CRÉÉ** |

## 3. Dérivation des 7 dimensions (par compétence de programme)
- **foundation** : ≥ 1 leçon enseigne la compétence (lessons-map).
- **practice** : ≥ 1 exercice projeté sur la compétence (FINE_TO_PROGRAM).
- **autonomy** : ≥ 1 exercice de difficulté ≥ 3 (pratique autonome), ou ≥ 5 exercices.
- **diagnostic** : assessment DIAGNOSIS sur la compétence, ou phase capstone `diagnosis`, ou misconception reliée.
- **variation** : ≥ 2 exercices distincts, ou un défi de transfert.
- **transfer** : assessment TRANSFER ou transfer-challenge sur la compétence.
- **professional** : mission/capstone/playbook sur la compétence.
Chaque dimension = `full | partial | none` avec la **source** citée. `readiness` ∈
{`not-ready`,`foundational`,`guided`,`junior-ready`,`strong-junior`} dérivé de la combinaison (jamais du volume seul).

## 4. Réel / Simulé / Proxy
- **RÉEL** : exercices exécutés par le harnais existant ; dérivations testées.
- **PROXY** : la couverture et la readiness sont des indices structurels, pas une maîtrise humaine.
- **SIMULÉ** : défis d'infra/RAG/ML.

## 5. Non-buts (dette V44)
Hints inline sur 238 exercices ; audit qualitatif exhaustif ; création massive d'exercices ; UX dédiée à
la matrice (les données sont exposées via le read-model, surfaçage UI reporté).
