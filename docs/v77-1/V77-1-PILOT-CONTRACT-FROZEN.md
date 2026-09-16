# V77.1 · CP1 — CONTRAT DE PILOTE **GELÉ**

> **Gelé avant toute donnée humaine.** Aucun participant n'est recruté pendant
> V77.1. Ce document fixe ce qui sera regardé **avant** de pouvoir regarder quoi
> que ce soit — c'est la seule façon d'empêcher qu'un résultat décevant soit
> relu comme un succès.
>
> `PROTOCOL_VERSION = V78-PILOT-PROTOCOL-1`
>
> Toute modification d'un champ marqué **GELÉ** exige un **changement de numéro
> de version de protocole** et invalide les sessions déjà conduites sous
> l'ancienne version. On ne corrige pas un protocole en cours de route ; on en
> ouvre un nouveau et on le dit.

---

## 0. Le point le plus important de ce document

Ce pilote **ne mesure pas si AI Career OS fait apprendre.**

Il mesure si le système **sait raconter ce qui s'est passé** quand un humain
traverse la boucle. C'est une question d'instrumentation, pas de pédagogie, et
elle est préalable : une courbe de rétention tracée sur une trace incomplète ne
vaut rien, et on ne peut pas savoir qu'elle est incomplète après coup.

`REAL_HUMAN_LEARNING_EVIDENCE_NOT_MEASURED` **ne bouge pas** pendant V77.1, et ne
bougera pas non plus du seul fait que ce pilote se déroule bien.

---

## 1. Le verdict d'ingénierie de V77, remis sur l'échelle gelée

### 1.1 Ce que le CP0 a mesuré

Le rapport final de V77 porte le label `PRACTICE_OBSERVABILITY_UNIFIED`. Ce label
**n'existe pas** dans l'échelle gelée au CP1 de V77 (§10.2), gelée *avant le
CP2*, c'est-à-dire avant toute implémentation.

L'audit `O1`–`O20` refait au CP0 donne :

| | |
|---|---|
| `O1` — carte canonique **lue par le produit** | ❌ **non atteint** |
| `O18` — export **et suppression** couvrent tout fait nouveau | ⚠️ **partiel** |
| les 18 autres | ✅ atteints |

Re-vérifié au CP1, une ligne, sans relancer la forensique du CP0 :

```
importeurs de lib/practice-model.mjs
  lib/practice-model.d.ts
  scripts/v77-check.mjs
  tests/v77-pilot-readiness.test.mjs
  tests/v77-practice-model.test.mjs
```

**Aucun code produit.** Le critère `O1` dit *« existe **et est lue par le
produit** »*. La carte existe, fait autorité pour la porte et pour deux tests, et
n'est lue par aucune page, aucune route, aucun moteur.

### 1.2 La décision, et le raisonnement qui y mène

L'échelle gelée est :

| verdict | condition |
|---|---|
| `PRACTICE_OBSERVABILITY_READY` | `O1`–`O20` tous atteints |
| `PRACTICE_OBSERVABILITY_CANDIDATE` | `O1`–`O16` atteints, **1 ou 2 lacunes sur `O17`–`O20`** |
| `PRACTICE_OBSERVABILITY_FOUNDATION_READY` | la carte et les niveaux existent, mais **des surfaces importantes restent non traitées** |
| `PRACTICE_OBSERVABILITY_NOT_READY` | tous les autres cas |

- `READY` est exclu : `O1` n'est pas atteint.
- `CANDIDATE` est exclu : il exige `O1`–`O16` **atteints**, et `O1` ne l'est pas.
  Le retenir demanderait de lire `O1` comme « une source unique existe », en
  laissant tomber la seconde moitié du critère **après en avoir vu le
  résultat** — c'est exactement `H14`.
- `FOUNDATION_READY` est exclu par sa seconde clause : les surfaces **sont**
  traitées. Les 13 surfaces de pratique et les 21 surfaces de lecture portent
  chacune une politique explicite.

Il reste la clause résiduelle.

