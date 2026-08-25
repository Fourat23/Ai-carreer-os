# V59 — RAPPORT FINAL
## Reference-Grade Product Signature & Convergence Closure

Sprint CP0 → CP15, mené d'un bout à l'autre sur la branche
`claude/ai-career-os-saas-phfg49`.

---

# VERDICT

## `IMPROVED`

Ni `REFERENCE_GRADE`, ni `STRONG_IMPROVEMENT`.

**Pourquoi pas `REFERENCE_GRADE`** — cinq seuils de score et deux conditions
bloquantes échouent. Ce n'était pas une affaire de dixièmes : identité mesurée
**3,2** pour un seuil à 4,40, moyenne **3,81** pour un seuil à 4,50.

**Pourquoi pas `STRONG_IMPROVEMENT`** — c'est ici que la franchise compte.
V59 avait **deux objectifs ordonnés**. Le premier était de clore honnêtement
`/career`, `/resources` et `/doc/[...slug]`. Le second, principal, était de
faire passer le produit de « cohérent » à « visuellement identifiable et
propriétaire ».

- Objectif A : **un tiers atteint.** `/doc/[...slug]` est clos et satisfait la
  définition gelée. `/career` et `/resources` **restent RESKINNÉES**.
- Objectif B : **non atteint.** `motifShare` 0,013 → 0,013. Routes portant un
  motif : **10/36 → 10/36**. Routes sans aucun motif : **26 → 26**. Identité
  3,0 → 3,2. Originalité 3,1 → 3,3.

Un sprint dont l'objectif principal produit un delta de deux dixièmes sur les
deux catégories qui le mesurent n'est pas une amélioration forte. Il est une
amélioration. Le verdict inférieur exact, comme le §3.3 l'exige.

**Ce que V59 a réellement fait**, et qui vaut d'être compté : il a trouvé et
fermé des défauts que six sprints de métriques n'avaient pas vus.

---

# 1. Ce qui a réellement changé

## 1.1 Dix routes rendaient un plan de titres faux

| | routes avec un nombre de `h1` ≠ 1 |
|---|---|
| **avant** | `/skills` 2 · `/projects` 2 · `/reviews` **3** · `/month/3` 2 · `/week/12` 2 · `/career` 2 · `/guide` 2 · `/resources` 2 · `/doc/…` 2 · `/capstones` **0** |
| **après** | **aucune — 36/36 à exactement un `h1`** |

Sur `/resources`, les deux `h1` disaient le même mot, « Ressources », l'un sous
l'autre. Aucun texte n'a été perdu : le titre du document disparaît quand il
n'apporte rien de plus que le titre de surface, et descend au rang h2 quand il
dit autre chose (`/career` → « Stratégie CV / LinkedIn / GitHub »).

## 1.2 `--fs-lg` : un jeton appelé treize fois, défini nulle part

`font-size: var(--fs-lg)` sans repli, avec le jeton indéfini, est une
déclaration **invalide au calcul** : la propriété retombe sur `unset`, donc,
pour une propriété héritée, sur la taille du parent.

Mesuré au navigateur avant correction — **onze titres de bloc rendus à 15 px**,
la taille exacte du texte d'interface qui les entoure, sur neuf routes :
`/revisions`, `/month/[id]`, `/lab`, `/projects`, `/reviews`, `/pipelines`,
`/settings`, `/notes`, `/glossary`. Seule la graisse 650 les en distinguait.

18 px n'est pas un cran inventé : c'est celui que `.prose h2` code en dur
depuis V52. Le jeton nomme un rang qui existait déjà.
Effet mesuré : `fontSteps` moyen 7,08 → **7,78**, routes sous 7 crans **14 → 8**.

## 1.3 Les entités HTML du hero de `/doc`

L'accroche des leçons de fond affichait littéralement
`qu&#39;est-ce que c&#39;est`. Le CP2 avait décodé les intitulés de sections,
mais pas `docTitle` / `docLead`, extraits par la page elle-même.

## 1.4 `/doc/[...slug]` — une grammaire déjà payée, jamais appliquée

Le balisage portait **déjà** `data-family` et `fam-h2`, mais toutes les règles
de mise en forme étaient écrites `.day-view article.prose h2.fam-h2 { … }`,
verrouillées sur `/day/[id]`. Et `.doc-rail { display: none }` était écrit
**après** sa propre media query : le rail n'apparaissait à aucune largeur.

Corrigé, la route satisfait maintenant la définition gelée de « recomposée ».

## 1.5 Le code couleur des familles était inapprenable

