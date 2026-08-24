# ADR-055 — Product Identity & Visual Convergence

**Statut** : accepté (V55) · **Complète** : ADR-054.2 (composition), ADR-054.2.1
(intégrité visuelle) · **Ne remplace aucun invariant métier.**

## Contexte

V54.x a rendu le produit *juste* : ordre chronologique garanti, partitions qui
bouclent, aucun vide structurel, 0 violation axe critical/serious, progression
non mutée par la navigation. Ces acquis sont la **base**, pas la livraison.

La mesure CP0 de V55 montre que la justesse n'a pas produit d'identité :

| Symptôme mesuré | Valeur BEFORE | Ce que ça signifie |
|---|:--:|---|
| Rapport de surface 1er/2e bloc (Dashboard) | **1.20** | aucun élément ne domine |
| Fonds distincts rendus | 1 à 5 | `background + panel + border`, rien de plus |
| Niveaux d'ombre | 1 à 2 | pas d'élévation |
| Police maximale rendue @1920 | **28 px** | pas de niveau *display* |
| Amplitude titre/corps | 2.15 – 2.83 | échelle typographique plate |
| Dominance du calendrier | **0.089**, ratio 1.00 | 12 blocs strictement équivalents |

## Décision 1 — Une échelle de surfaces à six crans, différenciée autrement que par la couleur

`canvas → shell → surface → raised → focus → interactive`.

Chaque cran combine **luminance + bordure + élévation + gradient local**, jamais
la seule teinte. La base bascule du graphite chaud (`#131519`) vers un
**bleu-noir profond** (`#0b0d13`) : c'est l'ancrage d'identité, et il augmente
mécaniquement le contraste de tous les textes secondaires.

Un gradient est **local et directionnel** (haut-gauche → transparent), jamais un
fond entier coloré. Un halo (`--glow-accent`) est réservé à **une seule zone par
page** : le focus principal.

## Décision 2 — La dominance est une propriété mesurable, pas une intention

**Formulation initiale (abandonnée, et pourquoi).** Ce document exigeait d'abord
que le plus grand bloc fasse « au moins 1,8× la surface du deuxième ». La mesure
a montré que ce seuil est un mauvais critère : il récompense une page dont le
second bloc est *pauvre*. Sur le Dashboard, le second bloc est la carte de
trajectoire — la rendre plus riche et plus lisible **dégrade** ce ratio tout en
améliorant la page. Un critère qui punit une amélioration réelle est faux.

**Formulation retenue, mesurée :**
1. le point focal est **unique** et occupe la **pleine largeur** ;
2. sa **part de surface** parmi les blocs structurants est la plus haute et
   atteint **≥ 0,40** à 1440 px (elle valait 0,33 avant V55) ;
3. il se distingue par la **profondeur** (surface la plus haute + halo), pas
   seulement par la taille.

Les points 1 et 3 sont vérifiés par gate ; le point 2 est mesuré par
`scripts/v55-visual.mjs` et reporté honnêtement, y compris quand il n'est pas
atteint (c'est le cas du calendrier : 12 mois sont légitimement équivalents).

## Décision 3 — Échelle typographique à sept crans, avec un vrai *display*

`display → h1 → h2 → h3 → body → meta → micro`.
Le *display* est **fluide** (`clamp`) et porte un `letter-spacing` négatif : à
1920 il doit dépasser 40 px. Amplitude display/corps visée : **≥ 3,2**.

Les micro-labels mono/majuscules restent la signature du produit mais sont
**plafonnés** : ils qualifient une zone, ils ne composent pas une page.

## Décision 4 — Un élément graphique n'existe que s'il porte une donnée réelle

Interdiction des ornements décoratifs. Un motif SVG/CSS n'est admis que s'il est
**déterministe à partir des données affichées** (identité du domaine de
compétence, position dans le programme). L'absence de données produit une
**composition** différente, jamais une donnée inventée ni un remplissage.

## Décision 5 — La trajectoire est une carte, pas un tableur

La grille 7×52 de carrés uniformes est remplacée par une **carte structurée par
mois** : 12 pistes nommées, semaines lisibles, densité d'état par mois. Elle
reste 100 % dérivée des journées réelles, et conserve la navigation clavier de
type grille ainsi que les noms accessibles.

## Décision 6 — Le rail est hiérarchisé, jamais une pile de cartes

Au plus **trois familles visuelles** dans le rail, de poids décroissant. Une
famille sans donnée est **réduite ou fusionnée**, jamais réservée en hauteur.

## Décision 7 — Le shell porte la marque

Le rail de navigation est une surface distincte (`--shell`), la marque est
composée (monogramme + nom), l'item actif combine barre d'accent, gradient local
et poids typographique — pas seulement un fond teinté.

## Contraintes non négociables reportées de V54.x

- `DATA ORDER = DOM ORDER = VISUAL READING ORDER` sur toute séquence ;
  `column-count` / `columns` restent interdits.
- Toute grandeur affichée appartient à une partition qui boucle.
- Un CTA appartient au bloc qui porte les informations qui le justifient.
- Aucune gamification, aucune donnée inventée, aucune seconde source de vérité.
- `prefers-reduced-motion` neutralise toute transition.
- 0 violation axe critical/serious ; un meilleur design ne justifie aucune
  régression d'accessibilité.

## Conséquences

- Réécriture du bloc de tokens (surfaces, élévation, gradients, typographie).
- Nouvelles primitives, uniquement au mérite et avec ≥ 2 usages réels.
- Nouveau harnais de densité de design + gate `v55:check`.
- Le contraste de tous les textes doit être re-vérifié après le changement de
  base : une palette plus sombre déplace tous les ratios.
