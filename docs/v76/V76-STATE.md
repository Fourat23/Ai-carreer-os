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

- **dernier CP terminé** : **CP3**
- **CP courant** : —
- **NEXT_CP** : **CP4** — MULTI-FICHIER
- **NEXT_ACTION** : tester **individuellement** les **3 seuls** exercices
  multi-fichiers du corpus — `web-card` (`index.html` + `style.css`),
  `web-counter` (`index.html` en lecture seule + `style.css` + `app.js`),
  `web-nav` (`index.html` + `style.css`) — sur la séquence complète : départ →
  éditer chaque fichier → lancer → échec → reprise → réussite → `reset` →
  rechargement. **Si tout fonctionne : NE RIEN RECONSTRUIRE**, documenter et
  passer au CP5.

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
`data/lab-workspaces/` ignoré par git · **1858 tests** · tsc 0 · build OK ·
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

### Ce qui NE tient PAS — à corriger au CP5

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

### Fuite de réponse — à corriger au CP8

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
