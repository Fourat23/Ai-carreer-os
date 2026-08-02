# Sprint V18 — Missions d'ingénierie professionnelle

Rapport de clôture. Sprint fondé sur un audit CP0 réel (non supposé). Transforme
les notions V17 (dette, maintenance, performance, documentation, incident) en
**missions d'ingénierie** réellement exploitables, en ÉTENDANT l'existant
(ADR-018) : une seule progression, aucun second moteur, aucun second catalogue.

## 1. État initial (audité au CP0)

- Branche `claude/ai-career-os-saas-phfg49`, HEAD de départ **`a2aa06a`** (V17 CP10).
- 567 tests verts ; `tsc` propre ; build sans warning ; gates `v17:check`,
  `curriculum:check`, `depth-check`, `glossary:check` vertes.
- 3 parcours disponibles (Foundations 365 j, Full-Stack 119 j, Backend 85 j),
  progression multi-parcours v3 isolée. `data/progress.json` au SHA initial
  `8b043eeb337db167`. 0 workspace, 0 serveur. local == origin.
- Glossaire à 283 entrées ; jours 66/69/80/85/102 enrichis par V17.

## 2. Anomalie

Aucune anomalie nouvelle. L'absence historique de `docs/SPRINT-V16.md` reste
documentée dans le rapport V17 ; l'historique n'a **pas** été réécrit.

## 3. Architecture retenue (ADR-018)

- **Définitions de mission** : nouvelle source versionnable `data/missions/*.json`
  (parallèle à `data/exercises/`) + modèle pur `lib/mission.mjs` + `lib/mission-state.mjs`.
- **État de mission** : champ optionnel `missions` **ajouté au track plat** de la
  progression v3 (une seule `progress.json`) — additif, borné, sûr.
- **Réutilisation** : preuves (`addEvidence`), compétences (`skills`), jours
  (`dayRefs` + `resolveTrackDays`), exercices (`data/exercises`), backup, recherche,
  surfaces existantes. Aucune duplication par parcours (atteignabilité dérivée).

## 4. Résumé avant → après

| | Avant V18 | Après V18 |
|---|---|---|
| Notions transverses | enseignées (cours, exercices courts, modèles) | **pratiquées** dans des missions réalistes |
| Missions d'ingénierie | inexistantes | **4** (dette/perf/doc/incident) |
| Évaluation de livrables | — | auto / structurelle honnête / revue humaine |
| Preuves de mission | — | via le système de preuves existant, isolées par parcours |
| Glossaire | 283 | **297** (+14) |
| Tests | 567 | **609** (+42) |

## 5. Checkpoints

CP0 audit (sans commit) → CP1 ADR-018 → CP2 modèle → CP3 dette/maintenance →
CP4 performance → CP5 documentation → CP6 incident → CP7 intégration surfaces →
CP8 évaluations/rubrics → CP9 recherche/glossaire/sauvegarde/E2E → CP10 hardening.

## 6. Commits

| CP | Objet | Commit |
|---|---|---|
| CP1 | ADR-018 missions & évaluation honnête | `92f1b29` |
| CP2 | Modèle générique mission & livrable | `e0fefeb` |
| CP3 | Mission dette technique & maintenance | `dc911ee` |
| CP4 | Mission performance, profiling & optimisation | `19713fc` |
| CP5 | Mission documentation technique | `baf8770` |
| CP6 | Mission incident, observabilité & post-mortem | `0c73824` |
| CP7 | Intégration parcours/journées/progression | `9baebb8` |
| CP8 | Évaluations, rubrics & revue honnête | `c363806` |
| CP9 | Recherche, glossaire, sauvegarde & E2E | `d2550c8` |
| CP10 | Hardening, rapport, prompt V19 | *(ce commit)* |

## 7. Missions livrées (4)

| Mission | Catégorie | Jours | Parcours | Livrables |
|---|---|---|---|---|
| `legacy-pricing-maintenance` | debt-maintenance | 69, 85 | 3 | code auto + registre de dette + plan de maintenance + auto-éval |
| `slow-endpoint-optimization` | performance | 80 | 3 | code auto (mesure déterministe) + rapport perf + budget/régression + auto-éval |
| `feature-design-docs` | documentation | 66 | 3 | ADR + HSD + TSD/LLD + exploitation + RFC (opt.) + auto-éval |
| `health-incident-postmortem` | incident | 85 | 3 | code auto (diagnostic) + rapport d'incident + post-mortem + runbook + auto-éval |

## 8. Journées & parcours liés

