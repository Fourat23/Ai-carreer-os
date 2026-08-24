# V57 — Addendum de métriques · **STRICTEMENT ADDITIF**

> Écrit et committé **avant toute mesure V57 et toute modification de route**.
>
> `docs/V56-SCORING-FROZEN.md` reste **la** référence. Ce document n'en
> modifie rien : aucun seuil, aucune formule, aucune pondération, aucune
> définition de succès. Il **ajoute** trois compteurs que le CP0 a rendus
> nécessaires, et il énonce ce qu'ils ne mesurent pas.
>
> Règle inchangée : une métrique défavorable **conserve son résultat**. On
> signale sa limite, on ajoute à côté, on ne réécrit jamais.

## 1. Pourquoi un addendum — le constat du CP0

`dominance` (gelée en V56) est le rapport d'aire du plus grand bloc de premier
niveau à la somme des blocs de premier niveau. Le CP0 l'a mesurée sur les
36 routes et a mis en évidence **deux dégénérescences symétriques** :

| Cas | Routes mesurées au CP0 | `dominance` | Réalité |
|---|---|:--:|---|
| **Émiettement** | `/diagnostics` (15 sections), `/capstones` (12) | 0,102 · 0,123 | aucune hiérarchie : des sœurs de poids égal |
| **Bloc unique** | `/lessons`, `/glossary`, `/lab`, `/security`, `/month/[id]`, `/week/[id]` | **1,000** | aucune hiérarchie non plus : un seul bloc, donc « dominant » par défaut |
| **Absence de bloc** | `/pipelines`, `/kubernetes`, `/cloud-lab`, `/settings` | **0,000** | la page n'émet aucun bloc structurant |

Une page bien composée et une page sans aucune structure peuvent donc rendre
la **même** valeur. `dominance` reste juste — elle mesure ce qu'elle dit —
mais elle **n'est pas interprétable seule**.

Second constat du CP0, sur `cards` : V56 a cru que sa dé-cardification de
`/diagnostics` n'avait « pas pris effet » (16 → 15 cartes). En réalité les
`.diag-card` sont devenues des lignes sans fond ni bordure — le correctif a
fonctionné — et les 14 cartes restantes sont les **conteneurs** `.diag-grid`,
à qui le même correctif a donné fond + bordure + rayon. La frontière de carte
a été **déplacée d'un niveau vers le haut**, pas supprimée. `cards` ne pouvait
pas le dire : c'est un total, il ne distingue pas conteneur et élément.

## 2. Les trois compteurs ajoutés

Mesurés à 1440 px comme le reste, dans `main.content`, par
`scripts/v57-visual.mjs`.

### `topBlocks`

**Ce qu'il mesure** — le **nombre** de blocs de premier niveau retenus par la
définition gelée de `dominance` (`section, article, aside, .ui-focus,
.ui-hero, .panel, .ui-panel`, ≥ 120×60 px, non imbriqués).

**Se lit toujours avec `dominance`**, jamais à sa place :

| `topBlocks` | `dominance` | Lecture |
|:--:|:--:|---|
| 0 | 0,00 | la page n'a **aucune** structure de premier niveau |
| 1 | 1,00 | bloc unique : la valeur haute ne prouve **rien** |
| ≥ 10 | ≤ 0,15 | émiettement : des sœurs équivalentes |
| **3 – 7** | **≥ 0,35** | **la seule combinaison qui atteste une hiérarchie réelle** |

**Ce qu'il ne mesure pas** — la qualité des blocs, leur ordre, leur contenu,
leur lisibilité. Un `topBlocks` de 5 n'est pas un brevet de composition.

**Pourquoi il ne remplace pas `dominance`** — `dominance` reste la métrique de
verdict, et **tous ses résultats V55/V56/CP0 sont conservés tels quels**, y
compris les 0,102 et 0,123 de `/diagnostics` et `/capstones`. `topBlocks` est
une clé de lecture, pas un seuil de succès : **il n'entre dans aucun critère R
et ne peut faire passer aucune route.**

### `cardsContainer` et `cardsItem`

`cards` (gelée, seuil ≤ 8) est conservée à l'identique. Elle est désormais
**décomposée** :

- `cardsItem` — cartes qui ne contiennent **aucune** autre carte : les feuilles.
- `cardsContainer` — cartes qui en contiennent au moins une autre : les
  enveloppes.
- Invariant vérifié par le harnais : `cardsItem + cardsContainer === cards`.
  L'addendum ne peut donc pas dériver de la métrique gelée.

**Signal recherché** — `cardsContainer ≈ cardsItem` avec un `cards` qui bouge
peu d'une passe à l'autre : c'est la signature du **déplacement de frontière**
que V56 a subi sans le voir.

**Ce qu'ils ne mesurent pas** — si une frontière est *justifiée*. Un conteneur
peut être légitime (un tableau bordé), un item peut être illégitime. La
justification reste une décision écrite, pas un compteur (§3).

## 3. Règle de justification d'une carte — qualitative, non mesurée

Une frontière de carte est justifiée si son contenu possède réellement **au
moins une** de ces propriétés :

action autonome · état autonome · navigation autonome · cycle de vie
indépendant · comparaison avec ses pairs · manipulation indépendante.

Sinon : section, ligne, groupe, bande, tableau, liste, surface continue.

Cette règle **n'est pas un seuil** et n'entre pas dans le comptage des routes
recomposées. Elle est appliquée route par route et justifiée dans le rapport.

## 4. Définition V57 de « route nouvellement recomposée »

La définition gelée V56 §4 s'applique **inchangée** (3 critères R sur 5 + les
3 conditions obligatoires `overflow = 0`, `clipped = 0`, axe 0). V57 ajoute
uniquement les **conditions d'éligibilité au plancher**, qui restreignent :

- **A** — la route n'était **pas** comptée comme réellement recomposée à la
  baseline CP0 (les 12 routes du CP0 sont exclues d'office) ;
- **B** — elle satisfait la définition gelée §4 ;
- **C** — l'inspection visuelle BEFORE/AFTER à 1440 px montre une différence
  **structurelle**, constatée sur capture ouverte ;
- **D** — l'amélioration ne repose pas essentiellement sur la peau : au moins
  un changement de **composition, hiérarchie, mode d'interaction ou
  représentation de l'information**, décrit dans le ledger.

Ne comptent pas comme preuve pour **C** : couleur, rayon, ombre, padding,
wrapper, renommage, ajout d'un hero seul, changement de police seul.

**Plancher : ≥ 10.** Il n'est pas modifiable. Si 8 ou 9 routes passent
honnêtement, le plancher est **ÉCHOUÉ** et déclaré tel quel.

## 5. Ce que cet addendum ne fait pas

- Il ne change aucun seuil de `docs/V56-SCORING-FROZEN.md`.
- Il ne réécrit aucun résultat V55 / V56 / CP0.
- Il n'introduit aucun critère R supplémentaire ni aucun sixième motif.
- Il ne crée aucune grille de verdict concurrente : le barème §10 de la
  grille gelée reste seul juge.
