# Sprint V7 — Multi-parcours + fondations du laboratoire de code intégré

Rapport final. AI Career OS reste **strictement local**, personnel, en français,
sur 365 jours. Aucun contenu pédagogique n'a été modifié : `curriculum/` et
`data/program.json` sont **byte-identiques** à la baseline V6 (`b7bc8e7`).

## Avant / après

- **Avant (V6, `b7bc8e7`)** : un seul programme implicite, pas de notion de
  parcours, aucune exécution de code, 199 tests.
- **Après (V7, `5aa7f8d`)** : catalogue de parcours multi-tracks (1 disponible,
  5 annoncés), progression multi-parcours (schéma v3) rétro-compatible,
  recherche & sauvegarde multi-parcours, modèle d'exercice exécutable générique,
  gestionnaire d'espace de travail **sécurisé/sandboxé**, laboratoire de code
  (éditeur CodeMirror réel), liaison jour↔exercice pilotée par fixture, et
  preuves de compétence issues des exécutions réussies. **263 tests**.

## Architecture (ajouts V7)

- **Catalogue** (`lib/catalogue.mjs`) : `Track` référence des `Module` (jamais de
  copie) ; modules dérivés des mois du programme ; validé au chargement.
- **Progression v3** (`lib/progress-store.mjs`) : `{ schemaVersion:3,
  activeTrackId, tracks:{...} }`. `readProgress()` renvoie la vue **plate V6 du
  parcours actif** → les ~16 consommateurs existants restent inchangés (une seule
  API, une seule source de vérité `data/progress.json`).
- **Modèle d'exercice** (`lib/exercise.mjs`, pur) : `Exercise / WorkspaceTemplate
  / TestDefinition / RuntimeDefinition / ValidationResult / AttemptResult`,
  runtimes et types de tests **allowlistés**.
- **Runner** (`lib/workspace.mjs` pur + `lib/workspace-fs.mjs` paramétré par
  racine + `lib/workspace-server.ts` liant) : matérialisation, arborescence,
  écriture des seuls fichiers autorisés, reset, nettoyage, exécution cloisonnée.
- **Laboratoire** (`app/lab`, `app/api/lab/[exerciseId]`) : éditeur CodeMirror
  **chargé dynamiquement** (aucun chunk éditeur sur les routes ordinaires).
- **Liaison jour↔exercice** (`lib/day-exercises.mjs` + fixture
  `data/day-exercises.json`) : **aucune modification du Markdown des 365 jours**.
- **Preuves** (`lib/lab-progress.mjs`) : une réussite ajoute une preuve
  `exercise` aux jours liés et relève les compétences (réutilise le modèle
  existant, pas de store parallèle).

## Checkpoints & commits

| CP  | Sujet | Commit |
|-----|-------|--------|
| CP1 | Audit + ADR-007 | `19c4581` |
| CP2 | Catalogue parcours/modules | `56cad14` |
| CP3 | Progression multi-parcours (v3) | `2855a6c` |
| CP4 | Route /parcours + sélecteur + nav | `525504b` |
| CP5 | Recherche & sauvegarde multi-parcours | `d392a5f` |
| CP6 | Modèle d'exercice exécutable | `23ca18d` |
| CP7 | Espace de travail local sécurisé | `09b9a63` |
| CP7B| Perf serveur + responsive grand écran | `d5bab8c` |
| CP8 | Laboratoire MVP (éditeur + runs) | `4a23da5` |
| CP9 | Liaison jour↔exercice + preuves | `5aa7f8d` |
| CP10| Hardening + matrice + ce rapport | (ce commit) |

## Migrations

- **v2/V6 → v3** : idempotente, sans perte. L'ancien fichier plat reste sur le
  disque jusqu'à la première écriture ; à la lecture il est migré **en mémoire**.
  Tests : V4/V5/V6 → v3 (plat, idempotent, isolation entre parcours).

## Modèle de sécurité d'exécution (CP7)

- Racine dédiée `data/lab-workspaces/` (jamais versionnée).
- Aucun accès hors racine : `resolveWithinRoot` + `isSafeRelPath` (rejet
  traversal/absolu/backslash/segments dangereux).
- Aucune commande shell : `execFile` sans shell, binaire = ce Node
  (`process.execPath`), arguments **figés** (`[harnais]`).
- Timeout mur + `SIGKILL` ; sortie plafonnée (`maxBuffer`) ; tailles bornées
  (par fichier et par espace) ; **environnement minimal** (les secrets de l'appli
  ne sont pas transmis au code utilisateur).
- Isolation entre exercices (répertoires distincts) ; nettoyage/reset.
- **Limite honnête** : Node n'offre pas d'isolation OS ; un script déterminé
  garde l'accès aux API fs/réseau. Modèle de menace = « éviter les accidents et
  borner les ressources » pour du code **local personnel**, pas exécuter du code
  adverse. Une vraie isolation exigerait un conteneur (voir ADR-007).

## Performances (mesuré)

En **production chaude**, toutes les routes répondent en **8–27 ms** (bien sous
la cible de 500 ms). Les « 14–16 s » observés étaient la **compilation à la
demande du mode développement** de Next.js, pas le runtime. Optimisations
justifiées appliquées : lecture de la progression **mémoïsée par requête**
(`React.cache`), index de recherche statique construit **une fois**.

## Résultats de tests

`263 tests` (node:test) verts ; `tsc --noEmit` propre ; `next build` sans
avertissement ; `curriculum:check` OK.

## Matrice navigateur

9 routes (`/`, `/parcours`, `/day/1`, `/skills`, `/revisions`, `/settings`,
`/lab`, `/lab/fizzbuzz`, `/lab/greeting`) × 5 largeurs (375/768/1024/1440/1920) =
**45 vérifications, 0 échec** : toutes 200, aucun débordement horizontal, aucune
erreur console.

## Limites honnêtes / dette

- Pas d'isolation OS pour l'exécution (voir ci-dessus).
- Un seul runtime (`node-js`) et deux exercices de démonstration.
- La sauvegarde exporte le **parcours actif** (les autres parcours restent sur
  le disque en v3) — l'export multi-parcours complet reste à faire.
- Parcours annoncés non activables (par conception).

## Prochain sprint recommandé (V8)

1. Export/import **multi-parcours complet** (v3 dans l'enveloppe de sauvegarde).
2. Enrichir le catalogue d'exercices et lier davantage de jours (fixtures).
3. Deuxième runtime (ex. tests unitaires utilisateur) et retours d'exécution
   plus riches (diffs, assertions nommées).
4. Étudier une isolation renforcée (worker/conteneur) si l'exécution s'ouvre à
   du code importé.
