# SPRINT V55 — Product Identity & Visual Convergence

**Type** : saut de design sur les cinq surfaces de pilotage.
**Curriculum 1.0** : gelé. **365 jours** : inchangés, ordre inchangé.
HEAD de départ `5ed479c` (V54.2.1). Branche `claude/ai-career-os-saas-phfg49`.

## 1. Point de départ mesuré (CP0)

`VISUAL_REFERENCE_LOCKED` disait que la base était saine. Elle l'était — et le
produit ressemblait toujours à un outil interne. Mesuré, pas supposé :

| Indicateur @1440 | Dashboard | Parcours | Synthèse | Calendrier | Révisions |
|---|:--:|:--:|:--:|:--:|:--:|
| rapport de surface 1er/2e bloc | **1,20** | 1,67 | 1,98 | **1,00** | — |
| part du plus grand bloc | 0,33 | 0,59 | 0,67 | **0,089** | 1,00 |
| fonds distincts rendus | 5 | 5 | 4 | **1** | 3 |
| niveaux d'ombre | 2 | 1 | 2 | 1 | 1 |
| police maximale rendue | 28 px | 28 px | 34 px | 28 px | 34 px |
| amplitude titre/corps | 2,15 | 2,33 | 2,83 | 2,33 | 2,62 |
| action principale | oui | oui | oui | **NON** | oui |

Trois constats, tous confirmés à l'inspection des 20 captures BEFORE :
1. **aucune dominance** — le focus du Dashboard ne pesait que 1,2× son voisin ;
2. **aucune profondeur** — le produit reposait littéralement sur
   `background + panel + border` ;
3. **aucun cran display** — 28 px de titre maximum sur un écran de 1920.

## 2. Ce qui a réellement changé (structurel)

| | AVANT | APRÈS |
|---|---|---|
| Échelle de surfaces | 4 tokens graphite chaud | **6 crans** bleu-noir (`canvas → shell → surface → raised → focus → interactive`) + 4 gradients locaux tokenisés |
| Élévation | 3 tokens, 1-2 rendus | **4 crans** + `--glow-accent` réservé à **une** zone |
| Typographie | 6 crans, max 28 px | **7 crans**, `--fs-display-xl` fluide → **50 px** à 1920 |
| Focus | `PrimaryFocus` = panneau un peu plus haut | **`HeroFocus`** pleine largeur, cran display, colonne d'aparté |
| Trajectoire | grille 7×52 de carrés uniformes | **carte à 12 pistes de mois** nommées, avec avancement par mois |
| Rail Dashboard | 3-4 panneaux empilés | **3 familles** hiérarchisées, « rythme » et « prochain livrable » fusionnés |
| Pied Dashboard | bloc mois + boutons, moitié vide | **barre d'accès rapides pleine largeur** ; le contexte du mois remonte dans le rail |
| Calendrier | 12 blocs identiques, sans action | **hero + CTA**, badge de mois, titre, compteur et **barre d'avancement par mois** |
| Parcours | en-tête + bloc dense | **hero éditorial** + bande de stack + roadmap à rail connecté, module courant surélevé |
| Synthèse | bandeau de 3 métriques | **hero comparatif** avec anneau et CTA ; rangées plus hautes, ligne active à arête d'accent |
| Shell | marque en une ligne, actif = fond teinté | marque composée (monogramme sur accent + nature du produit), actif = **arête en gradient + gradient local + graisse**, libellés de groupe reliés par un filet |
| Canvas | couleur plate | trame technique à 64 px (2,8 % de blanc), désactivée sous 900 px |

**Nouvelles primitives** (créées au mérite, ≥ 2 usages réels) :
`HeroFocus` + `HeroFact` (Dashboard, Parcours, Synthèse, Calendrier),
`PositionRing` (Dashboard, Parcours, Synthèse), `DifficultyScale` (Dashboard),
`TrajectoryMap` / `TrajectoryMapGrid` (Dashboard).

## 3. Ce qui n'est que cosmétique

Honnêtement séparé : le changement de base graphite → bleu-noir, les rayons, la
graisse des libellés et le thème de la barre de défilement **n'ont rien
recomposé**. Ils ne comptent pas comme transformation ; ils servent la lisibilité
et l'ancrage d'identité.

## 4. Mesures AVANT → APRÈS

