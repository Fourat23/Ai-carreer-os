# Sprint V22 — Cloud Foundations Lab & Deployment Topologies

Rapport de clôture (rédigé en français). Livraison d'un **laboratoire local,
déterministe et sûr d'analyse de topologies de déploiement cloud** — modèle
déclaratif pur, moteur de validation et de diagnostics, simulation d'incident
bornée, un **Cloud Topology Lab** (UI + API), du contenu cloud approfondi, des
exercices et missions déterministes, une intégration au parcours Systems & Cloud,
et un audit pédagogique réel.

> **Nature honnête du livrable** : ce n'est **pas** une console cloud. Aucune
> intégration AWS/Azure/GCP, **aucun réseau**, aucun credential, aucun secret
> réel, aucun provisioning, **aucune** revendication d'isolation OS. Une topologie
> se **raisonne** ici (SPOF, disponibilité, coûts qualitatifs) par analyse
> déterministe. Les chiffres de disponibilité et de coût sont **pédagogiques**,
> jamais contractuels.

## 1. État initial réel

Fin V21 (HEAD `914a6d4`), 715 tests, CI/CD Pipeline Lab livré, 4 parcours
disponibles, `data/progress.json` gitignoré au SHA `cea317e8`, working tree
propre, local == origin. Aucun contenu cloud/déploiement dédié ; les jours 78-81
(module `scf-05` du parcours Systems & Cloud) couvraient l'architecture 3-tiers,
l'observabilité, le cache et les trade-offs — ancres réelles pour V22.

## 2. Divergences constatées

- Aucune divergence de baseline : HEAD exactement `914a6d4`, V22 non commencé.
- **Divergence assumée vs le mot « cloud »** : livré comme **laboratoire d'analyse
  déterministe**, jamais comme console/provisioning cloud (ADR-022).
- **Gate `v21:check` devenue gelée** : sa détection de dérive se déclenche sur les
  jours 78-81 enrichis par V22 (hors de son périmètre 307/326). Les 3 pipelines
  V21 restent valides — non-régression documentée (§17).

## 3. Audit pédagogique

Modèle réel `lib/pedagogy-audit.mjs` : **scan de danger** (30 fichiers V22 → **0
signal bloquant**) + **registre de notes humaines** étendu à **68 items** (62
récents), tous ≥ seuil. Moyennes : jours ≈ 3,50/4, exercices 3,56/4, missions
3,50/4. **Aucun défaut démontré** → aucune correction de contenu. Rapport complet :
`docs/PEDAGOGICAL-AUDIT-V22.md`. Revue humaine restant nécessaire : qualité
sémantique des livrables documentaires des missions.

## 4. Architecture retenue

Réplique du patron « Lab » de V21, appliqué à la topologie (ADR/HSD/TSD-022) :
- **Modèle pur** `lib/topology.mjs` (+ `.d.ts`) : `NODE_KINDS` (24), `EDGE_KINDS`
  (8), `ENVIRONMENTS` (5), `TOPOLOGY_CAPS`, `validateTopology`,
  `publicTopologyView` (anti-fuite), `findCycle`, `longestChain`.
- **Analyse** `lib/topology-analysis.mjs` : registre de **15 règles pures** →
  diagnostics (code/sévérité/preuve/recommandation/compromis), synthèse par
  sévérité + dimensions couvertes, **jamais** de note magique.
- **Scénario** `lib/topology-scenario.mjs` : allowlist `drop-node`/`drop-zone`/
  `dependency-down`/`traffic-spike`, atteignabilité client→service, déterministe.
- **Serveur** `lib/topologies-server.ts`, **API** `app/api/cloud-lab/[id]`, **UI**
  `app/cloud-lab/**` (panneaux, lazy-load).

## 5. Checkpoints (CP0 → CP10)

