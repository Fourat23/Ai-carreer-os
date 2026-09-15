# V76 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption :
> relire ce fichier, vérifier Git, reprendre au CP indiqué. **NE PAS refaire un
> CP terminé. NE PAS reconstruire l'état depuis la conversation — Git, ce
> fichier et les artefacts persistés font foi.**
>
> **V75 est terminé** — verdict `ADAPTIVE_RECOVERY_CANDIDATE`, rapport
> `docs/v75/V75-FINAL-REPORT.md`. **NE PAS refaire V75. NE PAS reconstruire le
> Retention Engine ni l'Adaptive Recovery Engine. NE PAS retoucher le
> curriculum.**

## Position

- **dernier CP terminé** : **CP12**
- **CP courant** : —
- **NEXT_CP** : **CP13** — UX / RESPONSIVE / A11Y / PERF
- **NEXT_ACTION** : rejouer `scripts/v76/ui-audit.mjs` (le MÊME script qu'au
  CP2) aux 7 largeurs `1440 / 1280 / 1024 / 768 / 430 / 390 / 375`, en écrivant
  `docs/v76/ui-audit-cp13.json` pour comparaison directe avec
  `docs/v76/ui-audit-cp2.json`. Vérifier clavier, focus, régions vivantes, zoom.
  Comparer les performances AVANT/APRÈS. **Les cibles tactiles < 24 px se
  consignent ici.** Les surfaces neuves du sprint (conflit CP9, historique et
  comparaison CP10) n'ont JAMAIS été vues dans un navigateur.

## Repères Git

| | |
|---|---|
| dépôt | `Fourat23/Ai-carreer-os` (**deux `r`**) |
| branche canonique | `claude/ai-career-os-saas-phfg49` (vérifiée, pas supposée) |
| HEAD au début de V76 | `e36ee65` (fin V75) |
| local == origin | oui |
| working tree | propre · stash vide · aucun serveur résiduel |

## Invariants (à revérifier à chaque CP)

`376` exercices · `128` leçons · `365` journées · `52` semaines · `12` mois ·
corpus gelé `92d5fae6` · **`data/progress.json` n'existe pas** ·
`data/lab-workspaces/` et `data/lab-journals/` ignorés par git · **1977 tests** ·
tsc 0 · build OK ·
`gates:active` **48 portes, 0 violation**.

## Mesures BEFORE (CP0 — à ne jamais reconstruire ni écraser)

Artefacts : `docs/v76/cp0-inventory.json` · `docs/v76/cp0-e2e.json` ·
`docs/v76/cp0-security.json`. Sondes rejouables dans `scripts/v76/`.

### Le fait principal

**Le Workbench existe déjà et fonctionne.** Douze exercices, un par famille de
runtime, joués en entier par HTTP sur le produit en marche : **12/12** ouvrent,
échouent réellement, persistent l'échec, réussissent avec leur correction,
persistent la réussite et produisent une preuve. La chaîne
`DAY → EXERCISE → RUN → FAIL → REMEDIATION → RETRY → PASS → EVIDENCE` est
**déjà branchée de bout en bout**.

Surface existante : `LabWorkspace.tsx` (656 l.) + CodeMirror 6 + aperçu web +
aperçu React + terminal + disposition persistée = **1 330 lignes d'interface**,
5 panneaux, autosave, palette de fichiers, raccourcis, historique, mode étroit.

### Inventaire

| famille | n |
|---|---|
| `node-js` | 233 |
| `python3` | 80 |
| `python-ds` · `TOOLING_ENVIRONMENT_REQUIRED` | 18 |
| `typescript` | 16 |
| `react-tsx` | 15 |
| `web` | 11 |
| `python3` · `PROXY` | 3 |

**376 exercices · 1 357 tests · 16 genres de test · 344 à tests privés · 376
avec correction de référence · 3 réellement multi-fichier.**

### Ce qu'il ne faut PAS construire

