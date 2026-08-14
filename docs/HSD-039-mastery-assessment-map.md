# HSD-039 — Carte haute du système Maîtrise & Évaluation (V39)

Document de conception haut niveau. Complète l'ADR-039. Montre **où se branche la nouveauté** dans
l'architecture existante, sans en dupliquer aucune brique. Français, factuel.

## 1. Vue d'ensemble

```
                 data/assessments/*.json         curriculum/lessons/*.md
                         │ (catalogue)                     │
                         ▼                                  ▼
   lib/assessment.mjs  ──────────────►  gradeAssessment (PUR, déterministe)
   (validate/grade/taxonomySummary)              │
                         │                        │ résultat {passed, byTaxonomy, weakSkills}
                         │                        ▼
                         │              PONT preuve : { type:'assessment', skills:[...] }
                         │                        │  (réutilise le flux evidence existant)
                         ▼                        ▼
   lib/curriculum-graph.mjs          lib/skill-state.mjs        lib/review.mjs
   (+ nœud assessment,               (états dérivés — INCHANGÉ)  (SM-2 — INCHANGÉ)
    arêtes ASSESSES/REMEDIATES)               │                        │
                         │                     ▼                        ▼
                         └────────────►  app/skills   app/revisions   app/synthese
                                         app/evaluations (nouvelle, lecture seule)
```

**Règle d'or** : les flèches vont VERS les moteurs existants. Rien ne les remplace. `skill-state.mjs`
et `review.mjs` ne sont pas modifiés dans leur logique de dérivation ; ils reçoivent seulement un
signal de plus (une preuve de type `assessment`).

## 2. Responsabilités par brique

| Brique | Rôle | Statut V39 |
|---|---|---|
| `data/assessments/*.json` | Contenu : questions déterministes à taxonomie, skills, lessonRefs, remédiation | **CRÉÉ** |
| `lib/assessment.mjs` (+ .d.ts) | Modèle PUR : valider, corriger, résumer par taxonomie | **CRÉÉ** |
| `lib/assessments-server.ts` | Chargement disque du catalogue (miroir de `exercises-server.ts`) | **CRÉÉ** |
| `lib/learning.mjs` | `EVIDENCE_TYPES` + `assessment` ; pont résultat→preuve | **ÉTENDU** (additif) |
| `lib/skill-state.mjs` | Dérive l'état depuis les preuves | **RÉUTILISÉ** (inchangé) |
| `lib/review.mjs` | Planifie la révision espacée | **RÉUTILISÉ** (inchangé) |
| `lib/curriculum-graph.mjs` | Nœud `assessment`, arêtes `ASSESSES`/`REMEDIATES`, audit | **ÉTENDU** |
| `scripts/v39-check.mjs` | Gate structurel | **CRÉÉ** |
| `app/evaluations` | Liste lisible des évaluations (lecture seule) | **CRÉÉ** |
| `app/skills`, `app/revisions` | Reliures vers évaluations & rappel actif | **ÉTENDU** (liens) |

## 3. Flux apprenant (déterministe, honnête)

1. L'apprenant ouvre `/evaluations` (ou une évaluation reliée depuis une compétence « à consolider »).
2. Il répond aux questions (`mcq` / `multi` / `predict`).
3. `gradeAssessment` corrige **par comparaison de données** (aucune notation « intelligente »).
4. Le résultat donne : score par question, **répartition par niveau de taxonomie**, compétences
   faibles, et **remédiation** (leçons à revoir).
5. S'il enregistre le résultat comme preuve, `skill-state` en tient compte pour l'état de la
   compétence ; la remédiation peut alimenter la file de révision existante.
6. L'UX rappelle : **réussir une évaluation est un INDICE, pas une preuve de maîtrise humaine.**

## 4. Frontière RÉEL / SIMULÉ / PROXY (anti-greenwashing)

- **RÉEL** : la correction déterministe (comparaison), la dérivation d'état par règles, la révision
  SM-2, la validation navigateur.
- **PROXY** : le score d'évaluation est un indicateur, pas une mesure d'apprentissage.
- **JAMAIS** : aucune « IA adaptative », aucun modèle de compétence caché, aucun LLM de notation,
  aucune revendication « maîtrise prouvée ». Les domaines simulés restent étiquetés SIMULATION.

## 5. Non-buts explicites
- Pas de second moteur d'états ni de second moteur de révision.
- Pas de score global unique fusionnant plusieurs parcours/compétences.
- Pas de jours créés (le socle vit en catalogue + reliures, comme V37/V38).
- Pas d'écriture automatique dans `progress.json` par le gate/les tests.
