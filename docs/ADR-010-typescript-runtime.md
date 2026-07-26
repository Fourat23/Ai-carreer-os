# ADR-010 — Runtime TypeScript (compilation → Node)

Statut : accepté (Sprint V10). Décision d'implémentation, concise.

## Contexte

V9 a livré une fondation multi-runtime (adaptateurs Node + Python) : registre
pur `lib/runtime.mjs`, exécuteur système générique `lib/workspace-fs.mjs`
(execFile sans shell, timeout+SIGKILL, sortie plafonnée, env minimal),
protocole de résultat partagé, preuves de compétence, sauvegarde v3. V10 ajoute
un **runtime TypeScript réel** : compilation `.ts` → JavaScript **avant**
exécution par l'adaptateur Node existant, avec diagnostics pédagogiques.

## Décisions

### Séparation modèle / adaptateur / compilateur / exécuteur
Nouvelle couche PURE `lib/typescript-compile.mjs` (compilation via l'API
programmatique du package `typescript`) et adaptateur `typescript` dans le
registre. Le pipeline : **adaptateur TS → validation fichiers → compilation dans
le workspace isolé → JS émis → exécuteur Node existant → protocole partagé →
tests → preuve**. On **ne duplique pas** l'exécuteur système : après émission,
on réutilise `runExercise` avec le harnais Node sur le JS compilé.

### Compilation TypeScript → JavaScript
- Compilateur **côté serveur uniquement** (le package `typescript` n'entre
  jamais dans un bundle client). Il devient une **dépendance directe** (importé
  par du code serveur exécuté au runtime), plus seulement une devDependency.
- Multi-fichiers : tous les `.ts` de l'exercice sont compilés ensemble (un
  `ts.createProgram` avec un CompilerHost en mémoire lisant les fichiers du
  workspace ; émission des `.js` correspondants dans le workspace).
- Pas de `ts-node`, `tsx`, `esbuild`, Babel ni bundler : uniquement l'API
  officielle `typescript`.

### Résolution des imports
Uniquement **imports relatifs** entre fichiers du même exercice (`./x`,
`../y` refusé car sortie de racine). Le CompilerHost ne résout QUE les fichiers
fournis + les lib TS. Tout `import` de package externe, chemin absolu, URL,
ou built-in Node non nécessaire → **rejeté** avant compilation (validation pure)
et non résoluble par le host (aucune résolution de `node_modules`).

### Options de compilation (justifiées)
- `target: ES2022` — Node 22 supporte pleinement ES2022.
- `module: CommonJS` — l'harnais Node V9 charge l'entrée via `import()` ; le JS
  émis en CJS est chargeable par `import()` (Node interop) et les exports
  nommés restent accessibles ; évite les subtilités ESM de résolution.
  Le harnais existant appelle `mod[export]` — compatible avec les exports CJS.
- `strict: true` — objectif pédagogique (l'apprenant apprend un TS strict).
- `noEmitOnError: true` — aucune émission si erreur bloquante → aucun processus
  Node lancé sur du code invalide.
- `esModuleInterop: false` — non nécessaire (pas d'import de CJS externe).
- `skipLibCheck: true` — performance ; on ne vérifie pas les .d.ts de la lib.
- Source maps **désactivées** (pas d'émission de .map ; pas de fuite de chemins).
- **Aucune résolution de packages externes** (`types: []`, pas de `node_modules`
  dans le host).

### Diagnostics normalisés
`{ category: 'error'|'warning'|'suggestion', code, message, file?, line?,
column?, endLine?, endColumn?, phase: 'compile' }`. Ordre **déterministe**
(par fichier puis position puis code). Trois familles distinctes, jamais
confondues : **diagnostic de compilation** (phase compile, avant exécution),
**échec de test** (comparaison attendu/reçu), **erreur runtime** (exception à
l'exécution du JS). Les chemins internes du workspace sont **neutralisés**
(relatifs à l'exercice) ; aucun test privé n'apparaît dans un diagnostic.

### Sécurité
Inchangée et réutilisée : `execFile` sans shell, binaire = ce Node, args figés,
timeout + SIGKILL, sortie plafonnée, env minimal, workspace dédié anti-traversal,
refus binaire/tailles, nettoyage. La compilation elle-même est bornée (pas de
résolution réseau/FS hors workspace ; host en mémoire). **Aucune isolation OS.**

### Distinction honnête des protections
(a) protections applicatives (allowlist runtime, imports relatifs seuls, aucun
shell/eval), (b) isolation de **workspace** (racine dédiée, anti-traversal),
(c) limites de **ressources** (timeout, SIGKILL, sortie, env minimal),
(d) **véritable isolation OS/conteneur — NON fournie**. Le compilateur et le
runtime restent des processus locaux.

### Lazy loading
`@codemirror/lang-` pour TypeScript et l'éditeur restent chargés **uniquement**
sur `/lab/[id]` (import dynamique). Le package `typescript` est serveur : jamais
dans aucun bundle client. `/`, `/calendar`, `/parcours`, `/day/*` inchangés.

### Compatibilité des anciens exercices
Node (`node-js`) et Python (`python3`) inchangés ; workspaces V7/V8/V9,
progression, preuves et sauvegardes préservés. Le modèle d'exercice gagne
`runtime: 'typescript'` + fichiers `.ts` ; les migrations existantes s'appliquent.

### Choix de ne pas utiliser ts-node/tsx/esbuild
L'API programmatique `typescript` suffit (compilation + diagnostics riches),
sans dépendance supplémentaire ni second exécuteur. `ts-node`/`tsx` embarquent
leur propre exécution (dupliquerait le moteur) ; `esbuild`/Babel n'offrent pas
les diagnostics de type. Décision : compiler puis réutiliser l'adaptateur Node.

### Évolution future (hors V10)
TSX/React exigeraient `jsx` dans les options + un runtime de rendu : possible via
un futur adaptateur `tsx` réutilisant ce compilateur, sans toucher au modèle.
Non implémenté ici (V10 = `.ts` uniquement).

## Conséquences

Nouveaux : `lib/typescript-compile.mjs`(+d.ts), adaptateur `typescript` dans
`lib/runtime.mjs`, corpus `data/exercises/ts-*.json`, onglet Diagnostics dans le
Workbench. `typescript` promu en dépendance directe. Exécuteur, preuves,
sauvegarde et catalogue étendus sans duplication.
