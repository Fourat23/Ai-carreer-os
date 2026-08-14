# Audit pédagogique — Sprint V41 (Learning Experience & gamification fondée sur preuves)

> Rendre la progression, les compétences et les preuves VISIBLES, EXPLICABLES et ACTIONNABLES, sans second
> moteur ni métrique inventée. Français, factuel, critique. Un état/score reste un PROXY.

## 1. Méthodologie
Audit CP0 lecture seule (moteurs/pages/données), conception (ADR/HSD/TSD-041), read-model pur, gate
`v41:check`, surfaçage sobre, hardening. Commande de comptage **canonique** : `npm test`. Verdicts par
dimension (insuffisant/moyen/bon/fort/excellent), sans « excellent » automatique.

## 2. EXISTAIT DÉJÀ (réutilisé, non dupliqué)
`skill-state.mjs` (états + skillStats), `review.mjs` (SM-2), `learning.mjs` (evidence), `assessment.mjs`,
`capstone.mjs`, `curriculum-graph.mjs`, `track-aggregate.mjs`, `progress-stats.mjs`, pages `/`, `/skills`,
`/synthese`, `/revisions`. **Aucun second moteur créé.**

## 3. CRÉÉ / MODIFIÉ
- **CRÉÉ** : `lib/learning-experience.mjs` (+ .d.ts) — read-model dérivé (explainSkillState, nextBestActions,
  evidenceTimeline, milestones, experienceSummary) ; `scripts/v41-check.mjs` (gate) ; 7 tests ; docs
  ADR/HSD/TSD-041, UX-AUDIT-V41.
- **MODIFIÉ** : `/skills` (why + next action), `/synthese` (jalons + timeline), `/` (que faire ensuite),
  `globals.css` (patterns sobres). **Aucune leçon/exercice/mission modifiés ; aucune donnée pédagogique
  touchée.**

## 4. Réponses apportées aux questions de l'apprenant (objectif du sprint)
| Question | Réponse V41 | Surface |
|---|---|---|
| Où j'en suis ? | carte Reprise + progression (existant) | `/` |
| Qu'ai-je démontré vs seulement vu ? | états + « pourquoi » (raisons dérivées) | `/skills` |
| Pourquoi cet état ? | `explainSkillState` (journées/preuves/révision) | `/skills` |
| Sur quoi suis-je fragile ? | états `to-consolidate` + next-action | `/skills`, `/` |
| Qu'est-ce qui mérite révision ? | révisions dues priorisées | `/`, `/revisions` |
| Que faire maintenant ? | `nextBestActions` (raison + preuve attendue) | `/` |
| Où sont mes preuves ? | evidence timeline | `/synthese` |
| Qu'est-ce qui a changé ? | jalons fondés preuves + timeline | `/synthese` |

## 5. Honnêteté (RÉEL / PROXY / NON FAIT)
- **RÉEL** : dérivations déterministes testées (7 tests) ; gate anti-XP/anti-source-concurrente ; navigateur
  25/25 (5 largeurs) ; build ; tsc 0.
- **PROXY** : les états et jalons sont des indices dérivés, pas une preuve de maîtrise humaine — rappelé
  dans l'UI (`/synthese`).
- **NON FAIT (assumé)** : capitalisation auto capstone/diagnostic → preuve ; skill-map graphique ; roadmap
  /parcours ; design system étendu ; audit axe-core. Documenté comme dette V42.
- **PAS de** : XP, monnaie, badges, streaks, niveaux, classement, « AI Coach », progression inventée,
  second moteur — vérifiés par le gate et un test garde-fou.

## 6. AVANT → APRÈS (commande canonique `npm test`)
| Métrique | Avant V41 | Après V41 |
|---|---|---|
| Tests (`npm test`) | 1141 | **1148** |
| Gates (`gates:active`) | 20 | **21** |
| Modules read-model dérivés | 0 dédié LX | **1** (`learning-experience.mjs`) |
| Leçons / exos / missions / playbooks / évaluations / capstones | 128 / 238 / 42 / 45 / 16 / 5 | **inchangés** (aucun gonflage) |
| Sources de vérité de progression | 1 | **1** (aucune ajoutée) |
| tsc / build / graphe bloquant | 0 / OK / 0 | **0 / OK / 0** |

## 7. Verdict par dimension
| Dimension | Verdict | Justification |
|---|---|---|
| Compréhension de la progression | FORT | why-this-state + timeline rendent l'état et son origine explicites. |
| Aide à la décision (next action) | FORT | actions dérivées, priorisées, avec raison + preuve attendue ; déterministes. |
| Visibilité des preuves | FORT | timeline dérivée, aucune preuve inventée. |
| Intégrité anti-gamification | EXCELLENT | jalons = faits reliés à une preuve ; gate + test garde-fou anti-XP. |
| Une seule source de vérité | EXCELLENT | read-model pur, zéro état dupliqué, états ∈ SKILL_STATES. |
| Honnêteté PROXY | FORT | rappelée dans l'UI ; aucune revendication de maîtrise. |
| Ampleur UI livrée | MOYEN | volontairement bornée (3 pages) ; refontes larges reportées (assumé). |
| Accessibilité | BON | clavier natif, états libellés ; audit automatisé non revendiqué. |

## 8. VERDICT GLOBAL
**FORT** sur la substance pédagogique (l'apprenant comprend son état, sait quoi faire, voit ses preuves,
sans métrique inventée ni second moteur). **MOYEN** sur l'ampleur visuelle (bornée par choix, pour éviter
l'AI slop). Pas « excellent » : la dette assumée (capitalisation opt-in, skill-map, roadmap) est réelle et
documentée. Aucun greenwashing.

## 9. Limites de l'audit
Auteur unique ; proxys structurels ; validation navigateur sur données baseline (progression quasi vide).
