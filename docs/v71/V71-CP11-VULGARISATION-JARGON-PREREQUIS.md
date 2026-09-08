# V71 — CP11 · Vulgarisation, jargon, prérequis, continuité

> Checkpoint 11 du sprint V71. Quatre passes : **A** vulgarisation, **B** jargon,
> **C** prérequis avec la convention canonique du contrat gelé, **D** continuité
> pédagogique du parcours.
>
> Corpus au moment de la passe : `7453352d…` (fin CP10). 128 leçons, 365 journées,
> 365 solutions.

---

## Résumé en une page

| | trouvé | confirmé après lecture | faux positifs |
|---|---:|---:|---:|
| **A — vulgarisation** (ordre intuition → abstraction) | 0 rupture | 0 | — |
| **A — vulgarisation** (notes D5 = 4) | 2 leçons | **0** | 2 |
| **B — jargon** (sigles non développés) | 34 candidats | **3** | 31 |
| **B — formulations minimisantes** | 134 occurrences | **0** | 134 |
| **C — prérequis** (références vers l'aval) | 31 | **0 classe B** | 2 mal classées |
| **D — continuité** (liens cassés, jours→aval) | 0 | 0 | — |
| **D — continuité** (technos exigées non enseignées) | 16 candidats | **1** | 15 |

**Six corrections écrites.** Trois défauts de jargon réels, un trou de curriculum réel,
une formulation de prérequis à compléter, deux notes D5 corrigées par relecture.

**Le résultat dominant du CP11 est un résultat sur la mesure, pas sur le corpus** :
**168 des 185 signalements sont des faux positifs de mes propres sondes**, et chacun
provient de la même faute — avoir mesuré un **marqueur structurel** au lieu de ce que
l'ancre gelée demande réellement. C'est la sixième fois que ce défaut apparaît dans V71.

---

## A — Vulgarisation

### A.1 L'ordre intuition → abstraction : 0 rupture sur 128

Contrôle structurel exécuté sur les 128 leçons : la section « 🌍 Le problème d'abord »
précède-t-elle l'explication et l'exemple guidé ? Le « 🧠 Modèle mental » arrive-t-il
**avant** l'explication complète et avant l'exemple guidé ?

**Résultat : 0 leçon en défaut.** Les 128 posent le problème avant la solution et le
modèle mental avant l'abstraction. Ce n'est pas un acquis du sprint — c'était déjà vrai
au CP0 — mais c'est vérifié, et c'est la condition que la section A du CP11 demandait de
contrôler.

### A.2 Les deux notes D5 = 4 : toutes deux corrigées par relecture, aucune par édition

`git-advanced` et `architecture-basics` étaient les deux seules leçons du corpus notées
**D5 = 4** (vulgarisation). Le motif écrit au CP3 est identique dans les deux cas :

> « D5 à 4 : dense pour le niveau. » — `git-advanced`
> « D5 à 4 : sujet dense pour le niveau. » — `architecture-basics`

**« Dense pour le niveau » est le libellé de l'ancre D11 (charge cognitive), pas de
l'ancre D5.** L'ancre D5 dit tout autre chose : « chaque terme technique important est
compréhensible **au moment où il apparaît**, par ce que la leçon en dit, sans recours au
glossaire. » Le CP3 a donc noté la même observation deux fois, une fois sur la bonne
dimension et une fois sur la mauvaise.

Relecture ciblée des deux leçons :

- `git-advanced` — le commit est défini comme « une photo complète de l'arborescence,
  plus un pointeur vers le commit précédent » **avant** que la règle du rebase n'en
  dépende ; `bisect` reçoit sa propre section (« la dichotomie appliquée à ton passé »),
  rattachée au cours d'algorithmique déjà suivi.
- `architecture-basics` — `hexagonal` est introduit avec son mécanisme (« le cœur métier
  au centre, les détails branchés via des **ports** (interfaces) et des **adapters**
  (implémentations) ») **et** un test décidable : « changer de base de données = changer
  UN fichier ».

**D5 passe à 5 pour les deux, sans qu'une ligne de leçon soit modifiée. D11 reste à 4
dans les deux cas** : la densité, elle, est réelle, et c'est là que le CP3 avait raison.

**D5 vaut désormais 5,000 sur les 128 leçons.**

---

## B — Jargon

### B.1 La première sonde a été jetée

Version 1 : « tout mot en capitales est un sigle ». Résultat : **121 leçons sur 128**,
donc aucun ordre de lecture exploitable, et des candidats qui n'étaient pas des sigles —
`RIEUR` (extrait de « SUPÉRIEUR »), `QUALIT` (de « QUALITÉ »), `TAGE`, `ARBRE`, `CHOIX`,
`JUSTE`, `VOUS`. Deux causes : **les frontières de mot de JavaScript sont ASCII**, donc
une majuscule accentuée coupe le mot en deux ; et le corpus emploie les capitales pour
l'emphase en français.

Version 2, retenue : la liste des sigles n'est pas inventée, elle est **prise dans le
glossaire du projet** — les 198 entrées portant une forme longue. Un sigle est un sigle
parce que le projet l'a déclaré tel.

### B.2 Le résultat : 57 sigles jamais développés à leur première rencontre

Sur les **76 sigles du glossaire effectivement rencontrés dans le parcours**, seuls
**19 sont développés dès leur première apparition**. Les 57 autres ne le sont pas.
En ne gardant que ceux employés au moins deux fois à cette première rencontre — un
sigle cité une seule fois en passant n'est pas une dépendance de lecture — il reste
**34 candidats**.

### B.3 Les 31 faux positifs, et pourquoi ma sonde avait tort

Lecture des 34, un par un. **31 sont des faux positifs**, et la cause est une seule :
**ma sonde exigeait la forme longue anglaise, alors que l'ancre exige la
compréhensibilité.** Le corpus explique en français, ce qui est mieux, et ma mesure le
comptait comme un défaut.

| sigle | leçon | ce que la leçon dit réellement |
|---|---|---|
| `CAP` | `distributed-systems-failures` | « en présence d'une **partition réseau** (P), un système doit choisir entre rester **Cohérent** (C) ou rester **Disponible** (A) » |
| `CIDR` | `networking-addressing-routing` | « **le nombre après le slash.** `10.0.0.0/16` signifie : les 16 premiers bits sont FIXES » |
| `RED` / `USE` | `metrics-percentiles` | épelés lettre à lettre : **R**ate, **E**rrors, **D**uration / **U**tilization, **S**aturation, **E**rrors |
| `PID` | `linux-processes-signals` | « chaque processus a un identifiant unique (PID) » |
| `SSH` | `networking-tcp-ip-model` | « SSH ouvre un shell » — le rôle, à la couche application |
| `RCA` | `postmortem-rca` | le titre lui-même : « Post-mortem et **analyse de cause racine** (RCA) » |
| `ARIA` | `html-semantic-structure` | « le rôle ARIA n'apporte que l'annonce, jamais le comportement » |
| `IC` | `incident-response` | « **Incident commander (IC).** UNE personne coordonne » |

…et 23 autres du même genre.

### B.4 Les 3 défauts de jargon réels, corrigés

**1. `sql-foundations` — ACID, jour 55.** La leçon écrivait « une transaction rend un
groupe d'opérations atomique (tout ou rien — ACID) ». Le lecteur reçoit le **A** et rien
d'autre ; les trois autres lettres sont posées comme si le sigle parlait de lui-même.
Les quatre sont désormais développées avec **ce que chacune achète** — atomicité (le
groupe passe entier ou pas du tout), cohérence (les contraintes restent vraies après
comme avant), isolation (deux transactions simultanées ne se voient pas à moitié faites),
durabilité (une fois confirmée, la donnée survit à une coupure) — suivies d'une
hiérarchisation : retenir l'atomicité et l'isolation, qui expliquent la quasi-totalité
des incidents de données.

**2. `terminal-shell-filesystem` — RAG, jour 1.** Le premier jour du parcours, la leçon
écrivait « lancer une évaluation RAG (`python eval.py`) » sans un mot d'explication, dans
une phrase dont le propos est que tout le métier passe par le terminal. Réécrit en
langage clair — « mesurer la qualité d'un assistant qui va chercher ses réponses dans tes
documents » — avec le sigle donné comme une étiquette à venir et la mention explicite que
**le lecteur n'a rien à en savoir aujourd'hui**.

**3. `rag-evaluation` — MRR, jour 218. Le cas le plus grave, parce que le glossaire
aggravait le défaut.** `MRR` était employé trois fois sans jamais être développé — et
l'entrée `MRR` du glossaire du projet pointe vers **Monthly Recurring Revenue**, le revenu
récurrent mensuel. Un apprenant qui ne comprend pas et va chercher tombe donc sur une
définition de gestion d'entreprise **sans aucun rapport**. Corrigé dans la leçon : *Mean
Reciprocal Rank*, rang réciproque moyen, avec le calcul (1 si premier, 0,5 si deuxième,
0,33 si troisième) et surtout le **rôle** — c'est la seule des deux métriques qui
distingue « bon document en position 1 » de « bon document en position 5 », donc la seule
qui puisse voir le gain d'un reranking, lequel ne change pas *quels* documents sont
présents mais leur **ordre**.

### B.5 Ce que le cas MRR révèle du glossaire, et ce que je n'ai pas corrigé

Le glossaire compte 711 entrées et **son schéma impose un terme unique par entrée**
(`npm run glossary:check` refuse un doublon). Conséquence : **un sigle réellement ambigu
ne peut pas porter ses deux sens.** Deux collisions existent dans le corpus :

| sigle | sens du glossaire | sens réellement employé dans les leçons |
|---|---|---|
| `MRR` | Monthly Recurring Revenue (entreprise) | **Mean Reciprocal Rank** (recherche) — 3 leçons |
| `IC` | Individual Contributor (carrière) | **Incident Commander** (production) — 1 leçon |

J'ai tenté d'ajouter les deux entrées manquantes ; **la porte du projet les a refusées**,
à juste titre. Correction retenue, minimale et dans le périmètre de V71 : les deux entrées
existantes portent désormais une `ambiguityNote` et une entrée `possibleConfusions` qui
nomment l'autre sens et le domaine où il s'applique, et `IC` est ajouté aux alias de
l'entrée `incident commander` qui existait déjà — de sorte que l'abréviation résolve vers
le bon sens.

**Ce que je n'ai pas fait, et qui reste à faire (V72)** : donner au glossaire un modèle
de sens multiples. `lib/glossary-core.mjs` expose déjà un champ `senses` et une fonction
`isAmbiguous`, **qu'aucune des 711 entrées n'utilise**. Le mécanisme existe, il n'est pas
branché. Ce n'est pas de la qualité académique de leçon, donc hors du périmètre V71 (§30).

### B.6 Formulations minimisantes : 134 occurrences, 0 défaut

Recherche de « il suffit de », « trivial », « évidemment », « simplement », « facile »,
« naturellement », hors code.

| formule | occurrences | défauts après lecture |
|---|---:|---:|
| `simplement` | 52 | 0 |
| `facile` | 37 | 0 |
| `trivial` | 19 | 0 |
| `naturellement` | 14 | 0 |
| `il suffit de/d'` | 10 | 0 |
| `évidemment` | 2 | 0 |

**Les 32 occurrences les plus suspectes ont été lues intégralement.** Aucune ne minimise
une difficulté. Trois usages dominent, et tous les trois sont l'inverse d'une
minimisation :

- **`trivial` est presque toujours nié** : la formule dominante est le titre de section
  « **Ce qui rend le cas non trivial.** »
- **`simplement` est restrictif, pas dépréciatif** : « il n'est **simplement** plus
  atteignable depuis une branche », « la fuite n'a pas bougé d'un caractère, elle est
  **simplement** mieux formatée », « ce n'est **simplement** pas ce dont on avait
  besoin ». Le mot veut dire *rien de plus que*, et il sert à corriger une croyance.
- **`facile` désigne le plus souvent ce qu'il faut se méfier de choisir** : « ce qu'on
  surveille doit être ce dont on souffre, **pas ce qui est facile à mesurer** » ; « le
  test facile est un symptôme de bonne architecture » ; « remplace “c'est facile”, qui
  est une opinion ».

---

## C — Prérequis, avec la convention canonique du contrat gelé

### C.1 Vérification de la convention elle-même

Le brief de reprise signale qu'**une convention de classes a été inversée dans une
session secondaire**. Vérification faite contre `V71-ACADEMIC-CONTRACT-FROZEN.md` :

| classe (dans `PREREQUIS-ORDRE.md`) | signification | ancre D2 correspondante |
|---|---|---|
| **A** | comportement **correct** — la notion est intégrée, la citation est signalée comme aval | **5** (ou 4) |
| **B** | **défaut sérieux** — exigence formulée sans signalement, vers une leçon postérieure | **1** |
| **C** | mineur — écart de deux jours, recouvrement quasi immédiat | 4 |

**La convention en vigueur sur cette branche n'est pas inversée** : A est le bon
comportement, B est le défaut. Elle est conforme à l'ancre D2 gelée au CP1. Aucun
artefact de la branche `claude/v71-recovery-cross-validation` n'a été lu ni utilisé.

### C.2 Les 31 références vers l'aval, reclassées une par une

| classe | nombre | statut |
|---|---:|---|
| **A** — notion intégrée, citation signalée comme aval | **29** | conforme |
| **B** — exigence non signalée vers une leçon postérieure | **0** | — |
| mal classées par ma sonde | 2 | voir ci-dessous |

Les 29 relèvent du remède 1 de `PREREQUIS-ORDRE` §6, appliqué aux CP4→CP8 (20 défauts P1)
puis au CP10 (8 plafonds P3) : la notion nécessaire est écrite dans la leçon, la citation
sort de l'exigence vers un encadré « Où trouver le détail » qui dit que la leçon est
programmée plus loin.

**Les 2 mal classées sont des faux positifs de ma sonde, et c'est instructif** : mon
classifieur cherchait un encadré `>`. Or `design-patterns-intro` fait exactement ce qu'il
faut **sans encadré** :

> « Les principes de code propre — une fonction fait une chose, on nomme ce qu'on fait, on
> ne répète pas la même décision à trois endroits — **éclairent** ce qui suit […]. Ils sont
> approfondis dans `/doc/lessons/clean-code`, **programmée deux jours plus loin** : la
> leçon se suit sans, et tu y reviendras avec les patterns en tête. »

La notion est donnée, le verbe est « éclairent » et non « tu dois », l'aval est annoncé.
C'est l'ancre D2 niveau 5. **Encore une fois, j'avais mesuré la forme du signalement au
lieu du signalement lui-même.**

### C.3 La seule correction de la section C

`technical-storytelling` → `technical-documentation` : la notion était bien donnée en
incise (« adapter son propos à l'auditoire ») avec le verbe « **aident** », mais rien ne
disait que la leçon citée vient plus tard. Complété : la notion est développée en une
phrase utilisable (« dire à un recruteur ce qu'il peut évaluer, à un pair ce qu'il peut
discuter »), et l'aval est annoncé — **programmée huit jours plus loin**.

---

## D — Continuité pédagogique

### D.1 Contrôles structurels : tous verts

| contrôle | résultat |
|---|---|
| liens `/doc/lessons/…` vers une leçon inexistante (jours + leçons + solutions) | **0** |
| journées renvoyant vers une leçon **programmée plus tard** | **0** |
| leçons du corpus jamais référencées par une journée | 25 — l'étagère de référence, documentée |

### D.2 Le trou de curriculum : `numpy`

Recherche des technologies citées dans les journées et jamais construites. Seize
candidats, quinze faux positifs — la plupart sont des **mentions** (« Redis », « Kafka »
dans un cas professionnel) et non des exigences, et plusieurs sont couvertes par des
leçons de l'étagère que ma méthode ne pouvait pas voir (`kubectl`, `systemctl`).

**Un seul défaut réel, et il est net :**

> **`numpy` est EXIGÉ par la pratique de trois leçons et introduit nulle part.**
>
> - `statistics-for-ml` (jour 148) : « Tu vas les fabriquer toi-même, en Python, **avec
>   numpy** »
> - `neural-networks` (jour 183) : « Implémente, **avec numpy seul**, un réseau à une
>   couche cachée »
> - `transformers` (jour 183) : « **Avec numpy seul**, prends une phrase de sept mots »
>
> Aucune des 128 leçons, aucune des 365 journées ne dit ce qu'est numpy, ce qu'il apporte,
> ni pourquoi on l'emploie plutôt que des listes Python. `pandas-data-wrangling` (jour
> 127), qui serait le lieu naturel, ne le mentionne pas non plus.

C'est l'**ancre D2 niveau 2** : un concept non enseigné est *nécessaire* pour suivre un
passage.

**Correction, à la première exigence dans l'ordre du parcours** (`statistics-for-ml`,
jour 148) : deux phrases qui disent ce que la bibliothèque **apporte**, pas seulement ce
qu'elle est — le tableau de nombres, les opérations sur tout le tableau sans écrire de
boucle, et le tirage aléatoire reproductible **sans lequel aucun chiffre de la pratique ne
serait vérifiable par quelqu'un d'autre**. Plus la commande d'installation et le fait que
c'est le socle de pandas et scikit-learn, rencontrés juste après.

