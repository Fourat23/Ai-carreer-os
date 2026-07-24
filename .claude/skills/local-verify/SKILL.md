---
name: local-verify
description: Run and summarize the full AI Career OS verification pipeline (git state, idempotent generate, curriculum:check, depth-check, glossary:check, tests, build/lint/typecheck, lesson links, invalid glyphs, program.json drift, changed files) before and after any change. Use before starting work to capture a green baseline, and after edits to confirm nothing broke. Read-only in net effect; never auto-fixes.
---

# local-verify

## Objectif
Exécuter **tous** les contrôles réels du dépôt et en donner une synthèse lisible, pour prouver que le
socle est vert **avant** et **après** une modification. Ne corrige jamais silencieusement : il constate
et rapporte.

## Quand l'utiliser
- Avant de commencer un travail (UI/UX, technique) : capturer une baseline verte.
- Après une modification, avant tout commit : confirmer l'absence de régression.
- À la demande explicite « vérifie le socle / lance le pipeline ».

## Périmètre autorisé
- **Lecture seule nette.** Le script lance `npm run generate` (qui écrit des fichiers) puis vérifie
  l'idempotence ; il restaure uniquement l'horodatage de `data/program.json` (effet cosmétique) et le
  signale. Aucun autre fichier n'est modifié.

## Interdictions
- Ne **jamais** « réparer » un échec (pas de `git checkout` massif, pas d'édition de fichiers pour faire
  passer un test, pas de suppression de warnings). Un échec se **rapporte**.
- Ne pas committer, ne pas pousser, ne pas modifier de contenu.
- Ne pas restaurer un diff réel de `program.json` (seul l'horodatage est restauré).

## Procédure déterministe
Exécuter le script fourni depuis la racine du dépôt :

```bash
bash .claude/skills/local-verify/verify.sh
```

Il enchaîne, dans l'ordre, avec un statut ✅/❌ par étape :
1. **Git** : branche, HEAD, upstream (ahead/behind), propreté du working tree.
2. **generate idempotent** : `npm run generate` puis contrôle que seul `data/program.json` varie, et
   seulement par `generatedAt` (restauré). Tout autre diff = **échec signalé** (source non régénérée ou
   fichier généré édité à la main).
3. `npm run curriculum:check` (365/365 jours, 365 corrections, 52 semaines, 12 mois, 60 leçons).
4. `npm run curriculum:depth-check`.
5. `npm run glossary:check`.
6. `npm test` (attendu 43/43 — le nombre est lu depuis la sortie, non codé en dur).
7. `npm run build` (**lint + typecheck inclus** — le dépôt n'a pas de script lint/typecheck autonome).
8. Liens de leçons (`/doc/lessons/<slug>` → leçon existante) : attendu 0 cassé.
9. Caractères invalides (U+FFFD, cyrillique, géorgien) dans `curriculum/**/*.md` : attendu 0.
10. Compteurs (jours/solutions/semaines/mois/leçons).
11. Liste des fichiers modifiés (`git status --porcelain`).

## Conditions d'arrêt
- S'arrête et sort en code **1** dès qu'un contrôle échoue (après avoir tout listé). Sort **0** si tout
  est vert. Ne poursuit jamais par une tentative de correction.

## Format de sortie attendu
- Sections `== … ==` avec ✅/❌ par étape, compteurs, liste des fichiers modifiés, et une ligne finale
  `✅ TOUS LES CONTRÔLES SONT VERTS` ou `❌ AU MOINS UN CONTRÔLE A ÉCHOUÉ`.
- En cas d'échec, relayer à l'utilisateur : l'étape en échec + l'extrait de log pertinent
  (`/tmp/lv_*.log`), sans tenter de réparer.

## Notes réelles (dépôt)
- Scripts npm réels : `generate`, `curriculum:check`, `curriculum:depth-check`, `glossary:check`,
  `test`, `build`. Pas de `lint`/`typecheck` séparés.
- Fichiers **générés** (source = `scripts/data/*.mjs`) : `curriculum/days/`, `curriculum/solutions/`,
  `curriculum/week-*.md`, `curriculum/month-*.md`, `curriculum/year-overview.md`, `data/program.json`.
