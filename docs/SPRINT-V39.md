# SPRINT V39 — Mastery Engine, évaluation de transfert & révisions adaptatives

> Local, mono-utilisateur, sans auth/SaaS/réseau. Priorité : **pédagogie > cohérence curriculaire >
> pratique > fiabilité > features > UI.** Une seule source de vérité ; aucune fausse « IA adaptative ».

## Résultat en une phrase
V39 comble le **seul trou authentique** identifié au CP0 — l'absence d'une couche d'ÉVALUATION à
taxonomie — en **réutilisant** les moteurs existants de maîtrise (`skill-state`) et de révision
(`review`) plutôt qu'en construisant un second moteur.

## Décision structurante (CP0 → ADR-039)
Le « Mastery Engine » et le « moteur de révision » demandés **existent déjà** :
`lib/skill-state.mjs` (5 états dérivés par règles), `lib/review.mjs` (SM-2 déterministe), pages
`/skills`, `/revisions`, `/synthese`. Construire un vocabulaire de maîtrise concurrent aurait créé une
seconde source de vérité. V39 **alimente** l'existant : une évaluation réussie devient une PREUVE que
`skill-state` consomme déjà.

## Livrables par checkpoint
- **CP0** — audit lecture seule : baseline verte, moteurs existants cartographiés, verdict densité des 4
  leçons V38 = **KEEP**.
- **CP1** — ADR-039 / HSD-039 / TSD-039.
- **CP2** — `lib/assessment.mjs` (+ `.d.ts`, `assessments-server.ts`) : modèle pur, taxonomie
  RECALL→TRANSFER, correction déterministe (mcq/multi/predict), pont preuve.
- **CP3** — catalogue `data/assessments/*.json` : **16 évaluations, 83 questions**.
- **CP4** — RELIER : `EVIDENCE_TYPES` += `assessment` ; intégration `skill-state` vérifiée.
- **CP5** — Curriculum Graph : nœud `assessment`, arêtes `ASSESSES`/`REMEDIATES`, anomalie bloquante
  `dead-assessment-ref` ; 0 bloquant, 0 warning ajouté.
- **CP6** — gate `v39:check` câblé dans `gates:active` (19e gate).
- **CP7** — UX : page `/diagnostics` (correction locale, restitution par niveau, remédiation,
  frontière PREUVE/PROXY) + reliures `/skills` et `/revisions`.
- **CP8** — 4 leçons V38 : verdict **KEEP** + ligne « Auto-évaluation » (reliure au diagnostic).
- **CP9** — 31 tests V39 (modèle, catalogue, graphe, intégration skill-state, ledger).
- **CP10** — `docs/architecture/v39-pedagogy-audit.json` + `docs/PEDAGOGICAL-AUDIT-V39.md`.
- **CP11** — vérif complète : generate idempotent, 1112 tests, 19 gates, tsc 0, build OK.
- **CP12** — validation navigateur Playwright : **26/26** (5 pages × 5 largeurs + 1 parcours interactif),
  overflow ≤ 2px, 0 erreur console.
- **CP13** — restauration `progress.json`, nettoyage, commits, push, synthèse + prompt V40.

## Honnêteté (anti-greenwashing)
- Correction 100 % **déterministe** (comparaison de données) ; aucun LLM, aucune « IA adaptative ».
- Un score de diagnostic est un **PROXY**, jamais une preuve de maîtrise ; rappelé dans l'UX.
- Domaines distribués/cloud/LLM **SIMULÉS** et étiquetés ; aucun vrai broker/cluster.
- `progress.json` gitignoré, baseline capturée et restaurée à l'identique.
- amélioration `evaluation` 3→4 des 4 leçons **justifiée** (boucle évaluer→remédier fermée), pas cosmétique.

## Métriques finales
128 leçons · 238 exercices · 42 missions · 44 playbooks · **16 évaluations (nouvelles)** · 711 glossaire ·
**19 gates** · **1112 tests** · tsc 0 · build OK · graphe 0 bloquant.

---

# PROMPT DE LANCEMENT — SPRINT V40

Copier-coller le bloc ci-dessous pour démarrer V40.

