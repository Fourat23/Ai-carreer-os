# V61 · CP0 — AUDIT FORENSIQUE, LECTURE SEULE

*Écrit avant toute modification de production.*

---

## 1. État Git et invariants

| | |
|---|---|
| HEAD | `425e7b2823dff9c1dd72e55b019f233eabed5fd1` |
| branche | `claude/ai-career-os-saas-phfg49` |
| local == origin | **oui** — même SHA |
| working tree | **propre** — 0 fichier modifié |
| stash | **0** |
| serveur résiduel | **aucun** — 14 ports vérifiés, aucun n'écoute |
| corpus SHA-1 | `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3` |
| `data/progress.json` blob | `323604021055588a9528a86875f36598dbdc7758` |
| journées | **365**, ordre 1..365 strict |
| semaines / mois / compétences | 52 / 12 / 20 |
| progression enregistrée | **0 journée** |

## 2. Chaîne technique

| | |
|---|---|
| `npm test` | **1 285 passés, 0 échec** |
| `tsc --noEmit` | **propre** |
| `npm run build` | **OK** |
| `npm run gates:active` | **39 gates verts** |

## 3. Intégrité de la progression — mesurée, pas supposée

12 visites réelles (`/`, `/parcours`, `/synthese`, `/calendar`, `/revisions`,
`/day/1`, `/day/80`, `/month/3`, `/week/12`, `/lab`, `/skills`, `/missions`) :

```
avant : 323604021055588a9528a86875f36598dbdc7758
après : 323604021055588a9528a86875f36598dbdc7758
```

**Naviguer ne mute pas `progress.json`.** C'est la ligne de base à préserver.

## 4. Périmètre — produit contre spike

- **49** fichiers `page.tsx`
- **36** routes produit
- **13** routes de spike (`/design-spike/v60/**`, `/design-spike/v60-1/**`)

Les spikes sont hors navigation produit : `AppShell` les court-circuite
(`app/shell/AppShell.tsx:128`) et **aucun lien de navigation produit ne pointe
vers un spike** — vérifié par recherche sur `href.*design-spike`.

### Primitives déjà industrialisées

`app/ui/` contient 19 composants, dont les cinq motifs propriétaires :
`PositionRing`, `PhaseRail`, `EvidenceMark`, `YearBand`, plus `TrajectoryMap`
et `TrajectoryMapGrid` à la racine de `app/`.

**Nom canonique des motifs** — vérifié dans le gate V59, qui les compte :

| Motif | Hook CSS canonique | Composant |
|---|---|---|
| PositionRing | `.pos-ring` | `app/ui/PositionRing.tsx` |
| TrajectoryMap | `.tmap` | `app/TrajectoryMap.tsx` + `TrajectoryMapGrid.tsx` |
| PhaseRail | `.phase-rail` | `app/ui/PhaseRail.tsx` |
| EvidenceMark | `.evi-mark` | `app/ui/EvidenceMark.tsx` |
| YearBand | `.year-band` | `app/ui/YearBand.tsx` |

`YearRule` n'existe **que** dans le prototype V60.1 : c'est une variante
d'échelle de `YearBand`, pas un sixième motif. L'ensemble reste fermé à cinq.

### Pénétration réelle des motifs dans le produit

| Motif | Routes produit qui l'utilisent |
|---|---|
| TrajectoryMap | `/`, `/synthese` — **2** |
| YearBand | `/calendar`, `/parcours`, `/month/[id]` — **3** |
| PhaseRail | `/day/[id]`, `/doc/[...slug]` — **2** |
| PositionRing | `/week/[id]`, `/synthese` — **2** |
| EvidenceMark | `/day/[id]`, `/projects`, `/reviews`, `/synthese` — **4** |

Sur 36 routes, **9 routes distinctes** portent au moins un motif.

---

## 5. Mesures BEFORE — 16 routes × 5 largeurs

Sonde navigateur réelle. Captures dans `docs/design/v61/before/`.

À 1440 × 900 :

