# TSD-037 — Gate v37, splits, pratique, reachability & Next.js

Document de conception technique (Sprint V37). Complète ADR-037 / HSD-037. En français.

## 1. Plan — `docs/architecture/v37-lessons-plan.json`
Champs : `sprint`, `baselineRef`, `newLessons` (splits css-flexbox/css-grid + chaîne Next.js),
`hardenedLegacy` (css-fundamentals, react-accessibility, éventuels), `removedLessons`
(css-layout-flexbox-grid), `critical` (practiceRef obligatoire), `prereq` (acyclique, slugs connus).
Vérifié par `tests/v37-pedagogy.test.mjs`.

## 2. Gate `scripts/v37-check.mjs` (adaptée de v36)
Valide STRUCTURELLEMENT les leçons du périmètre (on-ramp avant objectif, prérequis rédigés, sections
minimales, liens valides, practiceRefs résolus pour `critical`, graphe acyclique, réel/simulé) + signaux
pédagogiques en avertissement (densité, jargon à froid). Vérifie aussi que les slugs de `removedLessons`
n'existent plus dans `LESSONS`. `placeholder` minuscule non flagué (attribut HTML). Ne juge jamais la
profondeur par la longueur. Ajoutée à `gates:active` (17 gates).

## 3. Split css-layout
- Créer `curriculum/lessons/css-flexbox.md` et `curriculum/lessons/css-grid.md` (standard V37, approfondis).
- Supprimer `curriculum/lessons/css-layout-flexbox-grid.md` + son entrée `LESSONS`.
- Repointer : `responsive-design.prereq = [css-flexbox, css-grid, css-fundamentals]` ; practiceRefs
  (web-nav → flexbox, web-card → grid) ; `critical` mis à jour.
- `frontendModules` : le module layout référence les deux nouvelles leçons via `lessonRefs`.

## 4. Reachability — `lessonRefs` par module frontend
`frontendModules(program)` renvoie, pour chaque module, un champ `lessonRefs: string[]` (slugs de leçons
canoniques). Le read model l'expose ; la page module l'affiche. Exemple :
```
fe-01-js         → [javascript-basics, async-javascript]
fe-03-react-intro→ [browser-dom-rendering, html-semantic-structure, css-fundamentals, css-flexbox,
                    css-grid, responsive-design, react-fundamentals]
fe-04-react-core → [react-hooks-effects, web-forms-validation, typescript-frontend]
fe-05-react-app  → [react-composition-architecture, react-application-states, react-accessibility]
fe-06-tests      → [frontend-testing, frontend-performance]
```
Additif : ne modifie pas les jours ; validé par un test (chaque `lessonRefs` slug existe dans `LESSONS`).

## 5. Pratique (trous confirmés)
Candidats (créés seulement si absents et pertinents) : `css-specificity-order` (node-js : trier des
sélecteurs par spécificité), `css-box-size` (node-js : calculer la largeur réelle avec border-box),
`dom-event-delegation` (node-js : quel enfant via délégation). Runtimes déterministes ; vérifiés par
exécution (référence verte, starter en échec, ≥1 public + ≥1 privé) ; reliés à des jours réels.

## 6. Next.js (CP8)
3-5 leçons : `nextjs-foundations` (pourquoi un framework, routing par fichiers), `nextjs-rendering`
(CSR/SSR/SSG/streaming conceptuel), `nextjs-server-client-components` (modèle mental), `nextjs-data-production`
(data fetching/cache/revalidation, erreurs/loading/not-found, frontière serveur/client, env/secrets,
déploiement). Technologie `nextjs` déjà dans TECHNOLOGIES. Séparer concepts stables vs syntaxe évolutive ;
aucune exécution Next.js prétendue. Catégorie « Frontend & React » ou « Frontend : Web Platform ».

## 7. Tests
- `v37-pedagogy.test.mjs` : plan valide, ledger valide, removedLessons absentes, practiceRefs résolus.
- `v37-e2e.test.mjs` : nouvelles leçons au corpus, css-layout supprimée, 0 leçon sans on-ramp, graphe 0
  bloquant, module frontend expose des `lessonRefs` valides couvrant le socle Web.
- `v37-exercises.test.mjs` : exécution des nouveaux exercices (sandbox gitignoré).

## 8. Discipline
Un commit atomique par CP terminé ; `NO_COMMIT` documenté sinon ; jamais de commit vide.
`progress.json` gitignoré, restauré à la baseline CP0. Aucun force-push, aucun rebase destructif.