> ## `V77_ENGINEERING_VERDICT_CANONICAL = PRACTICE_OBSERVABILITY_NOT_READY`
>
> **GELÉ.** Par application littérale de l'échelle gelée au CP1 de V77, avec
> `O1` non atteint et `O18` partiel.

### 1.3 Ce que cette décision dit, et ce qu'elle ne dit pas

Elle **ne dit pas** que le travail de V77 n'a pas eu lieu. Les mesures de V77
restent vraies une par une : la quatrième liste blanche a bien été trouvée et
corrigée, les 13 capstones ne sont plus archivés `self`, 5 échecs laissent bien
5 faits, 36 mutations ont bien été vues rouges. Rien de cela n'est repris.

Elle dit que **l'échelle gelée ne possède pas de case** pour « tout atteint sauf
un critère de définition ». C'est un défaut de l'échelle, constaté ici. Et
c'est précisément parce que c'en est un qu'il ne faut pas la retailler
maintenant : une échelle qu'on redécoupe après avoir vu où tombe le résultat ne
mesure plus rien. **L'échelle reste telle qu'elle a été gelée ; le verdict tombe
où il tombe.**

C'est aussi pourquoi `UNIFIED` était pire qu'un verdict sévère : un label hors
échelle empêche de savoir si `O17`–`O20` ont été atteints ou contournés.
`NOT_READY` est comparable ; `UNIFIED` ne l'était pas.

### 1.4 Ce qui n'a PAS été fait pour rattraper le verdict — délibérément

- **`lib/practice-model.mjs` n'a pas été branché dans du code produit.** Un
  import ajouté maintenant pour verdir `O1` après avoir vu `O1` rouge est
  `H14` sous sa forme la plus pure. Si la carte doit être lue par le produit,
  c'est un besoin de produit, pas un besoin de verdict — et il appartient à V78.
- **L'histoire n'est pas réécrite.** `docs/v77/V77-FINAL-REPORT.md` n'est pas
  modifié. Il porte `UNIFIED` ; ce document porte la correction et la raison.
  Effacer le label inventé masquerait la dérive au lieu de la documenter.
- **L'axe humain de V77 reste `REAL_HUMAN_LEARNING_EVIDENCE_NOT_MEASURED`**,
  inchangé et correct.

### 1.5 Les deux lacunes, portées comme entrées de V78

| # | lacune | conséquence pour le pilote |
|---|---|---|
| `L1` | `O1` — la carte des surfaces n'est lue par aucun code produit : elle documente le produit sans le contraindre | une surface pourrait changer de politique sans que la carte bouge. **Aucune conséquence directe sur le pilote** : le scope du CP3 est figé dans une fixture. |
| `L2` | `O18` — `reset` vide la progression mais l'instantané de secours la conserve ; aucune route `DELETE ALL` n'existe | **conséquence directe** : un participant ne peut pas aujourd'hui faire supprimer ses données. **Traité au CP2.** |

---

## 2. La question principale — **GELÉE**

> **Quand une personne réelle traverse la boucle instrumentée de bout en bout —
> PRETEST, leçon, exercice, échec, indice, nouvelle tentative, réussite, rappel
> immédiat, délai, rappel différé, transfert, rapport de confusion — le système
> produit-il une trace complète, non ambiguë et suffisante pour reconstruire ce
> qui s'est passé, sans rien deviner ?**

Les trois mots qui portent tout le poids :