| Indicateur @1440 | Dashboard | Parcours | Synthèse | Calendrier |
|---|:--:|:--:|:--:|:--:|
| part du plus grand bloc | 0,33 → **0,39** | 0,59 → 0,48 | 0,67 → 0,45 | 0,089 → **0,183** |
| rapport 1er/2e | 1,20 → 1,01 | 1,67 → 1,58 | 1,98 → 1,24 | 1,00 → **2,50** |
| fonds distincts | 5 → **9** | 5 → **8** | 4 → **8** | 1 → **5** |
| niveaux d'ombre | 2 → **3** | 1 → **3** | 2 → **4** | 1 → **3** |
| police maximale | 28 → **49 px** | 28 → **49 px** | 34 → **49 px** | 28 → **49 px** |
| amplitude titre/corps | 2,15 → **3,77** | 2,33 → **4,08** | 2,83 → **4,08** | 2,33 → **4,08** |
| action principale | oui | oui | oui | **NON → oui** |
| déséquilibre de colonnes | 516 px → **134 px** | — | — | — |
| vide structurel sous le focus | 0 px | — | — | — |

À 1920 : police maximale **50 px**, amplitude **3,85 – 4,17**.

**Lecture honnête du rapport 1er/2e.** Il baisse sur Dashboard, Parcours et
Synthèse — parce que le *second* bloc a été enrichi (carte de trajectoire,
roadmap, table densifiée). Ce ratio récompense un second bloc pauvre : il a été
abandonné comme critère au profit de la **part de surface** et de la distinction
par la profondeur (ADR-055 §2, révisé après mesure).

## 5. Test « blind difference » — 1440 px

| Page | Confondables après 2 s ? | Ce qui saute aux yeux |
|---|:--:|---|
| Dashboard | **non** | hero pleine largeur à 49 px + anneau ; grille de carrés → carte de 12 pistes nommées ; barre d'accès pleine largeur |
| Parcours | **non** | hero éditorial + anneau + bande de stack ; roadmap à rail connecté, module courant surélevé |
| Synthèse | **non** | bandeau de 3 métriques → hero avec anneau et CTA ; rangées plus hautes, ligne active marquée |
| Calendrier | **non** | hero + CTA apparus ; blocs de mois à badge numéroté, compteur et barre d'avancement |
| Révisions | *partiellement* | profondeur et typographie changent, la composition reste celle de V54.2.1 |

## 6. Comparaison au prototype premium (/5, honnête)

| Critère | AVANT | APRÈS |
|---|:--:|:--:|
| Sophistication visuelle | 2,5 | **4,0** |
| Profondeur | 1,5 | **4,0** |
| Hiérarchie | 3,0 | **4,5** |
| Composition | 3,0 | **4,0** |
| Utilisation de l'espace | 3,0 | **4,0** |
| Identité | 2,5 | **4,0** |
| Qualité typographique | 2,0 | **4,5** |
| Cohérence | 4,0 | **4,5** |
| Impression premium | 2,5 | **4,0** |
| Originalité maîtrisée | 2,0 | **3,5** |
| **Moyenne** | **2,60** | **4,10** |

**Écarts restants, expliqués — pas excusés :**
- **Originalité (3,5)** : deux objets sont réellement propres au produit —
  l'anneau de position et la carte de trajectoire par mois. Le reste emprunte au
  vocabulaire des outils développeurs (rail, hero, bande de contexte). C'est
  cohérent, ce n'est pas encore singulier.
- **Composition (4,0)** : le calendrier reste une grille de 12 mois de poids
  équivalent. C'est **fidèle aux données** (12 mois sont égaux) mais cela plafonne
  sa dominance à 0,18.
- **Impression premium (4,0)** : à l'état neuf, tous les chiffres valent zéro.
  Aucune quantité d'art direction ne compense une base vide, et les remplir
  serait de l'invention.

## 7. Responsive · Accessibilité · Intégrité

- **45 / 45** états conformes (5 routes × 9 largeurs : 375/480/640/768/1024/
  1200/1440/1600/1920) — 0 overflow, 0 contenu rogné, ordre du calendrier
  chronologique à chaque largeur.
- **axe-core : 0 violation critical/serious** sur les 5 routes, malgré le
  changement complet de palette. Clavier 12/12, focus visible, landmarks,
  `h1` unique, aucun saut de niveau, aucun statut par la seule couleur.
- **5 / 5** `VISIT_*_DOES_NOT_MUTATE_PROGRESS`, **sans restauration**.
- **32 / 32** états d'ordre chronologique du calendrier (8 parcours × 4 largeurs).

## 8. Invariants

