# HSD-038 — Carte pédagogique Backend / System Design & intégration

Document de conception de haut niveau (Sprint V38). Complète ADR-038. En français.

## 1. Carte pédagogique cible (chaîne backend professionnelle)

```
HTTP/REST (http-rest-json) → contrat API (api-design-basics) → API PRODUCTION (api-production-contracts)
  → validation/erreurs/auth (express-backend, authentication)
Persistance (sql-foundations → database-modeling → database-transactions-concurrency → sql-performance-indexing)
Performance (caching-performance) → TRAVAIL ASYNCHRONE (async-messaging-queues : queue/worker/retry/DLQ)
Résilience (resilience-patterns + SRE V28)  ← RÉUTILISÉ, non dupliqué
SYSTEM DESIGN FONDATIONS (system-design-scaling : 1 machine → scaling → LB → réplication → partition → SPOF)
  → SYSTÈMES DISTRIBUÉS / MODES DE PANNE (distributed-systems-failures : partial failure, eventual
    consistency, replication lag, CAP contextualisé, sharding/hotspots)
Production & SE (technical-debt, refactoring-legacy-code, breaking-changes-compatibility,
  release-incident-recovery, technical-documentation)  ← RÉUTILISÉ
```

## 2. Standard « Academic Lesson V38 »

Chaque nouvelle leçon / leçon durcie : problème d'abord (situation pro, zéro jargon non introduit) →
objectif → prérequis réels → modèle mental (analogie fidèle, limites explicitées) → explication
progressive (concret→abstrait, happy path→problèmes→trade-offs) → exemples guidés (+ contre-exemple) →
**trade-offs (quand utiliser / quand NE PAS)** → erreurs/anti-patterns → pratique reliée →
vérification de compréhension (raisonnement) → cas pro → entretien (si pertinent) → à retenir →
vocabulaire (défini au premier usage). Pour l'architecture : PROBLÈME → CONTRAINTES → OPTIONS →
TRADE-OFFS → DÉCISION. Intuition AVANT formule.

La gate `v38:check` mesure les signaux STRUCTURELS et déterministes ; elle ne juge jamais la profondeur
par la longueur, et ne prétend pas mesurer la compréhension humaine.

## 3. Surfaces impactées

- **Contenu** : 4 leçons (`api-production-contracts`, `async-messaging-queues`, `system-design-scaling`,
  `distributed-systems-failures`).
- **Registre** : `scripts/data/lessons-map.mjs` (LESSONS + practiceRefs) + `backendModules` (lessonRefs).
- **Pratique** : `data/exercises/*.json` (trous confirmés) + `data/day-exercises.json` (reachability).
- **Playbooks** : `data/playbooks/*.json` (queue-backlog, retry-storm, replication-lag).
- **Gate/plan/ledger** : `scripts/v38-check.mjs`, `docs/architecture/v38-lessons-plan.json`,
  `docs/architecture/v38-pedagogy-audit.json`.
- **Tests** : `tests/v38-*.test.mjs` + mises à jour ciblées.
- **Glossaire** : ajouts backend/system-design/frontend manquants (dette V37) sans doublon d'alias.

## 4. Frontière réel / simulé

Aucun broker/DB distribuée réel. Les concepts distribués (queue, worker, réplication, plusieurs
instances, panne réseau) sont enseignés conceptuellement et pratiqués via des **modèles déterministes
locaux en Node.js**, explicitement étiquetés SIMULATION. Aucun faux benchmark, aucune fausse exécution.

## 5. Stratégie « Que faire dans ce cas ? »

Réutiliser les 41 playbooks existants ; ajouter uniquement queue-backlog, retry-storm, replication-lag
(scénarios absents), au format 15 rubriques. Relier les nouvelles leçons aux playbooks (existants et
nouveaux) via practiceRefs.

## 6. Charge cognitive & splits

System Design est le bloc le plus dense : si `system-design-scaling` devient surchargé, split justifié
(fondations scaling vs systèmes distribués — déjà séparés en 2 leçons par conception). Aucune leçon ne
mélange plus de concepts qu'un débutant ne peut absorber en une session.

## 7. Reachability (parcours Backend)

`backendModules(program)` gagne `lessonRefs` par module (comme `frontendModules` en V37), exposé par le
read model et affiché sur /parcours. Additif, aucun jour créé, aucune duplication des 365 jours.

## 8. Anti-duplication (RÉUTILISER → RELIER → DURCIR → CRÉER)

Data, Reliability, Documentation, Cloud/K8s, Networking sont réutilisés et RELIÉS depuis les nouvelles
leçons, jamais réécrits. Création limitée aux 4 trous P0/P1. CP4/CP6/CP11 seront NO_COMMIT si l'audit
confirme que l'existant suffit.
