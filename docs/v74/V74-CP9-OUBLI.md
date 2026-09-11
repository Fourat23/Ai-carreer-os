# V74 · CP9 — MODÈLES D'OUBLI

> **Interdiction centrale du brief :**
> *« Si aucune donnée ne permet de calibrer, NE PAS INVENTER. »*
>
> **Résultat du checkpoint :** aucun modèle n'est adopté, et ce n'est pas une dérobade —
> c'est le résultat mesuré. Deux démonstrations indépendantes montrent que **la question ne
> peut pas être tranchée ici**, et la seconde montre qu'elle ne peut même pas être tranchée
> *à hypothèse fixée*.

---

## 1. Ce que le CP9 ne produit pas

**Aucune probabilité de mémoire.** Le CP0 a déclaré cette grandeur `UNMEASURABLE` ; le §2 du
contrat gelé le répète ; le §8.2 l'avait anticipé pour ce checkpoint précis :

> *« aucun paramètre de décroissance ne peut être calibré sur des données réelles ; le CP9 les
> déclarera configurables et publiés, jamais inventés puis présentés comme mesurés. »*

Les cinq candidats produisent une **échéance** — *quand reproposer* — jamais un *« il s'en
souvient à 63 % »*.

`REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`, **inchangé par ce checkpoint.**

---

## 2. Pourquoi les candidats sont dans `scripts/` et non dans `lib/`

Deux raisons, aucune n'est un contournement.

1. **Le brief interdit le quatrième moteur.** Livrer cinq modèles d'espacement dans `lib/`
   ferait exactement cela : cinq échelles concurrentes, sans arbitre. Le CP9 demande de
   *comparer* et de *documenter*, pas d'embarquer.
2. **La règle C11 de `v651:check` l'interdirait, et elle aurait raison.** Elle vérifie qu'aucun
   fichier de `lib/` hors `review.mjs` et `retention.mjs` ne définit sa propre échelle —
   tableau d'intervalles, facteur de facilité, arithmétique SM-2. Les candidats en contiennent
   par construction. **Le bon endroit pour une étude est l'étude, pas la bibliothèque du
   produit.**

Une seule ligne de produit a changé : `planifier` accepte désormais un paramètre
`echeanceDeOf`, dont la valeur par défaut est `echeanceDe`. Le comportement est strictement
inchangé (un test le garde). Ce point d'injection existe pour éprouver les candidats **sur le
même ordonnanceur** — sans quoi j'aurais comparé cinq ordonnanceurs au lieu de cinq modèles.

---

## 3. Le piège que ce checkpoint tendait, et qu'il fallait nommer AVANT de coder

L'apprenant simulé du CP8 réussit avec une probabilité **indépendante de l'intervalle** :

```js
outcome: alea() < pReussite ? 'recalled' : 'failed'
```

**Dans ce monde, l'oubli n'existe pas.** Y classer des modèles d'oubli selon « le taux de rappel
obtenu » aurait mesuré l'hypothèse de mon propre simulateur, et l'aurait présentée comme une
propriété des modèles. C'est exactement le motif des anomalies n° 1, 4, 6, 7 et 9 de ce sprint :
*une sonde qui mesure une chose et conclut sur une autre.*

L'alternative — doter l'apprenant simulé d'une courbe d'oubli — est **circulaire** : elle
favorise mécaniquement le modèle dont la forme ressemble le plus à la courbe injectée.

D'où la structure du checkpoint : **comparer d'abord ce qui est observable sans hypothèse
(§4), puis démontrer que le reste est indécidable (§5)** — au lieu de désigner un gagnant.

---

## 4. A · Ce qui EST comparable sans hypothèse : les propriétés de planification

Ces grandeurs ne dépendent d'aucune théorie de la mémoire. Elles décrivent le comportement de
chaque modèle **comme politique** : combien de retard il accumule, ce qu'il laisse de côté,
quelle dispersion il produit.

**180 jours, budget 20 min/jour, 78 notions rencontrées.**

### Apprenant à 75 % de réussite

