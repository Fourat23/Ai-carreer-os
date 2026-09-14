# V76 · CP0 — AUDIT FORENSIQUE DE L'ENVIRONNEMENT DE PRATIQUE

> **Lecture seule produit.** Aucune fonctionnalité n'a été modifiée. Trois
> scripts rejouables, un serveur réellement lancé, une fixture hors dépôt.
>
> ```
> node scripts/v76/cp0-practice-forensics.mjs      # inventaire statique
> node scripts/v76/cp0-e2e.mjs                     # la boucle, par HTTP
> node scripts/v76/cp0-security.mjs                # les attaques, par HTTP
> ```

---

## 1. Le fait principal : **le Workbench existe déjà, et il fonctionne**

C'est la troisième fois de suite qu'un sprint commence par cette découverte, et
il faut la dire avant tout le reste.

**Douze exercices, un par famille de runtime, joués en entier par HTTP sur le
produit en marche** — ouvrir, soumettre le fichier de départ (que l'énoncé
déclare faux), lire le retour, appliquer la correction, re-soumettre, vérifier
le disque :

| exercice | runtime | échoue | échec persisté | réussit | réussite persistée | preuve |
|---|---|---|---|---|---|---|
| `a11y-accessible-name` | node-js | ✅ 2/5 | ✅ | ✅ 5/5 | ✅ | ✅ |
| `dl-forward-2layer` | python-ds | ✅ 0/3 | ✅ | ✅ 3/3 | ✅ | ✅ |
| `agent-detect-loop` | python3 | ✅ 1/3 | ✅ | ✅ 3/3 | ✅ | ✅ |
| `eval-groundedness-proxy` | python3 · PROXY | ✅ 1/3 | ✅ | ✅ 3/3 | ✅ | ✅ |
| `react-avatar` | react-tsx | ✅ 1/3 | ✅ | ✅ 3/3 | ✅ | ✅ |
| `ds-stack` | typescript | ✅ 0/3 | ✅ | ✅ 3/3 | ✅ | ✅ |
| `web-card` | web | ✅ 0/5 | ✅ | ✅ 5/5 | ✅ | ✅ |
| `greeting` | node-js (stdout) | ✅ 0/2 | ✅ | ✅ 2/2 | ✅ | ✅ |
| `react-counter` | react-tsx | ✅ 2/3 | ✅ | ✅ 3/3 | ✅ | ✅ |
| `agent-excessive-agency` | node-js | ✅ 1/3 | ✅ | ✅ 3/3 | ✅ | ✅ |
| `web-counter` | web (interaction) | ✅ 2/4 | ✅ | ✅ 4/4 | ✅ | ✅ |
| `system-design-diagnose` | node-js (7 tests) | ✅ 1/7 | ✅ | ✅ 7/7 | ✅ | ✅ |

**12 / 12.** Aucun exercice impossible à rater. Aucun exercice qui échoue avec sa
propre correction. **Aucun échec non persisté.**

La chaîne que le brief décrit comme l'objectif du sprint —

```
DAY → EXERCISE → WORKBENCH → EDIT → RUN → TEST → FAIL
    → DIAGNOSIS → HINT → RETRY → PASS → EVIDENCE → STATE
```

— **est déjà branchée de bout en bout** pour les six runtimes.

### Ce qui existe, concrètement

| brique | fichier | lignes |
|---|---|---|
| surface du Workbench | `app/lab/[exerciseId]/LabWorkspace.tsx` | 656 |
| éditeur | `CodeMirrorEditor.tsx` (CodeMirror 6, JS + Python) | 120 |
| aperçu web | `FrontendPreview.tsx` | 100 |
| aperçu React | `ReactPreview.tsx` | 117 |
| terminal | `TerminalPanel.tsx` | 138 |
| disposition persistée | `usePanelLayout.ts` | 81 |
| runner pur | `lib/runtime.mjs` + `lib/workspace.mjs` | 375 |
| exécution | `lib/workspace-fs.mjs` | 435 |
| remédiation | `lib/remediation.mjs` | 456 |

