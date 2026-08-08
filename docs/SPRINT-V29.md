# Sprint V29 — Core Curriculum Hardening + Frontend/React + Data/Software Engineering

Rapport de sprint. Toutes les sections sont en français. Le sprint renforce la
PÉDAGOGIE : élimination de la dette P0 de premier contact, construction d'un corpus
Frontend/React cohérent, approfondissement Data/SQL et Software Engineering, le tout relié
à la pratique existante par `practiceRefs`, sans nouveau moteur ni refonte UI.

## 1. État initial réellement constaté (CP0)
Audit en lecture seule au démarrage : dépôt propre, socle vert. 100 leçons, 190 exercices,
40 missions, 25 playbooks, 610 termes de glossaire, 6 parcours disponibles, 937 tests.
Déséquilibre pédagogique constaté : 5 leçons P0 de premier contact sans rampe ni prérequis
(terminal, git, sql, data-structures, typescript) ; seulement 2 leçons React, sans
practiceRefs, alors que la pratique frontend existe déjà (react-tsx 15, web/DOM 11,
typescript 15) ; SQL sans exercice exécutable ; sujets SE pro dispersés.

## 2. HEAD initial
`dd7fda5` (fin V28), branche `claude/ai-career-os-saas-phfg49`.

## 3. Branche
`claude/ai-career-os-saas-phfg49` (développement et push).

## 4. SHA initial de progress.json
`598f27c2…` (gitignoré, runtime).

## 5. Nombre initial de tests
937 tests verts.

## 6. Compteurs initiaux
Leçons 100 · exercices 190 · missions 40 · playbooks 25 · glossaire 610 · parcours 6.

## 7. Audit pédagogique initial
Matrice P0→P3 (CP0) : dette P0 de premier contact (terminal, git, sql, data-structures,
typescript) ; P1 à fort trafic (React ×2, database-modeling, testing-foundations,
error-handling, design-patterns-intro, architecture-basics). Détail dans
`docs/PEDAGOGICAL-AUDIT-V29.md` (CP11).

## 8. Décisions d'architecture (ADR/HSD/TSD-029)
Réutiliser le moteur d'audit, les runtimes et le catalogue existants (aucun second
moteur). Corriger la dette P0 de façon ADDITIVE. Bâtir le corpus React en RÉUTILISANT la
pratique frontend existante. Data/SQL sans runtime SQL : pratique par raisonnement
relationnel `node-js`. Gate `v29:check` structurel + signaux pédagogiques (densité, jargon
« à froid ») en proxy non bloquant. v26/v27/v28 restent actifs.

## 9. Checkpoints et commits
| CP | Commit | Objet |
|---|---|---|
| CP1 | `4b8d8b4` | ADR/HSD/TSD-029 |
| CP2 | `81038d4` | gate v29:check + plan + registre + tests |
| CP3 | `95ffc98` | dette P0 (5 leçons fondatrices) |
| CP4 | `6dd7ba3` / `595c7ba` | corpus Frontend/React + correctif index |
| CP5 | `114a3df` | Data/SQL (3 nouvelles + database-modeling) |
| CP6 | `ed9b768` | SE/Testing/Architecture (3 nouvelles + 4 durcies) |
| CP7 | `2be3e79` | 5 exercices (trous réels) |
| CP8 | `1a26de0` | 3 playbooks « Que faire dans ce cas ? » |
| CP9 | `79c36ed` | cohérence des parcours + E2E |
| CP10 | *(ce commit)* | glossaire + hardening + validation navigateur + rapport |
| CP11 | *(à venir)* | Pedagogical hardening + audit |

## 10. CP0→CP11
CP0 audit lecture seule → CP1 architecture → CP2 gate/registre → CP3 dette P0 → CP4
Frontend/React → CP5 Data/SQL → CP6 SE → CP7 exercices → CP8 playbooks → CP9 parcours →
CP10 hardening → CP11 audit pédagogique.

## 11. Fichiers majeurs
`scripts/v29-check.mjs`, `docs/architecture/v29-lessons-plan.json`,
`docs/architecture/v29-pedagogy-audit.json`, `docs/architecture/v29-track-coherence.md`,
`docs/ADR-029…`, `docs/HSD-029…`, `docs/TSD-029…`, `docs/PEDAGOGICAL-AUDIT-V29.md` (CP11),
`scripts/data/lessons-map.mjs`, `tests/v29-*.test.mjs`.

## 12. Leçons créées (9)
Frontend & React : `browser-dom-rendering`, `react-composition-architecture`,
`react-accessibility`. Data & SQL : `sql-performance-indexing`,
`database-transactions-concurrency`, `database-migrations`. Software Engineering :
`refactoring-legacy-code`, `technical-debt`, `breaking-changes-compatibility`.

## 13. Leçons historiques corrigées (12)
Socle P0 : `terminal-shell-filesystem`, `git-fundamentals`, `data-structures-intro`,
`typescript-basics`, `sql-foundations`. Frontend : `react-fundamentals`,
`react-hooks-effects`. Data : `database-modeling`. SE : `testing-foundations`,
`error-handling`, `design-patterns-intro`, `architecture-basics`. Correction additive
(on-ramp + prérequis + modèle mental si absent + titres homogénéisés + practiceRefs),
contenu technique conservé.

## 14. Exercices créés (5)
`sql-inner-join`, `db-concurrency-risk`, `migration-compat`, `breaking-change-classify`,
`git-commit-grouping` — tous node-js, contrat vérifié par exécution (starter faux, référence
verte, test privé, aucune fuite).

