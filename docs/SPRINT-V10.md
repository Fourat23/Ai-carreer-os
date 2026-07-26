# Sprint V10 — TypeScript Workbench & Curriculum Integration

Rapport final. AI Career OS reste **strictement local, mono-utilisateur**.
Curriculum des 365 jours et `data/program.json` **byte-identiques** à la baseline
V6 (`b7bc8e7`). Aucune montée de version de Next.js. Aucune dépendance nouvelle
hors la promotion de `typescript` (déjà présent) en dépendance directe.

## 1. Mission

Faire du Workbench un véritable environnement d'apprentissage TypeScript :
compiler des exercices `.ts` multi-fichiers avec le compilateur officiel
`typescript`, afficher des diagnostics pédagogiques, exécuter le JS compilé via
l'adaptateur Node **existant** (sans second exécuteur), ajouter un corpus TS
sérieux, le relier aux journées TypeScript **sans toucher au Markdown**, et
préserver strictement Node, Python, la progression, les preuves et les
sauvegardes.

## 2. Architecture

Pipeline TypeScript : **adaptateur TS → validation des imports → compilation en
mémoire dans le workspace isolé → JS émis → exécuteur Node existant → protocole
partagé → notation → preuve**. Aucun second moteur d'exécution.

- `lib/typescript-compile.mjs` (PUR) : compilation via l'API programmatique
  `typescript`, CompilerHost EN MÉMOIRE (seuls les fichiers fournis + la lib TS ;
  aucune résolution `node_modules` / FS réel). Analyse statique des imports :
  relatifs uniquement, rejet des packages externes / chemins absolus / URL /
  traversal / directives triple-slash. Options : ES2022, CommonJS, strict,
  `noEmitOnError`, `skipLibCheck`, pas de source maps, `types: []`. Diagnostics
  normalisés `{category, code, message, file, line, column, endLine, endColumn,
  phase:'compile'}`, ordre déterministe.
- `lib/runtime.mjs` : adaptateur `typescript` (kind typescript, extensions `.ts`,
  harnais CommonJS `require` du JS compilé, binaire = ce Node).
- `lib/runtime-detect.mjs` : détection serveur (Node + `typescript` résoluble).
- `lib/workspace-fs.mjs` : phase de compilation avant le spawn — en cas d'échec,
  AUCUN processus lancé ; diagnostics renvoyés (phase `compile`) ; chemins
  internes neutralisés ; tests privés jamais exposés.

## 3. Checkpoints & commits

| CP | Sujet | Commit |
|----|-------|--------|
| CP1 | ADR-010 runtime TypeScript (compile → Node) | `c868c1f` |
| CP2 | Adaptateur TypeScript + compilateur pur | `c81868f` |
| CP3 | Pipeline compile → Node (sans second exécuteur) | `cb281a5` |
| CP4 | Workbench TypeScript (coloration, onglet Diagnostics, états) | `e94d3e6` |
| CP5 | Persistance/restauration des workspaces TS (schéma v3) | `031ec05` |
| CP6 | Corpus TypeScript de 13 exercices | `0fad9cd` |
| CP7 | Liaison exercices TS ↔ journées (sans Markdown) | `de6688b` |
| CP8 | Retour de tests enrichi, indices statiques, anti-fuite | `d1acf3c` |
| CP9 | Exercices dans la palette globale + catalogue multi-runtime | `c23a01d` |
| CP10| Validation finale + rapport (ce commit) | (ce commit) |

## 4. Runtime & compilateur TypeScript

- `typescript` **promu en dépendance directe** (importé par du code serveur au
  runtime), version 5.9.3 résolue. Compilateur **côté serveur uniquement** :
  jamais dans un bundle client.
- Multi-fichiers : tous les `.ts` de l'exercice sont compilés ensemble
  (`ts.createProgram`), imports relatifs résolus en mémoire.
- `noEmitOnError` : aucune émission de JS si erreur bloquante → aucun processus
  Node lancé sur du code invalide.
- Le JS compilé et le harnais restent côté serveur (jamais renvoyés au client).

## 5. Workbench TypeScript

Coloration TS **paresseuse** (`@codemirror/lang-javascript` en mode typescript,
chargé uniquement sur `/lab/[id]`). Onglet **Diagnostics** distinct de Tests /
Console / Aide : liste ordonnée avec message, position `fichier:ligne:colonne`,
code `TSxxxx`, et **indice pédagogique statique** ; clic → ouverture du fichier à
la position. États « Compilation… » → « Exécution des tests… ». Lancements
concurrents empêchés.

## 6. Retour de tests (CP8)

- Tests publics : nom, statut, **durée par test**, attendu vs reçu, **diff
  structuré** (chemins divergents) pour les valeurs objet/tableau.
