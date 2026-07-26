# Sprint V9 — Multi-runtime foundation + Python Lab

Rapport final. AI Career OS reste **strictement local, mono-utilisateur**.
Curriculum des 365 jours et `data/program.json` **byte-identiques** à la baseline
V6 (`b7bc8e7`). Aucune montée de version de Next.js.

## 1. État initial réel

HEAD de départ `b9adba7` (V8), branche `claude/ai-career-os-saas-phfg49`,
275 tests, working tree propre, Python 3.11 présent (`python3`, `python`), Node
`/opt/node22/bin/node`. Aucune correction CP0 nécessaire (baseline reproductible).

## 2. Architecture multi-runtime

Séparation **modèle / adaptateur / exécuteur système** :
- `lib/runtime.mjs` (pur) : registre d'adaptateurs + marqueur de protocole
  partagé `LAB_RESULT_MARKER`. Chaque adaptateur : `{ id, kind, label, language,
  extensions, entryDefault, harnessFile, timeoutMs, maxOutputBytes, capabilities,
  buildHarness(exercise), buildArgs(harnessFile), env() }`.
- `lib/runtime-detect.mjs` (serveur) : résout le binaire absolu + version, mis en
  cache par process ; Node = `process.execPath`, Python via `sys.executable`.
- `lib/workspace-fs.mjs` (serveur) : exécuteur **générique** — matérialise le
  harnais de l'adaptateur, `execFile(binaire, args)` sans shell, timeout+SIGKILL,
  sortie plafonnée, env minimal. Aucune logique spécifique à un langage.
- Notation **commune** (`checkTest`/`buildAttemptResult`, `parseHarnessOutput`/
  `gradeRun`) : le protocole de sortie `MARKER + JSON({observed, stdout})` est
  identique pour tous les runtimes.

## 3. Checkpoints & commits

| CP | Sujet | Commit |
|----|-------|--------|
| CP0 | Baseline reproductible (aucune correction) | — |
| CP1 | ADR-009 multi-runtime | `6ab495b` |
| CP2 | Registre de runtimes + adaptateur Node (sans régression) | `a295037` |
| CP3 | Adaptateur Python sécurisé (exécution réelle) | `705a7b8` |
| CP4 | Modèle d'exercice multi-runtime (cohérence + limites) | `7809878` |
| CP5 | Workbench multi-langage (coloration + statut runtime) | `9559445` |
| CP6 | Catalogue d'exercices filtrable | `07fc103` |
| CP7 | Corpus pilote de 8 exercices Python | `673e558` |
| CP8 | Preuves/compétences Python (logique partagée) | `b107591` |
| CP9 | Export/import multi-parcours + workspaces | `fe3929c` |
| CP10| Hardening + rapport (ce commit) | (ce commit) |

## 4. Fichiers principaux

Nouveaux : `lib/runtime.mjs`(+d.ts), `lib/runtime-detect.mjs`(+d.ts),
`app/lab/LabCatalog.tsx`, `data/exercises/py-*.json` (8), `tests/runtime.test.mjs`,
`tests/python-runtime.test.mjs`, `tests/backup-v3.test.mjs`,
`docs/ADR-009-multi-runtime.md`. Modifiés : `lib/exercise.mjs` (délègue le
registre, cohérence runtime↔extension, limites, effectiveLimits),
`lib/workspace.mjs`/`workspace-fs.mjs`/`workspace-server.ts` (exécuteur
générique + export/allowlist/restore workspaces), `lib/backup.mjs` (schéma v3),
`app/lab/[exerciseId]/*` (langage + statut runtime), `app/api/progress/*`,
`app/settings/SettingsPanel.tsx`, `data/day-exercises.json`.

## 5. Registre de runtimes

`getRuntimeAdapter(id)`, `getRuntime(id)`, `isKnownRuntime(id)`,
`listRuntimeAdapters()`, `DEFAULT_RUNTIME_ID='node-js'`. Liste fermée : un
exercice ne peut pas introduire un binaire arbitraire. Un `runtime` absent →
défaut Node (compat V7/V8) ; présent mais hors registre → rejet.

## 6. Adaptateur Node

