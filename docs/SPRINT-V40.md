# SPRINT V40 — Professional Engineering Simulation & Integrated Capstones

> Local, mono-utilisateur, sans auth/SaaS/réseau. Priorité : **pédagogie > transfert > raisonnement
> d'ingénieur > cohérence parcours > réutilisation > preuves > qualité technique > quantité > UI.**
> Une seule source de vérité ; aucune fausse « IA adaptative » ni fausse infrastructure.

## Résultat en une phrase
V40 ajoute une couche de **simulation professionnelle** — 5 capstones multi-phases qui font raisonner sur
des incidents ambigus — **composée au-dessus des moteurs existants**, sans second moteur ni fausse infra.

## Décision structurante (CP0 → ADR-040)
Un capstone n'est PAS un nouveau moteur : c'est une composition. Le scoring réutilise `gradeQuestion`
(assessment), l'evidence calque `recordMissionCompletion`, la remédiation passe par
`skill-state`/`review`/le graphe. Nouveauté réelle = le **chaînage intégré** (phases de raisonnement +
artefacts signal/bruit) que ni les missions (orientées livrables) ni les assessments (questions isolées)
ne portaient.

## Livrables par checkpoint
- **CP0** — audit lecture seule ; baseline verte ; commande de comptage canonique fixée (`npm test`).
- **CP1** — ADR/HSD/TSD-040.
- **CP2** — `lib/capstone.mjs` (+ .d.ts, server), graphe étendu (`capstone`, `dead-capstone-ref`), gate
  `v40:check` (20e), `EVIDENCE_TYPES` += `capstone`.
- **CP3** — audit honnête des 16 questions TRANSFER V39 (8 solides, 7 near-transfer légers ; 0 mal
  étiquetée ; le transfert profond bascule vers les capstones).
- **CP4** — tests du modèle (13).
- **CP5-CP9** — 5 capstones : Backend/incident, Frontend/React/a11y, Cloud/K8s, Applied AI/RAG, Data/ML.
- **CP10** — boucle capstone→evidence→skill-state→remédiation + tests catalogue/graphe (17).
- **CP11** — playbook `rag-retrieval-regression` (manque révélé par le capstone RAG).
- **CP12** — UX `/capstones` + `/capstones/[id]`.
- **CP13** — walkthrough débutant→pro (aucune rupture bloquante).
- **CP14** — hardening (NO_COMMIT, vérification pure) : pipeline vert de bout en bout.
- **CP15** — audit académique + cette synthèse + prompt V41.

## Honnêteté (anti-greenwashing)
- Correction 100 % déterministe ; aucun LLM, aucune « IA adaptative ».
- Score de capstone = **PROXY** ; jamais « maîtrise prouvée » ni « mastered » automatique.
- Toutes les infrastructures (K8s, cloud, broker, RAG, ML) sont **SIMULÉES** et étiquetées.
- `progress.json` gitignoré, baseline capturée et restaurée à l'identique.
- Aucun gonflage : 0 leçon/exercice/mission ajoutés ; 1 seul playbook créé (justifié).

## Métriques finales (commande canonique `npm test`)
128 leçons · 238 exercices · 42 missions · **45 playbooks** · 16 évaluations · **5 capstones** ·
711 glossaire · **20 gates** · **1141 tests** · tsc 0 · build OK · graphe 0 bloquant · navigateur 21/21.

## Verdict : **FORT** (voir docs/PEDAGOGICAL-AUDIT-V40.md pour le détail par dimension et la dette restante).

---

# PROMPT DE LANCEMENT — SPRINT V41

Copier-coller le bloc ci-dessous pour démarrer V41.

