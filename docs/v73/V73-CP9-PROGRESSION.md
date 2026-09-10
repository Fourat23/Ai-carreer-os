# V73 — CP9. La progression réelle de J1 à J365

**Résultat en une phrase : `difficulty` ne décrivait pas la journée, il décrivait sa position
dans la semaine.** À partir du jour 91, la suite des 365 valeurs était `3,3,3,3,3,3,2` répétée
quarante fois — une fonction périodique, sans aucune information. Elle est remplacée sur
**234 journées** par une valeur dérivée de sept propriétés du travail demandé. **127 journées
montent, 2 descendent, 105 restent à 3.**

Trois anomalies de sonde ont été trouvées en chemin, dont deux qui dormaient depuis le CP6 et
que seule la fin de la constante a rendues visibles. Elles sont publiées en §7.

---

## 1. L'état d'avant, mesuré avant toute modification

Ces chiffres ont été relevés **au début du CP9, sur le produit intact**. Ils ne sont pas
reconstruits (règle S7).

| | valeur |
|---|---|
| répartition de `difficulty` | **1 : 4 · 2 : 68 · 3 : 280 · 4 : 13 · 5 : 0** |
| plages de valeur constante | **131**, la plus longue = 7 jours (j6-j12) |
| suite à partir de j91 | **`3,3,3,3,3,3,2` — strictement périodique, 40 fois** |
| `hours` | **4.5 sur 365 journées sur 365** |
| découpage horaire | **26 journées**, toutes au mois 1 |
| moyenne mensuelle de `difficulty` | 2,33 · 3,08 · 3,13 · **3,00 ×8** · 2,97 |

**Le constat du CP0 — « difficulty = 3 sur 271 journées consécutives » — était exact mais
en dessous de la vérité.** Ce n'est pas une longue plage constante : c'est une **constante
codée en dur** dans le générateur (`difficulty: 3` pour toute journée planifiée, `2` pour
toute revue). Il n'existait aucune journée 91-365 dont la difficulté ait jamais été décidée.

---

## 2. Les sept facteurs, écrits avant toute mesure

Le brief nomme sept dimensions du travail demandé. Chacune reçoit une mesure **déclarative**
(règle S1 : une propriété structurelle se lit dans une déclaration, jamais dans la prose) et
une échelle 0-1-2. Les seuils ci-dessous ont été fixés avant de regarder le moindre résultat
et n'ont pas bougé ensuite (règle S8).

| # | dimension | mesure | 0 | 1 | 2 |
|---|---|---|---|---|---|
| **F1** | nouveauté conceptuelle | leçons dont le **premier contact de travail** est ce jour, +1 si la journée ouvre une compétence | 0 | 1 | ≥ 2 |
| **F2** | autonomie exigée | recouvrement (Jaccard, mots pleins) entre l'**énoncé de l'exemple guidé** et l'**énoncé de l'exercice** | ≥ 0,50 | > 0 | pas d'exemple guidé |
| **F3** | guidance fournie | mots(exemple guidé) + mots(correction) + 15 × blocs de code du guidé | tercile haut | médian | tercile bas |
| **F4** | complexité technique | profondeur maximale de la chaîne de **prérequis réels** (graphe du CP2) | ≤ 2 | 3-5 | ≥ 6 |
| **F5** | intégration | compétences distinctes portées par les leçons du jour | ≤ 1 | 2 | ≥ 3 |
| **F6** | ambiguïté de la commande | étapes numérotées de l'exercice | ≥ 4 | 2-3 | ≤ 1 |
| **F7** | responsabilité du livrable | — | aucun livrable | livrable autonome | pièce d'un projet nommé |

`score = F1 + … + F7`, entre 0 et 14. **Aucun poids n'a été ajusté** : les sept facteurs
comptent pareil. Ajuster sept poids sur 78 observations serait du sur-apprentissage déguisé
en méthode.

### Ce qui est délibérément exclu de la mesure

Les sections « Ressources », « Mini-quiz », « Consigne d'utilisation de l'IA », « Exercice
bonus », ainsi que les critères de validation rédigés sur mesure, sont présents sur
**exactement les 78 journées de travail des jours 1-90 et sur aucune autre**. Ils mesurent
**la manière dont la journée a été rédigée**, pas la difficulté du travail demandé. Les
inclure aurait fabriqué une marche au jour 91 pour une raison d'auteur, pas d'apprenant.
C'est le piège « mesurer un marqueur au lieu de la propriété » ; il est écarté d'avance.

---

