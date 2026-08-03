# TSD-020 — Terminal pédagogique borné & Docker (Technical Spec & Design)

Compagnon technique de l'ADR-020/HSD-020. Fixe les **contrats de types**, l'API,
les statuts, les erreurs et les invariants de test. Les signatures sont la cible
d'implémentation (CP4-CP7) ; le modèle d'audit (CP1) est déjà livré.

## 1. Modèle d'audit pédagogique (livré CP1 — `lib/pedagogy-audit.mjs`)

```
Dimension   = { id: string, label: string, min: 0..4, critical: boolean }   // 16
Scale       = 0 | 1 | 2 | 3 | 4
Scores      = Record<Dimension.id, Scale>
Evaluation  = { ok: boolean, avg: number, failures: string[], missing: string[] }
DangerSignal= { code: string, severity: 'blocking' | 'warn', excerpt: string }
Structural  = { present: string[], missing: string[], completeness: number }
LedgerItem  = { id: string, kind: 'day'|'exercise'|'mission'|'glossary'|'content',
                recent?: boolean, scores: Scores, sourcePath?: string, notes?: string }
Ledger      = { sprint, rubricVersion, scanGlobs: string[], items: LedgerItem[] }
```

Fonctions **pures** : `evaluateScores(scores, {recent})`, `detectDangerSignals(text)`,
`blockingSignals(text)`, `structuralSignals(text)`, `validateAuditItem(item)`,
`validateAuditLedger(ledger, loadSource?)`. Aucune I/O ; aucune mutation de
l'entrée. Seuils : `noDimBelow=2`, `globalAvgMin=3.0`, `recentAvgMin=3.25`,
`hardMinDims=[technical-accuracy, objective, progression, autonomous-practice]`,
`technical-accuracy` critique (< min ⇒ bloquant).

## 2. Terminal — contrats de types (cible CP4)

```
CwdPolicy         = 'workspace'                      // toujours borné au workspace
EnvironmentPolicy = 'minimal'                        // PATH réduit, aucun secret
ArgumentSpec      = { name, kind: 'enum'|'int'|'path'|'flag'|'literal',
                      required?: boolean, values?: string[], min?, max?,
                      default?: unknown }
TerminalTask = {
  id, title, description,
  adapter: 'local' | 'docker',
  executable: string,                 // ∈ allowlist de l'adaptateur
  argumentSchema: ArgumentSpec[],
  defaultArguments: string[],
  allowedArguments?: string[],        // liste blanche additionnelle
  cwdPolicy: CwdPolicy,
  environmentPolicy: EnvironmentPolicy,
  timeoutMs: number,                  // borné par le plafond de l'adaptateur
  maxStdoutBytes, maxStderrBytes, maxCombinedBytes: number,
  expectedExitCodes: number[],
  successCriteria?: { exitCode?: number[], stdoutIncludes?: string[],
                      stdoutEquals?: string },
  cleanupPolicy: 'always',
  skills: string[], dayRefs: number[], trackScope?: string[],
  hints?: string[], securityNotes?: string[],
}
```

```
TerminalStatus = 'idle' | 'preparing' | 'running' | 'success' | 'failed'
               | 'timed-out' | 'cancelled' | 'cleanup-failed' | 'unavailable'
TerminalRun = {
  id, taskId, status: TerminalStatus, commandPreview: string, adapter,
  startedAt, endedAt, durationMs: number,
  exitCode: number | null, signal: string | null,
  stdout, stderr: string, truncated: boolean,
  cancelled, timedOut, cleaned: boolean,
  diagnostic?: string,
}
```

## 3. API prévue

- **Interface d'exécution** (`ExecutionAdapter`) :
  - `availability(): { state: 'available'|'cli-only'|'absent', version?: string, reason?: string }`
  - `prepare(task): Promise<{ runToken: string, workspaceDir: string }>`
  - `execute(task, args: string[], runToken): Promise<TerminalRun>`
  - `cancel(runId): Promise<void>`
  - `cleanup(runToken): Promise<{ cleaned: boolean }>`
- **Route** `POST /api/terminal/[taskId]` `{ args: string[], action: 'run'|'cancel' }`
  → `TerminalRun` public (jamais de chemin absolu hôte, jamais d'env, jamais de
  secret). `GET` → `availability()` de l'adaptateur de la tâche.
- **Fonctions pures** (`lib/terminal.mjs`) : `validateArguments(task, raw) →
  { ok, argv, errors }`, `buildCommandPreview(task, argv) → string`,
  `nextStatus(current, event) → TerminalStatus`, `boundOutput(s, maxBytes) →
  { text, truncated }`, `isAllowedExecutable(adapter, exe) → boolean`,
  `validateWorkspacePath(root, rel) → { ok, resolved }` (réutilise
  `resolveWithinRoot` de `lib/workspace.mjs`).

