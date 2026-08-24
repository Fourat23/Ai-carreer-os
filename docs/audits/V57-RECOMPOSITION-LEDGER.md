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

Mesures BEFORE = baseline CP0 (`docs/audits/visual/v57-before/`), AFTER = fin
de sprint (`docs/audits/visual/v57-after/`), toutes à **1440 px**.

| # | Route | `dom` | `topB` | `surf/omb` | `typo` | `cart` (cont/item) | `canv` | R | motif |
|---|---|---|:--:|:--:|:--:|:--:|:--:|:--:|---|
| 1 | `/month/[id]` | 1,00→**0,558** | 1→**6** | 2/1→**6/3** | 1,65→2,88 | 0→3 (0/3) | 1,00→0,838 | **4** | YearBand |
| 2 | `/week/[id]` | 1,00→**0,524** | 1→**5** | 3/1→**7/3** | 1,65→**3,77** | 0→3 (0/3) | 1,00→0,518 | **5** | PositionRing |
| 3 | `/lab` | 1,00→0,959 | 1→**3** | 5/3→**8/4** | 3,77→4,08 | **385→11** (0/11) | 0,027→0,001 | **4** | NONE |
| 4 | `/lab/[exerciseId]` | 0,431→**0,742** | 3→3 | 4/**0**→**7/3** | 3,77→3,77 | 1→3 (0/3) | 0,261→0 | **4** | NONE |
| 5 | `/diagnostics` | **0,102→0,845** | **15→2** | 5/2→**6/3** | 4,08→4,08 | **15→3** (0/3) | 0,174→0,005 | **4** | NONE |
| 6 | `/capstones` | **0,123→0,814** | **12→2** | 4/2→**6/3** | 3,77→4,08 | **12→3** (0/3) | 0,168→0,005 | **4** | NONE |
| 7 | `/projects` | 0,910→0,874 | 2→**3** | 6/2→**8/3** | **2,27→3,77** | 4→5 (0/5) | 0,029→**0,670** | **5** | EvidenceMark |
| 8 | `/reviews` | 0,879→0,527 | 2→**4** | 5/2→**8/4** | 2,27→2,88 | 5→5 (0/5) | 0,013→0,020 | **4** | EvidenceMark |
| 9 | `/pipelines` | **0,000→0,492** | **0→3** | 3/1→**7/3** | 4,08→4,08 | 4→7 (1/6) | 0,180→0,109 | **4** | NONE |
| 10 | `/kubernetes` | **0,000→0,454** | **0→3** | 3/1→**7/3** | 4,08→4,08 | 4→7 (1/6) | 0,154→0,073 | **4** | NONE |
| 11 | `/cloud-lab` | **0,000→0,496** | **0→3** | 3/1→**7/3** | 4,08→4,08 | 4→7 (1/6) | 0,127→0,090 | **4** | NONE |

Conditions obligatoires vérifiées sur les onze : `overflow = 0` et
`clipped = 0` aux **neuf** largeurs (225/225 états), axe-core **0 critical /
0 serious**.

### Changement structurel, route par route

1-2. **`/month/[id]`, `/week/[id]`** — un `article.prose` de 632 px devient une
vue de pilotage : position dans l'année, progression réelle, tableau des
semaines (mois) ou liste ordonnée des journées avec statut (semaine),
compétences en journées réelles, nature des journées, difficulté, projets,
prochaine journée non terminée. Tout dérive de `lib/period-model.mjs`, qui ne
lit que des champs existants du programme et de la progression. Le document du
curriculum reste le document, non encarté.

3. **`/lab`** — 376 cartes deviennent un catalogue groupé par compétence, en
lignes denses sur une surface continue, un seul groupe ouvert par défaut, plus
une bande d'identité et le prochain exercice non réussi du parcours actif.
**Le débordement horizontal traîné depuis V56 disparaît à toutes les largeurs**
(67 px à 375, 29 px à 768, 5 px à 1440) parce que sa cause — le nombre
d'éléments rendus — a été supprimée, non masquée. Hauteur 44 711 → 6 921 px.

4. **`/lab/[exerciseId]`** — un titre et un éditeur deviennent un poste de
travail : objectif, environnement (runtime, disponibilité réelle), artefact
attendu (fichier éditable), validation (nombre de tests, part de tests privés
non listés), contexte (journées du curriculum). Aucun nom de test privé
révélé.

5-6. **`/diagnostics`, `/capstones`** — correction **dans le DOM**, cause
établie au CP0 : une `<section>` par domaine, 14 et 12 blocs sœurs de poids
quasi égal, hero plus petit que le premier bloc de contenu. Un seul bloc
structurant désormais, domaines en groupes internes, items en lignes, plus une
bande d'index de domaines. `dominance` passe de 0,102 à 0,845 et de 0,123 à
0,814 — la métrique que **deux passes de CSS n'avaient pas déplacée d'un
millième**.

7. **`/projects`** — le lien projet ↔ journées est réel (champ `project`) : la
page lit les journées rattachées, leur statut, leurs livrables et leurs
compétences, et propose la prochaine journée non terminée. Quand aucune journée
n'est rattachée, elle le dit. Part du texte hors carte : 0,029 → 0,670.

8. **`/reviews`** — organisée autour de la décision : prochaine revue due
résolue jusqu'à l'action, 52 revues groupées par mois, grilles en sections
dépliables. Aucune note calculée.

9-11. **`/pipelines`, `/kubernetes`, `/cloud-lab`** — de **zéro bloc
structurant** à la grammaire de poste de travail : contexte → **limites** →
inventaire → travail → prolongements. Sur un simulateur, ce qui n'est pas
simulé est l'information la plus importante ; elle a désormais sa zone.

### Motifs — trois nouveaux emplois, quatre `NONE` assumés

`YearBand` sur `/month/[id]` (où ce mois tombe dans l'année),
`PositionRing` sur `/week/[id]` (position dans le programme),
`EvidenceMark` sur `/projects` et `/reviews` (nature d'une preuve : livrable de
projet, grille d'évaluation).

`NONE` assumé sur `/lab`, `/lab/[id]`, `/diagnostics`, `/capstones`,
`/pipelines`, `/kubernetes`, `/cloud-lab` : aucun des cinq motifs n'exprime
« inventaire de scénarios » ni « catalogue par domaine ». En poser un aurait
augmenté la couverture sans porter d'information — l'ADR l'interdit.

### Routes touchées mais NON comptées

- **`/revisions`** — P0, déjà comptée recomposée à la baseline CP0
  (condition **A** non remplie). Ferme une dette, n'augmente pas le plancher.
- **`/day/[id]`** — durcie, non recomposée : V56 est la baseline et les quatre
  zones ne bougent pas. Mesures @1440 identiques, ce qui est le résultat voulu.
- **`/`, `/parcours`, `/calendar`, `/synthese`** — inchangées volontairement.
  Aucun churn pour réussir un test.

**Plancher : 11 routes ≥ 10. ATTEINT.**

### Fichiers touchés, route par route

1. `app/month/[id]/page.tsx` · `app/period/PeriodLoad.tsx` · `lib/period-model.mjs`
2. `app/week/[id]/page.tsx` · `app/period/PeriodLoad.tsx`
3. `app/lab/page.tsx` · `app/lab/LabCatalog.tsx`
4. `app/lab/[exerciseId]/page.tsx` · `app/lab/[exerciseId]/CodeMirrorEditor.tsx` · `app/lab/[exerciseId]/LabWorkspace.tsx`
5. `app/diagnostics/DiagnosticsBoard.tsx`
6. `app/capstones/page.tsx`
7. `app/projects/page.tsx`
8. `app/reviews/page.tsx`
9. `app/pipelines/page.tsx` · `app/tech/TechBench.tsx`
10. `app/kubernetes/page.tsx` · `app/tech/TechBench.tsx`
11. `app/cloud-lab/page.tsx` · `app/tech/TechBench.tsx`

P0 : `app/revisions/page.tsx` · `app/revisions/RevisionStation.tsx`
P3 : `app/day/[id]/page.tsx` (inchangé) · `app/ui/PhaseRail.tsx` (position recalculée)
