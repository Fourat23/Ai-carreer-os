# Sprint V37 — Frontend Engineer II : Web Platform Mastery → Accessibilité → React Production → Next.js Foundations

Rapport de sprint (français), factuel, sans langage promotionnel. Macro-sprint d'APPROFONDISSEMENT :
transformer la conformité structurelle V36 en maîtrise réelle, rendre le socle Web atteignable depuis
le parcours, et poser des fondations Next.js honnêtes. Aucun second moteur, aucun jour créé, une seule
source de vérité.

## 1. État Git final
Branche `claude/ai-career-os-saas-phfg49`. HEAD de départ V37 : `5f7bdf1`. Commits CP1→CP12 atomiques
(CP6 = NO_COMMIT assumé — React déjà sain), poussés au fil de l'eau. local == origin, arbre propre,
0 serveur résiduel. `progress.json` gitignoré, inchangé au blob baseline
`323604021055588a9528a86875f36598dbdc7758`.

## 2. Ce qui existait déjà
Socle Web Platform V36 (HTML, CSS, layout, responsive, formulaires, TS front), chaîne React (fondations
→ application), tests/performance, parcours frontend-engineer-v1 (activé en V36), mécanisme de
composition non contiguë, mécanisme d'ajout de leçons, Curriculum Graph, rubrique v20, runtimes
`web`/`react-tsx`/`node-js`, 26+ exercices frontend.

## 3. Ce qui a été réellement créé
- **2 leçons** issues du split : css-flexbox (1D approfondi), css-grid (2D approfondi).
- **4 leçons** Next.js : nextjs-foundations, nextjs-rendering, nextjs-server-client-components,
  nextjs-data-production (conceptuelles).
- **6 exercices** déterministes : css-specificity-order, css-box-size, dom-event-delegation,
  a11y-accessible-name, frontend-rendering-choice, frontend-layout-choice.
- **1 mission** capstone de diagnostic : frontend-capstone-diagnose.
- **1 gate** : v37:check (+ plan + registre + tests) ; docs ADR/HSD/TSD-037, PEDAGOGICAL-AUDIT-V37.

## 4. Ce qui a été réellement amélioré
- **css-fundamentals** durcie : flux normal, display, positionnement, overflow.
- **react-accessibility** durcie : tabindex, gestion du focus (modales), prefers-reduced-motion,
  modèle lecteur d'écran ; ARIA jamais substitut au HTML natif.
- **frontend-testing** durcie : tests asynchrones, tests instables (flaky), régression après merge +
  test de non-régression (playbooks).
- **Parcours** : socle Web rendu atteignable via `lessonRefs` par module, affiché sur /parcours.
- **Gate** : `placeholder` (attribut HTML) n'est plus confondu avec un marqueur d'authoring.

## 5. Ce qui a été réutilisé
Les 26+ exercices frontend, les runtimes existants, le mécanisme de composition non contiguë, le
mécanisme d'ajout de leçons, les playbooks frontend-regression/feature-regression, le Curriculum
Graph et la rubrique d'audit. Création uniquement sur trous confirmés.

## 6. Décisions pédagogiques importantes
- **Split** css-layout → css-flexbox + css-grid : justifié par la DENSITÉ conceptuelle (deux systèmes),
  pas la taille. L'ancienne leçon est supprimée (pas de doublon).
- **NO_COMMIT CP6** : React couvrait déjà tous les anti-patterns visés → pas de réécriture de contenu
  sain.
- **Next.js au niveau fondations** : concepts avant syntaxe, séparation explicite stable/évolutif,
  aucune exécution réelle prétendue.
- **Reachability** additive (lessonRefs) plutôt que création de jours HTML/CSS.

## 7. Ordre final du parcours Frontend
`javascript → browser-dom-rendering → html-semantic-structure → css-fundamentals → css-flexbox →
css-grid → responsive-design → (web-forms-validation, typescript-frontend) → react-fundamentals →
react-hooks-effects → react-composition-architecture → react-application-states → react-accessibility
→ frontend-testing → frontend-performance → nextjs-*`. Chaîne acyclique remontant aux fondations.

