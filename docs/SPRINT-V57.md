# SPRINT V57 — Propagation de la signature hors des pages vitrines

**Baseline** `b3e67f6` (fin V56) · **Branche** `claude/ai-career-os-saas-phfg49`
**Grille** `docs/V56-SCORING-FROZEN.md`, **reprise sans un seul seuil touché**,
empreinte vérifiée à l'octet près par `v57:check`.
**Addendum** `docs/V57-METRICS-ADDENDUM.md` — `topBlocks`, `cardsContainer`,
`cardsItem`, strictement additifs, n'entrant dans aucun critère R.
**Décisions** `docs/ADR-057-signature-propagation.md`.
**Ledger** `docs/audits/V57-RECOMPOSITION-LEDGER.md`.

## 1. Ce que le CP0 a établi, et qui a commandé le sprint

36 routes mesurées. 12 réellement recomposées, 4 seulement reskinnées, 19
jamais touchées par V55 ni V56, 1 exclue. 7 surfaces sur 36 portaient un motif.

Deux causes ont été trouvées, qui expliquent des échecs que V56 avait déclarés
sans les comprendre :

**`/diagnostics` et `/capstones`.** `DiagnosticsBoard` émettait une `<section>`
par domaine — 14 sections sœurs, et un hero de 1016×305 px plus petit que la
première section de contenu (1016×328). `dominance` étant le rapport d'aire du
plus grand bloc de premier niveau à la somme de ces blocs, elle plafonnait
mécaniquement à 0,102. **Aucune règle de fond, de bordure ou d'ombre ne pouvait
la déplacer** : les deux passes de CSS de V56 visaient un défaut de structure.
Second point : les 14 « cartes » mesurées n'étaient pas les items. V56 avait
bien dépouillé `.diag-card` et donné fond + bordure + rayon au conteneur
`.diag-grid` — la dé-cardification **avait pris effet**, elle avait **déplacé
la frontière d'un niveau vers le haut**. V56 a conclu à un échec de correctif
là où il y avait une erreur de lecture. C'est précisément ce que
`cardsContainer` / `cardsItem` rendent visibles.

**`/lab`.** Le débordement horizontal de 5 px traîné depuis V56 n'était pas une
boîte trop large : **aucun élément ne dépassait le viewport**. La grille rendait
376 cartes sur 188 rangées et son propre `scrollWidth` excédait sa largeur de
37 px par accumulation d'arrondi sous-pixel. Vérifié en faisant varier le
nombre d'items via les filtres : 376 → 5 px à 1440, 65 → 0, 19 → 0. Le nombre
d'éléments rendus **était** la cause ; le `min-width: 0` tenté en V56 ne
pouvait rien y faire. Et à 375 px le débordement montait à **67 px** — V56 ne
mesurait qu'à 1440.

## 2. Métriques ajoutées — pourquoi, et ce qu'elles ne mesurent pas

`dominance` reste la métrique de verdict et **tous ses résultats sont
conservés**. Le CP0 a montré qu'elle est bornée aux deux extrémités : 15
sections égales → 0,102 ; une seule section → 1,000 ; aucune section → 0,000.
Une page composée et une page sans structure peuvent rendre la même valeur.

`topBlocks` compte les blocs de premier niveau et **se lit avec `dominance`,
jamais à sa place**. Il ne mesure ni la qualité ni l'ordre des blocs, n'entre
dans aucun critère R et **ne peut faire passer aucune route**.

`cardsContainer` / `cardsItem` décomposent `cards` (seuil ≤ 8 conservé) en
enveloppes et feuilles, avec l'invariant `item + container === cards` vérifié
par le harnais. Ils ne disent pas si une frontière est *justifiée* : cela reste
une décision écrite (ADR-057 §5).

## 3. Plancher de recomposition — 11 routes nouvelles

`/month/[id]` · `/week/[id]` · `/lab` · `/lab/[exerciseId]` · `/diagnostics` ·
`/capstones` · `/projects` · `/reviews` · `/pipelines` · `/kubernetes` ·
`/cloud-lab`.

Chacune satisfait les quatre conditions d'éligibilité (A non recomposée au CP0,
B définition gelée §4, C différence structurelle constatée sur capture ouverte,
D amélioration non fondée sur la peau). Détail chiffré et changement structurel
dans le ledger.

