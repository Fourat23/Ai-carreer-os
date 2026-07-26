# ADR-009 — Fondation multi-runtime (Node + Python)

Statut : accepté (Sprint V9). Décision d'implémentation, concise.

## Contexte

Le Laboratoire V8 exécute uniquement Node.js : la génération du harnais et la
commande d'exécution sont câblées pour Node dans `workspace.mjs` /
`workspace-fs.mjs`, et `RUNTIMES` (dans `exercise.mjs`) ne contient que
`node-js`. V9 doit rendre Python réellement exécutable **sans régression Node**,
via une architecture d'adaptateurs, tout en restant local, mono-utilisateur.

## Décisions

### Séparation modèle / adaptateur / exécuteur
- **Modèle & protocole (pur)** : `lib/runtime.mjs` — registre des
  `RuntimeAdapter`, marqueur de protocole `LAB_RESULT_MARKER`, et pour chaque
  runtime : métadonnées + `buildHarness(exercise)` + `buildArgs(harnessFile)`.
- **Notation (pur, partagée)** : `checkTest` / `buildAttemptResult` (exercise.mjs)
  et `parseHarnessOutput` / `gradeRun` (workspace.mjs) restent **communs à tous
  les runtimes** — le protocole de sortie `LAB_RESULT_MARKER + JSON({observed,
  stdout})` est identique quel que soit le langage.
- **Détection (serveur)** : `lib/runtime-detect.mjs` résout le binaire absolu et
  la version, met le résultat en cache, expose la disponibilité.
- **Exécution (serveur)** : `workspace-fs.mjs` devient **générique** — il
  matérialise le harnais de l'adaptateur, lance `execFile(binaire, args)` sans
  shell, applique timeout + SIGKILL + sortie plafonnée + env minimal, puis note
  via les fonctions pures. Plus aucune logique spécifique Node.

### RuntimeAdapter (contrat)
`{ id, label, language, extensions[], entryDefault, harnessFile, timeoutMs,
maxOutputBytes, capabilities, buildHarness(exercise), buildArgs(harnessFile),
env() }`. Le binaire n'est PAS dans l'adaptateur (pur) : il est résolu par la
détection serveur (Node = `process.execPath` ; Python = interpréteur détecté).

### Capacités (RuntimeCapabilities)
`{ execution, publicTests, privateTests, multiFile, stdin, cancellation,
timeout, syntaxHighlighting }`. Permettent à l'UI d'activer/désactiver
proprement (bouton Lancer, coloration).

### Compatibilité du modèle V8 & migration
Les fixtures V7/V8 (`runtime: "node-js"`, mono ou multi-fichiers) restent
valides sans édition. Un exercice sans `runtime` est traité par défaut comme
`node-js` (normalisation pure, pas de mutation dispersée). Le validateur rejette
un runtime inconnu et une incohérence runtime/extension.

### Registre & disponibilité
`getRuntimeAdapter(id)`, `listRuntimeAdapters()`, `isKnownRuntime(id)` (pur).
La disponibilité (`detectRuntime(id)`) est serveur, mise en cache par process ;
exposée à l'UI. Un runtime indisponible (ex. Python absent) **désactive**
proprement ses exercices (bouton Lancer désactivé + message) sans faire tomber
l'app ; les exercices restent visibles au catalogue, marqués « indisponible ».

### Différences Node / Python
- Node : harnais `.mjs`, `import()` dynamique de l'entrée, appel des exports.
- Python : harnais `.py`, chargement de l'entrée via `importlib`, appel des
  fonctions par `getattr`, sérialisation JSON des retours. `sys.executable`
  fournit le chemin absolu de l'interpréteur ; env `PYTHONDONTWRITEBYTECODE=1`,
  `PYTHONUNBUFFERED=1`. Imports locaux : fichiers au niveau racine du workspace
  (le répertoire du workspace est dans `sys.path`).
- Le modèle de tests (`call-equals`, `stdout-equals`, `stdout-contains`) est
  **agnostique du langage** : seules les valeurs/args JSON comptent.

### Tests publics et privés
Inchangé et partagé : les tests `private` ne sont **jamais** envoyés au client
(méta) ; leurs attendus/reçus sont **rédigés côté serveur** dans le résultat.
Valable pour Node comme Python.

### Limites de sécurité du processus local (honnêteté)
On distingue clairement : (a) protections applicatives (allowlist runtime,
args figés, aucun shell, aucun eval), (b) isolation de **workspace** (racine
dédiée, anti-traversal, pas de symlink suivi, refus binaire/tailles), (c)
limites de **ressources** (timeout, SIGKILL, sortie plafonnée, env minimal), et
(d) **véritable isolation OS/conteneur** — **NON fournie**. Un processus Node ou
Python local garde l'accès aux API fichier/réseau de son langage. Modèle de
menace : éviter accidents + borner ressources pour du code **personnel local**,
pas exécuter du code adverse.

### Stratégie future d'isolation conteneur
Documentée, non implémentée : un futur adaptateur pourrait router `buildArgs`
vers `docker run --network none --read-only …`. L'interface `RuntimeAdapter` +
détection le permet sans toucher au modèle ni à l'UI. Si Docker est absent (cas
actuel), on ne prétend pas l'isolation — on l'indique.

### Persistance des workspaces
Inchangée : fichiers utilisateur sur disque sous `data/lab-workspaces/<id>/`
(gitignoré) via l'API existante ; état d'UI léger en localStorage. CP9 ajoute la
préservation des workspaces dans l'export/import multi-parcours.

### Chargement lazy des langages CodeMirror
`@codemirror/lang-python` (et JS déjà présent) chargés **uniquement** sur les
routes du Laboratoire, via l'import dynamique de l'éditeur. Aucun langage sur
`/`, `/calendar`, `/parcours`, `/day/*`.

### Erreurs utilisateur normalisées
`ExecutionResult` normalisé `{ status, exitCode, stdout, stderr, durationMs,
timedOut, cancelled, tests, diagnostics }`. Erreurs de syntaxe/exception rendues
lisibles (traceback Python tronqué, stack Node tronquée), marqueur interne
jamais exposé, secrets/chemins absolus neutralisés.

### Windows / Linux / macOS
Détection Python multi-candidats (`python3`, `python`, `py` sur Windows). On ne
suppose jamais que `python` = Python 3 (contrôle de version). `sys.executable`
donne le chemin absolu portable. `windowsHide: true` déjà utilisé.

### Hors périmètre V9
SQL, HTML/CSS/JS preview, React, TypeScript-exécuté, Bash, Java : **non
implémentés** ce sprint. L'architecture les rend possibles plus tard sans
refonte.

## Conséquences

Nouveaux modules : `lib/runtime.mjs` (adaptateurs), `lib/runtime-detect.mjs`
(détection serveur), `lib/runtimes/*` si besoin de séparer les harnais.
`exercise.mjs` délègue `getRuntime`/`RUNTIMES` au registre (compat conservée).
`workspace-fs.mjs` devient générique. L'UID visuel V8 est préservé.
