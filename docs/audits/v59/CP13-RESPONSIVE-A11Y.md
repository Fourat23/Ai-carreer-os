# V59 · CP13 — Responsive sur les dix largeurs gelées, et accessibilité

Largeurs de `docs/V59-CRITERIA-FROZEN.md` §11 :
**375 · 480 · 640 · 700 · 768 · 1024 · 1200 · 1440 · 1600 · 1920**.

24 routes testées : toutes celles modifiées par V59, plus l'échantillon
aléatoire du CP12, plus `/glossary` (inclus d'office par le §11).
**240 couples route × largeur.**

## Résultat

```
0 couple route × largeur en défaut
```

Aucune page ne déborde horizontalement (`scrollWidth == clientWidth` aux dix
largeurs), aucun débordement local hors conteneur défilable, **aucune perte
d'information**.

## Deux définitions corrigées, et pourquoi c'est important

Le premier passage annonçait **20 couples en défaut**. Aucun n'était réel.

**1. `sr-only` n'est pas une perte d'information.**
`/doc/lessons/agents-fundamentals` et `/capstones` étaient signalés à chaque
largeur. L'élément coupé était à chaque fois :

```
H1.sr-only  hauteur 1 px  contenu 34 px  « Leçon — Agents IA : fondamentaux »
```

C'est le motif standard du titre réservé aux lecteurs d'écran : coupé à 1 px
**exprès**, lu intégralement par la technologie d'assistance. Le détecteur
l'exclut désormais.

**2. Un contrôle `disabled` + `aria-hidden` n'est pas une cible tactile.**
Les quatre « cases à cocher de 13 px » de `/reviews` sont
`<input disabled aria-hidden="true" tabindex="-1">` : des glyphes décoratifs
produits par le Markdown, déjà sortis de l'arbre d'accessibilité en V56.

Le premier chiffre est consigné parce qu'il a existé. Publier « 20 défauts »
aurait été aussi faux que de les taire.

## Cibles tactiles — mesuré à 375 px

Une seule correction, sur le seul contrôle qu'on vise réellement au pouce :

| Contrôle | Avant | Après |
|---|:--:|:--:|
| `button.dot` — le barème 0-5 de `/skills`, 100 pastilles | 20 × 20 | **≥ 24 × 24** |

Le disque visible reste à 20 px : c'est la **surface cliquable** qui grandit,
par une boîte transparente. La grille des compétences ne bouge pas d'un pixel.
`/skills` passe de 112 à 12 cibles sous le seuil.

Les cibles restantes — cellules du champ de trajectoire (17 × 17 × 365),
liens de jour du Laboratoire (40 × 20 × 400), libellés de semaine du calendrier
(309 × 17 × 52) — sont conservées **délibérément**, avec le raisonnement écrit
au CP14 : la présentation dense *est* l'information, l'exception « essentiel »
de WCAG 2.2 SC 2.5.8 s'applique, et chaque cible reste atteignable par une
route alternative.

## axe-core — les 36 routes

```
36 routes → 0 critical, 0 serious
         → 0 violation, TOUTES gravités confondues
```

À l'ouverture du CP13, trois routes portaient une violation modérée
`landmark-unique` :

- `/day/80` et `/projects` — tous les blocs de code d'un document portaient la
  **même** étiquette `« Bloc de code (défilement horizontal possible) »`. Un
  lecteur d'écran annonçait *n* régions identiques, impossibles à distinguer
  dans la liste des repères. Chaque bloc est désormais numéroté sur le total
  réel du document : `« Bloc de code 3 sur 7 (défilement horizontal
  possible) »`. Compte dérivé, jamais déclaré.
- `/security` — deux repères imbriqués nommés tous deux
  « Playbooks opérationnels ». L'étiquette du bloc intérieur est **retirée**,
  pas renommée : la section englobante porte déjà ce nom.

## Ce qui n'est pas revendiqué

**Aucun test réel avec NVDA, JAWS ou VoiceOver n'a été effectué.** Tout ce qui
précède est automatisé : axe-core injecté dans Chromium, et des sondes DOM
écrites pour ce sprint. axe-core couvre une part connue et minoritaire des
critères WCAG. Un produit qui passe axe sans violation n'est pas pour autant
un produit accessible — il est un produit sans les défauts qu'axe sait voir.
