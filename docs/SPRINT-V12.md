# Sprint V12 — React/TSX Workbench & Component Learning

Le Laboratoire multi-runtime (Node / Python / TypeScript / Web des sprints V8→V11)
gagne un runtime **React/TSX** réellement exploitable pour apprendre JSX, TSX,
composants, props, état, événements, rendu conditionnel, listes, formulaires
contrôlés, hooks, composition et débogage React — **sans** transformer AI Career
OS en IDE généraliste. Tout reste **local, mono-utilisateur, sans CDN, sans
réseau, sans npm install** dans les workspaces.

## 1. État initial réel (audit CP0)

- Branche `claude/ai-career-os-saas-phfg49`, base V11 à `d733b06`.
- Runtimes Node / Python / TypeScript / Web fonctionnels ; Web Workbench livré.
- `data/program.json` et les 365 Markdown byte-identiques à la baseline `b7bc8e7`.
- Une seule source de progression : `data/progress.json` (sauvegardée puis
  restaurée après chaque validation).
- React `19.2.7`, ReactDOM `19.2.7`, TypeScript `5.9.3` présents en dépendances.
- Fondations réutilisées telles quelles : `frontend-preview.mjs` (iframe
  sandboxée + CSP + bootstrap + canal), `frontend-dom.mjs` (modèle DOM serveur),
  `frontend-grade.mjs` (notation par assertions DOM), modèle `RuntimeAdapter`.

## 2. Architecture React retenue (ADR-012)

- **Trois runtimes distincts, un seul modèle générique.** `typescript` s'exécute
  (Node) ; `web` fait une preview HTML/CSS/JS ; `react` compile TSX/JSX puis fait
  une preview React. Le `RuntimeAdapter` est **étendu** (`reactAdapter`,
  `kind:'react'`, `preview:true`, `compile:true`), jamais contourné.
- **Compilation locale, à la demande.** `lib/react-compile.mjs` utilise l'API
  programmatique TypeScript (`JsxEmit.ReactJSX`, `module:CommonJS`,
  `moduleResolution:Node10`, `noEmitOnError`, `strict`, `skipLibCheck`) via un
  `CompilerHost` délégant (fichiers apprenant en mémoire sous un répertoire
  virtuel `__lab_react__`, `@types/react` réels). La compilation n'a lieu **qu'au
  lancement / rafraîchissement** de la preview ou à la notation. Aucun fichier
  compilé n'est écrit dans le dépôt.
- **React fourni localement, jamais par CDN.** La preview injecte les sources
  **production** de React 19 côté serveur dans un micro-loader CJS
  (`__def`/`__require`) à l'intérieur du `srcDoc` de l'iframe. Une **seule
  instance** React vit dans le realm isolé de l'iframe → aucun *invalid hook
  call* (le React de l'application parent et celui de la preview ne se croisent
  jamais).
- **Imports verrouillés.** Seuls les imports **relatifs** entre fichiers de
  l'exercice et une **allowlist React minimale** (`react`, `react-dom`,
  `react-dom/client`, `react/jsx-runtime`, `react/jsx-dev-runtime`) sont acceptés.
  Tout import npm / absolu / URL / traversal est rejeté **avant** compilation.
  CSS et JSON sont des effets de bord collectés (jamais exécutés comme modules).
- **Notation honnête.** `lib/react-grade.mjs` rend le composant **côté serveur**
  avec `renderToStaticMarkup(createElement(Entry, test.props))` dans l'exécuteur
  Node cloisonné existant, puis analyse le HTML avec le modèle DOM V11 et évalue
  les assertions (`evalReactTest`). Le rendu statique note **structure / props /
  état initial / listes / accessibilité** ; les **transitions par événement réel**
  se voient dans la preview mais **ne sont pas auto-notées** (limite documentée).

## 3. Checkpoints & commits

