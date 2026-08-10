# Audit pédagogique — Sprint V38 (Backend Engineer II + System Design)

> Approfondissement de la colonne Backend / System Design : API de production, travail asynchrone
> (files/DLQ), fondations System Design débutant-first, systèmes distribués, + durcissement SE, pratique
> ciblée, playbooks et reachability du parcours Backend. Document en français, factuel, sans langage
> promotionnel. Les scores sont des PROXYS, pas une mesure d'apprentissage humain.

## 1. Méthodologie
Rubrique v20 (16 dimensions 0-4, notées à la lecture intégrale), signaux structurels (informatifs),
signaux de danger (bloquants). Seuils : aucune dimension < 2 ; dimensions dures (technical-accuracy,
objective, progression, autonomous-practice) ≥ 3 ; moyenne récente ≥ 3,25. Registre
`docs/architecture/v38-pedagogy-audit.json` validé par `validateAuditLedger`. Gate `v38:check` =
structure, jamais profondeur par longueur.

## 2. Ce qui a été fait
- **4 leçons créées** : api-production-contracts, async-messaging-queues (P0), system-design-scaling
  (P0), distributed-systems-failures.
- **1 leçon durcie** : technical-debt (quatre types de maintenance).
- **7 exercices** déterministes ; **3 playbooks** ; **6 termes** de glossaire ; **reachability** du
  parcours Backend (lessonRefs) ; **1 exercice de transfert** (diagnostic d'architecture).
- **Non dupliqué** (audit CP0) : Data (transactions/index/migrations), Reliability (resilience-patterns
  + SRE), Documentation pro (technical-documentation) — déjà solides.

## 3. Matrice d'audit — 5 leçons du périmètre
TA/Obj/Pré/MM/Prof/Prog/EG/PA/FB/EF/PP/Éval/CC/Acc/Rét/TC.

| Leçon | TA | Obj | Pré | MM | Prof | Prog | EG | PA | FB | EF | PP | Éval | CC | Acc | Rét | TC | Moy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| api-production-contracts | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,75 |
| async-messaging-queues ⚑ | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,75 |
| system-design-scaling ⚑ | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,75 |
| distributed-systems-failures ⚑ | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,69 |
| technical-debt ✚ | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,75 |

⚑ critique · ✚ durcie. **Moyenne du périmètre : 3,74.** Aucune dimension < 3 ; dimensions dures ≥ 3.

### Honnêteté des notes
- **autonomous-practice = 3** : pratique reliée mais notée par MODÈLE DÉTERMINISTE (node-js) ; les
  systèmes distribués sont SIMULÉS (aucun vrai broker/DB distribuée). Plancher assumé.
- **evaluation = 3** et **cognitive-load = 3** : marge réelle non masquée (async et distribués sont denses).

## 4. Évaluation qualitative par axe (pas d'« excellent » automatique)

| Axe | Verdict | Justification |
|---|---|---|
| Accessibilité néophyte | FORT | System Design part d'« une machine, puis 1000, puis 1M » ; chaînes acycliques. |
| Profondeur | FORT | API-production, files/DLQ, scaling, modes de panne distribués traités en profondeur ; distribués volontairement au niveau junior. |
| Exactitude technique | FORT | CAP correctement contextualisé (pas « 2 sur 3 »), at-least-once + idempotence, replication lag. |
| Progression conceptuelle | FORT | Ordre HTTP → API → persistance → async → résilience → scaling → distribués, acyclique. |
| Charge cognitive | BON | System Design séparé en 2 leçons (scaling / distribués) ; async et distribués restent denses (cl=3). |
| Exemples & contre-exemples | FORT | Chaque leçon a exemple guidé + trade-offs + anti-patterns. |
| Misconceptions | FORT | « CAP 2 sur 3 », réseau fiable, consommateur non idempotent, distribuer trop tôt. |
| Pratique autonome | BON | 7 exos exécutés + reuse de ~8 exos scaling ; notée par modèle déterministe, distribués SIMULÉS. |
| Transfert | FORT | system-design-diagnose : l'apprenant CHOISIT le correctif sans qu'on nomme le concept. |
| Feedback | BON | Exos : starter fautif → référence verte ; playbooks au format méthode. |
| Réalisme professionnel | FORT | Idempotence de paiement, backlog de file, retry storm, replication lag : incidents réels. |
| Cohérence parcours | FORT | Socle backend/system-design atteignable depuis /parcours (lessonRefs). |
| Honnêteté réel/simulé | EXCELLENT | Frontière explicite partout ; aucun faux Redis/Kafka/DB distribuée. |
| Qualité de l'évaluation | BON | Un vrai exercice de transfert ajouté ; quiz de prédiction à généraliser (dette). |
| Rétention | BON | Synthèses solides ; espacement/rappel non outillés. |

## 5. Concept → couverture (trous signalés)
| Concept | Leçon | Pratique | Verdict |
|---|---|---|---|
| API production (idempotence/pagination/rate limit/versioning) | api-production-contracts | http-method-idempotent, api-pagination-choice | couvert |
| Files/workers/DLQ/idempotent consumer | async-messaging-queues | queue-idempotent-consumer, dlq-routing, retry-backoff-delay | couvert (P0 comblé) |
| Scaling (vertical/horizontal/LB/réplication/partition/SPOF) | system-design-scaling | cloud-scaling-*, capacity-estimate, system-design-diagnose | couvert |
| Modes de panne distribués (CAP/lag/split-brain/sharding) | distributed-systems-failures | replication-lag-reason, cloud-detect-spof | couvert (niveau junior) |
| Data (transactions/index/migrations) | existant | existant | P3 (non touché) |
| Reliability (retry/circuit breaker/backpressure) | resilience-patterns | existant | P3 (réutilisé) |
| Documentation pro (ADR/RFC/runbook/post-mortem) | technical-documentation | missions | P3 (non touché) |
| Consensus détaillé (Raft/Paxos), streaming avancé | — | — | **trou assumé (hors niveau, V39+)** |

## 6. Walkthrough néophyte + réel/simulé/non testé
- **Walkthrough** : chaîne `http-rest-json → api-design-basics → api-production-contracts` et
  `caching-performance → async-messaging-queues → system-design-scaling → distributed-systems-failures`
  ACYCLIQUE (graphe 0 bloquant), chaque prérequis existe. Aucun jargon avant définition détecté (CAP,
  eventual consistency, DLQ sont introduits par un problème avant d'être nommés).
- **RÉEL** : exécution des 7 exercices (référence verte, starter en échec) ; validation navigateur
  Playwright (8 pages × 5 largeurs → 40/40, overflow ≤ 2px, 0 erreur console).
- **SIMULÉ** : notation par modèle déterministe node-js ; TOUS les concepts distribués (queue,
  réplication, plusieurs instances, panne réseau) sont des SIMULATIONS étiquetées — aucun vrai
  Redis/Kafka/PostgreSQL/cluster.
- **NON TESTÉ** : aucun système distribué réel exécuté ; aucun benchmark ; pas de test de charge réel.

## 7. Dette restante
- **P2** : 7 avertissements du Curriculum Graph (dépendances conceptuelles légitimes), 0 bloquant.
- **P3** : consensus détaillé / streaming avancé (hors niveau junior) ; quiz de prédiction/diagnostic à
  généraliser (evaluation à 3) ; glossaire frontend (cascade/box-model/flexbox/grid/CSR-SSR-SSG) encore
  non ajouté au glossaire central (présent dans les Vocabulaires des leçons) ; le socle backend/system-
  design vit en leçons rattachées, pas en jours dédiés (aucun jour créé — assumé).

## 8. Limites de l'audit
Notes portées par un seul auteur ; proxys structurels/qualitatifs, non une mesure d'apprentissage. La
validation navigateur observe rendu/débordement/erreurs console. Aucune exécution distribuée réelle,
par conception (local/déterministe).
