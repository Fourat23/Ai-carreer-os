# Sprint V32 — Applied AI II : Agents, Tool Use & AI Safety + Curriculum Graph II + Pedagogical Hardening V

Rapport de sprint (français). Sprint d'abord PÉDAGOGIQUE : combler la rupture
théorie→pratique→preuve de la chaîne agents/sûreté, et étendre le Curriculum Graph pour
détecter davantage de ruptures. Aucune course à la quantité, aucune refonte UI, aucun
second moteur, aucun vrai LLM/vector DB/réseau.

## 1. Titre & objectif
Rendre la chaîne « intention → plan → choix d'outil → validation d'arguments → action →
observation → état → décision → terminaison → HITL → sécurité → évaluation » réellement
FRANCHISSABLE par la pratique, et rendre ses ruptures DÉTECTABLES automatiquement.

## 2. État initial audité (CP0, HEAD 54f5d04)
110 leçons · 203 exercices · 40 missions · 31 playbooks · 661 glossaire · 6 parcours + 3
annoncés · 983 tests · 11 gates actives. Working tree propre, local == origin, aucun
serveur résiduel. Dette centrale mesurée : la chaîne agents/sûreté (agents-fundamentals,
agent-workflows-orchestration, prompt-engineering, prompt-injection-defense) avait une
théorie forte (h9) mais **0 pratique exécutable** ; **0 playbook IA** sur 31.

## 3. Divergence avec le prompt V32
Aucune divergence structurelle. Le prompt supposait ~983 tests / 11 gates : conforme.

## 4. Anomalie 961 vs 965 — résolue
Aucun fichier de test existant modifié depuis `b4f6db3` (fin V30) ; 4 fichiers ajoutés en
V31 totalisant 22 tests. **983 − 22 = 961 = vrai total fin V30**. Le « 965 » du tableau
final V31 était le compte intra-V31 après CP2 (961 + 4 tests de pédagogie), mal étiqueté
« base V30 » ; le vrai delta V30→V31 est **+22**, pas +18. Erreur de rapport seulement,
aucune réécriture d'historique.

