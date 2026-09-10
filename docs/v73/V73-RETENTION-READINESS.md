# V73 — Données de rétention : ce que le futur moteur pourra consommer

> **Le Retention Engine n'est pas construit ici, et rien dans ce document ne le construit.**
> Aucune planification adaptative, aucun calendrier de révision, aucun score de mémoire.
>
> **Aucune donnée d'apprenant non plus.** Ce document décrit des **contacts programmés par le
> curriculum** — ce que le parcours *prévoit*, jamais ce qu'un humain a fait. `progress.json`
> n'existe pas et n'a pas été créé.

---

## 1. Le modèle de contacts

Un **contact** est un moment où le parcours met l'apprenant devant une notion. Cinq natures,
toutes lues dans des **déclarations** (règle S1 du contrat) :

| nature | définition |
|---|---|
| `firstExposure` | première journée de travail liant une leçon qui porte la compétence |
| `guidedPractice` | journée de travail portant un exemple guidé |
| `independentPractice` | journée de travail portant au moins un exercice déclaré |
| `application` | journée de **production** — « Projet N — … », « DocSense : … », ou `project` renseigné |
| `reviewContact` | journée de revue — depuis le CP7, **rappel actif** et non relecture |

Artefact machine-readable : **`docs/v73/retention-contacts.json`**, produit par
`scripts/v73/cp8-retention.mjs`, rejouable.

---

## 2. Les cinq anomalies, définies avant d'être cherchées

| anomalie | définition opposable |
|---|---|
| `ABANDON_PRÉMATURÉ` | aucun contact pendant les **≥ 180 derniers jours** |
| `RÉPÉTITION_LOCALE` | **≥ 80 %** des contacts tiennent dans une fenêtre **≤ 45 jours** |
| `SILENCE_EXCESSIF` | un intervalle **≥ 120 jours** entre deux contacts |
| `RAPPEL_TROP_PROCHE` | médiane des écarts revue ↔ dernier contact de travail **≤ 2 jours** |
| `ABSENCE_DE_TRANSFERT` | **aucune** journée de production sur toute la compétence |

Ces seuils sont écrits **avant** la mesure et ne sont pas déplacés.

---

## 3. La table des vingt compétences

`1er` = première exposition · `guidé` = premier exemple guidé · `prat` = première pratique
autonome · `appli` = première production · `rev` = nombre de revues · `silence` = jours sans
contact après le dernier · `maxGap` = plus grand intervalle · `fen80` = fenêtre contenant 80 %
des contacts · `écartRev` = médiane revue ↔ dernier contact · `niv` = niveau attendu maximal

| compétence | 1er | guidé | prat | appli | rev | dernier | silence | maxGap | fen80 | écartRev | niv |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `algo` | 15 | 48 | 15 | — | 8 | 365 | 0 | **204** | 344 | 3 | 3 |
| `ds` | 30 | — | 30 | — | 1 | 351 | 14 | **316** | 4 | 1 | 2 |
| `jsts` | 4 | 110 | 4 | 45 | 9 | 117 | **248** | 38 | 99 | 1 | 4 |
| `python` | 82 | 138 | 82 | 141 | 7 | 182 | **183** | 38 | 54 | 1 | 4 |
| `gitlinux` | 1 | 73 | 1 | — | 3 | 77 | **288** | 51 | 72 | 4 | 2 |
| `http` | 50 | 60 | 50 | 61 | 7 | 336 | 29 | **163** | 250 | 1 | 4 |
| `sql` | 55 | 60 | 55 | 61 | 3 | 152 | **213** | 63 | 84 | 1 | 3 |
| `se` | 40 | 74 | 40 | 45 | 13 | 329 | 36 | **148** | 251 | 1 | 3 |
| `archi` | 44 | 60 | 44 | 47 | 14 | 365 | 0 | **141** | 267 | 1 | 3 |
| `patterns` | 38 | — | 38 | — | 1 | 352 | 13 | **276** | 38 | 3 | 3 |
| `ml` | 148 | 174 | 148 | 176 | 7 | 321 | 44 | 71 | 120 | 1 | 3 |
| `dl` | 183 | 194 | 183 | 302 | 8 | 315 | 50 | 57 | 65 | 1 | 2 |
| `llm` | 183 | 194 | 183 | 302 | 8 | 332 | 33 | 57 | 101 | 1 | 3 |
| `rag` | 218 | 228 | 218 | 267 | 8 | 321 | 44 | 36 | 55 | 1 | 4 |
| `agents` | 197 | 202 | 197 | 302 | 6 | 329 | 36 | 57 | 89 | 1 | 3 |
| `evalia` | 157 | 228 | 157 | 176 | 12 | 321 | 44 | 36 | 112 | 1 | 4 |
| `secu` | 67 | 261 | 67 | 85 | 8 | 336 | 29 | **175** | 251 | 1 | 3 |
| `cloud` | 68 | 202 | 68 | 85 | 11 | 336 | 29 | **112** | 134 | 1 | 2 |
| `comm` | 47 | 48 | 71 | 47 | 10 | 365 | 0 | **141** | 247 | 1 | 4 |
| `autonomy` | 44 | 60 | 44 | 113 | 0 | 365 | 0 | **212** | 252 | — | 4 |