- **complète** — chaque étape traversée a laissé quelque chose ;
- **non ambiguë** — ce qui a été laissé ne peut pas vouloir dire deux choses
  (un fait sait de quel concept il parle, par quel moyen il a été constaté, et à
  quel niveau de preuve il s'arrête) ;
- **sans rien deviner** — la reconstruction n'utilise **que** l'export ; ni la
  mémoire du facilitateur, ni les journaux serveur, ni une inférence.

### 2.1 Ce que la question n'est pas

| ce n'est pas | pourquoi c'est écrit ici |
|---|---|
| « est-ce que le participant a appris ? » | ce design ne peut pas y répondre : pas de groupe témoin, pas de randomisation, `n` d'une poignée |
| « est-ce que le produit est bon ? » | une trace honnête d'un mauvais produit reste une trace honnête |
| « est-ce que les scores montent ? » | aucun score n'existe dans ce produit, et il n'en sera pas fabriqué pour ce pilote |

---

## 3. Les hypothèses — **GELÉES**

Sept hypothèses, toutes **falsifiables**, toutes d'observabilité. Chacune porte
sa condition de falsification, écrite avant d'avoir vu la moindre donnée.

| # | hypothèse | **falsifiée si** |
|---|---|---|
| `H1` | **Chaque étape du protocole laisse au moins un fait, et ce fait est du grain prévu.** | une étape est traversée et ne laisse rien, ou laisse un fait d'un autre grain que celui déclaré dans la fixture du CP3 |
| `H2` | **L'export d'une session suffit à reconstruire l'ordre et le contenu des étapes.** | la reconstruction exige une information absente de l'export (mémoire du facilitateur, journal serveur, inférence) |
| `H3` | **Le délai du rappel différé est vérifié côté serveur.** | une horloge client avancée suffit à faire accepter un rappel différé — `H12` du contrat V77 |
| `H4` | **L'observation ne modifie pas ce qu'elle observe.** | le participant instrumenté voit un énoncé, un indice, un seuil, un corrigé ou un ordre différent de celui que verrait un participant non instrumenté |
| `H5` | **Aucun fait du pilote ne dépasse le niveau de preuve autorisé par sa source et son genre.** | un fait porte un `evidenceLevel` supérieur à `min(NIVEAU_MAX_PAR_SOURCE, NIVEAU_MAX_PAR_KIND)` |
| `H6` | **Les confusions sont catégorisables dans une taxonomie fermée décidée avant le pilote, et `INSTRUCTION_UNCLEAR` se distingue de `CONCEPT_CONFUSION`.** | **plus d'un tiers** des rapports de confusion tombent en `OTHER`, ou deux catégorisateurs indépendants divergent sur plus d'un tiers des rapports |
| `H7` | **Les données d'étude d'un participant sont exportables et supprimables intégralement, et ce qui est exporté correspond mot pour mot à ce que l'interface promet.** | un fichier appartenant à l'apprenant survit à une suppression demandée, ou l'interface promet plus que ce que l'export contient |

> `H4` et `H7` sont les deux hypothèses dont l'échec **arrête le pilote** (§7.2).
> Les cinq autres, si elles tombent, produisent un résultat — un résultat
> négatif est un résultat.

---

## 4. `PRIMARY_OUTCOME` — **UN SEUL, GELÉ**

> ## `PRIMARY_OUTCOME = SESSION_TRACE_RECONSTRUCTABILITY`

**Définition opérationnelle, sans marge d'interprétation :**

Une session est **reconstructible** si, à partir du **seul export de session**,
une personne qui n'a pas assisté à la session peut établir :

1. la **liste ordonnée** des étapes du protocole réellement traversées ;
2. pour chaque étape : le **concept** visé, le **moyen de constat**
   (`sourceType` / `kind`), le **niveau de preuve**, le **résultat**
   (réussi / échoué / non applicable), et l'**instant serveur** ;
3. quelles étapes du protocole **n'ont pas** été traversées — distinguées de
   celles traversées sans résultat ;
4. le `protocolVersion` et l'identifiant de session,

**sans aucune inférence** : toute reconstruction nécessitant de supposer,
d'interpoler, de croiser avec la mémoire du facilitateur ou de lire autre chose
que l'export rend la session **non reconstructible**.

| | |
|---|---|
| **unité d'analyse** | la **session de participant** (pas le fait, pas l'étape) |
| **échelle** | binaire par session — reconstructible / non reconstructible |
| **statistique rapportée** | `sessions reconstructibles / sessions COMPLETE ou PARTIAL` |
| **qui juge** | une personne n'ayant pas assisté à la session, munie de l'export **seul** et de la fixture du CP3 |
| **seuil de succès** | **aucun seuil n'est gelé.** Le chiffre est rapporté tel quel, avec la liste nominative de ce qui a manqué dans chaque session non reconstructible |

### 4.1 `WHY_THIS_ONE` — pourquoi celui-là et pas un autre

