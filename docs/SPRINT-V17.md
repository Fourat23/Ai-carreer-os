# Sprint V17 — Qualité d'ingénierie, maintenance, performance et documentation

Rapport de clôture. Sprint fondé sur un audit CP0 réel (non supposé). Premier
sprint autorisé à modifier **intentionnellement** le contenu pédagogique, sous
mutation contrôlée (ADR-017).

## 1. État initial (audité au CP0)

- Branche : `claude/ai-career-os-saas-phfg49`, HEAD de départ **`eb7c3b8`** (fin V16).
- 526 tests verts ; `curriculum:check`, `depth-check`, `glossary:check` verts ;
  génération idempotente (seul `generatedAt` volatil).
- `data/progress.json` au SHA initial `8b043eeb337db167` ; 0 workspace, 0 serveur.
- Trois parcours disponibles (Foundations 365 j, Full-Stack 119 j, Backend 85 j),
  laboratoire contextualisé, vue agrégée `/synthese` en lecture seule, sauvegarde v3.
- **Anomalie V16 découverte au CP0** : `docs/SPRINT-V16.md` est **absent** (voir §14).

Architecture réelle confirmée : source de vérité = `scripts/data/*.mjs` (36 modules)
→ génère `curriculum/**/*.md` (365 jours + solutions) **et** `data/program.json`.
85 `.md` marqués `<!-- keep -->` (édités à la main, jamais régénérés). Glossaire =
`curriculum/glossary/glossary.json`.

## 2. Inventaire de couverture avant enrichissement

| Sujet | Avant V17 |
|---|---|
| Refactoring sans régression | pratiqué (jour 69) |
| ADR | évalué (projets, jours 47/66/118/146) |
| p50/p95/p99, latence, SLI/SLO, observabilité, post-mortem | expliqués |
| Dette technique, code smells, legacy, changelog, C4 | mentionnés (superficiels) |
| Maintenance (corrective/adaptative/préventive/évolutive) | **absent** |
| Déprécation-leçon, backward-compat, breaking change, strangler | **absent** |
| CPU/IO/memory-bound, memory leak, bundle size, budget/régression perf | **absent** |
| RFC, HLD, HSD, LLD, runbook/playbook (profondeur) | **absent** |
| Glossaire : 32 des 52 termes cibles | **absents** |

## 3. Stratégie de mutation contrôlée (ADR-017)

La contrainte byte-identical (V6→V16) est levée **uniquement** pour les journées
explicitement listées dans `docs/architecture/v17-enrichment-plan.json`. Restent
invariants : déterminisme/idempotence, intégrité structurelle, anti-fuite,
stabilité des 3 parcours, **absence de dérive hors périmètre** (gate `v17:check`).
Convention retenue : **HSD = High-Level Solution Design** (ambiguïté documentée,
aucune prétention de standard universel).

## 4. Fichiers pédagogiques volontairement modifiés (périmètre)

Sources éditoriales (`scripts/data/*.mjs`) : `days-31-90.mjs` (livrable jour 66),
`days-enrich-61-90.mjs` (jours 66/69/80/85), `days-enrich-91-120.mjs` (jour 102).
Générés / contenus : `curriculum/days/day-{066,069,080,085,102}.md`,
`curriculum/glossary/glossary.json`, `curriculum/methodology/documentation-technique.md`
(nouveau, keep-marked), `data/program.json` (dérivé), `data/day-exercises.json`
(+3 mappings : 69/80/102), 5 exercices sous `data/exercises/`.

**Hors périmètre : 0 dérive.** Exactement 5 jours modifiés (66/69/80/85/102),
0 solution, 0 semaine, 0 mois, 355 autres jours inchangés. Vérifié par `v17:check`
(comparaison vs baseline `eb7c3b8`) et par diff structurel de `program.json`.

## 5. Matrice de couverture avant → après