Corpus `4c1f3028…` · `progress.json` `32360402…` · 365 jours ordonnés · aucune
leçon/exercice/mission/capstone/diagnostic modifié · aucune URL supprimée ·
aucune seconde source de vérité · **aucune donnée inventée** · aucune
gamification · `prefers-reduced-motion` respecté · 0 couleur en dur dans le TSX.

`npm test` **1285/0** · `tsc --noEmit` **0** · `npm run build` **OK** ·
`gates:active` **exit 0** (dont `curriculum:check`, `v542:check`, `v5421:check`,
`v55:check`).

## 9. Gate `v55:check`

Protège l'identité contre une régression silencieuse : 6 crans de surface,
4 crans d'élévation + halo, 4 gradients tokenisés, cran display **fluide et
réellement consommé** par les titres, **exactement un point focal** par grande
page, halo réservé au Dashboard, `PositionRing` sans valeur en dur, aucune
animation permanente, `prefers-reduced-motion` présent, 0 hex dans le TSX.

**Testé en négatif** : replafonner `.page-title` à 28 px → échec ; introduire un
second point focal → échec.

## 10. Incidents rencontrés

- **Deux gates ont buté sur l'évolution du contrat, pas sur une régression.**
  `v542:check` et `v5421:check` exigeaient `<PrimaryFocus` et un CTA dans
  `.track-active`. L'intention (un seul focus ; le CTA hors de l'en-tête de page)
  est conservée, la forme a été mise à jour — avec le motif écrit dans le code.
- **Le gate anti-slop a bloqué un commentaire** contenant le mot « gamification »
  dans une phrase qui l'interdisait. Le gate ne lit pas la négation, et c'est
  volontaire : le commentaire a été reformulé.
- **Défauts trouvés à l'œil, invisibles aux métriques** : titre du hero replié
  sur 4 lignes avec un couloir vide ; anneau trop discret à 0 % ; noms de mois
  tronqués ; cellules « à venir » quasi invisibles sur surface élevée ; en-tête
  « RÉVISIONS » coupé en « RÉVISION / S » après l'agrandissement des rangées.
  Tous corrigés.

## 11. Ce qui n'a PAS été fait

- **Aucune des ~32 autres routes** n'a été migrée (`/skills`, `/missions`,
  `/projects`, `/diagnostics`, `/capstones`, `/day/[id]`, labos…). Elles héritent
  de la nouvelle palette et de la typographie, **pas** de la nouvelle composition.
- **`/revisions` n'a pas été recomposée** : profondeur et typographie
  seulement. Taux de remplissage 0,55 à 1440 — la page reste peu dense à l'état
  neuf, honnêtement.
- **Le calendrier garde 12 blocs équivalents** ; les mois peu couverts laissent du
  blanc dans leur panneau (conséquence de la grille régulière alignée en
  `stretch`, prix assumé de l'ordre juste).
- Contraste **AAA** non visé ; aucun test lecteur d'écran réel.
- Le rail du Dashboard reste plus court que la colonne principale à l'état neuf
  (déséquilibre 134 px à 1440 — contre 516 px avant).

## 12. Verdicts

- **Dashboard : STRONG_IMPROVEMENT**
- **Parcours : STRONG_IMPROVEMENT**
- **Synthèse : STRONG_IMPROVEMENT**
- **Calendrier : STRONG_IMPROVEMENT**
- **Révisions : IMPROVED**
- **Global : STRONG_IMPROVEMENT** — **pas REFERENCE_GRADE** : moyenne 4,10
  (< 4,5) et une catégorie sous 4 (originalité 3,5).

## 13. Réponse à la question centrale

> AI Career OS ressemble-t-il désormais davantage au prototype premium qu'au
> dashboard interne d'origine ?

**OUI, mais pas encore complètement.**

Ce qui le prouve : profondeur ×2 (1-5 fonds → 5-9), élévation 1-2 → 3-4 crans,
typographie 28 px → 50 px avec une amplitude passée de 2,15 à 4,17, un point
focal désormais dominant et distinct par la surface, une trajectoire devenue
carte lisible, et un calendrier qui possède enfin une action. Les cinq captures
à 1440 ne peuvent pas être confondues avec leurs BEFORE, sauf `/revisions`.

Ce qui manque pour dire « complètement » : l'identité reste **cohérente sans être
singulière** (3,5/5 d'originalité), et **32 routes sur 37** n'ont reçu que la
nouvelle peau, pas la nouvelle composition. Le produit a franchi la marche
« outil interne → produit » ; il n'a pas franchi celle du « produit à signature ».
