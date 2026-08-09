# HSD-036 — Carte pédagogique Frontend & intégration

Document de conception de haut niveau (High-level Solution Design), Sprint V36. Complète ADR-036.
En français. Décrit la carte pédagogique cible, les surfaces impactées et la stratégie
d'anti-duplication.

## 1. Carte pédagogique cible

Progression conceptuelle, du concret vers l'abstrait, chaque brique introduite par un problème :

```
FOUNDATION (existant)         WEB PLATFORM (à créer, P0)         BROWSER JS / TS (existant + P1)
  javascript-basics    ─┐       html-semantic-structure  ─┐        browser-dom-rendering (durcir?)
  async-javascript      ├──────► css-fundamentals          ├──────► typescript-frontend (créer)
  typescript-basics    ─┘       css-layout-flexbox-grid    │        http-rest-json (existant)
                                responsive-design          │
                                web-forms-validation      ─┘
                                          │
                                          ▼
REACT (existant, durcir)              REACT APPLICATION (audit → créer si trou)
  react-fundamentals      ──────►   react-composition-architecture (Context, archi)
  react-hooks-effects               [react-application-state ? SI trou avéré]
  react-accessibility
                                          │
                                          ▼
TESTING / PERF / PROD (existant + trous)              PRODUCTION
  testing-foundations (général)                       playbooks front (regression…)
  [frontend-testing ? SI trou]                        [next.js foundations ? SI socle mûr, sinon V37]
```

## 2. Concepts → leçon → pratique (cible)

| Concept | Leçon (statut) | Pratique reliée (existante d'abord) |
|---|---|---|
| HTML sémantique | html-semantic-structure (créer) | web-semantic, web-nav |
| Arbre DOM / rendu | browser-dom-rendering (existant) | web-counter, web-debug-selector |
| CSS cascade/box model | css-fundamentals (créer) | web-inline-style, web-card |
| Layout Flexbox/Grid | css-layout-flexbox-grid (créer) | web-card (+ exo layout si trou) |
| Responsive | responsive-design (créer) | (+ exo responsive-reasoning si trou) |
| Formulaires natifs | web-forms-validation (créer) | web-greeting-form |
| TS frontend | typescript-frontend (créer) | ts-* + react-tsx typés |
| React fondations | react-fundamentals (existant) | react-hello…react-list |
| Hooks/effets | react-hooks-effects (existant) | react-toggle, react-search |
| Composition/archi | react-composition-architecture (existant) | react-profile, frontend-regression |
| Accessibilité | react-accessibility (existant) | web-semantic, react-avatar |
| Tests front | testing-foundations (existant) | (+ exo si trou) |

## 3. Surfaces impactées

- **Contenu** : `curriculum/lessons/*.md` (nouvelles leçons, `<!-- keep -->`).
- **Registre** : `scripts/data/lessons-map.mjs` (`LESSONS` : file/title/cat/level/min/skills/practiceRefs)
  → alimente corpus graphe, `/lessons`, `/doc/lessons`. Catégorie : **« Frontend & React »** (existe déjà)
  ou nouvelle **« Web Platform »** placée avant, selon lisibilité (décidé au CP3).
- **Parcours** : `lib/catalogue.mjs` — `frontendModules(program)` + activation conditionnelle.
- **Gate** : `scripts/v36-check.mjs` + `package.json` (`v36:check`, `gates:active`).
- **Plan/ledger** : `docs/architecture/v36-lessons-plan.json`, `docs/architecture/v36-pedagogy-audit.json`.
- **Tests** : `tests/v36-*.test.mjs`, mise à jour `tests/catalogue.test.mjs` si activation.
- **Glossaire** : `curriculum/glossary/glossary.json` (termes Web Platform manquants uniquement).
- **CSS app** : aucun changement sauf correctif ciblé (pas de refonte UI).

## 4. Stratégie d'anti-duplication (RÉUTILISER → RELIER → DURCIR → ÉTENDRE → CRÉER)

1. **Rechercher** l'équivalent : React/DOM/tests existent → ne pas recréer.
2. **Relier** la pratique existante (`web-*`, `react-tsx`) aux nouvelles leçons via `practiceRefs`.
3. **Durcir** une leçon existante plutôt qu'en créer une concurrente (ex. événements dans
   browser-dom-rendering ; TS général reste `typescript-basics`).
4. **Étendre** le parcours par composition non contiguë (mécanisme existant).
5. **Créer** uniquement les leçons/exos/playbooks pour trous **confirmés** par CP0.

## 5. Critères de qualité (rappel ADR)

Toute nouvelle leçon ou leçon durcie utilisée par le parcours : aucune dimension < 3/4, moyenne
cible ≥ 3,6/4, dimensions critiques (exactitude, accessibilité néophyte, modèle mental, progression,
pratique autonome, charge cognitive) tendant vers 4/4. La gate mesure la **structure**, pas la
longueur ; les scores sont portés par un humain à la lecture, jamais « arrangés ».

## 6. Décision d'activation du parcours (rappel)

`frontend-engineer-v1` ne passe `announced → available` que si les 13 critères du prompt (§10) sont
démontrés, notamment : chaîne débutant→junior cohérente, 0 trou P0, pratique reliée, projet
intégrateur (Projet 3 BiblioApp), graphe sans bloquant, walkthrough néophyte, description honnête.
Sinon : **rester annoncé** + matrice de blockers. La décision est prise au CP10 sur l'état réel.