Depuis V58, les huit jetons `--fam-*` servaient **deux taxonomies à la fois** :
`--fam-learn` signifiait « comprendre » sur une section de Journée **et**
« catalogue » sur une bande d'identité. Une teinte à deux sens ne s'apprend
pas. Les deux taxonomies ont désormais chacune la sienne (`--fam-*` pour la
nature pédagogique, `--surf-*` pour le type de page).

## 1.6 Accessibilité — de 3 violations à 0, toutes gravités

Tous les blocs de code d'un document portaient la même étiquette de région ; un
lecteur d'écran annonçait *n* régions indiscernables. Elles sont numérotées sur
le total réel du document. Sur `/security`, deux repères imbriqués portaient le
même nom : l'étiquette intérieure est retirée.

## 1.7 Dé-duplication des représentations

`PositionRing` disparaît de `/` et de `/parcours`, où il répondait à la même
question que `TrajectoryMap` et `YearBand` sur la même page (4 routes → 2).
`/day/364` ne réserve plus une colonne de rail vide.

## 1.8 Divers, mesuré

Le sommaire éditorial devient un rail de lecture affichant la position réelle
dans le document. `/missions` gagne un plan de document. Les 100 pastilles du
barème 0-5 passent à ≥ 24 × 24 de surface cliquable sans bouger d'un pixel
visible. `/security` n'affiche plus « 1 artefacts ».

---

# 2. Ce que V59 n'a PAS fait

Le CP0 avait désigné deux leviers. **Aucun des deux n'a été pris.**

| Levier désigné au CP0 | avant | après |
|---|:--:|:--:|
| sortir de la carte comme primitive par défaut | 19/36 routes à `cardShare ≥ 0,90` | **19/36** |
| introduire une variation de largeur | 29/36 routes à `widthVariants = 1` | **28/36** |

Et la signature n'a pas été propagée : 26 routes sur 36 ne portent toujours
aucun motif. Le sprint a passé son énergie sur la **correction** et la
**grammaire**, pas sur la **composition**. C'est un choix qui s'est fait par
accumulation de défauts trouvés, pas par décision — et il faut le dire ainsi.

## Trois refus assumés

- **Étendre `[data-family]` au-delà de `/day` et `/doc`.** `/lessons` classe par
  catégorie, `/skills` par état, `/diagnostics` par taxonomie cognitive : trois
  taxonomies réelles mais **différentes**. Les faire correspondre aux huit
  familles pédagogiques demanderait d'inventer une équivalence que le corpus ne
  porte pas.
- **Retirer `PositionRing` de `/synthese`**, où il coexiste avec
  `TrajectoryMap`. Le faire le ramènerait à une seule route et violerait la
  règle gelée V56 « ≥ 2 surfaces par motif ». Conflit publié, non contourné.
- **Descendre le corps de lecture de `/career` et `/resources`** pour atteindre
  `typeRange ≥ 3,2`. Voir §4.

---

# 3. Réponses aux 12 questions de certification (§9)

**1. L'instantané `cp0-before.json` est-il bit-à-bit identique à son hash gelé ?**
**OUI.** SHA-256 `f444e45af361c3562771510391ecc59080b6e9c5885c3dfcf72f3bc2bfb2437d`,
vérifié par `npm run v59:check` à chaque exécution de `gates:active`. La règle
zéro a tenu : le fichier n'a jamais été réécrit, contrairement à V58.
L'AFTER est écrit à un chemin distinct, `docs/audits/v59/cp15-after.json`.

**2. Une métrique a-t-elle été supprimée, adoucie, ou un seuil déplacé après le commit des critères ?**
**NON.** Les métriques V56/V57 sont reprises à l'identique, la définition R de
« recomposée » est celle de V56 §4, les seuils du §3 sont ceux du commit
initial. **Deux sondes de sprint ont été corrigées**, et c'est autre chose : mon
détecteur de débordement comptait les éléments d'un conteneur à défilement
volontaire (47 faux positifs sur `/day/80`), et mon détecteur de perte
d'information comptait les éléments `sr-only`, coupés à 1 px exprès. Les deux
corrections **durcissent la lecture des résultats en la rendant vraie** ; elles
ne touchent aucune métrique gelée ni aucun seuil. Les chiffres erronés sont
publiés aux CP12 et CP13 à côté des corrigés.

**3. Combien de routes anciennes/intermédiaires restent-elles, nommément ?**
**DEUX : `/career` et `/resources`**, classées RESKINNÉES.
ANCIENNES : 0. EXEMPTÉES : 0 — aucune exemption n'a été déclarée avant mesure,
donc aucune n'est invoquée après. Classification : 34 + 2 + 0 + 0 = **36**.

