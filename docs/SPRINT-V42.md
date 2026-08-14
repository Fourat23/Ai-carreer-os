# SPRINT V42 — Deep Transfer, Problem Variability & Academic Curriculum Hardening VIII

> Local, mono-utilisateur, sans auth/SaaS/réseau. Priorité : **pédagogie/acquisition > pratique >
> transfert > évaluation > cohérence parcours > features > UI.** Une seule source de vérité, sans fausse
> « IA », sans infra réelle.

## Résultat en une phrase
V42 définit explicitement le transfert (échelle T0–T5), détecte et durcit les faux transferts, crée de
vrais défis **T5** multi-domaines et relie les erreurs à des **remédiations conceptuelles** — en composant
le modèle d'évaluation existant, sans second moteur.

## Décision structurante (CP0 → ADR-042)
Les leçons sont déjà solides (durcies V26-V38) ; le vrai manque est le **transfert profond** et sa
mesure. Les défis de transfert **réutilisent** `validateQuestion/gradeQuestion` (aucun 3e moteur) ; la
taxonomie T0–T5 est **complémentaire** de Bloom ; le classifieur **refuse T5** sans pont + changement de
domaine + multi-étapes.

## Livrables par checkpoint (8, consolidés depuis les 15 du prompt — l'audit fait foi)
- **CP0** — audit lecture seule ; baseline verte (1148 tests) ; verdict : transfert = vrai trou, leçons P3.
- **CP1** — ADR/HSD/TSD-042.
- **CP2** — `lib/transfer-taxonomy.mjs` (T0–T5 + rubrique + classifieur conservateur) + 8 tests.
- **CP3** — `lib/transfer-challenge.mjs` (réutilise assessment) + 5 défis T5 + 5 tests.
- **CP4** — durcissement honnête de 3 questions TRANSFER single-hop → T4 (REWRITE).
- **CP5** — `lib/misconceptions.mjs` (7 idées fausses → remédiation ciblée) + 4 tests.
- **CP6** — graphe : nœud transfer + `dead-transfer-ref` + `skill-without-transfer` (avertissement) + 5 tests.
- **CP7** — gate `v42:check` (22e) + ledger v42-transfer-ledger.json.
- **CP8** — hardening : `npm test` 1170, 22 gates, tsc 0, build OK, generate idempotent, graphe 0 bloquant ;
  docs (TRANSFER/PEDAGOGICAL/SPRINT-V42) + prompt V43. (Pas de nouvelle surface UI → pas de nouvelle
  validation navigateur ; UX des défis reportée V43.)

## Honnêteté (anti-greenwashing)
- Défis = **composition** du modèle assessment ; aucun `mastery-engine-v2`, aucune 2e source de vérité.
- **Aucun gonflage** : 0 leçon/exercice/mission ajoutés ; TRANSFER reste 16 questions ; 3 durcies, 4 KEEP.
- T5 exige pont + cross-domain + multi-étapes ; un domaine différent ne suffit pas.
- Score/niveau = **PROXY** ; jamais « maîtrisé ». Contextes d'infra/RAG/ML **SIMULÉS**.
- Trous **signalés** par le gate (algo/ds/jsts/secu/cloud sans défi) — dette V43 explicite, non masquée.
- `progress.json` gitignoré, baseline restaurée à l'identique.

## Métriques finales (`npm test`)
128 leçons · 238 exos · 42 missions · 45 playbooks · 16 évaluations · 5 capstones · **5 défis T5** ·
**7 misconceptions** · **22 gates** · **1170 tests** · tsc 0 · build OK · graphe 0 bloquant.

## Verdict : **FORT** sur la substance transfert · **MOYEN** sur la couverture (5 compétences structurantes
sans défi). Voir docs/PEDAGOGICAL-AUDIT-V42.md et docs/TRANSFER-AUDIT-V42.md.

---

# PROMPT DE LANCEMENT — SPRINT V43

Copier-coller le bloc ci-dessous pour démarrer V43.

