# V75 · CP13 — Simulation adversariale : vingt profils, AVANT et APRÈS

> **Une simulation n'est pas une preuve d'apprentissage.** Les vingt profils sont
> des automates : ils réussissent selon une probabilité fixe, ils n'apprennent
> pas, ils n'oublient pas vraiment. Ce qui est mesuré ici est le **comportement
> du moteur** face à des trajectoires plausibles — rien de plus, et c'est déjà
> beaucoup, parce que c'est la seule chose vérifiable sans participants.
>
> `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED` reste inchangé.

---

## 1. Ce que ce checkpoint refusait de faire

Le brief nomme lui-même le piège :

> *total backlog = 100 · active = 5 · parked = 95 — **n'est PAS automatiquement bon.***

Un moteur qui gare 95 notions sur 100 affiche des chiffres superbes et n'a rien
résolu. La mesure ne pouvait donc pas se limiter à *« l'arriéré actif a-t-il
baissé »* : elle devait répondre à **pourquoi** les notions sont garées,
**combien de temps** elles le restent, et **si le garage peut se vider**.

Trois scripts, parce qu'une seule mesure ne suffisait pas :

| script | question |
|---|---|
| `scripts/v75/cp13-adversarial.mjs` | les 20 profils, AVANT → APRÈS, sur 365 jours |
| `scripts/v75/cp13-sortie.mjs` | **la sortie de récupération est-elle atteignable ?** |
| `scripts/v75/cp13-rotation.mjs` | « jamais placée en actif » est-il de la famine ? |

Les deux derniers n'étaient pas prévus. Ils existent parce que le premier a
produit deux chiffres qu'il aurait été malhonnête de publier seuls — §6 et §8.

### Méthode

Pour chaque profil, la chaîne **complète** est rejouée aux instantanés :
projection mémoire → tri de l'arriéré (CP5) → mode (CP6) → arbitrage → plan
unifié (CP11). Les faits sont coupés à la date de l'instantané ; rien n'est
reconstruit à la main.

**Limite déclarée** : les instantanés sont pris **tous les 15 jours**. Rejouer
365 fois la chaîne pour 20 profils coûterait des heures pour une précision que
la question ne demande pas. Les conséquences de ce pas sont écrites en §8 — et
elles ont changé une conclusion.

---

## 2. BEFORE → AFTER, les vingt profils

`AV` = mesure du CP0 (V75 sans moteur de récupération) · `AP` = après V75.

| # | profil | renc. | arriéré max AV | arriéré max AP | actif max | garé max | final AV | final AP | retour AV |
|---|---|---|---|---|---|---|---|---|---|
| A | parfait | 121 | 11 | 9 | 8 | 1 | 0 | 0 | 3 j |
| B | irrégulier | 106 | 85 | 79 | 8 | 58 | 81 | 79 | **jamais** |
| C | nombreux échecs | 121 | 111 | 109 | 8 | 88 | 103 | 109 | **jamais** |
| D | faible activité | 58 | 32 | 31 | 8 | 16 | 32 | 31 | **jamais** |
| E | rapide | 121 | 31 | 25 | 8 | 13 | 0 | 0 | 27 j |
| F | oublis sélectifs | 121 | 20 | 20 | 8 | 4 | 17 | 20 | **jamais** |
| G | reprise après 30 j | 107 | 43 | 43 | 8 | 29 | 10 | 6 | 28 j |
| H | sans preuves | 121 | 25 | 19 | 8 | 7 | 2 | 2 | 17 j |
| I | absence 7 jours | 114 | 29 | 26 | 8 | 9 | 8 | 11 | 20 j |
| J | absence 14 jours | 112 | 40 | 31 | 8 | 18 | 7 | 9 | 22 j |
| K | absence 60 jours | 105 | 52 | 51 | 8 | 29 | 22 | 23 | 19 j |
| L | 30 % de réussite | 121 | 120 | 116 | 8 | 84 | 115 | 116 | **jamais** |
| M | 50 % de réussite | 121 | 109 | 104 | 8 | 80 | 105 | 100 | **jamais** |
| N | 70 % de réussite | 121 | 68 | 66 | 8 | 41 | 48 | 48 | **jamais** |
| O | très fort mais intermittent | 96 | 39 | 36 | 8 | 23 | 39 | 36 | **jamais** |
| P | suit les jours, saute la pratique | 121 | 59 | 51 | 8 | 34 | 40 | 39 | **jamais** |
| Q | lit la correction avant d'essayer | 121 | 56 | 55 | 8 | 31 | 35 | 36 | **jamais** |
| R | recall OK, transfert KO | 121 | 16 | 14 | 8 | 4 | 1 | 8 | 7 j |
| S | rapide puis arrêt 90 j | 109 | 58 | 58 | 8 | 49 | 0 | 1 | 57 j |
| T | reprend au jour 250, fondations fragiles | 62 | 47 | 44 | 8 | 22 | 43 | 44 | **jamais** |

