# V74 · CP8 — ORCHESTRATION DE L'ESPACEMENT

> **Interdiction du brief, tenue tout au long du checkpoint :**
> *« Ne pas chercher artificiellement 7 jours partout. »*

---

## 1. Ce que le CP8 mesure, et pourquoi ce n'est pas ce qu'a mesuré le CP6

Le **CP6** a traité les **52 revues du curriculum** : un objet *statique*, identique pour tous,
dont l'espacement se lit directement dans les fichiers.

Le **CP8** traite autre chose : **ce que l'arbitre (CP3 + CP4) propose réellement à UN apprenant
donné, à partir de SES faits.** Cet espacement-là ne se lit nulle part. Pour l'observer, il faut
faire tourner le moteur — d'où `scripts/v74/cp8-espacement.mjs`, une simulation déterministe
(générateur à graine, aucun `Math.random`) de 180 à 365 jours.

Trois apprenants synthétiques : **90 %**, **75 %** et **50 %** de réussite au rappel.

---

## 2. La question, et le défaut qu'elle a trouvé

`echeanceDe` calcule une échéance **nominale** (`INTERVALS` de V66, indexé par les réussites
consécutives). Mais `planifier` sélectionne par **priorité**, sous un plafond de 8 unités et un
budget de 20 minutes. **Rien ne garantissait qu'une notion due soit proposée le jour de son
échéance.**

La mesure a été nette :

| chez l'apprenant à 90 % de réussite | avant |
|---|---|
| propositions portant sur des notions **`HEALTHY`** (à jour) | **44 %** |
| places prises par une notion non due **alors qu'une notion due attendait** | **222** |
| arriéré `DUE + OVERDUE` au jour 180 | **16** |

**Un apprenant qui réussit neuf fois sur dix passait 44 % de son temps de révision sur des
notions que le moteur lui-même déclarait à jour**, pendant qu'un arriéré attendait.

La cause est dans le tri de `prioriser` : il ordonnait par **score**, puis par statut. Le statut
n'était qu'un départage. Un score élevé suffisait à faire passer une notion `HEALTHY` devant une
notion `OVERDUE`.

---

## 3. Règle n° 1 — le statut décide de la bande, le score décide du rang dans la bande

> **Une notion qui n'est pas due ne prend pas la place d'une notion qui l'est.**

Ordre de service : `OVERDUE` → `DUE` → `UNKNOWN` → `SOON` → `HEALTHY`.

**À ne pas confondre avec l'ordre d'ÉVALUATION gelé au §2 du contrat**
(`UNKNOWN → OVERDUE → DUE → SOON → HEALTHY`), qui dit comment on *calcule* un statut. Celui-ci
dit dans quel ordre on *sert* les fiches une fois le statut connu. Les deux sont indépendants et
**le contrat n'est pas modifié**.

`UNKNOWN` passe après `DUE` mais avant `SOON` : une notion exposée et jamais mise à l'épreuve
est un trou réel — rien n'y a jamais échoué, donc rien n'y alerte.

**La justification n'est pas un réglage, c'est une cohérence** : `INTERVALS` est l'échelle
d'espacement *publiée* du produit, et le §4 du contrat gelé en confie la responsabilité à V66.
Laisser un score la contredire rendrait cette échelle décorative — on afficherait « à revoir
dans 16 jours » tout en proposant la notion le lendemain.

**Rien n'est exclu** : quand la file des notions dues est vide, les `SOON` puis les `HEALTHY`
remplissent le budget restant. Une séance courte vaut mieux qu'une séance vide — mais elle ne se
remplit qu'*après* le nécessaire.

---

## 4. La règle n° 1, seule, a CASSÉ autre chose — et la mesure l'a dit tout de suite

Appliquée seule, elle donnait des chiffres flatteurs : arriéré du 50 % effondré de **61 à 6**.

Et **49 notions rencontrées n'étaient JAMAIS proposées en 180 jours** — contre **0** avant.

En corrigeant l'arriéré, j'avais créé une famine à l'autre bout : la file des notions en retard
remplissait les 8 places tous les jours, et les notions nouvellement rencontrées n'entraient
jamais. **C'est exactement ce que le CP13 ira chercher** (« aucune compétence oubliée
indéfiniment »).

**Un arriéré est un problème de capacité ; une notion jamais proposée est un défaut de
correction.** Les deux ne se compensent pas, et publier le premier chiffre en taisant le second
aurait été précisément le genre de tour de passe-passe que ce sprint interdit.

---

## 5. Règle n° 2 — une séance n'est jamais intégralement composée de retard

> **Au moins une place revient à une notion qui n'est pas en retard.**

