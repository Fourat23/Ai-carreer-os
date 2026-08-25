# V58 — Tirage de navigation aléatoire · **FIGÉ AVANT INSPECTION**

Graine : **`V58-1440`** · algorithme : `scripts/v58-random-nav.mjs`
(déterministe, sans remise, `index = sha1(seed:i) % N`).

Ce fichier et le script sont committés **avant** l'ouverture de la moindre
capture AFTER. Le tirage ne peut donc pas avoir été choisi après coup, et il
n'est pas rejoué s'il est défavorable.

| # | Route | Classe CP0 |
|:--:|---|---|
| 1 | `/security` | **ancienne** (A) |
| 2 | `/cloud-foundations/aws-ha-api` | **ancienne** (C) |
| 3 | `/capstones` | moderne |
| 4 | `/` | moderne |
| 5 | `/missions` | **intermédiaire** (B) |
| 6 | `/pipelines` | moderne |
| 7 | `/security/leaked-secret-config` | **ancienne** (C) |
| 8 | `/week/12` | moderne |
| 9 | `/diagnostics` | moderne |
| 10 | `/cloud-foundations` | **ancienne** (B) |

**Le tirage est difficile** : 5 des 10 routes sont anciennes ou intermédiaires
à la baseline. Il est conservé tel quel.

Classement à effectuer à 1440 px, à CP14 :
`MODERN_AI_CAREER_OS` · `LEGACY_AI_CAREER_OS` · `AMBIGUOUS`.
Objectif figé : **≥ 8 / 10 MODERN, 0 route cassée**.

---

## Résultats — inspection à 1440 px (CP11)

### Ce qui s'est passé à l'ouverture du tirage

Le tirage a été ouvert **sans retouche préalable**. Deux routes étaient
**CASSÉES** au moment de l'inspection :

- **`/capstones`** — chaque titre de capstone se coupait à **un mot par ligne**.
- **`/diagnostics`** — même défaut sur les seize lignes du catalogue.

**Cause : une régression introduite par le CP6 de ce sprint.** La règle
`.cat-row-link { grid-template-columns: 24px minmax(0,1fr) auto auto; }` avait
été écrite sans condition pour accueillir l'ordinal de `/lessons`. Elle
s'appliquait donc à TOUTES les rangées de catalogue, y compris celles qui n'ont
que trois enfants : leur titre tombait dans la colonne de 24 px.

**Aucune sonde ne l'a vu** : `overflow = 0`, `clipped = 0`, `dominance`,
`surfaces`, `ombres` et `typeRange` strictement inchangés sur les deux routes.
C'est la navigation aléatoire, sur capture, qui l'a trouvé.

Correctif : la grille à quatre colonnes est réservée aux rangées qui portent
réellement un ordinal (`.cat-row-link:has(.cat-row-ord)`).

### L'objectif figé

> « ≥ 8 / 10 MODERN et **0 route cassée**. »

**À l'ouverture du tirage : 8 MODERN, 0 AMBIGUOUS, 2 CASSÉES.**
L'objectif **n'est donc pas atteint au premier passage** — la condition
« 0 route cassée » échoue. Ce résultat est publié tel quel et n'est pas
réinterprété.

Après correction et recapture : **10 / 10 MODERN, 0 cassée.**

### Classement route par route (après correction)

| # | Route | À l'ouverture | Après correctif | A · même famille | B · distinction fonctionnelle | C · signature propriétaire |
|:--:|---|---|---|:--:|---|---|
| 1 | `/security` | MODERN | MODERN | oui | catalogue de laboratoire | grammaire TechBench (« ce que ce laboratoire ne fait pas »), référentiel subordonné |
| 2 | `/cloud-foundations/aws-ha-api` | MODERN | MODERN | oui | poste de travail | état système + échelle de sévérité réelle + limites |
| 3 | `/capstones` | **CASSÉE** | MODERN | oui | catalogue groupé | lignes de catalogue, pas de cartes |
| 4 | `/` | MODERN | MODERN | oui | pilotage | PositionRing + TrajectoryMap |
| 5 | `/missions` | MODERN | MODERN | oui | catalogue dense | surface continue, groupes par statut |
| 6 | `/pipelines` | MODERN | MODERN | oui | catalogue de laboratoire | TechBench |
| 7 | `/security/leaked-secret-config` | MODERN | MODERN | oui | poste de travail | artefact ↔ diagnostic côte à côte |
| 8 | `/week/12` | MODERN | MODERN | oui | catalogue de période | PositionRing en `aside` |
| 9 | `/diagnostics` | **CASSÉE** | MODERN | oui | catalogue évaluatif | taxonomie par niveau sur chaque ligne |
| 10 | `/cloud-foundations` | MODERN | MODERN | oui | catalogue de laboratoire | TechBench |

**B reste vrai** : catalogue, poste de travail, pilotage et période restent
distinguables entre eux. La convergence n'a pas produit d'uniformité.

### Réserve déclarée

`/diagnostics` (et `/`, `/calendar`, `/parcours`, `/synthese`, `/skills`)
conservent un bandeau `PageHeader` plat au-dessus de leur `HeroFocus`. Les deux
ne disent pas la même chose — le bandeau NOMME la surface, le hero ÉNONCE la
situation — mais c'est la seule composition du produit qui empile deux niveaux
d'en-tête. Ce n'est pas corrigé dans V58 : fusionner les deux empilerait deux
bandes pleines, et supprimer l'un des deux est une décision de composition qui
dépasse une convergence de balisage.

