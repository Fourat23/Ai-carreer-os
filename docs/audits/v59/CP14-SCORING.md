# V59 · CP14 — Grille gelée rejouée, classification des 36 routes

Grille de `docs/V59-CRITERIA-FROZEN.md` §2, douze catégories sur 5.
Chaque note est adossée à une mesure ou à une capture. **Aucune note n'a été
révisée parce que le total serait décevant.**

## Réserve de méthode, dite avant les chiffres

Le §2 demande la grille « à la clôture **et** à l'ouverture ». Elle n'a pas été
remplie au CP0 : le CP0 a produit des mesures, pas des notes. La colonne AVANT
est donc **dérivée au CP14** de l'instantané `docs/audits/v59/cp0-before.json`,
figé avant toute modification et vérifié intact à l'octet près par
`npm run v59:check` (SHA-256 `f444e45a…`), plus du rapport CP0 lui-même.

Cette dérivation est traçable, mais elle n'est pas un relevé contemporain. Je
le dis plutôt que de la présenter comme telle.

## Faits structurels, sur les 36 routes

| Fait mesuré | AVANT | APRÈS |
|---|:--:|:--:|
| routes avec un nombre de `h1` ≠ 1 | **10 / 36** | **0 / 36** |
| `fontSteps < 7` (crans typographiques réellement rendus) | 14 / 36 | **8 / 36** |
| routes sans aucun `h2` | 3 / 36 | 2 / 36 |
| violations axe critical/serious | 0 | 0 |
| violations axe **toutes gravités** | 3 (`landmark-unique`) | **0** |
| `overflow` + `clipped` cumulés | 0 | 0 |
| `dominance ≥ 0,85` (bloc unique écrasant) | 8 / 36 | 8 / 36 |
| `gapMedian` = exactement 20 px | 19 / 36 | 19 / 36 |
| `widthVariants = 1` (aucune variation de largeur) | 29 / 36 | 28 / 36 |
| `cardShare ≥ 0,90` (le texte vit dans une carte) | 19 / 36 | 19 / 36 |
| routes sans aucun motif propriétaire | **26 / 36** | **26 / 36** |
| `typeRange < 3,2` | 8 / 36 | 8 / 36 |
| motifs propriétaires distincts | 5 | 5 |

Moyennes : `surfaces` 6,86 → 6,81 · `shadows` 2,97 → 2,97 ·
`dominance` 0,657 → 0,655 · `typeRange` 3,623 → 3,623 ·
`fontSteps` 7,08 → **7,78** · `massRatio` 7,12 → 7,10 ·
`cardShare` 0,730 → 0,730 · `motifShare` 0,013 → 0,013.

### Couverture des motifs, avant / après

| Motif | AVANT | APRÈS | |
|---|---|---|---|
| `PositionRing` | `/` `/parcours` `/synthese` `/week/12` | `/synthese` `/week/12` | **4 → 2** |
| `TrajectoryMap` | `/` `/synthese` | `/` `/synthese` | 2 → 2 |
| `YearBand` | `/calendar` `/parcours` `/month/3` | idem | 3 → 3 |
| `PhaseRail` | `/day/80` `/doc/…` | idem | 2 → 2 |
| `EvidenceMark` | `/projects` `/reviews` | idem | 2 → 2 |

La seule évolution est une **dé-duplication** : `PositionRing` disparaît de `/`
et de `/parcours`, où il disait la même chose que `TrajectoryMap` et
`YearBand` sur la même page. C'est une grammaire plus stricte — et une
couverture qui n'augmente pas. **Le nombre de routes portant un motif reste
10 sur 36.**

## La grille

