# V75 — RAPPORT FINAL
## Récupération adaptative, contrôle de l'arriéré et télémétrie d'apprentissage

> **Verdict : `ADAPTIVE_RECOVERY_CANDIDATE`**
>
> Les quatorze critères bloquants du contrat gelé sont atteints. Ce qui sépare
> ce sprint de `READY` n'est **pas un défaut du code** : c'est qu'aucun être
> humain n'a encore appris quoi que ce soit avec ce produit sous observation.
> `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`.

---

# PARTIE I — CE QU'IL FAUT SAVOIR AVANT TOUT LE RESTE

## 1. La question à laquelle ce sprint répond

Une seule, et elle est concrète :

> *Un apprenant disparaît trente jours. Il revient avec soixante-dix notions
> fragiles et échoue à la moitié de ses exercices. Que fait le produit ?*

Avant V75, la réponse était : **il lui propose la journée suivante comme si rien
ne s'était passé**, et il affiche « 8 notions en retard » alors qu'il y en a 84.

## 2. La règle qui a commandé chaque décision

Le contrat gelé du CP1 interdit dix choses au moteur de récupération. Elles
tiennent en une phrase : **il n'a pas le droit de faire disparaître la dette.**

| interdit | pourquoi c'est tentant |
|---|---|
| cacher la dette | un petit nombre rassure |
| supprimer des notions dues | l'arriéré chute instantanément |
| déclarer « maîtrisé » ce qui ne l'est pas | les graphiques deviennent beaux |
| faire disparaître un échec | l'apprenant se sent mieux, une minute |
| transformer une absence en réussite | le produit paraît efficace |
| diminuer l'arriéré en retirant des concepts de la mesure | c'est indétectable |
| modifier les seuils pour de beaux graphiques | personne ne le verrait |
| fabriquer un score de mémoire, une maîtrise, une probabilité d'oubli | ça fait sérieux |
| punir l'apprenant | ça ressemble à de la rigueur |
| imposer un rattrapage impossible | ça ressemble à de l'exigence |

Ce qu'il **peut** faire : prioriser, différer, condenser, regrouper, proposer,
réduire temporairement le nouveau contenu, réserver du budget, recommander,
expliquer les compromis.

**Toute la difficulté du sprint tient dans cet écart** : entre « différer » et
« faire disparaître », il n'y a parfois qu'un champ de plus ou de moins dans un
objet JSON.

## 3. Le résultat en trois phrases

1. **L'arriéré total n'a presque pas baissé** — et c'est le résultat correct.
   Le profil le plus endetté passe de 111 notions en retard à 109. Le moteur ne
   supprime rien ; il change ce qu'on **fait** de la dette.
2. **Ce qui a changé, c'est la journée** : pour les vingt profils simulés, la
   session active vaut **8 unités au maximum**, quelle que soit la dette.
   Personne ne reçoit une séance de 120 notions.
3. **Rien n'a été validé sur un humain.** Aucun participant, aucune session,
   aucun résultat.

## 4. Comment lire ce rapport

- **Partie I** — l'essentiel (vous y êtes) ;
- **Partie II** — ce que le produit faisait avant, mesuré ;
- **Partie III** — ce qui a été construit, checkpoint par checkpoint ;
- **Partie IV** — ce qui a été mesuré sur vingt trajectoires ;
- **Partie V** — comment on sait que ce n'est pas de la triche ;
- **Partie VI** — ce que le produit dit à l'apprenant, en français ;
- **Partie VII** — les défauts trouvés, y compris les miens ;
- **Partie VIII** — le verdict, critère par critère ;
- **Partie IX** — les limites, et ce qui vient ensuite.

---

# PARTIE II — L'ÉTAT DES LIEUX (CP0)

## 5. Une mesure avant toute décision

Le CP0 est un **audit forensique en lecture seule** : vingt profils d'apprenants
simulés, 365 jours chacun, générateur à graine fixe. Aucun fichier de produit
n'a été modifié, et **aucun seuil d'acceptabilité n'a été posé avant de voir les
chiffres** — les poser après aurait été le contournement que V74 avait nommé
`G11`.

## 6. Les vingt profils

| # | profil | ce qu'il teste |
|---|---|---|
| A | parfait | le cas où rien ne doit se déclencher |
| B | irrégulier (3 j sur 7) | l'irrégularité durable |
| C | nombreux échecs (45 %) | l'échec chronique |
| D | faible activité (1 j sur 10) | la présence minimale |
| E | rapide | la progression |
| F | oublis sélectifs | l'oubli ciblé sur une compétence |
| G | reprise après 30 j | l'absence moyenne |
| H | sans preuves | le travail non prouvé |
| I · J · K | absences de 7 · 14 · 60 jours | la durée de l'absence |
| L · M · N | réussite 30 % · 50 % · 70 % | le gradient de réussite |
| O | très fort mais intermittent | le talent irrégulier |
| P | suit les jours, saute la pratique | **« lu » n'est pas « su »** |
| Q | lit la correction avant d'essayer | la réussite obtenue en trichant |
| R | rappel OK, transfert KO | **« su ici » n'est pas « su ailleurs »** |
| S | rapide puis arrêt 90 j | le décrochage franc |
| T | reprend au jour 250, fondations fragiles | la reprise tardive |

## 7. Les trois faits qui ont commandé le sprint

**Fait 1 — onze profils sur vingt ne reviennent jamais sous contrôle**, et le
produit gère **mieux l'absence que l'échec**. Les absences de 7, 14 et 60 jours
récupèrent toutes en 19 à 22 jours actifs ; l'échec chronique, jamais.

C'est contre-intuitif et c'est important : on construit spontanément un moteur
de reprise pour les gens qui *partent*. Les données disaient de le construire
d'abord pour ceux qui *échouent*.

**Fait 2 — l'arriéré réel n'est jamais montré.** 84 notions en retard,
« **8** » annoncées, **3** cartes affichées. La règle d'or de V75 était donc
**déjà violée** par le produit existant — sans intention, par simple
plafonnement d'affichage.

**Fait 3 — un facteur de priorité sur sept était mort.** `besoinProche`
(15 points sur 100) ne pouvait jamais s'allumer : calculé au grain *compétence*,
lu au grain *concept*. Découvert en corrigeant ma propre sonde.

## 8. Même un apprenant correct ne s'en sortait pas

Le profil **N**, qui réussit **70 %** de ses rappels, saturait à **56 %** de
l'arriéré et ne revenait jamais sous contrôle. Ce n'est pas un cas extrême :
c'est un apprenant normal, et le produit ne savait pas l'aider.

