# V52 — Contrat de design tokens (source unique)

Les tokens vivent dans `app/globals.css` (source unique, thème **dark**). V52 les
DOCUMENTE et les verrouille (le gate `v52:check` interdit d'introduire de nouvelles
couleurs en dur au-delà de la ligne de base).

## Familles de tokens présentes

| Famille | Variables |
|---------|-----------|
| Fonds / surfaces | `--bg`, `--panel`, `--panel-2`, `--surface-hover`, `--cell` |
| Bordures | `--border`, `--border-strong`, `--faint` |
| Texte | (primaire par défaut), `--muted`, `--faint` |
| Accent | `--accent`, `--accent-2`, `--accent-ink` |
| Fonctionnels | `--ok`, `--danger`, `--info` (+ `--warn` via classes de statut) |
| Espacement | `--sp-1`…`--sp-12` |
| Rayons | `--r-xs`, `--r-sm`, `--r`, `--r-lg`, `--r-pill`, `--radius` |
| Typographie | `--fs-eyebrow/xs/sm/ui/base/read/h3/h2/h1/display`, `--lh-tight/body/read` |
| Familles | `--font-sans`, `--font-mono` |
| Largeurs | `--content-max`, `--read-max`, `--sidebar-w`, `--nav-w`, `--nav-w-collapsed` |
| Familles d'activité | `--fam-*` (learn/practice/apply/observe/verify/retain/prepare/objective) |

## Tons sémantiques (couleur jamais seule)

Chaque statut = **label + ton**. Tons : `neutral` · `info` · `positive` ·
`attention` · `blocking`. L'adaptateur `lib/skill-vocabulary.mjs` mappe les états de
compétence (source de vérité `SKILL_STATE_LABEL`) vers ces tons.

## Règles

1. Aucune valeur arbitraire dispersée si un token sémantique existe.
2. Aucune information portée par la couleur seule (toujours label/icône).
3. Aucun score pédagogique sans explication accessible (« Pourquoi cet état ? »).
4. Thème unique dark (light non demandé).

## État d'adoption (mesuré)

- **V52** : 6 couleurs hex en dur sur 90 fichiers UI (héritées, cadrées V53).
- **V53** : **0 couleur hex en dur** dans le TSX (les 6 héritées de `/calendar` +
  les pastilles `.day-cell` consolidées en tokens `--swatch-*`). `v53:check`
  impose désormais une base de **0**.

## V53 — évolutions du contrat

- **Accent = indigo/violet** `--accent: #8b8ff5` (auparavant teal `#63a6a0`),
  `--accent-ink: #0d0f1f`. **Découplé du succès** : `--ok` (vert) reste le seul
  signal de réussite ; l'accent ne signale jamais un succès.
- `--accent-2` = compagnon violet `#a78bf5` (2e halte rare), n'est plus un alias
  de `--ok`.
- **Primitives** `app/ui/*` (Status, PageHeader, SectionHeader, Metric, ActionRow,
  EmptyState, InlineNotice, Panel) + classes `.ui-*` + tons `.tone-*`. Présentation
  pure, aucune source de vérité.
- **Tokens de pastille** : `--swatch-done-*`, `--swatch-prog-*`, `--swatch-review-*`.
