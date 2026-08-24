# V55 — Product UX Migration II (routes restantes) — barre visuelle VERROUILLÉE

> À lancer APRÈS V54.2. LE DÉPÔT FAIT FOI. La barre de qualité visuelle est
> **verrouillée** (`docs/SPRINT-V54.2.md` §12, `docs/audits/VISUAL-QA-V54.2.md`) :
> **propager les patterns de référence**, ne pas ré-inventer une direction.

## Surfaces de référence (à imiter)
- **Dashboard `/`** — 1 focus dominant + rail court hiérarchisé + **socle pleine
  largeur** qui ferme la page.
- **Parcours `/parcours`** — **roadmap** verticale à états dérivés + action
  principale + rangées de comparaison pour les alternatives.
- **Synthèse `/synthese`** — table comparative à colonnes **PRIMARY/SECONDARY** +
  **représentation mobile empilée libellée**.

## Loi de composition (ADR-054.2, à appliquer partout)
1. **Un seul PrimaryFocus par page.**
2. **Anti-vide par la composition** : le contenu transversal descend dans un socle
   pleine largeur ; jamais de remplissage, jamais de fausse donnée.
3. **Anti-redondance** : deux blocs affichant la même donnée = un de trop ; un bloc
   dérivé n'est rendu que s'il diffère réellement du focus.
4. **Métrique non démarrée = omise**, pas affichée en tiret.
5. **Une carte n'est pas la primitive de mise en page par défaut** — préférer
   listes denses, tables, roadmaps, panneaux hiérarchisés.
6. Accent indigo = identité/action/focus ; vert `--ok` = succès uniquement ;
   statut = ton **+ libellé** (jamais la couleur seule).

## Invariants absolus
Curriculum 1.0 gelé · corpus `4c1f3028…` · `progress.json` `32360402…` **jamais muté
par la navigation** · une seule source de vérité · aucune gamification · aucune URL
supprimée ou changée · 0 hex en dur dans le TSX.

## Cibles, par ordre de valeur learner-facing
1. **Dette V54.2** : (a) Dashboard — résorber les ~95 px de vide résiduel sous le
   focus à l'état « jour 1 » (équilibrer focus/rail, sans contenu inventé) ;
   (b) Synthèse desktop — la faire passer de IMPROVED à STRONG (densité, lisibilité
   des barres à 0 %, hiérarchie des colonnes).
2. **Routes cœur restantes** : `/revisions`, `/missions`, `/projects`, `/skills`,
   `/diagnostics`, `/capstones`, `/calendar` (vérifier la cohérence post-V54.1).
3. **Contenu** : `/lessons`, `/day/[id]`, `/month`, `/week`, `/doc/*`.
4. **Utilitaires** : `/notes`, `/resources`, `/glossary`, `/settings`.
5. **Surfaces techniques** (labs, pipelines, kubernetes, cloud, security) : audit
   d'abord, migration prudente, ROI mesuré.

## Floors par route migrée (vérifiés, pas supposés)
- Réutilisation des primitives ; **0 hex** ; données réelles uniquement.
- Responsive 375/768/1024/1440/1920 : **0 overflow** ET aucune colonne/action rognée
  (mesurer conteneur vs contenu, pas seulement `scrollWidth`).
- `axe-core` : **0 violation critical/serious** (réutiliser `scripts/v542-a11y.mjs`).
- Clavier : focus visible, ordre cohérent, noms accessibles.
- États loading/empty/error/partial cohérents ; vide **intentionnel**.
- Preuves visuelles BEFORE/AFTER par lot migré (réutiliser `scripts/v542-visual.mjs`,
  qui mesure aussi densité/vide/CTA/répétition).
- Intégrité : étendre `scripts/v542-integrity.mjs` aux nouvelles routes migrées.

## Anti-scope-collapse
Une page « qui fonctionne » ou « déjà sobre » n'est **pas** une raison de ne pas la
migrer. Si un objectif est déjà atteint : le prouver, marquer NO_CHANGE_JUSTIFIED,
et **réallouer** l'effort vers une autre amélioration UX de valeur équivalente.
Qualité > nombre de routes : mieux vaut 10 routes réellement transformées que 37
routes ayant reçu trois classes CSS.

## Clôture
`npm test` + `tsc --noEmit` + `npm run build` + `gates:active` (dont `v542:check`)
verts ; corpus identique ; 365 jours inchangés ; `progress.json` intact et vérifié ;
captures BEFORE/AFTER produites ; working tree propre ; aucun serveur résiduel.
**Ne pas démarrer V56.**