## 4. Validation des arguments & chemins

- Chaque argument validé **élément par élément** contre `ArgumentSpec`
  (enum ⊂ values ; int ∈ [min,max] ; flag ∈ allowlist ; literal exact ;
  path → `validateWorkspacePath`). Rejet de tout chemin **absolu**, de `..`, de
  backslash, de tout ce qui sort du workspace (`realpath`), des symlinks hors
  racine. **Jamais** de concaténation vers un shell ; l'argv part tel quel à
  `execFile`.
- Caractères spéciaux du shell (`; | & $ \` > <`) traités comme **données**
  d'argument, jamais interprétés (garanti par `shell:false`).

## 5. Statuts, timeouts, annulation, bornage

- **Timeout** : `execFile({ timeout, killSignal:'SIGKILL' })` ; le dépassement
  produit `status:'timed-out', timedOut:true`.
- **Annulation** : `cancel` envoie `SIGTERM` puis `SIGKILL` après un délai borné ;
  produit `status:'cancelled'`. Double annulation idempotente.
- **Sortie bornée** : `maxBuffer` + `boundOutput` ; dépassement ⇒ `truncated:true`
  et sortie tronquée proprement (jamais de fuite illimitée).

## 6. Configuration Docker (cible CP6)

```
DockerTaskConfig = {
  image: string,                      // ∈ allowlist, version fixée
  digest?: string,
  network: 'none',                    // défaut
  readOnly: true, tmpfs: string[],
  pidsLimit: number, memory: string, cpus: string,
  securityOpt: ['no-new-privileges'], capDrop: ['ALL'],
  user: string,                       // non-root
  workspaceMount: { hostPath, containerPath, readOnly? },  // borné
  removeAfter: true, timeoutMs: number, nameStrategy: 'random',
}
buildDockerArgs(config, task, argv) → string[]   // PUR, testable sans Docker
```
Refus à la construction : image hors allowlist, réseau ≠ none non justifié,
montage hors workspace, capability dangereuse, user root, ressource non bornée,
`--privileged`, montage du socket Docker.

## 7. Erreurs

Codes stables : `E_BINARY_NOT_ALLOWED`, `E_ARG_INVALID`, `E_PATH_ESCAPE`,
`E_TIMEOUT`, `E_OUTPUT_OVERFLOW`, `E_CANCELLED`, `E_CLEANUP_FAILED`,
`E_ADAPTER_UNAVAILABLE`, `E_IMAGE_NOT_ALLOWED`, `E_DOCKER_UNAVAILABLE`. Les erreurs
serveur ne fuient jamais de chemin absolu hôte ni d'environnement.

## 8. Tests (obligatoires par checkpoint)

- **CP1 (livré)** : rubrique, seuils, dimensions manquantes, danger bloquant
  (chmod 777 non encadré, rm -rf destructif, isolation OS surévaluée, sécurité
  absolue, code non fermé), contre-exemples non bloquants (chmod 777 encadré,
  `grep TODO`, attribut `placeholder=`, « à compléter » consigne), placeholder
  réel, section absente, déterminisme, absence de mutation.
- **CP4/CP5** : succès, binaire refusé, argument refusé, chemin absolu, traversal,
  symlink, timeout, sortie excessive, stderr, exit code ≠ 0, annulation, double
  annulation, processus enfant, cleanup, env sans secret, accès hors workspace,
  métacaractères traités comme données.
- **CP6** : génération d'arguments, image refusée, réseau refusé, montage refusé,
  capability refusée, user root refusé, ressource hors limite, cleanup, conteneur
  déjà absent, daemon absent, CLI absent, timeout, stdout/stderr bornés.

## 9. Migrations & sauvegarde

Additif : tout champ de progression lié au terminal est optionnel ; les
progressions antérieures restent valides (migration = no-op). La sauvegarde v3
n'inclut jamais de stdout massif, de secret, ni de donnée Docker volatile.
Anciennes sauvegardes toujours importables ; refus des schémas futurs ;
restauration exacte du track actif.

## 10. Discipline de bundle

Terminal, adaptateurs et détection Docker sont **serveur** ou chargés **lazy**
dans `/lab/[id]` (comme CodeMirror). Aucune dépendance terminal/Docker sur `/`,
Dashboard, Parcours, Calendrier, Vue Jour. Référence CP0 à ne pas régresser :
shared 103 kB, `/lab/[id]` 118 kB, autres 103-116 kB.