## 8. Leçons splittées et pourquoi
css-layout-flexbox-grid → **css-flexbox** + **css-grid**. Motif : une seule leçon survolait deux
systèmes distincts (ni flex-grow/shrink/basis, ni grid-template-areas/grille implicite). Le split
donne à chacun la profondeur nécessaire (depth 3 → 4).

## 9. Pratiques ajoutées et concept réellement évalué
| Exercice | Concept évalué (exécuté) |
|---|---|
| css-specificity-order | arbitrage de la cascade (id>classe>type, ordre) |
| css-box-size | largeur réelle selon box-sizing |
| dom-event-delegation | remontée + closest (délégation) |
| a11y-accessible-name | précédence du nom accessible (aria-label>alt>texte) |
| frontend-rendering-choice | décision CSR/SSR/SSG (transfert) |
| frontend-layout-choice | décision Flexbox/Grid (transfert) |

Tous vérifiés par exécution : référence 100 % verte, starter échoue ≥1 test public.

## 10. Next.js réellement couvert
Fondations CONCEPTUELLES uniquement : pourquoi un framework + routing par fichiers ; CSR/SSR/SSG/
streaming (niveau conceptuel) ; Server vs Client Components (modèle mental) ; données/cache/
revalidation, 4 états, variables d'environnement, déploiement conceptuel. **Non couvert (assumé, V38)** :
API concrètes, streaming détaillé, actions serveur, cas avancés. **Aucune exécution Next.js réelle.**

## 11. Accessibilité réellement testée
- Contenu : react-accessibility approfondie (clavier, tabindex, focus/modales, reduced-motion).
- RÉEL : navigation clavier PILOTÉE sur /parcours (6 Tab → 6 éléments focusables : liens + bouton).
- NON testé : audit lecteur d'écran réel, focus-trap réel des modales, reduced-motion réel — non
  déclarés testés.

## 12. Parcours avant → après
frontend-engineer-v1 reste disponible ; il gagne le **rattachement des leçons** (lessonRefs par module)
qui rend le socle Web suivable depuis /parcours. 8 parcours disponibles, 1 annoncé (inchangé).

## 13. Tests / gates / build
`node --test` → **1070/1070** ; `tsc --noEmit` → **0** ; `npm run build` → OK ; `gates:active` →
**17/17** ; génération déterministe (idempotente au timestamp près).

## 14. Curriculum Graph avant → après
0 bloquant / 7 warnings → **0 bloquant / 7 warnings** (inchangé ; les splits et Next.js ajoutent des
prérequis acycliques sans nouveau warning).

## 15. Validation navigateur
13 pages × 5 largeurs (375/768/1024/1440/1920) → **65/65**, statut < 400, 0 erreur console, overflow
≤ 2px. + navigation clavier réelle pilotée sur /parcours.

## 16. Ce qui est réel
Exécution des 6 nouveaux exercices ; validation navigateur 65/65 ; navigation clavier /parcours ;
tests/tsc/build/gates.

## 17. Ce qui est simulé
Notation `web`/`react-tsx` par modèle DOM déterministe (pas de vrai navigateur) ; contenu Next.js
conceptuel (aucune exécution Next.js).

## 18. Ce qui n'a pas été testé
Audit lecteur d'écran réel, focus-trap réel des modales, `prefers-reduced-motion` réel, Core Web
Vitals réels, exécution Next.js — non déclarés testés.

## 19. Ce qui reste insuffisant
Next.js avancé (fondations seulement) ; évaluations à généraliser (quiz de prédiction/diagnostic,
evaluation à 3) ; glossaire central non enrichi des termes Web/Next.js ; validation clavier limitée à
/parcours ; audit lecteur d'écran non réalisé.

## 20. Dette V38
Backend Engineer II / System Design / API production (parallèle à ce que V36-V37 ont fait pour le
frontend) ; finition frontend P3 (glossaire, évaluations de prédiction/diagnostic, Next.js avancé) ;
seconde vague de hardening historique si l'audit le montre.

