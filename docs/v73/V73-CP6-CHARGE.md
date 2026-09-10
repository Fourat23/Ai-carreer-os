# V73 — CP6. Modèle de charge décomposé des 365 journées

**Résultat : aucune journée n'est structurellement impossible, et le CP6 n'a donc rien à
corriger.** Les trois seuils de charge gelés au CP1 passent. Ce que le CP6 produit à la place,
c'est la **décomposition par poste** — sans laquelle on ne peut pas dire *d'où* vient un
dépassement, ni si le remède est de retirer de la lecture, de la pratique ou de la relecture.

---

## 1. Ce que le modèle décompose, et ce qu'il refuse de mesurer

| poste | méthode | déclaré |
|---|---|---|
| lecture de la journée | mots ÷ vitesse + lignes de code ÷ 20, **hors exemple guidé** | mesuré |
| correction | idem sur le fichier de correction | mesuré |
| lecture des leçons liées | idem, **× coefficient de relecture** si la journée est une revue | mesuré |
| exemple guidé | le suivre coûte entre **0,5 et 1,5 relecture** | estimé, fourchette |
| pratique | fourchette par difficulté, **+8/+15 min par étape au-delà de trois** ; le **minutage explicite fait foi** quand il existe | estimé, fourchette |
| réflexion | +10/+20 min si la journée porte des « Questions de réflexion » | estimé |
| projet | **pas de poste séparé** — une journée de projet *est* une pratique | — |
| **setup** | **NON MESURÉ** | rien dans le texte ne permet de l'estimer, et l'inventer serait une fabrication |

**Budget gelé au CP1 : `[240, 300]` minutes — jamais un point.**

---

## 2. Les déciles

### Journées de travail (313)

| | P10 | P25 | médiane | P75 | P90 | max |
|---|---|---|---|---|---|---|
| borne basse | 94 | 115 | **139** | 159 | 220 | 235 |
| borne haute | 146 | 166 | **191** | 211 | 272 | **294** |

**Aucune journée de travail ne dépasse le budget haut**, même à son maximum (294 min).

### Revues (52)

| | P10 | P25 | médiane | P75 | P90 | max |
|---|---|---|---|---|---|---|
| borne basse | 118 | 178 | **210** | 244 | 271 | **313** |
| borne haute | 158 | 215 | **248** | 292 | 314 | **373** |

**Tout le dépassement du parcours est concentré sur les revues.** Le P90 des revues (314) est
au-dessus du budget haut ; celui des journées de travail (272) est en dessous.

---

## 3. Le poste dominant, mesuré

Moyenne par journée, en minutes (borne haute pour les postes à fourchette) :

| type de journée | texte du jour | correction | **leçons liées** | exemple guidé | **pratique** |
|---|---|---|---|---|---|
| **travail** | 8 | 3 | **70** | 3 | **93** |
| **revue** | 7 | 3 | **109** | 0 | **129** |

**Deux postes font 95 % de la charge : la lecture des leçons et la pratique.** Le texte propre
d'une journée pèse **huit minutes**. C'est un fait structurel du produit qu'il faut avoir en
tête avant toute décision : alléger une journée en raccourcissant son cours ne change
pratiquement rien — et le contrat l'interdit de toute façon.

---

## 4. Analyse de sensibilité — obligatoire, et décisive

| hypothèse | IMPOSSIBLE | HEAVY | BALANCED | UNDERLOADED |
|---|---|---|---|---|
| rapide (220 mots/min), relecture plein tarif | **0** | 4 | 349 | 12 |
| rapide, relecture à mi-tarif | **0** | 1 | 345 | 19 |
| **normale (150), relecture plein tarif — référence** | **3** | 6 | 350 | 6 |
| normale, relecture à mi-tarif | **0** | 1 | 355 | 9 |
| attentive (110), relecture plein tarif | **12** | 55 | 295 | 3 |
| attentive, relecture à mi-tarif | **0** | 48 | 311 | 6 |

**Une journée n'est déclarée structurellement impossible que si elle l'est sous au moins quatre
des six hypothèses** (§5.6 du contrat, gelé avant mesure).

> ## Journées structurellement impossibles : **0**

Les trois journées IMPOSSIBLE sous l'hypothèse de référence — **j224, j231, j238**, toutes des
revues — ne le sont que sous **deux** hypothèses sur six. Elles redeviennent BALANCED dès qu'on
admet qu'une relecture coûte moins qu'une lecture à froid, ce qui est précisément ce qu'une
revue demande.

**Le seuil L1 du contrat est donc atteint, et le mandat du CP6 — « traiter seulement les
journées structurellement impossibles » — ne désigne aucune journée.**

---

## 5. CP0 → CP6 : les deux lectures, côte à côte

Le contrat du CP1 a remplacé le budget-point de 270 minutes du CP0 par une fourchette
`[240, 300]`. Les deux lectures sont publiées ensemble, comme promis, **sur le même état du
produit** (après les CP3 et CP4) :