## 3. Comment le score devient une difficulté : calibration sur un jugement humain

Choisir soi-même les quatre bornes de découpage reviendrait à décider le résultat. Les
**78 journées de travail des jours 1-90** portent une `difficulty` **écrite à la main** dans
`scripts/data/`, avant ce sprint et sans rapport avec lui. C'est un jugement humain
indépendant : les bornes y sont calibrées, puis appliquées telles quelles aux jours 91-365.

### Deux calibrations, dont une dégénérée — les deux publiées

| critère | bornes | accord exact | verdict |
|---|---|---|---|
| **A** — minimiser l'erreur absolue | `1 / 4 / 11 / 12` | 48/78 | **DÉGÉNÉRÉE** |
| **B** — appariement des quantiles | **`2 / 4 / 8 / 10`** | 43/78 | **RETENUE** |

**Pourquoi A est rejetée bien qu'elle ait le meilleur accord.** Sur un échantillon
déséquilibré, la fonction en escalier qui minimise l'erreur absolue est celle qui **prédit le
mode partout**. Ses bornes `[1, 4, 11, 12]` placent 360 journées sur 365 au niveau 3 : elle
reconstruit exactement la platitude que le CP9 doit corriger, et elle obtient un meilleur score
précisément *parce qu'elle ne dit rien*. Un critère qui récompense le silence n'est pas un bon
critère. **Il est publié plutôt qu'effacé**, parce que c'est la première chose que j'ai
essayée.

**B place les bornes de sorte que, sur les 78 témoins, la répartition dérivée reproduise la
répartition écrite à la main.** Ce sont ensuite des **seuils de score**, appliqués tels quels
aux 365 journées : la répartition de l'année reste libre — c'est elle qu'on cherche à mesurer.

### Ce que vaut réellement l'accord, dit sans arrondi favorable

| | |
|---|---|
| accord exact | **43 / 78 = 55 %** |
| à un niveau près | **70 / 78 = 90 %** |
| erreur absolue moyenne | **0,55 niveau** |
| écarts | −2 : 2 · −1 : 14 · **0 : 43** · +1 : 13 · +2 : 6 |

**55 % d'accord exact n'est pas un triomphe, et il ne faut pas le présenter comme tel.** Ce
que ce chiffre autorise à dire est précis : la dérivation retrouve le niveau exact d'un humain
une fois sur deux, et se trompe de plus d'un niveau **8 fois sur 78**. C'est assez pour
ordonner 365 journées ; ce n'est pas assez pour arbitrer une journée particulière contre
l'avis d'un auteur. **C'est exactement pour cette raison que les 78 témoins gardent leur
valeur écrite à la main.**

---

## 4. Le résultat

### Répartition

| | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| **AVANT** | 4 | 68 | **280** | 13 | **0** |
| **APRÈS** (écrit) | 4 | 70 | **151** | **95** | **45** |

### La progression, en trois chiffres

| | AVANT | APRÈS |
|---|---|---|
| corrélation `difficulty` × numéro du jour (journées de travail) | — | **0,463** |
| plages de valeur constante | 131 | **198** |
| suite à partir de j91 | **périodique, 40 répétitions** | **non périodique** |

