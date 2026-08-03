# ADR-020 — Terminal pédagogique borné, Docker optionnel & audit de qualité pédagogique

Statut : accepté (Sprint V20). Décision fondée sur l'audit CP0 réel. Étend
l'existant ; aucun second moteur d'exécution, aucun second Workbench, aucun
nouveau runtime/IDE/UI, aucun shell arbitraire, **aucune isolation OS prétendue**.

## Problème produit

Deux besoins distincts mais liés.

1. **Qualité pédagogique mesurée.** V17-V19 ont beaucoup ajouté (missions, 12
   exercices systèmes/réseau, un 4ᵉ parcours, +56 termes). Rien ne mesure
   *honnêtement* si ces ajouts **enseignent** réellement. Une leçon longue n'est
   pas profonde ; un exercice qui s'exécute n'est pas forcément utile ; une
   mission qui demande un document n'est pas forcément bien évaluée. Il faut un
   **cadre d'audit reproductible** qui ne confonde jamais présence d'un mot-clé
   avec preuve d'enseignement.

2. **Pratiquer le terminal et Docker.** Les fondations V19 (permissions,
   processus, réseau, SSH, diagnostic) sont enseignées par *modèles
   déterministes*. Pour ancrer, l'apprenant doit **exécuter** de vraies commandes
   bornées et découvrir Docker — sans transformer l'app en shell généraliste ni
   prétendre offrir une isolation qu'elle ne fournit pas.

## Décisions

### D1 — Modèle d'audit pédagogique pur (`lib/pedagogy-audit.mjs`)

Rubrique de **16 dimensions**, échelle **0-4**, avec seuils d'exploitabilité
(aucune dimension < 2 ; moyenne ≥ 3 ; ≥ 3,25 pour les ajouts V17-V19 ;
exactitude technique/sécurité, objectif, progression et pratique ≥ 3). Le modèle
sépare strictement **trois** choses :

