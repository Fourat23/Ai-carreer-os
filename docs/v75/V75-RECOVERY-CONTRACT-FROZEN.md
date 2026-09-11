# V75 — CONTRAT DE RÉCUPÉRATION, GELÉ

> **Gelé au CP1, AVANT toute implémentation.** Aucun seuil, aucun critère de verdict de ce
> document ne sera modifié parce que sa mesure échoue. C'est la règle héritée de V74, et elle
> vaut dans les deux sens : ni relâché pour atteindre `READY`, ni durci après coup pour l'éviter.

---

## 0. Ce que ce contrat n'autorise jamais

Repris du brief, littéralement. Le moteur de récupération ne doit **jamais** :

| # | interdit |
|---|---|
| **R1** | cacher la dette |
| **R2** | supprimer artificiellement des notions dues |
| **R3** | déclarer « maîtrisé » ce qui ne l'est pas |
| **R4** | faire disparaître un échec |
| **R5** | transformer une absence en réussite |
| **R6** | diminuer un arriéré en retirant des concepts de la **mesure** |
| **R7** | modifier les seuils pour obtenir de beaux graphiques |
| **R8** | fabriquer un score de mémoire |
| **R9** | fabriquer une maîtrise |
| **R10** | fabriquer une probabilité d'oubli |
| **R11** | punir l'apprenant parce qu'il a pris du retard |
| **R12** | lui imposer un rattrapage impossible |

Il **peut** : prioriser · différer · condenser · regrouper · proposer · réduire temporairement le
nouveau contenu · réserver du budget · recommander un mode récupération · expliquer les
compromis.

> **La distinction qui porte tout le contrat : `PARKED` ≠ `MASTERED`.**
> Garer une notion, c'est décider de ne pas la planifier aujourd'hui. Ce n'est **ni** l'avoir
> apprise, **ni** l'avoir retirée de la dette. Le §5 en fait un invariant vérifiable.

---

## 1. Le vocabulaire, gelé

### 1.1 `NORMAL_MODE`

> **L'état par défaut.** Le curriculum avance à son rythme nominal, la réactivation prend le
> budget que la journée laisse (règle V74 · CP10, inchangée).

### 1.2 `RECOVERY_MODE`

> **Un état DÉCLARÉ du plan, pas un état de l'apprenant.** Il dit : *« aujourd'hui, l'arbitrage
> penche vers la consolidation plutôt que vers l'acquisition »*.

Il ne dit **rien** de ce que l'apprenant sait, retient ou vaut. Ce n'est ni un diagnostic, ni un
jugement, ni une sanction (R11).

### 1.3 `CATCH_UP`

> **La séquence de journées proposée pour revenir sous contrôle.** Bornée, budgétée,
> recalculable chaque jour, abandonnable sans pénalité.

### 1.4 `CRITICAL_BACKLOG`

> **Le niveau de pression au-delà duquel le produit RECOMMANDE de suspendre le nouveau contenu.**

**Recommande. Jamais n'impose.** L'apprenant reste maître de son parcours — c'est la règle
héritée du CP10 de V74 (« le signal propose, il ne décide pas »).

### 1.5 `PAUSED_CURRICULUM`

> **Un choix de l'apprenant**, jamais du moteur : il accepte de suspendre l'acquisition de
> nouveau contenu le temps de consolider.

Le moteur ne peut que le proposer et l'enregistrer. Il ne peut pas l'activer seul.

### 1.6 `RESUME_PLAN`

> **Le plan proposé au retour après une absence.** Il tient compte de la durée d'absence, de ce
> qui était fragile AVANT le départ, et de ce que le curriculum exige ENSUITE.

### 1.7 `ESSENTIAL`

> **Une notion dont dépend la suite immédiate du parcours.** Critère strictement structurel :
> elle est prérequise d'une journée ou d'un projet à venir dans l'horizon défini au §3.

`ESSENTIAL` est une propriété du **curriculum**, pas de l'apprenant. Deux apprenants au même
point du parcours ont les mêmes notions essentielles.

### 1.8 `DEFERRABLE`

> **Une notion en retard dont rien, dans l'horizon défini, ne dépend.**

Différer n'efface pas : la notion **reste comptée dans l'arriéré total** (R1, R6).

### 1.9 `BLOCKING_CONCEPT`

> **Une notion à la fois `ESSENTIAL` et en retard (`DUE` ou `OVERDUE`).**

C'est l'intersection qui compte, et c'est elle qui déclenche l'urgence — pas le volume.

### 1.10 `BACKLOG_PRESSURE`

