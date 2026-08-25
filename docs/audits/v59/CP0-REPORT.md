# V59 · CP0 — Audit forensique, lecture seule

Aucune modification produit n'a été faite avant cet audit.

| Vérification d'ouverture | Valeur |
|---|---|
| `HEAD` | `db040ba` (clôture V58) |
| Branche | `claude/ai-career-os-saas-phfg49`, `local == origin` |
| Arbre de travail | propre, 0 stash |
| `data/progress.json` | blob `323604021055588a9528a86875f36598dbdc7758` |
| Routes publiques | 36 |
| Instantané BEFORE | `docs/audits/v59/cp0-before.json` |
| **SHA-256** | **`f444e45af361c3562771510391ecc59080b6e9c5885c3dfcf72f3bc2bfb2437d`** |

---

## A · Information architecture

| Constat | Mesure |
|---|---|
| Blocs de tête à **une seule largeur** | **29 / 36 routes** |
| Aucun `h2` | 3 — `/missions`, `/lab`, `/lab/fizzbuzz` |
| Bloc unique dominant (`dominance ≥ 0,85`) | 8 — `/lessons`, `/missions`, `/projects`, `/lab`, `/doc/[...slug]`, `/career`, `/guide`, `/resources` |

**Le produit est un empilement vertical.** 29 routes sur 36 posent tous leurs
blocs à la même largeur : il n'y a presque nulle part de *composition*, seulement
une pile.

## B · Composition visuelle

| Constat | Mesure |
|---|---|
| `gapMedian` = exactement 20 px | **19 / 36 routes** |
| Masse 1er/2e bloc extrême | `/lessons` **52,5** · `/lab` **37,4** · `/missions` **18,4** · `/guide` 13,5 · `/resources` 13,4 |
| Masse ≈ 1 (aucune hiérarchie) | `/` **1,01** · `/glossary` 1,05 · `/cloud-foundations` 1,12 |

Rythme vertical **uniforme** : plus de la moitié du produit sépare tout par le
même écart. La masse est soit écrasante, soit strictement égale — presque jamais
un rapport composé.

## C · Identité produit — constat central

| Constat | Mesure |
|---|---|
| Routes sans **aucun** motif propriétaire | **26 / 36** |
| Part de surface des motifs | `/` 19,5 % · `/synthese` 18,1 % · **chute** : `/parcours` 3,5 % · `/calendar` 2,7 % · `/month/3` 2,5 % · `/week/12` 1,1 % · `/day/80` 1,0 % · `/reviews` 0,04 % · `/projects` **0,02 %** |
| Usages **structurels** de l'accent | 0 à 2 sur presque toutes les routes ; 41 sur `/skills` seulement |

1. **La signature n'existe réellement que sur 2 routes** (`/`, `/synthese`).
   Ailleurs les motifs sont absents ou à l'échelle décorative. `EvidenceMark`
   occupe **0,02 %** de `/projects` : il ne peut pas porter une identité.
2. **L'accent indigo n'est presque jamais structurel** — il colore des liens.
   Le retirer ne détruit donc aucune structure ; mais il ne reste alors presque
   rien de propriétaire sur 26 routes.

## D · Anti-template — la carte est la primitive par défaut

| Constat | Mesure |
|---|---|
| Routes où **≥ 90 %** du texte est dans une carte | **19 / 36** |
| Routes à **100 %** | `/lessons`, `/missions`, `/capstones`, `/lab`, `/lab/fizzbuzz` |
| Contenu majoritairement sur le canvas | 8 — `/skills` 7 % · `/month/3` 12 % · `/doc` 13 % · `/guide` 19 % · `/resources` 22 % · `/career` 23 % · `/day/80` 27 % · `/revisions` 29 % |

Réponse franche à « pourrait-on changer le logo et vendre la page à un autre
SaaS ? » — **oui, sur la majorité des routes**.

## E · Valeur learner — trois défauts réels trouvés sur capture

### E1. `/career` — entités HTML doublement échappées

Rendu à l'écran, dans le sommaire :
`Le README d&#39;un projet (ce qu&#39;un recruteur regarde en 30 secondes)`.

`extractSections` lit le texte du titre par expression régulière sans décoder
les entités, puis React ré-échappe le `&`.

### E2. `/doc/[...slug]` — grammaire propriétaire présente mais désactivée

Le balisage porte **déjà** la grammaire de famille pédagogique :

```html
<h2 class="fam-h2" data-sec="1" data-family="…">
  <span class="h2-eyebrow">01</span><span class="h2-text">Le problème d'abord</span>
</h2>
```

Mais **toutes** les règles de mise en forme sont écrites
`.day-view article.prose h2.fam-h2 { … }` — verrouillées sur `/day/[id]`.

Sur `/doc`, les deux `span` restent en ligne : on lit **« 01Le problème
d'abord »**, sans espace, sans couleur de famille, sans filet latéral, et
`h2-text` ne reçoit jamais `--fs-h2`. D'où **`typeRange = 2,00`, la valeur la
plus basse du produit**.

Ce n'est pas un manque de design : c'est une **grammaire propriétaire déjà
payée, mais non appliquée** à la route qui en a le plus besoin.

### E3. `/resources` a 3 fonds — le minimum absolu du produit

`/career` et `/resources` sont un document markdown dans une colonne, avec
environ 700 px de canvas vide à droite sur 3 000 px de défilement.

## Anomalie de sonde signalée, non retenue comme défaut

`/calendar` affiche `gapMedian = −489`. Les 12 `month-block` sont en grille
multi-colonnes : deux blocs consécutifs dans l'ordre DOM se chevauchent
verticalement. Limite de l'heuristique, pas un défaut de mise en page
(`overflow = 0`, `clipped = 0`).

## Ce que le CP0 impose au reste du sprint

- La cible n'est **pas** de nouveaux motifs. L'ensemble est fermé à 5 et deux
  d'entre eux sont sous-dimensionnés au point d'être invisibles. Le travail est
  de **les orchestrer à une échelle qui compte**.
- Les deux leviers les plus rentables : **sortir de la carte comme primitive
  par défaut** (19 routes) et **introduire une variation de largeur** (29
  routes à largeur unique).
- `/doc/[...slug]` ne demande pas une invention : il demande qu'on lui
  **applique la grammaire de famille pédagogique que le produit possède déjà**.