## 21. Chiffres avant → après
| Indicateur | Avant (5f7bdf1) | Après |
|---|---|---|
| Leçons | 119 | **124** (−1 split, +2 css, +4 next.js) |
| Exercices | 225 | **231** (+6) |
| Missions | 41 | **42** (+1) |
| Playbooks | 41 | 41 |
| Glossaire | 705 | 705 |
| Parcours disponibles / annoncés | 8 / 1 | 8 / 1 |
| Gates actives | 16 | **17** |
| Tests | 1058 | **1070** |
| Curriculum Graph | 0 bloquant / 7 warn | 0 bloquant / 7 warn |
| Moyenne pédagogique du périmètre | — | **3,70/4** |

## Verdict critique du sprint

Barème : EXCELLENT · FORT · BON · INSUFFISANT.

| Axe | Verdict | Justification |
|---|---|---|
| Pédagogie | FORT | 9 leçons au standard, moyenne 3,70, misconceptions déconstruites, walkthrough sans saut. |
| Profondeur académique | FORT | Flexbox/Grid approfondis, CSS complété (flux/positionnement), tests/a11y durcis ; Next.js volontairement au niveau fondations. |
| Accessibilité néophyte | EXCELLENT | Chaque leçon part d'un problème concret ; chaîne acyclique atteignant les fondations. |
| Pratique | BON | +6 exercices exécutés et reliés, mais notés par modèle déterministe (pas de navigateur réel) ; Next.js réflexif. |
| Transfert | FORT | Exercices de CHOIX (rendu, layout) sur cas nouveaux + capstone de diagnostic transversal. |
| Cohérence parcours | FORT | Socle Web désormais atteignable depuis /parcours (lessonRefs). |
| Frontend technique | FORT | Couverture Web→React→Next.js cohérente et approfondie. |
| Accessibilité Web | BON | Contenu concret (focus/tabindex/reduced-motion) ; validation clavier réelle limitée à /parcours, pas d'audit lecteur d'écran. |
| Next.js | BON | Fondations conceptuelles solides et honnêtes ; avancé reporté (assumé). |
| Preuves / tests | FORT | 1070 tests, tsc 0, 17 gates, exécution réelle des exercices, 65/65 navigateur, clavier piloté. |

**VERDICT GLOBAL : FORT.** V37 transforme le socle Frontend V36 (structurellement conforme) en un
ensemble RÉELLEMENT approfondi et suivable : Flexbox/Grid enfin traités en profondeur, CSS complété,
accessibilité rendue concrète, tests durcis, socle Web atteignable depuis le parcours, et fondations
Next.js honnêtes (concepts avant syntaxe, aucune exécution prétendue). Le sprint ne gonfle aucun
compteur (splits et Next.js justifiés concept par concept, React non réécrit), reporte ouvertement le
Next.js avancé et l'audit lecteur d'écran, et documente sa dette. Il n'atteint pas « EXCELLENT »
global car la pratique reste notée par modèle déterministe, les évaluations de prédiction/diagnostic ne
sont pas généralisées, et l'accessibilité réelle n'est validée que partiellement.

---

## Prompt de reprise V38
Voir ci-dessous. **Ne pas démarrer V38 dans cette session.**

---

# Prompt de lancement — Sprint V38 (à démarrer PLUS TARD, PAS maintenant)

> Ce prompt clôt V37. **Ne démarre pas V38 dans cette session.** Rédigé pour être collé tel quel au
> lancement du sprint suivant. Thème DÉRIVÉ de l'audit V37 : approfondir le Backend / System Design
> (comme V36-V37 l'ont fait pour le Frontend) + finition frontend P3.

Reprends **AI Career OS** pour le **Sprint V38 — « Backend Engineer II : API production, données &
System Design + finition Frontend (évaluations, glossaire, Next.js avancé) »**.

**IMPORTANT — travaille sur l'état RÉEL du dépôt.** Commence par un **CP0 strictement en lecture
seule** : audite l'état réel (git, tests, build, gates, leçons, exercices, missions, playbooks,
glossaire, parcours, Curriculum Graph, serveurs résiduels, baseline progress.json, couverture
backend/API/données/system-design) et présente un **rapport d'audit CP0 en français AVANT toute
implémentation**. Si V38 est déjà (partiellement) livré, NE RECOMMENCE RIEN. L'AUDIT FAIT FOI.