| CP | Objet | Commit |
|----|-------|--------|
| CP1 | ADR-012 runtime React/TSX | `65d6689` |
| CP2 | Modèle générique d'exercice React/TSX (`react-tsx`) | `2b30e90` |
| CP3 | Compilateur TSX/JSX local (type-check réel, imports allowlistés) | `e035361` |
| CP4 | Preview React sécurisée (React local, iframe sandboxée V11) | `d30aafb` |
| CP5 | Workbench React (coloration TSX/JSX, multi-fichiers, zones) | `14844e4` |
| CP6 | Notation pédagogique React (rendu serveur + modèle DOM V11) | `fe9f32d` |
| CP7 | Corpus React pédagogique (13 exercices) | `7b3aafd` |
| CP8 | Liaison exercices React ↔ journées frontend (92, 93) | `021e68d` |
| CP9 | Catalogue JSX/TSX, palette React, backup React (non-régression) | `4dadcef` |
| CP10 | Durcissement, performance, validation finale + rapport | _ce commit_ |

## 4. Fichiers principaux

- `lib/runtime.mjs`, `lib/runtime-detect.mjs` — `reactAdapter`, détection React.
- `lib/exercise.mjs` / `.d.ts` — validation React (`validateReactTest`,
  `REACT_TEST_KINDS`, entrée `.tsx/.jsx`, extensions bornées, `.json` readOnly).
- `lib/react-compile.mjs` — compilation TSX/JSX + allowlist d'imports.
- `lib/react-preview.mjs` — `srcDoc` React (micro-loader CJS + React local).
- `lib/react-grade.mjs` — harnais de notation (rendu serveur).
- `lib/frontend-dom.mjs` — `evalReactTest` (assertions React sur HTML rendu).
- `lib/workspace-fs.mjs` — `runReactExercise`, `buildReactPreview`.
- `app/api/lab/[exerciseId]/route.ts` — action `preview`.
- `app/lab/[exerciseId]/{ReactPreview,LabWorkspace,CodeMirrorEditor}.tsx`.
- `app/lab/{page,LabCatalog}.tsx`, `lib/search-server.ts` — catalogue/recherche
  JSX/TSX.
- `data/exercises/react-*.json` (13), `data/day-exercises.json` (jours 92/93).

## 5. Tests ajoutés (total suite : **458**, tous verts)

- `tests/react-model.test.mjs` (9) — modèle/validation.
- `tests/react-compile.test.mjs` (16) — TSX/JSX, imports, cycles, tailles, npm
  interdit, absolu/URL, binaire, déterminisme, `noEmitOnError`.
- `tests/react-grade.test.mjs` (11) — assertions React + grading réel + redaction
  privée.
- `tests/react-backup.test.mjs` (4) — round-trip workspace React, exclusion
  lecture-seule / hors-allowlist / traversal / test privé, rejet binaire.
- `tests/react-hardening.test.mjs` (8) — CSP stricte, aucune sous-ressource
  externe, React local, `</script>` neutralisée, déterminisme du `srcDoc`, canal
  non devinable, anti-fuite, bac à sable `allow-scripts` seul.

## 6. Corpus livré (13 exercices, difficultés 1→3)

`react-hello` (JSX), `react-avatar` (JSX, accessibilité), `react-greeting`
(props), `react-conditional` (rendu conditionnel), `react-badge-list` (listes/
clés), `react-list` (listes + composition), `react-counter` (useState +
événement), `react-toggle` (état dérivé), `react-form-name` (formulaire
contrôlé), `react-search` (multi-fichiers : form + liste), `react-profile`
(multi-fichiers : composition + accessibilité), `react-debug-list` /
`react-debug-greeting` (débogage : compilent, échouent sur assertion).

Couverture : 4 JSX, 9 TSX, 3 multi-fichiers, 2 débogage, 9 avec tests privés,
2 formulaires, 6 listes, 3 événements, 3 hooks/état, 2 accessibilité, 5
composition. Chaque exercice a solution de référence (**passe 100 %**), starter
incorrect (**échoue ≥ 1 test public**), tests déterministes, limites, compétences
et journée liée. Aucun Markdown modifié.

## 7. Performances (médianes, machine de CI)

| Mesure | Temps |
|--------|-------|
| Compilation TSX simple (1 fichier) | ~650 ms |
| Compilation multi-fichiers (3) | ~730 ms |
| Construction du `srcDoc` de preview | ~4 ms |
| Notation complète (compile + rendu + tests) | ~800 ms |

