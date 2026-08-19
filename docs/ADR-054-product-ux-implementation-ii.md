# ADR-054 — Product UX Implementation II (saut visuel + migration des routes cœur)

- **Statut** : accepté (V54).
- **Contexte** : V53 a posé l'accent indigo, les primitives `app/ui/*` et migré les
  3 pilotes. L'audit CP0 V54 (55 captures réelles) constate un produit **cohérent
  mais encore administratif** : dashboard en assemblage de blocs, PRIMARY FOCUS pas
  dominant, listes monotones (Missions, Révisions), profondeur de surfaces faible.
  Un P0 d'intégrité (mutation de `progress.json` à la simple consultation d'un jour)
  a été **corrigé à la racine** (DayPanel flush gardé par un vrai indicateur d'édition).

## Décision

Faire un **saut visuel réel** vers un workspace personnel premium, **sans**
gamification ni donnée inventée, en quatre axes.

### 1. Design system II — profondeur & hiérarchie (globals.css)
- **Échelle d'élévation de surfaces** : `--bg` (fond) < `--panel` < `--panel-2` <
  `--raised` (nouvelle surface haute, pour le PRIMARY FOCUS et les panneaux
  primaires). Bordures hiérarchisées (`--border` / `--border-strong`).
- **Ombres discrètes** `--shadow-1/-2` (profondeur, jamais de glow néon).
- Hover/focus subtils unifiés ; radius cohérents ; rythme vertical discipliné.
- **Accent violet réservé** à identité/action/focus ; **vert `--ok` réservé** à
  succès/validation. Jamais l'inverse. Couleur jamais seule.

### 2. Dashboard cockpit (flagship)
Structure : **A** header contexte · **B** PRIMARY FOCUS (bloc dominant : jour, skill,
raison, difficulté, durée, CTA principal + secondaire) · **C** trajectoire mieux
intégrée · **D** context rail **hiérarchisé** (Révisions → next action/livrable →
compétences → mois → secondaire) · **E** progression (données vraies uniquement).
Objectif : **impossible à confondre avec V53 à 1440px**.

### 3. Day = poste de travail (chemin de phases)
En-tête « pourquoi ce jour / objectif / compétences / difficulté / résultat attendu »
puis **chemin visuel** des activités dans l'ordre réel du curriculum
(Comprendre → Pratiquer → Vérifier → Produire → Réviser). **Aucune modification du
contenu pédagogique** (ordre du curriculum fait foi).

### 4. Migration des routes cœur vers la grammaire partagée
Révisions (file priorisée), Missions (regroupées + Status), Parcours, Diagnostics,
Projects (en-tête objectif/état), Capstones (déjà bon → migration légère). Toutes
via `PageHeader` + `Status` + primitives ; données réelles ; 0 hex en dur.

## Nouvelles primitives (si ≥2 usages réels, confirmé à l'implémentation)
- `WorkspacePanel` (Panel + niveaux d'élévation) — rail dashboard, routes.
- `PrimaryFocus` (bloc cockpit dominant) — dashboard (+ réutilisable day-header).
- `StatCluster` / réutilisation `Metric` — dashboard, skills, revisions.
- `StructuredList` / `ListRow` — missions, revisions, parcours (listes denses).

Ne PAS créer de primitive à usage unique. Réutiliser `Status`/`Metric`/`ActionRow`/
`SectionHeader`/`EmptyState`/`InlineNotice`/`Panel` d'abord.

## Invariants (non négociables)
- Curriculum 1.0 gelé ; corpus SHA-1 `4c1f3028…` ; `progress.json` `32360402…`.
- Une seule source de vérité ; primitives sans état pédagogique.
- **Anti-gamification** (XP/niveau/streak/badge RPG/leaderboard/confetti) ;
  anti-AI-slop (hero marketing, glow, gradients gadgets, radar, card-grid systématique,
  emoji structurel, stat vanity).
- **P0 intégrité** : une consultation ne crée JAMAIS de progression (test
  `VISIT_DAY_DOES_NOT_MUTATE_PROGRESS`).
- Statut jamais couleur seule ; score/état jamais sans explication.

## Conséquences
- `v54:check` verrouille : P0 intégrité (garde `edited` dans DayPanel), élévation
  de surfaces, primitives adoptées, indigo, anti-gamification, 0 hex, a11y.
- Migration large restante (labs/technique) → V55, matrice mise à jour.
