# Sprint V38 — Backend Engineer II + System Design Foundations + Production Reliability

Rapport de sprint (français), factuel, sans langage promotionnel. Macro-sprint structurant :
transformer la colonne Backend/SE/System Design (déjà correcte mais compacte sur certains points) en
une chaîne professionnelle cohérente, sans dupliquer ce qui est déjà solide. Aucun second moteur,
aucun jour créé, une seule source de vérité.

## État Git
Branche `claude/ai-career-os-saas-phfg49`. HEAD de départ V38 : `087f738`. Commits CP1→CP13 atomiques
(CP4 et CP6 = NO_COMMIT assumés — Data et Reliability déjà solides), poussés au fil de l'eau.
local == origin, arbre propre, 0 serveur résiduel. `progress.json` gitignoré, inchangé au blob
baseline `323604021055588a9528a86875f36598dbdc7758`.

## Ce qui existait déjà (réutilisé, non dupliqué)
Corpus backend/infra riche : Data (sql-foundations, database-modeling, database-transactions-concurrency,
sql-performance-indexing, database-migrations), Reliability (resilience-patterns + SRE V28), API
(http-rest-json, api-design-basics, express-backend, authentication), Documentation
(technical-documentation : ADR/RFC/HLD/TSD/runbook/post-mortem), et ~8 exercices scaling/SPOF
(cloud-scaling-*, cloud-detect-spof, k8s-replicas-ha). Le CP0 a confirmé leur solidité → réutilisés et
RELIÉS, jamais réécrits.

## Ce qui a été réellement créé
- **4 leçons** : api-production-contracts, async-messaging-queues (P0), system-design-scaling (P0),
  distributed-systems-failures.
- **7 exercices** déterministes : queue-idempotent-consumer, dlq-routing, api-pagination-choice,
  replication-lag-reason, capacity-estimate, retry-backoff-delay, system-design-diagnose (transfert).
- **3 playbooks** : queue-backlog, retry-storm, replication-lag.
- **6 termes** de glossaire (distribués) ; **1 gate** v38:check ; docs ADR/HSD/TSD-038 +
  PEDAGOGICAL-AUDIT-V38.

## Ce qui a été réellement amélioré
- **technical-debt** durcie : les quatre types de maintenance (corrective/adaptative/préventive/
  évolutive, ISO 14764).
- **Parcours Backend** : lessonRefs par module → le socle backend/system-design est suivable depuis
  /parcours.

## Ce qui a volontairement été laissé intact
Data, Reliability (resilience-patterns), Documentation pro, Cloud/K8s, Networking — déjà solides
(CP4/CP6 NO_COMMIT). Aucune réécriture de contenu sain. Aucun consensus détaillé (Raft/Paxos) ni
streaming avancé (hors niveau junior — reporté).

## Ce qui a réellement été testé
`node --test` → **1083/1083** ; `tsc --noEmit` → **0** ; `npm run build` → OK ; `gates:active` →
**18/18** ; génération déterministe (idempotente au timestamp près) ; exécution réelle des 7 exercices
(référence verte, starter en échec) ; validation navigateur Playwright **40/40** (8 pages × 5 largeurs,
overflow ≤ 2px, 0 erreur console).

## Ce qui n'a PAS été testé
Aucun système distribué réel (broker, cluster, DB répliquée) exécuté ; aucun benchmark ; aucun test de
charge réel. Ce sont des SIMULATIONS déterministes par conception.

## Ce qui est réel / ce qui est simulé
- **Réel** : les exercices s'exécutent vraiment (node-js), la validation navigateur observe le rendu réel.
- **Simulé** : TOUT le comportement distribué (files, réplication, retry, plusieurs instances, panne
  réseau) est un modèle déterministe local, explicitement étiqueté SIMULATION. Aucun Redis/Kafka/
  PostgreSQL/cluster réel.

## Dette restante
- **P2** : 7 warnings Curriculum Graph (dépendances conceptuelles légitimes), 0 bloquant.
- **P3** : consensus/streaming avancés (hors niveau) ; évaluations de prédiction à généraliser ;
  glossaire frontend (cascade/box-model/flexbox/grid/CSR-SSR-SSG) encore non ajouté au glossaire central ;
  socle backend/system-design en leçons rattachées, pas en jours dédiés (assumé).