---

# PARTIE III — CE QUI A ÉTÉ CONSTRUIT

## 9. Le contrat gelé (CP1) — décider avant de mesurer

Onze termes définis, quatre modes, une condition de sortie, cinq invariants et
quatorze critères de verdict — **tous posés avant la première ligne de code**.

**La décision qui commande tout le sprint :**

> **`PARKED` n'est pas `MASTERED`.** Garer une notion, c'est décider de ne pas
> la planifier aujourd'hui. Ce n'est **ni** l'avoir apprise, **ni** l'avoir
> retirée de la dette.

Rendue vérifiable par l'invariant `I2` : **`total = actif + différé + garé`,
exactement.**

**`BACKLOG_PRESSURE` n'est pas un score.** C'est une liste de **cinq facteurs
nommés**, et la décision doit pouvoir se dire en une phrase : *« mode
récupération activé parce que 4 notions bloquantes sont en retard et que 3
échecs ne sont pas repris. »*

**Le déclencheur est le nombre de notions bloquantes, pas le volume.** Déclencher
sur le volume punirait l'apprenant en avance sur ses révisions et manquerait
celui qui est réellement bloqué.

**`RECOVERY_EXIT` a été posé avant la première simulation**, avec une condition
anti-oscillation (`E4`, deux jours actifs consécutifs) — sans elle, le produit
annoncerait en alternance une bonne et une mauvaise nouvelle.

## 10. Le modèle événementiel V2 (CP2)

Tout fait du produit porte désormais : horloge **serveur**, `provenance`
obligatoire, vocabulaire **fermé**, `schemaVersion`. Le nouveau mal formé est
**refusé** ; l'ancien reste **accepté**, parce qu'effacer une histoire réelle
serait le même mensonge qu'en inventer une.

## 11. Une preuve porte enfin ses concepts (CP3, CP4)

Une preuve d'exercice ne savait pas dire **quelles notions** elle validait. Le
CP4 a construit une cascade de résolution en quatre règles, **partagée entre la
mesure et le produit** — pour qu'aucune des deux ne puisse dériver de l'autre.

| classe | exercices | signification |
|---|---|---|
| `UNAMBIGUOUS` | **140** | une seule leçon le déclare |
| `MULTI_CONCEPT_BY_DESIGN` | **67** | plusieurs leçons — **et c'est voulu** |
| `RESOLVABLE_FROM_CONTEXT` | **32** | sa journée n'enseigne qu'une leçon |
| `RESOLVED_BY_SKILL` | **12** | une seule leçon du jour partage sa compétence |
| `AMBIGUOUS` | **125** | aucune règle ne tranche — **publié comme tel** |

V74 avait publié « 192 exercices ambigus ». La mesure fine en trouve **125**, et
distingue surtout les 67 qui sont **multi-concepts par conception** — ce qui
n'est pas un défaut, et qu'il aurait été faux de « corriger ».

## 12. Le triage de l'arriéré (CP5) — trier n'est pas soustraire

Quatre classes, servies dans un **ordre qui est lui-même la garantie** :

| classe | règle | ce que l'ordre garantit |
|---|---|---|
| `URGENT` | le parcours en dépend dans l'horizon | **une notion essentielle n'est jamais garable** |
| `IMPORTANT` | un échec non repris | **un échec vivant n'est jamais garable** |
| `PARKED` | un **prérequis** est lui-même en retard | avec sa condition de levée, nommée |
| `DEFERRABLE` | le reste | |

`T1` avant `T3` n'est pas un détail d'implémentation : c'est **ce qui rend
impossible** le « 90 % dans PARKED » dont le brief prévenait.

**Trois places seulement** : `actif`, `differe`, `gare`. Leur somme vaut le
total, toujours.

**La soupape** : si le garage absorbait la totalité de l'arriéré, l'apprenant
n'aurait plus rien à travailler et aucune condition ne pourrait se lever. On
dégare alors tout — **et on le dit**, au lieu de le corriger en silence.

## 13. Le mode de récupération (CP6) — recommander, et ne se souvenir de rien

Quatre modes, trois seuils, une sortie.

| mode | déclencheur |
|---|---|
| `NORMAL` | — |
| `CATCH_UP` | ≥ 1 notion bloquante, **ou** ≥ 3 échecs non repris |
| `RECOVERY` | ≥ 3 bloquantes, **ou** minutes requises ≥ 3× le budget |
| `CRITICAL` | ≥ 6 bloquantes, **ou** minutes requises ≥ 6× le budget |

**Le mode n'est jamais persisté.** Il est recalculé à chaque lecture, `E4`
compris — qui exige de relire la pression du jour actif précédent. Un mode
stocké survivrait à la situation qui l'a produit, et le produit continuerait à
parler d'un problème résolu.

**Le total proposé ne dépasse jamais le total actuel.** Le mode récupération
peut réduire une journée ; il ne peut jamais la rallonger pour rattraper.

## 14. Le plan de reprise (CP7) — non punitif par construction

`planDeRattrapage` **ne reçoit aucun historique de plan**. Ce n'est pas une
politesse : c'est une propriété de type. La fonction **ne peut pas savoir**
qu'une journée a été manquée, donc elle **ne peut pas** le reprocher.

**91 notions en retard ne produisent pas 91 lignes à faire.** Elles produisent
quelques journées courtes, et le reste est **compté et nommé**, jamais effacé.

**La pause du curriculum est une commande de l'apprenant**, et d'elle seule. Un
test vérifie fichier par fichier qu'**aucun module du moteur** ne l'émet.

## 15. La télémétrie devient lisible (CP8)

Quatre défauts que seul le rendu réel montrait — détaillés au §41.

## 16. La dette D10 payée (CP9) — 25 défis de transfert atteignables

Vingt-cinq défis T4/T5 existaient dans le corpus et **aucune route ne permettait
d'y accéder**. Route, pages, exécuteur, entrée de navigation.

Chacun des 25 est vérifié **individuellement**, sur six points :

| vérification | résultat |
|---|---|
| structure valide | **25 / 25** |
| répond en HTTP 200 | **25 / 25** |
| **réussit** avec les bonnes réponses | **25 / 25** |
| **échoue** avec les mauvaises | **25 / 25** |
| produit une preuve valide | **25 / 25** |
| **compté comme transfert par le moteur** | **25 / 25** |

Les deux lignes en gras sont celles qui comptent : un défi qu'on ne peut pas
rater ne mesure rien, et une preuve que le moteur ne compte pas comme transfert
ne sert à rien.

## 17. Le septième fait (CP10) — `TransferAttempt`

