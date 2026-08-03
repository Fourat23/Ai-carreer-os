# HSD-024 — Conception de haut niveau : Security & Incident Lab

**HSD = High-Level Solution Design** (convention de ce projet) : conception de haut
niveau du Sprint V24. Complète l'ADR-024 ; décrit composants, flux et frontières
sans détailler les signatures (voir TSD-024).

## 1. Vue d'ensemble

```
  data/security/*.json (scénarios)   data/playbooks/*.json (« Que faire dans ce cas ? »)
  data/security/cve-db.json (base CVE FACTICE, locale, versionnée)
                     │
                     ▼
   lib/security.mjs ── validateScenario / publicScenarioView / detectSecretCandidates   (PUR)
        │                                   │
        │ modèle typé                       ▼
        ▼                         lib/security-server.ts (chargement + vues publiques)
 lib/security-analysis.mjs ──► diagnostics (secrets, RBAC, supply chain, k8s, exposition)
 lib/security-incident.mjs ──► phases d'incident + décision rollback/roll-forward/rotation
        │ (PURS, déterministes)                        │
        ▼                                              ▼
   (aucune I/O, aucun réseau)               app/api/security/[id]/route.ts
                                              GET (vue + analyse) · POST {analyze|simulate|remediate}
                                                              ▼
                                              app/security/**  (UI lazy, panneaux + playbooks)
```

## 2. Composants

- **Modèle pur (`lib/security.mjs`)** — types, `SECURITY_CAPS`, `DOMAINS`,
  `validateScenario(scn, ctx)`, `publicScenarioView` (anti-fuite),
  `detectSecretCandidates(text)` (motif + contexte + `confidence`).
- **Analyse (`lib/security-analysis.mjs`)** — `RULES` (règles pures par domaine :
  secrets, RBAC/moindre privilège, supply chain, durcissement k8s, exposition) +
  `analyzeScenario(scn, cveDb)` → `{ diagnostics[], summary }`.
- **Incident (`lib/security-incident.mjs`)** — `simulateIncident(scn, kind)`
  (allowlist) → phases (détection→confinement→éradication→récupération→post-mortem)
  ; `decideRecovery(ctx)` (rollback/roll-forward/hotfix/mitigation) ;
  `secretResponseOrder()` (révocation→rotation→redéploiement). Purs, déterministes.
- **Serveur (`lib/security-server.ts`)** — `listScenarios`, `getScenario`,
  `publicScenario`, `publicScenarioSummaries`, `listPlaybooks`, chargement de la
  base CVE factice. Valide contre le contexte réel (jours/parcours/compétences).
- **API (`app/api/security/[id]/route.ts`)** — `GET` (vue + analyse) ;
  `POST { action: 'analyze'|'simulate'|'remediate'|'reset' }`. Artefact posté
  **validé** avant analyse (422 sinon), jamais exécuté. Inconnu → 404 ; action
  inconnue → 400.
- **UI (`app/security/**`)** — catalogue filtrable (domaine/difficulté/sévérité/
  type) + analyseur (panneaux Artefacts / Diagnostics / Remédiation / comparaison
  vulnérable↔corrigé + simulation d'incident + « Que faire dans ce cas ? »), lazy,
  accessible. Surface playbooks pilotée par `data/playbooks`.

## 3. Flux utilisateur

1. `/security` → catalogue de scénarios (filtres, URL).
2. Ouvrir un scénario → panneaux **Artefacts / Diagnostics / Remédiation**.
3. **Analyser** → diagnostics triés (sévérité/domaine), preuve + risque +
   recommandation + `confidence` + réel/simulé.
4. Comparer **vulnérable ↔ corrigé** (le scénario porte les deux états).
5. **Simuler un incident** (fuite de secret, dépendance compromise, accès
   compromis) → phases + décision.
6. Ouvrir **« Que faire dans ce cas ? »** (playbook lié).
7. Résoudre l'exercice / mission liés.

## 4. Frontières & garanties

- **Pur d'abord** : modèle, analyse, incident sans I/O ; testables et déterministes.
- **Anti-fuite** : vues publiques sans secret réel ni champ interne ; `v24:check`.
- **Secrets factices** : toute valeur sensible est explicitement factice.
- **Isolation parcours** : réutilise `{ activeTrackId, tracks }` (v3) ; aucune
  progression parallèle.
- **Accessibilité** : clavier, focus visible, `prefers-reduced-motion`, pas
  d'overflow global, alternative textuelle complète.
- **Performance** : analyse bornée, UI + éventuel CodeMirror lazy, rien hors route.

## 5. Intégration

- **Contenu** : jours d'ancrage enrichis additivement (68/298/85/67 — confirmés en
  CP4 après audit), section « Que faire dans ce cas ? » sécurité.
- **5ᵉ parcours** AppSec & Cloud Security (données pilotent ; jours réutilisés).
- **Exercices/Missions** : contrat existant + moteur V18 (validation structurale
  distincte de la revue humaine, affichée).
- **Recherche/palette** : scénarios, playbooks, glossaire indexés (public only).
- **Glossaire** : termes sécurité manquants.
- **Gate** : `v24:check` (scénarios valides + anti-fuite + secrets factices + dérive
  + profondeur), ajoutée à `gates:active` ; inventaire des gates mis à jour.