## 5. Décisions ADR/HSD/TSD-032 (CP1)
ADR-032 : pratique déterministe des mécanismes d'agent (jamais de faux LLM) ; Curriculum
Graph étendu comme read-model dérivé (diagnostics d'ordre en warning, jamais bloquants) ;
dette ML classique reportée V33 (hors thème). HSD-032 : chaîne agentique, modèles mentaux,
maths honnêtes, frontière réel/simulé. TSD-032 : gate v32, ledger, 4 diagnostics de graphe.

## 6. Gate v32:check + plan + ledger (CP2)
Gate structurel ajouté (12 gates actives). Plan v32 : hardenedLegacy = les 4 leçons
agent/sûreté ; graphe de prérequis acyclique.

## 7. Pratique agentique déterministe (CP3–CP6)
6 exercices node-js, contrat vérifié par exécution, étiquetés SIMULATION :
- `agent-tool-select` (choix d'outil par capacité) ;
- `agent-state-transition` (machine à états, transition illégale → FAILED) ;
- `agent-loop-detect` (budget dépassé / boucle A,B,A,B) ;
- `agent-tool-validate` (arguments : missing/type/enum/inconnu) ;
- `agent-hitl-decision` (escalade humaine : irréversible/sensible/coûteux/confiance) ;
- `agent-retry-policy` (retry/fail/ask-human selon le type d'erreur).
Chaque starter est FAUX, référence 100 % verte, tests privés non exposés. Câblage :
les 4 leçons du périmètre passent `critical` avec practiceRefs résolus (dont réutilisation
de prompt-injection-classify et rag-structured-validate, sans doublon).

## 8. Audit des exercices (CP7)
209 exercices au total (203 + 6). Les 6 nouveaux + 2 réutilisés sont tous référencés (0
orphelin), distincts (aucun doublon), dans la cible 4-8. Aucun trou résiduel → pas de
commit CP7 (conforme à « créer uniquement les trous réels »).

## 9. Curriculum Graph II (CP8)
Extension pure et dérivée : capture des NIVEAUX de leçon et de la reachability des
exercices. 3 nouveaux diagnostics — `advanced-before-prerequisite` (warning),
`concept-without-foundation` (warning), `orphan-practice` (info) — jamais bloquants.
`skill-never-evaluated` volontairement non implémenté (redondant, bruit trompeur),
documenté. Sur les vraies données : **0 bloquant, 0 orphan-practice, 15 warnings honnêtes**.

## 10. Playbooks IA + cohérence (CP9)
5 playbooks « Que faire dans ce cas ? » (agent-runaway-loop, agent-dangerous-tool-call,
rag-indirect-injection, llm-structured-output-break, llm-cost-spike ; 36 au total).
`v32-track-coherence.md` : chaîne agentique reliée, parcours audités (aucun nouveau
parcours, pas de greenwashing). `tests/v32-e2e.test.mjs` (7 tests).

## 11. Glossaire (CP10)
+13 termes (function calling, tool schema, agent state machine, termination condition,
idempotency key, backoff, jitter, structured output, schema validation, context poisoning,
untrusted context, prompt regression, precision@k ; 674 au total). « idempotence » non
ajoutée (déjà présente via dev-idempotency).

## 12. Métriques avant / après

| | Fin V31 | Fin V32 |
| --- | --- | --- |
| Leçons | 110 | 110 |
| Exercices | 203 | **209** (+6 agent) |
| Missions | 40 | 40 |
| Playbooks | 31 | **36** (+5 IA) |
| Glossaire | 661 | **674** (+13) |
| Tests | 983 | **1001** (+18) |
| Gates actives | 11 | **12** (+v32:check) |
| Exercices agent | 0 | 6 |
| Playbooks IA | 0 | 5 |
| Diagnostics de graphe | 5 | 8 |

## 13. Curriculum Graph avant/après
Avant : 5 types d'anomalies (prereq-cycle, dead-prereq, dead-practiceref,
concept-not-practiced, orphan-lesson). Après : **8 types** (+advanced-before-prerequisite,
+concept-without-foundation, +orphan-practice). 0 bloquant sur le corpus.

## 14. Validations réellement réalisées
generate idempotent (days-dirty=0), v32:check vert (4 critiques), 12 gates actives vertes,
1001 tests, tsc --noEmit OK, next build OK, validation navigateur 375/768/1024/1440/1920
(6 pages, 0 erreur console, 0 débordement horizontal), aucun serveur résiduel.

## 15. Validations NON réalisées
Aucun test d'accessibilité automatisé (axe) exécuté — non prétendu. Aucun test de charge.
Aucune interaction utilisateur simulée au-delà du rendu (les labs sont validés par le
contrat d'exécution des exercices, pas par pilotage UI).

## 16. Réel vs simulé
RÉEL : tout le calcul (sélection, transitions, détection de boucle, validation, escalade,
tri d'erreurs), tests, graphe. SIMULÉ (étiqueté) : ce qu'un modèle/outil externe
fournirait (réponses, arguments, erreurs) — donné en entrée, jamais exécuté.

## 17. Sécurité / anti-fuite
Aucun eval/exec/shell, aucun secret, aucun test privé exposé (vérifié par contrat). Les
playbooks n'exposent que des valeurs factices.

## 18. Données / progress.json
Baseline capturée au CP0 (blob `323604021055588a9528a86875f36598dbdc7758`), restaurée en
fin de sprint. Gitignoré, jamais commité.

## 19. Dette restante (P0/P1/P2)
- P1 : ML classique (feature-engineering, scikit-learn, neural-networks, transformers) +
  LLMOps (llm-cost-optimization, llm-observability) — hors thème V32, cible V33.
- P2 : warnings Curriculum Graph (couverture de prérequis) documentés, non bloquants.

## 20. Limites honnêtes
Le Curriculum Graph juge connectivité et ordre, pas la profondeur. La rubrique reste un
proxy calibré, pas un test utilisateur. Les warnings du graphe sont des signaux, pas des
verdicts.

## 21. État Git final
Branche `claude/ai-career-os-saas-phfg49`. Commits CP1→CP11 atomiques, poussés. local ==
origin, working tree propre, aucun serveur/workspace résiduel.

## 22. Résumé avant → après
Une chaîne agents/sûreté qui n'était que THÉORIQUE devient PRATICABLE (6 exercices reliés,
4 leçons critiques), outillée pour l'incident (5 playbooks IA), et GARDÉE par un Curriculum
Graph enrichi (8 diagnostics). La qualité prime sur la quantité : 110 leçons inchangées.

---

## 23. Prompt de reprise V33
Voir ci-dessous. **Ne pas démarrer V33 dans cette session.**

---

# Prompt de lancement — Sprint V33 (à démarrer PLUS TARD, PAS maintenant)

> Ce prompt clôt V32. **Ne démarre pas V33 dans cette session.** Rédigé pour être collé tel
> quel au lancement du sprint suivant.

Reprends **AI Career OS** pour le **Sprint V33 — « Curriculum Completion & Pedagogical
Hardening VI : ML classique, LLMOps & couverture du graphe de prérequis »**.

**IMPORTANT — travaille sur l'état RÉEL du dépôt.** Ne suppose jamais que ce résumé V32
correspond encore au repository. Commence par un **CP0 strictement en lecture seule** :
audite l'état réel (git, tests, build, gates, leçons, exercices, missions, playbooks,
glossaire, parcours, Curriculum Graph, serveurs résiduels, baseline progress.json) et
présente un **rapport d'audit CP0 en français AVANT toute implémentation**. Si V33 est
déjà (partiellement) livré, NE RECOMMENCE RIEN : identifie les commits existants et reprends
au bon endroit.

**Langue** : tous les rapports, audits, synthèses et le prompt V34 final en **français**.

**Priorité (inchangée)** : QUALITÉ PÉDAGOGIQUE > cohérence des parcours > compréhension
néophyte > théorie→pratique→compétence→preuve > exactitude technique > fonctionnalités/UI.
*Une excellente leçon vaut mieux que cinq superficielles. Ne maximise artificiellement rien.
L'audit fait foi.* Pas de refonte UI/UX globale.

**Critère néophyte** : situation → intuition → vocabulaire → modèle mental → mécanisme →
formalisation → exemple → pratique → cas métier → limites → synthèse. Pour l'IA/ML : **maths
honnêtes** (intuition avant formule) et **frontière réel/simulé explicite** — jamais de faux
LLM/embedding/vector DB/entraînement/réseau.

**État attendu (à VÉRIFIER)** : branche `claude/ai-career-os-saas-phfg49`, HEAD final V32,
~110 leçons, ~209 exercices, 40 missions, ~36 playbooks, ~674 glossaire, 12 gates actives,
~1001 tests. Curriculum Graph II (`lib/curriculum-graph.mjs`) : 8 diagnostics, 0 bloquant,
15 warnings documentés.

**Objectif central V33 — résorber la dette pédagogique restante (l'audit CP0 fait foi) :**
de façon ADDITIVE, durcir au standard actuel (on-ramp, prérequis rédigés, modèle mental,
pratique reliée) un sous-ensemble PRIORITAIRE de :
- **ML classique** : `feature-engineering`, `scikit-learn-workflow`, `neural-networks`,
  `transformers` (h7 aujourd'hui, sans on-ramp/prérequis/pratique) ;
- **LLMOps** : `llm-cost-optimization`, `llm-observability`.
Choisir un sous-ensemble réellement excellent ; documenter le reste. Créer des exercices de
RAISONNEMENT déterministes seulement pour un trou réel (ex. choix de features, matrice de
confusion, calcul de coût/latence) — jamais de fausse exécution de modèle.

**Objectif secondaire V33 — couverture du graphe de prérequis :** résorber les warnings
`concept-without-foundation` et `advanced-before-prerequisite` en déclarant les prérequis
manquants dans un plan (v33-lessons-plan.json), et le warning `concept-not-practiced`
(skill:patterns) si un exercice pertinent existe déjà. Objectif : réduire le nombre de
warnings du Curriculum Graph, mesuré avant/après. Étendre les diagnostics du graphe
uniquement si un nouveau mode de rupture réel apparaît.

**Contraintes d'architecture (inchangées)** : local, mono-utilisateur, sans auth/SaaS/
réseau. Pas de second moteur/catalogue/curriculum/runtime/base. Réutiliser
`lib/curriculum-graph.mjs` comme AUDITEUR (jamais source de vérité). `progress.json`
sauvegardé puis restauré (gitignoré, jamais commité). Aucun secret, aucune fuite de
solution/test privé. Pas de librairie UI, pas de refonte globale.

**Gates** : garder `v26→v32:check` **actifs**. Nouveau contrat structurel → `v33:check`
ciblé et testé. Attention aux faux positifs du scan d'authoring (`à compléter`, `TODO`,
`XXX`/`useXxx`) dans la prose — reformuler la prose, jamais affaiblir le gate.

**Checkpoints atomiques** CP0→CP11 (audit → design ADR/HSD/TSD → implémentation → tests →
tsc → build → validation navigateur → restauration progress.json → cleanup → commit →
push), un commit par CP réellement terminé, pas de commit vide.

**CP11 (obligatoire, quality gate pédagogique)** : ré-audit (A) leçons V33, (B) échantillon
V30–V32, (C) anciennes non modifiées de plusieurs époques, (D) walkthroughs néophyte (dont
une chaîne ML classique complète) ; matrice P0→P3 dans `docs/PEDAGOGICAL-AUDIT-V33.md` ;
faire tourner l'audit du Curriculum Graph et confirmer 0 bloquant + documenter l'évolution
des warnings ; append du **prompt V34** à la fin de `SPRINT-V33.md` **sans démarrer V34**.

**Critères de refus** : remplissage, généralités, jargon non introduit, fausse profondeur,
gonflage de scores, longueur prise pour de la qualité, fausse exécution IA présentée comme
réelle, leçon/exercice créé sans besoin réel.

**Livrable final** : `docs/SPRINT-V33.md` (rapport complet) + synthèse française distinguant
existant / ajouté / corrigé / testé / non testé / simulé / insuffisant, chiffres avant/après,
dette restante P0/P1/P2, HEAD final, état Git.

**Commence maintenant par CP0. N'implémente rien avant d'avoir présenté le rapport CP0.**
