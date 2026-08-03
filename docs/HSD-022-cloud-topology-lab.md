# HSD-022 — Conception de haut niveau : Cloud Topology Lab

Document de conception de haut niveau (Sprint V22). Complète l'ADR-022. Décrit les
composants, les flux et les frontières, sans détailler les signatures (voir
TSD-022).

## 1. Vue d'ensemble

```
             data/topologies/*.json  (exemples versionnés, déclaratifs)
                        │
                        ▼
   lib/topology.mjs ── validateTopology / publicTopologyView   (PUR)
        │                         │
        │ modèle typé             ▼
        ▼                 lib/topologies-server.ts  (chargement + vues publiques)
 lib/topology-analysis.mjs ──► diagnostics                    │
 lib/topology-scenario.mjs ──► propriétés après incident      ▼
        │ (PURS, déterministes)                     app/api/cloud-lab/[id]/route.ts
        ▼                                                     │  GET (vue+analyse)
   (aucune I/O, aucun réseau)                                 │  POST {analyze|scenario|reset}
                                                              ▼
                                              app/cloud-lab/**  (UI lazy, panneaux)
```

## 2. Composants

- **Modèle pur (`lib/topology.mjs`)** — types, `TOPOLOGY_CAPS`, `NODE_KINDS`,
  `EDGE_KINDS`, `validateTopology(topo, ctx)` → `{ ok, errors }`,
  `publicTopologyView(topo)` (retire tout champ interne/sensible). Aucune I/O.
- **Analyse (`lib/topology-analysis.mjs`)** — `RULES` (registre de règles pures) +
  `analyzeTopology(topo)` → `{ diagnostics[], summary }`. Chaque règle est
  `(topo) → Diagnostic[]`. Déterministe, ordre stable.
- **Scénario (`lib/topology-scenario.mjs`)** — `SCENARIOS` (allowlist) +
  `runScenario(topo, scenario)` → `{ effects, reachability, diagnostics }`.
  Pur, déterministe.
- **Serveur (`lib/topologies-server.ts`)** — `listTopologies`, `getTopology`,
  `publicTopology`, `publicTopologySummaries`. Valide contre le contexte réel
  (jours, parcours dérivés du catalogue, compétences).
- **API (`app/api/cloud-lab/[id]/route.ts`)** — `GET` (vue publique + analyse) ;
  `POST { action: 'analyze' | 'scenario' | 'reset', topology?, scenario? }`.
  Synchrone, déterministe. Topologie inconnue → 404 ; action inconnue → 400 ;
  topologie postée invalide → 422 avec erreurs de validation (jamais d'exécution).
- **UI (`app/cloud-lab/**`)** — catalogue filtrable (`CloudLabCatalogue.tsx`) +
  détail/analyseur (`TopologyAnalyzer.tsx`), lazy-loadés sur la route.

## 3. Flux utilisateur

1. Ouvrir `/cloud-lab` → catalogue de topologies (filtres, URL).
2. Ouvrir une topologie → panneaux **Composants / Connexions / Propriétés**.
3. Éditer de façon **bornée** (ajouter/retirer un nœud connu, régler une propriété
   d'une liste fermée) — jamais de champ libre exécutable.
4. **Analyser** → diagnostics triés par sévérité, filtrables, avec explication +
   preuve + recommandation + compromis.
5. **Simuler un incident** (perte de nœud/zone) → propriétés recalculées +
   nouveaux diagnostics.
6. Corriger → relancer → constater la disparition du diagnostic.
7. **Sauvegarder / restaurer** localement (modèle de backup existant).

## 4. Frontières & garanties

- **Pur d'abord** : modèle, analyse et scénario n'ont **aucune** I/O ; ils sont
  testables unitairement et déterministes.
- **Anti-fuite** : les vues publiques ne contiennent jamais de champ interne
  sensible ; `v22:check` le vérifie.
- **Isolation parcours** : aucune progression parallèle ; réutilise
  `{ activeTrackId, tracks{} }`.
- **Accessibilité** : navigation clavier, focus visible, `prefers-reduced-motion`,
  pas d'overflow horizontal global, alternative textuelle à toute vue graphique.
- **Performance** : analyse bornée, UI lazy, aucun composant lourd hors route Lab.

## 5. Intégration

- **Contenu** : jours 78-81 enrichis additivement (source `days-enrich-61-90.mjs`),
  + module cloud dans le parcours Systems & Cloud.
- **Exercices/Missions** : contrat existant + moteur V18.
- **Recherche** : topologies indexées (métadonnées publiques) + page Cloud Lab.
- **Glossaire** : +35-45 termes cloud/livraison/régression.
- **Gate** : `v22:check` (validité + anti-fuite + dérive + profondeur).