**`/revisions` n'est PAS comptée** : elle était déjà recomposée à la baseline
CP0. **`/day/[id]` non plus** : elle est durcie, pas recomposée. `/`,
`/parcours`, `/calendar`, `/synthese` sont inchangées — aucun churn pour
réussir un test.

**Plancher 11 ≥ 10 : ATTEINT.**

## 4. P0 `/revisions` — station de réactivation

Trois zones : bande de file en trois compartiments réels (en retard / à
échéance / sous 30 jours), échéancier temporel continu gradué par semaine sur
J+30, modèle en deux colonnes (échelle de consolidation + entretien hors
échéance).

Les intervalles de l'échelle sont obtenus en **appelant** `baseInterval()` de
`lib/review.mjs` — le modèle pur qui planifie réellement les révisions — et non
recopiés : aucune seconde source de vérité possible.

État vide honnête : zéro révision affiche zéro révision. Ce qui informe alors,
c'est la **structure** de la file et le **modèle** qui la remplit, tous deux
dérivés de règles réelles.

Motif : **aucun, assumé**. Les cinq expriment une position dans un curriculum,
une trajectoire annuelle, un déroulé de document ancré ou la nature d'une
preuve. Une file d'échéances n'est aucune de ces choses.

Mesuré @1440 : `topBlocks` 2→3 · fonds 4→7 · ombres 3→4 · cartes 3 dont **0
conteneur** · texte hors carte **0,025 → 0,712** · dominance 0,535→0,607.

**Blind-difference @1440 : 5/5 — RÉUSSI.** (zones 2→3 · nature : hero + liste →
bande de jauges + échéancier + matrice · proportions : colonne + aside étroit →
bande pleine largeur puis grille 1,35fr/1fr · représentation graphique nouvelle
· cadres : 3 cartes fermées → sections ouvertes.)

## 5. P3 `/day/[id]` — durci, pas reconstruit

Les quatre zones sont intactes, la distinction « je lis / je fais » aussi.

**Dette V56 n° 6 tranchée par une justification écrite** : le rail latéral n'est
pas déplaçable à 1024 px. Il occupe 264 px plus 48 px de gouttière ; à 1024 px
la colonne principale mesure environ 720 px, ce qui laisserait ~408 px de
lecture, soit 40-45 caractères à 17 px. Échanger la lisibilité contre un repère
de position est un mauvais marché sur une page où l'on lit des heures.

Corrigé à la place, entre 768 et 1199 px : la bande de phases devient collante
et son en-tête porte le **nom de la phase courante en toutes lettres**. Deux
tentatives d'afficher les étiquettes dans la bande ont été **vérifiées en
capture et rejetées** : douze libellés ne tiennent pas dans 630 px (troncature
à « CAD », « COM »), puis l'étiquette courante chevauchait le texte.

Défaut de fond corrigé dans `PhaseRail` : après un saut de défilement, la
position restait bloquée sur « 1 / 12 » au milieu d'un document de 14 000 px —
l'ancien code ne lisait que les entrées `isIntersecting` de l'événement, et un
saut fait franchir la bande étroite à plusieurs titres d'un coup. La phase
courante est désormais recalculée à partir des positions réelles. Un rail
bloqué sur la première phase est décoratif ; ce motif n'en a pas le droit.

Vérifié sur les **5 journées représentatives figées à CP0** (181, 80, 1, 150,
205) à 9 largeurs : 0 débordement, 0 rogné, 8 à 10 fonds, 3 à 4 ombres.

## 6. Signature — 10 surfaces sur 36

| Motif | Surfaces |
|---|---|
| PositionRing | `/` · `/parcours` · `/synthese` · **`/week/[id]`** |
| TrajectoryMap | `/` · `/synthese` |
| YearBand | `/calendar` · `/parcours` · **`/month/[id]`** |
| PhaseRail | `/day/[id]` · `/doc/[...slug]` |
| EvidenceMark | `/day/[id]` · `/synthese` · **`/projects`** · **`/reviews`** |

**7 → 10 surfaces** (19 % → 28 %). Trois surfaces portent ≥ 2 motifs cohérents
(`/`, `/parcours`, `/synthese`). **26 surfaces n'en portent aucun.**

