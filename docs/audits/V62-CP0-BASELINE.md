# V62 · CP0 — Audit forensique en lecture seule

Aucune modification n'a été faite avant l'écriture de ce document.
Toutes les valeurs sont mesurées au navigateur (Chromium) sur le build de
production, ou lues dans le dépôt. Aucune n'est estimée.

---

## 1. État Git réel

| | |
|---|---|
| branche | `claude/ai-career-os-saas-phfg49` |
| HEAD | `288bf2d3ff02f177ae160683777c0edf3d30287d` |
| origin | `288bf2d3ff02f177ae160683777c0edf3d30287d` — **local == origin** |
| working tree | **propre** (0 fichier) |
| stash | **vide** |
| serveurs résiduels | **aucun** |

Conforme à ce qu'annonçait le brief.

## 2. Invariants produit

| | mesure |
|---|---|
| `data/progress.json` | `73c1ee39a255c87972f4f42b36873b1081081d6f278bd767089c0cef1fc6e7a6` |
| corpus `curriculum/` (SHA des SHA) | `a2099b51db9d75a6db74f5547c5a60681ff69bac9f7be14fdf3c4684ae7a2edf` |
| fichiers du corpus | 951 |
| journées | **365** |
| `tsc --noEmit` | vert |
| `gates:active` | **40 / 40** |
| build | vert |

### 2.1 Un test instable — signalé, pas dissimulé

La **toute première** exécution de la suite dans cette session a donné
`pass 1284 / fail 1`. Les **quatre** exécutions suivantes ont donné
`pass 1285 / fail 0`. Le nom du test en échec n'a pas été capturé avant que la
sortie ne défile, et il n'a pas reparu.

Je ne peux donc pas le nommer, et je ne prétends pas que « les tests sont
verts » sans réserve : **1 échec sur 5 exécutions, cause non identifiée**.
À re-vérifier au CP15 avec un plus grand nombre d'exécutions et la sortie
conservée.

---

## 3. Inventaire réel des routes

**36 routes de production** (`app/**/page.tsx`), plus 13 routes de
`design-spike/` hors produit et hors périmètre.

## 4. DEUX SONDES FAUSSES TROUVÉES AU CP0 — et corrigées avant tout constat

Le brief demande de ne pas faire confiance aveuglément au prompt V62 hérité.
Il fallait surtout ne pas faire confiance à mes propres sondes.

**Bug 1 — faux négatif.** Ma sonde d'action primaire cherchait `main .btn.cta`.
Or le produit utilise **deux** classes pour le même rôle sémantique :
`.btn.cta` et `.btn.primary`. Cinq routes déclarées « sans action » en avaient
une : `/notes`, `/settings`, `/missions/[id]`, `/lab/[id]`, `/capstones/[id]`.
Repéré à l'œil sur la capture de `/notes`, qui affiche « Ouvrir le jour 1 » en
indigo plein.

**Bug 2 — faux négatif inverse.** La sonde corrigée lisait `backgroundColor`.
Or `.btn.cta` est peint par un **`linear-gradient`**, donc son
`backgroundColor` calculé vaut `rgba(0,0,0,0)`. La correction du bug 1 faisait
disparaître les 16 actions des routes migrées en V61.

La sonde finale lit `background-color` **et** `background-image`, et cherche une
teinte accentuée dans l'un ou l'autre. C'est elle qui produit les chiffres
ci-dessous.

**Conséquence de conception, pas seulement de mesure** : deux traitements
visuels coexistent pour la même action primaire — dégradé sur les routes
migrées, aplat sur les autres. C'est un défaut de cohérence réel (CONDITION D),
traité au CP2.

**Correction d'un chiffre de V61** : le rapport V61 §10 écrivait « 21 routes de
production n'ont ni ligne de contexte ni CTA ». La moitié « ni CTA » était
fausse pour 5 d'entre elles, à cause du bug 1. Le chiffre exact est ci-dessous.

---

## 5. Matrice de contexte — CONDITION A

Grammaire évaluée : **où suis-je** (ligne de contexte ou surtitre nommant la
famille) · **qu'est-ce que je regarde** (h1 réel et visible) · **quelle suite**
(action proéminente, quelle que soit sa classe).

| classe | définition | routes learner-facing |
|---|---|--:|
| **A** | 3 / 3 | **22** |
| **B** | 2 / 3 | **12** |
| **C** | 0-1 / 3 | **1** |

**Classe B (12)** — toutes pour la même raison : aucune suite.
`/lessons`, `/glossary`, `/guide`, `/resources`, `/career`,
`/security`, `/cloud-foundations`, `/cloud-lab`, `/cloud-lab/[id]`,
`/kubernetes`, `/pipelines`, `/pipelines/[id]`

