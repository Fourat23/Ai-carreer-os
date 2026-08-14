# HSD-041 — Carte haute de la Learning Experience (V41)

Conception haut niveau. Complète l'ADR-041. Montre que la nouveauté est un **read-model dérivé** branché
sur les pages existantes, sans second moteur. Français, factuel.

## 1. Vue d'ensemble

```
   skill-state.skillStats ─┐
   evidence (jours)        ├─►  lib/learning-experience.mjs  (PUR, dérivé, aucune vérité propre)
   review.getDueReviews    │      ├─ explainSkillState(stat)      → { state, label, reasons[], nextAction }
   capstones + remédiation ┘      ├─ nextBestActions(program,progress,ctx) → [{action,reason,goal,expectedEvidence,href}]
                                  ├─ evidenceTimeline(progress,program)    → [{createdAt,type,title,skills,day}]
                                  └─ milestones(program,progress,ctx)      → [{id,label,achieved,achievedAt,why}]
                                           │
              ┌────────────────────────────┼───────────────────────────────┐
              ▼                            ▼                                ▼
        app/skills (why + next)     app/synthese (timeline + milestones)   app/ (Aujourd'hui/Next)
```

**Règle d'or** : toutes les flèches ENTRENT dans le read-model puis vers l'UI ; rien ne réécrit
skill-state/review/evidence. Le module ne fait que **lire et composer**.

## 2. Responsabilités
| Brique | Rôle | Statut |
|---|---|---|
| `lib/learning-experience.mjs` (+ .d.ts) | dérivations pures (why/next/timeline/milestones) | **CRÉÉ** |
| `lib/skill-state.mjs`, `review.mjs`, `learning.mjs`, `capstone.mjs` | sources dérivées | **RÉUTILISÉ** (inchangé) |
| `scripts/v41-check.mjs` | gate (anti-source-concurrente, explicabilité, anti-XP) | **CRÉÉ** |
| `app/skills` | + explication d'état + prochaine action | **ÉTENDU** |
| `app/synthese` | + evidence timeline + milestones | **ÉTENDU** |
| `app/` (dashboard) | + bloc « Aujourd'hui / Que faire ensuite » (3-5 items) | **ÉTENDU** |

## 3. Flux apprenant
1. Dashboard : « Aujourd'hui » = 3-5 actions dérivées (continuer / à revoir / défi / progression récente /
   prochain jalon), chacune avec sa raison.
2. `/skills` : chaque compétence montre son état, **pourquoi** (jours/preuves/à-consolider) et **la prochaine
   action** pour progresser (ex. `practiced → demonstrated`).
3. `/synthese` : historique des preuves (d'où vient la progression) + jalons atteints, frontière PROXY rappelée.

## 4. Frontière RÉEL / PROXY / SIMULÉ
- **RÉEL** : dérivations déterministes testées ; états et révisions inchangés.
- **PROXY** : un état/score est un indice, pas une preuve de maîtrise humaine — rappelé dans l'UI.
- **JAMAIS** : XP, badges vides, streaks, niveaux inventés, « AI Coach », progression fabriquée.

## 5. Non-buts (assumés, documentés)
- Pas de refonte visuelle massive ni de nouveau design system lourd.
- Pas de skill-map graphique interactive complète (dette V42 : le graphe reste consultable via les données).
- Pas de refonte /parcours en roadmap animée (dette V42).
- Pas d'écriture dans `progress.json`.