### Le résultat le plus important de ce tableau

**L'arriéré total n'a presque pas bougé.** C passe de 111 à 109, L de 120 à 116,
M de 109 à 104. Les écarts viennent de la date d'échantillonnage, pas d'une
amélioration.

**C'est le résultat attendu, et c'est la §3 du contrat qui l'exige :**

> *ne jamais diminuer un backlog en retirant des concepts de la mesure.*

Le moteur de récupération **n'efface rien**. Il change ce qu'on **fait** de la
dette, pas la dette. Un CP13 qui aurait montré « arriéré 120 → 15 » aurait été
la démonstration que le produit ment.

Ce qui a changé est ailleurs : la colonne `actif max` vaut **8 pour les vingt
profils**. Personne ne reçoit une session de 120 notions. La séance est bornée
par `PLAFOND_UNITES`, quelle que soit la dette.

---

## 3. La décomposition finale — trois nombres, jamais agrégés

| # | total | actif | différé | garé | % garé | `I2` |
|---|---|---|---|---|---|---|
| A | **0** | 0 | 0 | 0 | 0 % | ✅ |
| B | **79** | 8 | 13 | 58 | 73 % | ✅ |
| C | **109** | 8 | 13 | 88 | **81 %** | ✅ |
| D | **31** | 8 | 8 | 15 | 48 % | ✅ |
| E | **0** | 0 | 0 | 0 | 0 % | ✅ |
| F | **20** | 8 | 8 | 4 | 20 % | ✅ |
| G | **6** | 6 | 0 | 0 | 0 % | ✅ |
| H | **2** | 2 | 0 | 0 | 0 % | ✅ |
| I | **11** | 6 | 0 | 5 | 45 % | ✅ |
| J | **9** | 8 | 0 | 1 | 11 % | ✅ |
| K | **23** | 8 | 6 | 9 | 39 % | ✅ |
| L | **116** | 8 | 24 | 84 | 72 % | ✅ |
| M | **100** | 8 | 15 | 77 | 77 % | ✅ |
| N | **48** | 8 | 19 | 21 | 44 % | ✅ |
| O | **36** | 8 | 5 | 23 | 64 % | ✅ |
| P | **39** | 8 | 10 | 21 | 54 % | ✅ |
| Q | **36** | 8 | 9 | 19 | 53 % | ✅ |
| R | **8** | 7 | 0 | 1 | 13 % | ✅ |
| S | **1** | 1 | 0 | 0 | 0 % | ✅ |
| T | **44** | 8 | 14 | 22 | 50 % | ✅ |

**`I2` (`total = actif + différé + garé`) tient aux 480 instantanés, pour les
vingt profils.** Aucun champ `backlog` unique n'existe nulle part dans la
chaîne : les trois nombres la traversent séparément, du tri jusqu'à la page.

**81 % de garé pour C** est le chiffre que ce checkpoint devait justifier ou
retirer. Les §4 à §7 le justifient ; s'ils ne l'avaient pas fait, il aurait
fallu retirer le garage, pas le chiffre.