**Parce que c'est le seul préalable de tous les autres.** Rétention, transfert,
efficacité, courbes, comparaisons : chacune de ces questions se lit sur la trace.
Si la trace est incomplète ou ambiguë, toutes les réponses sont fausses **et
paraissent justes** — c'est la pire des deux façons de se tromper.

**Parce qu'il est jugeable avec `n = 1`.** Un défaut d'instrumentation est une
propriété du système, pas de la personne. La première session le montre. Aucun
autre candidat n'a cette propriété : tout ce qui touche à l'apprentissage
exigerait une puissance statistique que ce design n'a pas et ne prétendra pas
avoir.

**Parce qu'il est falsifiable sans négociation.** « Quelle information manquait
pour reconstruire l'étape 7 ? » a une réponse ou n'en a pas. Il n'y a pas de
version arrangeante.

**Parce qu'il ne récompense pas la quantité.** Un système qui enregistre tout
sans structure échoue exactement comme un système qui n'enregistre rien : dans
les deux cas il faut deviner.

### 4.2 Les candidats écartés, et la raison

| candidat écarté | raison de l'écarter |
|---|---|
| taux de réussite au rappel différé | mesure le participant, pas l'instrumentation ; et sans témoin, ne veut rien dire |
| écart rappel immédiat → rappel différé | c'est **le** résultat que ce design ne peut pas produire honnêtement ; il est rangé en exploratoire (`E1`) |
| nombre de faits produits par session | récompense le volume ; un système bavard et inexploitable le maximise |
| satisfaction du participant | légitime, mais ne dit rien de la trace ; rangé en secondaire (`S4`) et en confusion (`S3`) |
| couverture des étapes | vrai signal, mais **partiel** : une étape peut laisser un fait et rester illisible. Conservé en secondaire (`S1`) |

---

## 5. `SECONDARY_OUTCOMES` — **GELÉS, au nombre de quatre**

Quatre, volontairement. Une liste longue de secondaires est une façon polie de
n'avoir pas choisi de primaire.

| # | outcome | définition | rapporté comme |
|---|---|---|---|
| `S1` | `STEP_FACT_COVERAGE` | proportion des étapes traversées ayant laissé **le** fait attendu par la fixture | fraction, avec la liste nominative des étapes muettes |
| `S2` | `DELAY_INTEGRITY` | proportion des rappels différés dont le délai **mesuré côté serveur** tombe dans la fenêtre gelée (§6) | fraction + délai réel de chaque session |
| `S3` | `CONFUSION_BY_CATEGORY` | décompte des rapports de confusion par catégorie de la taxonomie du CP5 | tableau de décomptes, **jamais** un taux de satisfaction |
| `S4` | `UNASSISTED_COMPLETION` | proportion des sessions menées à terme **sans** que le facilitateur ait dû contourner un défaut du produit | fraction + description de chaque intervention |

**Aucun secondaire ne peut sauver un primaire raté.** Si
`SESSION_TRACE_RECONSTRUCTABILITY` est mauvais, le pilote a échoué, quel que soit
`S1`–`S4`. C'est écrit ici pour rendre la relecture arrangeante visible si elle
a lieu.

---

## 6. `EXPLORATORY` — **séparés, et sans pouvoir de conclusion**

Ces mesures sont **enregistrées et décrites**, jamais testées, jamais comparées à
un seuil, jamais présentées comme un résultat.

| # | exploratoire | interdiction explicite |
|---|---|---|
| `E1` | résultat du rappel immédiat vs rappel différé | **interdit** d'en tirer une affirmation sur la mémorisation ou l'oubli |
| `E2` | résultat du transfert vs résultat de l'exercice d'origine | **interdit** d'en tirer une affirmation sur la généralisation |
| `E3` | consultation d'indice avant réussite | **interdit** d'en tirer une affirmation sur la dépendance à l'indice |
| `E4` | durée par étape | **interdit** d'en tirer une affirmation sur la difficulté ou l'effort |
| `E5` | résultat du PRETEST vs résultat après leçon | **interdit** d'en tirer un gain d'apprentissage — c'est la formulation même que §0 proscrit |

