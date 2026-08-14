# SPRINT V41 — Learning Experience, Evidence-Based Progression & Professional Gamification

> Local, mono-utilisateur, sans auth/SaaS/réseau. Priorité : **pédagogie > compréhension de sa progression
> > cohérence parcours > visibilité des preuves > next best action > UX > esthétique > gamification.**
> Une seule source de vérité ; aucune XP arbitraire ni fausse « IA ».

## Résultat en une phrase
V41 transforme les briques pédagogiques existantes en une **expérience lisible et explicable** — pourquoi
cet état, quoi faire ensuite, d'où vient la progression — via **un seul read-model dérivé**, sans second
moteur ni gamification arbitraire.

## Décision structurante (CP0 → ADR-041)
Les données existent, rien ne les composait en réponses actionnables. V41 crée **un unique module PUR
dérivé** (`lib/learning-experience.mjs`) qui lit skill-state/evidence/review et produit
`explainSkillState` / `nextBestActions` / `evidenceTimeline` / `milestones`. **Interdits** : `xp.json`,
`achievements.json`, `progression-v2`, second store. Les états restent `SKILL_STATES`.

## Livrables par checkpoint (7, consolidés depuis les 15 du prompt — l'audit fait foi)
- **CP0** — audit lecture seule ; baseline verte (1141 tests) ; verdict : le manque est de la
  composition/explicabilité, pas du contenu.
- **CP1** — ADR/HSD/TSD-041 + Visual Language Contract léger (réutilise les primitives existantes).
- **CP2** — `lib/learning-experience.mjs` (+ .d.ts) + 7 tests (explicabilité, priorité, timeline,
  milestones, garde-fou anti-XP).
- **CP3** — gate `v41:check` (anti-source-concurrente, explicabilité raison+preuve, anti-XP), 21e gate.
- **CP4** — `/skills` : « pourquoi cet état ? » + prochaine action.
- **CP5** — `/synthese` : jalons fondés preuves + timeline de preuves.
- **CP6** — `/` : bloc « Que faire ensuite » (≤4 actions dérivées).
- **CP7** — hardening : `npm test` 1148, 21 gates, tsc 0, build OK, navigateur 25/25 (5 largeurs),
  restore progress.json, docs (SPRINT/PEDAGOGICAL/UX-AUDIT-V41) + prompt V42.

## Honnêteté (anti-greenwashing, anti-AI-slop)
- Read-model **dérivé**, aucune vérité propre ; états ∈ `SKILL_STATES` ; aucune XP/badge/streak (gate + test).
- Jalons = **faits pédagogiques reliés à une preuve** ; sinon ils n'apparaissent pas.
- Surfaçage **sobre** (listes/lignes sémantiques, pas de card-grid clonée, pas de gradient/halo/emoji déco).
- Frontière PROXY rappelée ; `progress.json` gitignoré, baseline restaurée à l'identique.
- **Non fait, assumé et documenté** (dette V42) : capitalisation opt-in preuve, skill-map graphique,
  roadmap /parcours, design system étendu, audit axe-core.

## Métriques finales (`npm test`)
128 leçons · 238 exos · 42 missions · 45 playbooks · 16 évaluations · 5 capstones · **21 gates** ·
**1148 tests** · tsc 0 · build OK · graphe 0 bloquant · navigateur 25/25.

## Verdict : **FORT** sur la substance pédagogique ; **MOYEN** sur l'ampleur visuelle (bornée par choix,
voir docs/UX-AUDIT-V41.md et docs/PEDAGOGICAL-AUDIT-V41.md).

---

# PROMPT DE LANCEMENT — SPRINT V42

Copier-coller le bloc ci-dessous pour démarrer V42.

