# V72 — CP6. Journées de revue : plafond appliqué, et un défaut plus grand trouvé au passage

**Mandat gelé** : reconstruire les revues en dépassement, plafond **7 leçons**, aucune
compétence nécessaire perdue, budget re-testé après.

**Résultat** : le mandat est rempli. Et en le remplissant, une contradiction **interne** aux
pages de revue est apparue, plus grave que le dépassement de budget — elle n'est pas corrigée
ici, et la raison est donnée en §4.

---

## 1. La cause, corrigée à la racine

`scripts/generate-curriculum.mjs`, `lessonsOf` (ligne 99) retourne, pour une journée sans liste
explicite, **toutes** les leçons de sa compétence. `lessonsDeLaRevue` en faisait l'union sur la
semaine. Le nombre de leçons d'une revue était donc piloté par le **nombre de compétences
traversées**, pas par ce qui avait été enseigné.

Nouvelle règle, exactement celle gelée au §3 du contrat :

1. les leçons **explicitement** liées par une journée de la semaine (`LESSONS_V67`), de la plus
   récente à la plus ancienne ;
2. en complément, les leçons de compétence des journées **sans** liste explicite, dans l'ordre
   des journées ;
3. coupe au plafond de **7**.

Le plafond n'est pas arbitraire : 270 min de budget − le test pratique minuté (60 à 90 min) −
environ 40 min pour le test théorique, le livrable, la checklist et la réflexion ⇒ **≈ 155 min**
de relecture, soit sept leçons du corpus.

**Ce qui est retiré n'est pas perdu** : ces leçons restent liées par **leur** journée, qui est
le bon endroit pour les rencontrer. Vérifié : **103 leçons sur 128 restent citées par au moins
une journée — exactement comme avant le CP6.** Aucune leçon n'est devenue orpheline.

---

## 2. Avant / après

| | avant | après |
|---|---|---|
| revues au-dessus du plafond de 7 | **6** | **0** |
| maximum de leçons dans une revue | **20** (j77) | **7** |
| journées classées IMPOSSIBLE | **11** | **7** |
| journées HEAVY | 54 | 56 |
| ordre des 365 jours | — | **inchangé** |
| leçons du corpus | 128 | **128, aucune modifiée** (`d535fcf6…`) |
| fichiers modifiés | — | 27 journées de revue + `data/program.json` + le générateur |

Détail des six revues corrigées :

| revue | semaine | leçons avant | relecture avant | leçons après |
|---|---|---|---|---|
| **j77** | 11 | **20** | **444 min** | 7 |
| j84 | 12 | 15 | 331 min | 7 |
| j70 | 10 | 12 | 260 min | 7 |
| j91 | 13 | 10 | 216 min | 7 |
| j322 | 46 | 9 | 191 min | 7 |
| j105 | 15 | 8 | 202 min | 7 |

**Exemple, j77.** La revue liait 20 leçons couvrant TCP/IP, DNS, TLS, l'adressage, le terminal,
quatre leçons Linux, deux Git, le README, le storytelling, la documentation, le clean code,
l'architecture, la conception d'API, les design patterns et la compatibilité. Elle en lie
maintenant **sept**, qui sont exactement ce que les journées 71 à 76 ont enseigné :
compatibilité (j76), documentation technique (j74), les trois Linux (j72), deux réseau (j71).

---

## 3. Les quatre journées encore IMPOSSIBLE — et pourquoi le plafond n'y change rien

| jour | cause |
|---|---|
| j224, j231, j238 | test pratique **minuté à 90 min** + 6 leçons + le reste. Ce ne sont pas les leçons qui débordent, c'est la somme des activités déclarées. |
| j357 | **artefact connu de l'estimateur**, déclaré au CP0 : son test pratique est explicitement hebdomadaire (« chaque jour : 2 exercices… fin de semaine : simulation complète ») et l'estimateur le compte comme une journée. Seul cas sur 52. |

Ces trois premières relèvent d'un arbitrage entre le minutage annoncé du test pratique et le
budget de la journée — c'est-à-dire d'une décision sur le contenu, pas d'un bug de génération.
Elles sont transmises au CP15.

---