## Avant → après (métriques réelles)
| Indicateur | Avant (087f738) | Après |
|---|---|---|
| Leçons | 124 | **128** (+4) |
| Exercices | 231 | **238** (+7) |
| Missions | 42 | 42 |
| Playbooks | 41 | **44** (+3) |
| Glossaire | 705 | **711** (+6) |
| Parcours disponibles / annoncés | 8 / 1 | 8 / 1 |
| Gates actives | 17 | **18** |
| Tests | 1070 | **1083** |
| Curriculum Graph | 0 bloquant / 7 warn | 0 bloquant / 7 warn |
| Moyenne pédagogique du périmètre | — | **3,74/4** |

## Verdict critique du sprint
Barème : INSUFFISANT · MOYEN · BON · FORT · EXCELLENT.

| Axe | Verdict | Justification |
|---|---|---|
| Pédagogie | FORT | 5 leçons au standard, moyenne 3,74, misconceptions déconstruites (CAP, réseau fiable). |
| Profondeur | FORT | API-production, files/DLQ, scaling, modes de panne distribués approfondis ; distribués au niveau junior assumé. |
| Cohérence | FORT | Chaîne HTTP→API→persistance→async→résilience→scaling→distribués acyclique ; socle atteignable depuis le parcours. |
| Pratique | BON | 7 exos exécutés + reuse de ~8 exos scaling ; notée par modèle déterministe (distribués simulés). |
| Transfert | FORT | system-design-diagnose exige de CHOISIR le concept sans qu'on le nomme. |
| Qualité Backend | FORT | API de production (idempotence/pagination/rate limit/versioning) + async/DLQ enfin enseignés. |
| Qualité System Design | FORT | Fondation débutant-first (une machine → distribué) qui manquait ; CAP correctement contextualisé. |
| Qualité professionnelle | FORT | Playbooks backlog/retry-storm/replication-lag ; quatre types de maintenance. |
| Honnêteté réel/simulé | EXCELLENT | Frontière explicite ; aucun faux broker/DB distribuée ; NO_COMMIT là où l'existant suffit. |
| Preuves / tests | FORT | 1083 tests, tsc 0, 18 gates, exécution réelle des exercices, 40/40 navigateur. |

**VERDICT GLOBAL : FORT.** V38 comble deux trous P0 réels (travail asynchrone/files, fondation System
Design débutant-first) et un trou P1 (API de production, systèmes distribués), tout en refusant de
dupliquer ce qui était déjà solide (Data, Reliability, Documentation → NO_COMMIT honnêtes). La chaîne
backend devient professionnelle et suivable depuis le parcours, avec une vraie évaluation de transfert.
Pas « EXCELLENT » global car la pratique reste notée par modèle déterministe (les concepts distribués
sont simulés, jamais exécutés), les évaluations de prédiction ne sont pas encore généralisées, et le
glossaire frontend reste à compléter. Aucun compteur n'est gonflé : 4 leçons justifiées concept par
concept, 2 checkpoints NO_COMMIT assumés.

---

## Prompt de reprise V39
Voir ci-dessous. **Ne pas démarrer V39 dans cette session.**

---

# Prompt de lancement — Sprint V39 (à démarrer PLUS TARD, PAS maintenant)

> Ce prompt clôt V38. **Ne démarre pas V39 dans cette session.** Rédigé pour être collé tel quel.
> Thème DÉRIVÉ de l'audit V38 : évaluation & maîtrise (mesurer autre chose que la récitation) +
> consolidation de la dette transverse, la pédagogie restant prioritaire sur toute refonte UI.

Reprends **AI Career OS** pour le **Sprint V39 — « Évaluation, maîtrise & révisions : mesurer la
compréhension, pas la récitation + consolidation de la dette transverse »**.

**IMPORTANT — travaille sur l'état RÉEL du dépôt.** Commence par un **CP0 strictement en lecture
seule** : audite l'état réel (git, tests, build, gates, leçons, exercices, missions, playbooks,
glossaire, parcours, Curriculum Graph, serveurs, baseline progress.json, dispositifs d'évaluation
existants) et présente un **rapport d'audit CP0 en français AVANT toute implémentation**. Si V39 est
déjà (partiellement) livré, NE RECOMMENCE RIEN. L'AUDIT FAIT FOI.

