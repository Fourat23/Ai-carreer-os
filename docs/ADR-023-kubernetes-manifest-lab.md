# ADR-023 — Kubernetes & Orchestration Lab (analyse déterministe de manifests)

Statut : accepté (Sprint V23). Décision fondée sur l'audit CP0 réel. Étend
l'existant ; aucun second moteur de progression, aucun cluster obligatoire, aucun
appel à un cluster distant, **aucun réseau requis**, aucun credential, aucun secret
réel, **aucune isolation OS prétendue**.

## Problème produit

L'audit CP0 montre que le parcours Systems & Cloud enseigne le conteneur (Docker,
jours 320-321), le déploiement (jour 81) et la topologie cloud (V22), mais **pas
l'orchestration** : Kubernetes est totalement absent. Or c'est la brique qui
manque entre « je sais construire une image » et « je sais faire tourner un
service résilient » : Pod/Deployment/Service, probes, requests/limits, rollout/
rollback, et les incidents caractéristiques (CrashLoopBackOff, ImagePullBackOff,
OOMKilled, Service sans endpoints). L'environnement ne dispose d'**aucun** outil
Kubernetes (kubectl/kind/minikube/k3d/helm absents, aucun cluster).

## Décision : un ANALYSEUR/SIMULATEUR DÉTERMINISTE, pas une console kubectl

V23 livre un **modèle de manifest** + un **analyseur de configuration** + un
**simulateur de réconciliation/incidents** + un **Kubernetes Manifest Lab**
intégré. Le produit dit clairement ce qu'il est :

- un **laboratoire d'analyse de manifests pédagogique** ;
- **pas** une console `kubectl`, **pas** un cluster, **pas** un scheduler complet,
  **pas** un provisioning réel, **pas** une isolation OS.

### D1 — Quatre niveaux distincts, honnêtement séparés

1. **Validation syntaxique/structurelle** : le manifest est-il un objet bien formé
   (kind connu, champs bornés, refs cohérentes) ? — `lib/manifest.mjs`, PUR.
2. **Analyse sémantique** : quels risques/défauts (selector orphelin, pas de
   probe, `latest`, requests/limits manquants, secret en clair…) ? —
   `lib/manifest-analysis.mjs`, PUR.
3. **Simulation déterministe** : à partir de l'état DÉSIRÉ, quel état OBSERVÉ
   attendu (pods d'un Deployment, endpoints d'un Service via selector) et quel
   comportement sous incident (CrashLoopBackOff, rollout bloqué…) ? —
   `lib/manifest-reconcile.mjs`, PUR, horloge injectable.
4. **Exécution réelle éventuelle** : **désactivée**. L'adaptateur signale l'état,
   mais aucun bouton n'exécute quoi que ce soit sans cluster réel + sûreté explicite.

### D2 — Manifests en JSON (pas de parseur YAML fragile)

