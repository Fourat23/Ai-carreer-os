# Sprint V8 — Workbench IDE V2

Rapport final. AI Career OS reste **strictement local, mono-utilisateur,
JavaScript/Node uniquement**. Aucun contenu pédagogique modifié : `curriculum/`
et `data/program.json` sont **byte-identiques** à la baseline V6/V7 (`b7bc8e7`).
Aucune montée de version de Next.js ni de dépendances non concernées.

## Avant / après

- **Avant (V7, `b67a781`)** : Lab MVP mono-fichier (un éditeur, un panneau de
  résultats), 263 tests. Deux limites : UI mono-fichier ; responsive ultrawide
  imparfait sur Vue Jour et Parcours. Fragilité de dépendance CodeMirror.
- **Après (V8)** : `/lab/[exerciseId]` est un **Workbench trois zones**
  (explorateur + onglets + éditeur + tests/console/aide), multi-fichiers,
  panneaux ajustables et persistés, raccourcis clavier, autosave, tests
  publics/privés, historique d'exécution, responsive tablette/mobile, catalogue
  de **8 exercices**. **275 tests**.

## Architecture Workbench

- **Modèle de fichiers** (`lib/exercise-files.mjs`, pur) : liste normalisée
  `{ path, content, language, editable, hidden, entry, test }` fusionnant
  `workspace.files` + `testFiles` privés. Rétrocompatible V7
  (`migrateLegacySingleFileExercise`). Fonctions pures testées :
  `normalizeExerciseFiles`, `validateExercisePath`, `resolveEntryFile`,
  `resolveActiveFile`, `updateWorkspaceFile`, `resetWorkspaceFiles`,
  `clientFiles` (n'expose jamais les fichiers de test privés).
- **Serveur** (`workspace-fs.mjs` + `workspace-server.ts`) : allowlist basée sur
  le modèle normalisé ; matérialise tous les fichiers (y compris tests privés),
  n'expose/écrit que les fichiers non-test éditables ; `reset` global et
  `reset-file`. API `/api/lab/[exerciseId]` : GET (arbre + activeFile), POST
  save | run | reset | reset-file.
- **Client** (`LabWorkspace.tsx` + `usePanelLayout.ts`, `CodeMirrorEditor.tsx`) :
  trois zones, séparateurs souris+clavier, disposition + onglets + dernier
  résultat persistés (localStorage), autosave debouncé + flush (sendBeacon),
  raccourcis, palette de fichiers. Éditeur CodeMirror chargé dynamiquement.

## Modèle multi-fichiers

Un exercice peut définir plusieurs fichiers (`editable`, `readOnly`, `hidden`,
`entry`, `language`), un `activeFile`, et des `testFiles` privés non exposés.
Interdits (testés) : chemin absolu, `..`, backslash, doublon, nom vide, fichier
trop volumineux (>200 Ko), contenu binaire (NUL), modification d'un test privé.

## Dépendances CodeMirror réellement utilisées

Toutes déclarées en dépendances **directes** (CP0 a corrigé
`@codemirror/commands`, jusque-là seulement transitif) :
`@codemirror/state`, `@codemirror/view`, `@codemirror/commands`,
`@codemirror/lang-javascript`, et `codemirror` (basicSetup). Une seule famille
6.x résolue, pas de doublon de `@codemirror/state` ; `npm ci` reconstruit
proprement.

## Performance (production chaude, médiane de 5)

| Route | TTFB | Total | JS initial | Chunks Lab |
|-------|------|-------|-----------|-----------|
| / | 19 ms | 22 ms | 109 kB | 0 (aucun éditeur) |
| /parcours | 10 ms | 16 ms | 108 kB | 0 |
| /calendar | 17 ms | 25 ms | 106 kB | 0 |
| /day/1 | 17 ms | 16 ms | 116 kB | 0 |
| /skills | 9 ms | 13 ms | 107 kB | 0 |
| /settings | 7 ms | 9 ms | 109 kB | 0 |
| /lab | 9 ms | 12 ms | 107 kB | 0 |
| /lab/[exerciseId] | 9 ms | 11 ms | 114 kB | CodeMirror en chunk paresseux (971), hors First Load |
| /api/search-index | 4 ms | 5 ms | — | — |

Garanties vérifiées : CodeMirror n'est jamais dans le chunk initial des routes
ordinaires (`/` inchangé à 109 kB, un seul chunk contient `@codemirror`) ;
programme/catalogue/index de recherche mémoïsés ; progression lue une fois par
requête (`React.cache`) ; édition 100 % client (aucune reconstruction
catalogue/index à la frappe) ; éditeur `dynamic` ; pas de cascade de fetchs.
Aucune régression : mode dev cold = compilation à la demande, prod chaud = 5–25
ms. **Aucun changement de code n'a été nécessaire en CP9.**

## Sécurité (préservée depuis V7)

`execFile` sans shell ; runtime Node explicitement autorisé (allowlist) ;
arguments figés (`[harnais]`) ; timeout + SIGKILL ; sortie plafonnée ; tailles
bornées ; env minimal (aucun secret) ; aucun accès hors workspace ; aucun path
traversal ; aucune installation npm utilisateur ; aucun accès réseau ; isolation
entre exercices ; nettoyage des workspaces ; **tests privés jamais exposés**
(attendu/reçu masqués) ; marqueur interne du harnais jamais affiché ; solution de
référence jamais envoyée au client. Limite honnête : pas d'isolation OS (voir
ADR-007) — modèle de menace « accidents + ressources bornées » pour du code
local, pas du code adverse.

