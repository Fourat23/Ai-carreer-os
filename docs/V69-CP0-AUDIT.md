# V69 · CP0 — Audit éditorial réel

> Lecture seule. Publié **avant toute réécriture**. Aucun fichier de `curriculum/`
> modifié entre le snapshot et ce rapport.

---

## A. Baseline vérifiée

| Contrôle | Résultat |
|---|---|
| Branche | `claude/ai-career-os-saas-phfg49` |
| HEAD local = HEAD origin | `a290705…` ✅ |
| Working tree | propre, 0 fichier |
| Stash | 0 entrée |
| Serveurs résiduels | 2 trouvés → **tués** |
| `npx tsc --noEmit` | rc=0 |
| `npm run gates:active` | rc=0, **52 portes vertes** |
| `npm test` | **1 420 réussis**, 0 échec |
| `npm run build` | rc=0 |
| Leçons / journées / solutions | 128 / 365 / 365 |
| Ordre des journées | strictement 1..365 ✅ |
| `data/progress.json` | `73c1ee39…f1fc6e7a6` |

**Snapshot AVANT immuable** : `docs/v69/SNAPSHOT-AVANT.txt`
(SHA-1 `c75503033577b9b0127f5ae3da0881048a279b7f`), contenant le SHA-1 et le nombre de
mots de **chacune** des 128 leçons.

| Corpus | SHA-1 d'entrée |
|---|---|
| `curriculum/lessons` | `7a3fd01729c0d01fde1edb3a0064dd21b5e7adfe` |
| `curriculum/days` | `09b4e37d3bf7c31b9824d8eabaeb0a9ff147fa53` |
| `curriculum/solutions` | `5de62d74b5219317f5f12a8f4366ba7900d8a51a` |

---

## B. Ce que j'ai lu

**35 leçons lues en profondeur pour ce sprint**, selon l'échantillon imposé :

| Catégorie du brief | Leçons |
|---|---|
| 5 premières | `terminal-shell-filesystem`, `git-fundamentals`*, `git-advanced`, `javascript-basics`, `typescript-basics` |
| 5 JS/TS | `async-javascript`, `recursion`, `algorithmic-thinking`*, `data-structures-intro`*, `clean-code` |
| 4 backend | `http-rest-json`, `api-design-basics`, `express-backend`*, `sql-foundations` |
| 4 React/frontend | `react-fundamentals`, `react-hooks-effects`, `css-fundamentals`, `responsive-design` |
| 4 systèmes/cloud/sécu | `docker-containers`, `ai-security`, `prompt-injection-defense`, `architecture-basics` |
| 4 data/stats | `database-modeling`, `pandas-data-wrangling`, `feature-engineering`, `model-evaluation` |
| 4 ML/LLM/RAG/agents | `transformers`, `neural-networks`, `rag-fundamentals`, `embeddings`, `llm-fundamentals`, `structured-outputs-tools` |
| 4 faibles connues | `portfolio-github`, `interview-preparation`, `observability-logging`, `llm-cost-optimization` |
| 4 fortes connues | `terminal-shell-filesystem`, `javascript-basics`, `typescript-basics`, `git-fundamentals` |
| autres | `caching-performance`, `rag-evaluation`, `prompt-engineering` |

*(\* lues intégralement lors de V68, texte inchangé depuis ; relues ici sur les sections
décisives.)*

Deux lues **intégralement** cette fois (`recursion`, `react-hooks-effects`), les autres sur
leur cœur explicatif et leur exemple guidé — là où la qualité se décide.

---

## C. Le constat central : le corpus est écrit dans DEUX registres

Ce n'est pas une impression. C'est mesurable, et la frontière est un caractère : le tiret.

### Registre A — la prose qui enseigne

Signature : des sous-titres `###`, des paragraphes, une analogie **dont la limite est
dite**, un exemple guidé où le raisonnement est numéroté *avant* le code, et une section
« Variante qui déplace le problème ».

**Il existe exactement 4 leçons dans ce registre**, toutes programmées :
`terminal-shell-filesystem`, `javascript-basics`, `typescript-basics`, `git-fundamentals`.