---

## 4. Anti-gaming (1/4) — POURQUOI les notions sont garées

Une notion n'est garable qu'avec **une condition de blocage nommée et sa
condition de levée**. Jamais parce qu'elle est loin dans la file.

| # | garé max | sans condition | essentielles garées | échecs garés | débloquables (fin) | soupape |
|---|---|---|---|---|---|---|
| A | 1 | 0 | 0 | 0 | 0/0 | 0 |
| B | 58 | 0 | 0 | 0 | 18/58 | 0 |
| C | 88 | 0 | 0 | 0 | 29/88 | 0 |
| D | 16 | 0 | 0 | 0 | 12/15 | 0 |
| E | 13 | 0 | 0 | 0 | 0/0 | 0 |
| F | 4 | 0 | 0 | 0 | 4/4 | 0 |
| G | 29 | 0 | 0 | 0 | 0/0 | 0 |
| H | 7 | 0 | 0 | 0 | 0/0 | 0 |
| I | 9 | 0 | 0 | 0 | 3/5 | 0 |
| J | 18 | 0 | 0 | 0 | 1/1 | 0 |
| K | 29 | 0 | 0 | 0 | 7/9 | 0 |
| L | 84 | 0 | 0 | 0 | 37/84 | 0 |
| M | 80 | 0 | 0 | 0 | 30/77 | 0 |
| N | 41 | 0 | 0 | 0 | 15/21 | 0 |
| O | 23 | 0 | 0 | 0 | 12/23 | 0 |
| P | 34 | 0 | 0 | 0 | 13/21 | 0 |
| Q | 31 | 0 | 0 | 0 | 15/19 | 0 |
| R | 4 | 0 | 0 | 0 | 1/1 | 0 |
| S | 49 | 0 | 0 | 0 | 0/0 | 0 |
| T | 22 | 0 | 0 | 0 | 15/22 | 0 |

Trois colonnes valent **0 sur les 480 instantanés**, et ce sont les trois qui
comptent :

- **aucune notion garée sans condition de retour** — le garage sait toujours
  dire *ce qui* bloque et *ce qui* lèverait le blocage ;
- **aucune notion essentielle garée** — l'ordre du tri (T1 avant T3) rend une
  notion essentielle structurellement non-garable ;
- **aucun échec non repris garé** — un échec vivant est `IMPORTANT` (T2), donc
  jamais parkable. *On ne gare pas ce qui vient d'échouer.*

**La `soupape` n'a jamais servi** (0 pour les vingt profils) : la situation
« tout est garé, rien n'est proposable » ne s'est jamais produite. Elle reste
en place — un filet qui ne sert pas n'est pas un filet inutile.

---

## 5. Anti-gaming (2/4) — le cycle de récupération

