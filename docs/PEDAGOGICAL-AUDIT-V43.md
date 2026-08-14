# Audit pédagogique — Sprint V43 (Practice Mastery & Deliberate Practice)

> Rendre l'état réel de la pratique VISIBLE par compétence, relier les erreurs à des misconceptions, et
> combler les trous de transfert — sans second moteur ni gonflage. Français, factuel, critique.

## 1. Méthodologie
Audit CP0 lecture seule (corpus + moteurs), conception (ADR/HSD/TSD-043), read-model dérivé, gate
`v43:check`, hardening. Commande de comptage **canonique** : `npm test`. Verdicts par dimension, sans
« excellent » automatique.

## 2. EXISTAIT DÉJÀ (réutilisé)
`exercise.mjs` + harnais d'exécution réel, `assessment`, `capstone`, `skill-state`, `review`,
`learning-experience`, `transfer-challenge`, `misconceptions`, `curriculum-graph`, Labs. **Aucun second
moteur créé.**

## 3. CRÉÉ / MODIFIÉ
- **CRÉÉ** : `lib/practice-coverage.mjs` (matrice de couverture dérivée + readiness + feedback
  diagnostique), gate `v43:check`, 4 défis de transfert T5 (algo/ds, jsts, secu, cloud), 11 tests, docs
  ADR/HSD/TSD-043 + PRACTICE-AUDIT-V43.
- **MODIFIÉ** : `lib/misconceptions.mjs` (+ exerciseRefs réels). **Aucune leçon/exercice standard réécrit**
  (les exercices audités sont exécutables et corrects ; réécriture-diff refusée).

## 4. Ce que l'audit a RÉELLEMENT révélé (honnêteté)
- Le corpus est **fort en fondations** (jsts 215 exos de code, algo 22…) mais **0/238 feedback diagnostique**
  et **difficulté plafonnée** (niv.2 dominant, niv.5 = 0).
- La matrice de couverture (nouveau read-model) montre **8 compétences strong-junior**, mais aussi que
  plusieurs compétences sont **not-ready** : soit **bien couvertes sans pratique de code** (sql/ml/rag/
  evalia/llm — limite du harnais), soit **réellement minces** (dl/agents/autonomy/patterns/comm).
- Les 5 trous de transfert structurants signalés par V42 (algo/ds, jsts, secu, cloud) sont **comblés**
  (9 défis T5 au total ; plus aucun `skill-without-transfer` sur ces compétences).

## 5. RÉEL / SIMULÉ / PROXY / NON FAIT
- **RÉEL** : exercices exécutés par le harnais existant ; read-model et gate testés ; build ; tsc.
- **SIMULÉ** : contextes d'infra/RAG/ML des défis.
- **PROXY** : couverture et readiness = indices structurels, jamais « compétence maîtrisée ».
- **NON FAIT (dette V44)** : hints inline sur 238 exos ; exercices de code sql/ml/rag (harnais) ;
  renforcement dl/agents/autonomy/patterns/comm ; typage cognitif de la difficulté ; UX de la matrice.

## 6. AVANT → APRÈS (commande canonique `npm test`)
| Métrique | Avant V43 | Après V43 |
|---|---|---|
| Tests (`npm test`) | 1170 | **1181** |
| Gates (`gates:active`) | 22 | **23** |
| Défis de transfert T5 | 5 | **9** |
| Compétences strong-junior (matrice) | — (non mesuré) | **8** |
| Read-model de couverture | 0 | **1** (`practice-coverage.mjs`) |
| Leçons / exos / missions / playbooks / évaluations / capstones | 128/238/42/45/16/5 | **inchangés** |
| Sources de vérité | 1 | **1** (aucune ajoutée) |
| tsc / build / graphe bloquant | 0 / OK / 0 | **0 / OK / 0** |

## 7. Verdict par dimension
| Dimension | Verdict | Justification |
|---|---|---|
| Visibilité de la couverture | FORT | matrice dérivée par compétence, 7 dimensions, signaux explicites (non opaques). |
| Feedback diagnostique | BON | reliure exercices↔misconceptions + résolveur ; pas de hints inline (dette V44). |
| Comblement transfert | FORT | 5 trous structurants comblés (9 défis T5) ; anti-faux-transfert vérifié. |
| Honnêteté du diagnostic | EXCELLENT | not-ready nuancé (couvert-sans-code vs mince) ; readiness jamais dérivée du volume. |
| Une seule source de vérité | EXCELLENT | read-model pur ; projection documentée ; aucun catalogue/état concurrent. |
| Qualité du corpus (profondeur) | BON | fondations solides ; sur-représentation JS notée ; difficulté peu typée. |
| Couverture data/ML/IA | MOYEN | forte en diagnostic/transfert, faible en pratique de code ; dl/agents minces. |

## 8. VERDICT GLOBAL
**FORT** : l'état réel de la pratique est désormais mesuré et nommé par compétence, les erreurs mènent à
des misconceptions, et les trous de transfert prioritaires sont comblés — sans second moteur ni gonflage.
**MOYEN** sur la profondeur data/ML/IA et le feedback inline (dette V44 explicite). Pas « excellent » : la
matrice révèle des trous réels, honnêtement documentés plutôt que masqués.

## 9. Limites de l'audit
Niveau 1 exhaustif ; Niveau 2 échantillon. Proxys structurels ; aucune mesure d'apprentissage humain.