```
# SPRINT V40 — PROFESSIONAL ENGINEERING SIMULATION & INTEGRATED CAPSTONES

Tu es sur AI Career OS : plateforme d'apprentissage STRICTEMENT LOCALE, mono-utilisateur, sans
auth/SaaS/réseau/DB distribuée. Priorité ABSOLUE : QUALITÉ PÉDAGOGIQUE.
Ordre : pédagogie > cohérence curriculaire > pratique > fiabilité > features > UI.
Règle d'or : UNE SEULE SOURCE DE VÉRITÉ. Ordre d'action : RÉUTILISER → RELIER → DURCIR →
(ÉTENDRE/SPLIT) → CRÉER. « Une excellente leçon vaut mieux que cinq superficielles ». Jamais gonfler
les compteurs. NO_COMMIT documenté (jamais de commit vide) si un checkpoint n'a rien à changer.
Interdit : faux LLM/ML/broker/DB distribuée exécutés (étiqueter SIMULATION) ; second
moteur/catalogue/curriculum/graphe/gate concurrent ; greenwashing ; prétendre avoir lancé un test que
l'environnement ne peut pas exécuter. Séparer honnêtement RÉEL / SIMULÉ / HEURISTIQUE / NON TESTÉ.
Rapports/audits/synthèses destinés à l'utilisateur : EN FRANÇAIS.

## Thème
Faire converger tout l'acquis (leçons de fond, exercices déterministes, missions, playbooks,
diagnostics V39, moteurs de maîtrise/révision) vers des **capstones intégrés** et une **simulation de
travail d'ingénieur professionnel** : des parcours d'application longs et réalistes qui EXERCENT et
ÉVALUENT plusieurs compétences ensemble, plutôt que des micro-tâches isolées. Objectif : rapprocher
l'apprenant d'une situation d'emploi réelle (recevoir un besoin flou → concevoir → implémenter par
étapes → tester → documenter → présenter → réviser).

## Constat de départ imposé (à vérifier au CP0, ne pas présumer)
Existent déjà et NE DOIVENT PAS être dupliqués : les missions (`data/missions/*.json`), les playbooks
(`data/playbooks/*.json`), les exercices exécutables (`data/exercises`), les diagnostics V39
(`data/assessments`), les moteurs `skill-state`/`review`/`curriculum-graph`, les capstones/projets
existants (`curriculum/projects`, jours capstone). Le CP0 doit CARTOGRAPHIER ce qui joue déjà le rôle
de « capstone / simulation professionnelle » AVANT d'en créer. Le vrai apport V40 doit être le CHAÎNAGE
intégré (multi-compétences, multi-étapes) et son évaluation honnête — pas un énième type d'artefact
isolé.

## Contraintes spécifiques
- Toute « simulation professionnelle » reste LOCALE et DÉTERMINISTE ou explicitement HEURISTIQUE ;
  aucune exécution réseau, aucun vrai service. Étiqueter SIMULATION sans ambiguïté.
- Un capstone intègre plusieurs compétences existantes et se relie au Curriculum Graph
  (REQUIRES/PRACTICES/ASSESSES/REMEDIATES) et aux moteurs de maîtrise/révision — sans second moteur.
- L'évaluation d'un capstone doit distinguer ce qui est VÉRIFIÉ automatiquement (tests déterministes)
  de ce qui relève d'une AUTO-ÉVALUATION guidée par rubrique (proxy) — frontière explicite.
- Accessibilité néophyte préservée : un capstone commence par un problème concret, jamais par du jargon.
- Gate `v40:check` structurel (jamais profondeur par longueur), câblé dans `gates:active`.
- progress.json : gitignoré ; capturer la baseline au CP0 (git hash-object), restaurer à l'identique,
  ne jamais committer.

## Déroulé (CP0 → CP13)
- CP0 : audit READ-ONLY (git, baseline tests/tsc/build/gates/generate/graphe/counts ; cartographie
  capstones/missions/projets existants ; verdict RÉUTILISER/RELIER/DURCIR/ÉTENDRE/CRÉER). Rapport FR.
- CP1 : ADR/HSD/TSD-040 (conception du dispositif capstone intégré + simulation).
- CP2→CP10 : implémenter le modèle/chaînage capstone (réutiliser missions/exercices/diagnostics),
  relier au graphe et aux moteurs, UX apprenant, gate v40, tests, ledger + audit.
- CP11 : vérif complète. CP12 : validation navigateur (5 largeurs). CP13 : restore progress.json,
  cleanup, commits atomiques, push sur la branche désignée, synthèse française finale + prompt V41
  (thème dérivé de l'audit V40).
- Git : développer et pousser UNIQUEMENT sur `claude/ai-career-os-saas-phfg49` ; pas de PR sauf demande
  explicite ; pas de reset/rebase/force-push destructifs.

Commence maintenant par CP0. Présente le rapport CP0. Puis poursuis automatiquement CP1 → CP13.
```