| | lecture CP0 (budget-point 270) | lecture contrat CP1 (fourchette 240–300) |
|---|---|---|
| IMPOSSIBLE | 6 | **3** |
| HEAVY | 54 | **6** |
| BALANCED | 255 | **350** |
| UNDERLOADED | 50 | **6** |

**L'écart est énorme et il vient entièrement du seuil, pas du produit.** Un budget-point à 270
déclare HEAVY toute journée dont la borne haute dépasse 270 — c'est-à-dire une journée qui
tiendrait dans 4 h 40 alors que l'engagement affiché est « 4 à 5 h ». C'est exactement ce que
le brief interdisait : « ne pas imposer artificiellement 270 minutes exactes à toutes les
journées ».

**Les chiffres du CP0 ne sont pas réécrits** (règle S7). Ils restent publiés tels quels dans
`V73-CP0-FORENSIC-AUDIT.md`, et cette table dit ce qu'ils mesuraient.

---

## 6. Les trois seuils de charge du contrat

| # | seuil | exigence | mesuré | état |
|---|---|---|---|---|
| **L1** | journées structurellement IMPOSSIBLE | **0** | **0** | ✅ |
| **L2** | revues HEAVY ou IMPOSSIBLE (référence) | **≤ 12 / 52** | **9 / 52** | ✅ |
| **L3** | journées UNDERLOADED non justifiées | **≤ 20 / 365** | **6 / 365** | ✅ |

### Les six journées UNDERLOADED, et pourquoi aucune n'est un défaut

| journée | haut | justification (§5.5 du contrat) |
|---|---|---|
| **j36** — TypeScript : le typage qui attrape les bugs | 117 | **journée de bascule** : elle ouvre TypeScript |
| **j40** — Clean code : nommage, fonctions courtes | 124 | **journée de bascule** : elle ouvre le software engineering |
| **j82** — Introduction à Python pour la data | 116 | **journée de bascule**, et le titre le dit : « préparation mois 4-5 » |
| **j126** — revue semaine 18 | 117 | **journée de respiration**, une seule leçon à revoir |
| **j154** — revue semaine 22 | 128 | idem |
| **j364** — revue semaine 52 | 129 | **journée de bilan**, dernière semaine |

Les trois premières sont des **journées d'ouverture de compétence**, les trois autres des
**revues légères ou de clôture**. Toutes tombent dans les trois cas que le §5.5 déclare
acceptables. **Zéro journée UNDERLOADED non justifiée.**

---

## 7. Les neuf revues en dépassement — ce que la décomposition livre au CP7

C'est le seul résultat de charge qui appelle un travail, et il n'appartient pas au CP6.

| revue | zone | charge | **relecture** | **pratique** (annoncée) | leçons |
|---|---|---|---|---|---|
| **j7** | HEAVY | 273–325 | 131 | 182 (130) | 6 |
| **j21** | HEAVY | 258–312 | 112 | 189 (135) | 5 |
| **j140** | HEAVY | 271–307 | **171** | 126 (90) | 7 |
| **j217** | HEAVY | 252–312 | 91 | **210** (150) | 4 |
| **j224** | IMPOSSIBLE | 312–372 | 151 | **210** (150) | 6 |
| **j231** | IMPOSSIBLE | 313–373 | 151 | **210** (150) | 6 |
| **j238** | IMPOSSIBLE | 313–373 | 151 | **210** (150) | 6 |
| **j252** | HEAVY | 270–314 | 151 | 154 (110) | 6 |
| **j357** | HEAVY | 282–358 | 82 | **266** (190) | 4 |

**Le diagnostic est net et il tient en une phrase** : ces revues annoncent **130 à 190 minutes
de pratique**, ce qui est déjà la moitié du budget, **et y ajoutent 82 à 171 minutes de
relecture qui ne figurent dans aucun compte**.

Deux profils distincts, qui n'appellent pas la même correction :

- **j140 est un problème de relecture** — sept leçons, 171 minutes, pour 90 minutes de pratique
  annoncée ;
- **j217 et j357 sont des problèmes de pratique** — 150 et 190 minutes annoncées, avec seulement
  quatre leçons à revoir.

**Le CP7 dispose donc du chiffre exact à retirer, et de quel côté.**

---

## 8. Ce que le CP6 a modifié

**Rien.** Aucune journée, aucune leçon, aucune donnée de programme. Deux artefacts produits :
`scripts/v73/cp6-charge.mjs` (rejouable) et `docs/v73/charge-365.json` (la décomposition
complète des 365 journées, poste par poste, sous les six hypothèses).

C'est le résultat correct : le mandat du CP6 était de traiter **les journées structurellement
intenables**, et la mesure n'en désigne aucune. Corriger une journée proche du seuil aurait été
exactement ce que le brief interdit.