**4. Un fond, une ombre, un wrapper ou une carte a-t-il été ajouté pour faire basculer une sonde ?**
**NON.** `surfaces` moyen 6,86 → **6,81** et `shadows` 2,97 → 2,97 : les deux
compteurs que ce genre de triche fait monter n'ont pas monté — l'un a
légèrement baissé, parce que des éléments en double ont été retirés.

**5. Un sixième motif propriétaire a-t-il été introduit, sous quelque nom que ce soit ?**
**NON.** Cinq, ensemble fermé, vérifié à chaque exécution de la gate. Le rail
de lecture éditorial est une table des matières standard tenue à la hauteur du
document, pas un motif — et il est écrit comme tel dans le code. `.ed-doctitle`
et `.doc-h1` sont des rangs typographiques, pas des composants.

**6. Une donnée affichée est-elle fabriquée, estimée ou extrapolée ?**
**NON.** Les compteurs par section de `/resources` sont un décompte de `<li>`
dans le HTML rendu. Le pourcentage du rail de lecture est calculé sur le
rectangle réel de l'article. Les zéros de `/settings` sont l'état réel de
`data/progress.json`. Le mot « entrées » plutôt que « ressources » a été choisi
parce que la dernière section liste cinq conseils de méthode, pas cinq
références : compter juste prime sur l'étiquette flatteuse.

**7. `progress.json` a-t-il été muté par une simple consultation ?**
**NON.** Blob `323604021055588a9528a86875f36598dbdc7758` à l'ouverture comme à
la clôture, après plusieurs centaines de chargements de pages en sonde.

**8. Le curriculum, une leçon, un exercice, une mission, un capstone, un diagnostic ou l'ordre des 365 jours a-t-il été modifié ?**
**NON.** Corpus SHA-1 `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3` inchangé
(gate V48). Ordre des 365 jours certifié inchangé (gate V51, « 365 jours ·
376/376 exercices mappés · 0 orphelin »). `git status` sur `curriculum/` et
`data/` : vide. Aucun fichier de contenu n'a été touché de tout le sprint.

**9. La navigation aléatoire pré-enregistrée a-t-elle révélé une route cassée, et le résultat d'ouverture est-il publié sans réinterprétation ?**
**Aucune route cassée : 0 sur 12.** Le tirage (graine `V59-SIGNATURE`) n'a pas
été touché. Le premier passage annonçait **5 cassées sur 12** : cinq faux
positifs de ma propre sonde, diagnostiqués sur capture. Le chiffre initial est
publié au CP12 à côté du corrigé et de la cause. Le seul signal réseau,
`404 (Not Found)` sur `/resources`, est en réalité `GET /favicon.ico` —
demandé une fois par session de navigateur et attribué par hasard à la première
page chargée. Le produit n'a pas d'icône de site ; c'est déclaré, non corrigé,
la création d'un logo étant explicitement hors périmètre.
Le résultat de navigation aléatoire de **V58** porte sur un autre tirage,
appartient à V58, et n'est ni rejoué ni réinterprété.

**10. Le blind-difference atteint-il ≥ 90 % « même produit » et ≥ 80 % « composition identifiable » ? Résultats bruts publiés ?**
**Le premier OUI, le second NON.**

| | exigé | mesuré | |
|---|:--:|:--:|:--:|
| « manifestement le même produit » | ≥ 90 % | **100 %** (8/8) | ✅ |
| « composition identifiable » | ≥ 80 % | **62,5 %** (5/8) | ❌ |
| dépendance à l'indigo | 0 | 0/8 | ✅ |
| surface cassée | 0 | 0/8 | ✅ |

Résultats bruts publiés au CP11, échecs nommés : `/resources` **non**,
`/career` **non**, `/lessons` **partiel**. Second passage effectué après
correction des défauts trouvés : **les jugements n'ont pas été révisés à la
hausse.**

**11. Une perte d'information a-t-elle été mesurée sur l'une des 10 largeurs ?**
**NON.** 24 routes × 10 largeurs = 240 couples, 0 en défaut : aucun débordement
de page, aucun débordement local hors conteneur défilable, aucune perte.

**12. axe-core rapporte-t-il 0 critical et 0 serious sur toutes les routes modifiées et sur l'échantillon aléatoire ?**
**OUI**, et mieux : **0 violation toutes gravités confondues sur les 36
routes**. À l'ouverture du CP13, trois routes portaient un `landmark-unique`
modéré ; il n'en reste aucun.

---