> Un exploratoire promu en résultat après coup est la définition du *HARKing*.
> Cette liste existe pour que la promotion soit visible si elle est tentée.

---

## 7. Paramètres gelés du protocole

### 7.1 `DELAYED_RETRIEVAL_DELAY` — **GELÉ**

| | |
|---|---|
| **valeur cible** | **24 heures** |
| **unité** | heures, mesurées **d'instant serveur à instant serveur** |
| **fenêtre acceptée** | `[18 h, 36 h]` |
| **hors fenêtre** | la tentative est enregistrée avec son délai réel et marquée `DELAY_OUT_OF_WINDOW` ; elle est **exclue de `S2`**, **conservée dans le primaire** (une session hors fenêtre reste reconstructible), et **exclue de `E1`** |
| **jamais** | le délai n'est **jamais** dérivé d'une horloge client (`H12`, `H3`) |

**Justification — le chiffre n'est pas inventé.** `lib/retention.mjs` porte
`INTERVALS = [1, 3, 7, 16, 35, 75, 160]` jours. Le **premier intervalle du
produit est de 1 jour.** Le pilote observe donc la boucle telle que le produit la
planifie déjà, et non un délai fabriqué pour l'occasion.

**Pourquoi la fenêtre `[18 h, 36 h]`.** Elle laisse le participant revenir « le
lendemain » à une heure quelconque sans invalider sa session, tout en restant
sans ambiguïté du côté du premier intervalle : le deuxième est à 3 jours (72 h),
très loin de 36 h. Une fenêtre plus large aurait mélangé deux intervalles du
produit ; une fenêtre plus étroite aurait transformé un horaire en critère de
validité.

**Pourquoi pas 20 minutes, pourquoi pas 7 jours.** Vingt minutes n'exercent
aucun des mécanismes qui nous intéressent — reprise de session, persistance,
horloge serveur — parce que le participant n'a pas quitté sa chaise. Sept jours
transforment l'attrition en risque dominant pour un pilote de quelques
participants, et ce pilote ne mesure pas la mémoire.

### 7.2 Effectif — **GELÉ**

| | |
|---|---|
| `PARTICIPANTS_TARGET` | **3** |
| `PARTICIPANTS_MIN` | **1** |
| `PARTICIPANTS_MAX` | **5** |

**Justification.** Un défaut d'instrumentation est une propriété du système : la
première session le révèle. Les participants suivants n'apportent pas de
puissance statistique — ce design n'en a aucune et n'en revendiquera aucune — mais
de la **variété de confusion** (`S3`), qui est la seule chose ici qui gagne à être
vue plusieurs fois. Au-delà de 5, on paie du temps humain pour une information
que le protocole ne sait pas exploiter.

### 7.3 Ordre des étapes — **GELÉ**

```
1  PRETEST
2  LESSON
3  EXERCISE_ATTEMPT_FAIL
4  HINT_VIEW
5  EXERCISE_ATTEMPT_RETRY
6  EXERCISE_ATTEMPT_SUCCESS
7  IMMEDIATE_RETRIEVAL
--- délai gelé (§7.1) ---
8  DELAYED_RETRIEVAL
9  TRANSFER
10 CONFUSION_REPORT
11 SESSION_EXPORT
```

L'ordre est gelé. Une session qui le suit dans un autre ordre est
**non interprétable** (§9), sauf pour les étapes `3`–`6` dont le nombre de
répétitions est libre : un participant peut échouer deux fois. Le nombre réel de
tentatives est une donnée, pas une déviation.

### 7.4 Règles de PRETEST — **cadre gelé ici, seuils gelés au CP3**

| situation | décision |
|---|---|
| `PRETEST_HIGH` — le participant réussit déjà le contenu visé | la session bascule sur le **scope de repli** (`algorithmic-thinking`) ; si le repli plafonne aussi, la session est `INVALID` pour cause de plafond, **pas** `ABORTED` |
| `MISSING_PREREQUISITE` — le participant n'a pas les prérequis | la session est arrêtée `INVALID` ; on ne mesure pas l'instrumentation sur quelqu'un qui ne peut pas traverser la boucle |