| route | pageH | blocs | largeurs | dominance | cartes / répétées | ratio typo | CTA | motifs |
|---|--:|--:|--:|--:|--:|--:|:--:|---|
| `/` | 1 467 | 5 | 1138 | 0,437 | 9 / 3 | 3,30 | oui | tmap×1 |
| `/parcours` | 2 916 | 7 | 1016 | 0,365 | 15 / **8** | 3,30 | **non** | year-band×1 |
| `/synthese` | 2 302 | 6 | 1138 | 0,242 | 8 / 1 | 3,30 | **non** | pos-ring, tmap |
| `/calendar` | 2 923 | 5 | 1138 | 0,669 | 15 / **12** | 3,30 | **non** | year-band×1 |
| `/revisions` | 1 144 | **1** | 1016 | 0,875 | 5 / 1 | 3,30 | **non** | — |
| `/day/1` | **8 898** | **1** | 1138 | **0,938** | 18 / 7 | 3,30 | oui | phase-rail×2 |
| `/day/80` | **14 340** | **1** | 1138 | **0,941** | 19 / 8 | 3,30 | oui | phase-rail×2 |
| `/month/3` | 3 077 | **1** | 1016 | 0,916 | 4 / 1 | 3,30 | **non** | year-band×1 |
| `/week/12` | 2 515 | **1** | 1016 | 0,911 | 4 / 1 | 3,30 | **non** | pos-ring×1 |
| `/missions` | 5 193 | **1** | 1016 | 0,926 | 3 / 1 | 3,30 | oui | — |
| `/skills` | 2 369 | 5 | 1016 | 0,605 | 24 / **20** | 3,30 | **non** | — |
| `/diagnostics` | 2 408 | 4 | 1016 | 0,650 | 3 / 1 | 3,30 | **non** | — |
| `/capstones` | 1 871 | 3 | 1016 | 0,671 | 3 / 1 | **2,24** | **non** | — |
| `/projects` | 4 478 | **1** | 1016 | 0,924 | 5 / 2 | 3,30 | **non** | evi-mark×3 |
| `/lab` | **6 925** | **1** | 1138 | 0,936 | 5 / 1 | 3,30 | **non** | — |
| `/reviews` | 1 173 | **1** | 1016 | 0,877 | 6 / 3 | 3,30 | **non** | evi-mark×2 |

**Aucun débordement horizontal, sur aucune route, à aucune des cinq largeurs.**
C'est acquis et ce sera à préserver.

---

## 6. Ce que ces nombres disent

### 6.1 `/day/[id]` est une colonne de 14 mètres

```
14 260px  DIV day-view
   14 260px  DIV day-main
        652px  ASIDE day-rail
```

Un seul bloc de premier niveau, dominance **0,941**, hauteur **14 340 px** à
1440. La direction A du spike V60 faisait 9 331 px et avait été jugée
inacceptable ; la direction C 11 720 px. **Le produit fait 14 340.**

C'est la surface la plus utilisée du produit — plusieurs heures par jour — et
c'est un article Markdown décoré, pas un environnement de travail. Le rail de
652 px flotte à côté d'une colonne de 14 260.

### 6.2 Onze routes n'ont qu'une seule largeur structurelle

`/revisions`, `/day/1`, `/day/80`, `/month/3`, `/week/12`, `/missions`,
`/projects`, `/lab`, `/reviews` : **un seul bloc de premier niveau**,
dominance entre 0,875 et 0,941. Ce ne sont pas des compositions ; ce sont des
colonnes uniques dans lesquelles on empile.

La loi de composition V61 en exige au moins deux quand le contenu le justifie.

### 6.3 La répétition de rectangles identiques

| route | objets « carte » | dont partageant la MÊME signature |
|---|--:|--:|
| `/skills` | 24 | **20** |
| `/calendar` | 15 | **12** |
| `/parcours` | 15 | **8** |
| `/day/80` | 19 | 8 |
| `/day/1` | 18 | 7 |

Vingt rectangles au même rayon, à la même bordure, à la même largeur, portant
chacun « 0/5 » : c'est exactement le motif que V60.1 a retiré du Calendrier du
prototype — *l'information nulle répétée qui masque les exceptions*.

### 6.4 Onze routes sur seize n'ont aucun CTA primaire

`/parcours`, `/synthese`, `/calendar`, `/revisions`, `/month`, `/week`,
`/skills`, `/diagnostics`, `/capstones`, `/projects`, `/lab`, `/reviews`.
Une surface de pilotage sans action est une surface de consultation.

### 6.5 Du texte est rogné, à toutes les largeurs

`/parcours` — cinq objectifs de parcours coupés en pleine phrase :

```
track-crow-goal ·  37px visible /  74px réel · « Construire des interfaces web modernes, accessible… »
track-crow-goal ·  37px visible /  93px réel · « Poser des fondations opérationnelles solides — ter… »
track-crow-goal ·  37px visible / 112px réel · « Poser des fondations de sécurité applicative et clo… »
```

`/missions` — **42 éléments rognés à 375 px**, 15 à 768, 3 à 1440.
`/synthese`, `/capstones` — 1 à 2 par largeur.