Un fait canonique de plus, avec sa `provenance`, son issue **dérivée** (jamais
fournie par l'appelant), son empreinte de réponses stable, son chaînage de
reprises et sa déduplication.

**`TRANSFER_SUCCESS ≠ MASTERY`** : réussir un défi dit *« ce défi-ci a été
réussi »*, pas *« la compétence est acquise »*.

Et surtout, le signal que le CP0 ne pouvait pas voir : **l'échec au transfert**.
Une notion qui tient chez elle et cède ailleurs — le profil R. Le produit
affiche désormais un panneau nommé *« Su ici, pas encore ailleurs »*.

## 18. Le plan unique (CP11) — arbitrer, pas concaténer

Cinq natures se disputaient l'attention sans jamais se parler : `NEW`, `REVIEW`,
`REMEDIATION`, `TRANSFER`, `PROJECT`. Mises bout à bout, elles produisent une
journée de 400 minutes.

**L'ordre de service dépend du mode**, et il est déclaré en un seul endroit :

| mode | ordre |
|---|---|
| `NORMAL` | `PROJECT` → `NEW` → `REVIEW` → `REMEDIATION` → `TRANSFER` |
| `CATCH_UP` · `RECOVERY` | **`REMEDIATION`** → `REVIEW` → `PROJECT` → `NEW` → `TRANSFER` |
| `CRITICAL` | **`REMEDIATION`** → `REVIEW` → `NEW` → `PROJECT` → *(transfert suspendu)* |

**Servir dans cet ordre, c'est arbitrer ; les additionner, ce serait concaténer.**

Et surtout : **le moteur arrive enfin sur la page où l'on travaille.** Avant le
CP11, toute la récupération vivait sur `/retention` ; la page d'une journée n'en
savait rien.

## 19. Le protocole de validation humaine (CP12) — instrumenté, pas exécuté

Sept étapes, et **aucune n'est décorative** :

```
PRETEST → LEARNING → IMMEDIATE_RETRIEVAL → DELAY
        → DELAYED_RETRIEVAL → TRANSFER → CONFUSION_REPORT
```

Elles lèvent trois ambiguïtés précises :

| sans… | une réussite peut signifier |
|---|---|
| mesure **avant** | « j'ai appris » **ou** « je le savais déjà » |
| **délai** | « je retiens » **ou** « c'est encore en mémoire de travail » |
| **transfert** | « je comprends » **ou** « j'ai retenu la forme de la question » |

Le module publie aussi **ce qu'il refuse de collecter** — aucune frappe, aucune
durée de lecture estimée, aucun identifiant de machine, **aucune comparaison
entre apprenants, aucun percentile, aucun classement**.

`etatDeLEtude()` rend **`conclusionPossible: false` en permanence**, quel que
soit l'état d'une session. Ce champ existe pour que personne n'ait à déduire ce
qu'une session autorise à conclure. **Réponse : rien.**

---

# PARTIE IV — CE QUE VINGT TRAJECTOIRES ONT MONTRÉ (CP13)

## 20. La méthode, et sa limite déclarée

Pour chaque profil, la chaîne **complète** est rejouée : projection mémoire →
triage → mode → arbitrage → plan unifié. Les faits sont coupés à la date de
l'instantané ; rien n'est reconstruit à la main.

**Instantanés tous les 15 jours** sur 365 — **480 au total**. Le pas est
déclaré. Il a changé une conclusion (§27), ce qui est la meilleure raison de
l'écrire.

## 21. Le résultat central : l'arriéré n'a pas baissé

| profil | arriéré max AVANT | arriéré max APRÈS |
|---|---|---|
| C — nombreux échecs | 111 | **109** |
| L — 30 % de réussite | 120 | **116** |
| M — 50 % de réussite | 109 | **104** |
| B — irrégulier | 85 | **79** |

Les écarts viennent de la date d'échantillonnage, pas d'une amélioration.

**Un CP13 qui aurait montré « 120 → 15 » aurait démontré que le produit ment.**
Le contrat interdit explicitement de *diminuer un backlog en retirant des
concepts de la mesure* ; le seul moyen honnête de faire chuter ce nombre est que
l'apprenant travaille (§26).

## 22. Ce qui a changé : la journée

`actif max = 8` **pour les vingt profils**, sans exception. La séance est bornée
par `PLAFOND_UNITES` quelle que soit la dette — et la dette, elle, n'est pas
bornée, sinon le produit la cacherait.

## 23. Les trois nombres, jamais agrégés

| profil | total | actif | différé | garé | % garé |
|---|---|---|---|---|---|
| C | **109** | 8 | 13 | 88 | **81 %** |
| L | **116** | 8 | 24 | 84 | 72 % |
| M | **100** | 8 | 15 | 77 | 77 % |
| K — absence 60 j | **23** | 8 | 6 | 9 | 39 % |
| T — reprise tardive | **44** | 8 | 14 | 22 | 50 % |
| A — parfait | **0** | 0 | 0 | 0 | 0 % |

**`I2` tient aux 480 instantanés, pour les vingt profils.** Aucun champ
`backlog` unique n'existe nulle part dans la chaîne.

**81 % de garé pour C** est le chiffre que ce sprint devait justifier ou
retirer. Les §24 à §28 le justifient ; s'ils ne l'avaient pas fait, il aurait
fallu retirer le garage, pas le chiffre.

## 24. Pourquoi les notions sont garées — trois zéros

Sur les 480 instantanés :

| vérification | résultat |
|---|---|
| notions garées **sans condition de retour** | **0** |
| notions **essentielles** garées | **0** |
| **échecs non repris** garés | **0** |

Ces trois zéros sont la différence entre un tri et une dissimulation. Le garage
sait toujours dire *ce qui* bloque et *ce qui* lèverait le blocage ; il ne peut
jamais avaler ce que le parcours exige, ni ce qui vient d'échouer.

**La soupape n'a jamais eu à servir** : la situation « tout est garé » ne s'est
pas produite. Un filet qui ne sert pas n'est pas un filet inutile.

## 25. Le cycle de récupération, entrée → séjour → sortie

| profil | NORMAL | CATCH_UP | RECOVERY | CRITICAL | entrées | sorties |
|---|---|---|---|---|---|---|
| A — parfait | **19** | 3 | 2 | 0 | 2 | 2 |
| K — absence 60 j | 5 | 7 | 4 | 8 | 3 | **2** |
| S — arrêt 90 j | 6 | 7 | 2 | 9 | 2 | **2** |
| M — 50 % | 0 | 4 | 0 | 20 | 1 | **0** |

- **A** passe 19 instantanés sur 24 en `NORMAL` : le mode ne se déclenche pas
  tout seul ;
- **K** entre au jour 105 et **sort au jour 180** — environ vingt jours après la
  fin de son absence de soixante jours. Le cycle fonctionne dans les deux sens ;
- **M** fait **une seule bascule en 365 jours**. Ni clignotement, ni hésitation :
  le produit dit la même chose tous les jours parce que la situation est la même
  tous les jours ;
- **sept profils entrent sans jamais ressortir** : B, C, D, L, M, N, P.

## 26. La contre-mesure décisive : la sortie existe-t-elle ?

Sept profils enfermés, c'est la **pathologie n° 1** du brief. Deux lectures aux
conséquences opposées :

1. **le moteur est un piège** — disqualifiant ;
2. **la dette est réelle** — ces automates échouent à 55 % (C), à 70 % (L), ou
   n'ouvrent qu'un jour sur dix (D), **pendant un an sans jamais changer**.

**Aucune des vingt trajectoires ne contient de reprise** : la mesure ne pouvait
pas trancher. **Il fallait fabriquer le cas manquant.**

On greffe donc une **reprise réelle au jour 200** — toutes les journées
ouvertes, 97 % de réussite, preuves produites. Les 199 premiers jours sont
inchangés et **aucun seuil n'est touché**.

| profil | arriéré au j. 200 | quitte RECOVERY après | redevient NORMAL après | arriéré final |
|---|---|---|---|---|
| B | 58 | **90 j** | **150 j** | **0** |
| C | 70 | **165 j** | **165 j** | 4 |
| D | 17 | **5 j** | **65 j** | **0** |
| L | 75 | **165 j** | *jamais* | 7 *(`CATCH_UP`)* |
| M | 72 | **165 j** | **165 j** | 5 |
| N | 13 | **15 j** | **70 j** | **0** |
| P | 22 | **15 j** | **15 j** | **0** |

| pathologie | résultat |
|---|---|
| **sortie impossible** | ✅ **aucun profil** |
| **sortie immédiate** (un bon jour suffirait) | ✅ **aucun profil** — `E4` tient |

**Coût de la sortie : 5 à 165 jours de reprise réelle.** Le chiffre n'est pas
flatteur, et c'est le bon : une dette d'un an ne s'efface pas en une semaine.

### Et le garage se vide **intégralement**

Comparaison **nominative** des notions garées au jour 200 et encore garées au
jour 365 :

| profil | garées au j. 200 | **encore les mêmes au j. 365** |
|---|---|---|
| B | 42 | **0** |
| C | 53 | **0** |
| L | 59 | **0** |
| M | 55 | **0** |

**100 %, pour les sept profils.** C'est le résultat le plus net du sprint : les
81 % de notions garées du profil C ne sont pas une décharge — **dès que
l'apprenant revient, elles reviennent avec lui, toutes.**

## 27. Un chiffre qui allait être publié faux

La mesure trouvait jusqu'à **63 notions « jamais placées en actif »**. Lu tel
quel : de la famine.

**C'était un artefact du pas d'échantillonnage.** La séance tient 8 notions ; en
24 instantanés pris un jour sur quinze, on n'observe que 192 places. Une notion
travaillée le jour 97 mais pas aux jours 90 et 105 est comptée « jamais active »
**alors qu'elle a été proposée**.

Rejoué **jour par jour** sur 30 jours :

| profil | en retard | places (8 × 30) | notions **distinctes** travaillées |
|---|---|---|---|
| C | 81 | 240 | **28** |
| L | 84 | 240 | **18** |
| M | 83 | 240 | **21** |

**La sélection tourne.** Le moteur ne repropose pas éternellement les huit mêmes.

## 28. Mais la lecture honnête ne s'arrête pas là

**18 à 28 notions distinctes sur 81 à 84 en retard, en un mois complet** : pour
un apprenant très endetté, **les deux tiers de la dette ne sont pas touchés en
trente jours**.

Deux choses l'expliquent, et ce ne sont pas des défauts :

1. **un échec revient vite.** Les intervalles repartent à un jour après un
   échec. Un apprenant à 30 % de réussite **repasse** sur les mêmes notions — il
   répète, il n'est pas affamé. Les chiffres le confirment : L (30 %) voit 18
   notions distinctes, C (45 %) en voit 28. **Moins on réussit, moins on avance
   en largeur** — exactement ce qu'un moteur de rétention doit faire ;
2. **le débit est borné par choix** : 8 unités, 300 minutes. Face à 84 notions
   dues, un mois ne suffit pas, arithmétiquement.

**La conclusion réelle est une limite du produit, pas une tricherie** : *à débit
constant, un apprenant profondément décroché ne peut pas être rattrapé sans
réduire le nouveau contenu ou allonger la durée.* C'est exactement ce que le
produit **propose** — et jamais ce qu'il décide.

## 29. Un séjour au garage de 315 jours

Le profil L a une notion garée **315 jours d'affilée**. C'est littéralement la
pathologie n° 4 — *« arriéré repoussé indéfiniment »* — et elle est publiée sans
atténuation.

Ce qui la sort du statut de défaut est le §26 : chez L, **59 notions garées sur
59 sont libérées** dès la reprise. Le garage de L est long parce que **L ne
revient jamais**, pas parce que le moteur l'y retient.

La distinction n'est pas rhétorique : elle est mesurée par une contre-mesure qui
aurait pu donner le résultat inverse.

## 30. Les profils critiques, un par un

**B — irrégulier.** Ouvrir 3 jours sur 7 pendant un an ne permet pas de
rattraper. À la reprise : `NORMAL` en 150 jours, arriéré **nul**.

**C — nombreux échecs.** Le pire cas : 109 en retard, 81 % garées, **zéro**
instantané en `NORMAL`. Les 88 garées ont toutes une condition de retour ; 29
sont débloquables immédiatement.

**K — absence 60 jours.** Entrée jour 105, **sortie jour 180**. 23 en retard à la
fin, dont 9 garées et **7 sur 9 débloquables**.

**L — 30 % de réussite.** Le plus endetté, le plus long garage, 20 instantanés
sur 24 en `CRITICAL`. Reprise : de 75 à **7**, garage vidé à 100 %.

**M — 50 %.** Une seule bascule en 365 jours.

**P — suit les jours, saute la pratique.** Aucun exercice tenté, donc **aucun
verdict objectif**. Le produit ne le crédite pas : 39 en retard et jusqu'à 17
notions bloquantes simultanées, pour quelqu'un qui a pourtant ouvert ses 365
journées. **« Lu » n'est pas « su ».** À la reprise, `NORMAL` en **15 jours** —
le plus rapide des sept, parce que sa dette était un manque de **preuves**, pas
un manque de maîtrise.

**Q — lit la correction avant d'essayer.** 75 % de « réussite » déclarée, et
pourtant des chiffres proches de P : 36 en retard, 55 au maximum. La règle
`correctionSeen` fait que ces réussites ne valent pas comme rappel actif. **Le
produit n'est pas dupe d'une réussite obtenue en lisant la réponse.**

**R — rappel OK, transfert KO.** ⚠️ **Non mesuré ici, et c'est écrit** : le
simulateur ne produit **aucun** `TransferAttempt`, son drapeau est inerte. R est
couvert par le panneau du CP10, pas par cette simulation.

**S — arrêt 90 jours.** La trajectoire la plus démonstrative : 49 notions au
garage pendant l'arrêt, arriéré final **1**. Entré, séjourné, sorti.

**T — reprise tardive.** 18 instantanés sur 24 en `CATCH_UP`, jamais `NORMAL`.
44 en retard, **15 des 22 garées débloquables**. Ni déclaré « à jour », ni puni :
orienté vers ce qui débloque le reste.

---

# PARTIE V — COMMENT ON SAIT QUE CE N'EST PAS DE LA TRICHE

## 31. La question du CP14

Pas « les tests passent-ils », mais **« les tests empêchent-ils de mentir ? »**

Le sprint a payé trois fois pour apprendre la différence. La facture la plus
lourde est celle du CP9 : remplacer `sourceType: 'transfer-challenge'` par
`'assessment'` **dans la route** laissait **1797 tests verts**, parce qu'ils
vérifiaient le fabricant de preuve et jamais la route. *Le contournement que le
checkpoint devait interdire passait sous les tests censés l'interdire.*

## 32. Vingt-quatre mensonges plausibles

Chacun appliqué, une fois, au code réel :

```
VERT (avant)  →  ROUGE (sous mutation)  →  VERT (après restauration)
```

| # | mutation | # | mutation |
|---|---|---|---|
| M1 | un échec est supprimé | M13 | absence 60 j traitée comme 1 j |
| M2 | un succès compté deux fois | M14 | horodatages hors ordre |
| M3 | `conceptId` faux | M15 | `TransferAttempt` perdu |
| M4 | preuve multi-concepts forcée à un seul | M16 | transfert raté = réussite |
| M5 | arriéré total caché | M17 | schéma `weeklyReview` cassé |
| M6 | notion garée = acquise | M18 | `data/progress.json` créé |
| M7 | récupération jamais déclenchée | M19 | scheduler non déterministe |
| M8 | récupération toujours déclenchée | M20 | budget quotidien dépassé |
| M9 | sortie de récupération impossible | M21 | reprise écrase la tentative initiale |
| M10 | sortie de récupération trop facile | M22 | doublon réseau = deux faits |
| M11 | nouveau contenu continue en `CRITICAL` | M23 | soupape supprimée |
| M12 | projet urgent ignoré | M24 | plan sans justification |

**24 / 24 rouges. 0 survivante. 0 restauration incomplète.**

Deux garde-fous sur la mesure elle-même : chaque mutation exige que sa cible
apparaisse **exactement une fois** dans le fichier, et le **départ vert** est
publié — sans quoi le rouge ne prouverait rien.

## 33. Trois mensonges étaient indétectables

**C'est le résultat utile du checkpoint.** Une table de 24 ✅ au premier essai
aurait surtout prouvé que les mutations avaient été choisies pour passer.

**M17** — `weeklyReviews: null` à l'écriture restait vert : **tous** les cas de
test passaient `weeklyReviews: {}`, un objet vide qu'aucune assertion ne
distinguait de l'absence. C'est la famille du **défaut P7** (§40).

**M22** — neutraliser la garde par **clé métier** restait vert : le seul test de
doublon rejouait la requête 1,2 s plus tard, donc dans la fenêtre de
`estUnRejeu`, qui l'attrapait à sa place. **Une garde en masquait une autre.**

**M23** — supprimer la soupape restait vert : le seul test qui la touchait
vérifiait qu'elle **ne se déclenche pas**. *Un filet de sécurité sans test
positif est un filet supposé.*

**Les trois racontent la même histoire** : des tests qui *avaient l'air* de
couvrir. Correctif : **3 tests ajoutés**. Aucune mutation affaiblie, aucun seuil
déplacé, aucun test existant relâché.

## 34. Une porte pour V75

Il n'en existait **aucune**. Six moteurs purs, et rien dans `gates:active` qui
les garde.

Une suite de tests garde des **comportements**. V75 repose aussi sur des
propriétés **structurelles** qu'aucune assertion ne voit se dégrader : le jour
où quelqu'un ajoute un champ `backlog` unique, aucun test ne casse **et la dette
redevient masquable**.

`scripts/v75-check.mjs` — **60 vérifications**, douze règles :

| règle | ce qu'elle empêche |
|---|---|
| **A1** | six moteurs purs, sans `Math.random` |
| **A2** | `I2` — l'arriéré reste **trois nombres** |
| **A3** | `PARKED` porte sa condition, et la surface la **rend** |
| **A4** | le mode n'est **jamais persisté** |
| **A5** | les **deux** listes blanches du store — la reproduction du défaut P7 |
| **A6** | chaque bloc borné, minutes non placées publiées |
| **A7** | aucun module de plan n'émet la pause |
| **A8** | aucun score, aucun percentile, aucun classement |
| **A9** | `TRANSFER_SUCCESS ≠ MASTERY`, échec compté |
| **A10** | `conclusionPossible` reste `false` |
| **A11** | les moteurs sont **réellement branchés** |
| **A12** | `data/progress.json` n'existe pas |

**Et la porte a été vérifiée comme le reste : par mutation.** Sept mutations de
la porte elle-même — `curriculumPause` retiré de la lecture, `total` plafonné,
bornage retiré, pause émise par le plan, `conclusionPossible` conditionnel, plan
débranché, fichier interdit créé. **7 / 7 rouges.** *Une porte toujours verte
serait pire qu'aucune porte.*

## 35. Le gauntlet complet

| vérification | résultat |
|---|---|
| `npm test` | **1858 / 1858** ✅ |
| dont tests V75 | **245** |
| `npx tsc --noEmit` | 0 erreur ✅ |
| `npm run build` | compilé ✅ |
| `npm run gates:active` | **48 portes, 0 violation** ✅ |
| `npm run v74:check` | 21 vérifications ✅ |
| `npm run v75:check` | **60 vérifications** ✅ |
| `curriculum:check` | 365 journées · 52 semaines · 12 mois · 128 leçons ✅ |
| `v50:check` | corpus **gelé** `92d5fae6` ✅ |
| `data/progress.json` | **absent** ✅ |
| déterminisme | deux exécutions **identiques au bit près** ✅ |
| idempotence | même commande rejouée → **1 fait**, pas 2 ✅ |
| arbre de travail · local == origin | propre ✅ |

---

# PARTIE VI — CE QUE LE PRODUIT DIT À L'APPRENANT

## 36. Le rendu réel d'une journée en `CRITICAL`

Serveur lancé, fixture hors dépôt, profil L au jour 180 — **78 notions en
retard**. Rendu réel de `/day/181` :

```
Ta journée, telle que le produit l'organiserait

  Tu as 4 notions en retard dont la suite du parcours dépend. Le produit te
  propose de suspendre le nouveau contenu et de garder 60 minutes pour les
  reprendre — c'est une proposition, pas une décision prise à ta place.
  « Défi de transfert » est mis de côté tant que des prérequis sont en retard.

  Reprise après échec    12 min   4 tentatives n'ont pas abouti
  Réactivation           60 min   4 notions dont la suite dépend sont en retard
  Nouveau contenu       228 min   sur 294 — le produit te propose de suspendre
  Défi de transfert         —     les prérequis en retard passent d'abord

  Total proposé : 300 min sur un budget de 300 min.
  66 min n'ont pas trouvé de place aujourd'hui — elles ne sont pas perdues.
  Le produit ne rallonge jamais ta journée pour rattraper.
```

Point par point, ce que ce rendu démontre :

- l'arbitrage a **réordonné** la journée (`REMEDIATION` avant `NEW`) ;
- le nouveau contenu est **réduit** de 294 à 228, **pas supprimé** ;
- le transfert est **suspendu**, et la raison est donnée ;
- le total vaut **exactement** le budget, jamais plus ;
- les 66 minutes refusées sont **affichées** ;
- l'explication est en français, **sans un seul nom de mode**.

## 37. La dette, dite en entier

> *En retard : **78** notions — **2** aujourd'hui, **12** plus tard, **64** en
> attente d'un prérequis. « En attente » ne veut pas dire « acquise ».*

Les trois nombres traversent toute la chaîne sans être agrégés, et la dernière
phrase existe pour qu'aucune lecture rapide ne transforme un garage en réussite.

## 38. Ce que le produit ne fait pas

**Rien n'est verrouillé.** En `CRITICAL`, le bloc `NEW` reçoit le statut
`recommande-pause` : il **garde ses minutes**, il n'est **pas retiré**. La
surface ne porte **aucun `disabled`**, et le dit :

> *Rien n'a été retiré de la journée : tu peux lire et faire tout ce qui suit,
> dans l'ordre que tu veux.*

Un test refuse le jargon dans toute phrase affichée : `recoveryPressure`,
`score`, `decay`, `percentile`, et **les noms de modes eux-mêmes**.

---

# PARTIE VII — LES DÉFAUTS TROUVÉS, Y COMPRIS LES MIENS

## 39. Trois défauts de produit préexistants (CP0)

| # | défaut | état |
|---|---|---|
| **P1** | `besoinProche` (15/100) **mort en production** — mauvais grain | corrigé au CP4 |
| **P2** | **l'arriéré réel n'est jamais montré** — 84 réels, « 8 » annoncés | corrigé aux CP5/CP8/CP11 |
| **P3** | le profil P reçoit **0 remédiation** | mesuré, adressé au CP11 |

## 40. Deux défauts que seule la chaîne réelle pouvait montrer (CP10)

**Défaut P7 — `curriculumPause` n'avait jamais été persisté.** Le store filtre
les champs **deux fois** : à l'écriture et à la lecture. Les tests du CP7
appelaient `applyCommand` sur un objet plat, **jamais** `writeProgress`. La
fonctionnalité était donc écrite, testée, verte — et **sans effet sur le
disque**, du CP7 jusqu'au CP10.

**Second défaut — une lecture mémoïsée effaçait un fait.** `readProgress()` est
mémoïsée par requête ; la route de transfert l'appelait deux fois, et l'écriture
de la preuve **écrasait la tentative enregistrée trois lignes plus haut**.

**La leçon, payée trois fois :** les tests unitaires ne disent rien de ce que le
disque garde, ni de ce que la page rend.

## 41. Quatre défauts que seul le rendu réel montrait (CP8)

- la page affirmait « le même total dans les deux cas », **ce qui est faux** en
  `CRITICAL` (260 → 60 min) ;
- un maintien par `E4` affichait « plusieurs notions attendent » alors qu'il n'en
  restait **aucune** ;
- le garage nommait des **identifiants techniques** au lieu des leçons ;
- le signal de charge de V74 et le mode de récupération se contredisaient à
  l'écran.

## 42. Quinze anomalies dans mes propres sondes

Elles sont consignées intégralement dans `docs/v75/V75-STATE.md`. Les plus
instructives :

**Anomalie n° 7 — la pire du sprint.** La première mesure du CP7 a retourné
**zéro pour les vingt profils** et imprimé « invariants ✅ 20/20 ». La fonction
de tri ne renvoyait pas les notions.

> **Une mesure faite sur rien valide tout.**

Un garde-fou a été ajouté : la sonde **refuse de conclure** sans matière. Et
c'est devenu une discipline de test — la seconde moitié des tests du CP13 exige
que les détecteurs **sachent crier**.

**Anomalies n° 5, 8, 9 — trois tests aveugles**, trouvés par mutation : un test
qui vérifiait la soupape en croyant vérifier l'exclusion mutuelle ; deux tests
qui cherchaient un **nom de champ** et l'attrapaient dans un texte explicatif ou
dans un commentaire. Corrigés par un utilitaire qui retire les commentaires
avant de chercher, et en exigeant la **valeur rendue**, pas le nom.

**Anomalie n° 12 — un chiffre qui allait être publié faux** : les « 63 notions
jamais actives » (§27).

**Anomalie n° 13 — le profil R est inerte** dans la simulation, écrit comme
limite plutôt que laissé croire que R est sous contrôle.

**Anomalies n° 14 et 15** — trois mutations survivantes et l'absence totale de
porte V75 (§33, §34).

## 43. Les portes m'ont corrigé quatre fois

| porte | ce qu'elle a refusé |
|---|---|
| `v651:check` | le mot « classement » dans un commentaire — vocabulaire de gamification |
| `v74:check` | un moteur déplacé hors de la page — critère `B12` |
| `v64:check` | un affichage d'erreur non conforme au motif maison |
| `v64:check` | un second canal d'erreur inventé sur un correcteur serveur |

**Dans les quatre cas, je me suis conformé plutôt que d'affaiblir la porte.**

## 44. Un bug dans la contrainte que le checkpoint défendait

La première version du CP11 laissait le bloc `NEW` de `CRITICAL` passer à sa
demande entière **sans le borner** : le total montait à **320 minutes sur un
plafond de 300**. *Le checkpoint censé défendre le budget le violait.*

Corrigé, et devenu la règle `A6` de la porte : **recommander une pause ne
dispense pas de la contrainte.** La recommandation porte sur ce qu'on fait,
jamais sur le temps dont on dispose.

---

# PARTIE VIII — LE VERDICT

## 45. Les quatorze critères bloquants

| # | critère | état | preuve |
|---|---|---|---|
| **V1** | triage réellement branché | ✅ | `/retention` · `/day/[id]`, porte `A11` |
| **V2** | mode récupération réellement branché | ✅ | rendu réel §36, porte `A11` |
| **V3** | aucune dette cachée : `I2` | ✅ | **480 instantanés**, 20/20 profils |
| **V4** | arriéré total visible, non plafonné | ✅ | rendu réel §37 |
| **V5** | `PARKED ≠ MASTERED` | ✅ | moteur pur sans écriture ; M6 rouge |
| **V6** | arriéré actif borné et soutenable | ✅ | `actif max = 8` pour les 20 |
| **V7** | absence longue → plan exploitable | ✅ | testé sur **I, J, K** à leur retour |
| **V8** | les échecs ne sont pas effacés | ✅ | M1 et M16 rouges |
| **V9** | 25 défis accessibles | ✅ | **25/25** sur six vérifications |
| **V10** | événements déterministes et rejouables | ✅ | deux exécutions identiques |
| **V11** | aucun état inventé | ✅ | porte `v75:check` règle `A8` |
| **V12** | budget quotidien respecté | ✅ | **0 dépassement** sur 480 instantanés |
| **V13** | ≥ 20 mutations rouges puis restaurées | ✅ | **24/24** |
| **V14** | tests · tsc · build · portes | ✅ | 1858 · 0 · OK · 48 portes |

**Quatorze sur quatorze.**

## 46. Les cinq critères non bloquants

| # | critère | mesure |
|---|---|---|
| `N1` | saturation de B et C | B 80 % → **75 %** · C 92 % → **90 %** — en baisse, faiblement |
| `N2` | profils ne revenant jamais sous contrôle | **11/20 avant** · 7/20 restent en récupération, **7/7 en sortent à la reprise** |
| `N3` | part de l'arriéré garée | **mesurée, non maximisée** — jusqu'à 81 %, entièrement justifiée et 100 % réversible |
| `N4` | exercices désambiguïsés | 137 → **125** ambigus, sans choix arbitraire |
| `N5` | délai absence → plan de reprise | **immédiat** (le plan est recalculé à chaque lecture) ; sortie de récupération : 5 à 165 j |

**`N1` est le chiffre le moins flatteur du rapport, et il est publié tel quel.**
La saturation de B et C baisse à peine. C'est cohérent avec §21 : le moteur ne
supprime pas la dette, et un automate qui échoue à 55 % pendant un an n'a aucune
raison de voir sa dette baisser.

## 47. Pourquoi `CANDIDATE` et pas `READY`

Le contrat gelé dit : `ADAPTIVE_RECOVERY_READY` quand `V1 → V14` sont tous
atteints. **Ils le sont.** Mécaniquement, l'échelle donnerait `READY`.

**Je ne rends pas ce verdict**, et la raison n'est pas prudentielle :

> `READY` sur un produit d'apprentissage voudrait dire *« ce moteur aide
> réellement quelqu'un à apprendre »*. **Rien dans ce sprint ne permet de
> l'affirmer.** Vingt automates ne sont pas vingt personnes. Ils n'apprennent
> pas, n'oublient pas vraiment, ne se découragent pas et n'abandonnent jamais.

Ce que V75 a démontré, c'est que le moteur **se comporte correctement** face à
des trajectoires plausibles, et qu'**il ne peut pas mentir sans que ça se voie**.
C'est beaucoup. **Ce n'est pas une preuve d'apprentissage.**

**Verdict : `ADAPTIVE_RECOVERY_CANDIDATE`.**

Ce qui manque pour `READY` n'est pas dans le code. C'est le CP12 exécuté, avec
des humains.

## 48. Ce que ce verdict engage, et ce qu'il n'engage pas

| il dit | il ne dit pas |
|---|---|
| le moteur ne cache pas la dette | que la dette soit gérable |
| le garage est justifié et réversible | que garer aide à apprendre |
| les seuils produisent un comportement cohérent | que ce soient **les bons** seuils |
| 24 mensonges précis sont détectables | que les tests soient complets |
| un décrochage profond produit une reprise réaliste | qu'un humain la suivrait |

---

# PARTIE IX — LIMITES ET SUITE

## 49. Les limites, déclarées

1. **Aucune preuve d'apprentissage humain.** `REAL_HUMAN_LEARNING_EVIDENCE =
   NOT YET MEASURED`, inchangé depuis V72 ;
2. **aucun seuil n'est calibré.** `CATCH_UP` à 1 bloquante, `RECOVERY` à 3,
   `CRITICAL` à 6, `PLAFOND_UNITES = 8`, `MINUTES_DEFI_TRANSFERT = 12` — tous
   **déclarés**, aucun mesuré ;
3. **le profil R n'est pas simulé.** Le simulateur ne produit aucun
   `TransferAttempt` ;
4. **résolution de 15 jours** dans la mesure principale. Les fenêtres critiques
   ont été rejouées à 5 jours et à 1 jour ;
5. **125 exercices restent ambigus** — publiés comme tels, pas résolus au
   hasard ;
6. **`ESSENTIAL` repose sur le graphe de prérequis de V73**, dont la qualité
   n'est pas rejugée. Si le graphe est incomplet, des notions bloquantes seront
   manquées ;
7. **la porte `v75:check` lit du texte**, pas des comportements. Elle attrape un
   retrait ou un renommage ; pas une logique subtilement fausse qui garderait
   les mêmes noms ;
8. **le débit est le vrai plafond** : deux tiers de la dette non touchés en un
   mois chez un apprenant très endetté (§28).

## 50. Ce qui devrait venir ensuite

**Par ordre de valeur décroissante :**

1. **Exécuter le protocole du CP12** avec de vrais participants. C'est la seule
   chose qui puisse déplacer le verdict, et aucune quantité de code
   supplémentaire ne la remplacera ;
2. **produire des `TransferAttempt` dans le simulateur**, pour que le profil R
   cesse d'être inerte ;
3. **calibrer les seuils** sur les premières données réelles — en gelant les
   hypothèses **avant** de les voir ;
4. **réduire les 125 exercices ambigus**, en enrichissant les déclarations de
   leçons plutôt qu'en inventant une règle de plus ;
5. **mesurer le débit** : 8 unités et 300 minutes sont des choix, jamais testés.

## 51. Les deux questions finales

### Question 1

> *« Si un utilisateur rate 30 jours, revient avec 70 notions fragiles et échoue
> à la moitié de ses exercices, AI Career OS sait-il réellement lui construire
> une reprise réaliste sans cacher sa dette et sans l'écraser ? »*

## **OUI AVEC RÉSERVES**

**Ce qui justifie le OUI.** Le cas décrit a été mesuré, pas imaginé. Le profil K
(absence de 60 jours) et le profil M (50 % de réussite) le couvrent tous deux.

- **sans cacher la dette** : les 70 notions sont affichées en entier, décomposées
  en trois nombres dont la somme est exacte, à chaque instantané, pour les vingt
  profils. Cacher la dette a été tenté par mutation (M5, M6) : les deux
  rougissent ;
- **sans l'écraser** : la séance ne dépasse jamais 8 unités ni le budget de la
  journée — **0 dépassement sur 480 instantanés**. Le plan de reprise ne reçoit
  **aucun historique**, donc ne peut pas reprocher une absence. Aucune
  formulation d'obligation n'est admise par les tests ;
- **une reprise réaliste** : K sort de la récupération vingt jours après son
  retour. Et lorsqu'un profil bien plus endetté reprend réellement, il en sort
  aussi — **7 profils sur 7**, et **100 % de leurs notions garées sont
  libérées**.

**Ce qui impose les réserves — trois, et elles sont sérieuses.**

1. **« Réaliste » n'a été vérifié que sur des automates.** Aucun humain n'a suivi
   ce plan. Un plan arithmétiquement soutenable peut être psychologiquement
   intenable, et rien ici ne le mesure ;
2. **le débit ne suffit pas dans les cas extrêmes.** Deux tiers de la dette d'un
   apprenant très endetté ne sont pas touchés en un mois. Le produit le dit et
   **propose** de réduire le nouveau contenu — mais il ne peut pas créer du
   temps, et le rattrapage complet se compte alors en mois, pas en semaines ;
3. **`ESSENTIAL` dépend d'un graphe de prérequis non rejugé.** Si le graphe est
   incomplet, une notion réellement bloquante peut être classée `DEFERRABLE` et
   attendre — la reprise serait alors mal priorisée sans que rien ne le signale.

### Question 2

> *« Sommes-nous maintenant suffisamment instrumentés pour commencer une
> première validation humaine réelle de l'apprentissage ? »*

## **OUI**

Et c'est, à mon sens, le vrai résultat de ce sprint.

**Ce qui était manquant avant V75, et ne l'est plus :**

| il manquait | état |
|---|---|
| une preuve ne disait pas **quelles notions** elle validait | cascade de résolution, 4 règles, **partagée** entre mesure et produit |
| l'échec au transfert était **invisible** | `TransferAttempt` persisté, échecs comptés, panneau dédié |
| les 25 défis de transfert étaient **inatteignables** | route, pages, navigation — **25/25** vérifiés individuellement |
| aucun protocole ne distinguait « appris » de « déjà su » | sept étapes, chacune levant une ambiguïté nommée |
| rien ne distinguait « je retiens » de « c'est en mémoire de travail » | `DELAY`, minimum **24 h**, vérifié sur les faits |
| les faits n'avaient ni provenance ni version | modèle V2 : horloge serveur, provenance, vocabulaire fermé |
| rien n'était rejouable | déterminisme vérifié, chaîne complète rejouable à toute date |

**Et ce qui compte autant : ce qui est refusé est écrit et vérifiable.** Aucune
frappe, aucune durée de lecture estimée, aucun identifiant de machine, **aucune
comparaison entre apprenants, aucun percentile, aucun classement**, aucun envoi
vers un tiers. Le mode d'étude est **opt-in, non bloquant, isolé** — les données
d'étude n'entrent dans **aucune** projection du produit, faute de quoi
l'observation modifierait ce qu'elle observe.

**Deux avertissements, à lire avant de recruter qui que ce soit :**

1. **Le biais le plus lourd est l'absence de groupe témoin.** Sans groupe sans
   réactivation, ce protocole pourra montrer que des gens apprennent **avec** AI
   Career OS. Il ne pourra pas montrer qu'ils apprennent **grâce à** lui. C'est
   écrit dans le protocole, avant les résultats, précisément pour éviter de le
   découvrir en les lisant ;
2. **les hypothèses doivent être gelées avant de voir la moindre donnée.** Les
   ajuster après coup serait exactement le contournement que V74 avait nommé
   `G11` — et ce rapport aurait alors la même valeur qu'un graphique flatteur.

---

## 52. Récapitulatif

| | |
|---|---|
| **verdict** | **`ADAPTIVE_RECOVERY_CANDIDATE`** |
| critères bloquants | **14 / 14 atteints** |
| ce qui manque pour `READY` | **des humains**, pas du code |
| checkpoints | **CP0 → CP15**, un commit par checkpoint |
| moteurs purs créés | **6** (≈ 1 600 lignes, commentaires compris) |
| tests | **1858** au total · **245** pour V75 |
| portes | **48** (dont `v75:check`, nouvelle, 60 vérifications) |
| mutations vues rouges | **24** + 7 sur la porte + 3 sur les sondes |
| instantanés de simulation | **480**, chaîne complète |
| défauts de produit trouvés | **P1, P2, P3, P7** + 4 défauts de rendu |
| anomalies dans mes propres sondes | **15**, toutes publiées |
| `REAL_HUMAN_LEARNING_EVIDENCE` | **`NOT YET MEASURED`** |

---

> **La phrase qui résume le sprint.**
>
> On peut construire un moteur qui ne ment pas sur la dette d'un apprenant, et
> on peut le prouver. On ne peut pas prouver, depuis un dépôt de code, que
> quelqu'un apprend.
>
> V75 a fait le premier travail entièrement, et a rendu le second **possible**.
