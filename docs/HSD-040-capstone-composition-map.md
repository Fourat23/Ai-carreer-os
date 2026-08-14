# HSD-040 — Carte haute de la simulation professionnelle (V40)

Conception haut niveau. Complète l'ADR-040. Montre **où se branche la nouveauté** sans dupliquer aucun
moteur. Français, factuel.

## 1. Vue d'ensemble

```
        data/capstones/*.json                 data/assessments/*.json (question model)
               │ (scénarios)                             │
               ▼                                          ▼
   lib/capstone.mjs  ──── réutilise ────►  gradeQuestion (PUR, déterministe)
   (validate/gradeCapstone/                         │
    capstoneToEvidence/remediation)                 │
               │                                     │ résultat par phase + global
               │                                     ▼
               │                       PONT evidence { type:'capstone', skills, url }
               │                          (patron mission-state.recordMissionCompletion)
               ▼                                     ▼
   lib/curriculum-graph.mjs      lib/skill-state.mjs      lib/review.mjs
   (+ nœud capstone,             (evidence→demonstrated,  (révision espacée,
    arêtes ASSESSES/REMEDIATES)   INCHANGÉ)               INCHANGÉ)
               │                          │                     │
               └──────────►  app/capstones + app/capstones/[id]  (UX, lecture seule)
```

**Règle d'or** : toutes les flèches vont VERS les moteurs existants. `assessment`, `skill-state`,
`review`, `mission-state`, `curriculum-graph` ne changent pas de logique ; ils reçoivent un nouveau type
de composant (le capstone) et un nouveau type de preuve (`capstone`).

## 2. Responsabilités par brique
| Brique | Rôle | Statut V40 |
|---|---|---|
| `data/capstones/*.json` | scénarios multi-phases (contexte, signal, artefacts, phases, debrief) | **CRÉÉ** |
| `lib/capstone.mjs` (+ .d.ts) | valider, corriger par phases (via gradeQuestion), evidence, remédiation | **CRÉÉ** |
| `lib/capstones-server.ts` | chargement disque validé (miroir assessments-server) | **CRÉÉ** |
| `lib/assessment.mjs` | `gradeQuestion` réutilisé pour chaque question de phase | **RÉUTILISÉ** (inchangé) |
| `lib/learning.mjs` | `EVIDENCE_TYPES` += `capstone` | **ÉTENDU** (additif) |
| `lib/skill-state.mjs` | dérive l'état depuis l'evidence | **RÉUTILISÉ** (inchangé) |
| `lib/review.mjs` | planifie la révision | **RÉUTILISÉ** (inchangé) |
| `lib/curriculum-graph.mjs` | nœud `capstone` + arêtes ASSESSES/REMEDIATES | **ÉTENDU** |
| `scripts/v40-check.mjs` | gate structurel + anti-leak | **CRÉÉ** |
| `app/capstones` (+ `[id]`) | expérience apprenant (lecture seule) | **CRÉÉ** |
| playbooks | reliés en remédiation ; créés seulement si manquants (CP11) | **RELIÉ / au mérite** |

## 3. Flux apprenant (déterministe, honnête)
1. `/capstones` : catalogue (domaine, difficulté, durée, compétences mobilisées).
2. Ouverture d'un capstone : contexte + signal + artefacts consultables (signal + bruit).
3. Phases successives : l'apprenant répond (hypothèses → investigation → diagnostic → décision →
   remédiation → validation → communication).
4. `gradeCapstone` corrige **par comparaison de données** (aucune notation « intelligente »).
5. Résultat : score par phase, compétences mobilisées/faibles, **debrief** (raisonnement attendu, faux
   indices, alternatives, compromis), et **remédiation** (leçons/exos/playbooks/révisions).
6. L'UX rappelle : **réussir un capstone est un INDICE de raisonnement, pas une preuve de maîtrise
   absolue ; les infrastructures sont SIMULÉES.**

## 4. Frontière RÉEL / SIMULÉ / PROXY (anti-greenwashing)
- **RÉEL** : correction déterministe, pont evidence, dérivation d'état, révision, validation navigateur.
- **PROXY** : le score de capstone est un indice de raisonnement.
- **SIMULÉ** : tous les artefacts d'infrastructure (K8s, cloud, broker, RAG, ML) — aucun service exécuté.
- **JAMAIS** : « production réelle », « cluster réel », « incident réel », « LLM réel », « maîtrise prouvée ».

## 5. Non-buts explicites
- Pas de second moteur de compétence/évaluation/progression.
- Pas d'écriture automatique dans `progress.json` depuis l'UX.
- Pas de gamification (XP/badges) — seulement préparer les **données** utiles à V41.
- Pas de refonte UI globale.