| modèle | arriéré j180 | jamais proposées | intervalle médian | p90 | max |
|---|---|---|---|---|---|
| Seuils temporels | 43 | 0 | 4 | 26 | 45 |
| **Leitner (actuel)** | **22** | 0 | 4 | 23 | 75 |
| SM-2 inspiré | 50 | 0 | 3 | 16 | **119** |
| Décroissance exponentielle | 37 | 0 | 5 | 23 | 72 |
| Evidence-aware | **22** | 0 | 4 | 23 | 75 |

### Apprenant à 50 % de réussite

| modèle | arriéré j180 | jamais proposées | intervalle médian | p90 | max |
|---|---|---|---|---|---|
| Seuils temporels | 64 | 0 | 1 | 39 | 68 |
| Leitner (actuel) | 63 | 0 | 1 | 35 | 47 |
| SM-2 inspiré | 60 | 0 | 1 | 32 | 81 |
| Décroissance exponentielle | 58 | 0 | 1 | 35 | 72 |
| Evidence-aware | 63 | 0 | 1 | 35 | 47 |

**Aucun modèle ne produit de famine** (0 notion jamais proposée partout) — c'est la place
réservée du CP8 qui le garantit, indépendamment du modèle.

**Ce que ce tableau permet de dire, et c'est peu** : au taux de 75 %, Leitner accumule le moins
de retard (22 contre 37 à 50 pour les autres), et SM-2 produit un intervalle maximal de **119
jours** — un intervalle dont personne ici ne peut justifier qu'il soit approprié.

### Evidence-aware est AVEUGLE dans cette simulation, et ses chiffres sont donc trompeurs

Ses colonnes sont **identiques** à celles de Leitner, à l'unité près. Ce n'est pas une
équivalence : c'est une **dégénérescence**. La simulation n'injecte aucune preuve
(`evidence: []`), donc `applications` et `transfers` valent 0, donc le multiplicateur vaut
exactement 1, donc le candidat *est* Leitner.

La cause de fond est la **dette D4** du CP0, non payée : `evidence[]` porte `competencyIds`
(20 compétences), jamais `conceptId` (128 concepts). **Le seul candidat qui s'appuierait sur la
donnée la plus objective du produit est aussi celui que le produit ne sait pas alimenter au bon
grain.** Le présenter comme « à égalité avec Leitner » aurait été faux.

---

## 5. B · La démonstration qui compte : le classement n'existe pas

### B1 · Changez d'hypothèse, le classement se retourne

Trois hypothèses d'oubli injectées dans l'apprenant simulé — toutes déclarées, **toutes
également invérifiables** faute de données réelles. Apprenant à 75 %, 180 jours.

| modèle | *aucun oubli* | *exponentiel, S = 7 j* | *palier à 14 j* |
|---|---|---|---|
| Seuils temporels | **1ᵉʳ** (73,8 %) | **5ᵉ** (49,9 %) | 2ᵉ (63,0 %) |
| Décroissance exponentielle | 2ᵉ (73,8 %) | 2ᵉ (50,0 %) | 3ᵉ (63,0 %) |
| Leitner (actuel) | 3ᵉ (73,7 %) | **1ᵉʳ** (50,0 %) | 4ᵉ (61,7 %) |
| SM-2 inspiré | 4ᵉ (73,7 %) | 4ᵉ (49,9 %) | **1ᵉʳ** (63,3 %) |
| Evidence-aware | 5ᵉ (73,7 %) | 3ᵉ (50,0 %) | 5ᵉ (61,7 %) |

**Trois modèles sur cinq occupent la première place selon l'hypothèse retenue**, et « Seuils
temporels » passe du premier au dernier rang. Le classement ne mesure pas les modèles : il
mesure l'hypothèse que j'ai choisi d'injecter.

### B2 · Fixez l'hypothèse, changez la graine : le classement se retourne encore

Ce second test est celui que j'ai failli ne pas faire. Les écarts du tableau B1 sont minuscules
(0,1 à 1,6 point) — avant d'écrire « les modèles se valent », il fallait mesurer le bruit plutôt
que de l'affirmer.

Hypothèse **fixée** (exponentielle, S = 7 j), apprenant à 75 %, seule la graine du générateur
change :