Et plus précisément : **aux seules notions `UNKNOWN`**. La raison est une propriété, pas un
réglage :

> **Une notion jamais mise à l'épreuve ne peut pas devenir « en retard » toute seule.** Elle n'a
> pas d'échéance, donc rien ne la fera jamais monter dans les bandes prioritaires. **C'est le
> seul statut qui peut mourir de faim.** Une notion `SOON` ou `HEALTHY` a une échéance : elle
> deviendra `DUE` d'elle-même et n'a besoin d'aucune protection.

### Deux versions de cette règle ont été écrites, mesurées, et la première jetée

| version | famine | arriéré (50 %, jour 180) |
|---|---|---|
| aucune réservation | **49 notions jamais proposées** | 6 |
| réservation en **dernière** position | 49 — *elle ne servait jamais* | 6 |
| réservation **tôt**, ouverte à toute fiche non en retard | 0 | **60** — *l'arriéré revenait à son niveau d'avant* |
| réservation **tôt**, réservée aux `UNKNOWN` *(retenue)* | **0** | 63 |

Deux enseignements, tous deux venus de la mesure et non du raisonnement :

1. **le facteur limitant d'une séance n'est pas le plafond d'unités mais le BUDGET EN MINUTES.**
   Une réservation placée en dernière position n'était jamais atteinte — les minutes étaient
   épuisées avant. **Une réservation qu'on peut évincer n'en est pas une** : elle est donc prise
   tôt, juste après la notion la plus en retard ;
2. **une place vaut le quart d'une séance de 20 minutes.** L'offrir à n'importe quelle notion
   non due coûtait tout le bénéfice de la règle n° 1. La restreindre aux `UNKNOWN` garde la
   propriété et rend le coût.

---

## 6. BEFORE / AFTER, mesuré, y compris là où ça ne s'améliore pas

**180 jours, budget 20 min/jour, 78 notions rencontrées.**

| | 90 % de réussite | 75 % | 50 % |
|---|---|---|---|
| **arriéré au jour 180** | 16 → **1** | 41 → **22** | 61 → **63** |
| **retard sur l'échéance, p90** (jours) | 12 → **0** | 17 → **10** | 28 → **29** |
| **retard maximal** (jours) | 18 → **7** | 23 → **20** | 35 → **38** |
| **propositions sur notions à jour** | 44 % → **30 %** | 19 % → **11 %** | 4 % → **4 %** |
| **places prises à une notion due** | 222 → **16** | 128 → **50** | 76 → **70** |
| **notions jamais proposées** | 0 → **0** | 0 → **0** | 0 → **0** |

**L'apprenant à 50 % ne s'améliore pas, et je ne vais pas l'arrondir.** 61 → 63 sur l'arriéré,
28 → 29 sur le retard p90. Le §7 explique pourquoi, et pourquoi la réponse n'est pas ici.

---

## 7. Pourquoi l'apprenant à 50 % ne s'améliore pas — et pourquoi ce n'est PAS un défaut du scheduler

Deux mesures tranchent la question.

**Mesure A — l'arriéré plafonne-t-il ?** (365 jours, budget 20 min)

| | j60 | j120 | j180 | j240 | j300 | j365 |
|---|---|---|---|---|---|---|
| 90 % | 0 | 0 | 1 | 2 | 0 | **1** |
| 75 % | 2 | 41 | 22 | 16 | 19 | **21** |
| 50 % | 12 | 52 | 63 | 74 | 87 | **102** |

Les deux premiers **plafonnent**. Le troisième **croît linéairement** (+11 à +15 par tranche de
60 jours, après un transitoire) — jamais exponentiellement. Le critère du CP13 (« pas d'arriéré
exponentiel ») est donc tenu, mais l'arriéré du 50 % ne se résorbe pas.

**Mesure B — plus de budget règle-t-il le problème ?** (apprenant à 50 %, jour 180)

| budget | 20 min | 30 min | 45 min | 60 min |
|---|---|---|---|---|
| arriéré | 63 | 53 | 43 | **48** |

**Tripler le budget ne divise pas l'arriéré par trois — il le réduit d'un quart, puis cesse
d'aider.** C'est le fait qui explique tout le reste :

> À 50 % d'échec, **chaque notion servie revient le lendemain** — un échec ramène l'intervalle à
> 1 jour. **Servir plus de notions crée mécaniquement plus de retours.** Le débit augmente la
> demande à peu près autant qu'il la satisfait.