---

## 4. Le résultat qui compte, et il n'est pas corrigeable par une retouche

### `RAPPEL_TROP_PROCHE` : 15 compétences sur 20, médiane **1 jour**

Une revue de fin de semaine rappelle ce qui a été vu **la veille ou l'avant-veille**. Ce n'est
pas un défaut de mise en œuvre : **c'est le rythme hebdomadaire lui-même.** Une revue placée le
septième jour de la semaine ne peut pas rappeler autre chose que la semaine qui vient de
passer.

**C'est la raison d'être du Retention Engine, énoncée en une phrase mesurée** : le parcours
sait exposer, faire pratiquer et faire produire, mais **il ne sait pas rappeler à distance**.
Un rappel à 1 jour produit de la reconnaissance ; un rappel à 2 ou 3 semaines produit de la
rétention. Le parcours n'a aujourd'hui aucun mécanisme pour le second.

**V73 ne le corrige pas, et ne doit pas le corriger.** Décaler les revues casserait le rythme
hebdomadaire sans le remplacer ; fabriquer des rappels tardifs à la main dans 52 pages serait
un moteur écrit en dur. **Le seul remède est un moteur qui décide quoi rappeler quand — c'est
V74.**

**Ce que le CP7 lui a préparé** : les 52 revues demandent désormais une **récupération sans
support**. C'est la seule opération dont un moteur peut tirer un signal exploitable — une
relecture ne dit rien de ce qui est retenu, un rappel raté le dit exactement.

---

## 5. Les deux anomalies structurelles **certaines**, corrigées

Le brief impose de ne corriger que ce qui est certain. Deux cas l'étaient, et ils ont la même
cause : **l'étiquette de compétence d'une journée contredisait son sujet** — exactement le
défaut que V72 avait trouvé au jour 320.

| journée | titre | liait | lie désormais |
|---|---|---|---|
| **j351** | **« Révision algo pour entretien »** | 4 leçons de communication | + `algorithmic-thinking`, `data-structures-intro`, `recursion` |
| **j352** | **« Questions système et IA »** | 4 leçons de communication | + `architecture-basics`, `system-design-scaling`, `design-patterns-intro` |

**La justification est dans le texte de la journée**, pas dans une préférence. Le cours de j351
parle explicitement de « manipulation de chaînes/tableaux, recherche, tri, **structures de
données simples**, un peu de complexité ». Celui de j352 dit « les questions IA et **système**
sont là où tu dois EXCELLER ». Ces journées **enseignaient déjà** ces sujets ; elles ne les
liaient simplement à aucune leçon, parce que leur compétence déclarée est `comm`.

**Effet mesuré :**

| | AVANT | APRÈS |
|---|---|---|
| `ABANDON_PRÉMATURÉ` | 6 | **4** |
| dernier contact `ds` | j35 → **330 j de silence** | **j351 → 14 j** |
| dernier contact `patterns` | j76 → **289 j de silence** | **j352 → 13 j** |
| dernier contact `algo` | j365 (mais 211 j de trou) | j365, trou **211 → 204 j** |
| charge j351 / j352 | 158–205 / 154–206 | **230–277 / 226–278**, BALANCED |

**Ce que cette correction ne fait pas, et il faut le dire** : un rappel unique au jour 351
n'efface pas un silence de 316 jours. `ds` et `patterns` restent en `SILENCE_EXCESSIF`, et
c'est juste — le trou existe toujours, il est simplement refermé à la fin plutôt que laissé
ouvert.

---

## 6. Les anomalies **non corrigées**, et pourquoi

### `ABANDON_PRÉMATURÉ` restant : `jsts` (248 j), `gitlinux` (288 j), `sql` (213 j), `python` (183 j)

**Ce sont très probablement des artefacts de déclaration, pas des abandons réels.** L'apprenant
écrit du TypeScript tous les jours jusqu'au jour 365 — le projet DocSense est une application
TypeScript — et manipule Git en permanence. Ce que la mesure voit, c'est que **les journées de
la seconde moitié lient des leçons qui ne déclarent pas `jsts` ni `gitlinux`**.

Corriger cela demanderait soit de rattacher `javascript-basics` à des journées DocSense — ce
qui serait une insertion mécanique sans que le sujet la porte —, soit de changer les
compétences déclarées de dizaines de leçons. **Aucune des deux n'est une anomalie structurelle
certaine**, et le brief interdit de transformer chaque anomalie en changement.