| # | NORMAL | CATCH_UP | RECOVERY | CRITICAL | entrées | sorties | jours en récup. | bascules | 1ʳᵉ entrée | 1ʳᵉ sortie |
|---|---|---|---|---|---|---|---|---|---|---|
| A | 19 | 3 | 2 | 0 | 2 | 2 | 30 | 7 | 105 | 120 |
| B | 2 | 2 | 3 | 17 | 1 | 0 | 300 | 5 | 75 | — |
| C | 0 | 4 | 1 | 19 | 1 | 0 | 300 | 2 | 75 | — |
| D | 1 | 2 | 14 | 7 | 1 | 0 | 315 | 5 | 60 | — |
| E | 15 | 3 | 4 | 2 | 2 | 2 | 90 | 10 | 75 | 150 |
| F | 13 | 8 | 3 | 0 | 2 | 1 | 45 | 8 | 315 | 330 |
| G | 7 | 7 | 8 | 2 | 3 | 3 | 150 | 15 | 90 | 150 |
| H | 12 | 6 | 5 | 1 | 3 | 3 | 90 | 11 | 105 | 135 |
| I | 6 | 10 | 7 | 1 | 4 | 4 | 120 | 15 | 105 | 135 |
| J | 6 | 10 | 4 | 4 | 3 | 3 | 120 | 18 | 105 | 135 |
| K | 5 | 7 | 4 | 8 | 3 | 2 | 180 | 12 | 105 | 180 |
| L | 0 | 3 | 1 | 20 | 1 | 0 | 315 | 2 | 60 | — |
| M | 0 | 4 | 0 | 20 | 1 | 0 | 300 | 1 | 75 | — |
| N | 3 | 1 | 4 | 16 | 1 | 0 | 300 | 5 | 75 | — |
| O | 4 | 3 | 10 | 7 | 3 | 2 | 255 | 8 | 75 | 90 |
| P | 2 | 2 | 3 | 17 | 1 | 0 | 300 | 6 | 75 | — |
| Q | 3 | 3 | 6 | 12 | 2 | 1 | 270 | 6 | 90 | 210 |
| R | 15 | 7 | 1 | 1 | 2 | 2 | 30 | 9 | 240 | 255 |
| S | 6 | 7 | 2 | 9 | 2 | 2 | 165 | 6 | 135 | 270 |
| T | 0 | 18 | 1 | 5 | 2 | 1 | 90 | 3 | 270 | 285 |

**Le mode n'est jamais persisté.** Il est recalculé à chaque instantané, `E4`
compris — qui exige de relire la pression du **jour actif précédent**. Un mode
stocké survivrait à la situation qui l'a produit ; c'est l'erreur que le CP6
avait refusée, et le CP13 la vérifie sur 480 recalculs.

### Ce que ce tableau donne et ne donne pas

- **A** (parfait) passe 19 instantanés sur 24 en `NORMAL` : le mode ne se
  déclenche pas tout seul ;
- **M** (50 % de réussite) fait **1 seule bascule en 365 jours** : entré en
  récupération, il y reste — et ne clignote pas ;
- **sept profils entrent sans jamais ressortir** : B · C · D · L · M · N · P.
  C'est la **pathologie n° 1** du brief, et ce tableau ne peut pas la trancher.
  → §6.

---

## 6. Anti-gaming (3/4) — la sortie de récupération est-elle atteignable ?

`scripts/v75/cp13-sortie.mjs`

### Pourquoi cette contre-mesure était obligatoire

Sept profils n'ont jamais quitté la récupération. Deux lectures, aux
conséquences opposées :

1. **le moteur est un piège** — une fois entré, on ne sort plus quoi qu'on
   fasse. Disqualifiant ;
2. **la dette est réelle** — ces automates échouent à 55 % (C), à 70 % (L), ou
   n'ouvrent qu'un jour sur dix (D), **pendant un an, sans jamais changer de
   comportement**. Sortir serait exactement le *« faire disparaître un échec »*
   qu'interdit la §3.

**Aucune des sept trajectoires ne contient de reprise** : il fallait en
fabriquer une. On greffe donc sur chaque profil bloqué une **reprise réelle au
jour 200** — toutes les journées ouvertes, 97 % de réussite, preuves produites,
plus de pratique sautée. Les 199 premiers jours sont **inchangés**, et
**aucun seuil du moteur n'est touché**.

| # | profil | mode au j. 200 | arriéré au j. 200 | quitte RECOVERY après | redevient NORMAL après | mode au j. 365 | arriéré final |
|---|---|---|---|---|---|---|---|
| B | irrégulier | `CRITICAL` | 58 | **90 j** | **150 j** | `NORMAL` | 0 |
| C | nombreux échecs | `CRITICAL` | 70 | **165 j** | **165 j** | `NORMAL` | 4 |
| D | faible activité | `RECOVERY` | 17 | **5 j** | **65 j** | `NORMAL` | 0 |
| L | 30 % de réussite | `CRITICAL` | 75 | **165 j** | **jamais** | `CATCH_UP` | 7 |
| M | 50 % de réussite | `CRITICAL` | 72 | **165 j** | **165 j** | `NORMAL` | 5 |
| N | 70 % de réussite | `RECOVERY` | 13 | **15 j** | **70 j** | `NORMAL` | 0 |
| P | suit les jours, saute la pratique | `RECOVERY` | 22 | **15 j** | **15 j** | `NORMAL` | 0 |