# 4. Pourquoi `/career` et `/resources` ne sont pas closes

Elles échouent trois des cinq critères R. Chacun a une raison nommable, et
aucune ne se règle sans faire quelque chose d'interdit.

| | `surfaces` | `shadows` | `dominance` | `typeRange` | motifs | R |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| `/career` | 5 | 2 | 0,866 | 2,88 | 0 | `11000` — 2/5 |
| `/resources` | 3 | 2 | 0,887 | 2,88 | 0 | `11000` — 2/5 |
| `/guide` *(même coquille)* | 6 | 3 | 0,889 | 2,88 | 0 | `11100` — 3/5 |

- **R4 punit la famille éditoriale pour avoir raison.** `maxFont` vaut 49 px
  sur ces routes comme partout ; c'est `bodyPx` qui vaut **17** au lieu de
  12-13, parce qu'un document long se lit en `--fs-read: 16,5 px`. Atteindre
  3,2 exigerait de descendre le corps de lecture **sous 15,3 px**. Dégrader la
  lisibilité d'un document pour satisfaire un ratio est exactement ce que le
  §4 interdit.
- **R3** sépare `/guide` de `/career` alors que les trois partagent la **même
  coquille** : l'écart vient du contenu du document (tableaux, citations, blocs
  de code), pas du design. Ajouter des fonds à `/career` serait du remplissage
  de sonde.
- **R5** demanderait de poser un motif sur un document du corpus dépourvu de
  `data-family` — inventer une équivalence.

Elles sont donc closes **en échec, honnêtement** : réellement améliorées
(entités décodées, titre unique, rail de lecture avec position réelle,
compteurs par section dérivés) mais **non recomposées**.

---

# 5. La leçon de méthode de ce sprint

Le défaut le plus étendu trouvé en V59 — un jeton typographique appelé treize
fois et défini nulle part, onze titres de bloc rendus à la taille du texte
courant sur neuf routes — **n'a bougé aucune métrique gelée** :

```
typeRange moyen des 36 routes   3,623 → 3,623
routes sous le seuil R4 (3,2)        8 →     8
```

`typeRange = maxFont / bodyPx` ne regarde que les deux extrêmes. Tout ce qui se
passe entre eux lui est invisible. C'est le miroir exact de la régression V58
CP6 (`.cat-row-link`), qu'aucune métrique ne voyait non plus.

**Les métriques gelées prouvent qu'on n'a rien cassé de ce qu'elles couvrent.
Elles ne prouvent jamais qu'une page est bonne.** Les quatre défauts les plus
réels de ce sprint ont tous été trouvés en regardant des captures — pas en
lisant des nombres. La grille reste gelée malgré tout : la modifier en cours de
sprint aurait été pire que de la savoir aveugle.

Deuxième leçon, plus désagréable : **mes propres sondes ont produit trois faux
diagnostics** (47 faux débordements sur `/day/80`, 5 routes « cassées » sur 12,
20 couples « en défaut » au CP13). Chaque fois, la vérification est venue d'une
capture. Un instrument neuf doit être vérifié contre l'œil avant de servir à
juger.

---

# 6. La grille, et la question finale

## Les douze catégories

| # | Catégorie | AVANT | APRÈS | Δ |
|:--:|---|:--:|:--:|:--:|
| 1 | Hiérarchie | 3,4 | 4,1 | +0,7 |
| 2 | Composition | 3,0 | 3,1 | +0,1 |
| 3 | Profondeur | 4,0 | 4,0 | 0 |
| 4 | Densité | 3,4 | 3,4 | 0 |
| 5 | Scannabilité | 3,6 | 4,0 | +0,4 |
| 6 | Affordance | 3,8 | 4,0 | +0,2 |
| 7 | Typographie | 3,3 | 4,0 | +0,7 |
| 8 | Cohérence | 3,9 | 4,4 | +0,5 |
| 9 | **Identité** | 3,0 | **3,2** | +0,2 |
| 10 | **Originalité** | 3,1 | **3,3** | +0,2 |
| 11 | **Premium** | 3,6 | **3,9** | +0,3 |
| 12 | Utilité learner | 3,9 | 4,3 | +0,4 |
| | **Moyenne** | **3,50** | **3,81** | **+0,31** |

Justification mesurée de chaque note : `docs/audits/v59/CP14-SCORING.md`.
La colonne AVANT a été dérivée au CP14 de l'instantané CP0 immuable — elle
n'est pas un relevé contemporain, et c'est dit là-bas comme ici.

