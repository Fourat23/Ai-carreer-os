# TSD-024 — Conception technique détaillée : Security & Incident Lab

Document technique détaillé (Sprint V24). Complète ADR-024 / HSD-024. Les signatures
définitives font foi dans le code + `lib/security.d.ts`.

## 1. Modèle de scénario (`lib/security.mjs`)

```
SecurityScenario {
  id: string                 // kebab-case, unique
  title: string
  description: string
  domain: Domain             // liste fermée
  difficulty: number
  artifacts: Artifact[]      // 1..SECURITY_CAPS.maxArtifacts
  fixedArtifacts?: Artifact[]// état CORRIGÉ (comparaison vulnérable↔corrigé)
  incident?: string          // kind d'incident simulable (allowlist)
  playbookRef?: string
  skills: string[]; dayRefs: number[]; trackScope?: string[]|null
  exerciseRefs?: string[]; missionRefs?: string[]
}
Artifact {
  id: string
  kind: 'config'|'env'|'log'|'manifest'|'rbac'|'lockfile'|'sbom'|'headers'|'pipeline'|'dockerfile'
  path?: string
  content: object|string     // données à analyser (JSON/texte borné)
}
```

- **DOMAINS** (fermé) : `secrets, supply-chain, rbac, kubernetes, exposure,
  incident, deployment`.
- **INCIDENTS** (allowlist) : `secret-leak, dependency-compromise, access-compromise,
  broken-security-deploy, critical-regression, image-untrusted`.
- **SECURITY_CAPS** : `maxArtifacts:20, maxDepth:12, maxContentBytes, maxArrayItems`.

### 1.1 `validateScenario(scn, ctx)` → `{ ok, errors }`

Refuse : id/kind inconnus, artefacts dupliqués/hors bornes, profondeur/tailles,
clés dangereuses (`__proto__`/`constructor`/`prototype`), NUL, `skills` inconnues
(`ctx.skillIds`), `dayRefs` hors `ctx.validDays`, `trackScope` hors `ctx.trackIds`.
**Exige que tout secret présent soit FACTICE** (préfixe reconnaissable / marqueur
`FAKE`/`changeme`/`example`) — un secret « trop réaliste » échoue la validation
(sûreté du dépôt). PUR.

### 1.2 `detectSecretCandidates(text)` → `Candidate[]`

`Candidate { match, index, kind, confidence('high'|'medium'|'low'), fake:boolean }`.
Combine **motif** (`sk-`, `ghp_`, `AKIA…`, `xox…`, PEM, token long à entropie
élevée) **et contexte** (nom de champ sensible). `fake:true` si marqueur factice
reconnu. **Documente ses limites** : ne prétend pas tout détecter ; les faux
positifs (haute entropie non secrète) sont possibles → `confidence` bas.

### 1.3 `publicScenarioView(scn)`

Neutralise toute valeur ressemblant à un secret (`***`), retire les champs internes.
Sérialisable, sans fuite. Ne contient jamais la solution d'un exercice lié.

## 2. Base CVE factice (`data/security/cve-db.json`)

Référentiel **local, versionné, factice** : `{ id: 'FAKE-CVE-YYYY-NNN', package,
affected: '<x.y.z', fixed: 'x.y.z', severity, cwe? }`. **Aucun appel réseau.** Sert
à la règle « dépendance vulnérable » : comparaison de versions déterministe.

## 3. Analyse (`lib/security-analysis.mjs`)

`analyzeScenario(scn, cveDb)` → `{ diagnostics: Diagnostic[], summary }`.

```
Diagnostic {
  code; severity('blocking'|'risk'|'warning'|'observation');
  domain; resource; path; message; explanation; risk; recommendation;
  remediationOrder?: number; autofixable: boolean;
  confidence('high'|'medium'|'low'); real: boolean; simulated: boolean;
  cwe?: string; glossary: string[];
}
summary { bySeverity, byDomain, dimensions[], total, limits: string[] }
```