Autrement dit : **l'arriéré de l'apprenant à 50 % n'est pas un défaut d'ordonnancement, c'est un
énoncé vrai sur cet apprenant** — il absorbe du matériel nouveau plus vite qu'il n'en retient.
Aucune règle de tri, aucun budget ne corrige cela. La seule réponse honnête est d'**agir sur
l'entrée** — ralentir l'acquisition de nouveau matériel — et c'est précisément le mandat du
**CP10** (arbitrage de budget, traitement des 44 journées HEAVY).

**Ce qui aurait été malhonnête ici** : continuer à déplacer les seuils jusqu'à ce que le
tableau du 50 % devienne joli. C'est le contournement **G11**, et c'est exactement la tentation
qu'offrait ce checkpoint. Le paramètre `PLACES_DECOUVERTE` vaut **1** parce que c'est le minimum
qui borne l'attente et le maximum qui ne rouvre pas le défaut corrigé — pas parce qu'un balayage
a trouvé que 1 donnait les meilleurs chiffres.

---

## 8. « Sept jours partout » : l'interdiction est tenue, et voici la preuve

La distribution des intervalles **réalisés** reste largement dispersée, et la dispersion suit
l'apprenant :

| apprenant | médiane | p75 | p90 | max | forme de la distribution |
|---|---|---|---|---|---|
| 90 % | **5 j** | 13 | 32 | **56** | étalée jusqu'à deux mois — les séries de réussites étirent |
| 75 % | **4 j** | 15 | 23 | 75 | bimodale : beaucoup de 1-2 j, un second groupe vers 16 et 35 j |
| 50 % | **1 j** | 12 | 35 | 47 | massée sur 1 j — les échecs ramènent sans cesse au départ |

**C'est le résultat attendu, et c'est l'inverse de l'uniformité.** Un apprenant qui réussit voit
ses intervalles s'étirer (1 → 3 → 7 → 16 → 35…) ; un apprenant qui échoue les voit revenir à 1.
**Un espacement uniforme aurait été le signe que le moteur ignore l'apprenant, pas qu'il l'a
compris.** Un test garde explicitement cette propriété.

À noter : la médiane du 90 % **baisse** de 11 à 5 jours après le CP8. Ce n'est pas une
régression — c'est la disparition de l'arriéré. Avant, les notions étaient servies très en
retard, ce qui gonflait artificiellement les intervalles observés. Un intervalle long obtenu
parce qu'on a oublié de proposer la notion n'est pas un espacement, c'est une négligence.

---

## 9. Aucune échelle nouvelle

Le CP8 **ne définit aucun intervalle**. `INTERVALS` de V66 reste la seule échelle du produit ; la
règle **C11** de `v651:check` le vérifie encore, y compris par sa vérification de propriété
ajoutée au CP3. Le CP8 ne change que **l'ordre de service** et **l'allocation des places** — ce
qui est le métier de l'arbitre, pas celui d'un moteur.

---

## 10. Une sonde de test corrigée (anomalie n° 9)

Le premier test de la règle n° 1 était écrit ainsi : *« une notion à jour ne passe pas devant une
notion en retard »*, avec deux fiches ordinaires. **Il passait aussi bien avant qu'après le
changement.**

Avec des valeurs par défaut, la fiche en retard a naturellement le meilleur score : les deux
ordres de tri donnent donc le même résultat. **Le test ne mesurait pas la règle, il mesurait une
coïncidence de données** — et il aurait continué à passer si la règle n° 1 avait été supprimée.

Découvert en injectant la mutation « retour au tri score-d'abord » : **un seul test rougissait
sur les deux censés être sensibles**. Le test a été réécrit sur le cas discriminant — la fiche à
jour a le meilleur score (**30 contre 20**, vérifié dans le test lui-même par une assertion
dédiée, pour qu'un réglage futur qui inverserait ce rapport le fasse rougir plutôt que de le
laisser passer pour une mauvaise raison). La mutation fait désormais rougir **2** tests.

---

## 11. Les quatre mutations vues rougir

| mutation | tests rouges |
|---|---|
| retour au tri **score-d'abord** (le défaut corrigé) | **2** |
| suppression de la place réservée | **4** |
| place réservée placée en **dernière** position | **4** |
| réservation élargie à **toute** fiche non en retard | **1** |

Toutes restaurées : **12 / 12** sur le fichier, **1521 / 1521** sur la suite.

---

## 12. Fichiers

**Créés** : `scripts/v74/cp8-espacement.mjs` (simulation déterministe),
`tests/v74-espacement.test.mjs` (12 tests), ce document.

**Modifiés** : `lib/retention-priority.mjs` (ordre de service en bandes),
`lib/retention-scheduler.mjs` (`PLACES_DECOUVERTE`, séquence à place réservée).