> **Une décomposition explicable de la charge d'arriéré. JAMAIS un score opaque.**

Voir §2. Elle rend une **liste de facteurs nommés**, chacun avec sa valeur observée, exactement
comme la priorité du CP3 de V74. Une pression qu'on ne peut pas décomposer n'a pas le droit
d'exister ici.

### 1.11 `RECOVERY_EXIT`

> **Les conditions de sortie du mode récupération, posées AU CP1, avant toute mesure.**

Voir §4. **Aucune de ces conditions ne sera ajustée après simulation** — ce serait `R7`, et c'est
exactement le piège que V74 a nommé `G11`.

---

## 2. `BACKLOG_PRESSURE` — décomposition gelée

La pression est décrite par **cinq facteurs nommés**, tous observables, aucun dérivé d'une
grandeur déclarée `UNMEASURABLE` :

| facteur | ce qu'il compte | pourquoi il pèse |
|---|---|---|
| `bloquantes` | notions `ESSENTIAL` **et** en retard | une notion bloquante empêche la suite ; dix notions différables ne l'empêchent pas |
| `echecsNonRepris` | notions dont la dernière récupération a échoué sans reprise | le signal le plus actionnable du produit (règle CP3 de V74) |
| `volume` | total `DUE + OVERDUE` | la charge brute, jamais seule |
| `minutesRequises` | somme des minutes du scheduler pour l'arriéré | traduit le volume en temps réel disponible |
| `anciennete` | jours depuis la plus ancienne échéance dépassée | distingue un retard d'un jour d'un retard d'un trimestre |

**Règle de composition, gelée :** la pression est **la liste de ces cinq facteurs**, et le mode
est décidé par des **règles nommées** sur ces facteurs (§3). Il n'existe **aucun nombre unique**
appelé « pression ». La décision doit toujours pouvoir se dire en une phrase :

> « Mode récupération activé parce que **4 notions bloquantes** sont en retard et que
> **3 échecs** ne sont pas repris. »

---

## 3. Les quatre modes, et les règles qui les déclenchent

**Horizon gelé** : `HORIZON_ESSENTIEL = 14 jours`. Une notion est `ESSENTIAL` si une journée ou
un projet des 14 prochains jours en dépend. Quatorze jours parce que c'est deux semaines de
parcours — assez pour anticiper, trop court pour que tout devienne essentiel.

| mode | condition (gelée) | effet sur le nouveau contenu |
|---|---|---|
| `NORMAL` | aucune des conditions ci-dessous | inchangé |
| `CATCH_UP` | `bloquantes ≥ 1` **ou** `echecsNonRepris ≥ 3` | inchangé, mais l'arbitrage priorise l'arriéré |
| `RECOVERY` | `bloquantes ≥ 3` **ou** `minutesRequises ≥ 3 × budget du jour` | **réduit** — le produit propose de ralentir |
| `CRITICAL` | `bloquantes ≥ 6` **ou** `minutesRequises ≥ 6 × budget du jour` | le produit **RECOMMANDE** une pause du nouveau contenu |

**Ces seuils sont DÉCLARÉS, pas mesurés.** Aucune donnée d'apprenant réel ne permet de les
calibrer — c'est la même honnêteté que V74 a tenue pour ses minutes et ses poids. Ils sont
publiés en un seul endroit et configurables.

**Pourquoi `bloquantes` et pas `volume` comme critère principal :** un apprenant peut avoir
60 notions en retard dont aucune n'est exigée avant un mois — il n'est pas en difficulté, il est
en avance sur ses révisions. Un autre peut en avoir 4, toutes prérequises de la semaine
prochaine — celui-là est bloqué. **Déclencher sur le volume punirait le premier et manquerait le
second** (R11).

---

## 4. `RECOVERY_EXIT` — posé AVANT toute mesure

On sort du mode récupération quand **les quatre conditions sont réunies** :

| # | condition |
|---|---|
| **E1** | `bloquantes = 0` — aucune notion essentielle n'est en retard |
| **E2** | `echecsNonRepris ≤ 2` |
| **E3** | `minutesRequises ≤ 2 × budget du jour` |
| **E4** | la condition tient **2 jours actifs consécutifs** (anti-oscillation) |

**E4 existe pour empêcher le clignotement**, pas pour retarder la sortie : sans elle, un
apprenant traverserait la frontière chaque jour et le produit lui annoncerait une bonne puis une
mauvaise nouvelle en alternance.

**Ces quatre conditions sont gelées ici, avant la première simulation du CP13.** Si la mesure
montre qu'on n'en sort jamais, **c'est le moteur qu'il faudra corriger, pas le seuil.**