Registre `RULES` (règles pures par domaine) couvrant au moins : **secrets**
(hardcodé, dans env/manifest, dans log non rédigé) ; **rbac** (verbe/ressource
wildcard, ClusterRole superflu, binding à un SA sur-privilégié, moindre privilège
violé) ; **durcissement k8s** (root, capabilities non retirées, filesystem
inscriptible, image non épinglée/`latest`, provenance absente) ; **supply chain**
(dépendance non verrouillée, transitive risquée, typosquatting via catalogue local,
dependency confusion, changement de lockfile inattendu, dépendance vulnérable via
CVE factice) ; **exposure** (NetworkPolicy absente, exposition réseau excessive,
en-tête de sécurité manquant, secret loggé) ; **deployment** (rollout risqué, secret
à révoquer/tourner). Sortie **triée** (sévérité, domaine, code) → déterminisme.
`summary.limits` liste explicitement ce qui n'est PAS couvert.

## 4. Incident (`lib/security-incident.mjs`)

- `simulateIncident(scn, kind)` → `{ ok, phases[], decision, diagnostics[] }` ;
  `phases` = détection → qualification → confinement → éradication → récupération →
  post-mortem. Déterministe.
- `decideRecovery({ reversible, urgent, dataMigrationBlocks })` → `rollback` |
  `roll-forward` | `hotfix` | `mitigation`.
- `secretResponseOrder()` → `['revocation','rotation','redeploy','audit']` (ordre
  correct opposé au réflexe « rotation d'abord »).

## 5. Playbooks (`data/playbooks/*.json`)

`Playbook { id, title, situation, symptoms[], firstChecks[], doNot[], evidence[],
containment[], communication[], correction[], validation[], deployment[],
monitoring[], documentation[], prevention[], exitCriteria[], glossary[], dayRefs? }`.
Pilotent la surface « Que faire dans ce cas ? », indexés en recherche (public only).

## 6. API (`app/api/security/[id]/route.ts`)

- `GET` → `{ scenario: publicScenarioView, analysis, availability }`.
- `POST { action }` : `analyze` (artefacts postés **validés** ; invalide → 422),
  `simulate` (`{ incident }` allowlist ; sinon 400), `remediate` (renvoie l'état
  corrigé + sa réanalyse), `reset`. Synchrone déterministe, aucune écriture de
  `data/`.

## 7. UI (`app/security/**`)

- `/security` : catalogue (filtres domaine/difficulté/sévérité/type, état URL).
- `/security/[id]` : analyseur — panneaux **Artefacts / Diagnostics / Remédiation**,
  comparaison **vulnérable↔corrigé**, simulation d'incident, encart « Que faire dans
  ce cas ? ». Éditeur **uniquement si nécessaire** (CodeMirror lazy, types limités,
  aucune exécution). Classes `.sec-*`. Mention explicite **validation structurale ≠
  revue humaine** sur les livrables de mission. Responsive (colonne unique < 900px,
  tables scrollables), accessible.

## 8. Tests (déterministes, sans réseau)

- `security.test.mjs` : validation (kinds, bornes, anti-fuite, **refus de secret
  réaliste**), `detectSecretCandidates` (vrais/faux positifs documentés).
- `security-analysis.test.mjs` : chaque famille de règle déclenchée/non déclenchée ;
  déterminisme ; CVE factice.
- `security-incident.test.mjs` : phases, `decideRecovery`, `secretResponseOrder` ;
  déterminisme.
- `security-content.test.mjs` : `data/security/*.json` valides, sans fuite, refs
  résolues, analysables ; `data/playbooks/*.json` valides.

## 9. Gate `v24:check`

Valide tous les scénarios + playbooks contre le contexte réel + anti-fuite de la vue
publique + **secrets factices uniquement** (aucune chaîne trop réaliste dans le
périmètre V24) + dérive éditoriale (jours hors `targetDays`, modules hors périmètre)
+ profondeur minimale des jours enrichis. Ajoutée à `gates:active` ; inventaire des
gates mis à jour (CP9).