### Verdict

| pathologie | résultat |
|---|---|
| **sortie impossible** | ✅ **aucun profil** — la récupération n'est pas un piège |
| **sortie immédiate** (un bon jour suffirait) | ✅ **aucun profil** — `E4` tient |

**Coût de la sortie : de 5 à 165 jours de reprise réelle.** Le chiffre n'est pas
flatteur et c'est le bon : une dette d'un an ne s'efface pas en une semaine, et
un moteur qui l'effacerait mentirait.

### Le détail qui vaut la peine d'être lu — L, 30 % de réussite

```
| jour | mode       | total | actif | garé | bloq. |
| 200  | CRITICAL   |   75  |   8   |  59  |   8   |
| 240  | CRITICAL   |   85  |   8   |  72  |   7   |   ← l'arriéré MONTE
| 280  | CRITICAL   |   28  |   8   |  13  |   8   |
| 320  | CRITICAL   |   42  |   8   |  12  |  15   |   ← et remonte
| 360  | CRITICAL   |   18  |   8   |   7  |   0   |
| 365  | CATCH_UP   |    7  |   7   |   0  |   0   |
```

**La descente n'est pas monotone, et ce n'est pas un défaut.** L rattrape *en
même temps qu'il avance* : chaque journée reprise expose de nouvelles notions
qui deviennent dues à leur tour. Un moteur qui afficherait une courbe
descendante régulière aurait cessé de compter le nouveau contenu.

L est aussi le seul à ne pas revenir à `NORMAL` en 165 jours : il finit à
`CATCH_UP` avec **7** notions en retard, contre 75 au départ. C'est publié comme
tel, sans arrondi favorable.

### Et le garage ? Il se vide **intégralement**

Comparaison **nominative** des notions garées au jour 200 et de celles encore
garées au jour 365 :

| # | garées au j. 200 | garées au j. 365 | **encore les mêmes** | part libérée |
|---|---|---|---|---|
| B | 42 | 0 | **0** | 100 % |
| C | 53 | 0 | **0** | 100 % |
| D | 8 | 0 | **0** | 100 % |
| L | 59 | 0 | **0** | 100 % |
| M | 55 | 0 | **0** | 100 % |
| N | 2 | 0 | **0** | 100 % |
| P | 9 | 0 | **0** | 100 % |

**Garage bloqué : ✅ aucun profil.** C'est la réponse la plus nette du
checkpoint. Les 81 % de notions garées du profil C ne sont pas une décharge :
**dès que l'apprenant revient, elles reviennent avec lui, toutes.**

---

## 7. Anti-gaming (4/4) — combien de temps une notion reste au garage

| # | notions vues en retard | séjour garé le plus long | garées à TOUS les instantanés | jamais placées en actif |
|---|---|---|---|---|
| A | 34 | 15 j | 6 | 6 |
| B | 105 | 210 j | 20 | 52 |
| C | 121 | **225 j** | 28 | 60 |
| D | 32 | 180 j | 5 | 9 |
| E | 73 | 30 j | 12 | 22 |
| F | 57 | 15 j | 7 | 11 |
| G | 91 | 75 j | 16 | 23 |
| H | 75 | 30 j | 11 | 19 |
| I | 90 | 45 j | 15 | 23 |
| J | 90 | 45 j | 19 | 25 |
| K | 100 | 90 j | 22 | 41 |
| L | 121 | **315 j** | 18 | 62 |
| M | 121 | **270 j** | 36 | 63 |
| N | 120 | 105 j | 23 | 43 |
| O | 87 | 75 j | 18 | 26 |
| P | 118 | 75 j | 26 | 47 |
| Q | 118 | 75 j | 22 | 45 |
| R | 50 | 30 j | 3 | 4 |
| S | 95 | 150 j | 23 | 35 |
| T | 61 | 210 j | 16 | 29 |