## Responsive

- Vue Jour / Parcours ultrawide : composition **centrée** (marges équilibrées),
  colonne de lecture bornée (texte non élargi), modules Parcours en grille 2 col
  ≥1440.
- Workbench : trois zones ajustables ≥1200 ; <1200 nav segmentée
  (Énoncé/Fichiers/Code/Tests/Console) une zone à la fois ; mobile 375 sans
  scroll horizontal, code scrollable localement.

## Catalogue des exercices (8)

greeting, fizzbuzz, array-sum-even, word-frequencies, validate-user (multi),
async-user-lookup (async, multi), async-sum (async), debug-cart (débogage, multi,
tests publics+privés, multi-compétences). Couverture : 3 multi-fichiers, 2 async,
1 débogage, 1 public+privé, 1 multi-compétences. Chaque fixture : objectif,
consigne, critères, fichiers, solution de référence **hors** workspace, tests,
compétences, difficulté ; jours liés via `data/day-exercises.json` (aucune
modification du Markdown). **Tous les 8 passent avec leur solution de référence.**

## Checkpoints & commits

| CP  | Sujet | Commit |
|-----|-------|--------|
| CP0 | Réparation dépendance CodeMirror | `cfb36b5` |
| CP1 | ADR-008 Workbench V2 | `1dc8119` |
| CP2 | Responsive ultrawide (Jour, Parcours) | `9f7e9cd` |
| CP3 | Modèle d'exercice multi-fichiers (pur) | `b8ca716` |
| CP4 | Workbench trois zones | `8aae352` |
| CP5 | Explorateur, onglets, persistance, raccourcis | `2ac1a2e` |
| CP6 | Tests/console, tests privés, annulation, historique | `d1add32` |
| CP7 | Responsive & accessibilité du Lab | `2e537d9` |
| CP8 | Catalogue de 8 exercices | `14d2a5e` |
| CP9 | Perf : mesures OK, aucun changement nécessaire | (pas de commit) |
| CP10| Hardening + matrice + ce rapport | (ce commit) |

## Tests

`275 tests` (node:test) verts ; `tsc --noEmit` propre ; `next build` sans
avertissement ; `curriculum:check` OK ; génération content-idempotente (seul
l'horodatage `generatedAt` varie, non commité).

## Matrice navigateur finale

10 routes (`/`, `/parcours`, `/calendar`, `/day/1`, `/day/8`, `/lab`,
`/lab/fizzbuzz`, `/lab/validate-user`, `/skills`, `/settings`) × 5 largeurs
(375/768/1024/1440/1920) = **50 vérifications, 0 échec** : toutes 200, aucun
débordement horizontal, aucune erreur console. États Lab validés au fil des CP :
initial, modifié, onglets multiples, enregistré, test réussi/échoué, erreur
runtime, annulation, reset (fichier + exercice), reload/restauration, clavier,
mobile.

## Limites honnêtes / dette

- Pas d'isolation OS de l'exécution (worker/conteneur) — voir ADR-007.
- Un seul runtime (`node-js`) ; pas de preview React, ni SQL/Python.
- Modèle de tests par données (call-equals / stdout) : pas de framework de test
  utilisateur arbitraire.
- Léger flash possible sur le Workbench en vue étroite (le layout desktop est
  rendu côté serveur avant que le client ne détecte le viewport).

## Recommandation V9

1. Deuxième runtime « tests utilisateur » (l'apprenant écrit aussi des tests) ou
   assertions nommées avec diffs riches.
2. Isolation renforcée (worker thread / conteneur) si l'exécution s'ouvre à du
   code importé.
3. Étendre le catalogue et lier davantage de jours (fixtures), avec exercices
   multi-jours.
4. Export/import multi-parcours complet (dette héritée de V7).