| CP | Objet | Commit |
|---|---|---|
| CP0 | Audit forensique & pédagogique (lecture seule) | — |
| CP1 | ADR/HSD/TSD-022 | `43e0778` |
| CP2 | Modèle pur de topologie + validation | `debb422` |
| CP3 | Moteur d'analyse (diagnostics) + simulation | `cf80f8f` |
| CP4 | Cloud Topology Lab (données + serveur + API + UI) | `9d59a9c` |
| CP5 | Enrichissement Cloud jours 78-81 + gate v22:check | `0e2aaa5` |
| CP6 | 14 exercices Cloud déterministes | `4d4f28c` |
| CP7 | 6 missions d'ingénierie Cloud | `6778b36` |
| CP8 | 43 termes de glossaire | `4ae898b` |
| CP9 | Intégration (parcours, recherche, palette) + E2E | `3f083c2` |
| CP10 | Audit, batterie finale, rapport, prompt V23 | (ce commit) |

Chaque checkpoint : audit → conception → implémentation → tests → tsc → build (si
pertinent) → validation réelle → restauration `progress.json` → nettoyage →
commit atomique → push.

## 6. Commits

9 commits de contenu (CP1→CP9) + ce commit (CP10), sur
`claude/ai-career-os-saas-phfg49`, tous poussés. Aucun commit vide ni parasite ;
CP0 sans commit (lecture seule, baseline saine).

## 7. Tests avant / après

- Avant V22 : **715** tests.
- Après V22 : **761** tests (+46 : 14 modèle topologie, 26 analyse+scénario, 6
  contenu topologies). 761/761 verts.

## 8. Contenus enrichis