**Une notion garée 315 jours d'affilée existe** (profil L). C'est littéralement
la pathologie n° 4 du brief — *« arriéré repoussé indéfiniment »* — et elle est
publiée sans atténuation.

Ce qui la sort du statut de défaut est le §6 : chez L, **59 notions garées sur
59 sont libérées** dès que l'apprenant reprend. Le garage de L est long parce
que **L ne revient jamais**, pas parce que le moteur l'y retient. La distinction
n'est pas rhétorique : elle est mesurée par une contre-mesure qui aurait pu
donner le résultat inverse.

---

## 8. Un chiffre qu'il aurait été malhonnête de publier seul

`scripts/v75/cp13-rotation.mjs`

La colonne **« jamais placées en actif »** monte à 63 (profil M). Lue telle
quelle, elle dit « 63 notions que le produit ne propose jamais » — de la famine.

**Elle ne dit pas cela, et le pas d'échantillonnage en est la cause.** La séance
tient 8 notions ; en 24 instantanés pris **un jour sur quinze**, on n'observe que
192 places. Une notion travaillée le jour 97 mais pas aux jours 90 et 105 est
comptée « jamais active » **alors qu'elle a été proposée**.

`jamaisActive` est donc **une borne supérieure de la famine, pas la famine.**

### La mesure qui tranche

Chaîne complète rejouée **jour par jour** sur 30 jours (à partir du jour 200),
pour les trois profils les plus endettés :

| # | profil | en retard sur la fenêtre | places offertes (8 × 30) | notions **distinctes** travaillées | rotation |
|---|---|---|---|---|---|
| C | nombreux échecs | 81 | 240 | **28** | 0,12 |
| L | 30 % de réussite | 84 | 240 | **18** | 0,07 |
| M | 50 % de réussite | 83 | 240 | **21** | 0,09 |

**Sélection figée (≤ 12 notions distinctes en 30 jours) : ✅ aucun profil.** La
sélection tourne — le moteur ne repropose pas éternellement les huit mêmes.

### Mais la lecture honnête ne s'arrête pas là

**18 à 28 notions distinctes sur 81 à 84 en retard**, en un mois complet : pour
un apprenant très endetté, **les deux tiers de la dette ne sont pas touchés en
trente jours**. Il faut le dire clairement plutôt que se satisfaire du « la
sélection tourne ».

Deux choses l'expliquent, et elles ne sont pas des défauts :

1. **un échec revient vite.** Les intervalles repartent à 1 jour après un échec.
   Un apprenant à 30 % de réussite **repasse** sur les mêmes notions — il
   répète, il n'est pas affamé. C'est cohérent avec les chiffres : L (30 %) ne
   voit que 18 notions distinctes, C (45 %) en voit 28. **Moins on réussit, moins
   on avance en largeur** — c'est exactement ce qu'un moteur de rétention doit
   faire ;
2. **le débit est borné par choix.** 8 unités par jour, 300 minutes par journée.
   Face à 84 notions dues, la conséquence arithmétique est qu'un mois ne suffit
   pas.

**La conclusion réelle de cette mesure** est donc une limite du produit, pas une
tricherie : *à débit constant, un apprenant profondément décroché ne peut pas
être rattrapé sans réduire le nouveau contenu ou allonger la durée.* C'est
précisément ce que proposent le statut `recommande-pause` du CP11 et la
couverture publiée par `couvertureDe` au CP7 — et c'est une **proposition**,
jamais une décision prise à la place de l'apprenant.

---

## 9. Les quatre pathologies nommées par le brief

