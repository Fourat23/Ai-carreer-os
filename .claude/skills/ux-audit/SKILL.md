---
name: ux-audit
description: Read-only UX/UI audit of an AI Career OS screen or flow. Examines visual hierarchy, information density, readability, navigation, wayfinding, responsive behavior (375/768/1024/1440), accessibility, component consistency, feedback, empty/loading/error states, generic "AI slop" appearance, and pedagogical friction — from the real code and rendered output. Produces findings ranked blocking/major/minor with concrete evidence. Use before any UI change to decide what to fix. Never edits files.
---

# ux-audit

## Objectif
Auditer un écran ou un parcours de l'application **sans rien modifier**, à partir du **code réel**
(`app/`, `lib/`, `app/globals.css`) et du **rendu réel** (serveur lancé), et produire des constats
priorisés et actionnables.

## Quand l'utiliser
- Avant un chantier UI/UX, pour décider **quoi** améliorer (et le faire valider).
- Pour évaluer un écran précis ou un parcours (ex. « audite la Vue Jour », « audite la navigation »).

## Périmètre autorisé
- **Lecture seule stricte.** Lire les composants (`app/**/*.tsx`), le CSS (`app/globals.css`), la logique
  (`lib/`), et observer le rendu via le serveur (`npm run build && PORT=3100 npm start`, puis `curl` /
  navigateur headless). **Aucune écriture de fichier applicatif ou pédagogique.**

## Interdictions
- Ne modifier aucun composant, style, page, ni contenu. Aucun commit.
- Ne pas installer de dépendance lourde. `playwright-core` est utilisé en **`--no-save`** (transitoire),
  jamais ajouté à `package.json`. Si absent, l'audit continue par l'analyse du code (dégradation gracieuse).
- Ne pas proposer une refonte globale : produire des constats ciblés, pas un redesign spéculatif.

## Axes examinés (constats fondés sur le code + le rendu)
Hiérarchie visuelle · densité d'information · lisibilité · navigation & orientation dans le parcours ·
responsive (375/768/1024/1440) · accessibilité (focus clavier, `lang`, sémantique, contraste, labels) ·
cohérence des composants · feedback utilisateur · états **vide / chargement / erreur** · apparence
générique ou « AI slop » (gradients gratuits, cartes décoratives, effets sans justification) · friction
pédagogique · cohérence desktop/mobile.

## Procédure déterministe
1. **Cibler** l'écran/parcours et lister ses fichiers réels (`app/<route>/…`, composants, CSS concerné).
2. **Analyse statique** : lire le JSX + le CSS ; relever media queries, `overflow-x`, états gérés
   (`loading`/empty/error), sémantique HTML, focus visible, labels.
3. **Analyse dynamique** (serveur lancé) :
   - HTTP : `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/<route>` (200/404 attendus) ;
   - responsive : `node .claude/skills/ux-audit/measure-viewports.mjs [baseURL] [routes…]`
     (barre horizontale parasite + superposition sidebar/contenu à 375/768/1024/1440 ; dégradation
     gracieuse si pas de navigateur) ;
   - captures si l'outil le permet (sinon, s'appuyer sur les mesures + le code comme preuves).
4. **Classer** chaque constat : **BLOQUANT** / **MAJEUR** / **MINEUR**, avec le fichier/ligne ou la
   mesure comme preuve, et une **recommandation concrète** (sans l'appliquer).

## Conditions d'arrêt
- L'audit se termine par le rapport de constats. **Aucune modification** n'est faite : la décision de
  corriger revient à l'utilisateur (puis à `ui-implement` sur périmètre validé).

## Format de sortie attendu
- Un tableau de constats : `sévérité | écran/route | axe | constat (preuve) | recommandation`.
- Un résumé : nb bloquants/majeurs/mineurs, et la liste des routes/viewports réellement testés.
- Rappel explicite : « lecture seule — aucune correction appliquée, en attente de validation ».

## Complémentarité
- `ux-audit` **constate** (aucune écriture) ; `ui-implement` **corrige** (sur constat validé). Ne pas
  faire l'un dans l'autre.
