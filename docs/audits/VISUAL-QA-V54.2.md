# V54.2 — Visual QA (BEFORE → AFTER, 3 surfaces de référence)

Captures : `docs/audits/visual/v542-before/` (état V54.1) et
`docs/audits/visual/v542-after/` (état V54.2) — **15 + 15** (3 pages × 375/768/
1024/1440/1920). Produites par `scripts/v542-visual.mjs`, qui mesure aussi la
densité, le vide vertical, la répétition de composants et la présence d'un CTA.

## Métriques mesurées (pas seulement « pas d'overflow »)

| Page | Hauteur @1440 | CTA principal | Overflow | axe critical/serious |
|---|:--:|:--:|:--:|:--:|
| Dashboard | 1532 → **1230 px** | oui → oui | 0 | 30 → **0** |
| Parcours | 2322 → **2264 px** | **NON → oui** | 0 | 50 → **0** |
| Synthèse | 1402 → **1339 px** | **NON → oui** | 0 | 15 → **0** |

Vide vertical mort du Dashboard (colonne principale) : **~570 px → ~95 px**.

## Verdicts par page

### Dashboard — **STRONG_IMPROVEMENT**
- Barre de contexte dense (parcours/position/terminés/mois) remplace la ligne
  « track-hint » ; le PRIMARY FOCUS reste unique et dominant.
- Rail : **5 panneaux de poids égal → 2** (Révisions, Compétences). « Prochain
  livrable » **masqué quand il désigne la journée déjà en focus** (redondance
  réelle supprimée) ; « Rythme » **omis** quand le compteur n'a pas démarré
  (le tiret vert vide a disparu).
- **Socle pleine largeur** trajectoire + progression fusionnées : le L-shape mort
  disparaît, et les **12 mois** sont désormais visibles (contre M1–M10 tronqués).
- Pied de contexte (mois/semaine + accès rapides) en poids faible.

### Parcours — **STRONG_IMPROVEMENT**
- **Action principale ajoutée** (« Continuer — jour N ») : la page n'en avait
  aucune (mesuré).
- Grille de 12 rectangles identiques → **roadmap verticale** avec rail, pastilles
  d'état, module courant mis en avant, et **état dérivé des journées réellement
  terminées** (Terminé / En cours / Commencé / À venir).
- Avancement réel : `% · modules terminés · jour N/total · ensuite : <module>`.
- Alternatives : pavés de prose → **rangées de comparaison** (durée réelle, techs,
  objectif borné à 2 lignes), CTA « Basculer » secondaire.

### Synthèse — **IMPROVED**
- Bandeau de repères agrégés (parcours suivis, jours terminés cumulés, révisions
  dues) + **CTA principal**.
- Colonnes **PRIMARY/SECONDARY explicites** ; seuil de repli **relevé à 1400 px**
  (mesuré : à 1200 px les 10 colonnes rognaient la colonne d'action).
- En-têtes de ligne **alignés à gauche** (ils étaient centrés par défaut `th`).
- Jalons : 5 panneaux identiques → **un conteneur, lignes séparées, 2 colonnes**.
- **Mobile réparé** : la table devient une liste empilée **libellée** — avant, à
  375 px, il ne restait **que les noms** (perte totale de données).

## Le produit a-t-il visiblement changé ? — OUI
Dashboard et Parcours changent **structurellement** (nombre de zones, largeurs,
composition du rail, roadmap). Synthèse change **surtout à ≤ 700 px** (représentation
mobile entièrement nouvelle) et **modérément en desktop** (bandeau + CTA + densité
des jalons + alignements) — c'est pourquoi son verdict est IMPROVED et non
STRONG_IMPROVEMENT : honnêtement, sa table desktop reste proche de V54.1.

## Défauts corrigés en cours de sprint (trouvés par la mesure, pas supposés)
1. `.col-s { display:block }` (spécificité 0,2,0) écrasait `tbody td { display:flex }`
   → libellé et valeur collés en mobile (« REPRISEJ1 »). Corrigé par sélecteurs
   `td.col-p, td.col-s`.
2. `min-width: 860px` déclaré **après** les media queries → le repli mobile ne
   s'appliquait pas (overflow +501 px). Bloc responsive relocalisé après les bases.
3. Colonne « action » **rognée** à 1440 (table 1234 px dans un conteneur 1138 px).
   Corrigé par gouttières numériques, en-têtes repliables et seuil à 1400 px.
4. `aria-allowed-role` ×365 : `role="gridcell"` posé sur `<a>` → conteneur
   `<span role="gridcell">` avec le lien à l'intérieur.
5. Contraste : `--faint` à 4.43:1, `.nav-sect` à 4.02:1 (opacité .75),
   `.track-row.is-soon` à 3.5:1 (opacité .72). Tous corrigés **au niveau token**.

## Reste insuffisant (honnête)
- Dashboard : ~95 px de vide résiduel sous le focus à l'état « jour 1 » (le rail
  est plus haut que le focus). Intentionnel plutôt qu'accidentel, mais perfectible.
- Synthèse desktop : évolution modérée ; la table reste une table.
- `dashboard@375` : 1 « erreur console » = **prefetch RSC avorté** à la fermeture
  de page (non reproductible en navigation réelle, aucune réponse ≥400). Artefact
  de harnais, documenté et non masqué.
