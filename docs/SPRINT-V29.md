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
| CP10 | `9e85504` | glossaire + hardening + validation navigateur + rapport |
| CP11 | *(ce commit)* | Pedagogical hardening + audit + prompt V30 |

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

## 18. Scores pédagogiques avant/après (CP11)
`docs/PEDAGOGICAL-AUDIT-V29.md` : registre de 21 items (9 nouvelles + 12 corrigées),
moyenne globale **3,527**, tous ≥ seuil récent 3,25, planchers respectés. 12 leçons
historiques passent de P0/P1 à P3. Avant/après, matrice complète, échantillon d'historiques
non modifiées et walkthroughs néophyte (frontend + backend) y sont détaillés.

## 19. Tests finaux
**949 tests**, 0 échec (dont v29-pedagogy 4, v29-exercises 3, v29-e2e 5).

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
Le HEAD final (commit CP11) et l'état Git sont confirmés dans la synthèse finale affichée à
la fin du sprint. Branche `claude/ai-career-os-saas-phfg49`, local == origin, working tree
propre, aucun serveur/workspace résiduel, `progress.json` intact (SHA `598f27c2…`).

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
Voir ci-dessous. **Ne pas démarrer V30 dans cette session.**

---

# Prompt de lancement — Sprint V30 (à démarrer PLUS TARD, PAS maintenant)

> Ce prompt clôt V29. **Ne démarre pas V30 dans cette session.** Rédigé pour être collé tel
> quel au lancement du sprint suivant.

Reprends **AI Career OS** pour le **Sprint V30 — « Data/Software Engineering & Frontend
Practice Expansion + troisième vague de Pedagogical Hardening »**.

**IMPORTANT — travaille sur l'état RÉEL du dépôt.** Ne suppose jamais que ce résumé V29
correspond encore exactement au repository. Commence par un **CP0 strictement en lecture
seule** : audite l'état réel (git, tests, build, gates, leçons, exercices, missions,
playbooks, glossaire, parcours) et présente un **rapport d'audit CP0 en français AVANT
d'implémenter quoi que ce soit**.

**Langue** : tous les rapports, audits, synthèses et le prompt V31 final en **français**.

**Ordre de priorité (inchangé)** : PÉDAGOGIE > COHÉRENCE DES PARCOURS > PRATIQUE > QUALITÉ
LOGICIELLE > FEATURES > UI/UX. *Ne privilégie jamais la quantité à la qualité. Une excellente
leçon vaut mieux que cinq superficielles.* Pas de refonte UI/UX globale. Le projet doit
enseigner à un NÉOPHYTE COMPLET sans sacrifier la profondeur professionnelle.

**Critère néophyte complet** (juge suprême) : « une personne qui ne connaît pas encore la
technologie peut-elle comprendre POURQUOI le concept existe, se construire un modèle mental
correct, puis l'appliquer sans recopier aveuglément ? » Toujours : situation → intuition →
vocabulaire → mécanisme → pratique.

**État attendu (à VÉRIFIER, pas à supposer)** : HEAD final V29, branche
`claude/ai-career-os-saas-phfg49`, ~109 leçons, ~195 exercices, 40 missions, ~28 playbooks,
~631 termes de glossaire, 6 parcours disponibles + 3 annoncés, ~949 tests. V29 a résorbé la
dette P0 de premier contact (terminal, git, sql, data-structures, typescript), créé le corpus
Frontend/React (browser-dom-rendering → react-* → react-accessibility), approfondi Data/SQL
(index/plans, transactions/concurrence, migrations) et SE (refactoring/legacy, dette
technique, changements cassants). Gate `v29:check` actif. Moteur d'audit `lib/pedagogy-audit.mjs`.

