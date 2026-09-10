# V73 — CP2. Graphe canonique du curriculum

**Résultat en une phrase :** le graphe existait déjà pour l'axe *leçon → prérequis → pratique →
compétence*, il lui manquait **l'axe temporel** ; le CP2 l'ajoute, et l'exercice a révélé
**cinq défauts de sonde**, dont un qui faussait **129 arêtes du graphe des prérequis**.

---

## 1. Ce qui existait, et qu'on n'a pas dupliqué

`lib/curriculum-graph.mjs` (V31) est un module **pur**, sans I/O, utilisé par les portes
`v39`, `v40` et `v42`. Il porte :

- les nœuds `lesson`, `skill`, `exercise`, `lab`, `mission`, `playbook`, `assessment`,
  `capstone`, `transfer` ;
- les arêtes `REQUIRES`, `PRACTICES`, `BUILDS_SKILL`, `ASSESSES`, `REMEDIATES` ;
- la détection de cycles (`findPrereqCycles`) et un audit typé par sévérité.

**Il est réutilisé tel quel.** `scripts/v73/cp2-graphe.mjs` l'importe et lui fournit ses
entrées ; il n'en réimplémente aucune partie.

### Ce qui lui manquait

**Les 365 journées.** Le graphe V31 ne sait pas *quand* une leçon est enseignée. Or toutes les
questions de V73 sont temporelles : quand une compétence est-elle introduite, pratiquée,
appliquée, révisée ; un prérequis arrive-t-il avant ; une revue révise-t-elle du déjà-vu ; un
niveau attendu a-t-il une source antérieure.

---

## 2. La couche temporelle ajoutée

| élément | source **déclarative** (règle S1 du contrat) |
|---|---|
| les 365 journées, semaines, mois, projets, difficultés | `data/program.json` |
| les leçons liées à une journée | les liens `/doc/lessons/<slug>` du fichier de journée généré |
| les compétences portées par une leçon | le champ `skills` de `scripts/data/lessons-map.mjs` |
| les exercices d'une journée | `data/day-exercises.json` |
| les labs réels | `LAB_ROUTES` de `app/doc/[...slug]/page.tsx` |
| les niveaux attendus | `expectedScores` de chaque mois |

**Aucune propriété du graphe n'est déduite d'une analyse de prose.**

### Les quatre types de contact

| type | condition |
|---|---|
| `exposition` | journée de travail liant une leçon qui déclare la compétence |
| `pratique` | idem, et la journée porte au moins un exercice |
| `production` | idem, et la journée est une journée de projet |
| `revue` | journée de revue liant une telle leçon |

### I4 appliqué comme le contrat l'exige

La source d'enseignement d'une compétence n'est **pas** `day.skill`. Le CP0 avait montré que
cette lecture produit un faux positif (le mois 6 enseigne l'évaluation sous l'étiquette `ml`).
Ici, une compétence est enseignée au premier jour de travail liant une **leçon qui la
déclare** — une déclaration, pas une étiquette. **Résultat : I4 = 0.** Le faux positif du CP0
est éteint sans qu'aucun seuil n'ait été déplacé.

---

## 3. L'arc pédagogique des vingt compétences

`intro` = premier contact de travail · `dév.` = contacts de travail · `prat.` = journées avec
exercice · `appli.` = journées de projet · `jours porteurs / étiquetés` = journées qui portent
réellement la compétence contre celles qui en portent l'étiquette.

