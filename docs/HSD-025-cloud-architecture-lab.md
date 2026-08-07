# HSD-025 — Cloud Architecture Lab (High-Level Solution Design)

HSD = High-Level Solution Design. Conception de haut niveau du Cloud Architecture Lab
V25, cohérente avec ADR-025. Local, déterministe, sans réseau, sans credential réelle.

## 1. Objectif

Permettre à l'apprenant de **raisonner une architecture cloud** (AWS/Azure) : charger
une architecture déclarative, l'analyser (IAM, réseau, disponibilité, coût), comparer
un état problématique et un état sain, dérouler un playbook « Que faire dans ce cas ? »
cloud, et pratiquer via exercices et missions — le tout sur fixtures locales.

## 2. Briques et réutilisation

| Brique | Origine | Rôle en V25 |
|---|---|---|
| Graphe déclaratif (nœuds/arêtes/zones) | V22 `lib/topology.mjs` | graphe de dépendances sous-jacent réutilisé |
| `analyzeTopology` (SPOF/cycles/chaînes) | V22 `lib/topology-analysis.mjs` | volet disponibilité de l'analyse cloud |
| Modèle `CloudArchitecture` | **V25** `lib/cloud-architecture.mjs` | provider, région, IAM, réseau, coût, contraintes |
| Analyse cloud composite | **V25** `lib/cloud-analysis.mjs` | règles IAM/réseau/stockage/coût + composition V22 |
| Estimateur de coût factice | **V25** `lib/cloud-cost.mjs` | coût déterministe étiqueté pédagogique |
| Playbooks « Que faire dans ce cas ? » | V24 `PlaybookView` + `data/playbooks` | cas cloud (facture, panne région, bucket public…) |
| Progression, preuves, missions | v3 / V18 | inchangés |
| Glossaire, recherche, backup | existants | étendus, jamais dupliqués |

## 3. Modèle de données (haut niveau)

```
CloudArchitecture {
  id, title, description, provider: 'aws'|'azure'|'generic',
  region, zones: [string],
  need, constraints: [string],          // besoin métier + contraintes (pédagogie)
  resources: [ { id, kind, service, zone, public?, props } ],   // kind ∈ vocabulaire V22
  edges: [ { from, to, kind } ],                                 // flux typés V22
  identities: [ { id, type, policies:[{actions, resources, effect}] } ],  // IAM
  network: { cidr, subnets: [{ id, cidr, public }], securityGroups: [...] },
  observability: { logs?, metrics?, alerts? },
  costHints: [ { resourceId, sizing, monthlyUnits } ],
  fixedResources?, fixedIdentities?, fixedNetwork?    // état corrigé (comparaison)
  skills, dayRefs, trackScope, missionRefs, playbookRef
}
```

## 4. Analyse (composite, déterministe)

`analyzeCloud(arch, priceBook)` :
1. Convertit `resources`/`edges` en topologie V22 → `analyzeTopology` (SPOF, cycles,
   single-AZ, chaînes) → diagnostics « availability ».
2. Applique les **règles cloud** (registre) : IAM wildcard/credentials statiques,
   stockage public, DB exposée, chevauchement CIDR, subnet public injustifié,
   absence backup/observabilité, egress inutile, sur-dimensionnement.
3. Estime le coût (`lib/cloud-cost.mjs`) — **simulé/factice**, étiqueté.
4. Retourne `{ diagnostics[], summary{ bySeverity, byDomain, cost, limits }, provider }`.

Comparaison : l'état `fixed*` produit **zéro diagnostic bloquant/risque**.

## 5. Surfaces

- Route `/cloud-foundations` (catalogue de scénarios + navigateur de playbooks cloud).
- Route `/cloud-foundations/[id]` (analyseur : Architecture / Analyse / Contexte ;
  comparaison problématique↔sain ; « Que faire dans ce cas ? »). Trois zones desktop,
  une zone à la fois en mobile. Pas de canvas lourd obligatoire.
- API `POST /api/cloud-foundations/[id]` (analyze | remediate | reset). Aucune
  exécution ; ARN/identités factices masqués.

## 6. Contenu

- ≥ 6 scénarios (`data/cloud/*.json`), AWS et Azure, problématique↔sain.
- ≥ 16 exercices déterministes (IAM, réseau, compute, stockage/data, résilience,
  observabilité, FinOps, architecture) via le runtime `node-js`.
- ≥ 6 missions V18 (architecture HA, migration résiliente, réduction de facture,
  durcissement, backup/DR RPO/RTO, diagnostic via métriques). ≥ 1 livrable HLD/HSD.
- ≥ 10 playbooks cloud + ≥ 60 entrées de glossaire.
- Enrichissement ciblé des jours 71/78/79/80/81/325 (dérive bornée).

## 7. Sécurité & honnêteté

Aucun appel cloud, aucun secret réel, aucune exécution. Étiquetage réel/simulé
systématique. Estimateur de coût explicitement « pédagogique, non officiel ».
Anti-fuite : vue publique sans identités/policies sensibles, index de recherche sans
solution/test privé.

## 8. Gate

`v25:check` : scénarios valides (problématique↔sain), price-book & provider-map
factices, exercices/missions/playbooks cohérents, profondeur minimale, anti-fuite,
dérive éditoriale bornée. Cycle de vie des gates respecté (inventaire mis à jour).