Missions reliées aux journées V17 (66 documentation, 69 refactoring, 80 performance,
85 durcissement/observabilité) et atteignables depuis les **3 parcours** (dérivé de
`dayRefs` via `resolveTrackDays`, jamais dupliqué). Surfacées sur la vue Jour
(section « Missions d'ingénierie »), la liste `/missions` et le détail `/missions/[id]`.

## 9. Exercices ajoutés (3, + réutilisation V17)

| Exercice | Mission | Particularité |
|---|---|---|
| `debt-legacy-refactor` | dette | starter legacy passant les cas simples ; 1 régression publique (coupon négatif) + 2 privées (arrondi) |
| `perf-pair-count` | performance | mesure DÉTERMINISTE de la complexité (compteur `lookups`, pas de chrono fragile) : O(n²)→O(n) |
| `incident-health-rollup` | incident | reproduit le symptôme (`degraded` avalé) ; tests privés NEUTRES (ne nomment pas la cause) |

Tous : contrat respecté, starter incomplet (échoue ≥ 1 test public utile), tests
privés masqués, référence côté serveur, preuve + compétence à la réussite.

## 10. Modèles documentaires

Référence keep-marked `curriculum/methodology/documentation-technique.md` enrichie
(section « Modèles détaillés pour les missions V18 ») : ADR, HSD (13 sections),
TSD + LLD, runbook, post-mortem sans blâme — gabarits complets copiables, alignés
sur les `docSpec` validés structurellement.

## 11. Rubrics

Chaque critère porte un drapeau **bloquant** et une **catégorie** optionnelle
(functional/quality/maintainability/tests/performance/documentation/security/
tradeoffs). Bilan honnête `missionReview` : taux de **complétion** des livrables
requis (jamais une note de qualité), listes auto-validés / structure valide / **en
attente de revue humaine** / à faire, rappel des critères bloquants.

## 12. Tests

567 → **609** (+42). Nouveaux : `mission` (19, modèle + machine à états +
évaluation), `v18-content` (23, missions/exercices/recherche/backup/glossaire).
`tsc` propre. Gates `v18:check` (catalogue + anti-fuite vue publique),
`v17:check`, `curriculum:check`, `depth-check`, `glossary:check` vertes.

## 13. Validations navigateur (serveur réel)

Matrice **375 / 768 / 1024 / 1440 / 1920 px** sur / , /parcours, /calendar,
/day/69, /lab, /projects, /reviews, /skills, /revisions, /glossary, /settings,
**/missions, /missions/[id]**, /synthese : toutes 200, **aucun débordement
horizontal**, **0 erreur console applicative**. Accessibilité : navigation clavier
(focus reçu), zones de texte intitulées, rendu correct sous `prefers-reduced-motion`.

## 14. E2E (19 étapes)

Foundations → consultation mission → démarrage → artefacts documentaires (structure
validée) → exercice réussi (livrable auto validé) → auto-évaluation (revue
nécessaire) → validation → **preuve** (2 journées liées) + compétence → bascule
Backend → **isolation** vérifiée → retour Foundations (état préservé) → recherche →
glossaire → export → mutation locale → import → **restauration exacte** → arrêt
serveur → suppression workspaces → SHA final `8b043eeb`.

## 15. Performances

TTFB (chaud) : `/` 31 ms, `/glossary` 57 ms (297 entrées), `/day/69` 19 ms,
`/lab` 23 ms, **`/missions` 13 ms, `/missions/[id]` 9,5 ms**, `/synthese` 11 ms —
toutes 200. Le chargement d'une mission et sa validation structurelle sont
instantanés (aucun compilateur, aucun recalcul par rendu).

## 16. Bundles

First Load JS partagé : **103 kB**. `/missions` 106 kB, `/missions/[id]` 109 kB
(aucun compilateur), `/glossary` 106 kB, `/day/[id]` 116 kB, **`/lab/[exerciseId]`
118 kB** (CodeMirror + compilateurs, toujours **lazy** et **isolés au Lab**).
Aucun chunk `app/missions` ne référence CodeMirror. Impact V18 sur le bundle
principal : négligeable.

## 17. Sécurité

Application strictement locale, mono-utilisateur, sans réseau/CDN/auth/SaaS.
Chemins de fichiers de mission validés (rejet du traversal). Contenu utilisateur
borné et clés dangereuses filtrées à la persistance. Aucune protection présentée
comme une isolation OS.

## 18. Anti-fuite

Vue publique des missions (`publicMissionView`) : jamais de `docSpec`,
`requireMentions`, `minLength`, ni exerciseRef interne (seul le lien PUBLIC vers
le lab est exposé). Recherche : uniquement des métadonnées publiques (0 solution,
0 test privé indexé). Build client (`.next/static`) : 0 occurrence de solution
d'exercice ou de test privé. HTML rendu de la mission : aucun attendu caché.

## 19. Sauvegarde / import

Whitelist `validateStrict` étendue : l'état des missions et les livrables de
l'apprenant sont **préservés** au round-trip, bornés et sûrs. Refus des schémas
futurs et des données corrompues. Aucun secret ni test privé dans l'export (les
workspaces exportés sont les fichiers de l'apprenant, déjà allow-listés).

## 20. Limites honnêtes

- **Ce qui est auto-validé** : un livrable de code dont l'exercice lié passe tous
  ses tests (preuve de compétence forte).
- **Ce qui est validé structurellement seulement** : les documents (sections,
  placeholders, taille, mentions) — c'est la FORME, jamais la qualité du fond.
  L'application ne prétend PAS juger un ADR/HSD/TSD/post-mortem sur le fond.
- **Ce qui nécessite une revue humaine** : les livrables `review` (auto-évaluation
  guidée + confirmation) ; une mission avec un livrable review requis ne peut être
  « done » sans cette étape.
- **Notation** : le « score » est un taux de complétion des livrables requis, pas
  une note de qualité. Aucune pseudo-IA de jugement sémantique.
- **Dette assumée** : la mesure de complexité de `perf-pair-count` repose sur un
  compteur `lookups` que l'apprenant renseigne ; un apprenant pourrait en théorie
  le falsifier — le but pédagogique (implémenter en O(n)) et la revue le couvrent.
  La recherche tokenise sur les non-alphanumériques (formes hyphénées trouvées via
  requêtes naturelles). Aucune dette technique nouvelle introduite dans le code.

## 21. Fichiers éditoriaux modifiés

**Uniquement** `curriculum/glossary/glossary.json` (+14 entrées) et
`curriculum/methodology/documentation-technique.md` (modèles détaillés, fichier
keep-marked autorisé). **0 des 365 jours** modifié, **0 changement** de
`data/program.json`.

## 22. Preuve d'absence de dérive hors périmètre

`git diff --name-only a2aa06a..HEAD -- curriculum/ scripts/data/` = glossary.json
+ documentation-technique.md uniquement. Jours modifiés : 0. `program.json` : 0.
Génération répétée idempotente (aucune dérive éditoriale). Gates `v17:check` et
`v18:check` vertes.

## 23. État Git final

Branche `claude/ai-career-os-saas-phfg49`, working tree propre, **local == origin**.

## 24. HEAD final

*Ce commit CP10* (précédent : `d2550c8`).

## 25. local == origin

Oui.

## 26. SHA de progress.json

Initial `8b043eeb337db167` → restauré à **`8b043eeb337db167`** après toutes les
validations (sauvegardé avant les tests mutateurs, restauré exactement après).

## 27. Workspaces / serveurs résiduels

0 workspace, 0 serveur.

## 28. Prompt de reprise V19

> Reprends AI Career OS pour le Sprint **V19**. Commence **impérativement par un
> audit CP0 en lecture seule**, sans rien supposer :
> 1. `git status --short`, branche, `git rev-parse HEAD`, `git log --oneline -15`,
>    comparaison local/origin ;
> 2. SHA de `data/progress.json` (attendu `8b043eeb337db167`) ;
> 3. workspaces/serveurs résiduels (attendus 0/0) ;
> 4. gates : `npm test` (attendu 609 verts), `tsc --noEmit`, `npm run v18:check`,
>    `v17:check`, `curriculum:check`, `depth-check`, `glossary:check`, build ;
> 5. présence de `docs/SPRINT-V18.md` et `docs/ADR-018-engineering-missions.md` ;
> 6. vérifie que V19 n'est pas déjà livré ; si HEAD diffère, inspecte `git log`
>    avant toute écriture.
>
> **État V18 attendu** : 4 missions d'ingénierie (`data/missions/*.json`),
> modèle pur `lib/mission.mjs` + `lib/mission-state.mjs`, état des missions dans
> la progression v3 (champ `missions`), surfaces `/missions` et `/missions/[id]`,
> recherche + sauvegarde des missions, glossaire à 297 entrées.
>
> **Objectif produit V19 — à cadrer par un ADR de périmètre.** Piste recommandée :
> **profondeur et parcours de missions** — enchaîner les missions en un
> *itinéraire* cohérent (dépendances `dependsOn` déjà modélisées mais non
> exploitées), une vue de progression des missions par parcours, et **au moins
> deux missions supplémentaires** (ex. sécurité applicative défensive ; tests
> avancés : property-based, mutation, contract testing) reliées aux journées
> pertinentes. Alternative : approfondir l'évaluation (revue par pairs simulée
> hors-ligne, historique de soumissions exploité, export d'un « dossier de
> preuves »). **Aucune** notation sémantique automatique, **aucun** nouveau
> runtime/IDE, **aucune** refonte graphique, **aucun** réseau/SaaS. Réutiliser
> `lib/mission*.mjs`, la progression v3, les preuves/compétences, la gate
> `v18:check` (l'étendre en `v19` si besoin). Les 3 parcours doivent rester stables.
>
> **Contraintes permanentes** : application locale mono-utilisateur ; une seule
> `progress.json` (sauvegardée avant tests mutateurs, restaurée exactement après) ;
> workspaces supprimés ; serveurs arrêtés ; CodeMirror/compilateurs lazy et limités
> au Lab ; anti-fuite (aucune solution/test privé/attendu caché indexé ou envoyé
> au client) ; validation structurelle jamais présentée comme un jugement de
> qualité ; commits atomiques par checkpoint ; jamais de commit si rien ne change ;
> jamais de contenu déclaré couvert sur la seule base d'un grep ; jamais de
> réécriture d'historique. Terminer par `docs/SPRINT-V19.md` et le prompt V20.
>
> **Discipline de checkpoint** : audit ciblé → conception minimale → implémentation
> → tests → typecheck → validation navigateur réelle si une surface change →
> contrôle des dérives éditoriales → sauvegarde/restauration de `progress.json` →
> nettoyage workspaces → arrêt serveurs → commit atomique → push.
