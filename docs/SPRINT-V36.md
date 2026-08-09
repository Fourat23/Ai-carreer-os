# Sprint V36 — Frontend Engineer : Web Platform → React → Production

Rapport de sprint (français), factuel, sans langage promotionnel. Macro-sprint structurant :
reconstruire le socle Frontend en une discipline pédagogique cohérente (plateforme web → React →
application → tests/perf), puis activer le parcours `frontend-engineer-v1` sur preuve. Aucun second
moteur, aucun jour créé, une seule source de vérité.

## État Git
Branche `claude/ai-career-os-saas-phfg49`. HEAD de départ V36 : `1a15d7d`. Commits CP1→CP11
atomiques (CP3/CP6 = NO_COMMIT évités car chaque CP a produit du contenu réel), poussés au fil de
l'eau. local == origin, arbre propre, 0 serveur résiduel. `progress.json` gitignoré, inchangé au blob
baseline `323604021055588a9528a86875f36598dbdc7758`.

## Ce qui existait déjà (réutilisé, pas recréé)
React (3 leçons + accessibilité, 15 exercices `react-tsx`, jours 87-112), le DOM
(browser-dom-rendering, 11 exercices `web`), JS/TS/HTTP (leçons + exercices), testing-foundations, le
mécanisme de composition de parcours **non contigu**, le mécanisme d'ajout de leçons
(`lessons-map.mjs`), le Curriculum Graph, la rubrique d'audit v20, les runtimes `web`/`react-tsx`.
V36 a **relié, durci et étendu** cet existant.

## Ce qui a été réellement créé
- **9 leçons** : html-semantic-structure, css-fundamentals, css-layout-flexbox-grid, responsive-design,
  web-forms-validation, typescript-frontend, react-application-states, frontend-testing,
  frontend-performance.
- **2 exercices** exécutables : ts-frontend-guard (garde de type sur `unknown`), react-reducer-actions
  (reducer pur).
- **1 mission** intégratrice : frontend-accessible-search.
- **1 playbook** : frontend-infinite-render (boucle useEffect).
- **1 gate** : v36:check (+ plan + registre + tests) ; **1 parcours activé** : frontend-engineer-v1.
- **Docs** : ADR/HSD/TSD-036, PEDAGOGICAL-AUDIT-V36, SPRINT-V36.

## Ce qui a été réellement amélioré
- **browser-dom-rendering** durcie : sous-section propagation/délégation (bubbling, `event.target`,
  `closest`) — manque total comblé.
- **react-fundamentals** durcie : déconstruction de « l'état est un instantané » (setState non
  immédiat, forme updater) — la misconception n°1 des débutants React.
- **CAT_ORDER** de `/lessons` enrichi (catégorie « Frontend : Web Platform » avant « Frontend & React »).
- **gate v36** : l'attribut HTML `placeholder` (minuscule) n'est plus confondu avec un marqueur
  d'authoring (seul `PLACEHOLDER` majuscule l'est).

## Ce qui n'a volontairement pas été créé
- **Next.js** : reporté V37 (le socle fondamental prime ; ne pas transformer V36 en cours Next.js).
- **Aucune nouvelle leçon React** hormis react-application-states (React était déjà couvert).
- **Aucun jour** créé (le programme 365 j reste la source ; le socle visuel vit dans les leçons).
- **Aucun second moteur** de leçons/exercices/parcours.

