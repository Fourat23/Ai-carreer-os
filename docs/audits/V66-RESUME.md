# V66 — fichier de reprise

> Tenu à jour au fil du sprint. Sert à reprendre exactement où on en est, sans
> relire la conversation.

**Sprint** : V66 — Retention Engine I + Academic Pedagogy Forensics + Flagship
Lesson Hardening
**Base** : `7434974` (V65.1, `REFERENCE_READY`)
**Branche** : `claude/ai-career-os-saas-phfg49`

## Avancement

| CP | Sujet | État |
|---|---|---|
| CP0 | Audit pédagogique forensique, lecture seule | ✅ `docs/audits/V66-CP0-AUDIT.md` |
| CP1 | Gel : échantillon, seed, barème, seuils, défauts, protocoles, BEFORE | ✅ ce commit |
| CP2–CP7 | Retention Engine I | ⏳ |
| CP8–CP12 | Durcissement de 8–12 flagships + tests mots-clés / Feynman + gates | ⏳ |
| CP13–CP15 | Walkthrough, intégrité, rapport final, 25+1 questions, prompt V67 | ⏳ |

## Ce qui est GELÉ et ne sera pas rouvert

| Artefact | Fichier |
|---|---|
| Grille A–K + barème /5 sur 12 dimensions + seuils + protocoles P1–P4 | `docs/V66-ACADEMIC-GRID-FROZEN.md` |
| Échantillon stratifié, seed **20260828**, 43 journées, 18/18 domaines | `scripts/v66-sample.mjs` · `docs/audits/v66/sample-frozen.json` |
| Détecteurs de symptômes | `scripts/v66-pedagogy-metrics.mjs` |
| Modèle de charge (150 mots/min, 20 lignes/min, 1,5 min/rappel, 4 min/réflexion) | `scripts/v66-load.mjs` |
| Résultats BEFORE, corpus entier | `docs/audits/v66/before-symptoms.json` · `before-load.json` |

## Empreintes au gel (méthode : `find <dir> -type f -print0 \| sort -z \| xargs -0 sha256sum \| sha256sum`)

| Dossier | Empreinte |
|---|---|
| `curriculum/` | `a2099b51db9d75a6db74f5547c5a60681ff69bac9f7be14fdf3c4684ae7a2edf` |
| `curriculum/lessons/` | `65301c3bcdde6a7caaf1095a7e4adbb1642526171545ec6eedb7b7c929adadd3` |
| `curriculum/days/` | `761d6d80768d7b13059667c9ca9708db987c5270ce335e579877683a0e430787` |
| `data/` | `e7bcbd163a871a7a51c27e78493ba3734829380ceee1415ef768ca8e4d70208d` |

## Résultats BEFORE — les chiffres qui serviront de référence au CP15

| Mesure | Avant |
|---|---|
| Familles éditoriales | A condensée **71** · B progressive **12** · C sous-sections **45** |
| Noyau explicatif médian | A **239 mots (23 %)** · B 335 (27 %) · C 396 (33 %) |
| Longueur des leçons | min 867 · médiane 1 122 · max **1 524** |
| Contenu fourni par journée | médiane **67 min = 25 %** des 4 h 30 annoncées |
| Revues hebdomadaires (52 j.) | **9 min = 3 %** des 4 h 30 |
| Journées avec budget de temps propre | **98 / 365** |
| Exemple guidé complet | 74 % · **91 %** hors revues (99 % corpus hors revues) |
| Contre-exemple **montré** | **0 %** — 1 seul fichier du corpus (`css-flexbox.md`) |
| Erreurs seulement nommées | **81 %** |
| Correction expliquant l'erreur de raisonnement | **42 %** — 100 % en M1-M3, **42 %** en M10-M12 |
| Rappel actif caché | journées **91 %** · leçons **0 %** |
| Vocabulaire orphelin | **116 / 778 termes (15 %)**, 65 leçons sur 128 |
| Liens `/glossary` depuis les leçons | **0**, pour 711 entrées disponibles |
| Acronyme jamais développé | **53 %** des journées |
| Jargon marqué | médiane **1,9** / 100 mots |
| Note au barème gelé | **2,83 / 5** · D7 = 1 · D10 = 1 · D12 = 5 |

## Faux positifs écartés (à ne pas réintroduire)

| | Métrique fautive | Ce qu'elle disait | Cause |
|---|---|---|---|
| FP-1 | `\b[A-Z]{2,6}\b` | « 100 % des journées ont un acronyme non développé » | `\b` casse sur les accents : ÉTAT → TAT |
| FP-2 | camelCase / kebab-case | « 1 terme de jargon / 100 mots » | le jargon du corpus est en minuscules ordinaires |
| FP-3 | `parce que\|car\|pourquoi` | « 5 % des erreurs expliquées » | la causalité s'exprime par `:` et juxtaposition |
| FP-4 | section « Explication complète » | « 12 leçons sans noyau explicatif » | elles disent « Explication **progressive** » — ce sont les meilleures |

**Règle générale tirée de ces quatre cas** : toute regex utilisant `\b` sur ce
corpus français est suspecte par construction, et aucun chiffre n'entre dans un
rapport sans lecture directe d'au moins deux occurrences.

## Dette identifiée au CP0

| | Sujet | Priorité |
|---|---|---|
| P0-1 | 0 lien vers le glossaire (711 entrées) depuis les 128 leçons — vocabulaire défini mais inatteignable au point de blocage | à traiter, défaut **produit** |
| P0-2 | 25 % du temps annoncé est décrit ; 267 journées sur 365 sans budget par activité | à traiter |
| P0-3 | 1 seul contre-exemple exécutable dans tout le corpus | flagships CP8–CP12 |
| P1-1 | 71 leçons de famille A : noyau de 239 mots sans structure | flagships CP8–CP12 |
| P1-2 | 6 termes bloquants définis nulle part : `lint`, `linter`, `produit scalaire`, `norme`, `connection pool`, `endpoint` | à traiter |
| P1-3 | 2 prérequis pointant vers une ressource qui ne contient pas la notion | à traiter |
| P1-4 | Correction pédagogique qui se dégrade au fil de l'année (100 % → 42 %) | à instruire |
| P2-1 | `detailed:true/false` ne correspond à aucune différence mesurable | à documenter |

## Rappels d'exécution

- Serveur : `AICOS_PROGRESS_FILE=… setsid nohup npx next start -p PORT > log 2>&1 < /dev/null &` puis `disown`.
  **Ne jamais `pkill -f "next start"`** (tue le shell appelant) —
  `ps -eo pid,args | grep next-server | grep -v grep | awk '{print $1}'` puis `kill -9`.
- Ports déjà utilisés : jusqu'à 3501. Prochain libre : **3502**.
- Chromium : `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
  `playwright-core` résolu depuis la racine du dépôt.
- Messages de commit : passer par `-F` avec un heredoc **quoté** (les back-ticks
  d'un `-m` sont interprétés par le shell).