- Tests privés : **agrégat seul** (« k/n réussis, détails masqués »). Le nom,
  l'attendu, le reçu, le message et la durée d'un test privé ne quittent JAMAIS
  le serveur (`lib/lab-feedback.mjs` + métadonnées d'exercice filtrées).
- Indices statiques (`lib/ts-hints.mjs`) pour les diagnostics TS courants. Aucune
  IA, aucun appel réseau.

## 7. Corpus TypeScript (13 exercices)

`ts-greeter` (d1) · `ts-typed-average` (d2) · `ts-fizzbuzz` (d2) ·
`ts-debug-discount` (d2) · `ts-async-double` (d2) · `ts-inventory` (d3) ·
`ts-debug-positives` (d3) · `ts-debug-filter-strings` (d3) · `ts-generic-first`
(d3) · `ts-async-fetch-user` (d3) · `ts-union-area` (d3) · `ts-word-frequency`
(d3) · `ts-interface-cart` (d4).

Couverture : 4 multi-fichiers, 10 à test privé, 3 débogage (le code de départ
compile — bug logique), 2 async/Promise, 9 multi-compétences, difficultés 1→4.
**Toutes les solutions de référence passent 100 % des tests** ; les codes de
départ échouent de façon utile.

## 8. Liaison journées (CP7) & catalogue/palette (CP9)

- Fixture `data/day-exercises.json` : exercices TS reliés aux journées TypeScript
  (J36, J37, J38, J41, J44, J88), **sans modifier le Markdown**. Fonction pure
  `selectDayExercises` (ordre par difficulté, statut par preuve). La Vue Jour
  affiche runtime + difficulté + statut.
- Catalogue `/lab` : filtre langage (TypeScript inclus automatiquement),
  difficulté, compétence, statut ; recherche texte ; URL partageable ; compteur ;
  réinitialisation.
- Palette globale (Ctrl/Cmd+K) : indexe les exercices (Node/Python/TS) —
  métadonnées PUBLIQUES uniquement (titre, compétences, runtime, difficulté).

## 9. Sauvegarde (CP5)

Le schéma v3 (multi-parcours + workspaces) est générique : les workspaces `.ts`
éditables sont persistés/restaurés ; les fichiers `.ts` en lecture seule et les
tests `.ts` privés ne fuient jamais (allowlist) ; limites et anti-traversal
appliqués. Le runtime n'est pas persisté (source unique = définition d'exercice).

## 10. Performance (production chaude, médiane de 5)

| Route | total | Note |
|-------|-------|------|
| / | 30 ms | 109 kB First Load, aucun éditeur |
| /calendar | 25 ms | 106 kB |
| /parcours | 9 ms | 108 kB |
| /lab | 12 ms | 109 kB (catalogue, aucun éditeur) |
| /lab/fizzbuzz (Node) | 10 ms | 117 kB ; CodeMirror en chunk paresseux |
| /lab/ts-typed-average (TS) | 9 ms | idem, coloration TS paresseuse |
| /day/36 (journée TS) | 17 ms | 116 kB |

Exécution d'un run (POST, médiane) : **TypeScript ≈ 116–128 ms** (compilation +
exécution Node), Node ≈ 43 ms, Python ≈ 33 ms. Le surcoût TS (~80 ms) est celui
de la compilation par le compilateur officiel ; il ne concerne QUE l'action
« Lancer » d'un exercice TS. Aucune régression hors Lab (routes ordinaires ≤ V9).

## 11. Discipline de bundle

- `/` reste à **109 kB** : ni CodeMirror ni le compilateur TypeScript.
- CodeMirror + coloration (JS/TS/Python) chargés **uniquement** sur `/lab/[id]`
  (import dynamique). Le package `typescript` est **serveur** : absent de tout
  bundle client.
- `/`, `/calendar`, `/parcours`, `/day/*`, `/lab` (catalogue) : aucun éditeur.

## 12. Matrice navigateur

12 routes (Dashboard, Calendrier, Parcours, Laboratoire, journée TS /day/36,
journée Node /day/1, Node /lab/fizzbuzz, Python /lab/py-temperature, TS simple,
TS multi-fichiers, Compétences, Sauvegarde) × 5 largeurs (375/768/1024/1440/1920)
= **60 vérifications, 0 échec** : toutes 200, aucun débordement horizontal,
aucune erreur console. Vérifs complémentaires : palette Ctrl+K + Escape,
focus clavier de l'éditeur, `prefers-reduced-motion`, état d'erreur de
compilation (diagnostics + indices), **aucune fuite de test privé** ni de code.

## 13. Sécurité — distinction honnête

(a) protections applicatives (allowlist runtime, imports relatifs seuls, aucun
shell/eval) ; (b) isolation de **workspace** (racine dédiée, anti-traversal,
refus binaire/tailles) ; (c) limites de **ressources** (timeout + SIGKILL,
sortie plafonnée, env minimal) ; (d) **véritable isolation OS/conteneur — NON
fournie**. Le compilateur et l'exécution restent des processus locaux. Modèle de
menace : accidents + ressources bornées pour du code personnel, pas du code
adverse.

## 14. Limites honnêtes

- Pas d'isolation OS/conteneur (voir §13).
- V10 = `.ts` uniquement (pas de TSX/React/preview navigateur) ; un futur
  adaptateur `tsx` pourrait réutiliser ce compilateur sans toucher au modèle.
- La durée par test n'est significative que pour les tests `call-equals` (les
  tests stdout partagent la durée du processus).
- Détection du runtime mise en cache par process (redémarrage requis si
  l'environnement change).
- Le surcoût de compilation TS (~80 ms) est intrinsèque au compilateur officiel.

## 15. Tests & gates

`356 tests` (node:test) verts ; `tsc --noEmit` propre ; `next build` sans
avertissement ; `curriculum:check` OK ; `data/program.json` et les 365 jours
**byte-identiques** à la baseline `b7bc8e7`.

## 16. État Git final

Branche `claude/ai-career-os-saas-phfg49`, tous les checkpoints commités et
poussés, working tree propre, local == origin, `data/progress.json` restauré à
son SHA initial (`12f5390…`), aucun workspace parasite.

## 17. Recommandation V11

1. Adaptateur **TSX/React** réutilisant le compilateur (jsx + runtime de rendu),
   éventuellement une preview HTML/CSS/JS.
2. **Isolation renforcée** (worker limité ou conteneur `--network none
   --read-only`) via un nouvel adaptateur, sans toucher au modèle ni à l'UI.
3. Tests écrits par l'apprenant (assertions nommées) et `stdin` interactif.
4. Étendre le corpus TS (POO, patterns, génériques avancés) et relier davantage
   de journées.
