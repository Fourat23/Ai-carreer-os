# SPRINT V54.2.1 — Visual Integrity Recovery

**Type** : checkpoint correctif obligatoire entre V54.2 et V55.
**Curriculum 1.0** : gelé. **365 jours** : inchangés, ordre inchangé.
HEAD de départ `677182b` (V54.2). Branche `claude/ai-career-os-saas-phfg49`.

## 1. Pourquoi ce sprint

V54.2 passait toutes ses mesures — HTTP 200, 0 overflow, 0 violation axe
critical/serious, CTA présent, 30 captures — et restait visuellement fausse.
L'inspection humaine des captures a révélé trois défauts structurels que les
métriques existantes ne pouvaient pas voir. Ce sprint sépare désormais trois
niveaux : **correctness**, **visual integrity**, **composition quality**
(ADR-054.2.1).

## 2. CP0 — constat forensique (lecture seule)

Branche/HEAD conformes, `local == origin`, working tree propre, aucun stash,
aucun serveur résiduel. `npm test` 1271/0 · `tsc` 0 · `build` OK ·
`gates:active` exit 0. Corpus `4c1f3028…` · progress `32360402…` · 365 jours
ordonnés. V54.2.1 non livré.

Captures BEFORE : 5 routes × 5 largeurs, **inspectées**, pas seulement produites.

## 3. P0-A — Ordre chronologique du calendrier

**Cause racine, double.**
1. *Données* — `resolveTrackDays` rendait les journées dans l'ordre des
   **modules**, pas du programme. 4 parcours sur 8 concernés
   (`… 73, 82, 84, 57, 58 …`).
2. *Rendu* — `.cal-months { column-count: 2 / 3 }` : DOM chronologique, ordre de
   **lecture** faux (`M1 · M5 · M9 / M2 · M6 · M10 / …`). 8 parcours sur 8.

**Corrections.** Tri croissant dans `resolveTrackDays` (un module regroupe, il
ne réordonne pas) ; `buildCalendar` trie désormais sa sortie à trois niveaux et
expose `inputOrdered` comme diagnostic ; `column-count` **supprimé** (pas
surchargé) au profit d'une grille régulière 1 → 2 → 3 colonnes ; attributs
`data-calendar-{month,week,day}` posés pour rendre l'ordre assertable ;
`.lx-milestones` passe aussi de `columns` à une grille.

**Preuve navigateur** : 8 parcours × 4 largeurs, DOM **et** ordre de lecture
reconstruit depuis les bounding boxes → **8/32 conformes AVANT, 32/32 APRÈS**.

## 4. P0-B — Vide structurel du Dashboard

**Cause racine** : `.dash-socle` était un **frère** de `.dash-cols` et attendait
donc la hauteur de la plus haute des deux colonnes ; le rail (623 px) dépassait
la colonne principale (525 px à l'état « jour 1 »).

**Correction structurelle** : le socle et le pied de contexte vivent dans la
colonne principale, le rail est un item de grille aligné en `start`. Aucune
`min-height`, aucun `position: absolute`, aucun contenu ajouté ou dupliqué.
La trajectoire, désormais dans une colonne plus étroite, devient **fluide**
(grille dimensionnée sur la place disponible, plancher de cellule préservé) :
les 12 mois restent visibles sans défilement horizontal.

**Mesure** : vide inexpliqué **122 px (1440) / 155 px (1920) → 0 px**.
Le rapport V54.2 annonçait « ~95 px » : c'était une mesure partielle, corrigée ici.

## 5. P0-C — Réconciliation 365 / 188 / hors parcours

**Ce n'était pas une incohérence métier.** `buildCalendar.missing` compte les
trous dans l'intervalle couvert (141) ; c'était affiché sous le libellé « jours
hors parcours ». Les 36 journées situées **après** le dernier jour du parcours
(330→365) n'apparaissaient nulle part.

**Correction** : read-model pur `lib/curriculum-partition.mjs`, avec l'invariant
`inTrack + before + interleaved + after === total` testé sur les 8 parcours.
Data/ML : **188 + 0 + 141 + 36 = 365**. L'interface affiche la somme comme un
fait vérifiable et nomme chaque catégorie.

**Vocabulaire partagé** : Dashboard, Parcours et Calendrier consomment le même
read-model — « programme global · 365 jours » vs « parcours actif · N jours sur
365 ». Aucun troisième calcul local.

## 6. P1 — CTA du Parcours · état vide des Révisions

- CTA « Continuer — jour N » : hors du bloc du parcours actif (107 px à 1440) →
  **dans** le bloc, adjacent à la progression et à la prochaine étape.
- `/revisions` : état vide **intentionnel**. Zéro révision inventée ; ajout du
  mécanisme en trois étapes réelles et d'une action existante. Suppression de
  deux redondances (« Rien à revoir » + pastilles à zéro).

## 7. P2 — Barre de défilement du rail

Thématisée (`scrollbar-width: thin`, poignée sur `--border-strong`), jamais
supprimée : clavier, molette et tactile intacts, poignée toujours repérable.

## 8. Tests « Visual Integrity » ajoutés

| Assertion | Où |
|---|---|
| A. `CHRONOLOGICAL_RENDER_ORDER` (DOM + lecture, 8 parcours × 4 largeurs) | `scripts/v5421-calendar-order.mjs` |
| B. `DEAD_SPACE_METRIC` (focus → socle, déséquilibre de colonnes) | `scripts/v5421-visual.mjs` |
| C. `CTA_CONTEXT_DISTANCE` (appartenance + distance physique) | `scripts/v5421-visual.mjs` |
| D. `CURRICULUM_PARTITION` (somme = 365) | `tests/v5421-visual-integrity.test.mjs` + gate |
| Responsive 9 largeurs, overflow **et** contenu rogné | `scripts/v5421-responsive.mjs` |

14 tests unitaires ajoutés (`tests/v5421-visual-integrity.test.mjs`).

## 9. Gate `v5421:check`

Câblé dans `gates:active`. Vérifie : corpus gelé, `progress.json` invariant,
ordre des 365 jours, ordre chronologique **sur les 8 parcours**, partition = 365,
tri garanti même sur une entrée désordonnée, absence de colonnes CSS sur un
conteneur séquentiel, contrat de composition du Dashboard, CTA du Parcours dans
son bloc, vocabulaire partagé sur les 3 surfaces, anti-gamification, présence des
harnais navigateur.

**Testé en négatif** (un gate naïf ne vaut rien) : retirer le tri → 4 erreurs ;
réintroduire `column-count` → 1 erreur. Les deux régressions sont bien bloquées.

## 10. Incidents rencontrés

- **Un test V24 encodait le bug.** `next(54) === 71` supposait l'ordre des
  modules ; les jours 67 et 68 sont pourtant dans le parcours et précèdent 71.
  L'attente est corrigée en `54 → 67`, avec sa justification dans le test.
  L'intention testée (navigation bornée au parcours) est inchangée.
- **Le pied du Dashboard s'est écrasé** après le déplacement dans la colonne
  principale (règle « texte | accès rapides » calibrée pour 1140 px). Corrigé.
- **En-têtes superposés sur la Synthèse à 1440** — trouvé à l'œil, invisible pour
  toute métrique (débordement `visible`). Corrigé, seuil de repli déplacé à 1440.
- **Le compteur « contenu rogné » produisait 17 faux positifs.** Affiné avec
  trois exclusions justifiées plutôt que d'être supprimé ou ignoré.
- **Nouvelles violations a11y introduites par l'état vide** (contraste, lien au
  fil du texte) : corrigées à la source, pas contournées.

