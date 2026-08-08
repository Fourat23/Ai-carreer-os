# Sprint V28 — Observabilité, incidents, SRE & fiabilité + audit pédagogique rétroactif

Rapport de sprint (français). AI Career OS reste **local, mono-utilisateur, sans
authentification, sans SaaS, sans réseau requis**. V28 n'introduit **aucun nouveau
moteur** (progression, exercices, missions, preuves, compétences, catalogue,
glossaire restent uniques) et **aucun changement UI**. **Aucune métrique, trace,
alerte ou incident RÉEL** : les leçons enseignent le raisonnement sur des exemples
déterministes étiquetés.

## 1. État initial audité (CP0)
HEAD initial `131451d` (fin V27), branche `claude/ai-career-os-saas-phfg49`, local ==
origin, working tree propre, aucun stash, aucun artefact V28, aucun serveur résiduel.
`progress.json` gitignoré (SHA `598f27c2…`). 926 tests verts, tsc/build propres,
gates:active vert, génération déterministe. 92 leçons, 184 exercices, 40 missions, 25
playbooks, 583 entrées de glossaire, 6 parcours.

## 2. HEAD initial
`131451d` — rien de V28 n'était commencé.

## 3. Diagnostic (CP0)
Deux dettes réelles : (1) **aucune leçon de fond dédiée Observabilité/SRE/incident**
(seulement `observability-logging` + `monitoring-production`, généralistes) ; (2) le
standard pédagogique V27 (on-ramp, prérequis explicités, practiceRefs) ne couvrait que
les **32 leçons Cloud/DevOps** — les **60 leçons historiques** (21 au gabarit ancien
minimal, 39 au gabarit riche) ne le respectaient pas. Glossaire obs/SRE incomplet.

## 4. Architecture retenue (ADR/HSD/TSD-028)
(1) Créer une fondation FOCALISÉE de 8 leçons obs/SRE au standard V27 (qualité >
quantité). (2) Audit RÉTROACTIF des 60 historiques (matrice P0→P3) + correction
additive ciblée (CP11). Réutilisation du moteur d'audit et de `practiceRefs` ; gate
`v28:check` ; v26/v27 restent actifs (périmètres distincts, pas de cimetière de
gates).

## 5. Checkpoints et commits
| CP | Commit | Objet |
|---|---|---|
| CP1 | `58f5b7d` | ADR/HSD/TSD-028 |
| CP2 | `2c2a944` | gate v28:check + plan + ledger + tests |
| CP3 | `494a415` | Observabilité : fondations (3 leçons) |
| CP4 | `d528fba` | Performance & diagnostic (metrics-percentiles) |
| CP5 | `6209b82` | SRE & fiabilité (slo-error-budget) |
| CP6 | `b16342c` | Incidents, RCA & résilience (3 leçons) |
| CP7 | `2b7cfdd` | 6 exercices obs/SRE (trous réels) |
| CP8 | `a072c00` | glossaire obs/SRE (+27 termes) |
| CP9 | `6b6a160` | cohérence des parcours + E2E |
| CP10 | *(ce commit)* | hardening + validation navigateur + rapport |
| CP11 | *(à venir)* | Pedagogical Hardening + audit rétroactif |

## 6. Contenu livré — nouvelles leçons (8)
Catégorie « Observabilité, SRE & fiabilité » :
- `observability-fundamentals` (monitoring vs observability, 3 piliers) ;
- `logging-structured` (logs structurés, niveaux, correlation ID, jamais de secret) ;
- `distributed-tracing` (trace/span, propagation, sampling, « où le temps est passé ») ;
- `metrics-percentiles` (**critique** : « la moyenne ment », p50/p95/p99, RED/USE/
  Golden Signals, baseline/régression) ;
- `slo-error-budget` (**critique** : SLI/SLO/SLA, error budget, burn rate, « pourquoi
  99,9 % ») ;
- `incident-response` (**critique** : cycle de vie, severity, triage, incident
  commander, communication) ;
- `postmortem-rca` (**critique** : sans blâme, Five Whys, symptôme/cause/facteur,
  actions préventives) ;
- `resilience-patterns` (**critique** : timeout, retry, circuit breaker, backpressure,
  load shedding, graceful degradation, SPOF, RTO/RPO).

Chacune : on-ramp « 🌍 Le problème d'abord », prérequis explicités, vocabulaire au
premier usage, scénario « 🚨 Que faire dans ce cas ? », `practiceRefs`.

## 7. Leçons anciennes corrigées
En V28 (CP1→CP10) : aucune (l'audit rétroactif + corrections sont réalisés en CP11,
qui remplira `hardenedLegacy`). La matrice d'audit des 60 historiques est établie au
CP0 et détaillée dans `docs/PEDAGOGICAL-AUDIT-V28.md`.

