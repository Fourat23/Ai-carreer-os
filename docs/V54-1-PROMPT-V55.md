# V55 — Product UX Migration II (routes restantes) — direction VERROUILLÉE

> À lancer APRÈS V54.1. LE DÉPÔT FAIT FOI. La direction visuelle est **verrouillée**
> (`docs/audits/V54-1-VISUAL-DIRECTION-LOCK.md`) : propager, ne pas ré-inventer.

## Constat hérité (V54.1)
- Direction LOCKED : PageHeader / Status / Metric / ListRow / Panel / PrimaryFocus /
  table comparative / calendrier maçonnerie / navigation resserrée. Accent indigo,
  élévation `--raised`, 0 hex en dur TSX.
- Calendrier réparé + `lib/calendar-model.mjs` + tests. P0 intégrité conservé.

## Invariants absolus
- Curriculum 1.0 gelé (365 jours, 128 leçons, ordre) ; corpus `4c1f3028…` ;
  `progress.json` `32360402…`. Une seule source de vérité. Anti-gamification / slop.
- Statut jamais couleur seule ; score/état jamais sans explication.
- **Non-destructivité** : validation navigateur restaure/vérifie `progress.json`
  (réutiliser `v53:visual` + `v54:integrity`).
- Branche `claude/ai-career-os-saas-phfg49` ; trailers ; pas de PR sauf demande.

## Cibles prioritaires (dette réelle d'abord, puis migration)
1. **Dette V54.1** : (a) **Projects** — en-tête objectif/état/artefacts/progression +
   distinction projet ≠ leçon ; (b) **Parcours** — en-tête au composant `PageHeader`
   (gérer `page-wide`) ; (c) **Dashboard** — résorber le vide vertical (colonnes
   équilibrées, sans contenu inventé) ; (d) **Synthèse** — affiner la largeur de table
   (éviter le scroll interne en desktop moyen).
2. **Migration large** vers la grammaire LOCKED, page par page, priorité learner-facing :
   `/lessons`, `/lab`, `/reviews`, `/month`, `/week`, `/glossary`, `/notes`,
   `/resources`, `/settings`, puis surfaces techniques (labs) avec prudence
   (SPECIALIZED, ROI mesuré).

## Floors par route migrée
Primitives réutilisées, données réelles, **0 hex**, responsive 5 largeurs (overflow 0),
clavier + focus, états loading/empty/error/partial, aucune régression, anti-slop.
Preuves visuelles avant/après. Ne PAS migrer superficiellement (qualité > nombre).

## Clôture
`npm test` + `tsc` + `npm run build` + `gates:active` (v52/v53/v54) verts ; corpus
identique ; ordre des jours inchangé ; `progress.json` restauré et vérifié ; calendrier
tests verts ; working tree propre ; aucun serveur résiduel. **Ne pas démarrer V56.**
