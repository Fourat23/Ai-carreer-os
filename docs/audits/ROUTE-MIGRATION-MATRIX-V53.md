# V53 — Matrice de migration des routes (vers V54)

Décision par route pour la migration au design system V53 (primitives `app/ui/*`,
accent indigo, vocabulaire de statut). Verdicts : **MIGRATE** (à porter),
**KEEP** (déjà sobre, port cosmétique différable), **MERGE** (consolidable),
**SPECIALIZED** (surface technique, faible ROI produit), **DONE** (fait en V53).

| Route | Verdict | Coût | Risque | Priorité V54 | Note |
|---|---|:--:|:--:|:--:|---|
| `/` (Dashboard) | **DONE** | — | — | — | Primitives + rail hiérarchisé + indigo |
| `/day/[id]` (Aujourd'hui) | **DONE** | — | — | — | Status unifié ; P0 protégé |
| `/skills` (Compétences) | **DONE** | — | — | — | Groupé par état ; distribution |
| `/parcours` | MIGRATE | M | faible | 1 | PageHeader + Status de parcours |
| `/revisions` | MIGRATE | M | moyen | 1 | ActionRow + InlineNotice (dues/retard) |
| `/synthese` | MIGRATE | M | faible | 2 | Metric + timeline preuves |
| `/capstones` + `[id]` | MIGRATE | L | moyen | 2 | Status de phase + EmptyState |
| `/missions` + `[id]` | MIGRATE | M | faible | 2 | Status de livrable |
| `/calendar` | KEEP | S | faible | 3 | Swatches déjà tokenisés (V53) |
| `/reviews`, `/diagnostics` | MIGRATE | M | moyen | 2 | PageHeader + Status |
| `/month/[m]`, `/week/[w]` | KEEP | S | faible | 3 | Vues sobres, port léger |
| `/lessons` + `/doc/*` | KEEP | S | faible | 3 | Prose ; PageHeader seulement |
| `/projects`, `/notes`, `/glossary`, `/resources`, `/settings` | KEEP | S | faible | 3 | Utilitaires sobres |
| `/lab`, `/pipelines`, `/kubernetes`, `/cloud-*`, `/security`, `/career` | SPECIALIZED | L | élevé | 4 | Surfaces techniques (terminal/labs) : ROI produit faible, migration prudente |

## Règle V53 (respectée)
Seuls les **3 pilotes** ont été portés + les **quick wins sans risque** (tokens de
swatch, skip link). La migration large appartient à **V54**, page par page, en
suivant l'ordre de priorité ci-dessus.
