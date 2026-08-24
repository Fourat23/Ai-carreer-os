# SPRINT V56 — Product Signature & High-Value Experience

Baseline `b01a587` (V55) → gel des critères `ab56559` → livraison `91f8d28`.
Branche `claude/ai-career-os-saas-phfg49`.

## 1. La règle qui change tout : gel des critères à CP0

`docs/V56-SCORING-FROZEN.md` a été écrit et **committé avant la première
mesure**. Aucune formule, aucun seuil, aucune définition de succès n'a été
modifié ensuite. Deux métriques se sont révélées imparfaites : leurs résultats
sont **conservés**, leurs limites **signalées**, et une métrique complémentaire
a été **ajoutée** — jamais substituée (§9).

## 2. CP0 — ce que la mesure a montré

| @1440 | dom. | surf | ombres | police | ampl. | cartes | répét. | ratio | motifs |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Dashboard | 0,39 | 9 | 3 | 49 | 3,77 | 8 | 3 | 1,13 | 2 |
| **day-181** | — | **4** | **1** | **34** | **2,00** | 11 | 7 | 0,36 | **0** |
| **day-80** | — | **4** | **1** | **34** | **2,00** | **31** | **13** | **0,13** | **0** |
| **day-1** | — | **4** | **1** | **34** | **2,00** | 13 | 7 | 0,31 | **0** |
| Révisions | 1,00 | 5 | **1** | 49 | 3,77 | 3 | 1 | 1,67 | **0** |
| Calendrier | 0,18 | 5 | 3 | 49 | 4,08 | 13 | 52* | 0,38 | 0 |

**`/day/[id]` n'avait jamais reçu le système V55** : 4 fonds, 1 ombre, 34 px,
amplitude 2,00 — exactement les valeurs d'avant V55, sur la surface où
l'apprenant passe ses 4-5 heures. Elle avait hérité de la palette, pas du système.

**Signature quasi inexistante** : au sens de la définition gelée (≥ 2 surfaces),
**un seul** motif comptait — `PositionRing`.

## 3. Les cinq motifs propriétaires — et leur raison d'exister

L'ensemble est **fermé à cinq** (plafond gelé à CP0). Le gate `v56:check`
refuse un sixième.

| Motif | Donnée portée | Raison informationnelle | Surfaces |
|---|---|---|:--:|
| `PositionRing` (V55) | progression + position + mois réels | « où j'en suis dans le programme » | 3 |
| `TrajectoryMap` (V55) | journées réelles groupées par mois | « comment mon année se remplit » | 2 |
| **`PhaseRail`** | phases réellement présentes dans le contenu | « où j'en suis dans la journée », position **observée** dans le document | 2 |
| **`EvidenceMark`** | type de preuve réel | rendre un type reconnaissable sans lire l'étiquette | 2 |
| **`YearBand`** | 365 journées réelles en une ligne | rétablir la **continuité** que douze blocs détruisent | 2 |

`EvidenceMark` **n'est pas un badge de collection** : le glyphe est déterminé
par le type, jamais par une quantité, une rareté ou un mérite. Il ne se gagne
pas, il nomme — et le libellé textuel reste toujours affiché.

`YearBand` résout le dernier problème structurel du calendrier **sans toucher à
l'ordre** : chaque mois y pèse son nombre réel de journées, donc un mois peu
couvert apparaît **court** au lieu d'occuper un grand panneau vide.

## 4. `/day/[id]` — de l'article au poste de travail

| | AVANT | APRÈS |
|---|:--:|:--:|
| Fonds distincts | **4** | **9** |
| Niveaux d'ombre | **1** | **3** |
| Police maximale | **34 px** | **49 px** |
| Amplitude titre/corps | 2,00 | **2,88** |
| Cartes (journée 80) | **31** | **17** |
| Répétition cartée | — | **8** |
| Ratio de surfaces | **0,13** | **0,53** |
| Motifs propriétaires | **0** | **1** |
| Contenu hors carte | 0,76 | **0,73** (seuil ≥ 0,25) |

Quatre zones désormais distinctes : **Mission** (hero, cran display, objectif,
compétence, difficulté, durée, position, état, actions) · **Déroulé**
(`PhaseRail`, bande compacte + rail collant ≥ 1200 px) · **Lecture** (le cours
reste un document, jamais mis en cartes) · **Pratique** (rupture visuelle
explicite « je lis » → « je fais », suivie de la clôture et des preuves).

