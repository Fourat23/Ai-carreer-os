---
name: ui-implement
description: Implement a single, explicitly-approved UI/UX improvement in AI Career OS, one screen or component at a time. Preserves all pedagogical content, reuses existing components, avoids generic decorative patterns (gratuitous gradients, cards, effects), tests mobile and desktop, and runs curriculum-guard + local-verify before committing. Use only after a ux-audit finding or spec has been approved. Refuses global redesigns and stops on scope drift.
---

# ui-implement

## Objectif
Appliquer **une** amélioration UI/UX **déjà validée** (issue d'un `ux-audit` ou d'une spec approuvée),
par écran/composant pilote, sans jamais toucher au contenu pédagogique.

## Quand l'utiliser
- **Uniquement** après validation explicite d'un constat/spec précis (« implémente le fix majeur X sur
  la Vue Jour »). Pas d'auto-initiative de redesign.

## Préconditions (obligatoires avant d'écrire)
1. Une **cible validée** : écran/composant + constat/spec approuvé. Sinon → **STOP**, demander la validation.
2. Baseline verte : `bash .claude/skills/local-verify/verify.sh` (✅).
3. Pédagogie intacte au départ : `bash .claude/skills/curriculum-guard/guard.sh local-v1-content-stable` (✅).

## Périmètre autorisé
- Écrire **uniquement** dans `app/` et `lib/` (composants, styles `app/globals.css`), pour la cible validée.
- Réutiliser les composants/classes existants quand pertinent ; petites étapes ; pas d'abstraction
  prématurée.

## Interdictions
- **Aucune** modification de contenu pédagogique : `scripts/data/`, `curriculum/`, `data/program.json`
  (garanti par `curriculum-guard`).
- Pas de refonte globale, pas de nouveau design system, pas de dépendance lourde.
- Pas de gradients/cartes/effets décoratifs génériques sans justification fonctionnelle ; garder une
  interface **professionnelle, distinctive et sobre**.
- Ne pas élargir le périmètre au-delà de la cible validée (pas de « tant qu'on y est »).

## Procédure déterministe
1. Confirmer la cible validée et lister les fichiers à toucher (`app/…`, CSS concerné).
2. Implémenter le **plus petit** changement qui répond au constat, sur la cible seule.
3. **Tester desktop ET mobile** : rebuild + serveur, puis
   `node .claude/skills/ux-audit/measure-viewports.mjs` (0 débordement / 0 superposition) et vérifs
   fonctionnelles (routes 200, états).
4. **Garde pédagogique** : `bash .claude/skills/curriculum-guard/guard.sh local-v1-content-stable`
   → doit rester **✅ (exit 0)**. Si ❌ → **STOP**, annuler la dérive.
5. **Pipeline** : `bash .claude/skills/local-verify/verify.sh` → doit être **✅**.
6. Afficher le **diff fonctionnel** (`git diff -- app lib`) et décrire l'effet **visuel** (avant/après,
   viewports testés).
7. Committer **seulement** après ✅ des étapes 4 et 5, avec un message ciblé sur la cible.

## Conditions d'arrêt
- **STOP** si : pas de cible validée ; `curriculum-guard` passe à ❌ ; `local-verify` échoue ; le
  changement déborde de la cible ; un choix structurant non validé apparaît. Dans tous ces cas, ne pas
  committer et demander une décision.

## Format de sortie attendu
- Rappel de la cible validée + fichiers touchés ; diff `app/lib` ; résultats des 4 viewports ; sortie de
  `curriculum-guard` (✅) et `local-verify` (✅) ; puis le commit (hash) — dans cet ordre.

## Complémentarité
- Consomme les constats de `ux-audit`, s'appuie sur `curriculum-guard` (protection) et `local-verify`
  (pipeline). N'audite pas lui-même et ne modifie jamais la pédagogie.