- la **rubrique** (référence d'une note **humaine**) ;
- les **signaux structurels** (présence/absence de composants pédagogiques) —
  informatifs, **jamais** une note de qualité ;
- les **signaux de danger** (commande destructive/privilégiée non encadrée,
  promesse de sécurité trompeuse, code tronqué) — **bloquants** quelle que soit
  la moyenne.

Aucune note n'est dérivée d'un simple comptage de mots. Un gate
`v20:pedagogy-check` scanne en continu le curriculum pour les signaux bloquants
et valide le **registre de notes humaines** contre les seuils.

### D2 — Terminal PÉDAGOGIQUE BORNÉ, pas un shell libre

L'apprenant n'exécute jamais une chaîne brute passée à un shell. Il lance :

- des **TerminalTask** prédéfinies (binaire d'une **allowlist** + arguments
  validés élément par élément contre un schéma), ou
- une commande composée à partir d'un binaire autorisé et de paramètres validés.

Exécution via **`execFile`/`spawn` avec `shell:false`** — exactement le motif déjà
en place dans `lib/workspace-fs.mjs` (Node/Python lancés sans shell, argv en
tableau, `cwd` dans un workspace temporaire borné, `timeout` + `SIGKILL`,
`maxBuffer` plafonnant la sortie, environnement minimal sans secret). Le terminal
**réutilise cette fondation** au lieu d'ouvrir une nouvelle surface d'exécution.

### D3 — Adaptateur local borné (CP5) via une interface d'exécution générique

Un premier adaptateur exécute sur l'hôte un **petit ensemble** de binaires
autorisés (`pwd`, `ls` borné, `cat` sur le workspace, `node`/`python` sur script
contrôlé, `git` sur un dépôt d'exercice temporaire, commandes internes du projet).
`rm`/`sudo`/`chmod -R`/`curl`/`bash`/`docker` brut, etc. ne sont **pas**
autorisés ; les notions dangereuses s'enseignent par simulation, analyse de
commande, sorties pré-enregistrées et workspaces jetables.

### D4 — Adaptateur Docker OPTIONNEL et honnête (CP6)

Docker est une **capacité optionnelle jamais installée automatiquement**.
Détection séparée : CLI présent / daemon disponible / capable de lancer un
conteneur autorisé. Trois états au moins : `available`, `cli-only`
(daemon indisponible — **état constaté au CP0 de cet environnement**), `absent`.
**Le produit reste pleinement fonctionnel sans Docker** ; les exercices Docker
concernés basculent alors en mode déterministe (analyse statique de
Dockerfile/config, sans lancer de conteneur). Conteneurs pédagogiques durcis par
défaut : `--network none`, `--read-only`, `--tmpfs`, `--pids-limit`, `--memory`,
`--cpus`, `--security-opt no-new-privileges`, `--cap-drop ALL`, utilisateur
non-root, montage borné au seul workspace, suppression après exécution.

### D5 — Extension du Workbench, pas un second IDE

Un onglet/panneau **« Terminal »** distinct de Tests, Console, Diagnostics,
Preview, Aide, dans le Workbench existant (`app/lab/[exerciseId]`). Chargé
**paresseusement**, sans alourdir les routes non-Lab.

## Alternatives rejetées

- **Shell libre piloté par l'apprenant** (`shell:true`, `bash -c` sur entrée
  utilisateur) : rejeté — surface d'exécution arbitraire, injection, hors
  périmètre pédagogique → binaire allowlisté + argv validé.
- **Rendre Docker obligatoire** : rejeté — le daemon est indisponible dans
  l'environnement cible ; un contenu qui exige Docker serait inaccessible →
  adaptateur optionnel + fallback déterministe.
- **Second moteur d'exécution / terminal parallèle** : rejeté → interface
  d'adaptateur générique réutilisant `workspace-fs`.
- **Note de qualité automatique** (score dérivé de longueur/mots-clés) : rejeté —
  trompeur → notes humaines encadrées par une rubrique + signaux de danger objectifs.
- **Émulateur de terminal complet** (xterm laissant croire à un vrai shell) :
  rejeté — mensonge d'interface → affichage explicite de la commande bornée et de
  l'adaptateur utilisé.

## Terminal borné vs shell libre (distinctions affichées honnêtement)

- Une **console applicative** montre la sortie d'un programme lancé par le Lab.
- Un **terminal pédagogique** exécute des tâches bornées, prévisibles, tracées.
- Un **shell libre** exécute n'importe quelle chaîne — **non fourni**.
- Un **workspace** est un dossier temporaire borné — **pas** une isolation OS.
- Un **conteneur** réduit la surface mais **partage le noyau hôte** — ce n'est
  **pas** une isolation absolue.

## Séparation simulation / réalité

Tout ce qui n'est pas réellement exécuté est une **simulation déterministe
explicitement étiquetée**. L'application ne prétend jamais fournir une isolation
OS ni une sécurité absolue ; le gate d'audit bloque toute formulation trompeuse.

## Sécurité

`execFile`/`spawn` `shell:false` ; binaire ∈ allowlist ; argv validé élément par
élément ; jamais de concaténation vers un shell ; `cwd` sous workspace borné,
`realpath` vérifié, symlinks contrôlés ; environnement minimal sans secret ;
sortie plafonnée ; timeout puis SIGTERM→SIGKILL borné ; nettoyage idempotent ;
aucun accès au socket Docker depuis un conteneur ; aucun conteneur privilégié ;
aucun montage arbitraire ; aucun téléchargement d'image implicite.

## Performances

Terminal, code d'adaptateur et détection Docker restent **serveur ou lazy** ;
aucun poids ajouté aux bundles des routes non-Lab. Référence CP0 : shared 103 kB,
`/lab/[id]` 118 kB (CodeMirror isolé), autres 103-116 kB — à ne pas régresser.

## Audit pédagogique

Le contenu récent (V17-V19) n'est déclaré exploitable que s'il atteint les seuils
CP1. Les missions documentaires restent évaluées **structurellement** +
**revue humaine** ; aucun pseudo-score. L'audit statique ne remplace pas
l'observation d'un apprenant réel — limite affichée.

## Dette technique

- `v18:check` code en dur 3 parcours et ignore le 4ᵉ (V19) ; `v17:check` compare
  à une baseline antérieure aux modifications légitimes de V19. **Périmés, non
  régressifs** — assainissement générique reporté à CP9/CP10.

## Conséquences

- Positives : qualité pédagogique mesurée et défendable ; pratique réelle bornée
  du terminal ; fondations Docker honnêtes ; réutilisation intégrale de
  l'infrastructure d'exécution existante.
- Coûts : une gate de plus (`v20:pedagogy-check`) ; discipline de périmètre ; un
  adaptateur Docker dont une partie n'est testable qu'en présence d'un daemon.
- Non-objectifs : shell généraliste, isolation OS, Kubernetes, cloud, certification
  automatique de la qualité des 365 jours.
