# V54 — Product UX Implementation II (migration large + primitives II)

> À lancer APRÈS V53. Fondé sur l'état réel V53 — LE DÉPÔT FAIT FOI.

## Constat hérité (V53)
- `docs/SPRINT-V53.md` (verdict BON) ; `docs/ADR-053-product-ux-implementation.md`.
- Primitives `app/ui/*` (8) adoptées par les 3 pilotes ; accent **indigo** ;
  `v53:check` câblé ; `scripts/v53-visual.mjs` (captures + overflow) ;
  `docs/audits/ROUTE-MIGRATION-MATRIX-V53.md`.

## Invariants absolus
- **Curriculum 1.0 GELÉ** (ordre 365 jours, 128 leçons, prérequis) ; **corpus gelé**
  (SHA-1 `4c1f3028…`) ; `progress.json` intact (`323604021055…`).
- **Une seule source de vérité, aucun moteur parallèle.**
- **Anti-AI-slop / anti-gamification** (verrouillé par `v53:check`).
- Statut jamais porté par la couleur seule ; score/état jamais sans explication.
- Branche `claude/ai-career-os-saas-phfg49` ; trailers ; pas de PR sauf demande.
- **Non-destructivité** : toute validation navigateur DOIT sauvegarder/restaurer
  `data/progress.json` (le POST client `/api/progress` l'écrit) — réutiliser
  `scripts/v53-visual.mjs` qui le fait déjà, et re-vérifier le blob gelé après.

## Cibles prioritaires (dette V53, dans l'ordre de la matrice)
1. **Priorité 1** : `/parcours`, `/revisions` (ActionRow + InlineNotice pour les
   révisions dues/en retard) — porter au design system.
2. **Priorité 2** : `/synthese`, `/capstones`(+`[id]`), `/missions`(+`[id]`),
   `/reviews`, `/diagnostics`.
3. **Priorité 3 (KEEP légers)** : `/calendar`, `/month`, `/week`, `/lessons`,
   `/doc/*`, utilitaires — PageHeader + Status seulement.
4. **SPECIALIZED (prudence)** : surfaces techniques (labs, terminal, cloud) — ROI
   produit faible, migration conservatrice.

## Floors V54
- Chaque route migrée : primitives réutilisées, données réelles, **0 hex en dur**,
  responsive 5 largeurs (overflow 0), clavier + focus visibles, états
  loading/empty/error/partial cohérents, aucune régression, anti-slop maintenu.
- Preuves visuelles avant/après pour chaque lot migré (réutiliser `v53:visual`).
- Extraire une primitive supplémentaire **seulement** si ≥2 usages réels
  (candidats : `Table`/rows, `Skeleton`, `Definition`).
- Étendre `v53:check` (ou un `v54:check`) : couverture d'adoption des primitives
  sur les routes migrées ; base hex 0 maintenue.

## Clôture
`npm test` + `tsc --noEmit` + `npm run build` + `gates:active` (dont `v52`/`v53`)
verts ; corpus SHA-1 identique ; ordre des jours inchangé ; `progress.json`
restauré et vérifié ; working tree propre ; aucun serveur résiduel.
**Ne pas démarrer V55.**