### `ABSENCE_DE_TRANSFERT` restant : `algo`, `ds`, `gitlinux`, `patterns`

Ces quatre compétences n'ont **aucune journée de production**. C'est vrai et c'est cohérent :
on ne livre pas un projet « d'algorithmique », on s'en sert. Le transfert existe, mais il est
**diffus** — chaque projet écrit du code qui utilise des structures de données.

**La limite du modèle est ici, et elle est déclarée** : le modèle de contacts voit ce que le
curriculum **déclare**, pas ce que l'apprenant **fait**. Un moteur de rétention devra soit
accepter cette limite, soit s'appuyer sur des signaux d'usage réels — qui n'existent pas
aujourd'hui et que V73 s'interdit d'inventer.

### `SILENCE_EXCESSIF` sur les transversales : `archi` (141 j), `secu` (175 j), `comm` (141 j), `autonomy` (212 j), `http` (163 j), `se` (148 j)

**Ce n'est pas nécessairement un défaut.** Ces compétences sont enseignées en deux temps : une
première fois à leur niveau d'introduction, une seconde à un niveau supérieur, des mois plus
tard. `archi` va de j44 à j365 avec un niveau attendu de 3 ; le trou de 141 jours sépare
l'architecture applicative du mois 2 de l'architecture système du mois 10.

**Le brief l'interdit explicitement** : « ne pas supposer que 8 répétitions est trop ou 1
insuffisant ». Un moteur de rétention pourra distinguer *silence subi* et *échelonnement
délibéré* — le curriculum seul ne le peut pas.

---

## 7. Ce que le Retention Engine pourra consommer, précisément

`docs/v73/retention-contacts.json` fournit, **pour chacune des 20 compétences** :

| champ | contenu |
|---|---|
| `firstExposure` | jour de la première rencontre |
| `guidedPractice` | jour du premier exemple guidé |
| `independentPractice` | jour de la première pratique autonome |
| `application` | jour de la première production |
| `reviewContacts` | la liste **complète** des jours de revue |
| `projectContacts` | la liste **complète** des jours de production |
| `lastContact` | dernier contact programmé |
| `gapSequence` | **la suite ordonnée de tous les intervalles** entre contacts |
| `maxGap` | le plus grand intervalle |
| `fenetre80pourcent` | la fenêtre minimale contenant 80 % des contacts |
| `ecartRevueMedian` | médiane des écarts revue ↔ dernier contact de travail |
| `expectedLevel` | niveau attendu maximal déclaré par un mois |
| `anomalies` | les anomalies détectées, avec leur mesure |

**Ce que ce fichier ne contient pas, et ne doit jamais contenir** : un état d'apprenant, une
date de révision, un score de mémoire, une prévision d'oubli. Ce sont des sorties de moteur ;
ici il n'y a que des **entrées**.

### Les six briques que ces données rendent constructibles

| brique | ce que les données fournissent |
|---|---|
| **répétition espacée** | `gapSequence` par compétence — la courbe réelle, pas une hypothèse |
| **planification du rappel** | `reviewContacts` + `ecartRevueMedian` : où le rythme hebdomadaire place déjà des rappels, et à quelle distance |
| **décroissance de maîtrise** | `lastContact` + `maxGap` : depuis quand une compétence n'a pas été touchée |
| **révisions adaptatives** | l'étape 1 des revues (rappel actif, leçons fermées) est le point d'entrée : c'est là qu'un échec de restitution devient un signal |
| **renforcement des compétences faibles** | `anomalies` par compétence, avec le seuil qui l'a déclenchée |
| **maîtrise longitudinale** | `expectedLevel` par compétence, à confronter aux contacts réels |

---

## 8. Ce que le CP8 a modifié

| fichier | changement |
|---|---|
| `scripts/data/days-lessons-v67.mjs` | **deux journées** rattachées à ce que leur titre annonce (j351, j352) |
| `scripts/v73/cp8-retention.mjs` | l'instrument, rejouable |
| `docs/v73/retention-contacts.json` | l'artefact machine-readable |

**Corpus des 128 leçons : inchangé** (`92d5fae6…`). Charge : **362 BALANCED, 3 UNDERLOADED,
0 HEAVY, 0 IMPOSSIBLE** — j351 et j352 restent BALANCED après l'ajout.

### Anomalie de sonde publiée (n° 17)

Le marqueur de journée de production était `^Projet \d`. **Il ratait les trente journées
« DocSense : … »** — c'est-à-dire le projet final, le plus gros livrable des 365 jours. La
conséquence était visible : `dl`, `llm` et `agents` étaient signalées « aucune application »
alors que DocSense est une application de bout en bout qui les mobilise toutes les trois.
Après correction, `ABSENCE_DE_TRANSFERT` passe de **7 à 4**.