| compétence | intro | dév. | prat. | appli. | revues | niveaux attendus | porteurs / étiquetés |
|---|---|---|---|---|---|---|---|
| `gitlinux` | j1 | 6 | 5 | 0 | 3 | m1:2 m2:2 | 9 / 7 |
| `jsts` | j4 | 41 | 35 | 5 | 9 | m1:2 m2:3 m3:3 m4:4 m8:4 | 50 / 42 |
| `algo` | j15 | 19 | 11 | 0 | 8 | m1:2 m2:3 | 27 / 11 |
| `ds` | j30 | 4 | 4 | 0 | 1 | m2:2 | 5 / 5 |
| `patterns` | j38 | 3 | 3 | 0 | 1 | m10:3 | 4 / 2 |
| `se` | j40 | 50 | 32 | 8 | 13 | m2:2 m3:2 m4:3 m5:3 | 63 / 14 |
| `archi` | j44 | 46 | 23 | 6 | 13 | m4:2 m9:3 m10:3 m11:3 | 59 / 19 |
| `autonomy` | j44 | 23 | 1 | 12 | 0 | m5:3 m11:4 m12:4 | 23 / 23 |
| `comm` | j47 | 49 | 9 | 5 | 11 | m4:2 m6:3 m12:4 | 60 / 25 |
| `http` | j50 | 35 | 14 | 5 | 7 | m3:3 m4:3 m8:4 | 42 / 13 |
| `sql` | j55 | 25 | 14 | 8 | 3 | m3:2 m5:3 m6:3 | 28 / 11 |
| `secu` | j67 | 26 | 10 | 1 | 6 | m3:1 m10:3 m12:3 | 32 / 23 |
| **`cloud`** | **j68** | **31** | **13** | **1** | **10** | **m11:2** | **41 / 0** |
| `python` | j82 | 28 | 17 | 8 | 7 | m5:3 m6:4 m7:4 | 35 / 16 |
| `ml` | j148 | 47 | 34 | 12 | 7 | m6:3 m7:3 | 54 / 35 |
| `evalia` | j157 | 66 | 28 | 11 | 12 | m6:2 m9:3 m12:4 | 78 / 20 |
| `dl` | j183 | 48 | 19 | 0 | 8 | m7:2 | 56 / 15 |
| `llm` | j183 | 49 | 33 | 0 | 8 | m7:2 m8:3 m9:3 | 57 / 21 |
| `agents` | j197 | 36 | 23 | 0 | 6 | m10:3 | 42 / 21 |
| `rag` | j218 | 53 | 20 | 6 | 8 | m8:2 m9:3 m11:4 m12:4 | 61 / 42 |

### Trois faits que seule la couche temporelle rend visibles

**a. `cloud` est enseignée à partir du jour 68, sur 41 journées — et étiquetée sur zéro.**
C'est une correction importante du CP0. Le CP0 disait « `cloud` : 0 journée » en lisant
`day.skill` ; la lecture déclarative montre que **trente-neuf leçons déclarent `cloud`**, que
vingt-six d'entre elles sont programmées, et que le parcours enseigne donc bel et bien du
cloud/DevOps — sous les étiquettes `se`, `archi`, `secu` et `evalia`.

**Le trou n'est donc pas « cloud n'est jamais enseigné ».** Il est double, et plus précis :
1. **le calendrier ne le dit jamais** — aucune journée ne porte l'étiquette, donc ni la page de
   compétence, ni la vue des mois, ni le suivi de progression ne montrent la moindre trace ;
2. **le cloud *proprement dit* manque** — les sept leçons AWS, Azure, réseau cloud, IaC et
   FinOps sont hors parcours. Ce qui est enseigné, c'est le DevOps applicatif (Docker, CI/CD,
   secrets, observabilité), pas le cloud.

C'est ce trou-là, et pas un autre, que le CP3 doit fermer.

**b. `autonomy` a 12 applications et 1 pratique — et aucune leçon.** Zéro leçon du corpus ne
déclare cette compétence. La couche temporelle a donc dû se replier sur l'étiquette de journée,
qui est ici **la seule déclaration disponible**. Ce repli est nommé dans le code, pas silencieux.

**c. `dl`, `llm` et `agents` ont zéro application.** Aucune journée de projet ne porte ces trois
compétences, alors qu'elles totalisent 133 journées d'exposition. Le CP11 devra y revenir.

---

## 4. Les contrôles d'intégrité, et leur porte

`scripts/v73/v73-graphe-check.mjs` rougit dès qu'un invariant du contrat gelé est violé.

| contrôle | mesure |
|---|---|
| **I2** prérequis futurs exigés sans annonce | **0** |
| **I3** revues introduisant une leçon jamais enseignée | **0** |
| **I4** niveaux attendus sans source antérieure | **0** |
| **I6/I9** 365 / 128 / 365 / 52 / 12, ordre, doublons | **intacts** |
| **I7** `data/progress.json` | **absent** |
| **I8** cycles de prérequis | **0** |
| **I10** leçons hors parcours sans encadré de référence | **0** |
| **C9** références mortes | **0** |
| anomalies bloquantes du graphe V31 | **0** |

### La seule modification du produit au CP2

