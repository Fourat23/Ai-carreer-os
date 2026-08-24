# V58 — Critères · **GELÉS À CP1, AVANT TOUTE IMPLÉMENTATION**

> `docs/V56-SCORING-FROZEN.md` reste **la** grille de verdict, empreinte
> vérifiée à l'octet près par `v57:check` puis `v58:check`.
> `docs/V57-METRICS-ADDENDUM.md` reste en vigueur (`topBlocks`,
> `cardsContainer`, `cardsItem`, strictement additifs).
> Ce document ne modifie **aucun** seuil. Il fixe ce que V58 se donne comme
> définitions **avant** de mesurer quoi que ce soit.

## 1. Métriques conservées, sans exception

`dominance` · `surfaces` · `shadows` · `typeRange` · `cards` · `canvasShare` ·
`surfaceRatio` · `motifs` · `overflow` · `clipped` · responsive 9 largeurs ·
axe-core critical/serious · intégrité de progression.

Additives (V57, reconduites) : `topBlocks` · `cardsContainer` · `cardsItem`.

**Limite de `dominance`, reconduite telle quelle** : elle rend 1,000 pour une
page à bloc unique et 0,000 pour une page sans bloc. Elle n'est pas
interprétable seule ; `topBlocks` sert de clé de lecture et **n'entre dans
aucun critère R**.

## 2. Heuristique d'inventaire — et son interdiction d'usage

Le CP0 a classé les routes avec `surfaces ≥ 6 ET shadows ≥ 3`.

**C'est une sonde d'inventaire, jamais un objectif de design.** Ajouter un
fond, une ombre, un wrapper ou une carte dans le seul but de faire basculer
cette sonde est interdit et sera déclaré comme un échec, pas comme une
migration. Une route ne bascule que parce que sa composition a réellement
changé ; la sonde suit, elle ne guide pas.

## 3. Définition gelée de « route réellement recomposée » (V58)

La définition V56 §4 s'applique **inchangée** : au moins **3 critères R sur 5**
(R1 structure, R2 focus `dominance ≥ 0,35`, R3 `surfaces ≥ 6` **et**
`shadows ≥ 3`, R4 `typeRange ≥ 3,2`, R5 ≥ 1 motif propriétaire), **plus** les
3 conditions obligatoires `overflow = 0`, `clipped = 0`, axe 0 critical/serious.

V58 ajoute quatre **conditions d'éligibilité** qui restreignent, jamais qui
élargissent :

- **A** — la route est classée **ancienne** ou **intermédiaire** à la baseline
  CP0 (les 18 routes listées au §5) ;
- **B** — la définition gelée V56 §4 est satisfaite ;
- **C** — la différence structurelle BEFORE/AFTER est constatée **sur capture
  ouverte à 1440**, pas déduite d'un chiffre ;
- **D** — le changement porte sur au moins un de : **structure**, **hiérarchie**,
  **composition**, **affordances**, **identité**. Un reskin — classes CSS,
  couleurs, fonds supplémentaires, wrappers — **ne compte pas**.

Une route touchée qui échoue B, C ou D est comptée **« reskinnée seulement »**
et reste dans le décompte des anciennes.

## 4. Cible

**≤ 4 routes anciennes ou intermédiaires** à la clôture.

Ce n'est pas un quota : une route non conforme au §3 reste comptée ancienne,
même si cela fait échouer la cible. Le rapport publiera les trois listes
(recomposées / reskinnées seulement / non traitées).

## 5. Les 18 routes de la baseline CP0

| Famille | Routes |
|---|---|
| **A** learner-facing critique | `/glossary` · `/lessons` · `/missions/[id]` · `/capstones/[id]` · `/security` |
| **B** learner-facing secondaire | `/cloud-foundations` · `/notes` · `/career` · `/guide` · `/resources` · `/missions` |
| **C** détail technique | `/pipelines/[id]` · `/security/[id]` · `/kubernetes/[id]` · `/cloud-lab/[id]` · `/cloud-foundations/[id]` |
| **D** utilitaire | `/settings` |
| **E** document | `/doc/[...slug]` |

État BEFORE mesuré à 1440 px : `docs/audits/V58-CONVERGENCE-LEDGER.md`.

## 6. Compositions autorisées

**Aucun sixième motif propriétaire.** L'ensemble reste fermé à cinq :
`PositionRing`, `TrajectoryMap`, `PhaseRail`, `EvidenceMark`, `YearBand`.

Deux compositions **génériques** sont autorisées — ce sont des familles de
pages, pas des ornements :

1. **Detail Workbench Shell** — contexte → état système → opération → artefact
   → validation → diagnostic.
2. **Editorial Shell** — contexte → titre → résumé → navigation locale →
   contenu long → métadonnées → actions.

Réutilisation prioritaire de ce qui est déjà démontré : `TechBench` (3 routes),
grammaire `cat-*` (2 routes), bande d'identité `*-head` (11 routes).

## 7. Protocole de navigation aléatoire — figé AVANT toute inspection

**Graine : `V58-1440`.** Tirage déterministe, reproductible :
`index = (hash(seed + i) % N)` sur la liste des 36 routes publiques triée par
ordre alphabétique de chemin, sans remise, `N` décroissant.

Le tirage est écrit et committé **avant** d'ouvrir la moindre capture.
Chaque route tirée est classée à 1440 px en : `MODERN_AI_CAREER_OS` ·
`LEGACY_AI_CAREER_OS` · `AMBIGUOUS`.

**Objectif : ≥ 8 / 10 MODERN et 0 route cassée.** Un tirage défavorable n'est
pas rejoué.

## 8. Blind difference — trois mesures séparées

Pour chaque route testée, trois réponses distinctes, jamais fusionnées :

- **A · même famille** — l'écran appartient-il visuellement au même produit ?
- **B · distinction fonctionnelle** — catalogue, détail, workbench, éditorial
  et pilotage restent-ils distinguables entre eux ?
- **C · signature propriétaire** — quelque chose de spécifique à AI Career OS
  est-il présent (motif porteur de donnée, ou composition propre au domaine) ?

Une convergence réussie n'est **pas** l'uniformité : B doit rester vrai.

## 9. Verdict

Barème gelé V56 §10, inchangé. `REFERENCE_GRADE` exige moyenne ≥ 4,50, aucune
catégorie < 4, originalité ≥ 4,20, et les conditions structurelles.

**Clause ajoutée, restrictive uniquement** : même si les nombres passent, si le
test de navigation aléatoire échoue nettement ou si les captures montrent
encore deux produits visuels incompatibles, `REFERENCE_GRADE` n'est pas
déclaré sans exposer le conflit. Les métriques ne remplacent pas le jugement
visuel.

## 10. Interdits reconduits

XP · niveau utilisateur · streak · leaderboard · badges de mérite · confetti ·
progression artificielle · **données inventées** · fausses statistiques ·
seconde source de vérité · suppression ou changement d'URL · modification du
curriculum, d'une leçon, d'un exercice, d'une mission, d'un capstone, d'un
diagnostic, ou de l'ordre des 365 jours · **sixième motif propriétaire** ·
**ajout de fonds / ombres / wrappers pour satisfaire une sonde**.
