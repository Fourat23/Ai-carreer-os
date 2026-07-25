# ADR-008 — Workbench IDE V2 (laboratoire multi-fichiers)

Statut : accepté (Sprint V8). Décision d'implémentation, concise.

## Contexte

V7 a livré un Lab MVP mono-fichier : `Exercise.workspace = { entry, files:[{path,
content, readOnly?}] }`, un éditeur CodeMirror unique, un panneau de résultats,
exécution sandboxée (`workspace-fs.mjs`, `execFile` sans shell), liaison
jour↔exercice par fixture, preuves de compétence sur réussite. Deux limites :
UI mono-fichier, et responsive ultrawide imparfait sur Vue Jour et Parcours.

V8 transforme `/lab/[exerciseId]` en **Workbench pédagogique** multi-fichiers,
**sans réimplémenter** les moteurs V7 (catalogue, progression v3, workspace
sécurisé, runtime Node, liaison jour↔exercice). Local, mono-utilisateur,
**JavaScript/Node uniquement**. Pas de Python/SQL/React-preview/terminal/npm
utilisateur/réseau/conteneur dans ce sprint.

## Décisions

### Modèle multi-fichiers (rétrocompatible)
`WorkspaceFile` gagne des champs **optionnels** : `language` (défaut déduit de
l'extension), `editable` (défaut `!readOnly`), `hidden`, `entry`. `Exercise`
gagne `activeFile?` et `testFiles?` (fichiers de tests privés, **non modifiables,
jamais exposés** au client). Les exercices V7 (`workspace.entry` + `files`
sans ces champs) restent valides : une fonction pure `migrateLegacySingleFile
Exercise` normalise l'ancien schéma vers le nouveau. `readOnly` reste honoré et
équivaut à `editable:false`.

### Fichier actif
`activeFile` = premier `editable` non `hidden` si non précisé, sinon `entry`.
Côté client, le fichier actif et les onglets ouverts sont **persistés** et
restaurés après reload/navigation. Résolution pure : `resolveActiveFile`.

### Fichiers autorisés (allowlist)
La **seule** source de vérité des fichiers reste le template de l'exercice.
Lecture : uniquement les fichiers `!hidden` et non-test. Écriture : uniquement
`editable && !readOnly && !test`. Toute la validation de chemin reste dans
`workspace.mjs` (`isSafeRelPath` + `resolveWithinRoot`) : pas d'absolu, pas de
`..`, pas de doublon, pas de nom vide, taille bornée, rejet binaire.

### Identifiants stables
Le `path` est l'identifiant stable d'un fichier (onglets, persistance, diff
modifié/enregistré). Les exercices ont un `id` stable ; les tests un `id` stable.

### Persistance
Deux niveaux, **une seule source de progression** (V7, `data/progress.json`) :
1. **Contenu des fichiers** : sur disque, dans le workspace sécurisé par exercice
   (`data/lab-workspaces/<id>/`, gitignoré) via l'API Lab existante (save/run).
2. **État d'UI léger** (onglets ouverts, fichier actif, dimensions de panneaux) :
   `localStorage`, clé par exercice. Jamais de progression pédagogique ici.
Autosave **debouncé** + **flush** avant navigation/exécution/changement
d'exercice. Aucune nouvelle structure de progression.

### Responsabilités client / serveur
- **Serveur** : matérialisation, lecture/écriture allowlistée, reset, exécution
  cloisonnée, notation, enregistrement des preuves. Ne renvoie jamais les
  fichiers de tests privés ni les valeurs attendues brutes des tests privés.
- **Client** : explorateur, onglets, éditeur, panneaux ajustables, raccourcis,
  autosave/flush, restauration d'état d'UI. Aucune logique de sécurité côté
  client (le serveur revalide tout).

### Séparation éditeur / tests / console
Trois zones desktop : **gauche** (énoncé + explorateur), **centre** (onglets +
éditeur), **droite** (Tests / Console / Aide). La console affiche uniquement le
**stdout utilisateur propre** (le marqueur interne du harnais n'est jamais
exposé). Résultats de tests, stdout, erreurs runtime et durée/timeout sont
présentés séparément.

### Limites de sécurité (inchangées vs V7)
`execFile` sans shell ; binaire = ce Node ; arguments figés (`[harnais]`) ;
timeout + SIGKILL ; sortie plafonnée ; tailles bornées ; env minimal (aucun
secret) ; isolation par exercice ; nettoyage ; **aucun** shell, réseau, npm
utilisateur, ni conteneur. Limite honnête : pas d'isolation OS (voir ADR-007).

### Stratégie responsive
- **≥1200px** : trois zones, séparateurs ajustables (souris + clavier).
- **768–1199px** : éditeur principal + panneaux en drawers/onglets.
- **375px** : une zone à la fois (Énoncé / Fichiers / Code / Tests / Console),
  actions principales sticky, code scrollable localement, zéro scroll horizontal
  global.
Vue Jour et Parcours : composition **centrée** en ultrawide via `clamp/minmax`
et tokens V5/V7 existants — pas de gradient, pas de glassmorphism, pas
d'élargissement du texte, pas de carte décorative de remplissage.

### Compatibilité V7
Les deux exercices V7 (`fizzbuzz`, `greeting`) et la fixture jour↔exercice
continuent de fonctionner sans édition manuelle. Le modèle multi-fichiers est
une **extension** ; aucune migration de données utilisateur n'est requise.

## Conséquences

Fonctions pures nouvelles et testées : `normalizeExerciseFiles`,
`validateExercisePath`, `resolveEntryFile`, `resolveActiveFile`,
`updateWorkspaceFile`, `resetWorkspaceFiles`, `migrateLegacySingleFileExercise`.
Le serveur applique l'allowlist étendue (tests privés). L'UI gagne explorateur,
onglets multiples, panneaux ajustables persistés, raccourcis, drawers mobile.