---

## 5. Invariants vérifiables — `PARKED` n'est pas `MASTERED`

| # | invariant |
|---|---|
| **I1** | l'**arriéré total** (`DUE + OVERDUE`) est calculé et exposé **indépendamment** de ce que le plan propose |
| **I2** | `arriéré total = actif + différé + garé`, exactement. Aucune notion ne disparaît de la somme |
| **I3** | garer une notion **ne change ni son statut, ni son échéance, ni son état de rétention** |
| **I4** | aucune commande ne peut écrire « maîtrisé » : les états restent **projetés** (invariant B3 de V74, conservé) |
| **I5** | le nombre montré à l'apprenant comme « en retard » est l'**arriéré total**, jamais une file plafonnée *(défaut P2 du CP0)* |

---

## 6. Critères de verdict, gelés

### 6.1 Conditions BLOQUANTES — un seul manquement interdit `READY`

| # | critère | seuil |
|---|---|---|
| **V1** | le triage d'arriéré est **réellement branché** au produit | une surface le consomme |
| **V2** | le mode récupération est **réellement branché** | une surface l'affiche |
| **V3** | **aucune dette cachée** : `total = actif + différé + garé` | égalité exacte, testée |
| **V4** | l'**arriéré total** est visible par l'apprenant | affiché, non plafonné |
| **V5** | `PARKED ≠ MASTERED` : garer ne modifie aucun état de rétention | testé |
| **V6** | l'arriéré **actif** est borné et soutenable | ≤ budget × un facteur déclaré |
| **V7** | une absence longue (60 j) produit un `RESUME_PLAN` exploitable | testé sur profils I/J/K |
| **V8** | les échecs sont pris en compte, pas effacés | testé |
| **V9** | les 25 défis de transfert sont **accessibles** depuis l'expérience | route + navigation |
| **V10** | les événements sont **déterministes et rejouables** | égalité stricte |
| **V11** | **aucun état inventé** : ni score de mémoire, ni maîtrise, ni probabilité d'oubli | porte `v75:check` |
| **V12** | le **budget quotidien** est respecté, y compris par la récupération | 0 dépassement introduit |
| **V13** | **20 mutations négatives** vues rouges puis restaurées | 20/20 |
| **V14** | `npm test` · `tsc` · `build` · `gates:active` · portes V73, V74, V75 | tous verts |

### 6.2 Conditions NON bloquantes — mesurées et publiées

| # | critère | cible indicative |
|---|---|---|
| `N1` | saturation des profils B et C | **en baisse** depuis 80 % et 92 % |
| `N2` | profils ne revenant jamais sous contrôle | en baisse depuis **11/20** |
| `N3` | part de l'arriéré effectivement garée | mesurée, **non maximisée** |
| `N4` | exercices désambiguïsés (D8) | mesurée, sans choix arbitraire |
| `N5` | délai médian absence → plan de reprise | mesuré |

> **`N3` est non bloquant ET surveillé.** Le brief prévient : *« ne pas gagner en mettant 90 %
> dans PARKED sans logique. »* Mettre l'arriéré au garage ferait chuter l'arriéré actif sans rien
> résoudre — ce serait `R2` et `R6` déguisés. Le CP13 publiera donc **les trois nombres
> séparément** : total, actif, garé.

### 6.3 Échelle de verdict

| verdict | condition |
|---|---|
| `ADAPTIVE_RECOVERY_READY` | `V1 → V14` **tous atteints** |
| `ADAPTIVE_RECOVERY_CANDIDATE` | `V3 → V14` atteints, **V1 ou V2 non atteint** (moteur correct, pas branché) |
| `ADAPTIVE_RECOVERY_FOUNDATION_READY` | `V3`, `V5`, `V10`, `V11`, `V14` atteints, au plus **trois** manquements ailleurs |
| `ADAPTIVE_RECOVERY_NOT_READY` | tous les autres cas |

---

## 7. Hypothèses et incertitudes, déclarées

- **`REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`** — inchangé depuis V72, et **V75 ne le
  changera pas**. Le CP12 prépare l'instrumentation d'une étude ; il ne l'exécute pas ;
- **aucun seuil de ce contrat n'est calibré** sur des données réelles. Tous sont déclarés ;
- **une simulation n'est pas une preuve d'apprentissage** — le CP13 le rappellera dans son titre ;
- **`ESSENTIAL` repose sur le graphe de prérequis de V73**, dont la qualité n'est pas rejugée
  ici. Si le graphe est incomplet, des notions bloquantes seront manquées : c'est une limite
  déclarée, pas un défaut de ce sprint.
