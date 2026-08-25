# V58 — PRODUCT CONVERGENCE & REFERENCE-GRADE ATTEMPT · rapport final

Branche `claude/ai-career-os-saas-phfg49`. Toutes les mesures à 1440 px sauf
mention contraire, Chromium, périmètre `main.content`.

---

## 1. Ce que le sprint devait faire

Passer d'une signature **locale** (des pages réussies) à une signature
**produit** (ouvrir une route au hasard ne doit plus donner l'impression de
quitter l'application). Pas d'uniformité : une **grammaire partagée**, avec la
distinction fonctionnelle préservée.

Cible chiffrée : **≤ 4 routes anciennes ou intermédiaires** à la clôture, sur
les 18 recensées à la baseline.

## 2. Ce qui a été fait, checkpoint par checkpoint

| CP | Objet | Commit |
|:--:|---|---|
| CP2 | Glossaire en explorateur deux volets + primitive `SurfaceHead` | `196f5dd` |
| CP3 | Coquille éditoriale partagée (`/career`, `/guide`, `/resources`) | `a3ce7b1` |
| CP4 | Coquille de poste de travail, 5 routes de détail technique | `636d52b` |
| CP5 | `TechBench` propagé à `/security` et `/cloud-foundations` | `465901c` |
| CP6 | Catalogues `/lessons` et `/missions` | `111fd46` |
| CP7 | Détails learner-facing `/missions/[id]`, `/capstones/[id]` | `119772e` |
| CP8 | `/settings` et `/notes` | `9f46e2d` |
| CP9 | `/revisions` : ordre piloté par l'état, identité partagée | `4f1184f` |
| CP10 | Convergence réelle des bandes d'identité (8 surfaces) | `43b06f4` |
| CP11 | Navigation aléatoire `V58-1440` — deux routes cassées trouvées | `40526bf` |
| CP12+13 | Responsive 9 largeurs + axe-core | `9d3509b` |
| CP14 | Registre de convergence AVANT → APRÈS | `8c4fe7d` |

## 3. Décompte de clôture

| Classe | Nombre |
|---|:--:|
| Réellement recomposées | **15** |
| Reskinnées seulement | **2** — `/career`, `/resources` |
| Non traitées | **1** — `/doc/[...slug]` |

**Routes anciennes ou intermédiaires restantes : 3.**
Cible ≤ 4 : **atteinte**, sans qu'aucun seuil n'ait bougé, sans qu'aucune
métrique défavorable ait été supprimée et sans reclassement favorable.

Détail complet : `docs/audits/V58-CONVERGENCE-LEDGER.md`.

## 4. La convergence, concrètement

Le CP2 avait posé la primitive `SurfaceHead` mais laissé **onze copies** du même
bloc dans le balisage, chacune avec sa définition CSS. Le CP10 les retire :

`tb-head` (5 routes) · `lab-head` · `lab-ex-head` · `proj-head` · `rv-head` ·
`period-head` (2 routes) · `page-head` du diagnostic pris → tous sur
`SurfaceHead`. **Cinq blocs CSS dupliqués supprimés.** Une correction de bande
se fait désormais en un seul endroit — ce qui a immédiatement servi au CP12.

La distinction fonctionnelle est portée par `sh-{kind}` : `pilot`, `catalog`,
`detail`, `workbench`, `editorial`. Un filet latéral de 3 px encode la famille.
C'est la **seule** chose qui change d'une famille à l'autre dans la bande.

## 5. Deux défauts trouvés parce que la primitive était partagée

- Le séparateur d'ariane n'était stylé que sous `.page-eyebrow`, la primitive
  héritée. Depuis le CP2 toutes les bandes utilisent `.sh-eyebrow` : le
  séparateur avait perdu son espacement **partout** dans le produit
  (« mois 3/ semaine 12 »). Corrigé dans la primitive, donc partout.
- À 375 px, `.sh-facts dt { white-space: nowrap }` faisait déborder la colonne
  de faits de 19 px, coupée par l'overflow de la bande : « DURÉE MOYENNE »
  s'affichait « DURÉE MOYEN ». **Perte de données**, sur toutes les surfaces à
  trois faits ou plus. Corrigé dans la primitive.

## 6. La régression que ce sprint a lui-même introduite

Le CP6 avait ajouté `.cat-row-link { grid-template-columns: 24px … }` **sans
condition**, pour l'ordinal de `/lessons`. La règle s'appliquait à toutes les
rangées de catalogue : sur `/capstones` et `/diagnostics`, chaque titre se
coupait à **un mot par ligne**.

`overflow = 0`, `clipped = 0`, `dominance`, `surfaces`, `shadows` et
`typeRange` **strictement inchangés** : aucune métrique gelée ne pouvait le
voir. C'est la navigation aléatoire du CP11, **sur capture**, qui l'a trouvé.

Effet de la correction : `/capstones` 4 835 → 1 871 px de haut ;
`/diagnostics` 4 865 → 2 408 px.

## 7. Navigation aléatoire — tirage `V58-1440`, gelé avant inspection

Objectif figé : **≥ 8/10 MODERN et 0 route cassée**.

- **À l'ouverture : 8 MODERN, 0 AMBIGUOUS, 2 CASSÉES.**
  → **objectif NON ATTEINT** : la condition « 0 route cassée » échoue.
- Après correction : **10/10 MODERN, 0 cassée.**

Les deux résultats sont publiés. Le premier n'est pas réinterprété.
Blind difference en trois mesures séparées (A même famille / B distinction
fonctionnelle / C signature propriétaire) : **B reste vrai** — catalogue, poste
de travail, pilotage et période restent distinguables entre eux.

## 8. Responsive — 9 largeurs, au-delà de l'overflow

Quatre défauts réels corrigés : perte de données dans la bande à 375 px ;
cibles tactiles du saut alphabétique du glossaire (27 → 34 px) ; échelle de
sévérité coupée à 1024 px ; tableaux du curriculum écrasés à 63–106 px sur
mobile au lieu de défiler.

Deux signalements de la sonde **vérifiés puis écartés sur capture** : le
« débordement » du glossaire (enfant en ligne d'un parent déjà tronqué par
ellipse) et les « colonnes écrasées » de `/day/[id]` et `/doc` (étiquettes
accessibles du `PhaseRail` en mode compact).

**Non corrigé et déclaré** : les cibles interactives sous 32 px restent
nombreuses dans les catalogues denses — 400 sur `/lab`, 68 sur `/reviews`,
17 sur `/lessons`. C'est une décision de densité qui porte sur tout le produit.
Le chiffre est publié, pas maquillé.

## 9. Accessibilité

axe-core sur les 35 routes touchées. Un défaut **serious** trouvé et corrigé :
`/missions/[id]` posait `aria-label` sur un `div` sans rôle
(`aria-prohibited-attr`). Après correction : **0 critical, 0 serious**.

Restent trois signalements **moderate** non corrigés et déclarés :
`landmark-unique` (`/security`, `/projects`, `/day/[id]`) et
`page-has-heading-one` (`/capstones`, dont le hero porte le titre).

**Ceci est un test automatisé.** Aucun lecteur d'écran réel n'a été utilisé et
rien ici ne prétend le remplacer.

## 10. Ce qui a reculé

- **`/capstones` : amplitude typographique 4,08 → 2,83.** Cause : la
  suppression d'un titre fantôme dupliqué qui gonflait `maxFont`. **La valeur
  basse est la vraie** ; l'ancienne était fausse. Le recul est conservé.
- `/security` dominance 0,686 → 0,678 et `/cloud-foundations` 0,423 → 0,393
  entre le CP5 et la clôture. Écart réel, sans conséquence sur R2.

## 11. Ce qui n'a pas été fait

- **`/doc/[...slug]` n'est pas recomposée.** Elle a reçu des correctifs CSS au
  CP12 mais aucune recomposition. Une route non terminée reste non terminée.
- **`/career` et `/resources` restent des reskins** (2 critères R sur 5). Elles
  ont la coquille éditoriale mais leur amplitude (2,88) reste sous 3,20.
- **Six routes de pilotage** (`/`, `/calendar`, `/parcours`, `/synthese`,
  `/skills`, `/diagnostics`) conservent un bandeau `PageHeader` plat au-dessus
  de leur `HeroFocus`. Les deux ne disent pas la même chose — le bandeau nomme
  la surface, le hero énonce la situation — mais c'est la seule composition du
  produit qui empile deux niveaux d'en-tête. Les fusionner empilerait deux
  bandes pleines : ce serait une régression, pas une convergence.
- **`R3` (`fonds ≥ 6` ET `ombres ≥ 3`) échoue sur 7 des 15 recomposées.**
  Aucun fond, aucune ombre, aucun wrapper n'a été ajouté pour faire basculer la
  sonde : le §2 et le §10 des critères gelés l'interdisent.

## 12. Intégrité — vérifiée à la clôture

| Invariant | État |
|---|---|
| `data/progress.json` | blob `323604021055588a9528a86875f36598dbdc7758` — **inchangé** |
| Corpus figé | SHA-1 `4c1f3028…fdb3` — vérifié par `v48/v49/v50:check` |
| Routes publiques | **36** — aucune ajoutée, aucune supprimée, aucune URL changée |
| Curriculum / données | **0 fichier modifié** sous `curriculum/` et `data/` |
| Motifs propriétaires | **5**, ensemble fermé — aucun sixième |
| Gamification | aucune — vérifié par `v41:check`, `v56:check` |
| Seconde source de vérité | aucune — les intervalles de `/revisions` viennent de `completeReview()` |

Un état de progression **temporaire** a été écrit deux fois pour vérifier les
états peuplés de `/notes` et `/revisions`, puis restauré ; le blob a été
recontrôlé après chaque restauration et il est intact.

## 13. Gauntlet

| Contrôle | Résultat |
|---|---|
| `npm test` | **1285 / 1285** |
| `npx tsc --noEmit` | propre |
| `npm run build` | succès, 36 routes |
| `npm run gates:active` | **38 portes vertes**, sortie 0 |
| axe-core, 35 routes | 0 critical, 0 serious |

## 14. Verdict

**`REFERENCE_GRADE` n'est pas déclaré.**

Le §9 des critères gelés prévoit une clause **restrictive uniquement** : même
si les nombres passent, un échec net du test de navigation aléatoire empêche de
déclarer `REFERENCE_GRADE` sans exposer le conflit. Le test avait une condition
explicite — « 0 route cassée » — et cette condition a **échoué à l'ouverture du
tirage**, sur une régression introduite par ce sprint même. Le fait qu'elle
soit corrigée ensuite ne réécrit pas le résultat du test.

S'y ajoutent, sans être décisifs seuls : une route non traitée, deux reskins
assumés, `R3` en échec sur près de la moitié des routes recomposées, et un
recul typographique conservé sur `/capstones`.

**Verdict retenu : `STRONG_IMPROVEMENT`.**

Ce que le sprint a réellement acquis : la grammaire d'identité est devenue une
**primitive unique** au lieu de onze copies, ce qui a rendu deux défauts
produit visibles et corrigeables en un seul endroit ; quinze routes anciennes
sont réellement recomposées ; et le protocole de navigation aléatoire a prouvé
sa valeur en trouvant un défaut bloquant qu'aucune métrique gelée ne voyait.

## Note sur le bloc de certification

Le sprint demandait des réponses explicites à **12 questions de certification**
posées dans le brief. Ce brief n'est plus disponible mot pour mot : il a été
compacté hors du contexte et n'existe nulle part dans le dépôt. **Les 12
questions ne sont donc pas reproduites ici, et elles ne sont pas reformulées de
mémoire** — ce serait répondre à des questions inventées.

Ce qui EST vérifié et répondu point par point est la version **committée** de
ces exigences, `docs/V58-CRITERIA-FROZEN.md` :

| § | Exigence gelée | Réponse |
|:--:|---|---|
| 1 | Aucune métrique supprimée, aucun seuil déplacé | ✅ grille V56 intacte, vérifiée par `v57:check` |
| 2 | La sonde d'inventaire n'est jamais un objectif de design | ✅ `R3` échoue sur 7 routes et n'a pas été forcé |
| 3 | Définition gelée de « recomposée » appliquée sans amendement | ✅ ≥ 3 R sur 5 + `overflow` 0 + `clipped` 0 + axe propre |
| 4 | Cible ≤ 4 routes anciennes | ✅ 3 restantes ; les non conformes restent comptées anciennes |
| 5 | Les 18 routes de la baseline traitées ou déclarées | ✅ 15 recomposées, 2 reskins, 1 non traitée, toutes nommées |
| 6 | Aucun sixième motif ; deux compositions génériques autorisées | ✅ 5 motifs, `EditorialShell` et `WorkbenchShell` uniquement |
| 7 | Tirage aléatoire gelé avant inspection, non rejoué | ✅ committé au CP1, ouvert tel quel, résultat d'ouverture publié |
| 8 | Blind difference en trois mesures séparées | ✅ A / B / C par route ; B reste vrai |
| 9 | Clause restrictive sur `REFERENCE_GRADE` | ✅ appliquée : `REFERENCE_GRADE` refusé, conflit exposé au §14 |
| 10 | Interdits reconduits | ✅ aucun XP, badge, streak, statistique inventée, URL changée, fond ajouté pour une sonde |
| — | Curriculum 1.0 gelé | ✅ 0 fichier `curriculum/` ou `data/` modifié |
| — | `data/progress.json` jamais muté par la navigation | ✅ blob identique à l'ouverture et à la clôture |
