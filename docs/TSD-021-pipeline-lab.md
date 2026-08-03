# TSD-021 — Pipeline Lab (Technical Spec & Design)

Compagnon technique de l'ADR/HSD-021. Fixe les **contrats de types**, la
validation, l'orchestrateur, les actions et les invariants de test. Signatures =
cible d'implémentation (CP2-CP5).

## 1. Modèle (cible CP2 — `lib/pipeline.mjs`)

```
TriggerKind = 'push' | 'pull_request' | 'tag' | 'manual' | 'schedule'
JobStatus   = 'success' | 'failed' | 'skipped' | 'cancelled' | 'blocked' | 'pending' | 'running'
ActionKind  = 'validate-config' | 'lint' | 'test' | 'build' | 'artifact-check'
            | 'cache-check' | 'branch-policy' | 'approval' | 'secret-scan' | 'status-aggregate'

Job = {
  id, name,
  stage: string,
  needs?: string[],              // dépendances (DAG)
  condition?: { branchIn?: string[], tagIn?: string[], event?: TriggerKind[] },
  action: ActionKind,
  with?: Record<string, unknown>,   // fixture/paramètres BORNÉS de l'action
  timeoutMs: number,                // borné
  allowFailure?: boolean,
  artifactsOut?: string[],          // noms d'artefacts produits (métadonnées)
  cacheKey?: string,
  secrets?: string[],               // noms masqués dans les logs
}

Stage = { id, name, order: number }

Pipeline = {
  id, title, description, version,
  trigger: TriggerKind[],
  branchFilters?: string[], tagFilters?: string[],
  stages: Stage[],
  jobs: Job[],
  environment?: { name: string, requiresApproval?: boolean },
  approval?: { required: boolean, approvers?: string[] },
  skills: string[], dayRefs: number[], trackScope?: string[], missionRefs?: string[],
  maxJobs?: number, maxSteps?: number,
}
```

## 2. Validation (pur, CP2)

`validatePipeline(pipeline, ctx) → { ok, errors }` vérifie :
ids uniques (stages/jobs) ; `needs` résolus ; **pas de cycle** (DAG) ; stage non
vide ; job rattaché à un stage existant ; nombre de jobs/steps borné ; timeout
borné ; `action ∈ ActionKind` ; `with` sans **secret brut** (valeur ressemblant à
un token), sans **path traversal** / octet nul, sans **clé dangereuse**
(`__proto__`/`prototype`/`constructor`), sans contenu binaire, taille bornée ;
environnement valide ; trigger valide ; compétences connues ; dayRefs existants.

## 3. Orchestrateur (pur, CP3 — `lib/pipeline-engine.mjs`)

```
resolveTrigger(pipeline, event) → boolean
topoOrder(jobs) → { order: string[] } | { cycle: string[] }
runPipeline(pipeline, event, ctx, { clock, actions }) → PipelineRun

PipelineRun = {
  id, pipelineId, triggered: boolean, status: JobStatus /* global */,
  startedAt, endedAt, durationMs,
  jobs: Record<jobId, { status: JobStatus, startedAt, durationMs, logs: string[], artifacts: string[] }>,
  logs: string[],           // bornés, secrets masqués
  artifacts: { name: string, jobId: string }[],
  diagnostic?: string,
}
```

Règles : trigger non satisfait → `triggered:false`, statut `skipped`. Ordre
topologique ; un job dont un `needs` a échoué → `blocked` (sauf `allowFailure` du
prérequis) ; condition fausse → `skipped` ; `fail-fast` (défaut) stoppe la suite
non démarrée ; `allowFailure` n'échoue pas le global ; approbation requise non
accordée → `blocked`. Global = `failed` si un job non toléré échoue, sinon
`success` (ou `skipped` si non déclenché). **Déterministe** : horloge injectable ;
durées fixes par action.

## 4. Actions internes (pur, CP3 — `lib/pipeline-actions.mjs`)

`ACTIONS: Record<ActionKind, (job, ctx) => { status, logs, artifacts? }>`.
Chacune est **pure**, opère sur la **fixture** de `job.with`, borne ses logs, et
masque toute valeur listée dans `job.secrets`. Exemples : `lint` renvoie
`failed` si la fixture contient un motif d'erreur déclaré ; `secret-scan` détecte
un secret dans un log factice ; `artifact-check` vérifie qu'un artefact requis
existe ; `cache-check` compare une clé de cache aux entrées changées.

## 5. Adaptateur local borné (option, CP4 — `lib/pipeline-local.mjs`)

Réutilise le motif `execFile` `shell:false` du terminal V20, **plus restrictif** :
exécutables **fixés** (aucun choix apprenant), aucun argument arbitraire, `cwd`
dans un workspace temporaire, env minimal, timeout + SIGKILL, sortie plafonnée,
taille de fichier plafonnée, **aucun réseau, aucun secret, aucune mutation de
`data/`**, nettoyage garanti. Docker optionnel (détection honnête ; jamais de
faux succès).

## 6. API (CP5)

- `GET /api/pipelines/[id]` → vue publique du pipeline + disponibilité adaptateur.
- `POST /api/pipelines/[id]` `{ action:'run'|'cancel'|'reset', event }` → run
  synchrone borné (aucun polling), annulation par abandon de requête. Vue publique
  **sans** fixtures internes, **sans** secret, **sans** chemin hôte.

## 7. Statuts, timeouts, annulation, bornage

Statuts §1. Timeout borné par job (plafond global). Annulation → `cancelled`.
Logs plafonnés (octets) ; historique borné ; artefacts en métadonnées.

## 8. Erreurs

`E_CYCLE`, `E_UNKNOWN_ACTION`, `E_JOB_LIMIT`, `E_TIMEOUT`, `E_SECRET_INLINE`,
`E_PATH_ESCAPE`, `E_DANGEROUS_KEY`, `E_TRIGGER_INVALID`, `E_ENV_INVALID`. Aucune
fuite de fixture/chemin/secret dans les messages.

## 9. Tests (par checkpoint)

- **CP2** : ids uniques, needs résolus, cycle refusé, stage vide, limites, timeout,
  action inconnue, secret brut refusé, path traversal, clé dangereuse, binaire,
  env/trigger invalides.
- **CP3** : pipeline simple, dépendances, parallélisme logique, cycle, trigger non
  correspondant, échec bloquant, échec toléré, job ignoré, approbation, annulation,
  timeout, sortie excessive, tentative de secret (masquage), action inconnue,
  déterminisme.
- **CP4** : exécutables fixés, pas d'argument libre, timeout, sortie plafonnée,
  cleanup, pas de réseau, pas de mutation `data/`, Docker indisponible géré.

## 10. Migrations & bundle

Schéma v3 inchangé (runs non persistés). Sauvegarde sans donnée volatile.
Moteur & UI Pipeline **lazy** ; absents des bundles `/`, `/calendar`, `/parcours`,
`/day/[id]`. Référence bundles CP0 à tenir.