| # | Catégorie | AVANT | APRÈS | Justification |
|:--:|---|:--:|:--:|---|
| 1 | Hiérarchie | 3,4 | **4,1** | 10 routes rendaient un plan de titres faux (`/reviews` en avait trois) → 0. Le titre d'un document a désormais un rang propre (`.ed-doctitle`, `.doc-h1`). Mais `dominance ≥ 0,85` reste sur 8 routes et 6 routes gardent la primitive héritée `page-head`. |
| 2 | Composition | 3,0 | **3,1** | `widthVariants = 1` sur 28 routes (29 avant), `gapMedian = 20 px` sur 19 routes, inchangé. **Le levier n° 1 désigné par le CP0 n'a pas été pris.** |
| 3 | Profondeur | 4,0 | **4,0** | `surfaces` 6,86 → 6,81, `shadows` 2,97 → 2,97. Aucun fond ni ombre ajouté — c'était interdit, et rien n'en manquait. |
| 4 | Densité | 3,4 | **3,4** | `cardShare` 0,730 inchangé ; 19 routes mettent ≥ 90 % de leur texte dans une carte. Non traité. |
| 5 | Scannabilité | 3,6 | **4,0** | `fontSteps` 7,08 → 7,78 ; routes sous 7 crans : 14 → 8. Onze titres de bloc cessent d'avoir la taille du texte courant. `/missions` gagne un plan de document. |
| 6 | Affordance | 3,8 | **4,0** | Les 100 pastilles du barème 0-5 passent de 20 × 20 à ≥ 24 × 24 de surface cliquable, sans bouger d'un pixel visible. Le reste des petites cibles est analysé plus bas. |
| 7 | Typographie | 3,3 | **4,0** | `--fs-lg`, appelé treize fois, n'était **défini nulle part** : onze titres de bloc rendus à 15 px sur neuf routes. Corrigé et mesuré. `typeRange` n'a pas bougé — voir la note ci-dessous. |
| 8 | Cohérence | 3,9 | **4,4** | Un seul `h1` par page sur 36/36. Les huit jetons `--fam-*` ne servent plus deux taxonomies à la fois (CP5). Régions de code numérotées, repères de navigation uniques : axe passe de 3 violations à **0, toutes gravités**. |
| 9 | **Identité** | 3,0 | **3,2** | `motifShare` 0,013 inchangé. **26 routes sur 36 ne portent toujours aucun motif.** Le seul mouvement est une dé-duplication. Seuil requis : **4,40**. |
| 10 | **Originalité** | 3,1 | **3,3** | `cardShare` inchangé. Test aveugle : composition reconnaissable sur **5 surfaces sur 8**. Seuil requis : **4,20**. |
| 11 | **Premium** | 3,6 | **3,9** | Finition réelle : plus de titre imprimé deux fois, plus d'entités HTML à l'écran, plus de « 1 artefacts », titres de bloc à leur rang. Mais le rythme vertical reste uniforme (20 px sur 19 routes). Seuil requis : **4,40**. |
| 12 | Utilité learner | 3,9 | **4,3** | `/doc` reçoit la grammaire de famille pédagogique que le produit possédait déjà mais n'appliquait pas, et son rail cesse d'être masqué à toute largeur. Le sommaire éditorial devient un rail de lecture avec la position réelle. `/day/364` ne réserve plus une colonne vide. |
| | **Moyenne** | **3,50** | **3,81** | |

### Sur `typeRange`, qui n'a pas bougé d'un millième

`typeRange = maxFont / bodyPx`. Le plus grand corps d'une page est son titre
display (49 px), le plus petit son corps. Faire passer onze titres de bloc de
15 à 18 px ne touche **ni l'un ni l'autre** :

```
typeRange moyen des 36 routes  3,623 → 3,623
routes sous le seuil R4 (3,2)       8 →     8
```

Le défaut le plus étendu du sprint — un jeton manquant appelé treize fois — est
**invisible pour la métrique censée mesurer la typographie**. C'est le miroir
exact de la régression V58 CP6, que ses métriques ne voyaient pas non plus.
La conclusion vaut d'être écrite : *les métriques gelées prouvent qu'on n'a
rien cassé de ce qu'elles couvrent. Elles ne prouvent jamais qu'une page est
bonne.* La grille reste gelée quand même — la changer en cours de sprint
serait pire.

### Sur les petites cibles restantes

Mesuré à 375 px, hauteur de cible < 24 px, contrôles décoratifs exclus :

| Route | Élément | Taille | Décision |
|---|---|---|---|
| `/` | `a.tmap-cell` × 365 | 17 × 17 | **Conservé.** La présentation *est* l'information : 365 jours en champ mesuré. WCAG 2.2 SC 2.5.8 prévoit l'exception « essentiel », et chaque jour reste atteignable depuis `/calendar`, `/month/[id]`, `/week/[id]`. |
| `/lab` | `a.lab-day-link` × 400 | 40 × 20 | Conservé : même champ dense, même raisonnement. |
| `/calendar` | `a.week-label` × 52 | 309 × 17 | Conservé : cible très large, séparée verticalement. Porter chacune à 24 px ajouterait 364 px au calendrier. |
| `/reviews` | `a.rv-month-k`, `a.rv-week` | 245 × 20, 39 × 23 | Conservé, même raison. |
| `/skills` | `button.dot` × 100 | 20 × 20 | **Corrigé** — seul contrôle réellement visé au pouce. |

Ce sont des choix, pas des oublis : ils sont écrits pour pouvoir être contestés.

## Classification des 36 routes — §7

Définition **gelée** (V56 §4, inchangée) : ≥ 3 critères R sur 5, **et**
`overflow = 0`, `clipped = 0`, axe 0 critical/serious.
R1 structure · R2 `dominance ≥ 0,35` · R3 `surfaces ≥ 6` **et** `shadows ≥ 3` ·
R4 `typeRange ≥ 3,2` · R5 ≥ 1 motif.

