# V53 — Product UX Architecture & Design System II (page migration)

> À lancer APRÈS V52. Fondé sur l'état réel V52 — LE DÉPÔT FAIT FOI. Poursuit la
> mise en produit AU-DESSUS du Curriculum 1.0 verrouillé.

## Constat hérité
- `docs/SPRINT-V52.md` (verdict BON) ; `docs/ADR-052-product-ux-and-design-system.md` ;
  `docs/audits/UX-AUDIT-V52.md`. Gate `v52:check` ; `lib/skill-vocabulary.mjs`.
- P0 V52 corrigé : `/day` rend 200. UI sobre, tokens complets, aucune gamification.

## Invariants absolus
- **Curriculum 1.0 VERROUILLÉ** (ordre 365 jours, 128 leçons, prérequis) ; **corpus
  gelé** (SHA-1 `4c1f3028…`) ; `progress.json` intact
  (`323604021055588a9528a86875f36598dbdc7758`).
- **Une seule source de vérité, aucun moteur parallèle.** Read-models réutilisés.
- **Anti-AI-slop / anti-gamification** (verrouillé par `v52:check`) : aucun
  XP/streak/badge/niveau, hero, glow, radar, stat vanity, texte motivationnel généré.
- Branche `claude/ai-career-os-saas-phfg49` ; trailers ; pas de PR sauf demande.

## Cibles prioritaires (dette V52)
1. **Migration visuelle page-à-page** vers le contrat de design system, en
   commençant par les 3 pilotes (Dashboard / Aujourd'hui / Compétences), à densité
   maîtrisée, hiérarchie éditoriale forte, données réelles uniquement.
2. **Extraction de primitives partagées** dans un dossier `app/ui/` (Button, Badge/
   Status, Meter, Table rows, EmptyState, SectionHeader, PageHeader, SkillStatusRow,
   ActionRow, EvidenceRow) réutilisant les tokens — sans cloner un design kit.
3. **Validation overflow multi-largeurs automatisée** (375/768/1024/1440/1920) :
   utiliser le Chromium préinstallé via `executablePath: '/opt/pw-browsers/chromium'`
   si @playwright/test est ajouté avec justification, sinon test DOM headless léger.
4. **Consolidation des 6 couleurs hex héritées** vers des tokens sémantiques.
5. **Accessibilité** : audit clavier réel des 3 pilotes (tab order, focus visible,
   skip link, landmarks, labels, zoom 200 %, prefers-reduced-motion).

## Floors
Les 3 pages pilotes forment visiblement le même produit ; primitives partagées
extraites ; overflow multi-largeurs vérifié ; a11y clavier des pilotes ; aucune
régression ; anti-slop maintenu.

## Clôture
`npm test` + `tsc --noEmit` + `npm run build` + `gates:active` (dont `v52:check`)
verts ; corpus SHA-1 identique ; ordre des jours inchangé ; `progress.json`
restauré ; working tree propre ; aucun serveur résiduel. **Ne pas démarrer V54.**
