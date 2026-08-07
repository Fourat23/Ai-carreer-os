# TSD-025 — Cloud Architecture Lab (Technical Solution Design)

TSD = Technical Solution Design. Contrats de modules du Cloud Architecture Lab V25.
Tous les modules `lib/cloud-*.mjs` sont PURS (sans I/O, sans réseau, sans exécution).

## lib/cloud-architecture.mjs

```
export const PROVIDERS = ['aws', 'azure', 'generic'];
export const CLOUD_DOMAINS = ['iam', 'network', 'compute', 'storage', 'database',
  'observability', 'resilience', 'finops'];
export const RESOURCE_KINDS  // sur-ensemble aligné sur NODE_KINDS (V22) : + 'vm',
  'serverless', 'container', 'managed-db', 'identity', 'security-group'
export const CLOUD_CAPS = { maxResources: 60, maxIdentities: 40, maxSubnets: 24,
  maxPolicies: 80, maxSerializedBytes: 128*1024 };

// Conversion vers le graphe V22 pour réutiliser validateTopology/analyzeTopology.
export function toTopology(arch): { zones, nodes, edges, objectives }

// Validation stricte, PURE. Refuse : clés dangereuses, ids dupliqués, arêtes
// pendantes, CIDR mal formés, policy sans actions, secret/ARN réaliste inliné.
export function validateCloudArchitecture(arch, ctx): { ok, errors }

// Vue publique : masque identités/policies détaillées et toute valeur secret-like.
export function publicCloudView(arch): object

// Détection prudente d'un ARN/secret réaliste (référencer, jamais inliner).
export function detectCloudSecretLike(text): [{ match, index, fake }]
```

## lib/cloud-analysis.mjs

```
export const CLOUD_RULES  // registre : { code, domain, severity, provider?, test(arch)->evidence[] }
  // iamWildcard, staticCredentials, publicStorage, dbPubliclyExposed,
  // cidrOverlap, publicSubnetUnjustified, noBackup, noObservability,
  // singleAzCritical (via topo), egressWaste, oversizedResource
export function analyzeCloud(arch, priceBook = []): {
  diagnostics: [{ id, severity, domain, title, explanation, evidence,
                  remediation, provider, confidence, real, simulated }],
  summary: { bySeverity, byDomain, cost, limits: string[] }
}
export function ruleCodes(): string[]
```

Composition : `analyzeCloud` appelle `analyzeTopology(toTopology(arch))` pour le volet
disponibilité (SPOF/cycles), puis fusionne avec les règles cloud. Déterministe.

## lib/cloud-cost.mjs

```
// Estimation FACTICE, déterministe, étiquetée « pédagogique, non officielle ».
export function estimateMonthlyCost(arch, priceBook): {
  total, byResource: [{ resourceId, kind, units, unitCost, cost }],
  simulated: true, disclaimer: string
}
```

Barème : `data/cloud/price-book.json` (valeurs `FAKE-*`, versionnées). Aucune
connexion à une grille tarifaire réelle.

## lib/cloud-server.ts

```
listCloudArchitectures(): CloudArchitecture[]         // charge+valide data/cloud/*.json
getCloudArchitecture(id): CloudArchitecture | null
publicCloudArchitecture(a): object                    // publicCloudView
getPriceBook(): object                                // data/cloud/price-book.json (factice)
getProviderMap(): object                              // data/cloud/provider-map.json
publicCloudSummaries(): [{ id, title, description, provider, domain, resourceCount,
                           skills, dayRefs, trackScope }]
```

## app/api/cloud-foundations/[id]/route.ts

`GET` (vue publique + analyse) · `POST { action: analyze|remediate|reset }`.
422 (validation), 404 (inconnu), 400 (action invalide). Aucune exécution.

## app/cloud-foundations/

`page.tsx` (catalogue + `PlaybookBrowser` cloud) · `[id]/page.tsx` +
`CloudAnalyzer.tsx` (client, 3 zones ; comparaison problématique↔sain ; « Que faire
dans ce cas ? »). ARN/identités masqués. Pas de CodeMirror, pas de canvas lourd.

## Données versionnées

- `data/cloud/*.json` — ≥ 6 scénarios (états problématique + `fixed*`).
- `data/cloud/price-book.json` — barème factice.
- `data/cloud/provider-map.json` — mapping AWS↔Azure raisonné (quand/pourquoi/diff).
- `data/playbooks/*.json` — ≥ 10 cas cloud (schéma V24, 15 rubriques).

## Gate

`scripts/v25-check.mjs` (`npm run v25:check`, ajouté à `gates:active`) : valide
scénarios (problématique↔sain, 0 diagnostic bloquant en `fixed*`), price-book &
provider-map factices, playbooks cloud (richesse), profondeur des jours enrichis
(plan `docs/architecture/v25-enrichment-plan.json`), dérive bornée, anti-fuite.
Robuste aux répertoires vides.

## Invariants

- Aucun `eval`/`Function`/`shell:true`/`exec`/réseau ; aucun secret/credential réel.
- `data/progress.json` sauvegardé avant test, restauré byte-identique à la baseline.
- Modèle principalement provider-INDÉPENDANT ; `provider` est une donnée, pas du code.
- Data-driven : aucun `provider === '…'` éparpillé dans les surfaces ; aucun compte de
  parcours/scénarios codé en dur (tout dérive des données/catalogue).