## 4. Le défaut trouvé en corrigeant : la page de revue se contredit elle-même

En vérifiant le résultat sur j77, une phrase a arrêté la lecture. La **même page** contient :

> **Thème de la semaine :** Express complet : middlewares, erreurs, validation, structure

et, quinze lignes plus bas :

> La semaine 11 a bâti la culture d'ingénieur au-delà du code applicatif. Le réseau
> (jour 71) : la pile sous HTTP… Linux avancé (jour 72)… Git avancé (jour 73)… Documentation
> technique (jour 74)… Lecture de code (jour 75)… Modularité (jour 76)…

Les deux ne parlent pas de la même semaine. Le cas le plus net est **j56** :

> **Thème de la semaine :** PROJET 1 : TaskFlow CLI + revue mensuelle 2
> La semaine 8 a ouvert le mois 3 et posé le socle du développement backend. **HTTP en
> profondeur (jour 50)**…

### La mesure

La « Synthèse de la semaine » cite explicitement les numéros de journée. C'est donc un témoin
vérifiable, et non une impression.

| | |
|---|---|
| revues dont la synthèse cite ≥ 3 journées | **21 / 52** |
| synthèses ne citant QUE des journées de leur propre semaine | **21 / 21** |
| revues dont le **thème** contredit leur propre **synthèse** (recouvrement < 25 %) | **9** |

Les neuf : **j42 (s6) · j49 (s7) · j70 (s10) · j77 (s11) · j84 (s12) · j196 (s28) ·
j217 (s31) · j224 (s32) · j238 (s34)**.

La synthèse est fiable dans 21 cas sur 21. **C'est donc le thème qui est faux**, avec le
`bilan`, le `practicalTest` et les `criteria` qui l'accompagnent dans
`scripts/data/program-structure.mjs` — un test pratique sur Express est proposé à la fin d'une
semaine consacrée au réseau, à Linux et à Git.

### Pourquoi ce n'est PAS corrigé ici

Le réflexe serait de ré-attacher chaque enregistrement de semaine à la bonne semaine. J'ai
testé l'hypothèse : pour chacune des neuf, on cherche à quelle synthèse son thème correspond le
mieux.

| semaine | meilleure correspondance | décalage |
|---|---|---|
| s6 | s5 | −1 |
| s7 | s5 | −2 |
| s10 | s8 | −2 |
| s11 | s8 | −3 |
| s12 | s8 | −4 |
| s28 | s27 (1,00) | −1 |
| s31 | s30 (1,00) | −1 |
| s32 | s30 (1,00) | −2 |
| s34 | s17 | −17 |

**Le décalage n'est pas constant, et deux enregistrements pointent vers la même semaine** (s31
et s32 vers s30 ; s10, s11 et s12 vers s8). Une ré-attribution mécanique est donc impossible :
il n'existe pas de permutation qui remette tout en place. Ce que ces chiffres décrivent, c'est
un **plan de journées révisé sans que les enregistrements de semaine ne suivent** — des
journées déplacées ou insérées, dont le contenu s'est étalé sur les semaines voisines.

Réparer cela signifie **réécrire le thème, le bilan, le test pratique et les critères de passage
de neuf semaines**, c'est-à-dire produire du contenu pédagogique neuf qui change ce que
l'apprenant doit faire ces jours-là. Ce n'est pas une correction de génération : c'est une
décision de curriculum. Elle est **documentée, chiffrée, localisée
(`scripts/data/program-structure.mjs`) et transmise au CP15**, avec les deux sondes qui la
prouvent (`scripts/v72/theme-vs-synthese.mjs`, `scripts/v72/themes-vs-jours.mjs`).

---

## 5. Vérification

| contrôle | résultat |
|---|---|
| revues > 7 leçons | **0** |
| leçons citées par au moins une journée | **103 / 128**, inchangé |
| ordre des 365 jours | **inchangé** (`days[i].day === i+1`) |
| 128 / 365 / 365 | inchangé |
| corpus des leçons | **`d535fcf6…` — aucune leçon touchée** |
| `npm test` | **1420 / 1420** |
| `npm run gates:active` | **vert** |
| `data/progress.json` | non touché (absent du dépôt) |