## 8. Exercices ajoutés (6)
`slo-burn-rate`, `rca-classify-cause`, `alert-actionable`, `incident-severity`,
`circuit-breaker-state`, `retry-should` — déterministes, comblant des trous réels sur
une base obs/SRE déjà substantielle (latency-percentiles, cloud-error-budget,
incident-health-rollup, cloud-rollback-decision, cloud-detect-spof…). Contrat vérifié
par exécution (starter faux échouant ≥1 test public, référence verte, ≥1 test privé,
aucune fuite).

## 9. Missions
Aucune nouvelle mission : les ~8 missions obs/SRE/incident existantes
(cloud-observability-diagnosis, health-incident-postmortem, incident-dns-tls-http,
k8s-rolling-regression, slow-endpoint-optimization…) couvrent déjà les scénarios ;
elles sont reliées aux leçons via `practiceRefs`.

## 10. Scénarios « Que faire dans ce cas ? »
Intégrés dans les 8 leçons : dashboard vert mais incident réel, secret dans les logs,
dépendance externe lente, p95 qui explose après release, SLO consommé trop vite,
équipe qui s'affole, incident qui se répète, dépendance critique instable.

## 11. Glossaire (+27 termes)
télémétrie, instrumentation, log structuré, correlation ID, trace, span, sampling,
cardinalité, dashboard, fatigue d'alerte, Golden Signals, RED, USE, saturation, burn
rate, toil, timeout, retry, circuit breaker, backpressure, load shedding, rate
limiting, graceful degradation, redondance, Five Whys, blameless, progressive
delivery. Sans duplication (p95/p99/SLI/SLO/error budget/MTTR… déjà présents).
Glossaire 583 → 610.

## 12. Matrice des parcours (CP9)
`docs/architecture/v28-track-coherence.md` : les 6 parcours disponibles sont cohérents
(totalDays == jours résolus), data-driven, honnêtement cadrés junior/fondation. La
fondation obs/SRE se rattache à cloud-devops/systems-cloud par les compétences.

## 13. Tests
937 tests, 0 échec (dont V28 : intégrité audit/ledger, contrat d'exercices exécuté,
E2E obs/SRE + parcours).

## 14. Validation navigateur
Chromium pré-installé (aucun `playwright install`). Leçons `metrics-percentiles`,
`incident-response` et Lab `slo-burn-rate` — statut 200, **aucun débordement
horizontal, aucune erreur console** à **375 / 768 / 1024 / 1440 / 1920**. Rendu de
l'on-ramp + prérequis confirmé par capture.

## 15. Validations non réalisées
Interaction utilisateur pilotée réelle (soumettre un exercice via l'UI) : non
exécutée en navigateur (couverte au niveau logique par les tests d'exécution + E2E).
Audit d'accessibilité automatisé (axe) : non exécuté.

## 16. Réel vs simulé
Tout est simulé et étiqueté : aucune métrique/trace/alerte/incident réel. Les moteurs
d'exécution (runner d'exercices, Labs) sont PRÉEXISTANTS et sandboxés ; V28 n'ajoute
aucun `eval`/`exec` de runtime ni aucun fichier `app/`/`lib/` de production.

## 17. Sécurité
Aucun secret réel ; secrets d'exemple factices. Aucune fuite de solution/test privé
(testé). Leçon `logging-structured` insiste : jamais de secret dans les logs.

## 18. Performance & bundles
Aucun code runtime ajouté (V28 = données/docs/scripts/tests) ; build de production
sans erreur ; aucun impact bundle.

## 19. Responsive
375/768/1024/1440/1920 validés (CP10) sans débordement ni erreur console.

## 20. État des données
`progress.json` (gitignoré) intact (SHA `598f27c2…`). `program.json` régénéré
(nouvelles leçons + practiceRefs), déterministe hors `generatedAt`.

## 21. État Git
Branche `claude/ai-career-os-saas-phfg49`, commits atomiques par CP, poussés.

## 22. Limites honnêtes
La fondation obs/SRE est une base de RAISONNEMENT, pas une certification SRE ni un
outillage réel. L'audit rétroactif V28 est PARTIEL (priorité P0 en CP11) ; la dette
P1/P2 reste documentée pour V29. Les scores d'audit sont des proxys ; la validation
néophyte reste une lecture experte, pas un test utilisateur.

## 23. Avant / après
Avant : 92 leçons, 0 fondation obs/SRE dédiée, standard V27 sur 32 leçons seulement.
Après (fin CP10) : **100 leçons** (8 obs/SRE au standard V27), +6 exercices, +27
termes de glossaire, 6 parcours audités et cohérents. Corrections rétroactives des
historiques : CP11.

## 24. HEAD final, Git, données
Renseignés dans la synthèse finale (après CP11).