| modèle | rangs obtenus sur 5 graines | taux min | taux max | amplitude |
|---|---|---|---|---|
| Seuils temporels | 5, 1, 1, 2, 1 | 49,9 % | 52,9 % | **2,9 pt** |
| Leitner (actuel) | 1, 4, 3, 4, 3 | 50,0 % | 51,3 % | 1,3 pt |
| SM-2 inspiré | 4, 3, 5, 1, 2 | 49,4 % | 53,3 % | **3,9 pt** |
| Décroissance exponentielle | 2, 2, 2, 3, 5 | 50,0 % | 51,9 % | 1,9 pt |
| Evidence-aware | 3, 5, 4, 5, 4 | 50,0 % | 51,3 % | 1,3 pt |

**Chaque modèle occupe presque tous les rangs.** Et surtout :

> **L'écart ENTRE modèles (0,1 à 1,6 point) est plus petit que la variation d'UN SEUL modèle
> d'une graine à l'autre (1,3 à 3,9 points).**

Le signal est **sous le bruit**. Même à hypothèse fixée, à ce volume de données, aucun
classement n'est soutenable. Publier « SM-2 est le meilleur » sur la base d'une seule graine
aurait été une erreur de sonde — et c'est exactement ce que le tableau B1, seul, invitait à
faire.

---

## 6. Hypothèses, limites et sensibilité de chaque candidat

| candidat | hypothèse de fond | limite décisive | sensibilité aux paramètres |
|---|---|---|---|
| **Seuils temporels** | seule la durée écoulée compte | **ignore totalement l'échec** : une notion réussie 5 fois et une ratée 5 fois reçoivent la même échéance | 4 seuils déclarés ; changer le dernier déplace tout le haut de la distribution |
| **Leitner** *(actuel)* | la série de réussites consécutives résume l'état | **la série est amnésique** : 20 réussites puis 1 échec repart au même point qu'une notion jamais vue | `INTERVALS` en entiers publiés ; aucun flottant qui dérive |
| **SM-2 inspiré** | la difficulté d'une notion est une grandeur stable et estimable | SM-2 règle son facteur sur une **auto-évaluation 0-5** ; le CP0 a montré que ce produit a trop d'auto-déclaration. La version testée le règle sur les issues observées — **ce n'est donc déjà plus SM-2** | très sensible : produit un intervalle max de **119 j** avec des bornes pourtant classiques |
| **Décroissance exponentielle** | la rétention décroît en `exp(−t/S)` | **hypothèse la plus lourde du lot** : c'est la courbe d'Ebbinghaus, obtenue sur des **syllabes sans signification**, pas sur des compétences techniques appliquées | le seuil `0,7` et la stabilité initiale `1,5 j` ne sont calibrés sur **rien** et déterminent pourtant tout |
| **Evidence-aware** | produire avec une notion consolide plus que la rappeler | **dette D4** : `evidence[]` porte `competencyIds` (20), jamais `conceptId` (128) — aveugle au grain où il opère | indéterminable : le candidat ne reçoit aucune donnée dans l'état actuel du produit |

---

## 7. Décision : **Leitner (V66) est conservé**, et voici pourquoi ce n'est pas l'inertie

Le §5 interdit de choisir sur la performance : elle n'est pas mesurable ici. Restent des raisons
de **produit**, décidables sans données de mémoire — la même méthode qu'au CP4 pour écarter
SM-2 :

1. **Changer une échelle publiée exige une preuve. Il n'y en a aucune.** Remplacer `INTERVALS`
   sur la base d'un écart de 0,1 point noyé dans 3,9 points de bruit serait précisément
   « transformer une heuristique en vérité scientifique » — interdit par le brief ;
2. **Leitner est explicable en une phrase** : « tu l'as retrouvée trois fois de suite, on
   espace ». Aucun autre candidat ne l'est. La décroissance exponentielle demande d'expliquer
   une constante de temps ; SM-2, un facteur de facilité flottant. Le critère **B10**
   (explicabilité) est bloquant, et il départage là où la performance ne départage pas ;
