# ADR-057 — Propagation de la grammaire produit hors des pages vitrines

**Statut** : accepté · **Date** : sprint V57 · **Baseline** : `b3e67f6` (fin V56)
**Références** : `docs/V56-SCORING-FROZEN.md` (gelé, inchangé),
`docs/V57-METRICS-ADDENDUM.md` (additif), `docs/ADR-056-product-signature.md`.

## Contexte

V56 a livré cinq motifs propriétaires et transformé `/day/[id]`. Le CP0 de V57
a mesuré les **36 routes publiques** et donné un constat net :

- 12 routes réellement recomposées, 4 seulement reskinnées, 19 encore
  anciennes, 1 exclue (`/lab`, débordement réel de 5 px) ;
- **7 surfaces sur 36** portent un motif ; 29 n'en portent aucun ;
- `/month/[id]` et `/week/[id]` — sur le chemin quotidien — sont encore un
  `article.prose` nu de 632 px, 2 fonds, 1 ombre, amplitude typographique 1,65 ;
- `/pipelines`, `/kubernetes`, `/cloud-lab`, `/settings` n'émettent **aucun**
  bloc structurant de premier niveau ;
- `/diagnostics` et `/capstones` échouaient depuis V56 pour une raison que
  deux passes de CSS ne pouvaient pas corriger (voir décision 2).

Le produit a donc une peau homogène et une **composition hétérogène**. Un
utilisateur passe encore d'un dashboard premium à des pages Markdown, des
listes d'administration et des catalogues de cartes.

## Décision 1 — La composition devient le travail, le style ne l'est plus

Une route n'est déclarée recomposée que si sa **composition**, sa
**hiérarchie**, son **mode d'interaction** ou sa **représentation de
l'information** ont changé. Ne comptent pas comme transformation : palette,
gradient, rayon, ombre, padding, wrapper, classe CSS, renommage, ajout d'un
hero seul, déplacement de cartes.

**Corollaire structurant** : le DOM doit suivre le modèle mental de la page.
Le CSS ne compense pas une architecture d'information fausse. C'est la leçon
directe de la décision 2.

## Décision 2 — `/diagnostics` et `/capstones` se corrigent dans le DOM

Cause établie au CP0, sonde structurelle à l'appui :

`DiagnosticsBoard` émet **une `<section>` par domaine** — 14 sections sœurs,
plus le hero. Le hero mesure 1016×305 px, la plus grande section de domaine
1016×328 px : **le point focal est plus petit que le premier bloc de contenu**.
`dominance` étant le rapport d'aire du plus grand bloc à la somme des blocs de
premier niveau, elle plafonne mécaniquement à 0,102. Aucune règle de fond, de
bordure ou d'ombre ne peut la déplacer.

Second point : les 14 « cartes » mesurées ne sont pas les items. V56 a bien
dépouillé `.diag-card` (ni fond, ni bordure, ni rayon) et a donné fond +
bordure + rayon 8 px au conteneur `.diag-grid`. La dé-cardification **a pris
effet** ; elle a **déplacé la frontière de carte d'un niveau vers le haut**.
V56 a conclu à un échec de correctif là où il y avait une erreur de lecture.

**Décision** : la correction se fait dans `DiagnosticsBoard` et
`CapstonesBoard`, en réduisant le nombre de blocs de premier niveau et en
donnant au point focal une aire réelle. Aucune passe de CSS supplémentaire.

## Décision 3 — Métriques additives, jamais substitutives

`topBlocks`, `cardsContainer`, `cardsItem` sont ajoutés
(`docs/V57-METRICS-ADDENDUM.md`). Ils **n'entrent dans aucun critère R** et ne
peuvent faire passer aucune route. `dominance` et `cards` conservent leurs
seuils et **tous** leurs résultats historiques, y compris défavorables.

## Décision 4 — La signature ne se réduit pas aux cinq motifs

L'ensemble reste **fermé à cinq** : `PositionRing`, `TrajectoryMap`,
`PhaseRail`, `EvidenceMark`, `YearBand`. **Aucun sixième motif en V57**, et
aucun saupoudrage : un motif n'est posé que s'il exprime l'information qu'il
est fait pour exprimer.

La signature repose surtout sur un **modèle mental récurrent**, décliné
différemment selon la surface :

> **POSITION → TRAJECTOIRE → ACTION → PREUVE → ÉVOLUTION**

- **Position** : où en suis-je dans cet objet (mois, semaine, catalogue, file) ?
- **Trajectoire** : d'où cela vient, où cela va.
- **Action** : la chose unique à faire maintenant, atteignable.
- **Preuve** : ce qui atteste, et sa nature — pas sa quantité.
- **Évolution** : ce que cela change pour la suite.

Une surface est conforme si ces cinq questions trouvent une réponse **à leur
place habituelle**, quel que soit le composant employé.

## Décision 5 — Une carte doit justifier sa frontière

Une frontière de carte est justifiée si son contenu possède réellement au
moins une propriété parmi : action autonome, état autonome, navigation
autonome, cycle de vie indépendant, comparaison avec ses pairs, manipulation
indépendante. Sinon : section, ligne, groupe, bande, tableau, liste, surface
continue.

Règle qualitative, appliquée et justifiée route par route. Elle n'est pas un
seuil et n'entre pas dans le comptage.

## Décision 6 — Honnêteté de l'état vide

`/revisions` à zéro révision affiche zéro révision. Aucune donnée inventée,
aucune tâche fabriquée, aucune métrique utilisateur simulée. Mais la page doit
rendre son **modèle** perceptible : ce qui arrivera ici, pourquoi, comment une
journée entre dans la file, comment les échéances fonctionnent, et ce que l'on
fait quand il n'y a rien à revoir. Un modèle dérivé de règles réelles n'est
pas une donnée inventée ; un compteur fabriqué en est une.

## Conséquences

- Le plancher de **≥ 10 routes nouvellement recomposées** reste inchangé et
  n'est pas négociable. Les 12 routes de la baseline CP0 en sont exclues.
- `gates:active` reçoit `v57:check`, qui protège l'ensemble fermé à cinq
  motifs, l'invariant d'addendum et l'absence de gamification.
- Le curriculum reste gelé : aucune leçon, aucun exercice, aucune mission,
  aucun capstone, aucun diagnostic, aucun ordre de journée n'est modifié.