| Sujet | Avant | Après | Support |
|---|---|---|---|
| Dette technique (taxonomie, intérêts, registre, priorisation) | mentionné | **pratiqué** | jour 69 + exercice `debt-audit` |
| Code smells / legacy | mentionné | **expliqué** | jour 69 + glossaire |
| Refactoring sans régression + caractérisation | pratiqué | **évalué** | jour 69 + `refactor-legacy` |
| Maintenance corrective/adaptative/préventive/évolutive | absent | **expliqué** | jour 85 + glossaire |
| Déprécation / backward-compat / breaking change / strangler | absent | **expliqué** | jour 85 + glossaire |
| Mesure : baseline, hypothèse, profiling, benchmark | mentionné | **pratiqué** | jour 80 + `latency-percentiles` |
| Latence/débit, percentiles p50/p95/p99, tail latency | expliqué | **pratiqué** | jour 80 + `latency-percentiles` |
| CPU/IO/memory-bound, memory leak, cold start, hot path | absent | **expliqué** | jour 80 + glossaire |
| N+1, correction de goulot | mentionné | **pratiqué** | jour 80 + `fix-nplus1` |
| Bundle size, lazy loading, budget/régression perf | absent | **expliqué/pratiqué** | jours 80/102 + `perf-budget` |
| ADR/RFC/HLD/HSD/LLD/TSD/C4/contrat d'API | partiel/absent | **expliqué + modèles** | jour 66 + référence /doc |
| Runbook/playbook/post-mortem/changelog/decision log | quasi absent | **expliqué + livrable évalué** | jour 66 + référence + livrable runbook |

## 6. Sujets ajoutés (détail)

- **Dette & maintenance (jour 69, jour 85)** : matrice de Fowler, cinq natures de
  dette, dette locale vs systémique, registre, priorisation impact × risque ×
  effort, boy-scout ; 4 types de maintenance ISO 14764, dépréciation/migration,
  strangler, hotfix/rollback/post-déploiement, fin de vie.
- **Performance (jour 80, jour 102)** : baseline, hypothèse, profiling, hot path,
  latence/débit, percentiles, CPU/IO/memory-bound, allocations, memory leak, cold
  start, budget & régression ; poids du bundle, code splitting, lazy loading.
- **Documentation (jour 66 + référence)** : pyramide HSD→HLD→LLD→TSD, familles
  décision/conception/exploitation, 14 modèles réutilisables, anti-sur-documentation.

## 7. Exercices ajoutés (5) ou reliés

| Exercice | Sujet | Jour | Compétences | Tests |
|---|---|---|---|---|
| `debt-audit` | prioriser un registre de dette (ROI intérêt/effort) | 69 | functions, arrays | 3 pub + 3 privés |
| `refactor-legacy` | refactorer un slugify legacy sous tests de caractérisation | 69 | functions, purity | 3 pub + 3 privés |
| `latency-percentiles` | calculer p50/p95/p99 (nearest-rank) | 80 | arrays, functions | 3 pub + 2 privés |
| `perf-budget` | verdict improved/ok/regression vs baseline+budget | 80, 102 | functions, conditions | 3 pub + 3 privés |
| `fix-nplus1` | corriger un N+1 par pré-indexation Map | 80 | hashmap, arrays | 3 pub + 2 privés |

Tous : contrat respecté, starter volontairement incomplet (échoue ≥ 1 test
public), référence vérifiée (100 % des tests), tests privés non exposés,
atteignables depuis les 3 parcours (jours partagés). Les activités documentaires
(ADR, TSD/HSD, runbook, post-mortem) sont couvertes comme **livrables évalués**
(jour 66) et **modèles de référence** — hors lab de code par conception.

## 8. Glossaire avant → après

254 → **283 entrées** (+29), couvrant les **32/32 termes cibles**. Consolidations
sémantiques : p50/p95/p99 → une entrée `percentile` (aliases) ; CPU/I-O/memory-bound
→ une entrée `bound`. Chaque entrée : définition simple + professionnelle, exemple
de réunion, traduction en clair, confusions, termes liés, domaine, niveau, et
**journées associées** (`days`). HSD : `ambiguityNote` explicite. Recherche et
filtres (catégorie/niveau) vérifiés ; ids/URLs existants préservés.

## 9. Checkpoints & commits

| CP | Objet | Commit |
|---|---|---|
| CP0 | Audit forensique & pédagogique | *(sans commit)* |
| CP1 | ADR-017 mutation contrôlée + convention HSD | `b635358` |
| CP2 | Modèle de couverture pur + gate anti-dérive | `9f8597f` |
| CP3 | Dette technique & maintenance (j69/j85) + 2 exercices | `ed3a394` |
| CP4 | Performance, profiling & optimisation (j80/j102) + 2 exercices | `8756d7b` |
| CP5 | Documentation technique + référence 14 modèles + runbook évalué | `5133bf9` |
| CP6 | Corpus relié + `fix-nplus1` + matrice de couverture | `fc55852` |
| CP7 | Glossaire +29 entrées (32 termes cibles) | `f3f8346` |
| CP8 | Intégration surfaces (glossaire ↔ cours) | `6ade068` |
| CP9 | Validation d'intégrité + E2E multi-parcours | `a31a4dd` |
| CP10 | Hardening, rapport, prompt V18 | *(ce commit)* |