La cible de 14 énoncée dans le prompt V56→V57 **n'est pas atteinte**, et elle
ne l'est pas délibérément : sept routes recomposées reçoivent `NONE` assumé
parce qu'aucun des cinq motifs n'exprime « inventaire de scénarios » ou
« catalogue par domaine ». Les y poser aurait fait 17 surfaces et sept
ornements. **Aucun sixième motif n'a été créé.**

## 7. Validation

- `npm test` **1285 / 0** · `tsc --noEmit` **0** · `npm run build` **OK** ·
  `gates:active` **exit 0** (chaîne complète jusqu'à `v57:check`).
- **Responsive : 225 / 225** états conformes — 25 routes × 9 largeurs,
  0 débordement, 0 contenu rogné, ordre chronologique du calendrier intact.
- **axe-core : 0 critical / 0 serious sur 23 routes**, dont les 11 nouvelles et
  **`/glossary`, jamais vérifié jusqu'ici**.
- **19 / 19** `VISIT_*_DOES_NOT_MUTATE_PROGRESS`, **sans restauration**.

### `/glossary` — dette n° 4 : le report n'était pas fondé

V56 déclarait la page « trop lourde pour le harnais » et reportait sa
vérification. Un délai de navigation adapté a suffi : **0 critical, 0 serious**,
une seule violation `moderate` (`heading-order`). La composition de `/glossary`
reste intacte — 712 cartes, 111 686 px — et c'est une dette **ouverte**. Mais
« non vérifiable » était faux.

### 13 défauts corrigés, dont 6 invisibles aux métriques

Trouvés en **ouvrant** les captures, pas en lisant les chiffres :
paragraphe en `display:flex` rendu en colonnes de deux mots · barres d'échelle
rapportées au plafond de 180 j, écrasant l'écart utile 1→21 j · « Jour 61 · 2 »
(le champ `project` porte un numéro, pas un intitulé) · « 0 ressource décrite »
face à des cartes annonçant « 3 ressources » (les résumés publics portent des
compteurs, pas les tableaux) · étiquettes de phase tronquées à trois lettres ·
position de rail bloquée sur « 1 / 12 ».

Trouvés en mesurant : `--shadow-3` rendait exactement la valeur calculée du
hero sur `/diagnostics`, et `--shadow-2` celle de la barre de filtres sur les
laboratoires — dans les deux cas le compteur de niveaux d'ombre restait bloqué
à 2 alors que la règle semblait appliquée.

## 8. Scores sur la grille gelée

| Catégorie | Dashboard | Day | Révisions | Parcours | Calendrier |
|---|:--:|:--:|:--:|:--:|:--:|
| Identité | 4,0 | 4,0 | 3,0 | 4,5 | 4,0 |
| Originalité | 4,0 | 4,0 | 4,0 | 4,5 | 4,0 |
| Sophistication | 4,0 | 4,0 | 4,0 | 4,0 | 4,0 |
| Profondeur | 4,0 | 4,5 | 4,0 | 4,0 | 4,0 |
| Hiérarchie | 4,5 | 4,5 | 4,5 | 4,5 | 3,5 |
| Composition | 4,0 | 4,0 | 4,5 | 4,0 | 3,5 |
| Pédagogie visuelle | 4,0 | 4,5 | 4,5 | 4,0 | 4,0 |
| Cohérence | 4,5 | 4,5 | 4,5 | 4,5 | 4,5 |
| Utilisabilité | 4,5 | 4,5 | 4,5 | 4,5 | 4,0 |
| Premium | 4,0 | 4,0 | 4,0 | 4,0 | 4,0 |
| **Moyenne** | **4,15** | **4,25** | **4,15** | **4,25** | **3,95** |

**Moyenne globale : 4,15** (V56 : 4,00). **Originalité moyenne : 4,10**
(objectif 4,2 — non atteint).

Dashboard, Parcours et Calendrier n'ont pas été touchés : leurs notes sont
**reconduites à l'identique**, elles ne sont pas revalorisées.

Révisions passe de 3,40 à 4,15. **Identité reste à 3,0** : la note ≥ 4 exige
`motifs ≥ 1` (règle §2 de la grille gelée) et la page n'en porte aucun. Le
choix est assumé, la contrainte n'est pas contournée.

Day : inchangé à 4,25. `typeRange` y reste à 2,88, sous le seuil de 3,2 —
limite **conservée telle quelle** depuis V56 (le corps de lecture à 17 px
écrase mécaniquement le rapport sur une page-document).

## 9. Échecs explicites

- **Originalité 4,10 < 4,2.**
- **Couverture de signature 10/36 < 14.** Délibéré, mais c'est un manque.
- **`cards ≤ 8` échoué sur `/lab` (11)** — les conteneurs de groupe. Résultat
  conservé, non réécrit.
- **`typeRange` échoué sur `/day` (2,88), `/month` (2,88), `/reviews` (2,88).**
  Résultat conservé.
- **`/glossary` non recomposé** : 712 cartes, 111 686 px.
- **`/security` (52 cartes), `/cloud-foundations` (19 cartes), `/settings`
  (0 bloc structurant), `/career`, `/guide`, `/resources`, `/notes`,
  `/lessons`, et les 5 routes de détail techniques** n'ont pas été touchés.
- **Aucun test lecteur d'écran réel.** Reporté une nouvelle fois, et déclaré
  comme tel : axe-core et les contrôles DOM ne le remplacent pas.

## 10. Dette restante

| # | Dette | État |
|---|---|---|
| 1 | `/revisions` sous-transformée | **FERMÉE** (3,40 → 4,15, blind 5/5) |
| 2 | `/diagnostics` + `/capstones`, cause inconnue | **FERMÉE** (cause DOM établie, dominance ×8) |
| 3 | `/lab` débordement + 385 cartes + 44 711 px | **FERMÉE** (0 px à 9 largeurs, 11 cartes, 6 921 px) |
| 4 | `/glossary` a11y jamais vérifiée | **FERMÉE** · composition **OUVERTE** |
| 5 | `/projects`, `/reviews` échouent R4 | **FERMÉE** (5 R et 4 R) |
| 6 | Rail de la Journée sous 1200 px | **FERMÉE par justification écrite** + bande collante nommée |
| 7 | Lecteur d'écran jamais testé | **OUVERTE** — report renouvelé, explicitement |
| 8 | 14 routes encore anciennes | **OUVERTE** |

## 11. Verdict

**STRONG_IMPROVEMENT.**

Pas `REFERENCE_GRADE` : le barème gelé §10 exige moyenne ≥ 4,5 (mesurée 4,15),
aucune catégorie < 4 (Identité de Révisions est à 3,0), originalité ≥ 4,2
(4,10). Trois conditions manquantes sur douze — les neuf autres sont remplies,
dont le plancher de 10 routes et les deux blind-differences.

> **Si je masque le logo, la sidebar et le nom AI Career OS, la composition
> reste-t-elle identifiable comme appartenant au même produit ?**
> → **PARTIELLEMENT.**

**Ce qui est identifiable.** Une grammaire récurrente s'est installée sur les
surfaces refaites : bande d'identité sombre à texture de grille portant un
titre au cran display et des faits chiffrés à droite ; une seule zone d'action
encadrée en surface focale ; des sections éditoriales ouvertes séparées par un
filet ; des matrices à barres proportionnelles au lieu de grilles de cartes ;
des lignes denses sur surface continue au lieu de catalogues d'objets. Placées
côte à côte sans logo, `/month/3`, `/reviews`, `/kubernetes` et `/revisions`
se reconnaissent comme le même produit — et c'est nouveau : au CP0, `/month/3`
était un article Markdown nu et `/kubernetes` n'avait aucun bloc structurant.

**Ce qui ne l'est pas.** 26 surfaces sur 36 ne portent aucun motif, et 14
routes n'ont reçu aucune composition. `/glossary`, `/security`,
`/cloud-foundations` et les cinq routes de détail techniques appartiennent
encore visuellement à un autre produit. La signature couvre désormais
l'expérience principale — pilotage, journée, semaine, mois, laboratoire,
évaluation — mais elle ne couvre pas le produit.

> **La signature AI Career OS existe-t-elle désormais au-delà de quelques pages
> vitrines ?**
> → **OUI, mais pas partout.** Elle a quitté les cinq écrans de démonstration
> pour couvrir le chemin quotidien réel. Elle s'arrête aux surfaces
> périphériques, et le compte exact est donné plus haut : 22 routes composées,
> 14 encore anciennes.