```
# SPRINT V42 — DEEP TRANSFER, PROBLEM VARIABILITY & ACADEMIC CURRICULUM HARDENING VIII

Tu reprends AI Career OS à la fin du Sprint V41. Plateforme STRICTEMENT LOCALE, mono-utilisateur, sans
auth/SaaS/réseau/DB distribuée. Priorité ABSOLUE : QUALITÉ PÉDAGOGIQUE.
Ordre : pédagogie > transfert profond > robustesse du raisonnement > cohérence parcours > réutilisation >
preuves > qualité technique > quantité > UI. Règle d'or : UNE SEULE SOURCE DE VÉRITÉ. Ordre d'action :
RÉUTILISER → RELIER → DURCIR → (ÉTENDRE/SPLIT) → CRÉER. NO_COMMIT documenté si rien à changer.
Rapports/audits destinés à l'utilisateur : EN FRANÇAIS.

## Thème
Passer du near-transfer au TRANSFERT PROFOND et à la VARIABILITÉ des problèmes : plusieurs variantes d'un
même problème par compétence, contextes inconnus, capstones alternatifs, généralisation des diagnostics,
retrieval practice / interleaving / fading du guidage — sans inventer de métrique ni de second moteur.

## Constat de départ imposé (à vérifier au CP0, ne pas présumer)
Existent déjà : assessments (16, taxonomie RECALL→TRANSFER), capstones (5 multi-phases), learning-experience
(read-model), skill-state/review/graph, playbooks, missions. L'audit V40 a montré que le transfert reste
majoritairement NEAR (single-hop) ; l'audit V41 a montré une dette de variabilité (un scénario par domaine).
Le CP0 doit CARTOGRAPHIER la variabilité actuelle (combien de variantes par compétence/problème) AVANT d'en
créer, et auditer un nouveau sous-ensemble de leçons historiques (charge cognitive, retrieval practice,
fading).

## Contraintes spécifiques
- Toute nouvelle variante/diagnostic/capstone reste LOCAL et DÉTERMINISTE ou explicitement HEURISTIQUE ;
  domaines d'infra/LLM/ML = SIMULATION étiquetée.
- FAR-transfer = contexte réellement éloigné + plusieurs sauts de raisonnement, sans reprendre le patron ;
  ne jamais étiqueter « transfert » une reconnaissance d'analogie.
- Variabilité = mêmes objectifs pédagogiques, surfaces/contextes différents ; pas de duplication d'IDs.
- Réutiliser le modèle d'assessment et de capstone existants ; pas de troisième modèle concurrent.
- Mesure des proxys plus rigoureuse (documenter ce qui est proxy vs réel), sans sur-promettre.
- Gate `v42:check` structurel si un nouveau contrat est introduit ; sinon s'appuyer sur les tests.
- progress.json gitignoré : baseline capturée au CP0, restaurée à l'identique.

## Déroulé (CP0 → CPn)
- CP0 : audit READ-ONLY (git, baseline via `npm test`, tsc, build, gates, graphe, counts ; cartographie de
  la variabilité et du transfert réel ; audit d'un sous-ensemble de leçons historiques ; verdict
  RÉUTILISER/RELIER/DURCIR/ÉTENDRE/CRÉER). Rapport FR. AUCUN commit.
- CP1 : ADR/HSD/TSD-042 (modèle de variabilité + far-transfer, stratégie anti-second-moteur, fading).
- CP2..CPk : implémenter variantes de diagnostics/capstones (réutiliser les modèles), relier au graphe et
  au read-model, durcir les leçons auditées si nécessaire, gate si besoin, tests, ledger + audit.
- Avant-dernier CP : hardening complet (pipeline + navigateur 5 largeurs, MÊME commande `npm test`).
- Dernier CP : restore progress.json, cleanup, commits atomiques, push sur la branche désignée, synthèse
  française par dimensions + prompt V43 (dérivé de l'audit V42).
- Git : développer/pousser UNIQUEMENT sur `claude/ai-career-os-saas-phfg49` ; pas de PR sauf demande ; pas
  de reset/rebase/force-push.

## Critères de réussite
Variabilité réelle par compétence (plusieurs surfaces) ; au moins quelques items de FAR-transfer honnêtes ;
robustesse du raisonnement testée ; audit académique d'un sous-ensemble de leçons ; aucune métrique inventée ;
une seule source de vérité ; tests/gates/build verts ou impossibilité documentée ; progress.json restauré ;
Git propre.

Commence maintenant par CP0. Présente le rapport CP0. Puis, si l'état est sain et que V42 n'a pas déjà été
livré, poursuis automatiquement CP1 → dernier CP sans validation intermédiaire.
```