## 10. Tests

526 → **567 tests** verts (+41). Nouveaux : `v17-coverage` (13, modèle pur),
`v17-content` (22, présence réelle des sujets + contrat exercices + glossaire),
`v17-integrity` (6, liens non cassés + reachability + anti-fuite). `tsc --noEmit`
OK. Gates `v17:check` / `curriculum:check` / `depth-check` / `glossary:check` vertes.

## 11. Validations navigateur (serveur réel)

- **CP8** (375 → 1920 px) : glossaire trouve les nouveaux termes, filtres
  domaine/niveau, « Journées associées » → `/day/N`, référence `/doc/methodology/
  documentation-technique` rendue, jour 66 affiche le livrable runbook, `/synthese`
  préservée. Aucun débordement horizontal, 0 erreur console.
- **CP9 E2E (10 étapes)** : cours enrichi → terme de glossaire lié → exercice
  `fix-nplus1` exécuté (6/6, allPassed) → preuve → compétence `hashmap=3` dans le
  parcours actif → bascule Backend → isolation vérifiée → export/import →
  restauration exacte.

## 12. Performances & bundles

TTFB (chaud) des routes principales : `/` 37 ms, `/glossary` 46 ms, `/day/80`
19 ms, `/day/66` 12 ms, `/lab` 18 ms, `/synthese` 8 ms, `/doc/methodology/…` 10 ms,
`/skills` 9 ms — toutes 200.

First Load JS partagé : **103 kB**. Isolation confirmée : `/lab/[exerciseId]`
= 118 kB (CodeMirror + compilateurs) vs `/glossary` 106, `/doc/[...slug]` 103,
`/synthese` 108, `/day/[id]` 116. **CodeMirror, FrontendPreview et ReactPreview
sont chargés paresseusement** (`dynamic(() => import(...))` dans
`app/lab/[exerciseId]/LabWorkspace.tsx`) et absents des routes non-Lab. L'ajout
V17 sur `/glossary` (« Journées associées ») est négligeable.

## 13. Sécurité & anti-fuite

- Aucune solution/référence d'exercice V17 dans le build client (`.next/static` :
  0 occurrence de `prioritizeDebt`/`regressionVerdict`/`joinLoans`).
- Chaque exercice conserve des tests privés non exposés (seuls nom+id des tests
  publics quittent le serveur ; agrégat privé uniquement).
- Aucune protection présentée comme une isolation OS ; aucun réseau/CDN ajouté.

## 14. Anomalie V16 (conservée, non réécrite)

`docs/SPRINT-V16.md` est **réellement absent**. V16 avait livré ses fonctionnalités
jusqu'au HEAD `eb7c3b8` ; ses dernières étapes (CP9/CP10) étaient des **validations
sans changement de fichier produit**, et son rapport CP10 n'a jamais été rédigé ni
commité. Cette lacune a été **découverte pendant l'audit CP0 de V17**. Elle ne
remet pas en cause les fonctionnalités V16 vérifiées (multi-parcours, lab
contextualisé, `/synthese`, sauvegarde v3). Aucun commit V16 n'a été fabriqué
rétroactivement et l'historique n'a pas été réécrit.

## 15. Limites honnêtes

- Les activités documentaires (ADR/TSD/HSD/runbook/post-mortem) ne sont pas des
  exercices auto-corrigés : le lab grade du code (`call-equals`), pas de la prose.
  Elles sont donc des livrables évalués + des modèles, pas des exercices notés.
- La recherche du glossaire tokenise sur les non-alphanumériques : les formes
  hyphénées ou symboliques (`cpu-bound`, `N+1`) se trouvent via des requêtes
  naturelles (`CPU`, `bound`, `n plus un`, `n+1 query`) mais pas par la chaîne
  brute exacte. Discoverabilité assurée, tokenizer partagé non modifié (risque).
- L'enrichissement est ciblé (5 jours) et non exhaustif : il comble les manques
  identifiés au CP0 sans réécrire le curriculum.