3. **Leitner n'a pas de paramètre inventé.** Ses paliers sont sept entiers publiés. Les autres
   introduisent entre 4 et 5 constantes qu'aucune donnée ne peut régler — donc autant
   d'occasions de « déplacer un paramètre jusqu'à ce que les statistiques soient jolies »
   (**G11**) ;
4. **Aux propriétés de planification (§4), il n'est jamais le pire**, et il est le meilleur au
   taux de 75 %. Ce n'est pas un argument fort, mais il ne va pas contre.

**Ce qui rendrait cette décision révisable** — écrit maintenant, pour qu'on ne puisse pas
prétendre plus tard que la question n'avait pas été posée :

- des données de rappel d'apprenants **réels** sur au moins plusieurs centaines de tentatives
  espacées, avec l'intervalle réellement écoulé et l'issue objective ;
- le paiement de la **dette D4** (rattacher les preuves au grain concept), qui rendrait le
  candidat *evidence-aware* réellement évaluable — aujourd'hui il ne l'est pas ;
- un écart entre modèles qui **dépasse la variation d'un modèle d'une graine à l'autre**.

Tant que ces trois conditions ne sont pas réunies, **le modèle reste celui de V66, et les cinq
candidats restent une étude consultable** dans `scripts/v74/cp9-oubli.mjs`, paramètres en clair.

---

## 8. Anomalie de sonde n° 10 — deux tests aveugles, trouvés par mutation

Les dix tests du CP9 passaient du premier coup. Quatre mutations ont donc été injectées, et
**deux ne faisaient rougir personne** :

| mutation | pourquoi elle était invisible |
|---|---|
| inverser le signe du terme d'échec dans le facteur de facilité de SM-2 | le test comparait une série de 3 réussites à une série **cassée** (`consecutiveSuccesses: 0`). Or `sm2` court-circuite : `serie === 0` rend 1 jour **sans jamais consulter le facteur**. Toute l'arithmétique qui distingue SM-2 des autres candidats n'était couverte par rien |
| neutraliser le bonus d'`evidence-aware` | *(celle-ci a bien rougi — mais seulement après qu'une première tentative de mutation s'est révélée être un no-op arithmétique : `1 * 0 + 1` vaut `1`. Une mutation qui ne mute rien ne prouve rien, et j'avais failli la compter comme une vérification)* |

Un test a donc été ajouté : **à série CONSTANTE, faire varier le seul historique d'échecs**, ce
qui force le passage par le facteur.

**Et il a fallu le corriger une fois de plus.** Avec 3 réussites, le facteur de facilité atteint
son **plafond** (2,8) ; un plafond absorbe les écarts, et l'inversion de signe y restait
invisible. La fixture a été ramenée à **2 réussites** (facteur 2,7, sous le plafond) — la
mutation rougit alors.

Trois enseignements de méthode, valables au-delà du CP9 :

1. **un court-circuit en amont (`if serie === 0`) rend inatteignable tout le code en aval** —
   un test qui passe par la branche courte ne teste pas la branche longue ;
2. **une valeur bornée teste mal** : une fixture posée sur un plafond ou un plancher masque
   toute variation du calcul qui l'alimente ;
3. **une mutation doit être vérifiée comme mutation.** `1 * 0 + 1` ne change rien ; croire
   qu'une suite « résiste » à une non-mutation est pire que ne pas avoir muté du tout.

---

## 9. Les quatre mutations, après correction des sondes

| mutation | tests rouges |
|---|---|
| le défaut de `planifier` n'est plus `echeanceDe` (le produit change de modèle) | **1** |
| un candidat expose une probabilité de mémoire | **1** |
| `evidence-aware` devient insensible aux preuves | **1** |
| un échec **allonge** l'échéance SM-2 | **1** |

Toutes restaurées : **10 / 10** sur le fichier, **1531 / 1531** sur la suite.

---

## 10. Fichiers

**Créés** : `scripts/v74/cp9-oubli.mjs` (5 candidats + comparaison + sensibilité),
`tests/v74-oubli.test.mjs`, ce document.

**Modifiés** : `lib/retention-scheduler.mjs` (paramètre `echeanceDeOf`, défaut inchangé),
`scripts/v74/cp8-espacement.mjs` (injection `echeanceDeOf` et `oubli` dans la simulation).