| Seuil `REFERENCE_GRADE` | exigé | mesuré | |
|---|:--:|:--:|:--:|
| moyenne | ≥ 4,50 | 3,81 | ❌ |
| aucune catégorie < 4,00 | — | 5 sous 4,00 | ❌ |
| identité | ≥ 4,40 | 3,2 | ❌ |
| originalité | ≥ 4,20 | 3,3 | ❌ |
| premium | ≥ 4,40 | 3,9 | ❌ |

Conditions bloquantes : **n° 1** (2 routes intermédiaires, 0 exemption) et
**n° 2** (blind-difference insuffisant) échouent. Les dix autres passent.

## Question finale obligatoire (§10)

> « Si je masque le logo, la sidebar, le nom AI Career OS et la couleur
> d'accent principale, est-ce que l'interface possède encore une signature
> suffisamment forte pour être reconnue comme un même produit ? »

**OUI — mais sur une partie du produit seulement.**

Testé en niveaux de gris, marque masquée : les huit surfaces sont reconnues
comme le même produit (8/8), et **aucune** ne dépend de l'indigo. Sur cinq
d'entre elles la composition elle-même est spécifique : le champ de douze
pistes de jours, le rail de phases avec ses familles pédagogiques, le bloc
« Ce que ce laboratoire ne fait pas » posé au-dessus des résultats.

Mais ce qui porte cette reconnaissance sur les trois autres, c'est **la bande
d'identité** — surtitre, titre display, accroche, chiffres alignés à droite.
C'est un système cohérent, pas encore une signature. Et **26 routes sur 36 ne
portent aucun motif propriétaire.**

> « Cette signature est-elle suffisamment spécifique pour ne pas pouvoir être
> remplacée par celle d'un dashboard SaaS générique sans perte d'identité ? »

**NON, pas sur l'ensemble du produit.**

Sur `/`, `/day/80`, `/doc`, `/security`, `/cloud-lab` : oui, sans hésitation —
remplacer ces compositions par celles d'un tableau de bord générique détruirait
ce que la page dit. Sur `/career`, `/resources`, `/lessons` : non. Il reste une
colonne de document avec un sommaire à droite, ou une liste de catalogue
ordinale. `cardShare` reste à 0,730 et 19 routes sur 36 mettent plus de 90 %
de leur texte dans une carte.

La réponse franche du CP0 à « pourrait-on changer le logo et vendre la page à
un autre SaaS ? » était **oui, sur la majorité des routes**. Après V59 elle est
**oui, sur une bonne moitié**. C'est un progrès. Ce n'est pas la réponse
qu'exige `REFERENCE_GRADE`.

---

# 7. Vérifications de clôture

| Contrôle | Résultat |
|---|---|
| `tsc --noEmit` | propre |
| `next build` | compilé |
| `npm test` | **1285 / 1285** |
| `npm run gates:active` | vert (38 gates) |
| axe-core, 36 routes | 0 critical, 0 serious, **0 toutes gravités** |
| Sonde gelée V56/V57, 36 routes | `overflow = 0`, `clipped = 0` |
| Responsive, 24 routes × 10 largeurs | 0 défaut, 0 perte d'information |
| Navigation aléatoire, 12 routes pré-tirées | 0 route cassée |
| Routes publiques | **36** |
| `h1` par route | **36/36 à exactement 1** |
| `data/progress.json` | blob `323604021055588a9528a86875f36598dbdc7758` |
| Corpus gelé | SHA-1 `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3` |
| Ordre des 365 jours | inchangé (gate V51) |
| `curriculum/` et `data/` | 0 fichier modifié |
| Motifs propriétaires | **5**, ensemble fermé |
| Instantané CP0 | SHA-256 `f444e45a…` **intact à l'octet près** |
| Instantané AFTER | `docs/audits/v59/cp15-after.json`, chemin distinct |
| Branche | `claude/ai-career-os-saas-phfg49` |
| Arbre de travail / stash | propre / 0 |

## Documents produits par ce sprint

`docs/V59-CRITERIA-FROZEN.md` (contrat, commité avant toute modification) ·
`docs/audits/v59/cp0-before.json` (immuable) · `CP0-REPORT.md` ·
`CP4-SIGNATURE-AUDIT.md` · `CP5-SIGNATURE-SYSTEM.md` ·
`CP11-BLIND-DIFFERENCE.md` · `CP12-RANDOM-NAV.md` ·
`CP13-RESPONSIVE-A11Y.md` · `CP14-SCORING.md` · `cp15-after.json` ·
`scripts/v59-check.mjs` · `scripts/v59-draw.mjs`.

**Le verdict de V58 n'a pas été rouvert ni réécrit.**