Le Workbench a **déjà** : onglets de fichiers, palette de fichiers, autosave
débouncé avec vidage avant navigation, raccourcis clavier, marqueurs d'erreur
avec saut à la ligne, cinq panneaux (aperçu · tests · diagnostics · console ·
terminal · aide), historique des exécutions, mode étroit pour petit écran.

**Conclusion : V76 ne doit pas construire un Workbench. Il doit en réparer
quatre défauts précis et en déclarer les limites.**

---

## 2. Les 376 exercices, recomptés

**376**, confirmé — un fichier JSON par exercice dans `data/exercises/`.

| famille (runtime · mode) | n | tests | multi-fichier | à tests privés | avec correction |
|---|---|---|---|---|---|
| `node-js` | **233** | 918 | 0 | 217 | 233 |
| `python3` | **80** | 251 | 0 | 75 | 80 |
| `python-ds` · `TOOLING_ENVIRONMENT_REQUIRED` | **18** | 53 | 0 | 18 | 18 |
| `typescript` | **16** | 51 | 0 | 13 | 16 |
| `react-tsx` | **15** | 44 | 0 | 11 | 15 |
| `web` | **11** | 31 | **3** | 7 | 11 |
| `python3` · `PROXY` | **3** | 9 | 0 | 3 | 3 |

**1 357 tests**, 16 genres. `call-equals` domine massivement (348 exercices le
utilisent) ; suivent `text-contains` (12), `selector-exists` (10),
`element-count` (8), `event-changes-text` (6).

**Les 376 ont une correction de référence. 344 ont au moins un test privé.**

### La taxonomie que les données imposent — et celle qu'il ne faut PAS inventer

Le brief proposait `CODE_WORKBENCH`, `SQL_WORKBENCH`, `HTTP_WORKBENCH`,
`TERMINAL_WORKBENCH`, `WEB_WORKBENCH`, `CONFIG_WORKBENCH`, `TEXT_WORKBENCH` — en
précisant de ne les créer **qu'après** le CP0. Les données répondent :

| famille proposée | exercices qui la justifient | verdict |
|---|---|---|
| `CODE` (node · python · ts) | **350** | ✅ **existe déjà** |
| `WEB` (html/css + react) | **26** | ✅ **existe déjà** (aperçu + tests DOM) |
| `TERMINAL` | **3 tâches** (`data/terminal-tasks`) | ✅ existe, surface minuscule et bornée |
| **`SQL`** | **0** — aucun exercice n'a de runtime SQL | ❌ **NE PAS CONSTRUIRE** |
| **`HTTP`** | **0** — aucun exercice n'a de runtime HTTP | ❌ **NE PAS CONSTRUIRE** |
| `CONFIG` | 0 en tant que runtime | ❌ ne pas construire |
| `TEXT` | 0 | ❌ ne pas construire |

**Neuf exercices *mentionnent* SQL dans leur énoncé ; aucun ne l'exécute.** Bâtir
un atelier SQL serait construire une capacité pour zéro apprenant — exactement
ce que le brief interdit.

### Multi-fichier : presque personne n'en a besoin

**3 exercices sur 376** ont plus d'un fichier éditable (des exercices `web` :
HTML + CSS + JS). Le Workbench le supporte déjà (onglets, palette, arbre).
**Le CP4 n'a donc rien à construire** — au plus, à vérifier que ces 3 cas
fonctionnent.

---

## 3. Les autres familles de pratique — et ce qu'elles ne font pas

`data/exercises` n'est pas toute la pratique. Onze autres dossiers existent :

| dossier | fichiers | exécutable | déclarés « simulés » | à questions |
|---|---|---|---|---|
| `missions` | 42 | 0 | 0 | 0 |
| `playbooks` | 45 | 0 | 0 | 0 |
| `transfer-challenges` | 25 | 0 | **25** | 25 |
| `assessments` | 16 | 0 | 4 | 16 |
| `capstones` | 13 | 0 | **13** | 0 |
| `cloud` | 8 | 0 | 0 | 0 |
| `security` | 5 | 0 | 0 | 0 |
| `pipelines` · `manifests` · `topologies` · `terminal-tasks` | 3 chacun | 0 | 0 | 0 |