**Langue** : rapports, audits, synthèses et prompt V40 final en **français**.

**Priorité (inchangée)** : pédagogie > cohérence du curriculum > compréhension néophyte > pratique >
transfert > évaluation > features > UI.

**État attendu (à VÉRIFIER)** : branche `claude/ai-career-os-saas-phfg49`, HEAD final V38, ~128 leçons,
~238 exercices, 42 missions, 44 playbooks, ~711 glossaire, 18 gates, ~1083 tests, 8 parcours
disponibles, 1 annoncé. Curriculum Graph : ~7 warnings, 0 bloquant.

**Objectif central V39 — évaluation de PRÉDICTION et de DIAGNOSTIC, à grande échelle :**
L'audit V38 (et V37) a montré que la dimension `evaluation` plafonne à 3 : on vérifie surtout la
compréhension, rarement par des questions qui exigent de PRÉDIRE un comportement ou de DIAGNOSTIQUER un
défaut sur un cas nouveau. Concevoir un dispositif d'évaluation RÉUTILISABLE (pas un second moteur) :
- des exercices/quiz déterministes de prédiction (« que renvoie ce code ? », « quel comportement ? »)
  et de diagnostic (« pourquoi est-ce faux, et comment corriger ? ») sur les domaines clés (frontend,
  backend, data/ML, system design) ;
- relever honnêtement la dimension evaluation des leçons concernées (3 → 4) UNIQUEMENT quand un vrai
  dispositif d'évaluation les accompagne.
Sur preuve : n'augmenter un score que si le contenu le justifie réellement.

**Objectif secondaire V39 — révisions & maîtrise (rétention) :** auditer les dispositifs de révision
existants (revues hebdo/mensuelles, `/reviews`, `/revisions`). Introduire, si pertinent et sans second
moteur, une notion de RÉVISION ESPACÉE ou de critères de maîtrise par compétence (« tu maîtrises X si
tu peux… ») pour soutenir la rétention (dimension à 3 sur plusieurs leçons).

**Objectif tertiaire V39 — consolidation de la dette transverse :** glossaire frontend manquant
(cascade, box model, Flexbox, Grid, media query, viewport, hydration, CSR/SSR/SSG, Core Web Vitals) ;
tout warning graphe corrigeable à la source ; petites incohérences détectées au CP0. Sans gonfler les
compteurs.

**Contraintes (inchangées)** : local, mono-utilisateur, sans auth/SaaS/réseau, sans dépendance lourde,
sans faux runtime, sans second moteur/base. Réutiliser Curriculum Graph, moteur d'exercices, rubrique
d'audit, composition non contiguë, mécanisme d'ajout de leçons. `progress.json` gitignoré, restauré à
la baseline CP0. Aucun secret, aucune fuite de solution/test.

**Gates** : garder `v26→v38:check` actifs. Nouveau contrat → `v39:check` ciblé et testé.

**Checkpoints** CP0→CP12 (audit → design ADR/HSD/TSD-039 → gate → dispositif d'évaluation →
exercices de prédiction/diagnostic par domaine → révisions/maîtrise → relèvement honnête des scores →
glossaire/dette → intégration parcours → walkthrough+transfert → hardening final + audit). Un commit
par CP réellement terminé ; **pas de commit vide** (NO_COMMIT explicite sinon). CP final obligatoire :
ré-audit + walkthrough + matrice P0→P3 dans `docs/PEDAGOGICAL-AUDIT-V39.md` + évolution chiffrée des
warnings + évaluation du sprint (INSUFFISANT/MOYEN/BON/FORT/EXCELLENT + VERDICT) + prompt V40 (sans
démarrer).

**Critères de refus** : remplissage, quiz évidents, gonflage de scores sans dispositif réel, fausse
profondeur, longueur = qualité, faux runtime, contenu créé sans besoin réel.

**Livrable final** : `docs/SPRINT-V39.md` + synthèse française (existant / créé / amélioré / réutilisé /
non créé / testé / simulé / non testé / insuffisant), chiffres avant/après, dette restante, HEAD final.

**Commence maintenant par CP0. N'implémente rien avant d'avoir présenté le rapport CP0.**