**Les quatre affirmations d'API ont été exécutées ici** — `np.array([1,2,3]).mean()` rend
`2.0`, `d * 2` rend `[2 4 6]`, `np.random.default_rng(42)` fonctionne — sur **numpy
2.4.6**, la version même que les leçons publient dans leurs encadrés de reproductibilité.

---

## Décisions NON prises, et pourquoi

1. **Ne pas ajouter une définition de sigle partout.** Les 31 faux positifs auraient pu
   être « corrigés » en insérant mécaniquement la forme longue anglaise. Cela aurait
   dégradé des passages qui expliquent déjà mieux en français, et produit exactement le
   texte à trous que le §7 interdit.
2. **Ne pas restructurer le glossaire.** Le modèle de sens multiples existe dans le code
   (`senses`, `isAmbiguous`) et n'est branché nulle part. Le brancher est un travail de
   moteur, pas de contenu académique — §30. Signalé pour V72.
3. **Ne pas toucher au mapping des 365 journées.** Le trou `numpy` aurait pu se traiter en
   déplaçant une leçon ou en insérant une journée. Le mapping est protégé ; la notion a
   donc été intégrée là où elle est exigée.
4. **Ne pas remonter D11.** Les 15 leçons à D11 = 4 sont denses, et le CP3 avait raison
   sur ce point-là. Les corriger demanderait de réécrire ou de scinder — hors mandat du
   CP11, signalé au CP15.