Les seuils numériques qui déclenchent ces deux cas sont gelés au **CP3**, avec le
scope, parce qu'ils dépendent du contenu retenu.

---

## 8. Règles d'arrêt — **GELÉES**

### 8.1 Statuts de session

| statut | condition |
|---|---|
| `COMPLETE` | les étapes 1 → 11 traversées dans l'ordre gelé, délai dans la fenêtre |
| `PARTIAL` | étapes 1 → 7 traversées, mais le rappel différé n'a pas eu lieu dans les **72 h** suivant l'étape 7 — la session entre dans le dénominateur du primaire |
| `ABORTED` | la session a été interrompue (§8.2) — **hors** du dénominateur du primaire, **comptée et décrite** |
| `INVALID` | la session a eu lieu mais ne peut pas être interprétée (§9) — **hors** du dénominateur, **comptée et décrite** |

> `ABORTED` et `INVALID` sortent du dénominateur mais **jamais du rapport**. Le
> décompte des sessions écartées et la raison de chacune sont publiés à côté du
> primaire. Un pilote qui ne publie que ses sessions réussies ne publie rien.

### 8.2 Arrêt d'une session

On arrête immédiatement, statut `ABORTED`, si :

- le participant demande à s'arrêter, **sans avoir à se justifier** ;
- le participant manifeste de la fatigue ou de la détresse ;
- un défaut du produit bloque la progression et le facilitateur ne peut pas le
  contourner **sans sortir du script** en moins de **10 minutes** ;
- une perte de données est constatée en cours de session ;
- le facilitateur s'aperçoit qu'il a donné une aide hors script.

### 8.3 Arrêt du pilote entier

On arrête **tout le pilote**, on corrige, et on repart sous un
`PROTOCOL_VERSION` neuf si :

| # | déclencheur | pourquoi c'est un arrêt et pas un incident |
|---|---|---|
| `A1` | **2 des 3 premières sessions** sont `ABORTED` pour défaut produit | continuer, c'est dépenser du temps humain pour re-mesurer un défaut déjà connu |
| `A2` | `H4` est falsifiée — l'instrumentation modifie ce qu'elle observe | toutes les sessions déjà conduites deviennent suspectes, y compris celles qui s'étaient bien passées |
| `A3` | `H7` est falsifiée — une donnée d'apprenant ne peut pas être supprimée ou exportée comme promis | c'est un engagement pris envers une personne, pas une métrique |
| `A4` | une donnée d'apprenant est perdue ou exposée | idem |
| `A5` | une session révèle que le `PROTOCOL_VERSION` appliqué n'est pas celui qui est gelé | on ne sait plus ce qu'on a mesuré |

Un arrêt sous `A2`, `A3` ou `A4` **invalide rétroactivement** les sessions déjà
conduites sous la même version de protocole. C'est coûteux, et c'est le prix de
la déclaration préalable.

---

## 9. Données manquantes — **GELÉES**

> ## `ABSENT ≠ ÉCHEC`

| règle | énoncé |
|---|---|
| `M1` | une étape sans fait est **`NOT_OBSERVED`**, jamais `FAILED`. Les deux ont des colonnes distinctes dans tous les tableaux du rapport |
| `M2` | **aucune imputation.** Pas de moyenne, pas de report de la valeur précédente, pas de valeur par défaut |
| `M3` | un rappel différé non effectué n'est **pas** un rappel raté. La session est `PARTIAL` |
| `M4` | un champ absent d'un fait n'est pas reconstruit par inférence. Il est rapporté absent, et il compte **contre** le primaire |
| `M5` | un rapport de confusion vide n'est pas « aucune confusion » : c'est `NOT_OBSERVED` |
| `M6` | une donnée manquante **par choix du participant** (il refuse de répondre) est `DECLINED`, distincte de `NOT_OBSERVED` |
| `M7` | aucune session n'est retirée du rapport après avoir vu son résultat. L'exclusion suit §8.1, et elle est motivée par la **procédure**, jamais par le **résultat** |

---

## 10. Sessions non interprétables — **GELÉES**

