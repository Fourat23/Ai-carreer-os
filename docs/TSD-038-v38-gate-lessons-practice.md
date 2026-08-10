# TSD-038 — Gate v38, leçons, pratique, playbooks & parcours

Document de conception technique (Sprint V38). Complète ADR-038 / HSD-038. En français.

## 1. Plan — `docs/architecture/v38-lessons-plan.json`
Champs : `sprint`, `baselineRef`, `newLessons` (api-production-contracts, async-messaging-queues,
system-design-scaling, distributed-systems-failures), `hardenedLegacy` (si audit le justifie),
`critical` (practiceRef obligatoire), `prereq` (acyclique, slugs connus). Vérifié par
`tests/v38-pedagogy.test.mjs`.

## 2. Gate `scripts/v38-check.mjs` (adaptée de v37)
Valide STRUCTURELLEMENT les leçons du périmètre : on-ramp avant objectif, prérequis rédigés, sections
minimales, liens valides, practiceRefs résolus pour `critical`, graphe acyclique, réel/simulé (scan de
danger) ; signaux pédagogiques en avertissement (densité, jargon à froid). `placeholder` minuscule non
flagué. Ne juge jamais la profondeur par la longueur. Ajoutée à `gates:active` (18 gates).

## 3. Leçons (standard V38)
- `api-production-contracts` (niveau 3) : idempotence, pagination (offset/curseur), rate limiting,
  versioning, backward-compat. Prérequis : api-design-basics, http-rest-json. practiceRefs :
  api-idempotency, api-pagination-choice (+ existants).
- `async-messaging-queues` (niveau 3) : queue/worker, retry, idempotent consumer, DLQ, pub/sub vs
  queue, at-least-once/duplication/ordering. Prérequis : caching-performance, resilience-patterns.
  practiceRefs : queue-idempotent-consumer, dlq-duplicate (+ playbook queue-backlog).
- `system-design-scaling` (niveau 2) : progression débutant une machine → scaling → LB → réplication →
  partition → SPOF. Prérequis : architecture-basics, networking-proxy-loadbalancing. practiceRefs :
  scale-up-vs-out, spof-detect.
- `distributed-systems-failures` (niveau 3) : partial failure, eventual consistency, replication lag,
  CAP contextualisé, sharding/hotspots. Prérequis : system-design-scaling,
  database-transactions-concurrency. practiceRefs : replication-lag-reason, capacity-estimate.

## 4. Pratique (trous confirmés, node-js déterministe)
Candidats (créés si absents et pertinents) : api-idempotency, api-pagination-choice,
queue-idempotent-consumer, dlq-duplicate, scale-up-vs-out, spof-detect, replication-lag-reason,
capacity-estimate, retry-backoff-delay, cache-hit-ratio. Chacun : contexte + données + tâche + sortie
attendue + explication + erreurs + preuve ; call-equals à sorties entières/chaînes (pas d'égalité de
flottants) ; vérifié par exécution (référence verte, starter échoue ≥1 public). Simulations
distribuées étiquetées SIMULATION dans le summary.

## 5. Playbooks
`queue-backlog`, `retry-storm`, `replication-lag` — format 15 rubriques (symptoms, firstChecks,
containment, recommendedOrder, communication, evidence, doNot, mitigation, correction, validation,
delivery, monitoring, documentation, prevention, exitCriteria), dayRefs valides, relatedGlossary
existants.

## 6. Parcours Backend — reachability
`backendModules(program)` renvoie `lessonRefs` par module (leçons canoniques backend/system-design),
exposé par le read model et affiché sur /parcours (la page gère déjà `lessonRefs` depuis V37). Test :
chaque lessonRef existe dans LESSONS.

## 7. Évaluation de transfert
Exercice(s) de diagnostic d'architecture : on décrit un système (API + DB + cache + queue + N
instances + incidents) et l'apprenant CHOISIT lui-même le concept correctif (sans que l'énoncé nomme
« circuit breaker » ou « cache »). Déterministe, vérifié par exécution.

## 8. Tests
- `v38-pedagogy.test.mjs` : plan valide, ledger valide, practiceRefs résolus.
- `v38-e2e.test.mjs` : leçons présentes au corpus, 0 leçon sans on-ramp, graphe 0 bloquant, backend
  reachability (lessonRefs valides couvrant le socle backend/system-design).
- `v38-exercises.test.mjs` : exécution des nouveaux exercices (sandbox gitignoré).

## 9. Discipline
Un commit atomique par CP réellement terminé ; `NO_COMMIT` documenté sinon (CP4/CP6/CP11 attendus
NO_COMMIT si l'existant suffit) ; jamais de commit vide. `progress.json` gitignoré, restauré à la
baseline CP0. Aucun force-push, aucun rebase destructif.