La liste de 13 exercices de laboratoire, qui produisait treize cartes empilées,
est devenue une **liste dense** : un conteneur, des lignes séparées par un filet.

## 5. Limites conservées, jamais réécrites

**`typeRange ≥ 3,2` n'est pas atteint sur `/day` (2,88).** Le corps de lecture y
est légitimement à 17 px, ce qui écrase mécaniquement le rapport titre/corps.
Le seuil a été gelé sans distinguer page-tableau et page-document. **Le
résultat est conservé tel quel** ; `/day` valide malgré tout 4 critères R sur 5.

**`maxRepeat ≤ 12` échoue sur la journée 80 (16).** Cette journée porte
réellement 16 activités : seize *lignes* d'une même liste ne sont pas de la
cardification, seize *cartes* le seraient. Une métrique **complémentaire** a été
ajoutée — `maxRepeatCarded`, qui ne compte que la répétition parmi les éléments
réellement « carte » : **8**. L'originale reste publiée.

**La dominance n'est pas informative sur une page-document** (0,66-0,76 par la
seule longueur de l'article). Signalé dès CP0, conservé.

## 6. Routes recomposées — comptage au sens de la définition gelée (§4)

Rappel : 3 critères R sur 5, **plus** `overflow = 0`, `clipped = 0`, axe 0.

**Nouvellement recomposées en V56 — 8 :**
`/day/[id]` (4 R) · `/doc/[...slug]` (3 R) · `/revisions` (3 R) · `/skills` (3 R) ·
`/lessons` (3 R) · `/glossary` (3 R) · `/notes` (3 R) · `/missions` (3 R).

**Surfaces V55 ayant reçu un changement substantiel en V56 — 3 :**
`/calendar` (YearBand, 4 R) · `/parcours` (YearBand, 5 R) · `/synthese`
(TrajectoryMap + EvidenceMark, 5 R).

**Seulement « skinnées » — 4, comptées comme telles :**
`/projects` et `/reviews` (échouent R4 : amplitude 2,27) ·
`/diagnostics` et `/capstones` (échouent R2 : dominance 0,10 et 0,12 — le hero
reste noyé sous 15 et 12 cartes malgré la tentative de dé-cardification, qui
n'a pas pris effet ; défaut non résolu, reporté).

**`/lab` est exclu** : il conserve un débordement horizontal de **5 px** qu'aucun
élément mesuré n'explique (aucune boîte ne dépasse le viewport). Condition
obligatoire non remplie → non compté.

**Le plancher de 10 n'est donc PAS atteint sur les routes NOUVELLES (8).**
Il l'est si l'on inclut les 3 surfaces V55 substantiellement retravaillées (11).
Les deux lectures sont données ; la moins flatteuse est la bonne à retenir.

## 7. Scores sur la grille gelée (§2)

| Catégorie | Dashboard | Day | Révisions | Parcours | Calendrier |
|---|:--:|:--:|:--:|:--:|:--:|
| Identité | 4,0 | 4,0 | 2,5 | 4,5 | 4,0 |
| Originalité | 4,0 | 4,0 | 2,5 | 4,5 | 4,0 |
| Sophistication | 4,0 | 4,0 | 3,5 | 4,0 | 4,0 |
| Profondeur | 4,0 | 4,5 | 3,0 | 4,0 | 4,0 |
| Hiérarchie | 4,5 | 4,5 | 4,0 | 4,5 | 3,5 |
| Composition | 4,0 | 4,0 | 3,5 | 4,0 | 3,5 |
| Pédagogie visuelle | 4,0 | 4,5 | 4,0 | 4,0 | 4,0 |
| Cohérence | 4,5 | 4,5 | 4,0 | 4,5 | 4,5 |
| Utilisabilité | 4,5 | 4,5 | 4,0 | 4,5 | 4,0 |
| Premium | 4,0 | 4,0 | 3,0 | 4,0 | 4,0 |
| **Moyenne** | **4,15** | **4,25** | **3,40** | **4,25** | **3,95** |

**Moyenne globale : 4,00.** Originalité moyenne : **3,80** (objectif 4,2).

Justification des notes basses : `/revisions` n'accueille **aucun motif
propriétaire** — aucun des cinq n'y avait de sens réel, et en forcer un aurait
été un ornement. Sa file est vide à l'état neuf, ce qu'aucune composition ne
compense sans inventer de données.

## 8. Blind difference (protocole gelé §6)

- **`/day/[id]` — RÉUSSI** : 5 différences sur 5 (nombre de zones : 3 → 4 ·
  proportions : colonne unique → corps + rail collant · motif propriétaire
  ajouté · échelle typographique 34 → 49 px · nature : article → poste de travail).
- **`/revisions` — ÉCHOUÉ** : 2 différences sur 5 (échelle typographique et
  profondeur). La composition reste celle de V54.2.1 : un hero a été ajouté, la
  page n'a pas été **repensée**. C'est un échec, il est déclaré comme tel.

## 9. Responsive · Accessibilité · Intégrité

- **117 / 117** états conformes (13 routes × 9 largeurs), les **5 journées
  représentatives** figées à CP0 incluses — un layout de journée ne pouvait pas
  être déclaré stable sur un seul contenu.
- **axe-core : 0 critical / 0 serious** sur 10 routes, `/day` et `/doc` inclus.
  Deux défauts hérités du rendu Markdown ont été corrigés à la source :
  cases à cocher `disabled` sans étiquette (critical ×4) et blocs de code
  défilants inatteignables au clavier (serious ×2).
- **8 / 8** `VISIT_*_DOES_NOT_MUTATE_PROGRESS`, **sans restauration**.
- **32 / 32** états d'ordre chronologique du calendrier.
- `npm test` **1285/0** · `tsc` **0** · `build` **OK** · `gates:active` **exit 0**.

## 10. Invariants

Corpus `4c1f3028…` · `progress.json` `32360402…` · 365 jours ordre inchangé ·
0 fichier pédagogique modifié · aucune donnée inventée · aucune gamification ·
aucune seconde source · aucune URL supprimée.

Les deux annotations d'accessibilité posées sur le HTML rendu (`aria-hidden` sur
les cases décoratives, `tabindex` sur les blocs de code) **ne touchent pas au
contenu** : elles corrigent ce que Markdown produit mécaniquement.