Jours **78-81** (source `scripts/data/days-enrich-61-90.mjs`, additif) : 78
déploiement du 3-tiers dans le cloud (IaaS/PaaS/SaaS/FaaS, responsabilité
partagée, région/zone, base jamais exposée) ; 79 haute disponibilité (SPOF,
failover, actif/actif vs passif, liveness/readiness, SLO/budget d'erreur) ; 80
scalabilité (verticale/horizontale, autoscaling, stateless/stateful, compromis) ;
81 déploiement (recreate/rolling/blue-green/canary/feature flag), régressions,
vocabulaire précis (rollback/roll-forward/hotfix/mitigation/workaround), blast
radius, RTO/RPO, responsabilité partagée. **Dérive contrôlée** : seuls 78-81
changent (`program.json` restauré, `generatedAt` volatil écarté).

## 9. Exercices créés

**14** exercices déterministes `cloud-*` (jours 78-81) : classer un tier, base
exposée, modèle de service ; détecter un SPOF, multi-zone, readiness routing,
budget d'erreur ; choix de scaling, nombre de réplicas, stateful+autoscaling ;
stratégie de déploiement, décision de reprise, RPO tenu, blast radius. Chacun :
référence 100 % verte, starter casse ≥ 1 test public, tests privés cachés,
compétences connues. Total du projet : **124** exercices.

## 10. Missions créées

**6** missions `cloud-*` (moteur V18) : cloud-three-tier (documentation),
cloud-high-availability (incident), cloud-cost-reduction (performance),
cloud-backup-recovery (documentation), cloud-broken-release (incident),
cloud-secure-exposure (incident). Livrables auto + structurel + revue humaine ;
évaluation honnête. Total du projet : **21** missions.

## 11. Termes de glossaire ajoutés

**43** termes (397 → **440**) : cloud (SaaS/FaaS, responsabilité partagée, région,
zone de disponibilité), réseau (reverse proxy, security group, firewall,
certificat), stockage (objet/bloc/fichier/éphémère), HA (haute disponibilité,
SPOF, failover, actif/actif-passif), scalabilité (horizontale/verticale,
autoscaling, stateless/stateful), reprise (disaster recovery, RTO, RPO,
sauvegarde, test de restauration), déploiement (environnement, staging, canary,
rolling, recreate, feature flag, dark launch, smoke test, vérification
post-déploiement, plan de rollback, blast radius, change freeze), régressions
(régression, non-régression, roll-forward, revert, mitigation, workaround, root
cause, facteur contributif, change failure rate, incident commander, compatibilité
ascendante/descendante, migration expand-and-contract). Alias FR + EN ; recherche
insensible aux accents/variantes via la normalisation existante.

## 12. Cloud Topology Lab

Route `/cloud-lab` (catalogue filtrable) et `/cloud-lab/[id]` (analyseur en
panneaux : Composants / Connexions / Diagnostics + simulation d'incident bornée).
Édition/interaction bornée (listes fermées, scénarios en allowlist), lazy-loadée,
accessible (clavier, focus, alternative textuelle complète en tables). 3
topologies livrées : `three-tier-ha` (saine), `exposed-monolith` (à
diagnostiquer), `canary-no-metric` (régression).

## 13. Intégration multi-parcours

Le contenu cloud vit dans les jours 78-81, déjà rattachés au parcours **Systems &
Cloud** (module `scf-05`, résumé mis à jour ; 31 jours inchangés). Les exercices
et missions portent `trackScope`/`trackRefs` incluant `systems-cloud-foundations-v1`
et `ai-engineer-foundations-v1`. Aucun second système de progression : réutilisation
de la sauvegarde par parcours (`schemaVersion:3`, `{ activeTrackId, tracks{} }`).

## 14. Validations navigateur réellement effectuées

Smoke réel via `next start` (routes) : `/day/78` (200, expose ses exercices
cloud), `/cloud-lab` (200), `/cloud-lab/three-tier-ha` (200, analyse rendue),
`/lab/cloud-detect-spof` (200), `/missions/cloud-broken-release` (200),
`/glossary` (200), `/api/search-index` (753 items dont 3 topologies),
`/api/cloud-lab/*` (GET analyse, POST scénario, 404/400/422). Serveur arrêté,
port fermé.

## 15. Validations non effectuées

**Matrice visuelle 375/768/1024/1440/1920 non automatisée** : `@playwright/test`
est **absent** de l'environnement. Vérification **statique** : le Lab réutilise les
classes responsives existantes (`.pl-*`, `.cl-*` avec `grid` repliable à 900px,
tables en `overflow-x:auto`), sans nouveau point de rupture ; le build ne signale
aucun débordement. **À confirmer** par un test navigateur réel quand Playwright
sera disponible — dette explicite, non maquillée.

## 16. Sécurité

Modèle/analyse/scénario **purs** : `grep` confirme **0** `eval`, `exec*`, `spawn`,
`shell`, `child_process`, **aucune I/O réseau**. Aucun secret réel (les
`secret-store` sont conceptuels). Protections décrites honnêtement (validation,
allowlists de kinds/scénarios, bornes `TOPOLOGY_CAPS`, vues publiques) — **pas**
une isolation noyau/OS.

## 17. Anti-fuite

`v22:check` vérifie qu'aucune vue publique de topologie ne contient de champ
interne sensible ni de secret (motifs `sk-`/`ghp_`/`AKIA` masqués). La recherche
n'indexe que des métadonnées publiques (jamais de solution d'exercice, de test
privé, de livrable, ni de code utilisateur).

## 18. Performances

Analyse **bornée** (registre de règles fini, tri déterministe, pas de boucle) ;
UI **lazy-loadée** sur la route Lab ; **aucun composant lourd** sur `/` ni hors
Lab ; **aucune bibliothèque de diagramming** externe. L'analyse est calculée
côté serveur (API), donc absente des bundles client.

## 19. Bundles

Partagé **103 kB** (inchangé). `/cloud-lab` 108 kB, `/cloud-lab/[id]` 110 kB,
`/api/cloud-lab/[id]` 103 kB. Aucune dépendance ajoutée, aucun paquet mis à jour.

## 20. Accessibilité

Navigation clavier, focus visible (styles existants), pas d'overflow horizontal
global (tables scrollables dans leur conteneur), **alternative textuelle
complète** (toute l'architecture est lisible en tables — aucune information
uniquement graphique), chips de sévérité en `aria-pressed`, `role="status"`/`alert`
sur les résultats de scénario.

## 21. Responsive

`.cl-grid` passe à une colonne sous 900px ; tables en `overflow-x:auto` ; unités
relatives et tokens existants. Matrice automatisée non exécutée (Playwright absent,
§15).

## 22. Sauvegarde et migrations

Aucune migration de schéma : les topologies sont du **contenu versionné**
(`data/topologies`), pas de l'état utilisateur. Un run d'analyse est **sans état**
(l'API ne persiste rien, aucune écriture de `data/`). La sauvegarde par parcours
existante reste intacte et rétrocompatible.

## 23. Régressions et déploiements cassés couverts

Le thème est enseigné (jour 81), exercé (`cloud-rollback-decision`,
`cloud-deploy-strategy`, `cloud-blast-radius`), mis en mission
(`cloud-broken-release` : régression → décision rollback/roll-forward/hotfix →
plan de vérification → communication → root cause), incarné en topologie
(`canary-no-metric`) et outillé en glossaire (régression, roll-forward, revert,
mitigation, workaround, blast radius, change failure rate…).

## 24. Limites honnêtes

Laboratoire **déterministe**, **pas** un cloud réel ; disponibilité/coût
**qualitatifs**, jamais contractuels ; aucune isolation OS/noyau, aucune VM,
aucune iframe présentée comme conteneur ; qualité sémantique des livrables de
mission en **revue humaine**. Édition **libre** de topologie non livrée (analyse +
scénarios bornés seulement) — dette UI. Matrice navigateur non automatisée
(Playwright absent).

## 25. État Git final

Branche `claude/ai-career-os-saas-phfg49`, poussée. Working tree propre après ce
commit.

## 26. HEAD final

Ce commit CP10 (précédent : `3f083c2`).

## 27. local == origin

Oui, après le push de ce commit.

## 28. SHA final de progress.json

`cea317e8714af1fbf2dcb4227130ba5b912d17c9` (pristine, inchangé sur tout le sprint).

## 29. Absence de workspaces / serveurs / conteneurs

Aucun résidu : serveurs `next` arrêtés (port fermé), aucun workspace temporaire,
Docker non requis (daemon absent, sans impact — le Lab n'exécute rien).

## 30. Résumé avant / après

| | Avant V22 | Après V22 |
|---|---|---|
| Contenu cloud/déploiement | absent | jours 78-81 approfondis |
| Laboratoire cloud | — | Cloud Topology Lab (modèle + 15 règles + 4 scénarios) |
| Exercices | 110 | **124** (+14 cloud) |
| Missions | 15 | **21** (+6 cloud) |
| Topologies | 0 | **3** |
| Glossaire | 397 | **440** (+43) |
| Tests | 715 | **761** |
| Gates actives | vertes | vertes (+`v22:check`) |
| progress.json | `cea317e8` | `cea317e8` (inchangé) |

**Gates actives V22** : `curriculum:check`, `curriculum:depth-check`,
`glossary:check`, `v18:check`, `v20:pedagogy-check`, `v22:check` — toutes vertes.
**Gates historiques gelées** : `v17:check`, `v19:check`, `v21:check` (dérive
attendue, non-régression, cf. `docs/architecture/v20-gates-strategy.md`).

## 31. Prompt complet — Sprint V23

```
Reprends AI Career OS pour le Sprint V23 — « Kubernetes & Orchestration Lab ».
AI Career OS reste une application d'apprentissage STRICTEMENT LOCALE,
MONO-UTILISATEUR : aucune authentification, aucun SaaS, aucun réseau requis pour
apprendre, aucune télémétrie, aucune dépendance à un fournisseur cloud réel. Tu
prolonges V19 (Linux/réseau), V20 (Docker/terminal borné), V21 (CI/CD Pipeline
Lab) et V22 (Cloud Topology Lab).

TOUS les rapports, audits, tableaux, synthèses et prompts de reprise doivent être
rédigés EN FRANÇAIS (les noms officiels — commandes, chemins, identifiants, types,
termes comme rollback, blue/green, canary, pod, deployment, service — peuvent
rester en anglais). Ne rédige pas la synthèse finale en anglais.

IMPORTANT — COMMENCE IMPÉRATIVEMENT PAR CP0, EN LECTURE SEULE. État théorique à
VÉRIFIER (ne jamais le supposer) : branche claude/ai-career-os-saas-phfg49 ; HEAD
approximatif = le commit CP10 de V22 ; Sprint V22 terminé ; 761 tests verts ;
Cloud Topology Lab livré ; 4 parcours disponibles ; data/progress.json restauré
au SHA cea317e8 (gitignoré) ; aucun résidu ; working tree propre ; local == origin.
Si HEAD diffère : inspecte git status/log, identifie les commits présents,
détermine si V23 a déjà été partiellement exécuté, ne réimplémente jamais un
checkpoint livré, reprends au dernier état validé. Si V23 est déjà complet,
n'écris rien et produis un rapport d'audit réel.

CONTRAINTES PERMANENTES (inchangées) : local, mono-utilisateur, sans auth, sans
SaaS, sans cloud réel, sans cluster réel, sans kubectl réel contre un vrai
cluster, sans credentials, sans secret réel, sans réseau requis, sans CDN/script
distant, sans faux claim d'isolation OS. Ne jamais présenter : un sandbox comme
une isolation OS ; un processus local comme un pod/nœud réel ; une simulation
comme un vrai orchestrateur ; un calcul simplifié comme une garantie. Décrire les
protections honnêtement (validation, allowlists, bornes, timeouts, sorties
bornées, vue publique).

DISCIPLINE DE DONNÉES ET DE GIT (inchangée) : avant toute validation mutante,
sauvegarde data/progress.json + note son SHA + l'état des workspaces/processus/
ports. Après, restaure-le à l'identique, supprime les workspaces de test, arrête
serveurs et processus enfants, confirme le SHA initial et l'absence de résidu.
Chaque checkpoint : audit ciblé → conception minimale → implémentation → tests
unitaires → typecheck → build → validation réelle des routes/UI → restauration →
nettoyage → commit atomique → push. Aucun commit vide/parasite ; ne pas mettre à
jour Next.js ni les dépendances sans justification démontrée.

SOURCE DE VÉRITÉ ÉDITORIALE (inchangée) : les cours vivent dans scripts/data/*.mjs
et génèrent curriculum/days + data/program.json ; ne pas éditer les Markdown
générés directement ; après régénération, seules les journées visées changent, les
autres restent byte-identiques, program.json ne doit changer que par generatedAt
(à restaurer avant commit). Le glossaire a sa source structurée. Backticks inline
échappés (\`) dans les littéraux de théorie.

OBJECTIF PRODUIT V23 : un « Kubernetes & Orchestration Lab » local, déterministe et
sûr, dans la même philosophie que le Cloud Topology Lab. RAISONNER un manifeste
d'orchestration et son comportement — PAS piloter un vrai cluster. Il ne doit pas
devenir une fausse console kubectl.

SUJETS PÉDAGOGIQUES À COUVRIR AVEC PROFONDEUR RÉELLE (pas seulement mentionner) :
- Modèle mental : orchestration vs conteneur seul (rappel V20) ; état DÉSIRÉ vs
  état OBSERVÉ ; boucle de réconciliation ; déclaratif vs impératif.
- Objets : pod, replicaset, deployment, service (ClusterIP/NodePort/LoadBalancer),
  ingress, configmap, secret (conceptuel), namespace, node, label/selector.
- Ordonnancement : requests/limits, ressources, affinity/anti-affinity (conceptuel),
  éviction, QoS, autoscaling (HPA au niveau conceptuel).
- Santé & résilience : liveness/readiness/startup probes, restartPolicy, replicas,
  PodDisruptionBudget (conceptuel), rolling update et rollback d'un deployment.
- Réseau & exposition : service ↔ pods via selector, ingress, DNS interne
  (conceptuel), politique réseau (conceptuel).
- Configuration & état : configmap/secret montés, stateless vs stateful,
  volumes/PVC (conceptuel), StatefulSet (introduction).
- Anti-patterns : un seul replica en prod, pas de probes, requests/limits absents,
  selector qui ne matche aucun pod, secret en clair, latest tag, etc.

CE QU'IL FAUT LIVRER (indicatif ; chaque CP atomique) :
1. ADR/HSD/TSD-023 pour le Kubernetes & Orchestration Lab (réutilise le patron
   modèle pur → validation → analyse/simulation → UI ; décide honnêtement de la
   frontière simulation/cluster réel ; alternatives rejetées ; prépare — sans
   créer — d'éventuels scénarios « Que faire dans ce cas ? »).
2. Modèle pur de manifeste (lib/manifest.mjs + .d.ts) : objets ci-dessus, bornes,
   validation (selectors résolus, refs configmap/secret existantes, replicas/
   probes/limites cohérents, anti-fuite de la vue publique), sérialisable/migrable.
3. Moteur d'analyse déterministe (lib/manifest-analysis.mjs) : diagnostics
   (code/sévérité/preuve/recommandation/compromis) — selector orphelin, pas de
   probe, replicas=1 en prod, requests/limits manquants, secret en clair, latest,
   service sans endpoints… + synthèse par sévérité/dimensions, jamais de note magique.
4. Moteur de réconciliation/scénario PUR (lib/manifest-reconcile.mjs) : à partir de
   l'état désiré, calculer l'état observé attendu (pods créés par un deployment,
   endpoints d'un service via selector), simuler drop-pod / drop-node / rolling
   update / rollback, recalculer disponibilité — déterministe, horloge injectable.
5. Kubernetes & Orchestration Lab (UI + API) : catalogue de manifestes filtrable,
   vue objets/relations (deployment→replicaset→pods, service→pods), diagnostics
   filtrables, simulation, vue graphique SIMPLE + alternative textuelle complète,
   accessible, lazy-loadée, responsive ; métadonnées PUBLIQUES indexées en recherche.
6. Enrichissement pédagogique : identifier les journées d'ancrage réelles
   (probablement autour de Docker/déploiement — jours 320/321 et/ou 78-81 ; NE PAS
   déplacer le contenu) et les enrichir ADDITIVEMENT ; gate v23:check (manifestes
   valides + anti-fuite + dérive + profondeur). Interdit : définitions
   superficielles, fausses équivalences, « utilise toujours X », chiffres inventés.
7. 12 à 16 exercices déterministes (résoudre un selector, compter les endpoints,
   détecter un manifeste sans probe, calculer les pods d'un rolling update,
   décider rollback, repérer un secret en clair, valider requests/limits…) +
   respect strict du contrat (starter incorrect non trivial, réf 100 % verte, ≥1
   test public échoue, tests privés, aucun secret, déterminisme).
8. 5 ou 6 missions d'ingénierie (déploiement sans probe qui casse en silence ;
   service qui ne route vers aucun pod ; rolling update raté et rollback ; secret
   exposé ; sous-dimensionnement/ressources ; stateful mal orchestré) — moteur V18,
   évaluation honnête (forme auto-validable, fond en revue humaine).
9. Glossaire : termes k8s pertinents (pod, deployment, replicaset, service,
   ingress, configmap, namespace, selector, probe, HPA, requests/limits, rolling
   update, statefulset, PVC, réconciliation, état désiré…) avec alias FR/EN, sans
   doublon sémantique.
10. Intégration (parcours Systems & Cloud, Vue Jour, Lab, missions, compétences,
    révisions, recherche, glossaire, sauvegarde, isolation par parcours), E2E réel,
    puis batterie complète (tests, tsc, build, gates actives, sécurité,
    déterminisme, matrice navigateur 375/768/1024/1440/1920 — documenter si
    Playwright indisponible), restauration progress.json, nettoyage,
    docs/SPRINT-V23.md (mêmes sections que V22, EN FRANÇAIS) + prompt complet V24.
    NE DÉMARRE PAS V24.

RAPPELS DE COHÉRENCE : les gates v17:check, v19:check et v21:check sont des
instantanés HISTORIQUES GELÉS (échec de dérive attendu, non-régression, cf.
docs/architecture/v20-gates-strategy.md) — ne pas les rendre vertes
artificiellement ; v18:check et v20:pedagogy-check et v22:check restent courantes ;
continue le système d'audit pédagogique (registre v20-pedagogy-audit.json +
rapport) ; garde les vues publiques strictement anti-fuite ; toute journée enrichie
l'est de façon ADDITIVE et échappée ; jamais de promesse d'isolation OS, de cluster
réel ni de chiffres inventés. La synthèse finale affichée doit être EN FRANÇAIS.
```

## Synthèse

Le Sprint V22 livre un **Cloud Topology Lab** local et déterministe : modèle de
topologie pur, moteur de 15 règles de diagnostic, simulation d'incident bornée, UI
accessible, 3 topologies, 14 exercices, 6 missions, 43 termes de glossaire, et un
enrichissement additif des jours 78-81. Tous les tests (761), le typecheck, le
build et les gates actives sont verts ; `progress.json` est resté pristine ; aucun
résidu. Ce qui est **simulé** (disponibilité, coût, incident) et ce qui est **réel**
(analyse déterministe, code pur) sont clairement distingués — aucune promesse de
cloud réel ni d'isolation OS.