**Objectifs V30 (par ordre, à confirmer par l'audit CP0) :**

- **(A) Troisième vague de hardening rétroactif.** Attaquer les **P0 restants** identifiés
  dans `docs/PEDAGOGICAL-AUDIT-V29.md` : `api-design-basics`, et les fondations IA/ML de
  premier contact (`llm-fundamentals`, `agents-fundamentals`, `ai-security`,
  `statistics-for-ml`, `machine-learning-basics`). Même patron ADDITIF (rampe « Le problème
  d'abord » + « Prérequis » rédigés + « Modèle mental » si absent + `practiceRefs` vers des
  artefacts EXISTANTS), contenu technique conservé.

- **(B) Rattrapage des P1 à fort trafic**, par lots cohérents (un domaine à la fois) :
  d'abord Web/back (`express-backend`, `authentication`, `caching-performance`,
  `async-javascript`), puis Data (`pandas-data-wrangling`, `data-cleaning-quality`,
  `etl-pipelines`), puis un lot IA appliquée (`prompt-engineering`, `embeddings`, `rag-*`).

- **(C) Expansion de la pratique Frontend/Data.** Approfondir React (routing, data-fetching
  avancé, formulaires complexes/validation) et Data si l'audit révèle des trous, en
  RÉUTILISANT les runtimes existants (react-tsx, web, node-js) ; créer de nouveaux exercices
  UNIQUEMENT pour des trous réels (aucune duplication des ~195 existants).

- **(D) Curation possible d'un parcours Frontend ou Data.** N'activer `frontend-engineer-v1`
  ou `data-ml-v1` (aujourd'hui `announced`) que si corpus + pratique + progression + durée
  crédible + audit le justifient (curation jour-par-jour via modules → `dayRefs`, projet fil
  rouge). Sinon les laisser `announced` — **jamais de greenwashing pédagogique** (pas de
  `totalDays: 0` promu).

**Contraintes d'architecture (inchangées)** : local, mono-utilisateur, sans auth, sans SaaS,
sans réseau requis. Pas de second moteur / catalogue / curriculum / runtime. `progress.json`
sauvegardé puis restauré (gitignoré, jamais committé). Aucun secret réel, aucune fuite de
solution/test privé. Pas de librairie UI, pas de refonte UI globale, aucun changement
parasite. Distinguer toujours RÉEL / SIMULÉ / NON TESTÉ.

**Gates** : garder `v26/v27/v28/v29:check` **actifs** (périmètres vivants distincts). Si V30
introduit un nouveau contrat structurel, ajouter un `v30:check` ciblé et **le tester**.
Attention aux FAUX POSITIFS du scan d'authoring (`à compléter`, `TODO`, `XXX`/`useXxx`) dans
la prose des leçons — reformuler la prose, ne pas affaiblir le gate.

**Checkpoints atomiques** CP0→CP11 (audit → design ADR/HSD/TSD → implémentation → tests →
tsc → build → validation → restauration progress.json → cleanup → commit → push), un commit
par CP.

**CP11 (obligatoire)** : ré-audit (A) nouvelles leçons V30, (B) historiques modifiées
(avant/après), (C) échantillon d'historiques NON modifiées de plusieurs époques, (D)
walkthrough néophyte d'au moins deux séquences complètes ; mettre à jour la matrice P0→P3
dans `docs/PEDAGOGICAL-AUDIT-V30.md` ; append du **prompt V31** à la fin de `SPRINT-V30.md`
**sans démarrer V31**.

**Critères de refus** : contenu de remplissage, généralités, jargon non introduit, fausse
profondeur, gonflage de scores, longueur prise pour de la qualité, pattern/leçon sans besoin
réel.

**Livrable final** : `docs/SPRINT-V30.md` (rapport complet, 40 points) + synthèse française
distinguant ce qui **existait / a été ajouté / corrigé / testé / non testé / simulé /
insuffisant**, avec chiffres avant/après, dette restante P0/P1/P2, HEAD final et état Git.

**Commence maintenant par CP0. N'implémente absolument rien avant d'avoir présenté le rapport
d'audit CP0.**