**Classe C (1)** — `/doc/[...slug]` : ni surtitre de famille, ni suite.

**Couverture de la primitive `ContextLine`** : 15 / 36 routes. Les 21 autres
répondent à « où suis-je » par un surtitre, ce qui est acceptable, mais elles
ne partagent pas le registre commun. Les deux chiffres sont publiés ensemble
pour qu'aucun ne serve à masquer l'autre.

---

## 6. Hauteurs réelles — CONDITION B

Pages > 5 000 px à 375 px, par ordre décroissant :

| route | @375 | @1440 | blocs | dominance |
|---|--:|--:|--:|--:|
| `/lessons` | **18 762** | 9 627 | 3 | **0,90** |
| `/missions` | **13 776** | 5 853 | 7 | 0,431 |
| `/day/80` | **13 425** | 1 321 | 3 | 0,459 |
| `/lab` | 9 637 | 1 342 | 5 | 0,459 |
| `/projects` | 7 129 | 4 535 | 11 | 0,78 |
| `/guide` | 6 700 | 4 145 | 5 | 0,539 |
| `/resources` | 6 550 | 4 067 | 4 | 0,538 |
| `/month/3` | 6 382 | 3 180 | 9 | 0,45 |
| `/calendar` | 6 352 | 3 328 | 23 | 0,123 |
| `/parcours` | 6 270 | 3 200 | 22 | 0,332 |
| `/synthese` | 6 105 | 2 479 | 16 | 0,253 |
| `/career` | 5 445 | 3 300 | 5 | 0,528 |
| `/security` | 5 155 | 3 187 | 5 | 0,597 |

**13 routes** au-dessus de 5 000 px à 375 px.

### 6.1 Correction explicite d'une limite de V61

V61 a mesuré `/day/[id]` à **14 340 px** et l'a ramené à **1 321 px**. Ces deux
nombres sont exacts et comparables : la table du CP0 de V61 est explicitement
titrée « À 1440 × 900 ».

**Mais V61 n'a jamais mesuré la hauteur de page à 375 px.** Le seuil gelé
« hauteur `/day/[id]` ≤ 3 000 px » était donc, sans que je le dise, un seuil
**à 1440 seulement**. À 375 px, `/day/80` fait aujourd'hui **13 425 px** :
l'atelier borné à trois colonnes se déplie en une colonne unique dès que la
bascule de volets passe en mode étroit.

La conclusion de V61 n'était pas fausse ; **sa portée n'était pas déclarée**.
Le brief V62 nomme `/lessons` et `/missions` comme longues surfaces : la mesure
en ajoute une troisième, `/day/[id]`, et c'est une page centrale du produit.

---

## 7. Dette de DOM — CONDITION C

| route | nœuds `main` | dont dans un `<details>` FERMÉ | visibles | HTML |
|---|--:|--:|--:|--:|
| `/lab` | **6 438** | **5 264 (82 %)** | 5 974 | 867 Ko |
| `/glossary` | **3 947** | 0 | 3 923 | **1 073 Ko** |
| `/calendar` | 1 505 | 0 | 1 505 | 371 Ko |
| `/lessons` | 1 437 | 0 | 1 437 | 239 Ko |
| `/day/80` | 747 | 21 | 687 | 175 Ko |
| `/missions` | 687 | 0 | 687 | 155 Ko |

**Cause architecturale de `/lab`, mesurée et non supposée** : `LabCatalog`
rend les 32 groupes d'exercices en entier, chacun dans un `<details>`, dont un
seul est ouvert. Un `<details>` fermé **rend quand même ses enfants dans le
DOM**. 82 % du DOM existe donc pour du contenu que personne ne peut voir.
Recensement des balises : 376 `<li>` (les 376 exercices), 752 nœuds SVG
(2 par exercice), 3 179 `<span>`.

La solution qui correspond à ce problème mesuré est donc « ne rendre que le
groupe ouvert » — la première solution autorisée par le brief §12. Ce n'est ni
de la virtualisation par mode, ni du `display:none`.

**`/glossary` n'est pas dans le brief et devrait y être** : 1 073 Ko d'HTML,
**la route la plus lourde du produit**, plus lourde que `/lab`. Cause
différente : 738 `<li>` et 739 `<button>` tous réellement visibles — une liste
plate intégralement rendue. Le brief ne la nomme pas ; la mesure l'impose.

---

## 8. Cartification — §3

Conteneurs à fond + rayon + (bordure ou ombre), et signatures répétées :

