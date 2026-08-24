# V57 — Ledger de recomposition

> Créé à CP1, **avant** toute transformation. Chaque route y entre avec son
> état AVANT mesuré au CP0, son état APRÈS mesuré, la nature exacte du
> changement structurel, le motif employé (ou `NONE`, assumé), la preuve
> visuelle et le verdict.
>
> Conditions d'éligibilité au plancher (`docs/V57-METRICS-ADDENDUM.md` §4) :
> **A** non recomposée à la baseline CP0 · **B** définition gelée V56 §4
> satisfaite · **C** différence structurelle constatée sur capture ouverte ·
> **D** l'amélioration ne repose pas essentiellement sur la peau.
>
> Mesures à **1440 px**. `dom` = dominance (gelée) · `topB` = topBlocks
> (additif) · `s/o` = surfaces/ombres · `cart` = cards `container/item`
> (additif) · `canv` = canvasShare.

## P0 — hors plancher

Cette route **ne compte pas** dans le plancher de 10 : elle était déjà comptée
comme recomposée à la baseline CP0 (condition **A** non remplie). Elle ferme
une dette V56 nommée, elle ne l'augmente pas.

### `/revisions` — `app/revisions/page.tsx`, `app/revisions/RevisionStation.tsx`

| | AVANT (CP0) | APRÈS (V57) |
|---|---|---|
| `dom` / `topB` | 0,535 / **2** | 0,607 / **3** |
| `s` / `o` | 4 / 3 | **7** / **4** |
| `typeRange` | 3,77 | 3,77 |
| `cart` cont/item | 3 → 1/2 | **3 → 0/3** |
| `canv` | **0,025** | **0,712** |
| hauteur | 1 000 | 1 128 |
| ovf / rogn | 0 / 0 | 0 / 0 |

**Changement structurel.** L'en-tête de page, le hero-carte et le panneau
explicatif en deux colonnes sont remplacés par trois zones qui répondent
chacune à une question distincte : (1) une **bande de file** en trois
compartiments réels — en retard / à échéance / sous 30 jours — qui reste
visible et informative à zéro, parce que c'est la structure de la file qui
renseigne, pas son remplissage ; (2) un **échéancier** — bande temporelle
continue graduée par semaine, aujourd'hui → J+30, où chaque échéance réelle
est posée à son décalage réel ; (3) le **modèle**, en deux colonnes : l'échelle
de consolidation en matrice proportionnelle, et l'entretien hors échéance.

Les valeurs de l'échelle ne sont pas recopiées : la page **appelle**
`baseInterval()` de `lib/review.mjs`, le modèle pur qui planifie réellement les
révisions. Il ne peut donc pas exister de seconde source de vérité, et si la
règle change la page change avec elle.

**Anti-cardification.** L'échéancier et le modèle sont des sections
éditoriales ouvertes séparées par un filet : leur contenu n'a ni action, ni
état, ni cycle de vie propre, la frontière n'est pas justifiée (ADR-057 §5).
Seules trois frontières subsistent — la bande de file (point focal) et les
deux actions réellement autonomes. `cardsContainer = 0` : aucune frontière
n'a été déplacée d'un niveau, la part de texte hors carte passe de 2,5 % à
71,2 %.

**Motif : `NONE`, assumé.** Les cinq motifs expriment une position dans un
curriculum (`PositionRing`, `YearBand`), une trajectoire annuelle
(`TrajectoryMap`), un déroulé de document ancré (`PhaseRail`) ou la nature
d'une preuve (`EvidenceMark`). Une file d'échéances n'est aucune de ces cinq
choses ; en forcer un aurait été un ornement, ce que l'ADR interdit. La page
se distingue par sa composition.

**Honnêteté de l'état vide.** Zéro révision affiche zéro révision. Aucune
tâche, aucun compteur, aucune échéance n'est fabriqué. L'échéancier vide
affiche sa graduation et le dit en toutes lettres.

**Preuve** : `docs/audits/visual/v57-before/revisions@*.png` vs
`docs/audits/visual/v57-p0/revisions@*.png`.

**Blind-difference @1440 : 5/5 — RÉUSSI.** zones 2 → 3 · nature : hero + liste
→ bande de jauges + échéancier temporel + matrice · proportions : colonne +
aside étroit → bande pleine largeur puis grille 1,35fr/1fr · représentation
graphique nouvelle (bande graduée, barres proportionnelles) · cadres : 3
cartes fermées → sections ouvertes.

**Verdict : RECOMPOSÉE** (4 critères R sur 5 ; R5 non atteint, assumé).

## Plancher — routes NOUVELLEMENT recomposées en V57

_CP3 à CP11 — en cours._