**La référence morte `{ kind: 'lab', id: 'terminal' }` a été retirée de
`terminal-shell-filesystem`** dans `scripts/data/lessons-map.mjs`. C'était la seule référence
morte du corpus : `LAB_ROUTES` ne déclare que `kubernetes`, `security`, `cloud-architecture` et
`pipeline`, il n'existe aucune route `/terminal`, et les tâches de terminal sont servies dans
`/lab/[exerciseId]`. Le lien rendu était `null` — un libellé non cliquable.

**Rien n'est perdu** : la leçon conserve son exercice réel `sh-pipeline-exit-diagnose`, qui
porte la même pratique. **Corpus des 128 leçons inchangé** (`c1ac869e…`).

> **Pourquoi au CP2 et non au CP12, où le plan le plaçait.** Une porte durablement rouge ne
> permet pas de distinguer une régression nouvelle d'un défaut connu, et les tests négatifs
> auraient été ininterprétables. Le CP12 le notera comme déjà traité.

---

## 5. Tests négatifs : 10 / 10

Chaque test provoque une mutation réelle d'une source déclarative, vérifie que la porte rougit
**avec le bon motif**, puis restaure — la restauration étant contrôlée par `git status`.

| # | mutation | motif attendu | résultat |
|---|---|---|---|
| 1 | `javascript-basics` exige `rag-fundamentals` (j218) sans l'annoncer | I2 | **rougit** |
| 2 | la revue j7 lie `cloud-aws-core`, jamais enseignée | I3 | **rougit** |
| 3 | le mois 1 attend `rag = 3` | I4 | **rougit** |
| 4 | le jour 5 lie une leçon inexistante | C9 | **rougit** |
| 5 | le jour 1 cite un exercice inexistant | C9 | **rougit** |
| 6 | arête inverse `terminal-shell-filesystem → git-fundamentals` (même jour) | I8 | **rougit** |
| 7 | `css-grid` privée de son encadré de référence | I10 | **rougit** |
| 8 | la journée 200 supprimée | I6/I9 | **rougit** |
| 9 | la journée 200 dupliquée | I6/I9 | **rougit** |
| 10 | création de `data/progress.json` | I7 | **rougit** |

**Porte après restauration : verte. Dépôt revenu à son état commité pour les dix.**

---

## 6. Cinq anomalies de sonde, publiées (règle S3)

Le CP0 en avait publié cinq. Le CP2 en ajoute cinq, dont **trois trouvées par les tests
négatifs eux-mêmes** — ce qui est précisément leur raison d'être.

### n° 6 — « introduction » définie sur le mauvais type de contact

**La sonde disait** : `algo` introduit au **jour 48**, `jsts` au **jour 110**, `gitlinux` au
**jour 73**. Et **treize** niveaux attendus « sans source d'enseignement », dont « le mois 1
attend `algo = 2` sans enseignement avant j28 ».

**La réalité** : `algo` commence j15, `jsts` j4, `gitlinux` j1, et **aucun** niveau attendu
n'est orphelin.

**La cause** : je définissais l'introduction comme le premier contact de type `exposition`, et
`exposition` excluait par construction toute journée portant un exercice ou un projet. Les
premières journées de chaque compétence en portent presque toujours.

### n° 7 — renvois d'approfondissement comptés comme exigences

**La sonde disait** : **quatre cycles de prérequis** — `ai-security ↔ authentication`,
`api-design-basics ↔ breaking-changes-compatibility`, `rag-evaluation ↔ retrieval-reranking`,
`technical-documentation ↔ readme-documentation`.

