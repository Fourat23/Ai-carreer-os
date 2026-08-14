# HSD-042 — Carte haute du dispositif de transfert (V42)

Conception haut niveau. Complète l'ADR-042. La nouveauté COMPOSE l'existant ; aucun second moteur.

## 1. Vue d'ensemble
```
   lib/transfer-taxonomy.mjs (T0–T5 + rubrique + classifieur conservateur, PUR)
                 │
   data/transfer-challenges/*.json ──► lib/transfer-challenge.mjs ──► RÉUTILISE validateQuestion/gradeQuestion (assessment.mjs)
                 │                              │
                 │                              ▼
   lib/misconceptions.mjs (registre pur) ──► remediateMisconception ──► lessonRefs/exerciseRefs existants
                 │                              │
                 ▼                              ▼
   lib/curriculum-graph.mjs (+ transfer-challenge, diagnostic skill-without-transfer warning)
                 │
   scripts/v42-check.mjs (gate)  +  docs/architecture/v42-transfer-ledger.json
```

## 2. Responsabilités
| Brique | Rôle | Statut |
|---|---|---|
| `lib/transfer-taxonomy.mjs` (+.d.ts) | échelle T0–T5, rubrique, classifieur prudent | **CRÉÉ** |
| `lib/transfer-challenge.mjs` (+.d.ts) | valider/noter un défi (réutilise assessment) | **CRÉÉ** |
| `lib/transfer-challenges-server.ts` | chargement disque validé | **CRÉÉ** |
| `data/transfer-challenges/*.json` | vrais défis T4/T5 multi-domaines | **CRÉÉ** |
| `lib/misconceptions.mjs` (+.d.ts) | registre idées fausses → remédiation | **CRÉÉ** |
| `lib/assessment.mjs` | modèle de question réutilisé | **RÉUTILISÉ** (inchangé) |
| `lib/curriculum-graph.mjs` | + transfer-challenges + skill-without-transfer (warning) | **ÉTENDU** |
| `data/assessments/*` (2-3 questions) | durcissement honnête T4 | **MODIFIÉ** |
| `scripts/v42-check.mjs` | gate structurel | **CRÉÉ** |

## 3. Flux
1. Un défi de transfert présente un contexte NOUVEAU + un pont conceptuel non nommé ; l'apprenant choisit
   le modèle mental, ignore le bruit, raisonne en plusieurs étapes.
2. Correction déterministe (gradeQuestion) ; un échec peut révéler une **misconception** → remédiation
   ciblée (leçon/exercice précis), pas « relis le cours ».
3. Le graphe signale les compétences structurantes sans défi de transfert relié.

## 4. Réel / Simulé / Proxy
- **RÉEL** : correction déterministe, classification conservatrice testée, diagnostic de graphe.
- **PROXY** : réussir un défi = indice de transfert, pas une maîtrise prouvée.
- **SIMULÉ** : contextes d'infra/LLM/ML décrits, jamais exécutés.

## 5. Non-buts (dette V43)
Familles de variantes à grande échelle ; variantes de capstones ; hardening large de leçons ; cohérence
365j complète ; UX dédiée aux défis (les défis sont surfacés via /diagnostics si le temps le permet, sinon
consultables en données — documenté).