| # | pathologie | résultat |
|---|---|---|
| 1 | **récupération dont on ne sort jamais** | ⚠️ 7 profils sur ces trajectoires → **✅ tranché** : sortie atteignable pour les 7, en 5 à 165 j (§6) |
| 2 | **sortie trop facile** | ✅ aucun profil — `E4` exige deux jours actifs ; testé aussi négativement au CP6 |
| 3 | **oscillation NORMAL/RECOVERY** | ✅ aucun profil — max 18 bascules sur 24 instantanés (J), jamais une par instantané |
| 4 | **arriéré repoussé indéfiniment** | ⚠️ séjours jusqu'à 315 j → **✅ tranché** : 100 % des notions garées libérées à la reprise (§6) |

### Invariants vérifiés sur les 480 instantanés

| invariant | résultat |
|---|---|
| `I2` — `total = actif + différé + garé` | ✅ 20/20 profils |
| budget quotidien jamais dépassé | ✅ 0 dépassement |
| aucune notion garée sans condition de retour | ✅ 0 |
| aucune notion **essentielle** garée | ✅ 0 |
| aucun **échec non repris** garé | ✅ 0 |
| session bornée à `PLAFOND_UNITES` | ✅ `actif max = 8` pour les 20 |

---

## 10. Les profils critiques, un par un

**B — irrégulier** (3 jours sur 7). Arriéré final 79, dont 58 garés. Entre en
`CRITICAL` au jour 75 et n'en sort plus : ouvrir 3 jours sur 7 pendant un an ne
permet pas de rattraper. À la reprise, revient à `NORMAL` en **150 jours** avec
un arriéré **nul**.

**C — nombreux échecs** (45 % de réussite). Le pire cas du sprint : 109 notions
en retard, **81 % garées**, 0 instantané en `NORMAL` sur 24. Les 88 garées ont
toutes une condition de retour, 29 sont débloquables immédiatement en travaillant
leur prérequis, et **les 53 garées au jour 200 sont toutes libérées** à la
reprise.

**K — absence 60 jours**. Le profil que le brief cite en exemple. Entrée en
récupération au jour 105, **sortie effective au jour 180** — soit ~20 jours après
la fin de l'absence. 3 entrées, 2 sorties : le cycle fonctionne dans les deux
sens. Arriéré final 23, dont 9 garés et **7 sur 9 débloquables**.

**L — 30 % de réussite**. Le plus endetté : 116 notions, séjour au garage le plus
long du sprint (**315 jours**), 20 instantanés sur 24 en `CRITICAL`. Reprise :
`CATCH_UP` avec 7 notions, **100 % du garage libéré**. C'est le profil sur lequel
les deux contre-mesures étaient indispensables.

**M — 50 % de réussite**. **Une seule bascule en 365 jours.** Ni clignotement, ni
hésitation : le produit dit la même chose tous les jours parce que la situation
est la même tous les jours.

**P — suit les jours, saute la pratique**. Aucun exercice tenté, donc **aucun
verdict objectif**. Le produit ne le crédite pas : 39 notions en retard et
jusqu'à **17 notions bloquantes** simultanées, pour un profil qui a pourtant
ouvert ses 365 journées. La règle de V74 tient — *« lu » n'est pas « su »*. À la
reprise, retour à `NORMAL` en **15 jours** : c'est le plus rapide des sept, parce
que sa dette était un manque de preuves, pas un manque de maîtrise.

**Q — lit la correction avant d'essayer**. 75 % de « réussite » déclarée, et
pourtant 36 en retard, 55 au maximum — des chiffres proches de P. La règle `R-b`
de V74 (`correctionSeen`) fait que ces réussites ne valent pas comme rappel actif.
**Le produit n'est pas dupe d'une réussite obtenue en lisant la réponse.**

**R — recall OK, transfert KO**. Arriéré final **8**, le plus bas après les
profils sains. ⚠️ **Et c'est une limite, pas un succès** : le simulateur du CP0
ne produit **aucune tentative de transfert** — le drapeau `transfertKO` du profil
R est **inerte**. Ce que R est censé exposer n'est donc **pas mesuré ici** ; il
l'est par le panneau « Su ici, pas encore ailleurs » du CP10, alimenté par les
`TransferAttempt`. À écrire noir sur blanc plutôt qu'à laisser croire que R est
sous contrôle.