Exemple, tiré de `javascript-basics` :

> **Analogie** : le primitif est une photocopie (chacun la sienne) ; l'objet est un Google
> Doc partagé (deux liens, un seul document). […]
>
> **Limite de l'analogie** : avec un Google Doc, tu VOIS le curseur de l'autre bouger. Ici,
> rien ne signale le partage — c'est justement ce qui rend le bug si difficile. Le code qui
> casse `a` peut se trouver dans un autre fichier, écrit six mois plus tôt, et il ne
> mentionne jamais `a` : il ne connaît que `b`.

### Registre B — la liste à puces qui nomme

Signature : une explication faite de puces de premier niveau, **un concept entier par
puce**, et un exemple guidé au gabarit `**Énoncé** / **Raisonnement** / **Solution** /
**Explication**`.

**39 leçons**, toutes programmées, portent ce gabarit exact.

Exemple, tiré de `recursion` — la totalité de ce qui est enseigné sur le backtracking :

> - **Backtracking (intro)** : générer les combinaisons = un arbre de choix (prendre/ne pas
>   prendre → 2 appels), on essaie, on explore, on DÉFAIT. 2^n sous-ensembles :
>   l'exponentiel vient du PROBLÈME, pas de la solution.

Trente-huit mots. Tout y est **juste**, et rien n'y est **enseigné** : un lecteur qui ne
connaît pas déjà le backtracking ne peut rien reconstruire de cette phrase.

### La mesure

| | Registre A | Registre B | Le reste |
|---|---|---|---|
| Leçons | **4** | **39** | 85 |
| Exemple guidé — médiane | **287 mots** | **54 mots** | 57 mots |
| Explication — médiane | 349 mots | 406 mots | 317 mots |

**L'explication n'est pas plus courte en registre B — elle est plus dense et moins
explicative.** Ce qui s'effondre, c'est l'exemple guidé : 287 mots contre 54.

Densité de l'explication, en mots par puce, sur les leçons programmées les plus
compressées :

| mots / puce | puces | total | leçon |
|---|---|---|---|
| 33 | 6 | **195** | `database-modeling` |
| 33 | 6 | **198** | `react-hooks-effects` |
| 34 | 6 | **204** | `git-advanced` |
| 35 | 6 | **209** | `neural-networks` |
| 35 | 6 | 212 | `caching-performance` |
| 38 | 6 | 226 | `recursion` |
| 39 | 5 | **196** | `authentication` |
| 47 | 4 | **188** | `llm-cost-optimization` |

Le brief l'annonce : « une leçon comprenant 150–300 mots de théorie ne peut être déclarée
approfondie ». **Huit leçons programmées y sont**, et `transformers` explique toute
l'architecture d'un transformeur en **231 mots**.

---

## D. Les pseudo-exemples guidés

Le brief désigne D5 comme le P0. En lisant, la nature du problème apparaît : ce ne sont pas
des exemples trop courts, **ce sont des choses qui ne sont pas des exemples.**

Quatre catégories, toutes rencontrées :

**1. Le fragment de code sans raisonnement** — `clean-code` (13 mots), `http-rest-json`
(15 mots), `sql-foundations` (37 mots). Un bloc avant/après, une phrase de conclusion.
Aucune décision n'est montrée.

**2. La liste d'options** — `architecture-basics` (85 mots) présente trois architectures en
trois puces. C'est un tableau comparatif, pas un exemple.

**3. Le catalogue** — `portfolio-github` (52 mots) énumère six dépôts à épingler. Rien n'y
est guidé.

**4. Le gabarit à quatre étiquettes** — 39 leçons. `**Énoncé**` une ligne, `**Raisonnement**`
une ligne, `**Solution**` un bloc de code, `**Explication**` deux lignes. La ligne
« Raisonnement » **annonce** un raisonnement au lieu de le dérouler :

> **Énoncé** : encoder une colonne `ville` (catégorielle) pour un modèle.
> **Raisonnement** : pas d'ordre entre les villes → one-hot ; mais si trop de villes, la
> matrice explose. — `feature-engineering`