| Classe | Nombre | Routes |
|---|:--:|---|
| **RECOMPOSÉE** | **34** | les 36 autres que celles ci-dessous |
| **RESKINNÉE** | **2** | `/career`, `/resources` |
| **ANCIENNE** | **0** | — |
| **EXEMPTÉE** | **0** | aucune exemption n'a été déclarée avant mesure (§7) |
| | **36** | somme exacte |

### Le même calcul appliqué à l'instantané CP0 donne **34** aussi

C'est le résultat le plus important de ce checkpoint et il ne m'arrange pas :
**la classification n'a pas bougé.** V59 n'a fait passer aucune route d'une
classe à l'autre.

### Pourquoi `/career` et `/resources` échouent, mesuré

| | `surfaces` | `shadows` | `dominance` | `typeRange` | motifs | R |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| `/career` | 5 | 2 | 0,866 | 2,88 | 0 | `11000` — 2/5 |
| `/resources` | 3 | 2 | 0,887 | 2,88 | 0 | `11000` — 2/5 |
| `/guide` *(même coquille)* | 6 | 3 | 0,889 | 2,88 | 0 | `11100` — 3/5 |

Trois critères manquent, et chacun a une raison nommable :

- **R4 punit la famille éditoriale pour avoir raison.** `maxFont` vaut 49 px
  sur ces routes comme partout ailleurs ; c'est `bodyPx` qui vaut **17** au
  lieu de 12-13, parce qu'un document long se lit en `--fs-read: 16,5 px`.
  Atteindre 3,2 exigerait de descendre le corps de lecture sous 15,3 px.
  **Dégrader la lisibilité d'un document pour satisfaire un ratio est
  exactement ce que le sprint interdit.** Refusé.
- **R3** sépare `/guide` de `/career` alors que les trois partagent la **même
  coquille** : l'écart vient du contenu (tableaux, citations, blocs de code du
  document `/guide`), pas du design. Ajouter des fonds à `/career` pour
  atteindre 6 serait du remplissage de sonde. Interdit au §4. Refusé.
- **R5** demanderait de poser un motif sur un document du corpus sans
  `data-family`. Refus déjà posé au CP5 et maintenu : il faudrait inventer une
  équivalence que le corpus ne porte pas.

Les deux routes sont donc closes **honnêtement, en échec** : améliorées
(entités décodées, titre unique, rail de lecture avec position réelle,
compteurs par section dérivés) mais **non recomposées**. Elles déclenchent la
condition bloquante n° 1.

### Écart avec le décompte de clôture V58

Le rapport V58 comptait « 15 recomposées / 2 reskinnées / 1 non traitée » — un
décompte des routes **traitées pendant V58**. Le présent tableau applique la
définition §7 à **l'état courant des 36 routes**, ce que les critères V59
exigent. Les deux comptes répondent à deux questions différentes. **Le verdict
de V58 n'est ni rejoué ni réinterprété.**

## Conditions bloquantes — §3.2

| # | Condition | État |
|:--:|---|:--:|
| 1 | route ancienne/intermédiaire restante > 0 sans exemption | **ÉCHEC** — 2 RESKINNÉES, 0 exemption déclarée |
| 2 | blind-difference insuffisant | **ÉCHEC** — composition 62,5 % < 80 % (CP11) |
| 3 | signature dépendante de la seule palette | OK — 0/8 surfaces dépendantes de l'indigo |
| 4 | plus de 5 motifs | OK — 5, ensemble fermé, vérifié par la gate |
| 5 | route cassée en navigation aléatoire | OK — 0/12 (CP12) |
| 6 | donnée inventée | OK — tout chiffre affiché est dérivé du corpus ou de `progress.json` |
| 7 | `progress.json` muté par consultation | OK — blob `3236040…` inchangé |
| 8 | corpus ou curriculum modifié | OK — SHA-1 `4c1f3028…` inchangé |
| 9 | axe critical/serious > 0 | OK — 0 sur 36, et 0 toutes gravités |
| 10 | responsive avec perte d'information | OK — 24 routes × 10 largeurs, 0 perte |
| 11 | instantané CP0 modifié | OK — SHA-256 vérifié par la gate |
| 12 | critères ou questions absents du dépôt | OK — vérifié par la gate |

## Seuils de score — §3.1

| Seuil | Exigé | Mesuré | |
|---|:--:|:--:|:--:|
| moyenne des 12 | ≥ 4,50 | **3,81** | ❌ |
| aucune catégorie < 4,00 | — | 5 catégories sous 4,00 | ❌ |
| identité | ≥ 4,40 | **3,2** | ❌ |
| originalité | ≥ 4,20 | **3,3** | ❌ |
| premium | ≥ 4,40 | **3,9** | ❌ |

`REFERENCE_GRADE` est hors d'atteinte par cinq seuils et deux conditions
bloquantes. Ce n'était pas une question de dixièmes.