**La réalité** : aucun. Dans chaque paire, au moins un des deux liens est un renvoi **annoncé**
(« Où trouver le détail… rien ici ne suppose que tu l'as lue »).

**La cause** : tous les liens de la section « Prérequis » entraient dans le graphe `REQUIRES`.
Une exigence et un renvoi ne sont pas la même arête. Le plan est désormais **scindé** :
`REQUIS` et `LOOKAHEAD`.

### n° 8 — les productions comptées sur un champ presque toujours vide

**La sonde disait** : **zéro application** pour les vingt compétences.

**La réalité** : 34 journées portent un titre « Projet N — … ».

**La cause** : `day.project` n'est renseigné que sur **10 journées sur 365**.

### n° 9, 10 et 11 — trois défauts dans le harnais de test lui-même

| # | symptôme | cause |
|---|---|---|
| **9** | trois tests valides déclarés « état non restauré » | l'empreinte de contrôle incluait `data/program.json`, dont le champ `generatedAt` est réécrit à chaque régénération. Le critère correct est `git status` |
| **10** | le test « référence morte vers une leçon inexistante » laissait la porte **verte** | la mutation visait le **jour 51**, qui possède déjà une clé dans `LESSONS_V67` — en JavaScript, une clé dupliquée dans un littéral d'objet est **écrasée par la dernière**. La mutation n'avait aucun effet, et la porte avait raison |
| **11** | le test « cycle » rougissait sur **I2**, pas sur I8 | le cycle choisi (`clean-code` j40 ↔ `testing-foundations` j41) était **aussi** une violation d'ordre. Un test de cycle doit porter sur deux leçons enseignées le **même jour** |

### n° 12 — la plus grave : 83 exigences réelles classées « renvoi annoncé »

**Trouvée par le test négatif n° 6**, qui refusait obstinément de produire un cycle.

**La sonde disait** : `css-flexbox → css-fundamentals` est un renvoi annoncé. Idem pour
`react-fundamentals → javascript-basics`, `vector-databases → embeddings`,
`machine-learning-basics → statistics-for-ml`… **83 citations en tout.**

**La réalité** : ce sont des **prérequis durs**. « Tu dois connaître le box model,
`box-sizing`, l'héritage et les unités CSS (`css-fundamentals`) » n'est pas un renvoi.

**La cause** : je cherchais le marqueur d'annonce dans **tout le paragraphe** contenant la
citation, et j'acceptais « Aucune X **n'est supposée** » comme marqueur. Or cette phrase parle
du **sujet propre de la leçon**, jamais de la leçon citée :

> « Tu dois connaître le box model … (`css-fundamentals`), ainsi que la structure sémantique
> (`html-semantic-structure`). **Aucune** notion de disposition **n'est supposée**. »

**Conséquence mesurée** : le graphe `REQUIRES` perdait **129 arêtes** (715 au lieu de 844), et
la vérification de cycles portait donc sur un graphe tronqué. **Le « 0 cycle » du premier
passage ne prouvait rien.**

**La règle corrigée porte sur la propriété** : une annonce doit désigner **la leçon citée**
comme venant plus tard. La portée du test est donc l'**encadré `>` contenant la citation** —
ces encadrés sont dédiés à une citation — sinon la **phrase** qui la contient. Et le motif ne
retient que des marqueurs de **postériorité** ou d'**étagère**, jamais « n'est supposé ».

### n° 13 — l'emphase Markdown coupe les phrases

Après correction de la n° 12, quatre annonces parfaitement explicites restaient classées
« exigence non annoncée » :

> « Les deux sont \*\*programmées plus loin\*\* dans le parcours ; rien ici ne suppose que tu
> les as lues. »

La chaîne littérale est `programmées plus loin** dans le parcours` — elle **ne contient pas**
« plus loin dans le parcours », à cause des astérisques. La normalisation retire désormais
l'emphase et les accents graves, en plus du préfixe `>` des encadrés (extension de la règle S6).

**Classification finale : 263 citations `REQUIS`, 43 `LOOKAHEAD`.**

---

## 7. Ce que le CP2 a produit

| fichier | rôle |
|---|---|
| `scripts/v73/cp2-graphe.mjs` | construit le graphe (V31 réutilisé + couche temporelle) |
| `docs/v73/curriculum-graph.json` | le graphe complet, 202 Kio, rejouable |
| `scripts/v73/v73-graphe-check.mjs` | la **porte** : rouge sur I2, I3, I4, I6, I7, I8, I9, I10, C9 |
| `scripts/v73/cp2-tests-negatifs.mjs` | les **dix mutations**, vues échouer puis restaurées |
| `scripts/data/lessons-map.mjs` | une ligne : la référence morte `lab: terminal` retirée |

## 8. Vérifications

| contrôle | résultat |
|---|---|
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0** |
| `npm run gates:active` | **52 gates verts** |
| porte V73 du graphe | **verte** |
| tests négatifs | **10 / 10**, restauration vérifiée par `git status` |
| corpus des 128 leçons | **`c1ac869e…` inchangé** |