*(0,463 est mesuré sur le produit écrit, jours 1-90 et revues compris. La dérivation appliquée
uniformément aux 365 journées donnerait 0,457 ; l'écart vient des 78 témoins conservés.)*

Les quarante-deux premières journées réécrites, pour donner à voir la forme :
`233333323335542343334233334323233332333333` (j91 → j132).

### Moyenne mensuelle des journées de travail

| mois | AVANT | APRÈS | score | thème |
|---|---|---|---|---|
| 1 | 2,33 | **2,29** | 2,9 | fondations, très guidées |
| 2 | 3,08 | **3,13** | 5,6 | |
| 3 | 3,13 | **3,37** | 7,0 | |
| 4 | 3,00 | **3,33** | 6,6 | |
| 5 | 3,00 | **3,04** | 5,9 | |
| 6 | 3,00 | **3,20** | 6,0 | |
| **7** | 3,00 | **4,08** | 8,7 | LLM |
| **8** | 3,00 | **4,54** | **9,5** | RAG — le mois le plus exigeant de l'année |
| **9** | 3,00 | **4,33** | 9,1 | agents |
| 10 | 3,00 | **3,38** | 7,0 | |
| **11** | 3,00 | **4,21** | 9,1 | production, cloud |
| 12 | 2,97 | **3,45** | 7,3 | entretien, clôture |

**Ce n'est pas une rampe, et c'est voulu.** Le brief l'interdisait explicitement
(« ne pas remplacer par 1,1,1,2,2,2,…,5 »). La courbe obtenue a **deux crêtes** — mois 7-9 et
mois 11 — séparées par un **creux réel au mois 10**, et un mois 12 en retrait. Elle décrit ce
que le parcours demande, pas une esthétique de progression.

**Le creux du mois 5 (3,04) est le seul point qui mérite une question de conception** : il
suit trois mois qui montent et précède un mois 6 à peine plus haut. Le CP10 dira si cela
correspond au thème des semaines concernées.

---

## 5. Ce que la difficulté dérivée fait à la charge — le point sensible du CP9

`difficulty` alimente le modèle de charge du CP6 (fourchettes de pratique par difficulté).
Le remplacer **déplace mécaniquement la charge**. Il faut donc dire lequel des deux chiffres
mesure le produit et lequel mesure le modèle.

| | AVANT le CP9 | APRÈS le CP9 |
|---|---|---|
| journées structurellement IMPOSSIBLE (**L1 ≤ 0**) | 0 | **0** ✅ |
| revues HEAVY ou IMPOSSIBLE (**L2 ≤ 12/52**) | 0 | **0 / 52** ✅ |
| UNDERLOADED non justifiées (**L3 ≤ 20/365**) | 3 | **6** ✅ |
| **journées de travail HEAVY** | 0 | **44** |
| borne haute médiane, journée de travail | 191 | **201** |
| borne haute max | 294 | **341** |

> ### Les trois seuils de charge gelés au CP1 passent tous les trois.
> **Aucune difficulté n'a été baissée pour obtenir ce résultat**, et aucun seuil n'a bougé.

### Les 44 journées HEAVY : ce qu'on a le droit d'en dire

| | |
|---|---|
| répartition | **mois 8 : 18 · mois 9 : 12 · mois 11 : 10** · mois 4, 10, 12 : 1+1+2 |
| difficulté | **19 au niveau 4, 25 au niveau 5** — aucune en dessous |
| dépassement du budget haut (300 min) | min **+2** · médian **+25** · max **+41** |
| revues concernées | **0** |

**Lecture honnête, en deux temps.**

1. **Le produit n'a pas changé.** Ces 44 journées demandaient déjà exactement ce qu'elles
   demandent. Ce qui a changé, c'est que le modèle de charge a cessé de croire qu'elles
   étaient toutes de difficulté 3. **Le « 0 journée de travail en dépassement » publié au CP6
   était une conséquence de la constante**, pas un constat sur le parcours.
2. **Le dépassement est réel mais modéré.** Le budget est une fourchette `[240, 300]` et la
   médiane des dépassements est de **25 minutes sur la borne haute** — c'est-à-dire sur
   l'hypothèse la plus défavorable des deux. Aucune de ces journées n'est structurellement
   impossible : sous les six hypothèses gelées, **aucune n'est IMPOSSIBLE dans au moins quatre**.

**Ce n'est donc pas un défaut à corriger au CP9**, dont le mandat est la progression. C'est un
fait à porter au verdict : **les mois 8, 9 et 11 demandent davantage que les quatre à cinq
heures affichées.** Il est enregistré en §8 comme P1.

### Cohérence difficulté ↔ charge, mesurée

| difficulté dérivée | n | charge haute moyenne |
|---|---|---|
| 2 | 20 | 204 |
| 3 | 153 | **173** |
| 4 | 93 | **235** |
| 5 | 47 | **297** |

La progression 173 → 235 → 297 est nette. **L'anomalie apparente du niveau 2 (204) s'explique
et ne se corrige pas** : 18 de ces 20 journées sont des journées 1-90 écrites à la main, avec
un long exemple guidé, un exercice bonus et un découpage horaire — elles sont **faciles et
copieuses**, ce qui est exactement ce qu'on veut d'un premier mois.

---

## 6. Le reste du mandat : découpage horaire, guidance, autonomie, projets

### 6.1 `hours` — le chiffre le moins informatif du produit

**`hours` vaut 4.5 sur 365 journées sur 365.** En face, la décomposition du CP6 donne des
bornes hautes de **99 à 341 minutes**, soit de 1 h 40 à 5 h 41. L'écart n'est pas un détail
d'affichage : la ligne d'en-tête de chaque journée écrit « Durée : 4.5 h » **y compris sur les
journées que le modèle situe à 1 h 40**.

**Le CP9 ne réécrit pas `hours`, et ce n'est pas un oubli.** Écrire une durée par journée
demande de trancher une question de promesse produit — « 4 à 5 h par jour » est un engagement
affiché — et de choisir entre la borne basse, la borne haute et la fourchette. Inventer un
chiffre serait exactement ce que le brief interdit. **Publié en P1 avec la proposition
précise** (§8).

### 6.2 Découpage horaire

**Présent sur 26 journées, toutes au mois 1** — le CP0 avait raison, et le mécanisme est
identifié : c'est le champ `schedule`, renseigné dans `days-01-15.mjs` et `days-16-30.mjs`,
et jamais ailleurs. Le dispositif est excellent :

> - 0:00-0:45 — Théorie + REPL : teste les 6 falsy…
> - 0:45-1:45 — Exercice A (tarification) en style guards.
> - 1:45-2:00 — Pause.

**Il disparaît au jour 31 et ne revient jamais.** En dériver un pour les 339 autres journées
reviendrait à présenter l'estimation d'un modèle comme une consigne — donc à inventer des
minutes. **Publié en P2** avec ce que le CP6 permettrait d'en faire honnêtement.

### 6.3 Guidance et autonomie : deux faits structurels, mesurés

| fait | mesure |
|---|---|
| journées de travail dont **l'énoncé de l'exercice tient en une phrase** | **290 / 313** |
| journées dont **l'exemple guidé résout déjà la tâche demandée** (Jaccard ≥ 0,50) | **98 / 313** |
| journées **n'introduisant aucune leçon nouvelle** | **244 / 313** |

Le deuxième chiffre est le plus gênant, et il mérite d'être lu littéralement. Au jour 150,
l'exemple guidé annonce : *« Énoncé : détecter une corrélation trompeuse dans un dataset et
expliquer les confondants possibles »*, puis déroule le raisonnement, le code et
l'interprétation. Quatre sections plus bas, l'exercice principal demande : *« Détecte une
corrélation trompeuse dans un dataset, explique les confondants possibles. »* **C'est la même
phrase.** Sur ces 98 journées, la pratique dite « autonome » consiste à refaire ce qui vient
d'être fait devant l'apprenant.

Ce n'est pas nécessairement un défaut — la reproduction guidée est une opération pédagogique
légitime, et la consigne « ferme le pas-à-pas et attaque de mémoire » est écrite en toutes
lettres. **Mais ce n'est pas de l'autonomie**, et la trajectoire de F2 le montre : le
recouvrement est le plus élevé aux **mois 5, 6, 10, 11 et 12**, c'est-à-dire dans la seconde
moitié du parcours, là où l'autonomie devrait au contraire croître.

### 6.4 Complexité des projets : plate sur cinq projets, puis un saut

| projet | journées | mois | difficulté dérivée moyenne | compétences par journée |
|---|---|---|---|---|
| Projet 1 | 3 (j45-47) | 2 | 3,67 | 2,0 |
| Projet 2 | 7 (j61-86) | 3 | 3,43 | 2,4 |
| Projet 3 | 6 (j113-118) | 4 | **3,17** | 1,3 |
| Projet 4 | 6 (j141-146) | 5 | 3,33 | 2,0 |
| Projet 5 | 6 (j176-181) | 6 | 3,67 | 2,5 |
| **Projet 6** | 6 (j267-272) | 9 | **5,00** | **3,0** |
| **DocSense** | **30** (j302-335) | 11-12 | 4,23 | 3,2 |

**Deux faits.**

1. **Les projets 1 à 5 ne progressent pas.** De 3,67 à 3,67 en passant par 3,17 : le
   quatrième mois de projet demande *moins* que le deuxième. Un apprenant qui les enchaîne
   ne rencontre aucune montée d'exigence pendant **136 jours**.
2. **Il y a un trou de 86 jours sans aucune journée de production, entre j181 et j267** —
   c'est-à-dire **exactement sur les mois 7 et 8**, les deux mois les plus exigeants de
   l'année (scores 8,7 et 9,5). Les LLM et le RAG sont enseignés, pratiqués, évalués, et ne
   sont construits nulle part avant le jour 267.

Ces deux faits appartiennent au **CP11** (pratique, projets, transfert), qui les reçoit ici
chiffrés. Le CP9 ne les corrige pas.

---

## 7. Trois anomalies de sonde, publiées

### n° 18 — un facteur mort pendant toute la première mesure

Le découpage en sections coupait aussi bien sur `##` que sur `###`. Or le contenu réel de
`## ✍️ Pratique autonome` vit **entièrement** dans son sous-titre `### Exercice principal` :
la section de niveau 2 ne contenait que l'avertissement « D'abord sans IA ». Conséquence :
**F6 valait 2 sur les 365 journées** — un facteur mort qui n'apportait qu'une constante, ce
que la matrice de corrélation affichait en clair (ligne F6 entièrement à 0,00) — et **F2 ne
mesurait que la phrase du livrable**. Deux facteurs sur sept étaient hors service.

### n° 19 — la sonde de charge ne faisait pas ce que le contrat gelé disait

Le §5.2 du contrat gelé au CP1 dit, mot pour mot : *« Le minutage explicite fait foi. Quand la
section de pratique annonce 90 min, cette valeur **remplace** la fourchette de difficulté. »*
Le code écrivait `Math.max(fourchette, annoncé)` — « la plus grande des deux », pas
« remplace ».

**L'écart est resté invisible deux checkpoints durant** : tant que `difficulty` valait 3 sur
280 journées, la fourchette `[50, 90]` passait presque toujours sous le minutage annoncé, et
les deux formules donnaient le même résultat. Dès que le CP9 a rendu la difficulté
informative, la fourchette `[90, 150]` d'une journée de niveau 5 est passée **au-dessus de ce
que la journée déclare demander** : le modèle a commencé à corriger le produit à la hausse
contre son propre texte, et **44 journées sont devenues HEAVY par cette seule mécanique**.
Le contrat, gelé avant tout cela, tranche.

### n° 20 — la plus coûteuse : 309 journées « annonçaient 30 minutes »

Chacune des 313 journées de travail ouvre sa pratique par la même phrase :

> **D'abord sans IA.** Tente seul au moins **30 minutes**. Ne copie-colle jamais une réponse
> d'IA : lis, ferme, réécris de mémoire.

Ce n'est pas un minutage de la journée : c'est **une règle de méthode identique partout**. Le
scan la ramassait. Résultat : **309 journées sur 365 « annonçaient 30 min »**, ce 30 ne venant
que de cette phrase. Sous l'ancien `Math.max`, sans effet (30 < 50). Sous la formule du
contrat, catastrophique : le modèle a cru que 309 journées demandaient une demi-heure de
pratique, et **133 journées sont devenues UNDERLOADED**.

La phrase est désormais exclue de la portée du minutage, comme le bloc de rappel actif l'avait
été au CP7 (n° 15). Après correction, la répartition des sources est celle que le contrat
décrit : **320 journées à la fourchette de difficulté · 31 à minutage explicite réel ·
14 à portée hebdomadaire**.

> **Ce que ces trois anomalies ont en commun.** Aucune n'était détectable tant que
> `difficulty` était une constante. Une valeur figée ne masque pas seulement l'information
> qu'elle devrait porter : **elle masque les défauts de tout ce qui la consomme.**

### Et une fausse piste, publiée aussi

**F2 a d'abord été défini comme un rapport de volumes** — mots(tâche) / mots(exemple guidé),
« plus le modèle est petit devant la tâche, plus l'apprenant est seul ». Sur ce corpus, ce
rapport a **le signe inverse** de ce qu'il prétend mesurer : les journées 91-365 énoncent leur
exercice en une phrase, obtiennent donc un rapport minuscule et « peu d'autonomie », alors
qu'un énoncé d'une phrase en laisse au contraire davantage. La contradiction se lisait dans la
matrice : **F2 × F6 = −0,30** alors que les deux facteurs devaient aller dans le même sens.
La définition par recouvrement d'énoncés l'a remplacée.

### Les facteurs ne sont pas indépendants, et le prétendre serait faux

| | F1 | F2 | F3 | F4 | F5 | F6 | F7 |
|---|---|---|---|---|---|---|---|
| **F1** | 1,00 | −0,08 | −0,23 | −0,04 | 0,01 | 0,01 | 0,12 |
| **F2** | | 1,00 | 0,36 | 0,00 | 0,15 | −0,05 | **−0,62** |
| **F3** | | | 1,00 | 0,30 | 0,34 | 0,25 | −0,42 |
| **F4** | | | | 1,00 | **0,53** | 0,34 | 0,07 |
| **F5** | | | | | 1,00 | 0,32 | 0,00 |
| **F6** | | | | | | 1,00 | 0,01 |
| **F7** | | | | | | | 1,00 |

Les deux liens forts sont **F4 × F5 = +0,53** (une journée qui empile des prérequis profonds
empile aussi des compétences) et **F2 × F7 = −0,62** (une journée de projet fournit un
pas-à-pas de sa propre tâche). Cela signifie que le score de 14 points **ne porte pas sept
informations indépendantes** — plutôt quatre ou cinq. Le chiffre reste utilisable pour
ordonner ; il ne faut pas lui prêter une précision qu'il n'a pas.

---

## 8. Ce que le CP9 laisse ouvert

| # | constat | pour |
|---|---|---|
| **P1-CP9-1** | **44 journées de travail dépassent le budget haut** (+25 min de médiane), mois 8, 9 et 11. Aucune n'est structurellement impossible. | verdict CP15 |
| **P1-CP9-2** | **`hours` = 4.5 sur 365/365** face à une charge modélisée de 99 à 341 min. Proposition : afficher la fourchette décomposée du CP6 au lieu d'un point, sur les 365 journées. **Décision de promesse produit — non prise unilatéralement.** | CP12 / CP15 |
| **P2-CP9-1** | **Découpage horaire sur 26 journées, toutes au mois 1.** Le champ `schedule` existe et n'est renseigné nulle part après j30. | CP15 |
| **P2-CP9-2** | **98 journées** dont l'exemple guidé résout déjà l'exercice demandé, concentrées dans la seconde moitié du parcours. | CP11 |
| **P2-CP9-3** | **Projets 1 à 5 sans progression d'exigence** (3,67 → 3,17 → 3,67) et **86 jours sans production entre j181 et j267**, sur les deux mois les plus exigeants. | CP11 |
| **limite** | La nouveauté se mesure sur les **leçons liées**. Une journée qui enseigne une notion neuve dans son seul « Cours approfondi », sans leçon de fond, compte F1 = 0. **j137 « SQL avancé : requêtes analytiques » en est le cas net** : lu intégralement, il enseigne les fonctions fenêtre, et il ressort à **Facile/5**. | CP13 |

---

## 9. Ce que le CP9 a modifié

| fichier | nature |
|---|---|
| `scripts/data/days-difficulty-v73.mjs` | **nouveau** — 234 valeurs dérivées |
| `scripts/generate-curriculum.mjs` | la constante `difficulty: 3` devient `DIFFICULTY_V73[n] ?? 3` |
| `scripts/v73/cp9-progression.mjs` | **nouveau** — la dérivation, rejouable |
| `scripts/v73/cp6-charge.mjs` | anomalies n° 19 et n° 20 corrigées |
| `scripts/v73/cp2-graphe.mjs` | publie `prereq` (déjà calculé, jamais écrit) ; anomalie n° 17 corrigée à la source |
| `curriculum/days/*.md`, `data/program.json` | **régénérés** — seule la ligne « Difficulté : … » change |

**Périmètre de l'écriture, et ses deux raisons.**

- **Les jours 1-90 gardent leur `difficulty` écrite à la main.** Ce sont les témoins de la
  calibration : les écraser détruirait la seule référence humaine du sprint, et remplacerait
  un jugement par une dérivation qui ne le reproduit qu'à 55 %.
- **Les 52 revues gardent `difficulty` = 2.** Les 78 témoins sont tous des journées de
  travail : appliquer l'échelle à une revue, c'est extrapoler hors du domaine de calibration.
  La valeur dérivée pour les revues est publiée (8 à trois, 29 à quatre, 15 à cinq) —
  **elle n'est pas écrite**.

**Non-circularité.** `difficulty` n'apparaît dans une journée générée que dans la ligne
d'en-tête, qui précède tout titre `##` et n'est lue par aucune des sept mesures. La dérivation
ne se nourrit pas de son propre résultat.

**Aucune leçon n'a été touchée. Aucun texte de journée n'a été réécrit.**

---

## 10. Vérifications

| contrôle | résultat |
|---|---|
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0** |
| `npm run gates:active` | **0 violation** |
| porte V73 du graphe | **verte** |
| **corpus des 128 leçons** | **`92d5fae6…` INCHANGÉ** |
| invariants | 365 journées · 128 leçons · 365 corrections · 52 semaines · 12 mois |
| **`data/progress.json`** | **toujours absent** |
| **L1** journées structurellement impossibles | **0** ✅ |
| **L2** revues en dépassement | **0 / 52** ✅ |
| **L3** UNDERLOADED non justifiées | **6 / 365** ✅ |
| anomalies du CP8 après correction du graphe | **inchangées** (4 · 4 · 9 · 15) |