- Le budget/percentiles sont enseignés avec des exercices déterministes (pas de
  micro-benchmark chronométré, non reproductible en CI).

## 16. Hashes avant → après (fichiers pédagogiques modifiés)

| Fichier | Avant (`eb7c3b8`) | Après (HEAD) |
|---|---|---|
| day-066.md | `504a430703df` | `c8d3479a3534` |
| day-069.md | `aef85f25a4df` | `016dc153c8c7` |
| day-080.md | `9d8e8aa0bb7b` | `e5133b628867` |
| day-085.md | `ec10a55a9855` | `da87b9fc0701` |
| day-102.md | `4fbb3705d8a7` | `6cdb5699f296` |
| glossary.json | `44d99dcbab41` | `81f00fb7b263` |
| documentation-technique.md | *(absent)* | `33046a706d33` |

Baseline complète (919 fichiers) conservée au CP0 ; empreinte hors périmètre
inchangée.

## 17. État Git final

- Branche `claude/ai-career-os-saas-phfg49`, **local == origin**.
- `data/progress.json` restauré au SHA initial **`8b043eeb337db167`**.
- 0 workspace résiduel, 0 serveur résiduel.
- HEAD final : *ce commit CP10*.

## 18. Prompt de reprise V18

> Reprends AI Career OS pour le Sprint **V18**. Commence **impérativement par un
> audit CP0 en lecture seule**, sans rien supposer :
>
> 1. `git status --short`, branche, `git rev-parse HEAD`, `git log --oneline -15`,
>    comparaison local/origin.
> 2. SHA de `data/progress.json` (attendu `8b043eeb337db167`).
> 3. Workspaces/serveurs résiduels (attendus 0/0).
> 4. Gates : `npm test` (attendu 567 verts), `tsc --noEmit`, `npm run v17:check`,
>    `curriculum:check`, `depth-check`, `glossary:check`.
> 5. Vérifie la présence de `docs/SPRINT-V17.md` et `docs/ADR-017-*.md`.
> 6. Vérifie que V18 n'a pas déjà été livré. Si HEAD diffère de la fin V17,
>    inspecte `git log` avant toute écriture.
>
> **État V17 attendu** : HEAD ≈ fin V17 ; 567 tests ; 283 entrées de glossaire ;
> 5 exercices V17 ; 5 jours enrichis (66/69/80/85/102) ; référence
> `/doc/methodology/documentation-technique` ; gate `v17:check` verte.
>
> **Objectif produit V18 — au choix, à cadrer par un ADR de périmètre** : étendre
> l'enrichissement contrôlé (même discipline qu'ADR-017) à un nouveau bloc
> transverse cohérent, par exemple **observabilité & SRE appliqués** (SLI/SLO/error
> budget en pratique, tableaux de bord, alerting, tracing distribué), **sécurité
> applicative approfondie** (menaces, secrets, supply-chain — sans techniques
> offensives), ou **tests avancés** (property-based, mutation testing, contract
> testing). Réutilise `buildCatalogue`, `resolveTrackDays`, le modèle
> `lib/v17-coverage.mjs` (renommer/étendre en `v18` si besoin) et la gate
> anti-dérive. **Aucun** nouveau runtime, nouveau Workbench, refonte graphique,
> réseau/CDN, ni logique SaaS. Les 3 parcours doivent rester stables.
>
> **Contraintes de contenu** (identiques V17) : enrichissement ciblé, justifié,
> traçable, déterministe, vérifié par matrice avant/après ; plan explicite des
> journées modifiées ; gate de dérive verte ; glossaire enrichi sans doublon
> sémantique ; `data/progress.json` sauvegardé puis restauré ; workspaces
> supprimés ; serveurs arrêtés ; commits atomiques par checkpoint ; validation
> navigateur réelle 375→1920 quand une surface change.
>
> **Discipline de checkpoint** : audit ciblé → conception minimale → implémentation
> → tests → typecheck → validation réelle → contrôle des dérives pédagogiques →
> sauvegarde/restauration de `progress.json` → nettoyage workspaces → arrêt
> serveurs → commit atomique → push. Jamais de travail validé non commité ; jamais
> de commit si rien ne change ; jamais de contenu déclaré couvert sur la seule base
> d'un grep. Termine par `docs/SPRINT-V18.md` et le prompt V19.
