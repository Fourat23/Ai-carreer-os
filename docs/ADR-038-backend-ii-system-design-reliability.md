# ADR-038 — Backend Engineer II + System Design Foundations + Production Reliability

Statut : accepté (Sprint V38). Décision fondée sur l'audit CP0 réel. **Priorité : pédagogie >
cohérence curriculaire > pratique > fiabilité > features > UI.** Local, mono-utilisateur, sans
auth/SaaS/réseau, **une seule source de vérité**, sans faux runtime distribué.

## Problème (établi au CP0)

Le prompt supposait un Backend « compact ». L'audit CP0 corrige : le corpus backend/infra est déjà
**riche** (52 leçons). Sont **déjà solides et à NE PAS dupliquer** :
- **Data** : sql-foundations, database-modeling, database-transactions-concurrency (isolation, race,
  locking optimiste/pessimiste), sql-performance-indexing (index, N+1), database-migrations.
- **Reliability** : resilience-patterns (timeout/retry/circuit breaker/backpressure) + SRE V28
  (observability, monitoring, incident-response, release-incident-recovery).
- **Documentation pro** : technical-documentation couvre ADR/RFC/HLD/HSD/TSD/runbook/post-mortem.

Les **vrais trous P0/P1** confirmés par l'audit :
1. **API production** (idempotence, pagination, rate limiting, versioning, backward-compat) —
   mentionnés mais jamais enseignés comme un contrat de production.
2. **Async / messaging** (queues, workers, retry, DLQ, idempotent consumer, pub/sub) — **aucune leçon**
   (DLQ=0, eventual-consistency=0).
3. **System Design fondations** — seul system-design-interview existe (orienté entretien), pas de
   progression débutant « une machine → scaling → LB → réplication → partition → SPOF ».
4. **Systèmes distribués / modes de panne** (partial failure, replication lag, eventual consistency,
   CAP contextualisé, sharding/hotspots) — épars, non enseigné.
5. **Playbooks** : manquent queue-backlog, retry-storm, replication-lag.

## Décisions

### D1 — API production : 1 leçon `api-production-contracts`
Au-delà de `api-design-basics` (design/REST/validation/erreurs/évolution) : une API de production est
un **contrat dans le temps** — idempotence (rejouer une requête sans dommage), pagination (curseur vs
offset), rate limiting (protéger le service), versioning et backward-compatibility. Ne duplique pas
api-design-basics : le référence en prérequis.

### D2 — Async / messaging : 1 leçon `async-messaging-queues` (P0)
La chaîne latence → cache (existant) → **travail asynchrone** → queue → worker → retry → **idempotent
consumer** → **DLQ** → pub/sub vs queue → livraison at-least-once, duplication, ordering. **Simulation
déterministe honnête** : aucun vrai Redis/Kafka ; les exercices raisonnent sur des modèles locaux
étiquetés SIMULATION.

### D3 — System Design fondations : 1 leçon `system-design-scaling` (P0, débutant-first)
Progression : une machine → CPU/RAM/disque/réseau → scaling vertical → horizontal → stateless → load
balancer → instances multiples → stockage partagé → cache → réplication → partitionnement → SPOF →
disponibilité → arbitrages. **Commence par un problème simple**, jamais par CAP/consistent-hashing.
Distincte de system-design-interview (méthode d'entretien) : complémentaire, pas concurrente.

### D4 — Systèmes distribués / modes de panne : 1 leçon `distributed-systems-failures` (P1)
Réseau non fiable, latence, partial failure, requête dupliquée, ordering, **eventual consistency**,
leader/follower conceptuel, **replication lag**, split-brain introductif, **CAP correctement
contextualisé**, quorum si justifié, sharding/hotspots/rebalancing, SPOF. Niveau : junior solide
capable de raisonner, PAS un master de systèmes distribués.

### D5 — Data & Reliability : audit → NO_COMMIT (réutiliser, ne pas dupliquer)
Data et Reliability sont solides. On les **relie** (les nouvelles leçons async/system-design pointent
vers resilience-patterns, database-transactions-concurrency, caching-performance) sans les réécrire.
NO_COMMIT explicite pour les checkpoints correspondants.

### D6 — Pratique ciblée (trous confirmés)
Exercices déterministes de RAISONNEMENT (Node.js) : idempotence, pagination, DLQ/duplication, retry
storm, cache hit/miss, scale-up vs scale-out, SPOF, replication lag, capacity estimation, choix
d'index. Chacun : starter fautif, référence verte, ≥1 public + ≥1 privé, vérifié par exécution,
relié à un jour réel. Aucun quota.

### D7 — Playbooks « Que faire dans ce cas ? »
Ajouter uniquement les scénarios absents : queue-backlog, retry-storm, replication-lag. Format
professionnel complet (15 rubriques). Ne pas créer de variantes d'incidents existants.

### D8 — Parcours Backend : reachability (comme V37)
Rattacher les leçons backend/system-design aux modules de `backend-engineer-v1` via `lessonRefs`
(additif, aucun jour créé), afin que le contenu soit suivable depuis le parcours.

### D9 — Réel vs simulé, sécurité
Toute simulation distribuée (queue, réplication, plusieurs instances, panne réseau) est **déterministe
et étiquetée SIMULATION**. Aucun faux Redis/Kafka/PostgreSQL, aucun faux benchmark, aucune dépendance
ajoutée. Aucun `eval`, aucun secret.

## Options rejetées
- **Dupliquer Data/Reliability/Documentation** : déjà solides (le prompt l'interdit).
- **Master de systèmes distribués** : hors niveau cible ; on vise le raisonnement junior.
- **Vrais brokers/DB distribuées** : contraire au principe local/déterministe.
- **Gonfler le nombre de leçons** : création limitée à 4 leçons P0/P1 justifiées concept par concept.

## Conséquences
+ Le Backend gagne API-production, async/messaging, et une vraie fondation System Design + modes de
  panne distribués — la chaîne HTTP → contrat → persistance → async → résilience → architecture devient
  cohérente.
+ Le parcours Backend rend ce contenu atteignable (lessonRefs).
− ~4 leçons + pratique + playbooks ajoutés (justifiés), Data/Reliability intacts.
= Gates/graphe/tests restent verts ; progress.json restauré ; aucun jour créé.