**Aucune n'exécute de code.** Ce sont des questionnaires (transferts,
évaluations) ou des artefacts structurés (missions, playbooks, manifestes).
Beaucoup portent un `simulationNote` : **le produit déclare déjà honnêtement ce
qui est simulé**, ce qui est un acquis à ne pas casser.

### La conséquence pour V76

**Onze surfaces de pratique existent ; deux seulement écrivent un fait.**

| surface | page | route | moteur | fait écrit | remédiation | bac à sable |
|---|---|---|---|---|---|---|
| `lab` | ✅ | ✅ | ✅ | **ExerciseAttempt** | ✅ | ✅ |
| `transfer` | ✅ | ✅ | ✅ | **TransferAttempt** | — | — |
| `terminal` | — | ✅ | ❌ | **aucun** | — | — |
| `assessments` | — | ✅ | ❌ | **aucun** | — | — |
| `capstones` · `missions` · `cloud-lab` · `cloud-foundations` · `kubernetes` · `pipelines` · `security` | ✅ (6/7) | ✅ | ❌ | **aucun** | — | — |

**Neuf surfaces sur onze ne laissent aucune trace dans le modèle
d'apprentissage.** Ce n'est pas nécessairement un défaut — une mission est un
travail long, hors produit — mais c'est la dette la plus large du périmètre, et
elle n'avait jamais été chiffrée.

---

## 4. Ce que l'apprenant reçoit quand il échoue

Mesuré sur les douze parcours réels, après la soumission fausse :

