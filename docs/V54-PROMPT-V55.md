# V55 — Product UX Implementation III (à dériver de l'état réel post-V54)

> À lancer APRÈS V54. LE DÉPÔT FAIT FOI. Ne présume pas le thème : l'audit CP0 peut
> révéler une priorité plus importante que celle esquissée ici.

## Constat hérité (V54)
- `docs/SPRINT-V54.md` (verdict FORT) ; `docs/ADR-054-…` ; `docs/audits/VISUAL-QA-V54.md`.
- Cockpit dashboard, phase-path `/day`, missions/révisions groupées, design system II
  (élévation `--raised` + ombres), primitives `PrimaryFocus`/`ListRow`.
- **P0 intégrité résolu** : une consultation ne mute plus `progress.json` (preuve
  `scripts/v54-progress-integrity.mjs`). Gate `v54:check`.

## Invariants absolus
- Curriculum 1.0 gelé (365 jours, 128 leçons, ordre) ; corpus SHA-1 `4c1f3028…` ;
  `progress.json` `32360402…`. Une seule source de vérité. Anti-gamification / anti-slop.
- Statut jamais couleur seule ; score/état jamais sans explication.
- **Non-destructivité** : toute validation navigateur restaure/vérifie `progress.json`
  (réutiliser `v53:visual` + `v54:integrity`).
- Branche `claude/ai-career-os-saas-phfg49` ; trailers ; pas de PR sauf demande.

## Cibles prioritaires (dette V54 réelle)
1. **Projects** (MOYEN en V54) : en-tête objectif/état/artefacts/progression réelle +
   validation ; distinguer visuellement projet ≠ leçon.
2. **Parcours** : migrer l'en-tête au composant `PageHeader` (gérer `page-wide`) ;
   progression réelle des modules + prochaine action.
3. **Dashboard** : résorber le vide vertical résiduel (bas-gauche) à trajectoire courte
   — équilibrer les colonnes sans inventer de contenu.
4. **Capstones** : polish (déjà solide) — cohérence `Status`/difficulté.
5. **Surfaces techniques** (labs/pipeline/kubernetes/cloud/security) : audit puis
   migration prudente (SPECIALIZED) — ROI produit à mesurer avant d'investir.
6. **A11y** : intégrer axe-core proprement si raisonnable, sinon documenter ; audit
   contraste automatisé ; test clavier réel des routes migrées.

## Floors
Chaque route traitée : primitives réutilisées, données réelles, 0 hex, responsive 5
largeurs (overflow 0), clavier + focus, états loading/empty/error/partial, aucune
régression, anti-slop. Preuves visuelles avant/après. Étendre `v54:check` si utile.

## Clôture
`npm test` + `tsc` + `npm run build` + `gates:active` (v52/v53/v54) verts ; corpus
identique ; ordre des jours inchangé ; `progress.json` restauré et vérifié ; working
tree propre ; aucun serveur résiduel. **Ne pas démarrer V56.**
