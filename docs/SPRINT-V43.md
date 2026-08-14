# SPRINT V43 — Practice Mastery & Deliberate Practice

> Local, mono-utilisateur, sans auth/SaaS/réseau. Priorité : **pédagogie/acquisition > qualité de la
> pratique > feedback > progression > réutilisation > preuves > qualité technique > quantité > UI.** Une
> seule source de vérité, sans fausse « IA », sans infra réelle.

## Résultat en une phrase
V43 rend l'état réel de la pratique **visible et mesurable par compétence** (matrice de couverture dérivée),
relie les erreurs à des **misconceptions**, et **comble les trous de transfert prioritaires** — en
composant l'existant, sans second moteur ni gonflage.

## Décision structurante (CP0 → ADR-043)
L'audit du corpus (238 exos, tous exécutables) révèle 3 trous réels : **0 feedback diagnostique**, **aucune
vue de couverture**, difficulté peu typée. Le levier honnête est un **read-model dérivé** (matrice de
couverture + feedback via misconceptions) + le **comblement transfert ciblé**, pas une réécriture de masse
(238 hints) ni une taxonomie P0-P8 concurrente (la difficulté et T0-T5 existantes suffisent).

## Livrables par checkpoint (7, consolidés depuis les 15 du prompt — l'audit fait foi)
- **CP0** — audit lecture seule ; baseline verte (1170 tests) ; audit corpus Niveau 1 ; verdict.
- **CP1** — ADR/HSD/TSD-043.
- **CP2** — `lib/practice-coverage.mjs` (matrice 7 dimensions + readiness + Labs comptés) + 7 tests.
- **CP3** — feedback diagnostique exercices↔misconceptions + 4 tests.
- **CP4** — 4 défis de transfert T5 comblant algo/ds, jsts, secu, cloud.
- **CP5** — gate `v43:check` (couverture, projection, no second source) — 23e gate.
- **CP6** — `PRACTICE-AUDIT-V43.md` (corpus + matrice + professional-readiness honnête).
- **CP7** — hardening : `npm test` 1181, 23 gates, tsc 0, build OK, generate idempotent ; docs
  PEDAGOGICAL/SPRINT-V43 + prompt V44. (Aucune surface UI nouvelle → pas de validation navigateur.)

## Honnêteté (anti-greenwashing)
- Read-model **dérivé** (projection fine→programme documentée + Labs) ; **aucune 2e source de vérité**.
- **Aucun gonflage** : 0 leçon/exercice standard ajoutés ; readiness **jamais** dérivée du volume.
- Matrice **honnête** : `not-ready` nuancé (couvert-sans-code vs réellement mince) ; trous réels
  (dl/agents/autonomy/patterns/comm) **nommés**, pas masqués.
- Transfert : 9 défis T5 ; plus aucun `skill-without-transfer` sur les 5 compétences ciblées.
- Score/readiness = **PROXY** ; contextes d'infra/RAG/ML **SIMULÉS** ; `progress.json` restauré à l'identique.

## Métriques finales (`npm test`)
128 leçons · 238 exos · 42 missions · 45 playbooks · 16 évaluations · 5 capstones · **9 défis T5** ·
7 misconceptions · **23 gates** · **1181 tests** · tsc 0 · build OK · graphe 0 bloquant · 8 strong-junior.

## Verdict : **FORT** (visibilité, transfert, honnêteté) · **MOYEN** (profondeur data/ML, feedback inline).
Voir docs/PEDAGOGICAL-AUDIT-V43.md et docs/PRACTICE-AUDIT-V43.md.

---

# PROMPT DE LANCEMENT — SPRINT V44

Copier-coller le bloc ci-dessous pour démarrer V44.

