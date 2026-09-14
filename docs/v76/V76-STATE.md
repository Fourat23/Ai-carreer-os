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

- **dernier CP terminé** : **CP0**
- **CP courant** : —
- **sous-lot courant** : —
- **NEXT_CP** : **CP1** — CONTRAT DE WORKBENCH GELÉ
- **NEXT_ACTION** : écrire `docs/v76/V76-WORKBENCH-CONTRACT-FROZEN.md`. Geler
  (a) le vocabulaire — `WORKBENCH` `WORKSPACE` `DRAFT` `RUN` `ATTEMPT`
  `SUBMISSION` `TEST_RESULT` `DIAGNOSTIC` `HINT` `REMEDIATION` `RESET`
  `SOLUTION_VIEW` `EVIDENCE` `PREVIEW` `TERMINAL_SESSION` ; (b) la règle
  **`DRAFT ≠ ATTEMPT`** (déjà vraie dans le produit : `save` n'écrit aucun fait,
  mesuré 36 → 36) et la règle « un test échoué PRODUIT un `ExerciseAttempt` »
  (déjà vraie) ; (c) le **modèle de capacités**, qui existe déjà dans
  `lib/runtime.mjs` (`multiFile` `stdin` `cancellation` `timeout`
  `syntaxHighlighting` `preview` `previewKind`) — **le geler, pas le
  réinventer** ; (d) le **contrat de sécurité** : timeout, plafond de sortie,
  politique de processus, politique réseau, racine de bac à sable, politique
  d'environnement, sémantique de `reset` — avec l'interdiction de l'affaiblir
  ensuite pour faire passer un exercice ; (e) les **critères de verdict
  d'ingénierie**, gelés AVANT implémentation.

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

## Décisions gelées

*(aucune — le contrat est l'objet du CP1)*

## Anomalies de mes propres sondes (V76)

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