Aucun parseur YAML n'est installé et en ajouter un imposerait une installation
réseau non reproductible hors ligne. Les manifests sont donc modélisés et livrés
en **JSON** : les manifests Kubernetes sont sémantiquement identiques en JSON
(kubectl l'accepte nativement ; YAML en est un sur-ensemble). Le modèle valide
l'**objet** manifest, comme `topology.mjs` valide une topologie. **Aucune
dépendance ajoutée**, aucun parseur artisanal fragile. L'éditeur du Lab réutilise
CodeMirror (`lang-javascript`, déjà présent) pour du JSON.

### D3 — Adaptateur de disponibilité kubectl, honnête

Sur le patron de `lib/terminal-docker.mjs` (`detectDocker`), un adaptateur
`kubectlAvailability()` renvoie un état **honnête**, sans jamais lever :

| État | Signification | UI |
|---|---|---|
| `absent` | `kubectl` introuvable | Analyse locale seule ; aucun bouton « Exécuter » |
| `cli-only` | `kubectl` présent, aucun cluster | idem ; état affiché |
| `cluster` | cluster joignable | « Exécuter réellement » possible SEULEMENT si explicitement sûr |
| `denied` | accès refusé | état affiché, aucune action |

Dans l'environnement actuel, l'état réel est **`absent`** : le Lab fonctionne en
analyse/simulation pure, ce qui est dit à l'utilisateur.

### D4 — Modèle de ressources, d'incident et de rollout

- **Ressources** : Pod, ReplicaSet, Deployment, StatefulSet, DaemonSet, Job,
  CronJob, Service (ClusterIP/NodePort/LoadBalancer), Ingress, ConfigMap, Secret
  (référencé, jamais de valeur réelle), Namespace, PVC, ServiceAccount.
- **Incident** (allowlist fermée) : CrashLoopBackOff, ImagePullBackOff, Pending,
  OOMKilled, readiness jamais verte, liveness trop agressive, mauvais selector,
  Service sans endpoints, rollout bloqué, régression après nouvelle image,
  rollback (im)possible, secret exposé, saturation CPU/mémoire, dépendance en
  panne, configuration manquante.
- **Rollout** : à partir de la stratégie (RollingUpdate/Recreate) et de
  `maxUnavailable`/`maxSurge`, calcul déterministe des pods disponibles au fil du
  rollout, et rollback vers la version précédente.

### D5 — Diagnostics : preuve + compromis, jamais de note magique

Chaque diagnostic porte `code` stable, `severity`, `resource`, `path`, `message`,
`explanation`, `risk`, `recommendation`, `autofixable` (bool), `glossary`,
`category` (security/availability/performance/maintenance/delivery/observability).
La synthèse agrège par sévérité et liste les dimensions couvertes — **jamais** de
« note Kubernetes universelle ».

### D6 — Section « Que faire dans ce cas ? »

V23 crée une **méthode professionnelle réutilisable** (symptômes → risque → à ne
pas faire → vérifications → hypothèses → données → décision rollback/roll-forward/
hotfix/feature-flag → validation → communication → documentation/prévention),
instanciée sur plusieurs cas (CrashLoopBackOff, OOMKilled, Service inaccessible,
rollout bloqué, régression, migration bloquant le rollback, secret exposé…). Elle
prolonge le modèle de mission V18 et le modèle de diagnostic — pas d'infrastructure
morte.

## Intégration au Cloud Lab, aux pipelines et aux missions

Le Manifest Lab **réplique** le patron du Cloud Topology Lab (V22) et du Pipeline
Lab (V21) : modèle pur → validation → analyse/simulation → serveur (vues publiques
anti-fuite) → API synchrone déterministe → UI en panneaux lazy-loadée. Exercices
via le contrat existant, missions via le moteur V18, recherche/glossaire/sauvegarde
réutilisés. Aucun second Workbench, aucun second moteur de progression.

## Stratégie d'imports & discipline de bundle

`TOPOLOGY_CAPS`-équivalent (`MANIFEST_CAPS`) borne tailles/profondeurs/nombre de
ressources. Analyse et simulation **côté serveur** (absentes des bundles client).
CodeMirror **lazy** sur la seule route Lab. **Aucune dépendance ajoutée**, aucun
paquet mis à jour, aucun CDN.

## Sécurité

Modèle/analyse/réconciliation **purs** : aucun `eval`, aucun `Function`, aucun
`exec`/`spawn`, aucun `shell`, aucune I/O réseau, aucun argument utilisateur
injecté dans une commande. Secrets **conceptuels** (un `Secret` mal utilisé est un
diagnostic, jamais une valeur réelle). Vues publiques anti-fuite (jamais de
solution d'exercice, de test privé, de livrable). Protections décrites honnêtement
(validation, allowlists, bornes) — **pas** une isolation noyau/OS ; un Namespace
n'est **pas** présenté comme une frontière de sécurité OS.

## Alternatives rejetées

- **Exiger un cluster réel (kind/minikube)** — indisponible et contraire à la
  nature locale : rejeté.
- **Parseur YAML artisanal** — fragile et inutile (JSON suffit) : rejeté.
- **Ajouter une dépendance YAML** — installation réseau non reproductible hors
  ligne, gain nul vs JSON : rejeté pour V23 (réévaluable si un besoin réel émerge).
- **Reproduire le scheduler Kubernetes** — hors de portée et trompeur : rejeté ;
  on simule des **propriétés qualitatives** déterministes, pas l'ordonnanceur.
- **Second Lab isolé, hors patron existant** — contraire à la consigne de
  réutilisation : rejeté.
- **Boutons « Déployer » actifs sans cluster** — malhonnête : rejeté.

## Limites honnêtes

- Analyseur/simulateur **déterministe**, **pas** un cluster ; aucun scheduler réel,
  aucune isolation OS, aucun Namespace présenté comme frontière OS.
- Un manifest « analysé » n'est **jamais** « déployé » tant qu'aucun cluster réel
  ne l'exécute (état réel ici : `absent`).
- La qualité **sémantique** des livrables de mission (runbook, post-mortem, plan de
  rollback) relève de la **revue humaine**.
- Matrice navigateur : Chromium pré-installé exploité si possible en CP9, sinon
  repli HTTP honnête (« non vérifié visuellement »).

## Conséquences

- Nouveaux modules : `lib/manifest.mjs` (+ `.d.ts`), `lib/manifest-analysis.mjs`,
  `lib/manifest-reconcile.mjs`, `lib/manifest-kubectl.mjs` (adaptateur),
  `lib/manifests-server.ts`, `app/kubernetes/**`, `app/api/kubernetes/**`,
  `data/manifests/*.json`.
- Nouvelle gate **`v23:check`** (manifests valides + anti-fuite + dérive éditoriale
  + profondeur), ajoutée à la batterie active.
- Enrichissement additif des jours 320-321 (+ lien 81) ; section « Que faire dans
  ce cas ? » ; ≥ 14 exercices ; ≥ 6 missions ; termes de glossaire k8s ;
  intégration parcours/recherche/sauvegarde ; assainissement des gates (CP9).