- **`SQL_WORKBENCH` : 0 exercice** (9 le mentionnent, aucun ne l'exécute) ;
- **`HTTP_WORKBENCH` : 0 exercice** ;
- `CONFIG` / `TEXT` : 0 ;
- **multi-fichier : 3/376, et déjà supporté**.

### Les onze surfaces de pratique

**Deux écrivent un fait** (`lab` → `ExerciseAttempt`, `transfer` →
`TransferAttempt`). **Neuf n'en écrivent aucun** : `terminal`, `assessments`,
`capstones`, `missions`, `cloud-lab`, `cloud-foundations`, `kubernetes`,
`pipelines`, `security`. Chiffré pour la première fois.

### Performance BEFORE

ouverture `GET` 3–140 ms · `node-js` 47–157 ms · `python3` 47–77 ms ·
`python-ds` **1 651 ms** (import numpy/pandas) · `react-tsx` **971–1 669 ms**
(compilation TSX) · `/lab` **420 Ko** / 90 ms · `/lab/[id]` 69 Ko / 27 ms ·
`/day/1` 136 Ko / 200 ms · `.next/static/chunks` **2,5 Mo**.

### Accessibilité BEFORE

`LabWorkspace` : 17 `aria-label`, 1 `aria-live`, 8 `aria-selected`, 14 `role=`.
**`ChallengeRunner` : 1 `aria-label`, 0 `aria-live`.**

## Risques sécurité (CP0 — modèle dans `docs/v76/V76-THREAT-MODEL.md`)

**Seize sondes contre le produit en marche. Onze tiennent, cinq ne tiennent pas.**

### Ce qui tient

timeout 5 s (mesuré 5 105 ms) · sortie bornée (1 Ko pour ~10⁹ octets émis) ·
traversée `../../` refusée 400 · chemin absolu refusé 400 · nom de fichier
malveillant refusé 400 · charge 10 Mo refusée 400 · 200 fichiers refusés 400 ·
fichier protégé refusé · **brouillon ≠ tentative (36 → 36)** · action inconnue
refusée 400 · **environnement filtré à 2 variables**.

### ✅ CORRIGÉ AU CP5 — les cinq sont désormais contenues

`T12` `/etc/passwd` · `T13` corrections d'autres exercices · `T14` écriture hôte ·
`T15` processus · `T16` SSRF : **16/16 sondes contenues**, et les mêmes attaques
réécrites en Python sur un exercice réel : 4/4 bloquées. Détail dans
`docs/v76/V76-CP5-EXECUTION-ISOLATION.md`.

**Limite déclarée** : `SEC3` reste **partiel** en Python — un processus enfant
peut naître, mais dans la même racine minimale, sans réseau ni privilège hôte.
Écrit dans le code (`CONTENU_PAR_MODE`) et gardé par un test.

### L'état AVANT (conservé — à ne jamais réécrire)

| # | menace | observation |
|---|---|---|
| `T12` | lecture du disque hôte | `readFileSync('/etc/passwd')` → `root:x:0:0:…` |
| `T13` | **lecture des corrections d'autres exercices** | `reference` de `py-debug-grades` lue depuis un autre exercice |
| `T14` | écriture hors bac à sable | fichier **créé dans le dépôt** |
| `T15` | création de processus | `execSync('id')` → **`uid=0(root)`** |
| `T16` | **SSRF vers l'API du produit** | `fetch('…/api/progress')` → **200** |

**Cause unique** : `execFile` avec `cwd` + `shell:false` + `env` filtré +
`timeout` + `maxBuffer`. Chaque réglage est correct ; **aucun n'isole**. `cwd`
est un dossier de départ, pas une racine. Le processus hérite de l'identité du
serveur et de sa pile réseau.

**Le bon modèle existe déjà dans le dépôt** : `lib/terminal-docker.mjs`
(conteneur durci, réseau `none`, non-root, lecture seule, « indisponible »
déclaré honnêtement). Il n'a jamais été appliqué au runner d'exercices.

**Limite à déclarer d'avance** : un chargeur restrictif Node ne protégera pas
Python (`import os` ne traverse aucun crochet JS). **101 exercices Python
resteront non isolés sans conteneur** — à écrire, pas à laisser croire.

### ✅ CORRIGÉ AU CP8 — la fuite est fermée

**25/25 fuyaient, 0/25 fuient**, et les 25 fonctionnent toujours (8 vérifications
chacun). Contre-épreuve : l'ancien code remis en place, la sonde retrouve
**25/25** — elle discrimine. Le type `TransferChallengePublic` empêche désormais
le compilateur de passer le défi complet au client. **Coût assumé** : la
correction hors ligne a disparu, car elle ne pouvait fonctionner qu'au prix de
la fuite. `aria-live` ajouté (le CP2 avait mesuré 0).

### L'état AVANT (conservé — à ne jamais réécrire)

`GET /transfer/[id]` sert `"answer":0` et le texte d'`explanation` **dans la
charge utile de la page**, lisibles avant toute tentative. Le côté laboratoire,
lui, filtre correctement (`exerciseMeta` + `splitAttempt`). **Régression que V75
ne pouvait pas voir** : son CP9 a vérifié six choses, aucune sur la fuite.

## Décisions gelées (CP1 — `docs/v76/V76-WORKBENCH-CONTRACT-FROZEN.md`)

- **15 termes gelés** : `WORKBENCH` `WORKSPACE` `DRAFT` `RUN` `ATTEMPT`
  `SUBMISSION` `TEST_RESULT` `DIAGNOSTIC` `HINT` `REMEDIATION` `RESET`
  `SOLUTION_VIEW` `EVIDENCE` `PREVIEW` `TERMINAL_SESSION`.
- **`DRAFT ≠ ATTEMPT`** · **tout `RUN` produit un `ATTEMPT`, succès OU échec** ·
  **une `SUBMISSION` n'efface jamais un échec** · **aucun `RESET` n'efface un
  fait** · **la solution complète n'est jamais la première aide** · **une
  réussite après aide reste une réussite, mais sa provenance le montre**.
- **Trois natures de fichier** : `USER_FILE` / `READ_ONLY_FILE` /
  `HIDDEN_TEST_FILE`. L'apprenant ne peut ni lire ni écrire un test caché.
- **Trois sémantiques de `RESET`** : `RESET_FILE`, `RESET_WORKSPACE`, et
  `RESET_EXERCISE` **qui n'existera pas**.
- **Modèle de capacités GELÉ À PARTIR DE L'EXISTANT** (`lib/runtime.mjs`) :
  `execution` `preview` `publicTests` `privateTests` `multiFile` `stdin`
  `cancellation` `timeout` `syntaxHighlighting`. **Rien de réinventé.**
- **Capacités NON construites** (`G13`) : `database`/SQL (0 exercice),
  `http` (0), `config` (0), `text` (0), `stdin` (déclaré `false` partout).
- **Cinq interdits de sécurité absolus** : `SEC1` pas de lecture de l'hôte ·
  `SEC2` pas d'écriture hors workspace · `SEC3` pas de processus ·
  `SEC4` pas de réseau ni loopback · `SEC5` pas d'accès aux corrections.
- **Bornes gelées** : 5 000 ms (8 000 pour `python-ds`/`react-tsx`) ·
  100 000 o de sortie · 200 000 o par fichier · 1 000 000 o par workspace ·
  40 fichiers par requête · `SIGKILL`. **Plus strict autorisé, jamais plus
  permissif.**
- **`cwd` n'est PAS une frontière** (`G2`) — c'est l'erreur nommée au CP0.
- **Docker indisponible ⇒ runtime déclaré indisponible**, jamais de repli
  silencieux vers l'exécution hôte. Conséquence écrite d'avance : un chargeur
  restrictif Node **ne protège pas Python** ; si aucune frontière n'existe pour
  lui, les **101 exercices Python seront déclarés non isolés**.
- **14 contournements interdits** (`G1`–`G14`), dont « appeler `cwd` une
  sandbox », « HTTP 200 = E2E réussi », « construire SQL/HTTP malgré zéro
  exercice », « remplacer le Workbench sans défaut démontré ».
- **11 invariants de non-régression** (`I1`–`I11`) issus des mesures CP0.
- **22 critères de verdict d'ingénierie** (`W1`–`W22`), gelés AVANT
  implémentation, avec l'échelle à quatre valeurs.
- **LEÇON V75 APPLIQUÉE** : si `W1`–`W22` sont tous atteints, le verdict
  d'ingénierie **DOIT** être `PRACTICE_WORKBENCH_READY`. L'absence de validation
  humaine s'exprime **uniquement** sur le second axe.

## Anomalies de mes propres sondes (V76)

- **n° 4 — un `404` inventé (CP2).** La sonde fermait le contexte dès
  `networkidle`, annulant les préchargements RSC de Next.js. En laissant la page
  vivre 2,5 s : aucune réponse ≥ 400, aucune erreur.
- **n° 3 — quatre faux « sans nom accessible » (CP2).** Des
  `<input disabled aria-hidden="true" tabindex="-1">` décoratifs, **correctement**
  retirés de l'arbre d'accessibilité, étaient comptés comme fautifs.

- **n° 1 — fausse alerte de fuite.** La sonde E2E cherchait les 60 premiers
  caractères de la correction dans la réponse et criait « fuite » sur deux
  exercices dont le **début du fichier corrigé est identique au départ**.
  Corrigé : ne chercher que les lignes **qui distinguent** la correction.
- **n° 2 — la plus grave.** Les sondes de sécurité visaient `greeting`, dont les
  tests portent sur la **sortie standard** : la valeur retournée n'apparaît
  jamais dans la réponse, et **trois évasions réussies se sont déclarées
  « contenues »**. *Une sonde de sécurité qui ne sait pas lire son propre
  résultat rend un faux négatif, et un faux négatif de sécurité produit une
  ligne verte dans un rapport.* Corrigé : cible `call-equals` dont le `received`
  est publié.

## Fichiers

- **CP12** : **créés** `scripts/v76/cp12-e2e.mjs` (importe `choisirDouze` et
  `parcours` de `cp0-e2e.mjs` — **même instrument**, pas une réécriture),
  `docs/v76/V76-E2E-12-EXERCISES.md`, `docs/v76/cp12-e2e.json`.
  **Aucun fichier de produit modifié** — le CP12 mesure, il ne corrige pas.

- **CP11** : **créés** `scripts/v76/cp11-integration.mjs` (13 scénarios, fixture
  remise à zéro à chaque fois), `tests/v76-integration.test.mjs` (14),
  `docs/v76/V76-CP11-INTEGRATION-AUDIT.md`, `docs/v76/cp11-integration.json`.
  **Modifiés** `lib/learning-engine.mjs` (+ `canonicalSourceId` : le FAIT nommé
  séparément de la preuve de journée), `app/api/lab/[exerciseId]/route.ts`
  (la route le passe), `lib/evidence.mjs` (+ `fusionnerPreuvesDeLaboratoire`,
  appliquée à la LECTURE par `normalizeLedger`) + `lib/evidence.d.ts`,
  `tests/v75-exercise-mapping.test.mjs` (borne `{0,900}` remplacée par une
  recherche dans le bloc — **aucune propriété du produit n'a bougé**).
  **`ExerciseAttempt`, la règle de consolidation et le moteur de rétention
  n'ont PAS été touchés.**

- **CP10** : **créés** `lib/attempt-journal.mjs` (PUR) + `.d.ts`,
  `lib/attempt-diff.mjs` (PUR) + `.d.ts`, `lib/attempt-journal-fs.mjs` (I/O),
  `lib/attempt-journal-server.ts` (racine `data/lab-journals/`),
  `scripts/v76/cp10-history.mjs` (13 sondes), `tests/v76-attempt-history.test.mjs`
  (27), `docs/v76/V76-CP10-HISTORY-DIFF.md`, `docs/v76/cp10-history.json`.
  **Modifiés** `app/api/lab/[exerciseId]/route.ts` (historique servi au `GET` et
  après un `run` · journal consigné · action `compare`),
  `app/lab/[exerciseId]/page.tsx` (`initialHistory` au premier rendu),
  `app/lab/[exerciseId]/LabWorkspace.tsx` (historique hydraté depuis le serveur,
  sélection de deux tentatives, rendu de la comparaison),
  `lib/workspace-server.ts` (+ `fichiersEditables`), `app/globals.css`,
  `.gitignore` (`data/lab-journals/`). **`ExerciseAttempt` n'a PAS été touché.**

- **CP9** : **créés** `scripts/v76/cp9-persistence.mjs` (10 sondes HTTP),
  `tests/v76-persistence.test.mjs` (19), `lib/workspace-conflit.mjs` (PUR,
  sans import Node — chargé par un composant client) + `.d.ts`,
  `docs/v76/V76-CP9-PERSISTENCE.md`, `docs/v76/cp9-persistence.json`.
  **Modifiés** `lib/workspace-fs.mjs` (+ `revisionDe`, `rev` sur chaque entrée),
  `lib/exercise-files.mjs` (la révision traverse jusqu'au client),
  `lib/workspace.mjs` (+ `decisionDeSauvegarde`, PURE) + `lib/workspace.d.ts`,
  `lib/workspace-server.ts` (`conflitsDeRevision` délègue et joint le contenu
  actuel), `app/api/lab/[exerciseId]/route.ts` (refus **409** AVANT toute
  écriture), `app/lab/[exerciseId]/LabWorkspace.tsx` (révisions mémorisées,
  refus lu par `lectureDuRefus`, avertissement `role="alert"`),
  `app/globals.css` (`.wb-conflit`).

- **CP8** : **créés** `scripts/v76/cp8-transfer.mjs` (10 vérifications × 25),
  `tests/v76-transfer-leak.test.mjs` (8), `docs/v76/V76-CP8-TRANSFER-LEAK.md`,
  `docs/v76/cp8-transfer.json`. **Modifiés** `lib/transfer-challenge.mjs`
  (+ `vuePubliqueDuDefi`), `lib/transfer-challenge.d.ts` (+ le type public),
  `app/transfer/[id]/page.tsx`, `app/transfer/[id]/ChallengeRunner.tsx`
  (correction lue depuis le résultat de l'API, plus de grader client,
  `aria-live`).

- **CP7** : **créés** `lib/hint-view.mjs` (PUR) + `lib/hint-view.d.ts`,
  `tests/v76-hint-view.test.mjs` (16), `docs/v76/V76-CP7-AIDE-GRADUEE.md`.
  **Modifiés** `lib/learning-engine.mjs` (commande `RECORD_HINT_VIEW`),
  `lib/progress-store.mjs` (**les deux** listes blanches), `lib/remediation.mjs`
  (+ `dejaVues`), `lib/remediation.d.ts`, la route du laboratoire,
  `LabWorkspace.tsx`, `app/globals.css`, `tests/progress-store.test.mjs`.

- **CP6** : **créés** `lib/diagnostic.mjs` (PUR) + `lib/diagnostic.d.ts`,
  `tests/v76-diagnostic.test.mjs` (17), `docs/v76/V76-CP6-DIAGNOSTIC.md`.
  **Modifiés** `app/api/lab/[exerciseId]/route.ts` (diagnostic calculé sur les
  résultats PUBLICS, publié, et transmis à `remedier` s'il est exploitable),
  `app/lab/[exerciseId]/LabWorkspace.tsx` (rendu du symptôme), `app/globals.css`.

- **CP5** : **créés** `lib/sandbox.mjs` (décision, PUR), `lib/sandbox-detect.mjs`
  (sondes réelles), `scripts/sandbox/enter-root.sh` (entrée en racine minimale),
  `tests/v76-sandbox.test.mjs` (13), `docs/v76/V76-CP5-EXECUTION-ISOLATION.md`.
  **Modifié** `lib/workspace-fs.mjs` : les **trois** points d'exécution passent
  désormais par `execIsole`, plus aucun spawn direct.

- **CP4** : **créés** `scripts/v76/cp4-multifile.mjs`,
  `docs/v76/V76-CP4-MULTIFILE.md`, `docs/v76/cp4-multifile.json`.
  **Aucun fichier de produit modifié** — la séquence passe 3/3, rien à
  reconstruire.

- **CP3** : **modifié** `app/lab/[exerciseId]/CodeMirrorEditor.tsx` (+2 langages),
  `package.json` (`@codemirror/lang-html`, `@codemirror/lang-css`). **Créés**
  `tests/v76-editor-languages.test.mjs` (5), `docs/v76/V76-CP3-EDITOR.md`.

- **CP2** : **créés** `scripts/v76/ui-audit.mjs` (35 rendus Chromium réels),
  `docs/v76/V76-CP2-WORKBENCH-SHELL.md`, `docs/v76/ui-audit-cp2.json`.
  **Modifié** `package.json` (`playwright` en dépendance de développement).
  **Aucune ligne de la coquille du Workbench modifiée** — aucun défaut démontré.

- **CP1** : **créé** `docs/v76/V76-WORKBENCH-CONTRACT-FROZEN.md`. **Aucun
  fichier de produit modifié** — le CP1 gèle, il n'implémente pas.

- **CP0** : **créés** `scripts/v76/cp0-practice-forensics.mjs` (inventaire
  statique), `scripts/v76/cp0-e2e.mjs` (la boucle par HTTP),
  `scripts/v76/cp0-security.mjs` (16 sondes d'attaque),
  `docs/v76/V76-CP0-PRACTICE-FORENSICS.md`, `docs/v76/V76-THREAT-MODEL.md`,
  `docs/v76/V76-STATE.md`, `docs/v76/cp0-inventory.json`,
  `docs/v76/cp0-e2e.json`, `docs/v76/cp0-security.json`.
  **Aucun fichier de produit modifié** — le CP0 est en lecture seule.

## Tests exécutés

- **CP0** : **1858/1858** · tsc 0 · **build OK** · `gates:active` **0 violation**
  (48 portes) · 12 parcours E2E réels **12/12** · 16 sondes de sécurité
  (**11 contenues, 5 non contenues**) · `data/progress.json` absent · aucun
  serveur résiduel.

## Journal des CP

- **CP12** — **les six runtimes passent, isolation comprise, et les scores
  n'ont pas bougé d'un test.**
  - **12/12** sur la boucle complète, après neuf checkpoints qui ont modifié
    l'exécution elle-même. Les mêmes fichiers de départ échouent avec exactement
    les mêmes compteurs qu'au CP0, et les mêmes références passent avec les
    mêmes : **l'isolation n'a modifié aucun verdict de test**.
  - **Le coût de l'isolation reste sous le bruit de mesure.** Les temps sont
    même plus bas qu'au CP0 (`python-ds` −486 ms, `react-tsx` jusqu'à −376 ms),
    mais les deux mesures n'ont pas été prises sur le même serveur ni au même
    état de cache : la comparaison prouve que le coût est imperceptible, **pas
    qu'il est nul**. Écrit comme tel.
  - **La ligne « fuite 11/12 → 12/12 » n'est PAS un correctif** : le CP0 lisait
    un espace de travail contenant encore une solution laissée par une exécution
    antérieure. Artefact de fixture, déclaré comme tel plutôt que compté comme
    un gain.
  - **ANOMALIE DE SONDE n° 6** : la colonne « aide servie » changeait à chaque
    exécution. Cause : ma sonde rejouait le même échec quelques centaines de
    millisecondes après le précédent — **même clé métier à la seconde près**,
    donc tentative dédupliquée, donc série d'échecs à zéro, donc `remedier` rend
    `null`. Comportement du produit **correct** ; c'est la sonde qui allait plus
    vite que la résolution temporelle du modèle de faits.
  - *Une sonde instable qu'on n'explique pas devient une ligne qu'on finit par
    ignorer — et une ligne ignorée est exactement ce qui a permis au double
    comptage du CP11 de vivre un sprint entier dans un commentaire.*

- **CP11** — **une réussite, deux preuves : le double comptage était écrit dans
  le code depuis V75.**
  - Sur un état NEUF — condition sans laquelle « une preuve de plus » est
    invisible — une seule réussite au laboratoire écrivait **2 preuves**,
    fournissait **2 « sources distinctes »** et produisait **2 contacts de
    rétention**.
  - **Ce n'était pas cosmétique** : la règle de consolidation promeut à
    `reinforced` sur « deux sources distinctes ET deux dates distinctes » —
    c'est-à-dire deux OCCASIONS différentes de démontrer la compétence. Un seul
    exercice en fournissait deux : résolu deux jours de suite, il déclarait un
    réancrage qui n'avait pas eu lieu. Le « score fabriqué » que V75 avait
    interdit.
  - **Le plus gênant : c'était écrit.** Un commentaire de V75 · CP4 l'annonçait
    mot pour mot, et s'en servait comme d'une CONTRAINTE (« il faut instrumenter
    les deux preuves ») au lieu d'y voir le défaut. Quinze lignes plus haut, un
    autre commentaire affirmait le contraire — « les deux chemins convergent sur
    UNE preuve ». Vrai pour la journée, faux pour le registre. *Deux commentaires
    du même fichier se contredisaient depuis un sprint, et aucun test ne pouvait
    trancher parce qu'aucun ne COMPTAIT.*
  - **Cause** : `evidenceId` servait à deux choses — identifiant de la preuve de
    JOURNÉE et `sourceId` de la preuve CANONIQUE. `canonicalSourceId` sépare les
    deux. Absent, le comportement reste celui d'avant.
  - **La moitié qui aurait cassé le produit** : §P9 du contrat V65 fait échouer
    une commande dont la preuve est refusée. Si le doublon était devenu une
    ERREUR, chaque réussite aurait affiché un échec de soumission. Un test
    l'épingle.
  - **Les registres déjà écrits** sont réparés **à la lecture**, jamais réécrits
    sur le disque. Règle étroite : seulement `exercise`, seulement si `<id>`
    existe, seulement à compétences identiques — appuyée sur une propriété du
    corpus VÉRIFIÉE (0/376 identifiants commençant par `lab-`).
  - **Sept maillons sur neuf fonctionnaient, et n'ont pas été touchés.** Le CP11
    était un audit ; il a corrigé le seul maillon cassé et n'a rien reconstruit.
  - **11 mutations, 10 tuées, 1 équivalente.** `O7` avait survécu parce que mes
    tests n'atteignaient jamais la branche gardée (même faute que `N4` au CP10) ;
    `O8` dans sa première forme avait survécu parce que la tentative est aussi
    persistée, accidentellement, par l'écriture du fait `hintViews`.

- **CP10** — **l'historique était complet, et personne ne le servait.**
  - Quatrième sprint de suite où la chose à construire existe déjà, débranchée.
    Le fait `ExerciseAttempt` est persisté depuis V74 · CP2 ; la surface tenait
    sa propre liste dans un `useState([])`, plafonnée à cinq, **affichée à partir
    du DEUXIÈME lancement** — donc pas après le premier échec, qui est le moment
    où on regarde son historique — et vidée à chaque rechargement.
  - **Le fait n'a PAS été étendu.** Il est gelé au contrat V74 §3.2 et alimente
    la rétention ; y verser du code source en changerait la nature, et 20 000
    tentatives × un espace de travail rendrait la progression inutilisable. Un
    JOURNAL séparé porte ce que le fait n'a pas — résultats publics, code soumis,
    aides lues — et **ne fait jamais autorité** : un journal qui prétendrait
    `passed: 999` ne change pas le score affiché (test).
  - **Il vit hors de l'espace de travail**, parce que `resetWorkspace` fait
    `rmSync(dir, { recursive: true })` et que §1.11 interdit qu'un `RESET`
    emporte l'histoire d'une tentative.
  - **La catégorie qu'on oublie** : les tests CASSÉS entre deux tentatives. Un
    apprenant qui répare un test en cassant un autre voit `2/3` puis `2/3` et
    croit n'avoir rien fait. La lecture le dit : « le score est le même des deux
    côtés, mais ce ne sont pas les mêmes tests ».
  - **L'ORDRE vient des dates, pas de l'appelant** : comparer du récent vers
    l'ancien présenterait un progrès comme une régression.
  - **LA SONDE A TROUVÉ CE QU'AUCUN TEST UNITAIRE NE POUVAIT VOIR.** Le produit
    nomme ce champ `testId` dans un RÉSULTAT et `id` dans un DESCRIPTEUR. Le
    journal ne lisait que `id` : il gardait le code et **jetait silencieusement
    tous les résultats**. Mes 27 tests étaient verts, parce que mes fixtures
    écrivaient déjà `id`. *Un test qui fabrique ses propres données ne découvre
    jamais qu'il les fabrique au mauvais format.* Un test unitaire garde la
    logique ; seule une exécution réelle garde le CONTRAT ENTRE DEUX MODULES.
  - **19 mutations, 18 tuées, 1 équivalente et déclarée telle.** `N4` avait
    survécu parce que mon test n'atteignait jamais la branche qu'il croyait
    garder ; `N18` parce que ma sonde passait déjà les tentatives dans le bon
    ordre. `N17′` survit légitimement : le fichier de journal serait à CÔTÉ du
    répertoire effacé, pas dedans — comptée équivalente, pas tuée.
  - **Limite déclarée** : le journal ne commence qu'après le CP10. Les
    tentatives antérieures sont listées avec « code non conservé » — dites, pas
    masquées. Reconstruire rétroactivement serait inventer.

- **CP9** — **un onglet oublié effaçait le travail d'un autre.**
  - `T20` était écrit « non mesuré » depuis le CP0. Mesuré : **le scénario se
    produisait**. Un onglet laissé ouvert une heure renvoyait son état au
    prochain autosave et **écrasait silencieusement** le travail fait
    entre-temps — sans trace, sans avertissement, sans moyen de le retrouver.
  - **La révision est calculée sur le CONTENU, pas sur l'horloge.** C'est la
    seule variante qui laisse passer une sauvegarde qui ne change rien : une
    protection qui punit l'inaction n'en est pas une.
  - **Le refus rend le contenu de l'autre version.** Un refus qui dit seulement
    « non » laisse l'apprenant devant un mur. Rien n'est fusionné, rien n'est
    écrasé, **aucun bouton « forcer »** — un test l'interdit.
  - **La compatibilité est un choix, pas un oubli** : sans `revs`, rien n'est
    refusé. Un client qui ne les connaît pas perd la protection, jamais sa
    sauvegarde.
  - **`RESET` n'efface toujours aucun fait**, vérifié en fabriquant une histoire
    réelle puis en réinitialisant deux fois de deux façons : `43→43 · 12→12 ·
    3→3`. `RESET_EXERCISE` n'existe pas : `400 — Action inconnue.`
  - **QUATRE mutations ont survécu, en deux vagues, pour la même raison.** Mes
    tests cherchaient du TEXTE (`conflitsDeRevision(`, `status: 409`,
    `setConflit(`) au lieu d'exercer une décision. `if (false && conflits.length)`
    les laissait tous verts ; et le composant contenant DEUX `setConflit(`,
    effacer la branche de refus laissait la remise à zéro — donc le test vert.
    *Une assertion de texte tient une convention, jamais un comportement.*
  - **Remède, deux fois le même** : sortir la décision du serveur
    (`decisionDeSauvegarde`, PURE) et la lecture du refus de la surface
    (`lectureDuRefus`, PURE, sans import Node), et les faire APPELER par les
    tests. Même geste qu'au CP5 pour la frontière d'exécution.
  - **14 mutations, 14 tuées.** Trois d'entre elles (`M3`, `M4`, `M7`) portent
    sur une route TypeScript : `npm test` ne peut pas l'exécuter, et **aucune
    assertion statique ne prouve qu'un handler appelle ce qu'il importe**. Elles
    sont tuées par la SONDE, produit reconstruit et servi. **Limite déclarée** :
    le gantelet du CP14 devra faire tourner les deux, pas seulement `npm test`.

- **CP8** — **le repli hors ligne ÉTAIT la fuite.**
  - `GET /transfer/[id]` servait `"answer":0` et le texte d'`explanation` dans
    sa charge utile RSC : un « afficher le code source » donnait les réponses
    avant toute tentative. **25/25 défis concernés.**
  - **V75 ne pouvait pas la voir** : son CP9 avait fait six vérifications
    sérieuses sur chaque défi, et aucune sur la fuite. *Un défi qui fonctionne
    parfaitement peut donner la réponse d'avance.*
  - **La discipline existait déjà côté laboratoire** (`exerciseMeta`,
    `splitAttempt`) ; elle n'avait simplement jamais traversé.
  - **Le TYPE fait la garde** : `TransferChallengePublic` empêche le compilateur
    de passer le défi complet. Une protection qui dépend d'une relecture
    attentive n'en est pas une.
  - **Une capacité a disparu, et c'était juste** : le client corrigeait hors
    ligne — ce qui n'était possible que parce qu'il détenait le corrigé. Le
    produit dit maintenant qu'il ne peut pas corriger, plutôt que de garder la
    réponse sous la main.
  - **Contre-épreuve décisive** : ancien code remis, produit reconstruit, sonde
    relancée → **25/25 fuient**. Avec le correctif → **0/25**. Une sonde qui ne
    trouve rien peut simplement être aveugle ; celle-ci ne l'est pas.
  - `aria-live="polite"` ajouté sur le résultat (le CP2 avait mesuré **0**).

- **CP7** — **le produit ne savait pas qu'il avait aidé.**
  - Huitième fait du produit : `RECORD_HINT_VIEW`, même contrat que les sept
    autres. `hintViews` ajouté aux **DEUX** listes blanches du store **dans le
    même commit** — le défaut P7 de V75 avait laissé `curriculumPause` dans une
    seule pendant trois checkpoints, verte et sans effet sur le disque. Le test
    fait donc l'aller-retour RÉEL par `writeActiveTrack`.
  - **L'échelle ne repropose plus ce qui vient d'être lu**, mais le repli sur la
    liste complète n'est pas une concession : laisser la liste vide ferait
    tomber `remedier` dans sa branche de dernier recours, c'est-à-dire **donner
    la réponse**.
  - **La provenance décrit, elle ne punit pas** : `reussite` vaut `true` en
    toutes circonstances, et trois tests distincts empêchent la dérive vers une
    note (vocabulaire interdit, forme de l'objet figée, rendu non alarmant).
  - **Une mutation a survécu** : vider les marches ne donnait pas la correction,
    ça renvoyait « reprends plus tard » — et mon test s'en satisfaisait. Or
    c'est **une autre façon de ne plus aider**. Le test exige désormais une
    marche réelle tant qu'il en reste.
  - **Deux de mes tests ont cassé pour rien** : ils épinglaient la chaîne exacte
    `remediation, diagnostic }`, et l'ajout d'un champ l'a déplacée. Aucune
    propriété du produit n'avait bougé. Ils cherchent maintenant la PRÉSENCE de
    la clé, et une mutation de contrôle les fait toujours rougir.

- **CP6** — **le module a violé la règle pour laquelle il existe.**
  - Le produit savait qu'un test attendait `"C"` et recevait `"F"` ; l'échelle
    d'aide ne savait que compter les tentatives. La route jetait `expected` et
    `received` au moment précis où ils auraient servi.
  - **ANOMALIE n° 5, la plus instructive du sprint jusqu'ici.** La première
    version nommait un motif `BORNE` et affirmait « c'est celui de la limite ».
    Juste sur `py-debug-grades` (le bug EST un `>` pour `>=`), **faux sur
    `react-counter`** où un compteur démarre à 0 au lieu de 7 : la piste
    envoyait relire une comparaison inexistante. « Un seul cas échoue » est une
    OBSERVATION ; « c'est une borne » est une INTERPRÉTATION que le résultat de
    test ne soutient pas. Classe renommée `CAS_ISOLE`, piste réduite à une
    démarche, et un test refuse les mots « borne / limite / comparaison ».
  - **Seconde moitié** : `web-card` affichait « attend null et reçoit false » —
    vrai, vide, et ça a l'air d'un diagnostic. Le prédicat qui écarte les
    sentinelles de DOM est désormais posé AVANT toute branche.
  - **Une mutation a survécu** : mon test n'examinait que trois observations
    échantillonnées, et la classe mutée n'y était pas. *Un test qui regarde
    trois cas sur huit garde trois cas sur huit.*
  - **Le correctif a failli être le mauvais** : interdire tout impératif
    refusait ma propre piste « Corrige d'abord ce que l'outil signale », qui est
    une consigne d'ORDRE sans réponse. L'affaiblir aurait été `G12`. Le test
    interdit donc précisément le CONTENU d'un correctif : opérateur, appel,
    valeur, « remplace X par Y ». **6/6 rouges après correction.**

- **CP5** — **les cinq évasions fermées, et cinq exercices cassés en chemin.**
  - Deux frontières, choisies pour ce que le noyau offre RÉELLEMENT (aucun
    Docker ici) : `node --permission` + `unshare --net` pour les 275 exercices
    Node/TS/React/web ; espaces de noms utilisateur/montage/réseau + racine
    minimale pour les 101 exercices Python.
  - **16/16 sondes contenues** (11/16 au CP0), et 4/4 attaques Python bloquées.
  - **L'isolation a cassé cinq exercices avant d'être juste**, et aucune panne
    n'a été résolue en desserrant une protection : lecture de `node_modules`
    autorisée (l'écriture jamais) · `existsSync` remplacé par `lstatSync` parce
    qu'il **suit** les liens et rend `false` sur un lien cassé · binaires nommés
    en absolu (`/usr/sbin/chroot` hors du `PATH` minimal) · interpréteur résolu
    AVANT d'entrer dans la racine (c'est `/etc` qui manque, et c'est voulu) ·
    répertoires de paquets Python nommés explicitement, parce que `$HOME` est
    précisément ce que la racine cache.
  - **La dernière erreur est la plus instructive** : après tout cela, `pandas`
    échouait encore à cause de **deux affectations successives partant toutes
    deux de `env`**, dont la seconde écrasait la première. Le symptôme désignait
    la frontière ; la faute était à six lignes de là.
  - **`SEC3` est déclaré PARTIEL en Python**, pas maquillé en `total` : un
    processus peut naître, confiné à la même racine, sans réseau ni privilège.
    Un test refuse que cette valeur devienne `total` sans mesure.
  - **7 mutations vues rouges**, dont « un point d'exécution contourne la
    frontière » : le CP0 avait trouvé TROIS points de spawn, et en oublier un
    rouvrirait les cinq évasions sur tout un runtime.

- **CP4** — **trois exercices sur 376, et la séquence passe sur les trois.**
  - `web-card`, `web-counter`, `web-nav` — tous `web`. Séquence complète du
    brief (départ → éditer A → éditer B → lancer → échec → reprise → réussite →
    reset → recharger) : **3/3 sur neuf étapes**.
  - **La vérification qui n'était pas évidente** : le défaut caractéristique du
    multi-fichier est qu'une sauvegarde écrase les autres fichiers. Chaque
    fichier est donc marqué séparément, et les marques précédentes sont
    revérifiées après **chaque** sauvegarde. **Aucune perte.**
  - **`web-counter` refuse l'écriture sur son `index.html` protégé**, avec un
    message lisible. C'est la garantie la plus importante d'un multi-fichier :
    sans elle, on réussit en changeant l'énoncé.
  - **Rien construit** : pas d'arbre de fichiers (aucun exercice n'a de
    sous-répertoire), pas de création/suppression/renommage (aucun ne le
    demande). Les onglets et la palette `⌘K` suffisent à deux ou trois fichiers
    à plat.
  - **LIMITE DÉCLARÉE** : les trois sont `web`. Le multi-fichier n'a jamais été
    exercé sur un runtime qui exécute réellement du code — or `lib/runtime.mjs`
    déclare `multiFile: true` pour **tous**. Capacité **déclarée mais non
    vérifiée** pour `node-js`, `python3`, `typescript`, `python-ds`.

- **CP3** — **le langage était bien calculé, puis jeté à la dernière ligne.**
  - `lib/exercise-files.mjs` détecte correctement `html` et `css` depuis
    l'extension. `CodeMirrorEditor.tsx` ne connaissait que quatre langages et
    **retombait sur JavaScript pour tout le reste** : 11 fichiers `.html` et
    3 `.css` colorés avec la mauvaise grammaire, dans les exercices `web` où le
    langage est justement le sujet.
  - **« Ça colore » n'était pas une preuve** : une grammaire fausse produit aussi
    des jetons. Le test compare donc les **arbres syntaxiques** et exige des
    nœuds que la mauvaise grammaire ne peut pas produire. Le test décisif : sur
    `.card { max-width: 320px; }`, la grammaire JavaScript produit un nœud
    d'erreur `⚠` — le repli n'était pas moins joli, il était **faux**.
  - **Le test garde la décision dans les deux sens** : il exige que HTML et CSS
    soient réellement présents dans le corpus (sinon `G13`), et qu'aucun langage
    présent ≥ 3 fois ne reste sans grammaire.
  - **Rien de décoratif ajouté.** Écartés faute de défaut démontré :
    autocomplétion, pliage, minimap, multi-curseur, et surtout **le linter temps
    réel — qui ferait le travail que l'exercice demande à l'apprenant**.

- **CP2** — **chercher un défaut dans un vrai navigateur, et ne pas en trouver.**
  - **35 rendus réels** (5 pages × 7 largeurs). L'éditeur est visible et
    utilisable **partout**, y compris à 375 px où il occupe encore **51 %** de
    l'écran avec ses **15 commandes**. **Zéro débordement horizontal, 35/35.
    Zéro élément sans nom accessible.**
  - **Aucune ligne de la coquille n'a été modifiée**, et c'est le résultat
    correct : `G14` interdit de remplacer sans défaut démontré. Une refonte
    « parce que le neuf paraît plus moderne » aurait coûté une régression pour
    zéro gain mesuré.
  - **Le seul écart réel appartient au CP8** : `aria-live = 0` sur la page de
    transfert — le résultat d'une tentative n'est jamais annoncé.
  - **Deux nouvelles fausses alertes de ma sonde**, corrigées : quatre cases
    `aria-hidden` comptées comme « sans nom », et un `404` qui n'était que
    l'annulation d'un préchargement RSC par la fermeture trop rapide du
    contexte. *Une sonde mal calibrée invente des défauts ou en cache.*

- **CP1** — **geler à partir de ce qui existe, pas de ce qu'on imaginait.**
  - Le modèle de capacités n'a pas été inventé : il **existait déjà** dans
    `lib/runtime.mjs` et a été gelé tel quel. Le brief le demandait, et le CP0
    l'avait trouvé.
  - **Le contrat déclare les cinq interdits de sécurité en termes absolus**
    (`SEC1`–`SEC5`) alors que les cinq sont violés aujourd'hui. Les geler avant
    de savoir si ce sera facile est exactement le point : les poser après aurait
    été le contournement `G11` de V74.
  - **La conséquence la plus désagréable est écrite d'avance** : un chargeur
    restrictif Node ne protégera pas Python, et 101 exercices pourraient devoir
    être déclarés non isolés. `G1` interdit de les désactiver pour effacer la
    ligne rouge.
  - **L'erreur de V75 est nommée et neutralisée** : l'échelle d'ingénierie dit
    que `W1`–`W22` tous atteints **imposent** `READY`. Le doute pédagogique a son
    propre axe et n'a pas le droit d'en déborder.

- **CP0** — **le Workbench existait déjà ; le vrai sujet est ailleurs.**
  - Pour la troisième fois de suite, le sprint commence par découvrir que la
    chose à construire existe. Douze parcours réels, joués par HTTP : **12/12**
    bouclent, échec compris, avec persistance du fait et preuve à la clé.
  - **Le brief supposait « un simple textarea + un bouton Run ».** La mesure
    trouve 1 330 lignes d'interface, six runtimes, cinq panneaux, autosave,
    palette, historique et mode étroit.
  - **Les données ont refusé deux ateliers** : zéro exercice SQL, zéro exercice
    HTTP. Les construire aurait été bâtir pour personne.
  - **Le vrai sujet est la sécurité d'exécution**, classée n° 3 par le brief et
    qui devrait être n° 1 : le portier de l'API tient sur onze sondes, mais la
    couche d'exécution n'isole rien — disque, processus, réseau local, et
    surtout **les corrections des autres exercices**.
  - **Le second sujet est une fuite** : les réponses des défis de transfert sont
    dans le HTML. Six vérifications avaient été faites au CP9 de V75 ; aucune
    ne regardait ça.
  - **Ma propre sonde de sécurité a rendu trois faux négatifs** avant d'être
    corrigée. C'est l'anomalie n° 7 de V75 appliquée au pire endroit possible.