Harnais `.mjs` : `import()` de l'entrée, capture stdout, appel des exports
(`call-equals`) ou observation stdout. Binaire = `process.execPath`, env
`{PATH:'/usr/bin:/bin', NODE_ENV}`. Comportement identique à V8 (tous les
exercices Node passent par l'exécuteur générique sans régression).

## 7. Adaptateur Python

Harnais `.py` : chargement de l'entrée via `importlib`, appel des fonctions par
`getattr`, sérialisation JSON des retours, capture stdout, même ligne marquée.
Détection : `python3`/`python`/`py`, contrôle `version_info[0]==3`, chemin absolu
par `sys.executable` (jamais supposer que `python`=3). Env
`{PATH, PYTHONDONTWRITEBYTECODE, PYTHONUNBUFFERED}`. Imports locaux au niveau
racine du workspace. Python absent → exercices désactivés proprement (bouton
Lancer désactivé + message), l'app ne tombe pas.

## 8. Modèle d'exercice final

`{ id, title, summary, difficulty, runtime?, language?, workspace{entry, files[]},
testFiles?, tests[], skills?, tags?, activeFile?, limits? }`. Fichier :
`{ path, content, language?, editable?, readOnly?, hidden?, entry?, test? }`.
Validation : runtime connu, cohérence runtime↔extension d'entrée, chemins sûrs
(pas d'absolu/`..`/doublon/vide), pas de binaire, tailles bornées, tests privés
non éditables/non exposés, limites bornées au plafond runtime (`effectiveLimits`).
Rétrocompatible V7/V8.

## 9. Exercices Python (8)

py-temperature (conditions), py-list-sum (boucles/listes), py-word-count
(dict + import local, multi-fichiers), py-slugify (chaînes, test privé),
py-safe-divide (erreurs, test privé), py-debug-average (débogage, multi-fichiers,
test privé, multi-compétences), py-debug-grades (débogage), py-report
(multi-fichiers + stdout). Mix : 3 multi-fichiers, 2 débogage, 3 tests privés,
1 stdout, 2 multi-compétences. **Tous passent avec leur solution de référence** ;
échouent avec des solutions incorrectes ciblées ; tests privés rédigés côté
serveur. Liés à des journées Python/Data via `data/day-exercises.json` (aucun
Markdown modifié).

## 10. Catalogue

`/lab` : cartes avec langage/runtime (+ disponibilité), difficulté, type
(simple / multi-fichiers / async / debugging / tests privés), statut utilisateur
(non commencé / en cours / réussi), journée liée, nombre de tests. Filtres
langage / difficulté / compétence / statut + recherche texte, reflétés dans
l'URL (partageable), compteur, état vide, tri stable, sans dépendance lourde.

## 11. Liaison exercices ↔ journées ↔ preuves

Fixture `data/day-exercises.json` (bidirectionnelle, validée). Une réussite
(tous tests publics ET privés) déclenche `recordExerciseSuccess` (runtime-
agnostique) : preuve `exercise` (url `/lab/<id>`) sur chaque journée liée
(idempotent) + relèvement des compétences. Identique pour Node et Python
(aucune logique dupliquée). Ouvrir un exercice (GET) ne modifie jamais la
progression.

## 12. Sauvegarde & migrations

Schéma v3 : `serializeBackupV3` enveloppe la progression multi-parcours **et**
les workspaces du Laboratoire. `parseBackupV3` revalide strictement chaque
parcours, migre V4/V5/V6 (plat) et V7/V8 vers v3, refuse un schéma trop récent /
une autre app, filtre les workspaces via allowlist (ignore exercices inconnus,
fichiers hors allowlist dont tests privés, traversal, binaire, dépassements).
Import : aperçu serveur sans écriture, snapshot avant remplacement, restauration
atomique avec rollback. Round-trip vérifié (progression + workspaces Node &
Python).

## 13. Performance (production chaude, médiane de 5)

| Route | total | Note |
|-------|-------|------|
| / | 37 ms | 109 kB First Load, aucun éditeur |
| /calendar | 43 ms | 106 kB |
| /parcours | 16 ms | 108 kB |
| /lab | 19 ms | 109 kB (catalogue, aucun éditeur) |
| /lab/fizzbuzz (Node) | 17 ms | 115 kB ; CodeMirror + langages en chunks paresseux |
| /lab/py-temperature (Python) | 15 ms | idem, langage Python paresseux |
| /day/1 | 21 ms | 116 kB |
| /api/search-index | 7 ms | — |

`/` inchangé à 109 kB : ni CodeMirror ni langage hors Laboratoire. Détection
runtime mise en cache. Aucune régression.

## 14. Matrice navigateur

13 routes (Dashboard, Parcours, Calendrier, Révisions, Vue Jour courte /day/1,
Vue Jour longue /day/91, Laboratoire, Node simple, Node multi-fichiers, Python
simple, Python multi-fichiers, Compétences, Sauvegarde) × 5 largeurs
(375/768/1024/1440/1920) = **65 vérifications, 0 échec** : toutes 200, aucun
débordement horizontal, aucune erreur console.

## 15. Tests & gates

`301 tests` (node:test) verts ; `tsc --noEmit` propre ; `next build` sans
avertissement ; `curriculum:check` OK ; génération content-idempotente
(seul `generatedAt` varie, non commité) ; `program.json` et 365 jours
byte-identiques.

## 16. Limites honnêtes

- **Pas d'isolation OS/conteneur.** L'exécution Node/Python est un **processus
  local**. On distingue clairement : protections applicatives (allowlist runtime,
  args figés, aucun shell, aucun eval), isolation de **workspace** (racine dédiée,
  anti-traversal, refus binaire/tailles), limites de **ressources** (timeout,
  SIGKILL, sortie plafonnée, env minimal). Un script déterminé garde l'accès aux
  API fichier/réseau de son langage. Modèle de menace : accidents + ressources
  bornées pour du code personnel, pas du code adverse.
- `execFile` envoie SIGKILL au timeout (robuste, pas de SIGTERM gracieux préalable).
- Un seul type de tests par données (`call-equals`, `stdout-*`) ; pas de framework
  de test utilisateur arbitraire.
- Léger flash possible du Workbench en vue étroite (layout desktop rendu côté
  serveur avant détection viewport).
- Détection Python mise en cache par process : un Python installé après le
  démarrage du serveur exige un redémarrage.

## 17. État Git final

Branche `claude/ai-career-os-saas-phfg49`, tous les checkpoints commités et
poussés, working tree propre, local == origin, données réelles restaurées,
aucun workspace parasite.

## 18. Recommandation V10

1. **Isolation renforcée** (worker thread limité, ou conteneur `docker run
   --network none --read-only`) via un nouvel adaptateur — l'interface le permet
   sans toucher au modèle ni à l'UI.
2. Runtime **TypeScript** (transpile) et **tests écrits par l'apprenant**
   (assertions nommées, diffs riches).
3. `stdin` pour les exercices interactifs (capacité déjà prévue dans le modèle).
4. Étendre le corpus Python/Node et lier davantage de journées ; exercices
   multi-journées.
5. SQL / preview HTML-CSS-JS (hors périmètre V9) sur la même fondation d'adaptateurs.
