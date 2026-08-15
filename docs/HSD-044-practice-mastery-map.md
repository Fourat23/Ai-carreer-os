# HSD-044 — Carte haute Practice Mastery II (V44)

Conception haut niveau. Complète l'ADR-044. Extension ADDITIVE ; aucun second moteur.

## 1. Vue d'ensemble
```
 data/exercises (difficulty D1-D5 défini)   misconceptions (étendues)   transfer-challenges/assessments/capstones
        │                                          │                              │
        ▼                                          ▼                              ▼
 lib/practice-ladder.mjs (PUR, dérivé) ── projette L0-L5 par compétence ── réutilise practice-coverage + skill-taxonomy
        │                                          │
        │                          diagnosticFeedback (V43) ← misconceptions.exerciseRefs (≥40 exos)
        ▼                                          ▼
 scripts/v44-check.mjs (gate : difficulté, orphelins, refs mortes, readiness, no-second-source)
        │
        ▼
 docs/PRACTICE-AUDIT-V44.md (audit 238 + échantillon ≥60)  +  leçons durcies  +  exercices D3/D4/D5  +  variantes
```

## 2. Responsabilités
| Brique | Rôle | Statut |
|---|---|---|
| `lib/practice-ladder.mjs` (+.d.ts) | projection L0-L5 par compétence (dérivée) | **CRÉÉ** |
| `lib/misconceptions.mjs` | + misconceptions & exerciseRefs (≥40 exos couverts) | **ÉTENDU** |
| `data/exercises/*` | + exercices D3/D4/D5 réellement exécutables | **CRÉÉ/DURCI** |
| `data/transfer-challenges/*` | + variantes/transfert | **CRÉÉ** |
| `curriculum/lessons/*` | leçons durcies au mérite | **DURCI** |
| `lib/practice-coverage.mjs` | readiness recalibrée si surestimation | **DURCI** |
| `scripts/v44-check.mjs` | gate qualité + audit harness | **CRÉÉ** |
| `lib/practice-coverage`, `assessment`, `capstone`, `curriculum-graph` | sources | **RÉUTILISÉ** |

## 3. Boucle cible (deliberate practice)
concept → exemple guidé → application → autonomie → **diagnostic (feedback misconception)** → variation →
transfert → situation pro → **remédiation ciblée** → nouvelle tentative. Chaque maillon dérive de l'existant.

## 4. Réel / Simulé / Proxy
- **RÉEL** : exercices exécutés (harnais), read-models et gate testés.
- **PROXY** : ladder & readiness = indices structurels.
- **SIMULÉ** : contextes d'infra/RAG/ML.

## 5. Non-buts
Second moteur/état/difficulté concurrent ; XP/badges ; fake difficulty ; feedback générique vide ;
réécriture de bonnes leçons.