La compilation TypeScript domine (création de programme + type-check). Le
`srcDoc` et le rendu statique sont négligeables. Aucune boucle de compilation ni
rafraîchissement multiple (debounce 600 ms côté client, remount contrôlé par
`nonce`, iframe unique par exercice).

## 8. Bundles & discipline

- Build **sans warning**. First Load JS partagé ~103 kB.
- **CodeMirror** : un seul chunk, chargé **paresseusement**, absent de toute route
  (y compris `/lab/[id]`) dans le manifeste initial.
- **Compilateur TypeScript / react-compile / react-preview / react-grade /
  `renderToStaticMarkup`** : **absents de tous les chunks client** (serveur
  uniquement).
- `ReactPreview`, `FrontendPreview`, `CodeMirrorEditor` importés via `dynamic()`.
- Le runtime React de preview (sources production) n'est injecté que dans le
  `srcDoc` d'un exercice React, jamais dans un bundle. Pas de seconde instance
  React dans le realm parent.

## 9. Modèle de sécurité (vérifié)

- Iframe `sandbox="allow-scripts"` **seul** — jamais `allow-same-origin`, ni
  popups, top-navigation, downloads, modals.
- CSP `default-src 'none'; connect-src 'none'` → aucun réseau depuis la preview.
- `postMessage` validés par `event.source` + canal non devinable ; messages/logs
  bornés.
- Imports npm / absolus / URL / traversal rejetés avant compilation ; cycles
  résolus proprement par le loader CJS.
- Tests privés notés **côté serveur uniquement** ; jamais dans props, HTML,
  `srcDoc`, API publique, console, recherche, backup client ni historique.
- Preuve d'anti-fuite : le `srcDoc` reflète **uniquement** les fichiers soumis —
  ni la solution de référence stockée, ni les valeurs attendues privées.
- `</script>` / `</style>` neutralisées ; contenu binaire (NUL) rejeté.

## 10. Validation navigateur

- **80/80** combinaisons (16 routes × 5 largeurs 375/768/1024/1440/1920) :
  HTTP 200, **zéro overflow horizontal global**, **zéro erreur console
  applicative**. Routes couvertes : Dashboard, Parcours, Calendrier, Révisions,
  Vue Jour courte/longue, Catalogue, exercices Node/Python/TypeScript/Web, React
  JSX/TSX/multi-fichiers/formulaire/composition.
- Preview React : bon rendu → `srcDoc` + React local ; erreur de compilation →
  `ok:false` + diagnostics localisés (`App.tsx`, message clair) ; erreur runtime →
  capturée par le bootstrap et affichée. Aucune fuite du privé dans le `srcDoc`.
- Captures : `docs/assets/v12-react-desktop.png`, `v12-react-mobile.png`,
  `v12-catalogue-desktop.png`.

## 11. Limites honnêtes

- Les **transitions par événement** (clic qui incrémente, saisie contrôlée) sont
  **visibles dans la preview** mais **non auto-notées** : la notation repose sur
  un rendu statique (structure / props / état initial / listes / accessibilité).
  Le corpus est conçu pour être notable par rendu.
- Hors périmètre et non fournis : Next.js/SSR/Server Components dans le code
  apprenant, routing React, gestionnaire de paquets, bibliothèques UI externes,
  réseau depuis la preview.
- Les protections sont **applicatives** (sandbox iframe, CSP, allowlist, timeouts,
  sorties bornées) — **pas** une isolation au niveau OS.

## 12. État Git final

- Tous les checkpoints commités et poussés sur
  `claude/ai-career-os-saas-phfg49` ; **local == origin**.
- `data/program.json` et 365 Markdown **byte-identiques** à `b7bc8e7` ;
  génération idempotente (seul `generatedAt` varie, restauré).
- `data/progress.json` restauré ; aucun workspace de validation résiduel ;
  working tree propre.
- Suite de tests : **458 / 458** ; `tsc --noEmit` OK ; build sans warning ;
  curriculum guard + glossaire OK.