**S — rapide puis arrêt 90 jours**. La trajectoire la plus démonstrative :
garage à **49 notions** pendant l'arrêt, puis arriéré final **1**. Entré,
séjourné, sorti — le cycle complet, sur un vrai décrochage.

**T — reprend au jour 250, fondations fragiles**. 18 instantanés sur 24 en
`CATCH_UP`, un seul `NORMAL` : jamais. 44 en retard à la fin, **15 des 22 garées
débloquables**. Le produit ne déclare pas T « à jour » et ne le punit pas non
plus : il l'oriente vers ce qui débloque le reste.

---

## 11. Ce que ce checkpoint NE montre pas

- **aucun apprentissage.** Les profils sont des automates à probabilité fixe.
  Ils ne progressent pas, ne se découragent pas, n'abandonnent pas ;
- **aucune validation du transfert.** Le simulateur ne produit pas de
  `TransferAttempt` — le profil R est mesuré sur son rappel, pas sur son
  transfert (§10) ;
- **aucune calibration des seuils.** `CATCH_UP` à 1 bloquante, `RECOVERY` à 3,
  `CRITICAL` à 6 restent **déclarés**. Cette simulation montre qu'ils produisent
  un comportement cohérent ; elle ne montre pas qu'ils sont les bons ;
- **aucune preuve que le mode de récupération aide.** Il faudrait un groupe
  témoin sans récupération — c'est le protocole du CP12, et il n'a aucun
  participant ;
- **une résolution de 15 jours.** Une entrée et une sortie séparées de moins de
  15 jours sont invisibles à cette granularité. Les fenêtres critiques du §6 et
  du §8 ont été rejouées à 5 jours et à 1 jour pour cette raison.

---

## 12. Les tests, et la moitié qui compte

`tests/v75-adversarial.test.mjs` — **12 tests**, en deux moitiés.

La première vérifie les invariants. **La seconde est la plus importante** : elle
exige que les détecteurs **sachent crier**. L'anomalie n° 7 de ce sprint reste
l'avertissement — une sonde du CP7 a rendu zéro pour les vingt profils en
imprimant « invariants ✅ 20/20 ». *Une mesure faite sur rien valide tout.*

Trois tests existent donc uniquement pour refuser une sonde aveugle :

- un profil **doit** garer massivement (C : garé max > 20, part > 50 %) ;
- un profil **doit** déclencher « récupération sans sortie » (C), pendant que le
  profil parfait **ne le déclenche pas** ;
- le séjour au garage du pire profil **doit** dépasser celui du profil parfait —
  une mesure qui ne discrimine pas ne mesure pas.

### Trois mutations négatives, vues rougir puis restaurées

| mutation | effet attendu | résultat |
|---|---|---|
| `conditionDeRetour: null` dans le tri (`PARKED` sans condition de levée) | le garage devient une file d'attente déguisée | ❌ **1 test rouge** |
| clamp du bloc `NEW` retiré dans `planUnifie` | le total dépasse le budget de la journée | ❌ **1 test rouge** |
| la reprise du §6 n'améliore plus la réussite | la sortie n'est plus atteignable | ❌ **3 tests rouges** |

Chaque fichier a été restauré et l'arbre revérifié propre après chaque essai.

---

## 13. Artefacts

| fichier | contenu |
|---|---|
| `docs/v75/cp13-adversarial.json` | 20 profils × 24 instantanés, chaîne complète |
| `docs/v75/cp13-sortie.json` | 7 profils repris, mode jour par jour de 200 à 365 |
| `docs/v75/cp13-rotation.json` | 3 profils, chaîne rejouée quotidiennement sur 30 jours |

Les trois scripts sortent en **code 1** si une pathologie apparaît. Aucun n'a
été relâché pour obtenir un résultat vert.

`data/progress.json` **absent** — toute la simulation est en mémoire, aucun état
d'apprenant n'est écrit dans le dépôt.