---

## Trous de curriculum restants (pour le CP15)

| sujet | nature | décision |
|---|---|---|
| `numpy` | exigé, non enseigné | **fermé au CP11** |
| sens multiples au glossaire (`MRR`, `IC`) | moteur, pas contenu | signalé — V72 |
| 25 leçons hors parcours | choix de conception (étagère de référence) | documenté, pas un défaut |
| D11 = 4 sur 15 leçons | densité réelle | signalé — V72 |
| D10 = 4 sur 28 leçons | transfert professionnel perfectible | signalé — V72 |

---

## Effet sur les notes

| | avant CP11 | après CP11 |
|---|---:|---:|
| moyenne du corpus | 4,9539 | **4,9554** |
| **D5** (vulgarisation) | 4,984 | **5,000** |
| D2 (prérequis) | 5,000 | 5,000 |
| leçons corrigées | — | **6** |

Deux notes bougent, toutes deux par **relecture** et non par édition. Les quatre autres
corrections — ACID, RAG au jour 1, MRR, numpy — **ne déplacent aucune note**, parce que
les leçons concernées n'avaient pas été pénalisées pour ces défauts au CP3. C'est le même
constat qu'aux CP9 et CP10, et il est constant : **le barème gelé ne voit pas tout ce que
la lecture voit.**
