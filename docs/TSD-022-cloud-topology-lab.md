# TSD-022 — Conception technique détaillée : Cloud Topology Lab

Document technique détaillé (Sprint V22). Complète ADR-022 / HSD-022. Décrit les
structures, invariants et contrats. Les signatures définitives font foi dans le
code + `lib/topology.d.ts`.

## 1. Modèle de topologie (`lib/topology.mjs`)

```
Topology {
  id: string                 // kebab-case, unique
  title: string
  description: string
  environments: string[]     // sous-ensemble de ENVIRONMENTS
  zones: Zone[]              // { id, label }
  nodes: Node[]
  edges: Edge[]
  constraints?: Constraint[] // { id, kind, ... } contraintes déclarées
  objectives?: Objective[]   // { id, kind:'availability'|'cost'|... , target? }
  skills?: string[]          // validées par isKnownSkill
  dayRefs?: number[]         // jours existants
  trackScope?: string|null   // id de parcours existant
  missionRefs?: string[]
}
Node  { id, kind, label, zone?, environment?, props?: object }
Edge  { id, from, to, kind, props? }   // from/to = ids de nœuds
Zone  { id, label }
```

- **NODE_KINDS** (fermé) : `client, dns, cdn, load-balancer, reverse-proxy, api,
  frontend, backend, worker, queue, cache, relational-db, nosql-db, object-storage,
  file-storage, block-storage, nat, gateway, subnet, firewall, secret-store,
  monitoring, backup, scheduler`.
- **EDGE_KINDS** (fermé) : `depends-on, routes-to, reads, writes, replicates-to,
  backs-up, monitors, resolves`. `replicates-to` est le flux **bidirectionnel
  légitime** exempté du contrôle de cycle de démarrage.
- **ENVIRONMENTS** (fermé) : `development, testing, staging, preproduction,
  production`.
- **TOPOLOGY_CAPS** : `maxNodes:60, maxEdges:200, maxZones:12, maxDepth:12,
  maxChain:40, maxSerializedBytes`.

### 1.1 `validateTopology(topo, ctx)` → `{ ok, errors }`

Refuse : id manquant/dupliqué ; `kind` inconnu (nœud/arête) ; `from`/`to`
non résolus ; **cycle de dépendances** (`depends-on`/`routes-to`) via
`findCycle` ; dépassement de bornes `TOPOLOGY_CAPS` ; `environment`/`zone`
inconnus ; propriétés dangereuses (`__proto__`, clés à points, NUL, traversée) ;
secret inline dans une prop (mêmes motifs que V21 : `sk-`, `ghp_`, `AKIA`, `xox`,
`PRIVATE KEY`, token long) ; `skills` inconnues via `ctx.skillIds` ; `dayRefs`
hors `ctx.validDays` ; `trackScope` hors `ctx.trackIds`. Pur, sans I/O.

### 1.2 `publicTopologyView(topo)`

Projection publique : retire toute prop interne marquée sensible et neutralise
toute valeur ressemblant à un secret (`***`). Sérialisable, sans fuite.

## 2. Analyse (`lib/topology-analysis.mjs`)

`analyzeTopology(topo)` → `{ diagnostics: Diagnostic[], summary }`.

```
Diagnostic {
  code: string          // stable, ex. 'db-public-exposure'
  severity: 'blocking' | 'risk' | 'warning' | 'observation'
  title: string
  explanation: string
  evidence: string[]    // ids de nœuds/arêtes concernés
  impact: string
  recommendation: string
  tradeoff: string
  skills?: string[]
  glossary?: string[]   // ids de termes
  dimension: 'availability'|'security'|'cost'|'performance'|'maintainability'|'complexity'
}
summary {
  byseverity: { blocking, risk, warning, observation }
  dimensions: string[]  // dimensions couvertes — PAS un score
}
```

Registre `RULES` (chaque règle pure `(topo) → Diagnostic[]`), couvrant au moins :
base de données exposée publiquement ; absence de load balancer devant plusieurs
backends ; absence de health check/monitoring ; **SPOF** (nœud critique sans
redondance/zone) ; service `stateful` derrière un autoscaling ; stockage éphémère
pour données persistantes ; absence de `backup` ; backup sans test de restauration
déclaré ; subnet « privé » avec accès public direct ; dépendance unique sans
failover ; absence de TLS sur flux public ; secret hors `secret-store` ; staging
pointant vers la base de production ; absence de plan de rollback (objectif
déclaré) ; canary sans métrique de validation ; blue/green sans bascule ;
sur/sous-dimensionnement ; complexité injustifiée. Sortie **triée** (sévérité puis
code) → déterminisme.

## 3. Scénario (`lib/topology-scenario.mjs`)

`runScenario(topo, scenario)` → `{ effects, reachability, diagnostics }`.
`SCENARIOS` (allowlist fermée) : `drop-node`, `drop-zone`, `traffic-spike`,
`dependency-down`. Pur, déterministe. Recalcule des **propriétés qualitatives**
(atteignabilité client→service, apparition/disparition d'un SPOF, chemin restant),
jamais une métrique chiffrée présentée comme réelle.

## 4. API (`app/api/cloud-lab/[id]/route.ts`)

- `GET` → `{ topology: publicTopologyView, analysis: analyzeTopology, availability }`.
- `POST { action }` :
  - `analyze` (topologie postée **validée** d'abord ; invalide → 422),
  - `scenario` (`{ scenario }` dans l'allowlist ; sinon 400),
  - `reset` (renvoie l'exemple d'origine).
- Topologie inconnue → 404 ; action inconnue → 400. Exécution **synchrone
  déterministe**, aucune écriture de `data/`.

## 5. UI (`app/cloud-lab/**`)

- `/cloud-lab` : `CloudLabCatalogue.tsx` (filtres sévérité/thème, état en URL).
- `/cloud-lab/[id]` : `TopologyAnalyzer.tsx` — panneaux **Composants / Connexions /
  Propriétés / Diagnostics**, édition bornée (listes fermées), boutons Analyser /
  Simuler / Réinitialiser. Vue graphique **simple et optionnelle** doublée d'une
  **table textuelle** complète. Classes CSS `.cl-*` (réutilise les tokens
  existants). Lazy-load sur la route.

## 6. Tests (déterministes, sans réseau)

- `topology.test.mjs` : validation (ids, kinds, cycles, bornes, anti-secret,
  anti-fuite de la vue publique).
- `topology-analysis.test.mjs` : chaque famille de diagnostic déclenchée sur une
  fixture minimale + non déclenchée sur une topologie saine ; déterminisme.
- `topology-scenario.test.mjs` : effets d'un `drop-node`/`drop-zone` ; SPOF
  révélé ; déterminisme sur 2 exécutions.
- `topologies-content.test.mjs` : tous les `data/topologies/*.json` valides ;
  aucune fuite dans la vue publique ; refs (jours/parcours/compétences) résolues.

## 7. Gate `v22:check`

Valide toutes les topologies contre le contexte réel + anti-fuite de la vue
publique + dérive éditoriale (jours hors `targetDays`, modules source hors
périmètre vs `baselineRef`) + profondeur minimale des jours enrichis
(`requiredConcepts`). Lecture seule ; exit 1 au moindre problème.