| route | conteneurs | signature la plus répétée |
|---|--:|--:|
| `/day/80` | 20 | 8 |
| `/parcours` | 14 | 3 |
| `/calendar` | 14 | **12** |
| `/cloud-foundations` | 12 | **6** |
| `/security` | 10 | 3 |
| `/missions/[id]` | 10 | 2 |
| `/capstones/[id]` | 9 | 4 |
| `/cloud-lab/[id]` | 9 | 4 |

Points chauds : `/calendar` (12 signatures identiques) et
`/cloud-foundations` (6). La famille technique entière est encore en grille de
cartes.

## 9. Accessibilité — état d'entrée

**0 critical, 0 serious** sur les 36 routes × 375 et 1440. L'acquis de V61 tient.

## 10. Motifs — CONDITION D

Ensemble fermé à cinq, respecté. Répartition réelle :

| motif | routes |
|---|---|
| `tmap` | `/`, `/synthese` |
| `year-band` | `/parcours`, `/calendar`, `/month/[id]` |
| `pos-ring` | `/synthese`, `/week/[id]` |
| `phase-rail` | `/day/[id]` |
| `evi-mark` | `/reviews`, `/projects` |

**21 routes sur 36 ne portent aucun motif.** Ce n'est pas un défaut en soi — un
motif ne doit apparaître que s'il porte du sens — mais aucune route de la
famille technique ni de la famille « apprendre » n'en porte, ce qui contribue à
l'impression de deux produits.

---

## 11. Défauts vus À L'ŒIL, invisibles aux sondes

Le brief exige l'inspection des captures. Trois défauts n'apparaissent dans
aucune métrique (0 débordement, 0 rognage, 0 violation, dominance correcte) :

1. **`/doc/[...slug]`** — le hero est enfermé dans une carte d'environ 630 px
   flottant à gauche d'un canevas de 1 170 px. Le titre se casse sur quatre
   lignes, et le corps du document dessous court sur une mesure différente,
   non alignée avec l'intérieur de la carte. C'est aussi la **seule route dont
   le ratio typographique vaut 2,24** au lieu de 3,3 : le titre est petit parce
   qu'il est à l'étroit.
2. **`/security`** — grille de cartes à trois colonnes, hauteurs inégales, une
   carte orpheline seule sur la deuxième rangée. Cartification caractérisée.
3. **`/lessons` à 375 px** — l'index des 17 catégories occupe le premier écran
   entier en pastilles empilées, puis 128 leçons se déroulent sans aucun retour
   possible vers l'index. La structure est bonne au repos ; elle n'est pas
   navigable.

## 12. Classification modern / intermédiaire / legacy

| classe | définition | n | routes |
|---|---|--:|---|
| **moderne** | ligne de contexte + action + composition en lignes/bandes | **15** | les 15 migrées en V61 |
| **intermédiaire** | action présente, pas de ligne de contexte, cartes contenues | **10** | `/capstones/[id]`, `/missions/[id]`, `/lab/[id]`, `/notes`, `/settings`, `/security/[id]`, `/cloud-foundations/[id]`, `/kubernetes/[id]`, `/cloud-lab/[id]`, `/pipelines/[id]` |
| **legacy** | ni ligne de contexte ni action, ou grille de cartes dominante | **11** | `/lessons`, `/glossary`, `/guide`, `/resources`, `/career`, `/doc/[...slug]`, `/security`, `/cloud-foundations`, `/cloud-lab`, `/kubernetes`, `/pipelines` |

---

## 13. Audit du prompt V62 hérité (`docs/V61-PROMPT-V62.md`)

Le brief demande de ne pas lui faire confiance aveuglément. Confronté à la
mesure, il est **partiellement faux** :

| affirmation du prompt hérité | mesure CP0 | verdict |
|---|---|---|
| « 21 routes sans ligne de contexte ni CTA » | 21 sans `ContextLine`, mais **13** sans action | **inexact** — corrigé §4 |
| « `/lessons` 18 762 px » | 18 762 px | exact |
| « `/missions` 13 776 px » | 13 776 px | exact |
| « `/lab` 7 073 nœuds / 867 Ko » | 6 438 nœuds / 867 Ko | Ko exact, nœuds mesurés différemment (`main *` contre `*`) |
| liste des routes prioritaires | `/glossary` absent alors qu'il est le plus lourd du produit | **incomplet** |
| ne mentionne pas `/day/[id]` à 375 px | 13 425 px, 3ᵉ page la plus haute | **manque** |

Le plan CP1 ci-dessous corrige ces trois écarts.