Ces routes passent la sonde « pas de débordement horizontal » et affichent
malgré tout du texte tronqué. La sonde de largeur ne suffisait pas.

### 6.6 La typographie est déjà bonne — sauf une route

Ratio display/corps = **3,30** sur 15 routes sur 16, dans la cible 3,3–4,5
héritée de V60.1. `/capstones` est à **2,24** : elle n'a pas de hero.

---

## 7. TrajectoryMap et YearBand — le P0 de V61, mesuré

Le rapport V60.1 (§7.1) signalait que TrajectoryMap et YearRule se
ressemblaient trop. **Mesuré dans le produit, ce n'est pas le cas :**

| motif | route | dimensions | ratio l/h | pistes | marques |
|---|---|---|--:|--:|--:|
| `.tmap` | `/` | 730 × 431 | **1,7** | 60 | 870 |
| `.tmap` | `/synthese` | 1096 × 431 | **2,5** | 60 | 870 |
| `.year-band` | `/calendar` | 1138 × 82 | **13,9** | 12 | 413 |
| `.year-band` | `/parcours` | 1016 × 82 | **12,4** | 12 | 413 |

Un facteur **6** sépare les deux silhouettes. La confusion de V60.1 était un
accident du prototype, où TrajectoryMap avait été redessiné en une seule
rangée de 170 px — c'est-à-dire là où il empruntait la silhouette de l'autre.

**Mais les deux motifs sont sémantiquement INVERSÉS par rapport à leur nom.**

Le brief V61 pose :

> TrajectoryMap doit signifier position, chemin, progression, passage dans le
> temps. Sa lecture doit être **directionnelle**.
>
> YearBand doit signifier structure globale, distribution, charge, texture
> annuelle. Sa lecture doit être **cartographique, pas directionnelle**.

Or aujourd'hui :

- `.tmap` est un **champ de 12 pistes empilées**, ratio 1,7. Douze barres
  indépendantes : rien ne relie la fin du mois 1 au début du mois 2. On y lit
  une **distribution**, pas un chemin. C'est une carte.
- `.year-band` est une **ligne continue** de ratio 13,9, mois proportionnels,
  lue de gauche à droite. C'est une **frise** — l'objet le plus directionnel
  du produit.

Les silhouettes sont distinctes ; ce sont les **rôles** qui sont échangés.

C'est ce que V61 doit corriger, et la correction n'est ni un renommage ni un
sixième motif : c'est rendre chaque objet lisible **comme ce qu'il prétend
être**.

- **TrajectoryMap** doit gagner sa **direction** : une continuité visible d'un
  mois au suivant, une tête de position qui est la marque la plus forte de
  l'objet, et une asymétrie franche entre le parcouru et le à-venir — y
  compris, et surtout, quand le parcouru est vide.
- **YearBand** doit gagner sa **texture** : aujourd'hui toutes ses marques ont
  la même hauteur, ce qui en fait une frise. Une hauteur portant une grandeur
  réelle (la difficulté déclarée de la journée) en fait un relief — « à quoi
  ressemble mon année » — et le sort de la lecture directionnelle.

Aucun motif nouveau. Aucune emprise nouvelle. Les deux gardent leur place.

---

## 8. Ce que CP0 ne dit pas

- Il ne dit rien de la qualité rédactionnelle des pages : il mesure des formes.
- La détection de « carte » est heuristique (rayon, bordure, ombre, fond) :
  elle compte des rectangles, pas des intentions.
- La détection de « zone morte » n'a rien remonté ; c'est un seuil grossier
  (bloc > 220 px avec moins de 90 caractères) et son silence ne prouve rien.
- 20 états sur 80 présentent du texte rogné. Le détail n'a été inspecté que
  sur `/parcours`.

---

## 9. Priorités qui découlent de la mesure

| Rang | Objet | Fondement mesuré |
|---|---|---|
| **P0** | rôles TrajectoryMap / YearBand | ratio 1,7 contre 13,9 — silhouettes distinctes, sémantiques inversées |
| **P1** | `/day/[id]` | 14 340 px, 1 bloc, dominance 0,941 |
| **P2** | routes à colonne unique | 11 routes à 1 largeur structurelle, dominance ≥ 0,875 |
| **P3** | répétition de rectangles | 20/24 sur `/skills`, 12/15 sur `/calendar` |
| **P4** | texte rogné | 42 éléments sur `/missions` à 375, 5 sur `/parcours` à toutes largeurs |
| **P5** | absence de CTA | 11 routes sur 16 |
| **P6** | `/capstones` sans hero | ratio typo 2,24 contre 3,30 partout ailleurs |