Comparer avec le registre A, sur la même longueur d'énoncé :

> **Raisonnement, étape par étape.**
> 1. « Les noms des employés tech » contient deux gestes, pas un : d'abord **choisir** des
>    employés, ensuite **en extraire** une donnée. Deux gestes, deux outils — `filter` puis
>    `map`. Écrire une seule boucle qui fait les deux marche aussi, mais on ne relit plus
>    l'intention.
> […]
> 3. Pour l'augmentation, la contrainte « sans abîmer l'original » est ce qui décide de
>    tout. Le réflexe naturel serait `lina.salaire *= 1.1`. Mais `lina` est une RÉFÉRENCE
>    vers l'objet du tableau : le modifier modifie la liste que l'autre écran affiche.
> — `javascript-basics`

Le second **montre comment on pense**. Le premier montre ce qu'on a conclu.

**97 leçons programmées ont un exemple guidé de moins de 120 mots.**

---

## E. Notation des 15 dimensions du brief, sur les 35 leçons lues

| # | Dimension | Note | Ce que la lecture montre |
|---|---|---|---|
| 1 | Clarté | **4,3** | les phrases sont nettes, jamais confuses |
| 2 | Vulgarisation | **4,0** | « Le problème d'abord » réussit presque partout |
| 3 | Modèle mental | **4,4** | souvent excellents et mémorables (« machine à régler des boutons ») |
| 4 | Profondeur | **3,0** | 8 leçons sous 230 mots de théorie ; puces au lieu de mécanismes |
| 5 | Progressivité | **3,1** | la puce juxtapose, elle n'enchaîne pas |
| 6 | **Exemple guidé** | **2,4** | **médiane 54 mots ; 4 leçons sur 128 en ont un vrai** |
| 7 | Exactitude | **4,5** | aucune erreur factuelle trouvée dans les 35 lues |
| 8 | Pratique | **3,5** | mini-exercice + exercice difficile presque partout |
| 9 | Correction | **4,1** | acquis de V68 sur les 103 leçons du parcours |
| 10 | Cas métier | **4,1** | présents, crédibles, jamais génériques |
| 11 | Transfert | **3,2** | « Variante » présente mais souvent d'une ligne |
| 12 | Jargon inexpliqué | **3,3** | 31 leçons avec un terme du Vocabulaire jamais prononcé |
| 13 | Prérequis implicites | **3,8** | déclarés partout ; parfois optimistes |
| 14 | Densité cognitive | **2,8** | **c'est le vrai défaut : trop d'idées par phrase** |
| 15 | Capacité à enseigner un débutant | **3,0** | il comprend en lisant, il ne peut pas dériver |

**Moyenne : 3,57.**

---

## F. La question du brief, répondue sans détour

> « Si je donnais uniquement cette leçon à un junior motivé, comprendrait-il réellement le
> sujet ou reconnaîtrait-il seulement son vocabulaire ? »

**Pour les 4 leçons du registre A : il comprendrait.** L'exemple guidé de
`javascript-basics` lui fait dériver la solution — il saurait résoudre le cas de la variante
imbriquée sans qu'on la lui montre.

**Pour les 39 du registre B : il reconnaîtrait le vocabulaire et saurait imiter le code.**
C'est plus que rien, et c'est exactement l'écart que ce sprint doit combler. Trois symptômes
le prouvent :

1. **Il ne pourrait pas dériver.** `recursion` lui dit que le backtracking est « un arbre de
   choix, on essaie, on explore, on DÉFAIT ». Il peut recopier `sousEnsembles`. Il ne peut
   pas écrire une variante, parce qu'on ne lui a jamais montré *pourquoi* le défaire est
   nécessaire ni *quand* il l'est.
2. **Il utiliserait un terme qu'on lui a donné en une demi-ligne.** L'exercice de `recursion`
   demande d'appliquer « le moule à 3 branches » — expression introduite dans une
   incise de vingt mots, dans une puce.
