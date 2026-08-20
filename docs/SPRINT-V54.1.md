# SPRINT V54.1 — Pilotage UX Recovery & Visual Direction Lock

**Type** : recovery UX + verrouillage de direction (au-dessus du Curriculum 1.0 gelé).
**Corpus** : gelé. **365 jours** : inchangés. **Langue** : français.

## 1. Git final
Branche `claude/ai-career-os-saas-phfg49`. local == origin après push. Working tree
propre. Aucun serveur résiduel. Corpus SHA-1 `4c1f3028…`. `progress.json` `32360402…`.

## 2. 🔴 Calendrier — P0 recovery
- **Diagnostic données→rendu** : la structure était SAINE (365/365, 12 mois, semaines
  1–52, ordre chronologique strict, aucune semaine à cheval). Le bug était **visuel** :
  (a) chaque semaine (label + 7-8 cellules) débordait la colonne de mois et **wrappait**
  avec un jour orphelin ; (b) la grille de mois 3 colonnes **alignait les rangées** →
  gros trous verticaux entre mois de hauteurs différentes.
- **Correctif** : semaine = **grille fixe de 7 jours** (`repeat(7,1fr)`), label au-dessus ;
  mois en **maçonnerie de colonnes** (`column-count`) → plus aucun trou. Badge de
  **couverture** (« 365 jours, continu ») pour la transparence du filtre parcours.
- **Contrat vérifiable** : `lib/calendar-model.mjs` (`buildCalendar`) +
  `tests/v541-calendar.test.mjs` (6 tests) : expected/rendered/missing/duplicates/
  order/weekOrder/monthOrder/weekSpan. **Aucun jour perdu silencieusement.**

## 3. Navigation (IA)
Resserrée : **Pilotage / Apprendre / Évaluer / Outils** au 1er niveau ; **Laboratoires**
(5 labs), **Carrière**, **Méthode** deviennent des sections **repliables** (`<details>`,
auto-ouvertes si une route active s'y trouve). Aucune route supprimée, aucune URL
changée. État actif = teinte accent + icône indigo + barre 3px.

## 4. Pages recomposées
- **Parcours** : fini le « catalogue SaaS » — parcours actif distinct (panneau riche),
  **Disponibles** (liste 1 colonne scannable, CTA « Basculer » **allégé**, plus de 8
  boutons pleins), **À venir** (annoncés, discrets).
- **Synthèse** : 8 cartes clonées → **table comparative** (état, progression, reprise,
  en cours, à revoir, révisions, compétences, dernière preuve, action) ; colonnes
  masquées en responsive ; jalons + preuves en sections secondaires.
- **Révisions** : file priorisée (résumé dues/retard/à venir) + **InlineNotice**
  expliquant le mécanisme SM-2 (empty state utile, pas de désert).
- **Design system III** : élévation `--raised` + ombres réutilisées ; primitives
  `PrimaryFocus`/`ListRow` (V54) réemployées ; **0 hex en dur dans le TSX**.

## 5. Avant → après (par page)
| Page | Problème initial | Changement réel | Résultat | Limite |
|---|---|---|---|---|
| Calendrier | semaines wrappées, trous | 7-jours/rang + maçonnerie + couverture | lisible, dense, continu | ordre colonnaire (par colonne) |
| Navigation | 6 labs au 1er niveau | 4 groupes + sections repliables | bruit réduit | — |
| Parcours | catalogue SaaS, CTA lourds | liste 1 col + CTA allégé + split | scannable | en-tête composant (V55) |
| Synthèse | 8 cartes clonées | table comparative | comparaison rapide | scroll interne desktop moyen |
| Révisions | désert vide | résumé + mécanisme SM-2 | vide utile | — |
| Dashboard | vide vertical | (cockpit V54 conservé) | inchangé | vide résiduel (V55) |

## 6. Preuve visuelle & responsive
55 captures avant + après (`v541-before/`, `v541-after/`, 5 pages × 5 largeurs).
Overflow horizontal mesuré : **0/25**. HTTP 200 : 25/25. 0 erreur console.

## 7. Intégrité
P0 V54 conservé : `VISIT_DAY_DOES_NOT_MUTATE_PROGRESS` **vert**. Corpus identique,
365 jours inchangés, `progress.json` restauré. Aucune 2e source, aucune gamification,
aucune donnée inventée.

## 8. Validation technique
`npm test` **1271/0** (+6 calendrier) · `tsc` **0** · `npm run build` **OK** ·
`gates:active` **verts** (v52/v53/v54) · P0 intégrité **OK**.

## 9. RÉEL / NON TESTÉ / REPORTÉ
- **RÉEL** : recovery calendrier + tests, nav IA, parcours/synthèse/révisions, 55
  captures, overflow 0, intégrité.
- **NON TESTÉ (auto)** : axe-core, lecteur d'écran, contraste AAA.
- **REPORTÉ V55** : Projects, en-tête Parcours (composant), vide vertical dashboard,
  affinage largeur table Synthèse, migration des surfaces techniques.

## 10. Direction visuelle : **VERROUILLÉE** (`V54-1-VISUAL-DIRECTION-LOCK.md`)

## 11. Verdict : **FORT**
Recovery réelle et prouvée du calendrier (P0), navigation resserrée, parcours/synthèse/
révisions recomposées sur une grammaire cohérente, direction verrouillée. **Pas
EXCELLENT** : Projects non migré, vide vertical dashboard, table Synthèse à affiner en
desktop moyen, a11y automatisée à compléter. Honnête, sans auto-congratulation.
