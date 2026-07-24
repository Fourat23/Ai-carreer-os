---
name: curriculum-guard
description: Protect the pedagogical baseline of AI Career OS during technical or UI/UX work. Detects any change to curriculum content (days, solutions, weeks, months, lessons, projects, rubrics, reviews, Y2/Y3 reflections) and to program.json, distinguishing generated files from real sources (scripts/data). Use before committing UI/technical work, and whenever verifying that curriculum stayed untouched. Blocks (exit 1) on any unrequested pedagogical change; read-only, never edits.
---

# curriculum-guard

## Objectif
Empêcher qu'un travail technique ou UI/UX modifie — même par accident — le socle pédagogique. Il compare
l'état courant à une base, classe chaque changement, et exige une validation humaine si du contenu
pédagogique a bougé.

## Quand l'utiliser
- **Avant tout commit** d'un chantier UI/UX ou technique : prouver que la pédagogie est intacte.
- Après une régénération ou une manipulation de `scripts/data/`, pour voir ce qui a réellement changé.
- Pour comparer à un point de référence (ex. le tag `local-v1-content-stable`).

## Périmètre surveillé (réel)
- **Sources éditables** : `scripts/data/*.mjs` (vraie source de vérité du contenu généré).
- **Fichiers générés** (par `npm run generate`) : `curriculum/days/`, `curriculum/solutions/`,
  `curriculum/week-*.md`, `curriculum/month-*.md`, `curriculum/year-overview.md`, `data/program.json`.
- **Fichiers rédigés à la main** (protégés `<!-- keep -->`, la `.md` EST la source) :
  `curriculum/lessons/`, `projects/`, `rubrics/`, `methodology/`, `career/`, `resources/`, `templates/`,
  `glossary/`, `how-to-use-12-months.md`, `AUTHORING_GUIDE.md`, `QUALITY_STANDARD.md`.

## Interdictions
- Lecture seule : ne modifie, ne restaure, ne committe **rien**.
- Ne « corrige » pas un changement détecté : il le **signale** et demande validation.

## Procédure déterministe
```bash
# Comparer l'état courant (working tree + commits) à une base :
bash .claude/skills/curriculum-guard/guard.sh                      # base = HEAD (défaut)
bash .claude/skills/curriculum-guard/guard.sh local-v1-content-stable   # base = tag baseline
bash .claude/skills/curriculum-guard/guard.sh <commit|branch|tag>
```
Le script :
1. Réunit les changements pédagogiques (diff vs base **+** modifications non commitées, y compris
   fichiers non suivis) sur `scripts/data/`, `curriculum/`, `data/program.json`.
2. Ignore un changement de `program.json` limité à `generatedAt` (cosmétique).
3. Classe chaque fichier : **[SOURCE éditable]**, **[GÉNÉRÉ]**, **[RÉDIGÉ-MAIN]**.
4. Signale spécialement les fichiers **générés édités à la main sans `<!-- keep -->`** : ils seront
   **écrasés** au prochain `npm run generate` (la vraie source est dans `scripts/data/`).

## Conditions d'arrêt
- **Exit 0** : aucun changement pédagogique → on peut poursuivre le travail UI/technique.
- **Exit 1** : au moins un changement pédagogique réel → **STOP, validation humaine requise**. En chantier
  UI/UX, ce périmètre doit rester à **zéro** changement.

## Format de sortie attendu
- Liste classée `[SOURCE]/[GÉNÉRÉ]/[RÉDIGÉ-MAIN]`, un récap chiffré, l'alerte 🚨 pour les générés
  édités à la main, et une ligne finale de verdict (✅ intact / ❌ validation requise).

## Complémentarité
- `curriculum-guard` protège la **pédagogie** ; `local-verify` vérifie le **pipeline**. `ui-implement`
  DOIT appeler les deux avant tout commit. `ux-audit` n'écrit rien et ne déclenche pas le guard.
