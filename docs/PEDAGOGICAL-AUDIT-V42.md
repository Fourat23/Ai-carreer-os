# Audit pédagogique — Sprint V42 (Deep Transfer, Problem Variability & Academic Hardening VIII)

> Rendre le transfert explicitement défini et mesurable, créer de vrais défis T5, relier les erreurs à des
> remédiations conceptuelles, sans second moteur ni gonflage. Français, factuel, critique.

## 1. Méthodologie
Audit CP0 lecture seule (transfert existant + leçons historiques), conception (ADR/HSD/TSD-042),
composition de l'existant, gate `v42:check`, hardening. Commande de comptage **canonique** : `npm test`.
Verdicts par dimension, sans « excellent » automatique.

## 2. EXISTAIT DÉJÀ (réutilisé)
`assessment.mjs` (modèle de question réutilisé par les défis), `skill-state`, `review`, `learning`,
`curriculum-graph`, `learning-experience`, capstones, playbooks. **Aucun second moteur créé.**

## 3. CRÉÉ / MODIFIÉ
- **CRÉÉ** : `lib/transfer-taxonomy.mjs` (T0–T5 + rubrique + classifieur conservateur), `lib/transfer-
  challenge.mjs` (+ server), 5 défis T5, `lib/misconceptions.mjs` (7 idées fausses), gate `v42:check`,
  ledger, 22 tests, docs ADR/HSD/TSD-042 + TRANSFER-AUDIT-V42.
- **MODIFIÉ** : 3 questions TRANSFER V39 durcies en T4 (REWRITE honnête) ; `curriculum-graph.mjs`
  (nœud transfer + `dead-transfer-ref` + `skill-without-transfer`). **Aucune leçon réécrite** (les leçons
  auditées, ex. caching-performance, sont bonnes → P3).

## 4. Academic Hardening (verdict honnête)
Le CP0 a établi que les leçons ont été durcies en V26-V38 ; le sondage (caching-performance, etc.) montre
un bon niveau. **Réécrire de bonnes leçons pour produire du diff est interdit.** Le vrai levier académique
de V42 n'est pas la profondeur des leçons mais leur **reliure au transfert** — traitée via les défis et le
diagnostic de graphe. Hardening de leçons = **NO_COMMIT justifié** (aucune P0 réelle trouvée au sondage ;
audit large reporté V43).

## 5. RÉEL / SIMULÉ / PROXY / NON FAIT
- **RÉEL** : correction déterministe (auto-cohérence 100 %), classifieur testé, graphe, gate, build.
- **SIMULÉ** : contextes distribués/RAG/ML des défis, jamais exécutés.
- **PROXY** : un niveau T ou un score est un indice, jamais « compétence maîtrisée ».
- **NON FAIT (dette V43)** : défis pour algo/ds/jsts/secu/cloud ; UX dédiée aux défis ; familles de
  variantes ; variantes de capstones ; audit large de leçons.

## 6. AVANT → APRÈS (commande canonique `npm test`)
| Métrique | Avant V42 | Après V42 |
|---|---|---|
| Tests (`npm test`) | 1148 | **1170** |
| Gates (`gates:active`) | 21 | **22** |
| Défis de transfert (T5) | 0 | **5** |
| Misconceptions structurées | 0 | **7** |
| Questions TRANSFER durcies (T4) | 0 | **3** (sur 16, sans gonflage) |
| Leçons / exos / missions / playbooks / évaluations / capstones | 128/238/42/45/16/5 | **inchangés** |
| Sources de vérité | 1 | **1** (aucune ajoutée) |
| tsc / build / graphe bloquant | 0 / OK / 0 | **0 / OK / 0** |

## 7. Verdict par dimension
| Dimension | Verdict | Justification |
|---|---|---|
| Définition du transfert | FORT | échelle T0–T5 explicite + classifieur conservateur (refuse T5 sans preuve). |
| Détection des faux transferts | FORT | 3 single-hop durcis ; audit honnête ; aucun reclassement flatteur. |
| Transfert profond réel | FORT | 5 défis T5 multi-domaines soutenus par le corpus, discriminants, multi-étapes. |
| Remédiation conceptuelle | FORT | misconceptions reliées à des ressources précises (fini « relis le cours »). |
| Visibilité des ruptures | BON | diagnostic `skill-without-transfer` (avertissement, sans faux positif). |
| Une seule source de vérité | EXCELLENT | défis = composition du modèle assessment ; aucun 3e moteur. |
| Honnêteté réel/proxy | EXCELLENT | SIMULATION étiquetée ; jamais « maîtrisé » sur un score. |
| Couverture par compétence | MOYEN | 7 compétences couvertes, 5 structurantes non couvertes (assumé, signalé). |
| Academic hardening de leçons | (NO_COMMIT) | leçons déjà bonnes ; réécriture-diff refusée. |

## 8. VERDICT GLOBAL
**FORT** sur la substance transfert (définition, détection des faux, vrais T5, remédiation), **MOYEN** sur
la couverture (5 compétences structurantes restent sans défi — dette V43 explicite). Pas « excellent » :
la variabilité à grande échelle et l'UX dédiée manquent. Aucun greenwashing ; les trous sont signalés par
le gate, pas masqués.

## 9. Limites de l'audit
Auteur unique ; proxys structurels ; aucune mesure d'apprentissage humain.