## 11. Dette restante

- **`/revisions` reste sous-transformée** (3,40) — blind-difference échoué.
- **`/diagnostics` et `/capstones`** : la dé-cardification n'a pas pris effet
  (15 et 12 cartes subsistent, dominance 0,10 et 0,12). Cause non identifiée.
- **`/lab`** : 5 px de débordement inexpliqué, 385 cartes, 44 711 px de haut.
- **`/glossary`** : 712 cartes, 111 686 px — jamais recomposé au fond, et son
  accessibilité n'a **pas** été vérifiée (page trop lourde pour le harnais).
- **20 routes** n'ont toujours reçu que la peau.
- AAA non visé ; **aucun test lecteur d'écran réel** — reporté, jamais simulé.

## 12. Verdict

**STRONG_IMPROVEMENT.** Pas `REFERENCE_GRADE` : moyenne 4,00 (< 4,5),
originalité 3,80 (< 4,2), Révisions 3,40 (< 4,0), blind-difference Révisions
échoué, plancher de 10 routes nouvelles non atteint (8).

> **AI Career OS possède-t-il une signature identifiable au-delà de sa palette
> et de son logo ?** → **PARTIELLEMENT.**
> Cinq motifs existent, chacun porteur d'une donnée réelle et réutilisé sur au
> moins deux surfaces : logo masqué, le rail de phases, la bande d'année,
> l'anneau de position et la carte de mois rendent les écrans principaux
> reconnaissables entre eux. Mais la signature ne couvre que **7 surfaces
> sur 36**, et une surface majeure (`/revisions`) n'en porte aucune.

> **La surface Day est-elle assez bonne pour y passer plusieurs heures par
> jour ?** → **OUI, AVEC RÉSERVES.**
> Ce qui est acquis : on sait en un écran ce qu'on fait et pourquoi ; le rail
> de phases répond en permanence à « où j'en suis » ; lire et faire sont
> désormais deux zones visuellement distinctes ; la lecture n'est pas
> découpée en cartes ; 9 fonds et 3 niveaux d'ombre là où il y en avait 4 et 1 ;
> validé sur 5 journées représentatives × 9 largeurs, 0 violation axe.
> Les réserves : sur la journée la plus dense, 17 cartes subsistent et le rail
> latéral n'apparaît qu'à partir de 1200 px — entre 768 et 1199 px, l'apprenant
> retombe sur la bande compacte, moins utile pour une session longue.