3. **Il croirait avoir compris.** C'est le plus coûteux. Le texte est juste, dense et
   fluide ; rien ne signale au lecteur qu'il vient de survoler. Le décrochage arrive à
   l'exercice, et il l'attribuera à lui-même.

**Le diagnostic du brief — « écrit comme pour une IA » — est exact, et le registre B en est
la forme précise.** Un modèle de langage n'a pas besoin qu'on déroule un raisonnement : la
conclusion dense lui suffit. Un humain apprend le raisonnement, pas la conclusion.

---

## G. Ce qu'il ne faut PAS toucher

L'audit identifie aussi ce qui est déjà bon et qu'une réécriture abîmerait :

- **les 4 leçons du registre A** — elles sont le modèle, pas la cible ;
- **les sections « Le problème d'abord »** — presque toutes excellentes, elles ouvrent sur
  une situation concrète et vécue ;
- **les modèles mentaux** — « des poupées russes » pour la récursion, « une machine à régler
  des boutons » pour un réseau de neurones, « un contrôle d'identité à l'entrée du
  bâtiment » pour l'authentification. Ils sont bons et mémorables ;
- **les corrections issues de V68** — 66 leçons ont une correction qui nomme l'erreur
  probable et dit pourquoi elle séduit ;
- **les cas métier** — crédibles et spécifiques, jamais du SaaS générique.

**V69 ne réécrit pas des leçons. Il réécrit deux choses dans des leçons : le cœur explicatif
et l'exemple guidé.**

---

## H. Périmètre retenu : 40 leçons

Sélection parmi les 97 candidates, priorisée par **précocité dans le parcours** (une
fondation mal enseignée hypothèque tout ce qui suit) et par **couverture des domaines
nommés par le brief**.

| Lot | Domaine | Leçons |
|---|---|---|
| **CP3** | Fondations & génie logiciel | `git-advanced`, `async-javascript`, `algorithmic-thinking`, `recursion`, `data-structures-intro`, `design-patterns-intro`, `clean-code`, `testing-foundations` |
| **CP4** | Web, backend & SQL | `http-rest-json`, `api-design-basics`, `express-backend`, `error-handling`, `sql-foundations`, `database-modeling`, `authentication` |
| **CP5** | Frontend & React | `browser-dom-rendering`, `react-fundamentals`, `react-hooks-effects`, `react-application-states`, `web-forms-validation`, `html-semantic-structure` |
| **CP6** | Systèmes, réseau, Docker, sécurité | `networking-tcp-ip-model`, `linux-processes-signals`, `docker-containers`, `docker-images-layers`, `ai-security`, `prompt-injection-defense` |
| **CP7** | Python, données, statistiques, ML | `pandas-data-wrangling`, `statistics-for-ml`, `machine-learning-basics`, `model-evaluation`, `feature-engineering`, `neural-networks` |
| **CP8** | LLM, RAG, agents | `llm-fundamentals`, `prompt-engineering`, `structured-outputs-tools`, `embeddings`, `rag-fundamentals`, `transformers`, `agents-fundamentals` |

**40 leçons**, toutes programmées, couvrant les six domaines du brief.

Les quatre leçons fondamentales hors programme identifiées par V68
(`deployment-strategies`, `release-incident-recovery`, `responsive-design`,
`cloud-fundamentals`) **ne sont pas rattachées silencieusement** — elles restent un
arbitrage de curriculum, documenté au rapport V68 §5 et repris au rapport final V69.

---

## I. Ce que le sprint ne fera pas, et pourquoi

- **Pas de nouveau script de notation.** Le brief l'interdit et V68 a montré la limite : un
  compteur ne distingue pas `ci-cd` (classée faible, meilleure vulgarisation du corpus) d'une
  leçon réellement faible.
- **Pas d'allongement uniforme.** Une leçon de 2 000 mots qui répète est pire qu'une de 900
  qui enseigne. La cible est le *raisonnement montré*, pas le volume.
- **Pas de gabarit unique appliqué aux 40.** Ce serait remplacer un registre mécanique par
  un autre. Une leçon Git suivra une histoire de commits ; une leçon SQL partira d'un jeu de
  données ; une leçon réseau suivra une requête.