| ce qui revient | sur 12 |
|---|---|
| résultats de tests détaillés | **12** |
| attendu **et** reçu par test | **12** |
| remédiation (échelon nommé) | **12** |
| `stdout` quand il y en a | 1 (le seul exercice à sortie standard) |
| diagnostics de compilation | 0 (aucun échec de compilation dans l'échantillon) |

**L'échelon de remédiation servi au premier échec est `1` dans les douze cas** —
jamais la correction complète. La règle du CP7 de V74 (*« la correction complète
est la dernière marche »*) tient sur le produit réel, pas seulement en test.

### Classement de la qualité du retour (grille CP0.F)

| niveau | ce que c'est | état |
|---|---|---|
| `NONE` | rien | — |
| `RAW` | la trace d'erreur brute | présent en secours |
| `TECHNICAL` | « attendu 4, reçu 3 » | ✅ **présent, sur 12/12** |
| `ACTIONABLE` | pointe l'endroit, propose une piste | ✅ partiellement — `lib/test-diff.mjs` produit un diff structuré, `lib/ts-hints.mjs` traduit les diagnostics TypeScript |
| `PEDAGOGICAL` | « ta boucle s'arrête une itération trop tôt » | ⚠️ **c'est la remédiation qui le porte**, et elle est générique par échelon, pas spécifique au symptôme observé |

**Le vrai manque n'est pas l'absence de retour : c'est que le retour
`TECHNICAL` et la remédiation `PEDAGOGICAL` ne se parlent pas.** Le produit sait
qu'un test attendait `"C"` et a reçu `"F"` ; la remédiation, elle, ne le sait
pas et propose un échelon calculé sur le **nombre** de tentatives.

---

## 5. Sécurité : le portier tient, la maison est ouverte

**Seize sondes lancées contre le produit en marche.** Le détail complet est dans
`docs/v76/V76-THREAT-MODEL.md` ; voici le verdict.

### Ce qui tient (11 sur 16)

| sonde | résultat observé |
|---|---|
| boucle infinie | ✅ coupée à **5 105 ms** |
| inondation de `stdout` | ✅ réponse **1 Ko** pour ~10⁹ octets émis |
| traversée `../../` | ✅ **refusé 400** |
| chemin absolu | ✅ **refusé 400** |
| nom de fichier malveillant (octet nul, `....//`) | ✅ **refusé 400** |
| charge utile de 10 Mo | ✅ **refusé 400** en 180 ms |
| 200 fichiers par requête | ✅ **refusé 400** |
| modification d'un fichier protégé | ✅ **refusé**, message explicite |
| brouillon compté comme tentative | ✅ **non** — 36 → 36 |
| action inconnue | ✅ **refusé 400** |
| secrets d'environnement | ✅ **2 variables transmises** (`PATH`, `NODE_ENV`), aucune sensible |

### Ce qui ne tient pas (5 sur 16) — et c'est la découverte du checkpoint

| sonde | ce qui s'est réellement passé |
|---|---|
| **`T12` lecture du disque** | `readFileSync('/etc/passwd')` → `root:x:0:0:…` |
| **`T13` lecture des corrections** | la `reference` de `py-debug-grades` **lue depuis le code d'un autre exercice** |
| **`T14` écriture hors bac à sable** | fichier **créé dans le dépôt** par du code d'apprenant |
| **`T15` création de processus** | `execSync('id')` → **`uid=0(root)`** |
| **`T16` SSRF** | `fetch('http://127.0.0.1:3301/api/progress')` → **200** |

La cause est unique et structurelle : le runner utilise `execFile` avec `cwd`,
`shell: false`, `env` filtré, `timeout` et `maxBuffer`. **Chacun de ces réglages
est correct, et aucun n'isole.** `cwd` fixe un dossier de départ, pas une
racine ; le processus hérite de l'identité du serveur et de sa pile réseau.

**Le produit possède pourtant déjà le bon modèle ailleurs** :
`lib/terminal-docker.mjs` exécute ses tâches dans un conteneur durci — réseau
`none`, non-root, lecture seule — et **déclare « indisponible »** quand Docker
manque plutôt que de simuler un succès. Il n'a jamais été appliqué au runner.

### Le contexte, écrit pour ne pas être alarmiste

AI Career OS est aujourd'hui une application **locale mono-utilisateur**. « Le
code de l'apprenant lit les fichiers de l'apprenant » n'est pas une élévation de
privilège. **Deux conséquences restent réelles** : la fuite du corpus de
corrections (`T13`) est un défaut **pédagogique** immédiat, et l'ensemble
deviendrait une exécution de code à distance le jour où le produit servirait
plus d'une personne.

---

## 6. La fuite qui compte le plus : les réponses des défis de transfert

`GET /transfer/archi-scale-shift` renvoie une page de 60 869 octets qui contient,
dans sa charge utile :

```
…,"answer":0,"explanation":"La décision dépend de la contrainte de charge…"
…,"answer":[0,1,2],"explanation":"La bonne réponse CHANGE avec la contrainte…"
```

**La bonne réponse et son explication sont lisibles avant toute tentative**, par
un simple « afficher le code source ».

C'est exactement ce que le CP0.G interdit, et c'est une **régression que V75 ne
pouvait pas voir** : le CP9 de V75 a vérifié que les 25 défis fonctionnaient —
structure, HTTP 200, réussite avec les bonnes réponses, **échec avec les
mauvaises**, preuve valide, comptage par le moteur. Six vérifications, aucune
sur la fuite.

**Le côté laboratoire, lui, filtre correctement** : `exerciseMeta()` n'expose ni
la `reference`, ni les `expected`, ni les noms des tests privés, et
`splitAttempt()` n'agrège les tests privés qu'après exécution. La discipline
existe ; elle n'a pas traversé jusqu'au chemin transfert.

---

## 7. Persistance : ce qui survit, et où

| action | effet observé |
|---|---|
| `save` | ✅ le brouillon est écrit et relu tel quel |
| `save` | ✅ **n'écrit aucun fait** — `draft ≠ attempt` tient déjà |
| `run` | ✅ écrit un `ExerciseAttempt`, succès **ou** échec |
| `reset` | ✅ restaure les fichiers de départ |
| `reset-file` | ✅ existe, par fichier |

Les brouillons vivent dans `data/lab-workspaces/<exerciseId>/`, **correctement
ignoré par git** (`.gitignore:13`). L'invariant du dépôt tient.

**Non mesuré au CP0, à instrumenter** : le comportement de deux onglets
concurrents (`T20`, brouillon périmé écrasant un plus récent) et la sémantique
exacte de « réinitialiser » vue par l'apprenant.

---

## 8. Latence et poids, mesurés

| mesure | valeur |
|---|---|
| ouverture d'un exercice (`GET`) | **3 – 140 ms** |
| exécution `node-js` | **47 – 157 ms** |
| exécution `python3` | **47 – 77 ms** |
| exécution `python-ds` (à froid) | **1 651 ms** — import `numpy`/`pandas` |
| exécution `react-tsx` | **971 – 1 669 ms** — compilation TSX |
| page `/lab` (liste des 376) | **420 Ko**, 90 ms |
| page `/lab/[id]` | **69 Ko**, 27 ms |
| page `/day/1` | **136 Ko**, 200 ms |
| `.next/static/chunks` | **2,5 Mo** au total |

**Le seul poids discutable est `/lab` à 420 Ko** : la page liste les 376
exercices d'un coup. Ce n'est pas bloquant, c'est mesuré.

---

## 9. Accessibilité : le laboratoire est correct, le transfert ne l'est pas

| surface | `aria-label` | `aria-live` | `role=` | `aria-selected` | `onKeyDown` |
|---|---|---|---|---|---|
| `LabWorkspace.tsx` | **17** | 1 | 14 | **8** | 2 |
| `CodeMirrorEditor.tsx` | 5 | 0 | 1 | 0 | 0 (CodeMirror gère) |
| `TerminalPanel.tsx` | 3 | 1 | 2 | 0 | 0 |
| **`ChallengeRunner.tsx`** | **1** | **0** | 2 | 0 | 0 |

Le Workbench annonce ses onglets, ses états et ses résultats. **Le défi de
transfert n'annonce rien** — pas d'`aria-live` sur le résultat d'une tentative.

Responsive : `LabWorkspace` bascule en mode étroit via `matchMedia('(max-width:
1199px)')` et réorganise ses panneaux. Le produit déclare 12 points de rupture
distincts. **Non vérifié au rendu réel** — ce sera le CP13.

---

## 10. Carte de réutilisation

| composant | verdict | raison |
|---|---|---|
| `LabWorkspace.tsx` | **RÉUTILISER** | fait déjà ce que le brief demande |
| `CodeMirrorEditor.tsx` | **RÉUTILISER** | CodeMirror 6, coloration JS + Python |
| `FrontendPreview` · `ReactPreview` | **RÉUTILISER** | l'aperçu web existe |
| `TerminalPanel` + `lib/terminal*.mjs` | **RÉUTILISER** | le meilleur modèle de sécurité du dépôt |
| `lib/runtime.mjs` | **ÉTENDRE** | le modèle de capacités y est déjà ; à geler au CP1 |
| `lib/workspace-fs.mjs` | **ÉTENDRE** | c'est là que l'isolation manque |
| `app/api/lab/[id]/route.ts` | **RÉUTILISER** | l'anti-fuite y est exemplaire |
| `app/api/transfer/[id]/route.ts` | **CORRIGER** | fuite de réponse |
| `app/transfer/[id]/ChallengeRunner.tsx` | **ÉTENDRE** | accessibilité, et ne plus recevoir les réponses |
| `lib/remediation.mjs` | **ÉTENDRE** | ne voit pas le symptôme observé |
| `lib/exercise-context.mjs` | **INCONNU** | 86 lignes, **importé par personne** — seul module orphelin trouvé |
| tout le reste de `lib/` pratique | **RÉUTILISER** | branché et mesuré |

**Rien à remplacer. Rien à supprimer, sauf peut-être un module orphelin de 86
lignes, après vérification.**

---

## 11. Deux anomalies de mes propres sondes

**Anomalie n° 1 — fausse alerte de fuite.** La première version du parcours E2E
cherchait les 60 premiers caractères de la correction dans la réponse, et criait
« fuite » pour deux exercices. C'était faux : dans ces exercices, **le début du
fichier corrigé est identique au fichier de départ** (le bug est plus loin). La
sonde retrouvait le fichier de départ, qu'il est normal de servir. Corrigé : on
ne cherche plus que les lignes **qui distinguent** la correction du départ.

**Anomalie n° 2 — et c'est la plus grave du checkpoint.** Les sondes de sécurité
visaient `greeting`, dont les tests portent sur la **sortie standard**. La valeur
**retournée** par le code n'y apparaît donc jamais dans la réponse — et **trois
sondes d'évasion se sont déclarées « contenues » alors qu'elles réussissaient
toutes** : système de fichiers, processus, réseau.

> **Une sonde de sécurité qui ne sait pas lire son propre résultat rend un faux
> négatif — et un faux négatif de sécurité est pire que pas de sonde du tout :
> il produit une ligne verte dans un rapport.**

C'est l'anomalie n° 7 de V75 (*une mesure faite sur rien valide tout*), appliquée
au pire endroit possible. Corrigé : les sondes qui observent une valeur retournée
visent désormais un exercice `call-equals` dont le `received` est publié.

---

## 12. Ce que le CP0 a démenti

| ce que le brief supposait possible | ce que la mesure montre |
|---|---|
| « transformer l'environnement de pratique en véritable Workbench » | **il l'est déjà** — CodeMirror, onglets, aperçu, tests, diagnostics, terminal, autosave, historique |
| « un simple textarea + un bouton Run » | **faux** — 1 330 lignes d'interface, 5 panneaux, 6 runtimes |
| construire `SQL_WORKBENCH` / `HTTP_WORKBENCH` | **zéro exercice** les justifie |
| construire le multi-fichier | **3 exercices sur 376**, et c'est déjà supporté |
| la sécurité d'exécution est le point 3 des priorités | **c'est le point 1** — cinq menaces non contenues |

---

## 13. Le plan CP1 → CP15

Il découle des mesures, pas du brief.

| CP | objet | justification par la mesure |
|---|---|---|
| **CP1** | **contrat gelé** : vocabulaire, modèle de capacités, contrat de sécurité, critères de verdict | le modèle de capacités existe déjà dans `runtime.mjs` — le geler, pas le réinventer |
| **CP2** | **coquille du Workbench** : vérifier le rendu réel, ne pas redessiner | 1 330 lignes existent et fonctionnent |
| **CP3** | **éditeur** : combler ce qui manque réellement (coloration TS/TSX/HTML) | CodeMirror ne charge que JS et Python |
| **CP4** | **multi-fichier** : vérifier les 3 cas `web`, ne rien construire | 3/376 |
| **CP5** | **🔴 ISOLATION DE L'EXÉCUTION** — le cœur du sprint | `T12`–`T16` non contenues |
| **CP6** | **diagnostic pédagogique** : relier le symptôme observé à la remédiation | le retour technique et la remédiation ne se parlent pas |
| **CP7** | **aide graduée** : brancher l'échelon sur le symptôme, historiser | l'échelon ne dépend que du nombre de tentatives |
| **CP8** | **🔴 FUITE DES DÉFIS DE TRANSFERT** + accessibilité du `ChallengeRunner` | `answer` et `explanation` dans le HTML |
| **CP9** | **persistance** : mesurer `T20`, clarifier les trois « réinitialiser » | non mesuré |
| **CP10** | **historique et diff** : l'apprenant doit voir ce qu'il a changé | l'historique existe, le diff entre tentatives non |
| **CP11** | **preuves et moteur** : vérifier l'absence de double comptage | chaîne branchée, jamais auditée pour les doublons |
| **CP12** | **12 parcours E2E** dans le produit réel | méthode déjà écrite au CP0 |
| **CP13** | **UX / responsive / accessibilité / performance** | 12 points de rupture non vérifiés au rendu |
| **CP14** | **≥ 30 mutations négatives + porte `v76:check` + gauntlet** | les sondes doivent devenir permanentes |
| **CP15** | **rapport final, deux axes de verdict** | — |

**Les deux checkpoints rouges (CP5, CP8) sont les seuls qui corrigent un défaut
réel de sécurité ou de fuite. Ils passent avant tout polissage.**

---

## 14. Les invariants de départ

| | |
|---|---|
| `npm test` | **1858 / 1858** ✅ |
| `tsc --noEmit` | 0 erreur ✅ |
| `npm run build` | compilé ✅ |
| `gates:active` | **48 portes**, 0 violation ✅ |
| exercices | **376** |
| `data/progress.json` | **absent** ✅ |
| `data/lab-workspaces/` | ignoré par git ✅ |
| HEAD au début de V76 | `e36ee65` |