## 11. Vérifications de clôture

`npm test` **1285/0** · `tsc --noEmit` **0** · `npm run build` **OK** ·
`gates:active` **exit 0** (dont `curriculum:check`, `v542:check`, `v5421:check`).
Corpus `4c1f3028…` · `progress.json` `32360402…` · 365 jours ordonnés ·
aucune leçon/exercice/mission/capstone/diagnostic modifié.

axe-core critical/serious : **0** sur les 5 routes (`aria-allowed-role` 365 → 0).
Responsive : **45/45** états conformes sur 9 largeurs.
Intégrité : **5/5** `VISIT_*_DOES_NOT_MUTATE_PROGRESS`, sans restauration.

Un avertissement subsiste dans `v542:check` : `[decor] animation` — **faux
positif connu** (le gate découpe `globals.css` au marqueur « V54.2 » et attrape
le spinner `.spin` préexistant, déjà neutralisé sous `prefers-reduced-motion`).

## 12. Ce qui n'a PAS été fait

- Aucune autre route migrée (hors périmètre : ce sprint est correctif).
- Le rail du Dashboard reste court à l'état neuf (déséquilibre mesuré 516 px à
  1440). Conséquence assumée d'un état sans données ; le remplir serait de
  l'invention.
- La Synthèse desktop reste une table — elle n'était pas la cible de ce sprint.
- Les mois peu couverts (Data/ML, mois 2 = 1 journée) laissent du blanc dans leur
  panneau : conséquence d'une grille régulière alignée en `stretch`. Assumé.
- Contraste AAA non visé ; aucun test lecteur d'écran réel.
- Le crénelage en bas de rangée du calendrier est le prix explicite de l'ordre
  juste. Il n'est pas « optimisé ».

## 13. Verdicts par surface

- **Calendrier : STRONG_IMPROVEMENT** — 8/32 → 32/32 états conformes, deux causes
  racines éliminées, régression bloquée par gate et par test.
- **Dashboard : STRONG_IMPROVEMENT** — vide structurel 122/155 px → 0, colonnes
  indépendantes par construction, trajectoire fluide.
- **Parcours : IMPROVED** — CTA rattaché à son contexte, vocabulaire réconcilié.
- **Révisions : IMPROVED** — état vide intentionnel, deux redondances retirées.
- **Synthèse : IMPROVED** — collision d'en-têtes corrigée, jalons en grille
  ordonnée, table qui tient à toutes les largeurs. Le fond reste V54.2.

## 14. Verdict global et décision

**Global : FORT.**

**Décision : `VISUAL_REFERENCE_LOCKED`.**

Les quatre conditions d'exclusion posées par le prompt sont levées, chacune par
une mesure et non par une opinion : le calendrier ne peut plus être lu hors
ordre (32/32, deux causes éliminées, gate négatif vérifié) ; le Dashboard n'a
plus de vide structurel inexpliqué (0 px, correction structurelle) ; les 365
jours sont partitionnés et la somme est affichée ; les captures réelles ont été
inspectées et ont elles-mêmes produit deux corrections supplémentaires que les
métriques ne voyaient pas.

Le déséquilibre de colonnes du Dashboard à l'état neuf est **documenté, mesuré
et assumé** — ce n'est pas un vide inexpliqué.