## 15. Missions / playbooks créés
Aucune nouvelle mission (les 40 existantes couvrent déjà l'espace incident). 3 nouveaux
playbooks « Que faire dans ce cas ? » : `slow-sql-query`, `frontend-regression`,
`breaking-api-change`.

## 16. Termes de glossaire ajoutés
+21 termes réellement enseignés (DOM, JSX, hook, useEffect, rendu déclaratif, lifting state
up, état dérivé, reconciliation React, accessibilité, ARIA, HTML sémantique, jointure, plan
d'exécution, N+1, niveau d'isolation, mise à jour perdue, backfill, dette technique, test de
caractérisation, code legacy, versionnement sémantique). Glossaire 610 → 631.

## 17. Matrice des parcours (CP9)
`docs/architecture/v29-track-coherence.md` : les 6 parcours disponibles restent cohérents
(durée dérivée inchangée) ; fullstack-typescript enrichi côté frontend, backend-engineer
côté Data/SE ; `frontend-engineer-v1` et `data-ml-v1` restent **annoncés** (pas de
greenwashing : connaissance renforcée mais pas de curation jour-par-jour).

## 18. Scores pédagogiques avant/après
Détaillés dans `docs/PEDAGOGICAL-AUDIT-V29.md` (CP11). Objectif : leçons du périmètre au
standard V27/V28 (on-ramp néophyte, prérequis explicites, pratique reliée).

## 19. Tests finaux
949 tests (à confirmer en CP11 après ajout des tests V29). 0 échec.

## 20. Typecheck
`tsc --noEmit` propre (via `next build`).

## 21. Build
`next build` sans erreur.

## 22. Gates
`gates:active` verts (curriculum:check, depth-check, glossary:check, v18, v20:pedagogy, v26,
v27, v28, **v29**).

## 23. Validation navigateur
Chromium pré-installé (aucun `playwright install`). Pages `/lessons`, `/parcours`,
`/glossary` et plusieurs nouvelles leçons (browser-dom-rendering, react-hooks-effects,
react-accessibility, sql-performance-indexing, database-transactions-concurrency,
refactoring-legacy-code, git-fundamentals) : **HTTP 200, aucun débordement horizontal,
aucune erreur console** aux résolutions **375 / 768 / 1024 / 1440 / 1920**. Rendu de la
section « Pratique associée » (practiceRefs) confirmé.

## 24. Performances
Aucun code runtime ajouté (V29 = données/docs/scripts/tests) ; build de production sans
erreur.

## 25. Bundles
Aucun impact bundle (pas de dépendance ni de composant UI ajouté).

## 26. Sécurité / anti-fuite
Aucun secret réel ; aucune fuite de solution/test privé (vérifié par exécution). Les
exercices exposent un starter et des tests publics ; la référence et les tests privés
restent côté serveur.

## 27. Réel vs simulé
La pratique SQL/données est SIMULÉE en JS (raisonnement relationnel), étiquetée comme telle.
Les exercices React sont notés par rendu serveur (réel, préexistant). Aucun SGBD, aucune
exécution SQL réelle. Aucun faux dashboard/metric présenté comme réel.

## 28. Réel / simulé / non testé / limites
Réel : leçons, exercices (exécutés), playbooks, gate, glossaire, validation navigateur.
Simulé : raisonnement relationnel SQL en JS. Non testé : interaction UI pilotée réelle
(soumission d'exercice via l'UI) ; audit a11y automatisé (axe). Limites : audit rétroactif
partiel (P1/P2 hors domaines V29 restent dette).

## 29. Limites honnêtes
Les scores d'audit sont des proxys ; la validation néophyte reste une lecture experte, pas
un test utilisateur. Le corpus React est une fondation solide, pas un cursus frontend
complet jour-par-jour (parcours dédié encore `announced`).

## 30. Dette pédagogique restante P0/P1/P2
Détail en CP11. P1 restants à fort trafic hors périmètre V29 : recursion, async-javascript,
git-advanced, express-backend, api-design-basics, authentication, monitoring-production,
observability-logging, prompt-engineering ; P1/P2 AI/ML et Production ancienne.

## 31. État Git
Branche `claude/ai-career-os-saas-phfg49`, commits atomiques par CP, poussés.

## 32. HEAD final
Renseigné dans la synthèse finale (après CP11).

## 33. local == origin
Vérifié après chaque push.

## 34. Working tree
Propre après chaque commit.

## 35. SHA final de progress.json
`598f27c2…` (inchangé, gitignoré).

## 36. Confirmation données restaurées
`data/program.json` régénéré déterministe (hors `generatedAt`) ; `progress.json` intact.

## 37. Aucun workspace / serveur résiduel
Serveur `next start` de validation arrêté ; aucun workspace résiduel.

## 38. Résumé avant / après
Leçons 100 → **109** ; exercices 190 → **195** ; playbooks 25 → **28** ; glossaire 610 →
**631** ; missions 40 (inchangé) ; parcours 6 disponibles (inchangé). Nouvelle catégorie
« Frontend & React ». Dette P0 de premier contact résorbée (5/5).

## 39. Recommandations V30
Poursuivre le rattrapage des P1/P2 (async-javascript, express-backend, api-design-basics,
authentication, AI/ML historiques) ; approfondir React (routing, data-fetching avancé) et
Data ; envisager la CURATION jour-par-jour des parcours Frontend/Data pour les rendre
disponibles ; troisième vague d'audit rétroactif. (Prompt complet en fin de document, CP11.)

## 40. Prompt complet V30
Ajouté en fin de document au CP11 (ne pas démarrer V30).
