# HSD-023 — Conception de haut niveau : Kubernetes & Orchestration Lab

Document de conception de haut niveau (Sprint V23). Complète l'ADR-023. Décrit les
composants, les flux et les frontières, sans détailler les signatures (voir
TSD-023).

## 1. Vue d'ensemble

```
        data/manifests/*.json  (scénarios : 1..N ressources, en JSON déclaratif)
                     │
                     ▼
   lib/manifest.mjs ── validateManifestSet / publicManifestView   (PUR)
        │                              │
        │ modèle typé                  ▼
        ▼                    lib/manifests-server.ts  (chargement + vues publiques)
 lib/manifest-analysis.mjs ──► diagnostics                        │
 lib/manifest-reconcile.mjs ─► état observé + rollout + incident  ▼
        │ (PURS, déterministes)                        app/api/kubernetes/[id]/route.ts
        ▼                                                GET (vue + analyse + disponibilité)
 lib/manifest-kubectl.mjs ──► disponibilité HONNÊTE       POST {analyze|simulate|rollout|validate}
   (I/O bornée, ne lève jamais, état: absent/cli-only/cluster/denied)
                                                                  ▼
                                              app/kubernetes/**  (UI lazy, panneaux + éditeur JSON)
```

## 2. Composants

- **Modèle pur (`lib/manifest.mjs`)** — types, `MANIFEST_CAPS`, `KIND_SPECS`,
  `validateManifestSet(set, ctx)` → `{ ok, errors }`, `publicManifestView(set)`
  (anti-fuite), résolveurs (`selectorMatches`, `serviceEndpoints`). Aucune I/O.
- **Analyse (`lib/manifest-analysis.mjs`)** — `RULES` (règles pures) +
  `analyzeManifests(set)` → `{ diagnostics[], summary }`. Déterministe, ordre stable.
- **Réconciliation/incident (`lib/manifest-reconcile.mjs`)** — `reconcile(set)` →
  état observé attendu (pods d'un Deployment, endpoints d'un Service) ;
  `simulateIncident(set, scenario)` (allowlist) ; `simulateRollout(set, opts)`
  (RollingUpdate/Recreate + rollback). Purs, déterministes.
- **Adaptateur (`lib/manifest-kubectl.mjs`)** — `kubectlAvailability()` (I/O
  bornée : détecte la CLI et un éventuel cluster ; ne lève jamais ; renvoie
  `absent`/`cli-only`/`cluster`/`denied`). Aucune exécution de manifest.
- **Serveur (`lib/manifests-server.ts`)** — `listManifests`, `getManifest`,
  `publicManifest`, `publicManifestSummaries`. Valide contre le contexte réel.
- **API (`app/api/kubernetes/[id]/route.ts`)** — `GET` (vue publique + analyse +
  disponibilité) ; `POST { action: 'analyze'|'simulate'|'rollout'|'validate' }`.
  Synchrone, déterministe. Manifest posté **validé** avant analyse (422 sinon) ;
  jamais exécuté. Inconnu → 404 ; action inconnue → 400.
- **UI (`app/kubernetes/**`)** — catalogue filtrable + analyseur (panneaux
  Ressources / Relations / Diagnostics + éditeur JSON + simulation d'incident et de
  rollout), lazy-loadés ; état de disponibilité affiché honnêtement.

## 3. Flux utilisateur

1. `/kubernetes` → catalogue de scénarios (filtres, URL).
2. Ouvrir un scénario → panneaux **Ressources / Relations / Diagnostics**, plus un
   éditeur JSON borné (manifests en lecture seule ou éditables selon le scénario).
3. **Analyser** → diagnostics triés par sévérité, filtrables, avec preuve +
   recommandation + compromis.
4. **Simuler un incident** (CrashLoopBackOff, OOMKilled, Service sans endpoints…)
   ou **un rollout** (RollingUpdate/Recreate, puis rollback) → état recalculé.
5. Corriger le manifest → réanalyser → constater la disparition du diagnostic.
6. **Disponibilité** : l'UI affiche l'état réel (`absent` ici) ; aucun bouton
   « Exécuter » actif sans cluster réel.

## 4. Frontières & garanties

- **Pur d'abord** : modèle, analyse, réconciliation, simulation — **aucune** I/O ;
  seul l'adaptateur fait de l'I/O bornée (détection), sans jamais exécuter un
  manifest.
- **Anti-fuite** : vues publiques sans champ interne sensible ; `v23:check` vérifie.
- **Isolation parcours** : aucune progression parallèle ; réutilise `{ activeTrackId, tracks }`.
- **Accessibilité** : clavier, focus visible, `prefers-reduced-motion`, pas
  d'overflow horizontal global, alternative textuelle complète (tables) à toute
  vue de relations.
- **Performance** : analyse bornée, UI + CodeMirror lazy, rien de lourd hors route.

## 5. Intégration

- **Contenu** : jours 320-321 enrichis additivement (source
  `days-enrich-301-365.mjs`), section « Que faire dans ce cas ? », lien jour 81.
- **Exercices/Missions** : contrat existant + moteur V18.
- **Recherche** : manifests indexés (métadonnées publiques) + page Kubernetes Lab.
- **Glossaire** : termes k8s/orchestration/exploitation.
- **Gate** : `v23:check` (validité + anti-fuite + dérive + profondeur).
- **Gates historiques** : inventaire + classement en CP9 (sans réécrire l'histoire).