```
# SPRINT V44 — CURRICULUM MASTERY AUDIT & PROFESSIONAL READINESS

Tu reprends AI Career OS à la fin du Sprint V43. Plateforme STRICTEMENT LOCALE, mono-utilisateur, sans
auth/SaaS/réseau/DB distribuée. Priorité ABSOLUE : QUALITÉ PÉDAGOGIQUE.
Ordre : pédagogie/acquisition > preuve de compétence > transfert > cohérence parcours > réutilisation >
qualité technique > quantité > UI. Règle d'or : UNE SEULE SOURCE DE VÉRITÉ. Ordre d'action : RÉUTILISER →
RELIER → DURCIR → (ÉTENDRE/SPLIT) → CRÉER. NO_COMMIT documenté si rien à changer. Rapports en FRANÇAIS.
Commande de comptage canonique : npm test.

## Thème
Audit TRANSVERSAL du curriculum, compétence par compétence, pour répondre honnêtement : « Si l'apprenant
suit réellement ce parcours et réussit les preuves demandées, quelles compétences possède-t-il vraiment,
et jusqu'à quel niveau professionnel ? » Le périmètre exact est DÉRIVÉ de l'audit V43 (matrice de
couverture : 8 strong-junior, plusieurs not-ready dont des trous réels dl/agents/autonomy/patterns/comm et
des compétences couvertes-sans-code sql/ml/rag/evalia/llm).

## Constat de départ imposé (à vérifier au CP0, ne pas présumer)
Existent : practice-coverage (matrice de couverture dérivée), skill-state/review/learning-experience,
assessments/capstones/transfer-challenges/misconceptions, curriculum-graph, gates V26-V43. Le CP0 doit
RÉUTILISER la matrice de couverture V43 comme point de départ, et NE PAS reconstruire un second système
d'audit. Vérifier la cohérence chaîne concept→…→preuve par compétence prioritaire.

## Contraintes spécifiques
- Aucun second moteur/catalogue/état concurrent ; réutiliser practice-coverage + skill-state + evidence.
- Un verdict de professional-readiness doit être DÉRIVÉ de preuves réelles (pas du volume), et honnête
  (not-ready nuancé : couvert-sans-code vs mince).
- Traiter au mérite les trous réels signalés (dl/agents/autonomy/patterns/comm) : créer/relier seulement
  ce qui comble un vrai manque, sans gonfler.
- Domaines d'infra/LLM/ML = SIMULATION étiquetée ; score/readiness = PROXY ; jamais « maîtrisé » sur un score.
- progress.json gitignoré : baseline capturée au CP0, restaurée à l'identique.
- Gate v44:check si nouveau contrat ; sinon s'appuyer sur les tests.

## Déroulé (CP0 → CPn)
- CP0 : audit READ-ONLY (git, baseline npm test/tsc/build/gates/graphe/counts ; réutiliser la matrice de
  couverture V43 ; identifier par compétence prioritaire les ruptures de chaîne concept→preuve ; verdict
  RÉUTILISER/RELIER/DURCIR/ÉTENDRE/CRÉER). Rapport FR. AUCUN commit.
- CP1 : ADR/HSD/TSD-044 (modèle d'audit de maîtrise transversal, professional-readiness dérivée, anti-second-moteur).
- CP2..CPk : construire le read-model d'audit transversal (réutiliser practice-coverage), combler au mérite
  les trous réels, relier preuves↔readiness, gate si besoin, tests, ledger + audit.
- Avant-dernier CP : hardening complet (pipeline + navigateur 5 largeurs si UI touchée, MÊME commande npm test).
- Dernier CP : restore progress.json, cleanup, commits atomiques, push sur la branche désignée, synthèse
  française par dimensions + prompt V45 (dérivé de l'audit V44).
- Git : développer/pousser UNIQUEMENT sur claude/ai-career-os-saas-phfg49 ; pas de PR sauf demande ; pas de
  reset/rebase/force-push.

## Critères de réussite
Pour une sélection de compétences prioritaires, la chaîne concept→pratique→autonomie→feedback→diagnostic→
transfert→pro→preuve est mesurée et son verdict de readiness est crédible et honnête ; les trous restants
sont nommés et priorisés ; aucune métrique inventée ; une seule source de vérité ; tests/gates/build verts
ou impossibilité documentée ; progress.json restauré ; Git propre.

Commence maintenant par CP0. Présente le rapport CP0. Puis, si l'état est sain et que V44 n'a pas déjà été
livré, poursuis automatiquement CP1 → dernier CP sans validation intermédiaire.
```