```
# SPRINT V43 — PRACTICE MASTERY & DELIBERATE PRACTICE

Tu reprends AI Career OS à la fin du Sprint V42. Plateforme STRICTEMENT LOCALE, mono-utilisateur, sans
auth/SaaS/réseau/DB distribuée. Priorité ABSOLUE : QUALITÉ PÉDAGOGIQUE.
Ordre : pédagogie/acquisition > qualité de la pratique > feedback > progression de difficulté >
réutilisation > preuves > qualité technique > quantité > UI. Règle d'or : UNE SEULE SOURCE DE VÉRITÉ.
Ordre d'action : RÉUTILISER → RELIER → DURCIR → (ÉTENDRE/SPLIT) → CRÉER. NO_COMMIT documenté si rien à
changer. Rapports destinés à l'utilisateur : EN FRANÇAIS. Commande de comptage canonique : npm test.

## Thème
Pratique délibérée : qualité et couverture des ~238 exercices par compétence, qualité des feedbacks,
progression de difficulté, répétition espacée vs pratique ciblée, remplacement/suppression des exercices
médiocres. Le périmètre exact est DÉRIVÉ de l'audit V42 (dette signalée : défis de transfert manquants
pour algo/ds/jsts/secu/cloud ; UX des défis ; familles de variantes).

## Constat de départ imposé (à vérifier au CP0, ne pas présumer)
Existent : exercises (modèle exercise.mjs + runtime réel), assessments, capstones, transfer-challenges,
misconceptions, skill-state/review/learning-experience, curriculum-graph, gates V26-V42. Le CP0 doit
CARTOGRAPHIER la couverture d'exercices par compétence prioritaire et la qualité des feedbacks AVANT d'en
créer. Ne pas dupliquer ; réutiliser le harnais d'exécution réel (runExercise).

## Contraintes spécifiques
- Aucun second moteur d'exécution/notation ; réutiliser exercise.mjs + le runtime réel (sandbox gitignoré).
- Un exercice médiocre est RÉÉCRIT ou SUPPRIMÉ (avec mise à jour des refs), pas empilé.
- Feedback = ce qui est correct, où le raisonnement diverge, l'indice minimal, la ressource — sans divulguer
  toute la solution.
- « Pratique adaptative déterministe » = règles explicables (réutiliser learning-experience/misconceptions),
  jamais une IA.
- Contrats existants (starter fautif, référence verte, ≥1 public + ≥1 privé, call-equals sans flottant,
  SIMULATION) préservés ; sandbox gitignoré ; progress.json restauré.
- Gate v43:check si nouveau contrat ; sinon s'appuyer sur les tests.

## Déroulé (CP0 → CPn)
- CP0 : audit READ-ONLY (git, baseline via npm test/tsc/build/gates/graphe/counts ; couverture d'exercices
  par compétence prioritaire ; qualité feedback ; verdict RÉUTILISER/RELIER/DURCIR/ÉTENDRE/CRÉER). FR. AUCUN commit.
- CP1 : ADR/HSD/TSD-043 (modèle de pratique délibérée, feedback, progression, anti-second-moteur).
- CP2..CPk : durcir/remplacer les exercices faibles, combler les défis de transfert manquants (algo/ds/
  jsts/secu/cloud), relier misconceptions aux exercices, gate si besoin, tests.
- Avant-dernier CP : hardening complet (pipeline + navigateur 5 largeurs si UI touchée, MÊME commande npm test).
- Dernier CP : restore progress.json, cleanup, commits atomiques, push sur la branche désignée, synthèse
  française par dimensions + prompt V44 (dérivé de l'audit V43).
- Git : développer/pousser UNIQUEMENT sur claude/ai-career-os-saas-phfg49 ; pas de PR sauf demande ; pas de
  reset/rebase/force-push.

## Critères de réussite
Couverture d'exercices améliorée sur les compétences prioritaires ; feedbacks de meilleure qualité ;
exercices médiocres traités ; défis de transfert manquants comblés ; aucune métrique inventée ; une seule
source de vérité ; tests/gates/build verts ou impossibilité documentée ; progress.json restauré ; Git propre.

Commence maintenant par CP0. Présente le rapport CP0. Puis, si l'état est sain et que V43 n'a pas déjà été
livré, poursuis automatiquement CP1 → dernier CP sans validation intermédiaire.
```
