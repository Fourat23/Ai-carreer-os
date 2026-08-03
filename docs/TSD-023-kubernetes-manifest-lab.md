# TSD-023 — Conception technique détaillée : Kubernetes & Orchestration Lab

Document technique détaillé (Sprint V23). Complète ADR-023 / HSD-023. Décrit les
structures, invariants et contrats. Les signatures définitives font foi dans le
code + `lib/manifest.d.ts`.

## 1. Modèle de manifest (`lib/manifest.mjs`)

Un **scénario** est un ensemble de ressources (JSON) :

```
ManifestSet {
  id: string                 // kebab-case, unique
  title: string
  description: string
  resources: Resource[]      // 1..MANIFEST_CAPS.maxResources
  skills?: string[]          // validées par isKnownSkill
  dayRefs?: number[]         // jours existants
  trackScope?: string[]|null // parcours existants
  missionRefs?: string[]
}
Resource {
  apiVersion: string
  kind: Kind                 // liste fermée
  metadata: { name, namespace?, labels?, annotations? }
  spec?: object              // structure selon le kind (bornée)
}
```

- **KINDS** (fermé) : `Pod, ReplicaSet, Deployment, StatefulSet, DaemonSet, Job,
  CronJob, Service, Ingress, ConfigMap, Secret, Namespace,
  PersistentVolumeClaim, ServiceAccount, HorizontalPodAutoscaler`.
- **SERVICE_TYPES** : `ClusterIP, NodePort, LoadBalancer`.
- **STRATEGIES** : `RollingUpdate, Recreate`.
- **MANIFEST_CAPS** : `maxResources:40, maxContainers:20, maxDepth:12,
  maxLabels:40, maxSerializedBytes`.

### 1.1 `validateManifestSet(set, ctx)` → `{ ok, errors }`

Refuse : id manquant/dupliqué ; `kind` inconnu ; `metadata.name` absent/non
conforme ; ressources dupliquées (`kind/namespace/name`) ; profondeur/tailles hors
`MANIFEST_CAPS` ; clés dangereuses (`__proto__`/`constructor`/`prototype`) ;
pollution de prototype ; NUL ; **secret inline en clair** dans un champ inadapté
(mêmes motifs que V22) ; `replicas`/`ports`/`resources` non entiers/négatifs quand
présents ; `skills` inconnues via `ctx.skillIds` ; `dayRefs` hors `ctx.validDays` ;
`trackScope` hors `ctx.trackIds`. **PUR**, sans I/O.

### 1.2 Résolveurs purs

- `selectorMatches(selector, labels)` → booléen (tous les couples du selector
  présents dans labels).
- `serviceEndpoints(service, set)` → liste des pods/templates dont les labels
  matchent le selector du Service (0 = Service sans endpoints).
- `podsOf(workload)` → nombre/gabarits de pods attendus (Deployment/ReplicaSet →
  `replicas` ; DaemonSet → 1/nœud conceptuel ; Job/CronJob → 1).

### 1.3 `publicManifestView(set)`

Projection publique : neutralise toute valeur ressemblant à un secret (`***`),
retire les champs internes ; sérialisable, sans fuite.

## 2. Analyse (`lib/manifest-analysis.mjs`)

`analyzeManifests(set)` → `{ diagnostics: Diagnostic[], summary }`.

```
Diagnostic {
  code: string          // stable, ex. 'svc-no-endpoints'
  severity: 'blocking'|'risk'|'warning'|'observation'
  category: 'security'|'availability'|'performance'|'maintenance'|'delivery'|'observability'
  resource: string      // kind/name
  path: string          // ex. 'spec.template.spec.containers[0].image'
  message: string
  explanation: string
  risk: string
  recommendation: string
  autofixable: boolean
  glossary: string[]
}
summary { bySeverity, byCategory, dimensions[], total }
```