```
# SPRINT V41 — LEARNING EXPERIENCE, PROGRESSION VISUELLE & GAMIFICATION FONDÉE SUR PREUVES

Tu travailles sur AI Career OS : plateforme d'apprentissage STRICTEMENT LOCALE, mono-utilisateur, sans
auth/SaaS/réseau/DB distribuée. Priorité ABSOLUE : QUALITÉ PÉDAGOGIQUE.
Ordre : pédagogie > motivation saine > cohérence parcours > réutilisation > preuves > qualité technique >
quantité > UI cosmétique. Règle d'or : UNE SEULE SOURCE DE VÉRITÉ. Ordre d'action : RÉUTILISER → RELIER →
DURCIR → (ÉTENDRE/SPLIT) → CRÉER. NO_COMMIT documenté si un checkpoint n'a rien à changer.
Rapports/audits/synthèses destinés à l'utilisateur : EN FRANÇAIS.

## Thème
Rendre l'expérience d'apprentissage plus lisible, plus motivante et plus ergonomique — SANS mécanique
addictive ni infantilisante, et SANS inventer de métrique. La progression, les compétences, les capstones
et les diagnostics existent déjà : V41 doit les RENDRE VISIBLES et EXPLOITABLES (carte de compétences,
progression visuelle, prochaines actions recommandées, récompenses fondées sur de VRAIES actions
pédagogiques), pas créer un système de points arbitraires.

## Constat de départ imposé (à vérifier au CP0, ne pas présumer)
Existent déjà : skill-state (états), review (révision), curriculum-graph, assessments (diagnostics),
capstones (evidence + remédiation), progress-store, pages /synthese /skills /revisions /diagnostics
/capstones /parcours. Le CP0 doit CARTOGRAPHIER ce qui joue déjà un rôle de « progression / feedback /
motivation » AVANT d'en créer. Le vrai apport V41 = la mise en récit visuelle et l'aide à la décision
(« que faire ensuite ? »), pas un moteur de gamification parallèle.

## Contraintes spécifiques (anti-dark-pattern)
- INTERDIT : XP arbitraires, badges vides, streaks culpabilisants, score de maîtrise inventé, notifications
  anxiogènes, mécaniques de rétention manipulatoires. Toute « récompense » doit correspondre à une action
  pédagogique réelle et vérifiable (leçon terminée, capstone réussi, diagnostic passé, révision honorée).
- Toute donnée affichée doit être DÉRIVÉE des moteurs existants (pas de nouvelle source de vérité, pas de
  duplication d'états dérivables).
- Si une capitalisation de capstone/diagnostic en progression est ajoutée, elle doit RÉUTILISER le flux
  d'evidence existant (opt-in, jamais d'écriture furtive) et respecter la sûreté de progress.json.
- Accessibilité (clavier, contraste, 375→1920) et honnêteté PREUVE/PROXY préservées.
- Gate `v41:check` structurel si un nouveau contenu/contrat est introduit ; sinon, s'appuyer sur les tests.

## Déroulé (CP0 → CPn)
- CP0 : audit READ-ONLY (git, baseline via `npm test`, tsc, build, gates, graphe, counts ; cartographie
  des surfaces de progression/feedback existantes ; verdict RÉUTILISER/RELIER/DURCIR/ÉTENDRE/CRÉER). FR.
- CP1 : ADR/HSD/TSD-041 (modèle d'expérience : « prochaines actions », carte de compétences, récompenses
  fondées sur preuves, stratégie anti-dark-pattern, réutilisation stricte).
- CP2..CPk : implémenter les vues/dérivations (réutiliser skill-state/review/graph/evidence), UX, gate si
  besoin, tests, ledger + audit.
- Avant-dernier CP : hardening (pipeline complet, navigateur 5 largeurs, avec la MÊME commande de comptage
  canonique `npm test`).
- Dernier CP : restore progress.json, cleanup, commits atomiques, push sur la branche désignée, synthèse
  française par dimensions + prompt V42 (thème dérivé de l'audit V41).
- Git : développer/pousser UNIQUEMENT sur `claude/ai-career-os-saas-phfg49` ; pas de PR sauf demande
  explicite ; pas de reset/rebase/force-push destructifs.

## Critères de réussite
Progression et compétences réellement plus lisibles ; « que faire ensuite » utile et dérivé des moteurs ;
aucune métrique inventée ; aucune mécanique addictive ; une seule source de vérité ; accessibilité et
honnêteté préservées ; tests/gates/build verts ou impossibilité documentée ; progress.json restauré ; Git
propre.

Commence maintenant par CP0. Présente le rapport CP0. Puis, si l'état est sain et que V41 n'a pas déjà été
livré, poursuis automatiquement CP1 → dernier CP sans validation intermédiaire.
```
