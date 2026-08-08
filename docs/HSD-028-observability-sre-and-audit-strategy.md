# HSD-028 — Spécification pédagogique : Observabilité/SRE & audit rétroactif

Document de spécification humaine du Sprint V28. Complète ADR-028 (décisions) et
TSD-028 (spécification technique). Décrit CE QUE doivent contenir les nouvelles
leçons Observabilité/SRE/incident et COMMENT on audite/corrige les leçons
historiques.

## 1. Contrat de leçon (rappel V27, appliqué à V28)

Chemin néophyte : situation → intuition → vocabulaire → mécanisme → pratique. Chaque
leçon importante vise : `🌍 Le problème d'abord` → `🎯 Objectif` → `🧩 Prérequis` →
`🧠 Modèle mental` → explication progressive → exemple minimal → `🧭 Exemple guidé`
→ `⚠️ Erreurs fréquentes` → `🏢 Cas métier` → (`🚨 Que faire dans ce cas ?` si
pertinent) → `🎤 Questions d'entretien` → `🧾 À retenir` → `📚 Vocabulaire` →
`🔗 Liens` + `practiceRefs`. La structure SERT la compréhension ; ce n'est pas un
gabarit à copier mécaniquement.

## 2. Critère « néophyte complet » (règle non négociable)

Pour chaque leçon : « une personne intelligente mais totalement débutante peut-elle
comprendre POURQUOI le concept existe AVANT de mémoriser son vocabulaire ? »

Mauvais : « Un Pod en CrashLoopBackOff… » sans contexte. Bon : « Ton service
démarre, plante, est redémarré, replante ; le système finit par espacer les
tentatives : cet état s'appelle CrashLoopBackOff. » Toujours situation → intuition →
vocabulaire → mécanisme → pratique.

Application obligatoire aux nouvelles leçons obs/SRE :
- **Métriques/percentiles** : ne pas ouvrir sur « p99 » sans avoir montré, sur un
  exemple concret, qu'une moyenne acceptable peut cacher une catastrophe pour 1 %
  des requêtes.
- **SLI/SLO/error budget** : partir de « pourquoi 99,9 % n'est pas juste un joli
  chiffre » (temps d'indisponibilité toléré) avant les formules.
- **Incident** : partir d'une situation vécue (les erreurs explosent après une
  release) avant severity/triage/incident commander.
- **Résilience** : partir de « une dépendance ralentit et fait tomber tout le
  service » avant circuit breaker/backpressure.

## 3. Leçons Observabilité/SRE/incident à créer (spécification)

1. `observability-fundamentals` — monitoring (« est-ce cassé ? ») vs observability
   (« pourquoi ? »), les 3 piliers (logs/métriques/traces), quand chacun sert.
2. `logging-structured` — du `print` au log structuré ; niveaux (debug→error) ;
   correlation/request ID pour suivre une requête ; ne pas logger de secrets.
3. `metrics-percentiles` — types de métriques ; latence/débit/erreurs/saturation ;
   p50/p95/p99 et « la moyenne ment » ; RED, USE, Golden Signals ; cardinalité.
4. `distributed-tracing` — trace, span, contexte propagé ; instrumentation ;
   sampling ; à quoi ça répond que logs/métriques ne peuvent pas.
5. `slo-error-budget` — SLI (mesure), SLO (objectif), SLA (contrat) ; error budget
   et burn rate ; « pourquoi 99,9 % » ; arbitrage fiabilité vs vélocité ; toil.
6. `incident-response` — cycle de vie (détection→mitigation→résolution) ; severity/
   impact/scope ; triage ; incident commander ; communication ; timeline ; preuves.
7. `postmortem-rca` — post-mortem SANS blâme ; RCA ; Five Whys ; symptôme vs cause
   vs facteur contributif ; actions correctives vs préventives.
8. `resilience-patterns` — timeout, retry (avec backoff/idempotence), circuit
   breaker, backpressure, rate limiting, load shedding, graceful degradation,
   failover, redondance, SPOF, RTO/RPO.

Chaque leçon : accessible au néophyte, exemples réels, `practiceRefs`, erreurs
fréquentes, scénario production. Distinctes entre elles et de l'existant.

## 4. « Que faire dans ce cas ? » — méthode de raisonnement

Les scénarios enseignent une méthode, jamais « redémarre le serveur » :
1. observer → 2. limiter l'impact → 3. collecter les preuves → 4. formuler des
hypothèses → 5. tester → 6. corriger → 7. valider → 8. surveiller → 9. documenter →
10. prévenir la récidive. Scénarios prioritaires : p95 qui explose après release,
5xx après déploiement, feature qui en casse une autre, migration DB qui échoue,
memory leak, disque plein, dépendance externe lente, file qui grossit, rollback
impossible, CI verte mais prod cassée, alerte sans impact, incident réel mais
dashboard vert, SLO consommé trop vite.

## 5. Audit rétroactif des leçons historiques

Grille (16+ dimensions du moteur existant, plus signaux structurels V28 : jargon
front-loading, prérequis implicites, absence d'intuition, densité, pratique reliée).
Classement P0→P3 (cf. ADR-028). **Correction ciblée** des P0/P1 de premier contact :
ajout on-ramp + prérequis + modèle mental si absent + `practiceRefs` vers exercices
EXISTANTS ; contenu correct conservé. Le reste = dette V29 documentée.

Seuils (repris de la rubrique) : moyenne ≥ 3,25 (contenu récent) ; dimensions
obligatoires ≥ 3 (exactitude, objectif, progression, pratique autonome) ; aucune
dimension < 2. Un score élevé ne VALIDE pas seul une leçon : la lecture « néophyte »
prime.

## 6. Rôle de CP11

Ré-auditer : (A) nouvelles leçons V28 ; (B) historiques corrigées ; (C) échantillon
d'historiques NON modifiées ; (D) les 9 leçons denses V27. Beginner walkthrough
complet (débutant → leçon → concept → exemple → exercice → Lab/mission → preuve) sur
au moins une séquence. Produire `docs/PEDAGOGICAL-AUDIT-V28.md`. Rejouer toute la
batterie après toute modification.

## 7. Honnêteté réel/simulé (non négociable)

Aucune métrique, trace, alerte ou incident RÉEL n'est produit ; les leçons enseignent
le raisonnement sur des exemples déterministes étiquetés. Pas de faux dashboard
présenté comme réel. Secrets factices. Ne jamais présenter « redémarrer » comme
solution universelle.