## Couverture Frontend avant → après
Plateforme web visuelle : **0 → 4 leçons** (HTML, CSS, layout, responsive). Ponts : **+2** (formulaires,
TS front). Application/qualité : **+3** (états d'application, tests, performance). React : **durci**
(instantané d'état) ; DOM : **durci** (propagation). Next.js : reste **absent** (V37).

## Chiffres avant → après (CP0 réel → fin V36)
| Indicateur | Avant (1a15d7d) | Après |
|---|---|---|
| Leçons | 110 | **119** (+9) |
| Exercices | 223 | **225** (+2) |
| Missions | 40 | **41** (+1) |
| Playbooks | 40 | **41** (+1) |
| Glossaire | 705 | 705 (inchangé) |
| Parcours disponibles | 7 | **8** (frontend-engineer-v1 activé) |
| Parcours annoncés | 2 | **1** (ai-fullstack-v1) |
| Gates actives | 15 | **16** |
| Tests | 1043 | **1058** |
| Curriculum Graph | 0 bloquant / 7 warn | 0 bloquant / 7 warn |

## Scores pédagogiques avant → après
Le socle Web Platform passe d'**inexistant** à **présent et franchissable** (moyenne du périmètre
**3,67/4**, cible ≥ 3,6 atteinte ; aucune dimension < 3 ; dimensions dures ≥ 3). Détail dans
`docs/PEDAGOGICAL-AUDIT-V36.md`.

## Résultat du beginner walkthrough
Chaîne de prérequis **acyclique**, sans saut : `javascript-basics → browser-dom-rendering →
html-semantic-structure → css-fundamentals → css-layout-flexbox-grid → responsive-design` (socle
visuel) et `… → react-fundamentals → react-hooks-effects → react-composition-architecture →
react-application-states` (application). Un néophyte part de « un site s'affiche » et arrive à
« structurer, mettre en page, rendre responsive, typer les données d'API, construire/tester/diagnostiquer
une application React ». Aucun jargon prématuré ni prérequis caché détecté sur cette chaîne.

## Réel / simulé / non testé
- **RÉEL** : exécution des 2 nouveaux exercices (référence verte, starter en échec) ; validation
  navigateur Playwright (12 pages × 5 largeurs → 60/60, overflow ≤ 2px, 0 erreur console).
- **SIMULÉ** : notation `web`/`react-tsx` par modèle DOM déterministe (`react-dom/server`) — pas de
  vrai navigateur ni d'interaction clavier pilotée.
- **NON TESTÉ** : accessibilité clavier réelle, Core Web Vitals réels, performance de rendu réelle —
  non déclarés testés.

## Validations réellement réalisées
`node --test` → **1058/1058** ; `tsc --noEmit` → **0** ; `npm run build` → OK ; `gates:active` →
**16/16** ; génération déterministe (idempotente au timestamp près) ; Curriculum Graph 0 bloquant ;
validation navigateur 60/60 ; ledger validé.

## Dette restante
- **P3** : Next.js (V37) ; glossaire central à enrichir en termes Web Platform (présents dans les
  Vocabulaires des leçons) ; rétention/évaluation à 3 sur plusieurs leçons (quiz de prédiction/
  diagnostic) ; socle visuel en leçons, pas en jours dédiés (aucun jour créé — assumé).
- **P2** : 7 warnings graphe (dépendances conceptuelles légitimes), 0 bloquant.

## Verdict critique du sprint

Barème : FAIBLE · MOYEN · BON · FORT · STRUCTURANT.

| Axe | Note | Justification |
|---|---|---|
| Qualité pédagogique | FORT | 11 leçons au standard, moyenne 3,67, misconceptions déconstruites, walkthrough sans saut. |
| Couverture Frontend | STRUCTURANT | Le socle web visuel passe de 0 à une colonne complète HTML→CSS→layout→responsive→React→app. |
| Cohérence du curriculum | FORT | Prérequis acycliques remontant aux fondations ; parcours activé sur preuve, distinct. |
| Réutilisation vs création | FORT | React/DOM/tests réutilisés ; création ciblée sur trous confirmés ; 0 second moteur, 0 jour. |
| Honnêteté / anti-greenwashing | FORT | Frontière réel/simulé explicite ; autonomous-practice=3 assumé ; Next.js reporté ouvertement. |
| Preuves & tests | FORT | 1058 tests, tsc 0, 16 gates, exécution réelle des exercices, 60/60 navigateur. |
| Finition | BON | Overflow ≤ 2px partout ; pas d'audit ARIA/clavier réel ni glossaire enrichi. |

**VERDICT : STRUCTURANT.** V36 transforme le Frontend d'« un domaine où traînent quelques leçons
React » en « une véritable colonne pédagogique allant des mécanismes du Web jusqu'à la construction,
au test et au diagnostic d'une application React », franchissable par un débutant, et rend
`frontend-engineer-v1` disponible sur preuve. Le sprint ne gonfle aucun compteur (9 leçons justifiées
concept par concept, React non dupliqué), reporte honnêtement Next.js, et documente sa dette. Le
qualificatif STRUCTURANT est mérité par l'ampleur de la couverture nouvelle, tempéré par une finition
« BON » (accessibilité clavier réelle et glossaire non traités).

---

## Prompt de reprise V37
Voir ci-dessous. **Ne pas démarrer V37 dans cette session.**

---

# Prompt de lancement — Sprint V37 (à démarrer PLUS TARD, PAS maintenant)

> Ce prompt clôt V36. **Ne démarre pas V37 dans cette session.** Rédigé pour être collé tel quel au
> lancement du sprint suivant. Le thème est DÉRIVÉ de l'audit V36 : Next.js reporté + finition
> accessibilité/évaluation + enrichissement glossaire.

Reprends **AI Career OS** pour le **Sprint V37 — « Frontend Production : Next.js foundations +
accessibilité clavier réelle + évaluations & glossaire Web Platform »**.

**IMPORTANT — travaille sur l'état RÉEL du dépôt.** Ne suppose jamais que ce résumé V36 correspond
encore au repository. Commence par un **CP0 strictement en lecture seule** : audite l'état réel (git,
tests, build, gates, leçons, exercices, missions, playbooks, glossaire, parcours, Curriculum Graph,
serveurs résiduels, baseline progress.json, couverture Next.js/accessibilité/évaluations) et présente
un **rapport d'audit CP0 en français AVANT toute implémentation**. Si V37 est déjà (partiellement)
livré, NE RECOMMENCE RIEN.

