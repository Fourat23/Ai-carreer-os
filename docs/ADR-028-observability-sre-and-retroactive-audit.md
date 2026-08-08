# ADR-028 — Fondation Observabilité/SRE/incident & audit pédagogique rétroactif

Statut : accepté (Sprint V28). Décision fondée sur l'audit CP0 réel.
**Priorité produit : compréhension réelle par un néophyte > exactitude technique >
progression > cohérence théorie↔pratique↔parcours > raisonnement en situation pro >
qualité des exercices/missions > fonctionnalités > UI.** Local, mono-utilisateur,
sans réseau, sans cloud réel, **sans nouveau moteur** (progression, exercices,
missions, preuves, compétences, catalogue, glossaire restent uniques).

## Problème produit (établi au CP0)

Deux dettes réelles coexistent après V27 :

1. **Aucune fondation canonique Observabilité / SRE / gestion d'incident.** Le corpus
   n'a que `observability-logging` (généraliste) et `monitoring-production` — pas de
   leçon dédiée sur métriques & percentiles, traces distribuées, SLI/SLO/error budget,
   cycle de vie d'incident, post-mortem/RCA, patterns de résilience. Un futur
   ingénieur ne peut pas raisonner le comportement d'un service en production.
2. **Le standard pédagogique V27 (on-ramp « Le problème d'abord », prérequis
   explicités, `practiceRefs`) ne couvre que les 32 leçons Cloud/DevOps.** Les **60
   leçons historiques (pré-V26)** ne le respectent pas : 21 sont au gabarit ANCIEN
   minimal (souvent sans modèle mental, ce sont des leçons de premier contact), 39 au
   gabarit riche mais sans on-ramp/prérequis/practiceRefs.

## Décision 1 — Fondation Observabilité/SRE/incident (leçons dédiées, ~8)

Créer un ensemble FOCALISÉ et excellent (qualité > quantité) de nouvelles Leçons de
fond, chacune au standard V27 (on-ramp néophyte, prérequis, vocabulaire au premier
usage, `practiceRefs`), dans une nouvelle catégorie « Observabilité, SRE &
fiabilité » :

- `observability-fundamentals` (monitoring vs observability, les 3 piliers) ;
- `logging-structured` (logs, niveaux, structuré, correlation ID) ;
- `metrics-percentiles` (métriques, p50/p95/p99, « la moyenne ment », RED/USE/Golden
  Signals, cardinalité) ;
- `distributed-tracing` (traces, spans, instrumentation, sampling) ;
- `slo-error-budget` (SLI/SLO/SLA, error budget, burn rate, « pourquoi 99,9 % ») ;
- `incident-response` (cycle de vie, severity/impact/scope, triage, mitigation,
  incident commander, communication, timeline) ;
- `postmortem-rca` (post-mortem sans blâme, RCA, Five Whys, actions correctives/
  préventives, symptôme vs cause vs facteur contributif) ;
- `resilience-patterns` (timeout, retry, circuit breaker, backpressure, rate
  limiting, load shedding, graceful degradation, failover, SPOF, RTO/RPO).

Ces leçons **complètent** `observability-logging`/`monitoring-production` (intros) et
V26 (`release-incident-recovery`, `deployment-strategies`) — elles ne les dupliquent
pas : le processus d'incident et la fiabilité sont distincts des mécaniques de
livraison/rollback déjà couvertes.

## Décision 2 — Audit pédagogique RÉTROACTIF (matrice + correction ciblée)

Le standard V27 devient le référentiel de TOUTES les leçons, pas seulement des
récentes. On construit une matrice d'audit des 60 historiques (priorités P0→P3) et on
CORRIGE de façon ADDITIVE un sous-ensemble prioritaire (leçons de premier contact au
gabarit ancien), sans réécrire arbitrairement les 60. Correction = ajout on-ramp
« Le problème d'abord » + 🧩 Prérequis explicites + modèle mental si absent +
`practiceRefs` vers des exercices EXISTANTS ; le contenu technique correct est
conservé. Le reste est documenté en dette V29.

Classement (CP0) : **P0** ancien gabarit + premier contact + sans modèle mental ;
**P1** ancien gabarit avec modèle mental ; **P2** gabarit riche sans on-ramp/prérequis/
practiceRefs ; **P3** déjà conforme (32 Cloud/DevOps).

## Décision 3 — Réutiliser le moteur d'audit et le graphe pratique existants

On étend `lib/pedagogy-audit.mjs` (16 dimensions) et le format de ledger (kind
`content`, `sourcePath`). On réutilise `practiceRefs` (V27) pour relier leçons →
exercices/Labs/missions EXISTANTS. Aucune seconde architecture pédagogique.

## Décision 4 — Gate `v28:check` (structurel) + cycle de vie

Nouveau `scripts/v28-check.mjs` (même esprit que v27:check) validant les nouvelles
leçons obs/SRE ET les historiques corrigées déclarées dans un plan V28 : on-ramp,
prérequis explicités, vocabulaire, sections minimales, absence de placeholders, liens
internes valides, `practiceRefs` résolus, graphe de prérequis acyclique, scan
réel/simulé. Ajouté à `gates:active`. `v26:check` et `v27:check` **restent actifs**
(V28 ne réduit pas leur portée : les 32 leçons V26/V27 ne sont pas modifiées). Aucun
gate retiré ; le dépôt ne devient pas un « cimetière de gates » car chaque gate actif
valide un périmètre encore vivant et distinct.

## Alternatives rejetées

- **Réécrire les 60 historiques** : rejeté (risque de régression, hors budget,
  viole « ne réécris pas arbitrairement »). Correction additive ciblée à la place.
- **Certification SRE exhaustive** : rejeté — on vise la FONDATION nécessaire pour
  raisonner un service en prod, pas l'exhaustivité.
- **Nouveau moteur d'activités/observabilité** : rejeté — `practiceRefs` + Labs
  existants suffisent.
- **Dupliquer les mécaniques de livraison/rollback** (déjà en V26) : rejeté — les
  leçons d'incident/résilience s'y RÉFÈRENT.
- **Gonfler le nombre de leçons** : rejeté — « 8 excellentes > 30 moyennes ».

## Risques et limites

- Tout est SIMULÉ : aucune métrique/trace/incident réel n'est produit ; les leçons
  enseignent le raisonnement sur des exemples déterministes étiquetés.
- L'audit rétroactif est partiel en V28 (priorité aux P0) : la dette P1/P2 restante
  est explicitement documentée pour V29.
- Les scores d'audit sont des proxys : la validation « néophyte » (CP11) reste une
  lecture experte, pas un test utilisateur réel.

## Migration additive

Ajout de leçons, d'un champ `practiceRefs` sur des historiques, d'un gate et d'un
ledger ; enrichissement du glossaire. Aucune donnée détruite, aucun jour réécrit,
`progress.json` (runtime, gitignoré) préservé.
