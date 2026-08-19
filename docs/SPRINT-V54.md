# SPRINT V54 — Product UX Implementation II

**Type** : produit / UX (saut visuel + migration routes cœur, au-dessus du Curriculum
1.0 gelé). **Corpus** : gelé. **365 jours** : inchangés. **Langue** : français.

## 1. Git
HEAD départ `09dd0a9` (V53). Branche `claude/ai-career-os-saas-phfg49`. local == origin
après push ; working tree propre ; aucun serveur résiduel ; corpus SHA-1 `4c1f3028…`
identique ; `progress.json` `32360402…` restauré.

## 2. 🔴 P0 — intégrité de progression (BLOQUANT) : RÉSOLU À LA RACINE
- **Cause** : `app/day/[id]/DayPanel.tsx`, l'effet de *flush* (`pagehide`/démontage)
  appelait `postDay(...)` **inconditionnellement** ; le ref `dirty` était une garde de
  **montage**, pas un indicateur d'édition. Une simple consultation écrivait un patch
  vide → création d'un enregistrement de jour + `startDate`/`lastOpenedAt`.
- **Correctif** : ref `edited` (vrai uniquement sur modification réelle post-montage) ;
  `flush()` sort si `!edited.current`. Lecture ≠ mutation.
- **Preuve automatisée** : `scripts/v54-progress-integrity.mjs`
  (`VISIT_DAY_DOES_NOT_MUTATE_PROGRESS`) — visite réelle de /day/1,5,186,320, **hash
  inchangé, sans restauration**. Le workaround de restauration n'est plus nécessaire.
  Vérifié aussi par `v54:check` (garde `edited` présente).

## 3. Routes réellement transformées
- **Dashboard** → cockpit : `PrimaryFocus` dominant (surface `--raised`, ombre, CTA
  indigo plein), rail hiérarchisé, `Metric`/`Status`/`ActionRow`/`Panel`.
- **Aujourd'hui** → poste de travail : **DÉROULÉ** (chemin de phases cliquable, dérivé
  du contenu annoté, aucune modif pédagogique) + header net.
- **Missions** → regroupées par statut (synthèse + `ListRow` denses).
- **Révisions** → file priorisée (synthèse dues/retard/à venir + meilleurs vides).
- **Diagnostics** → `PageHeader` (source unique).
- **Shell** → état actif premium (teinte accent + icône + barre 3px).

## 4. Design System II
Échelle d'élévation `--bg < --panel < --panel-2 < --raised` + ombres `--shadow-1/-2/
-focus` + `--border-subtle`. Accent violet réservé identité/action/focus ; vert `--ok`
réservé succès. **0 hex en dur dans le TSX.**

## 5. Primitives
- **Créées** : `PrimaryFocus`, `ListRow` (≥2 usages : missions + révisions + …).
- **Réutilisées** : `Status`, `PageHeader`, `SectionHeader`, `Metric`, `Panel`,
  `ActionRow`, `EmptyState`, `InlineNotice`.
- Présentation pure, aucune source de vérité (vérifié par `v54:check`).

## 6. Bugs découverts / corrigés
- **P0** mutation-à-la-consultation (ci-dessus) — corrigé + testé.
- Pièges d'exploitation notés : un **serveur `next start` résiduel** servait du code
  périmé (chunks 400 + exception client) → faux négatif visuel ; résolu en tuant tous
  les process et en repartant d'un build frais. Documenté (pas un bug applicatif).

## 7. Preuve visuelle (navigateur réel, pas le diff Git)
`v54-before/` (V53) et `v54-after/` (V54), 55 captures chacune (11 routes × 5 largeurs).
**55/55 : 200, 0 overflow.** Voir `docs/audits/VISUAL-QA-V54.md`. Deux captures
dashboard V53/V54 à 1440px ne peuvent pas être confondues.

## 8. Responsive / A11y
- Responsive : overflow horizontal mesuré = 0 sur 55 vues (375→1920). Cockpit et
  listes empilent proprement en mobile.
- A11y : skip link, focus visible, `prefers-reduced-motion`, dots d'auto-éval en
  boutons, landmarks du shell, statut jamais couleur seule (label + point).
  axe-core non intégré (dépendance de test lourde non justifiée ici) — audit manuel
  documenté honnêtement.

## 9. RÉEL / SIMULÉ / NON TESTÉ / REPORTÉ
- **RÉEL** : P0 + preuve, 55 captures + overflow, tests/build/gates verts.
- **NON TESTÉ (auto)** : contraste AAA, lecteur d'écran réel.
- **REPORTÉ V55** : Projects (en-tête objectif/état/artefacts), Parcours (composant
  header), Capstones (déjà solide, polish), surfaces techniques (labs), dashboard vide
  vertical résiduel.

## 10. Invariants
Corpus `4c1f3028…` identique ; 365 jours ordonnés inchangés ; `progress.json`
`32360402…` restauré ; aucune progression créée par navigation ; aucune 2e source ;
aucune gamification ; local == origin ; tree propre.

## 11. Validation technique
`npm test` **1265/0** · `tsc` **0** · `npm run build` **OK** · `gates:active` **verts**
(dont v52/v53/**v54**) · P0 intégrité **OK**.

## 12. Verdict : **FORT**
Saut visuel réel et vérifié (cockpit, profondeur, phase-path, listes groupées), P0
d'intégrité résolu à la racine avec preuve, primitives cockpit adoptées, données 100 %
réelles, aucune gamification. **Pas « EXCELLENT »** : Projects reste non migré, un vide
vertical persiste au dashboard, les surfaces techniques et l'audit contraste automatisé
restent à faire (V55). Honnête et sans euphémisme.
