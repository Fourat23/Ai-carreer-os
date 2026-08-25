# V59 · CP4 — Audit de signature des cinq motifs

Recensement fait **avant** toute création. Mesures à 1440 px, aire rapportée à
la surface de `main.content`. Aucun sixième motif n'est envisagé : l'ensemble
est fermé et le travail de V59 est de mieux l'orchestrer.

## Tableau réel

| Motif | Routes | Aire par route | Sous-formes | Survit en niveaux de gris |
|---|:--:|---|:--:|:--:|
| **TrajectoryMap** | 2 | **17,86 %** (`/`) · **17,08 %** (`/synthese`) | **809** cellules | **oui** — vérifié |
| **YearBand** | 3 | 2,66 % (`/calendar`) · 2,65 % (`/parcours`) · 2,53 % (`/month/3`) | 365 graduations | **oui** — vérifié |
| **PhaseRail** | 2 | 1,46 % (`/doc`) · 1,00 % (`/day/80`) | 84 · 144 | oui (icônes = formes) |
| **PositionRing** | **4** | 1,60 % (`/`) · 1,05 % (`/week/12`) · 1,02 % (`/synthese`) · 0,90 % (`/parcours`) | 1 arc SVG | oui (forme d'arc) |
| **EvidenceMark** | 2 | **0,02 %** (`/projects`) · **0,04 %** (`/reviews`) | 0 | sans objet |

**Couverture : 11 routes distinctes sur 36.** 25 routes ne portent aucun motif.

## Correction d'une inférence que j'allais publier

En mesurant les sous-formes j'ai obtenu `formes = 0` pour YearBand et
EvidenceMark, et j'allais en conclure qu'ils sont dessinés en couleur pure et
meurent donc en niveaux de gris. **C'est faux pour YearBand** : rendu avec
`filter: grayscale(1)`, il reste parfaitement lisible — une bande de 365
graduations avec les repères M1…M12 et le compte de jours par mois. Le
compteur était à zéro parce que mon sélecteur de sous-formes ne correspondait
pas à ses classes, pas parce que le motif n'a pas de forme.

L'inférence est retirée ; seule la vérification visuelle est retenue.

## Rôle sémantique, valeur, redondance

**TrajectoryMap** — « l'année entière comme un champ mesuré ». 809 cellules =
365 jours répartis sur 12 pistes mensuelles, chacune portant son état réel.
C'est **le seul motif à l'échelle d'une signature** et il survit sans couleur :
la forme seule — douze pistes de jours — est immédiatement spécifique. Utilisé
sur 2 routes sur 36.

**YearBand** — la version compacte du même concept : l'année en une bande fine
graduée par mois. **Même famille conceptuelle que TrajectoryMap, à une autre
échelle.** C'est un atout, pas une redondance, tant que les deux ne coexistent
pas sur la même surface.

**PhaseRail** — « le document comme un chemin de phases ». Porte la taxonomie
pédagogique réelle (cadrer, comprendre, observer, pratiquer, produire,
préparer, vérifier, réviser). Rendu deux fois dans le DOM (rail + strip), une
seule forme visible selon la largeur : correct. Réutilisé sur les 2 surfaces de
lecture longue.

**PositionRing** — le plus réutilisé (4 routes) et le plus petit (0,9 à 1,6 %).
Un chiffre dans un anneau. **C'est aussi le plus générique** : tout tableau de
bord SaaS possède un anneau de progression. Il informe, mais il ne signe pas.

**EvidenceMark** — 0,02 % de la surface. Trois instances sur `/projects`, deux
sur `/reviews`. **Sous le seuil de perception** : à cette échelle c'est un
glyphe en ligne, pas un motif de composition. Il ne peut pas porter d'identité
en l'état.

## Redondance réellement constatée

`/parcours` affiche **simultanément** PositionRing (0,90 %) et YearBand
(2,65 %). Les deux répondent à la même question — « où suis-je dans l'année ? »
— dans deux langages différents, sur la même page. C'est la seule redondance
mesurée.

## Comportement mobile

À vérifier au CP13 sur les dix largeurs gelées. Constat déjà acquis en V58 :
PhaseRail bascule en barre d'icônes compacte sous 1024 px, avec la phase
courante nommée au-dessus — comportement voulu, pas une dégradation.

## Ce que cet audit impose au CP5

1. **Le produit possède déjà sa signature, mais ne l'utilise presque pas.**
   TrajectoryMap est à 18 % de surface sur 2 routes ; il est absent des 34
   autres. Le levier n'est pas d'inventer, c'est de propager là où c'est
   justifié par la donnée.
2. **Deux motifs sur cinq sont hors d'échelle.** EvidenceMark (0,02 %) et
   PositionRing (1 %) n'impriment rien. Pour EvidenceMark la question est de
   savoir s'il doit devenir une **grammaire** (une manière récurrente de
   distinguer apprentissage / pratique / validation / preuve / transfert)
   plutôt qu'un glyphe.
3. **La famille conceptuelle est déjà nommée par les motifs eux-mêmes** :
   « l'année comme champ mesuré » (TrajectoryMap, YearBand) et « le document
   comme chemin de phases » (PhaseRail). C'est de là que doit naître la
   grammaire du CP5, pas d'un vocabulaire SaaS générique.
4. **Aucun sixième motif.** Les compositions signature du CP5 devront être
   faites de ces cinq-là et de la grammaire de familles pédagogiques déjà
   présente dans le corpus.