**Langue** : rapports, audits, synthèses et prompt V39 final en **français**.

**Priorité (inchangée)** : pédagogie > cohérence du curriculum > compréhension néophyte > pratique >
transfert professionnel > évaluation > features > UI.

**État attendu (à VÉRIFIER)** : branche `claude/ai-career-os-saas-phfg49`, HEAD final V37, ~124
leçons, ~231 exercices, 42 missions, 41 playbooks, ~705 glossaire, 17 gates, ~1070 tests, 8 parcours
disponibles, 1 annoncé. Curriculum Graph : ~7 warnings, 0 bloquant.

**Objectif central V38 — approfondir le Backend / System Design SUR PREUVE :**
Auditer en profondeur le parcours backend-engineer-v1 et les leçons associées (HTTP/REST, API design,
Express, SQL/modélisation/transactions/index, auth, architecture, observabilité, cache). Comme pour
le frontend : distinguer « une leçon existe » de « le concept est maîtrisable ». Approfondir/splitter
UNIQUEMENT sur trous prouvés, et compléter le raisonnement de conception de systèmes (exigences →
estimation d'ordre de grandeur → schéma → arbitrages → goulots → évolutivité/résilience), en
réutilisant system-design-interview et les playbooks existants. Aucune création sans besoin réel.

**Objectif secondaire V38 — pratique & évaluations backend :** exercices déterministes de raisonnement
(conception d'API, choix d'index, arbitrage de cohérence/latence, diagnostic N+1, idempotence,
pagination) sur trous confirmés ; introduire des évaluations de PRÉDICTION/DIAGNOSTIC (au-delà de la
vérification de compréhension) — ce qui manquait aussi côté frontend.

**Objectif tertiaire V38 — finition Frontend (dette V37) :** enrichir le glossaire central des termes
Web Platform/Next.js réellement manquants (cascade, spécificité, box model, Flexbox, Grid, media
query, viewport, hydration, CSR/SSR/SSG, Core Web Vitals…), sans doublon d'alias ; ajouter quelques
quiz/exercices de prédiction pour relever rétention/évaluation des leçons frontend ; approfondir
Next.js seulement si le socle backend n'en souffre pas (sinon reporter).

**Contraintes (inchangées)** : local, mono-utilisateur, sans auth/SaaS/réseau, sans dépendance lourde,
sans faux runtime (ni ML, ni navigateur/serveur/Next.js simulé côté contenu), sans second moteur/base.
Réutiliser Curriculum Graph, composition non contiguë, mécanisme d'ajout de leçons. `progress.json`
sauvegardé puis restauré (gitignoré, jamais commité). Aucun secret, aucune fuite de solution/test.

**Gates** : garder `v26→v37:check` actifs. Nouveau contrat → `v38:check` ciblé et testé.

**Checkpoints** CP0→CP12 (audit → design ADR/HSD/TSD-038 → gate → approfondissements backend →
pratique/évaluations → system design → finition frontend/glossaire → intégration parcours →
capstone → walkthrough+transfert → hardening final + audit). Un commit par CP réellement terminé,
**pas de commit vide** (NO_COMMIT explicite sinon). CP final obligatoire : ré-audit + walkthrough +
matrice P0→P3 dans `docs/PEDAGOGICAL-AUDIT-V38.md` + évolution chiffrée des warnings + évaluation du
sprint (INSUFFISANT/BON/FORT/EXCELLENT + VERDICT) + prompt V39 (sans démarrer).

**Critères de refus** : remplissage, jargon non introduit, fausse profondeur, gonflage de scores,
longueur = qualité, faux runtime, greenwashing, contenu créé sans besoin réel.

**Livrable final** : `docs/SPRINT-V38.md` + synthèse française (existant / créé / amélioré / réutilisé /
non créé / testé / simulé / non testé / insuffisant), chiffres avant/après, dette restante, HEAD final.

**Commence maintenant par CP0. N'implémente rien avant d'avoir présenté le rapport CP0.**