Registre `RULES` (chaque règle pure `(set) → Diagnostic[]`), couvrant au moins :
Deployment sans `replicas` explicites ; **selector orphelin** (ne matche aucun
pod) ; **Service sans endpoints** ; ports incohérents ; image `:latest` ; image
sans tag ; `requests` absents ; `limits` absents ; limite < request (mémoire/CPU) ;
**readiness absente** ; liveness dangereuse (delay trop court) ; startup pertinente ;
probe sur port inexistant ; **secret en clair** ; ConfigMap pour donnée sensible ;
conteneur privilégié / `runAsRoot` / capabilities excessives / `hostNetwork` /
`hostPath` ; namespace absent ; StatefulSet sans persistance ; PVC sans `resources.
requests.storage` ; Ingress sans Service correspondant ; `maxUnavailable`/`maxSurge`
dangereux ; stratégie `Recreate` (coupure) ; Job sans limites ; CronJob à
concurrence non maîtrisée ; ServiceAccount par défaut ; labels de traçabilité
absents ; incohérence inter-fichiers. Sortie **triée** (sévérité puis code) →
déterminisme.

## 3. Réconciliation & simulation (`lib/manifest-reconcile.mjs`)

- `reconcile(set)` → `{ pods, endpoints, warnings }` : état OBSERVÉ attendu à
  partir de l'état DÉSIRÉ (déterministe).
- `simulateIncident(set, scenario)` → `{ effects, podStates, diagnostics }`.
  `INCIDENTS` (allowlist) : `crashloop`, `imagepull`, `pending`, `oomkilled`,
  `readiness-never`, `liveness-aggressive`, `bad-selector`, `no-endpoints`,
  `rollout-stuck`, `regression`, `rollback-blocked`, `secret-exposed`,
  `cpu-saturation`, `mem-saturation`, `dependency-down`, `config-missing`.
- `simulateRollout(set, { strategy, maxUnavailable, maxSurge, newImageHealthy })`
  → étapes déterministes (pods disponibles au fil du rollout) + `rollback()`.
  Purs, horloge injectable, jamais d'exécution réelle.

## 4. Adaptateur (`lib/manifest-kubectl.mjs`)

`kubectlAvailability()` → `{ state, reason, version? }` avec
`state ∈ {absent, cli-only, cluster, denied}`. I/O bornée (`execFile` `kubectl
version --client` puis `kubectl cluster-info`, `shell:false`, timeout, sortie
plafonnée) ; ne lève jamais. **Aucune** exécution de manifest. Sur cet
environnement : `absent`.

## 5. API (`app/api/kubernetes/[id]/route.ts`)

- `GET` → `{ manifest: publicManifestView, analysis, availability }`.
- `POST { action }` :
  - `analyze` (manifest posté **validé** ; invalide → 422),
  - `simulate` (`{ scenario }` dans l'allowlist ; sinon 400),
  - `rollout` (`{ options }` bornées),
  - `validate` (validation seule).
- Inconnu → 404 ; action inconnue → 400. Synchrone déterministe, aucune écriture
  de `data/`.

## 6. UI (`app/kubernetes/**`)

- `/kubernetes` : catalogue (filtres kind/thème, état en URL).
- `/kubernetes/[id]` : analyseur — panneaux **Ressources / Relations / Diagnostics**,
  éditeur **JSON** (CodeMirror `lang-javascript`, **lazy**), boutons Analyser /
  Simuler / Rollout / Réinitialiser, bandeau de disponibilité honnête. Vue de
  relations **simple** (Deployment→pods, Service→pods) doublée d'une **table
  textuelle** complète. Classes CSS `.kb-*`. Lazy-load sur la route.

## 7. Tests (déterministes, sans réseau, sans cluster)

- `manifest.test.mjs` : validation (kinds, refs, bornes, anti-secret, anti-fuite),
  résolveurs (`selectorMatches`, `serviceEndpoints`).
- `manifest-analysis.test.mjs` : chaque famille de diagnostic déclenchée/non
  déclenchée ; déterminisme.
- `manifest-reconcile.test.mjs` : reconcile (pods/endpoints) ; incident
  (CrashLoop, no-endpoints) ; rollout + rollback ; déterminisme.
- `manifests-content.test.mjs` : tous les `data/manifests/*.json` valides, sans
  fuite, refs résolues, analysables.

## 8. Gate `v23:check`

Valide tous les manifests contre le contexte réel + anti-fuite de la vue publique
+ dérive éditoriale (jours hors `targetDays`, modules source hors périmètre vs
`baselineRef`) + profondeur minimale des jours enrichis (`requiredConcepts`).
Lecture seule ; exit 1 au moindre problème. Ajoutée à la batterie active ;
inventaire des gates tenu à jour (CP9).