Une session est `INVALID` — mesurée, décrite, hors dénominateur — si **l'une**
de ces conditions est vraie :

| # | condition |
|---|---|
| `N1` | le facilitateur a donné une explication, un indice ou une correction absents du script du CP5 |
| `N2` | le participant avait déjà rencontré les exercices exacts du scope (exposition antérieure) |
| `N3` | la session a été conduite sous un `protocolVersion` différent de celui gelé ici |
| `N4` | anomalie d'horloge serveur (saut, recul) pendant la session |
| `N5` | deux participants ont partagé le même fichier de progression, ou un fichier n'a pas été réinitialisé entre deux participants |
| `N6` | le PRETEST plafonne **sur le scope principal et sur le repli** (§7.4) |
| `N7` | le participant n'avait pas les prérequis (`MISSING_PREREQUISITE`) |
| `N8` | le produit a été modifié entre deux étapes de la même session (déploiement, commit, redémarrage avec un code différent) |

---

## 11. Ce que ce contrat interdit de conclure

Même si tout se passe parfaitement, le rapport de V78 **ne pourra pas** écrire :

- « le système fait apprendre » ;
- « la rétention s'améliore » ;
- « le transfert fonctionne » ;
- « les participants ont progressé » ;
- « le produit est prêt » ;
- un pourcentage d'efficacité, un gain, un effet, une taille d'effet.

Il pourra écrire, au mieux :

> « Sur *k* sessions, *j* étaient intégralement reconstructibles à partir du seul
> export. Voici, nommément, ce qui manquait dans les *k − j* autres. »

C'est tout. Et c'est déjà une chose qu'aucune version précédente n'a su dire.

---

## 12. Champs gelés — récapitulatif exécutable

Ces valeurs sont celles que la fixture du CP3 devra porter et que les tests du
CP6 devront pinner **en clair**.

| champ | valeur |
|---|---|
| `PROTOCOL_VERSION` | `V78-PILOT-PROTOCOL-1` |
| `PRIMARY_OUTCOME` | `SESSION_TRACE_RECONSTRUCTABILITY` |
| `SECONDARY_OUTCOMES` | `S1` `STEP_FACT_COVERAGE` · `S2` `DELAY_INTEGRITY` · `S3` `CONFUSION_BY_CATEGORY` · `S4` `UNASSISTED_COMPLETION` |
| `EXPLORATORY` | `E1` `E2` `E3` `E4` `E5` |
| `HYPOTHESES` | `H1`–`H7` |
| `DELAYED_RETRIEVAL_DELAY_HOURS` | `24` |
| `DELAYED_RETRIEVAL_WINDOW_HOURS` | `[18, 36]` |
| `PARTIAL_AFTER_HOURS` | `72` |
| `PARTICIPANTS` | cible `3` · min `1` · max `5` |
| `SESSION_STATUSES` | `COMPLETE` `PARTIAL` `ABORTED` `INVALID` |
| `MISSING_DATA_CODES` | `NOT_OBSERVED` `DECLINED` `DELAY_OUT_OF_WINDOW` |
| `STOP_RULES` | `A1`–`A5` |
| `INVALIDITY_RULES` | `N1`–`N8` |
| `V77_ENGINEERING_VERDICT_CANONICAL` | `PRACTICE_OBSERVABILITY_NOT_READY` |
| `HUMAN_AXIS` | `REAL_HUMAN_LEARNING_EVIDENCE_NOT_MEASURED` — inchangé |

---

## 13. Ce que le CP1 n'a pas fait

- **Aucun code produit modifié.** Le CP1 gèle ; il n'implémente pas.
- **`O1` n'a pas été verdi.** Voir §1.4.
- **Le rapport final de V77 n'a pas été réécrit.** Voir §1.4.
- **Aucun seuil de succès n'a été fixé pour le primaire.** Fixer un seuil avant
  d'avoir la moindre idée de la distribution aurait produit un nombre décoratif,
  et l'unique fonction d'un tel nombre est de permettre de déclarer victoire.
- **Aucun humain n'a été recruté, contacté ou sollicité.**