**Langue** : rapports, audits, synthèses et prompt V38 final en **français**.

**Priorité (inchangée)** : pédagogie > cohérence du curriculum > compréhension néophyte > pratique >
transfert professionnel > évaluation > features > UI. L'audit CP0 fait foi.

**État attendu (à VÉRIFIER)** : branche `claude/ai-career-os-saas-phfg49`, HEAD final V36, ~119
leçons, ~225 exercices, 41 missions, 41 playbooks, ~705 glossaire, 16 gates, ~1058 tests, 8 parcours
disponibles (dont frontend-engineer-v1), 1 annoncé (ai-fullstack-v1). Curriculum Graph : ~7 warnings,
0 bloquant.

**Objectif central V37 — fondations Next.js (reportées de V36), SI le socle le justifie :**
Sur preuve, créer un petit nombre de leçons Next.js P3 **franchissables** couvrant uniquement les
fondamentaux : pourquoi un framework ; routing par fichiers ; rendu serveur/client au niveau
conceptuel ; frontière client/serveur ; chargement de données ; production. Ne PAS transformer V37 en
cours Next.js exhaustif. Relier une pratique déterministe existante ou en créer une **ciblée**
(raisonnement, jamais un faux serveur/navigateur). Si l'ajout dégrade la qualité du reste : documenter
et réduire le périmètre.

**Objectif secondaire V37 — finition accessibilité & évaluations :**
- Accessibilité : renforcer la couverture au-delà du conceptuel — si un outil de pilotage clavier réel
  (Playwright) est réellement disponible, l'utiliser pour VALIDER la navigation clavier de surfaces
  clés (et ne déclarer testé QUE ce qui est réellement piloté). Sinon, documenter honnêtement.
- Évaluations : relever rétention/évaluation des leçons Web Platform (3 → 4) via des quiz de PRÉDICTION
  et de DIAGNOSTIC (pas de la mémorisation), et/ou des exercices de type « prédire/corriger ».

**Objectif tertiaire V37 — glossaire Web Platform :** auditer les 705 termes et AJOUTER uniquement les
termes réellement manquants et utiles (cascade, spécificité, box model, Flexbox, Grid, media query,
viewport, hydration, reconciliation, controlled/uncontrolled, code splitting, Core Web Vitals…), sans
doublon d'alias.

**Contraintes (inchangées)** : local, mono-utilisateur, sans auth/SaaS/réseau, sans dépendance lourde,
sans faux runtime (ni ML, ni navigateur/serveur simulé côté contenu), sans second moteur/base.
Réutiliser le Curriculum Graph, le mécanisme de composition non contigu et le mécanisme d'ajout de
leçons. `progress.json` sauvegardé puis restauré (gitignoré, jamais commité). Aucun secret, aucune
fuite de solution/test privé.

**Gates** : garder `v26→v36:check` actifs. Nouveau contrat → `v37:check` ciblé et testé. Attention aux
faux positifs du scan d'authoring.

**Checkpoints** CP0→CP11 (audit → design ADR/HSD/TSD-037 → implémentation → tests → tsc → build →
validation navigateur → restauration progress → cleanup → commit → push), un commit par CP réellement
terminé, **pas de commit vide** (NO_COMMIT explicite si un CP ne change rien). CP11 obligatoire :
ré-audit + walkthrough néophyte + matrice P0→P3 dans `docs/PEDAGOGICAL-AUDIT-V37.md` + évolution
chiffrée des warnings + évaluation du sprint (FAIBLE/MOYEN/BON/FORT/STRUCTURANT + VERDICT) + prompt V38
(sans démarrer).

**Critères de refus** : remplissage, jargon non introduit, fausse profondeur, gonflage de scores,
longueur = qualité, faux serveur/navigateur, greenwashing, contenu créé sans besoin réel.

**Livrable final** : `docs/SPRINT-V37.md` + synthèse française (existant / créé / amélioré / non créé /
testé / simulé / non testé / insuffisant), chiffres avant/après, dette restante, HEAD final.

**Commence maintenant par CP0. N'implémente rien avant d'avoir présenté le rapport CP0.**
