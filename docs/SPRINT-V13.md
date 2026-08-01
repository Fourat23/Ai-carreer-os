# Sprint V13 — Couverture pédagogique du laboratoire et liaison des exercices aux journées

> **V13 enrichit le dispositif pratique et sa liaison au curriculum. V13 ne
> constitue pas un enrichissement intégral du contenu rédactionnel des 365
> cours.** Les 365 fichiers Markdown et `data/program.json` restent
> byte-identiques à la baseline `b7bc8e7`.

## 1. Résumé avant / après

| | Avant (V12, `ca90106`) | Après (V13) |
|---|---|---|
| Exercices | 53 | **68** (+15 créés, 1 corrigé) |
| Journées liées | 26 | **43** |
| Charge max / journée | 12 (j92) | **5** (j88, hérité V11) |
| Runtimes couverts | Node/TS/Web/React/Python | idem (aucun nouveau) |
| Tests | 458 | **472** |
| Taxonomie de compétences | ids libres | résolveur canonique + libellés |
| Rôles pédagogiques | aucun | principal / complément / remédiation / défi (dérivés) |

## 2. HEAD de départ et HEAD final

- Départ : `ca90106` (V12 terminé).
- Final : voir « État Git final » (§22) — HEAD du commit CP10.

## 3. Checkpoints et commits

| CP | Objet | Commit |
|----|-------|--------|
| CP0 | Audit forensique + matrice de couverture | (aucun changement) |
| CP1 | ADR-013 couverture, taxonomie, liaison | `eea5480` |
| CP2 | Taxonomie canonique (résolveur pur) | `ff06362` |
| CP3 | Rôles dérivés + rapport de charge | `4e247d0` |
| CP4 | JS / algo / structures de données (9 ex.) | `35495a6` |
| CP5 | Node/API / TypeScript / Python (4 ex.) | `4d066a7` |
| CP6 | React : lifting state + parent/enfant (2 ex.) | `1984a45` |
| CP7 | Redistribution j92 + liaison justifiée | `1498f98` |
| CP8 | Rôle visible dans la Vue Jour (léger) | `eab303a` |
| CP9 | Libellés catalogue + non-régression backup | `0e46576` |
| CP10 | Hardening, validation, rapport | _ce commit_ |

## 4. Matrice de couverture (avant → après)

| Runtime | Avant | Après |
|---|---|---|
| node-js | 8 | 18 |
| typescript | 13 | 15 |
| python3 | 8 | 9 |
| react-tsx | 13 | 15 |
| web | 11 | 11 |
| **Total** | **53** | **68** |

Difficultés : d1=13, d2=31, d3=21, d4=3. Journées liées : 26 → 43.

## 5. Exercices existants réutilisés

Les 53 exercices V8→V12 sont conservés. La liaison React du jour 92 (surchargée)
est **redistribuée** (voir §8) sans suppression d'exercice.

## 6. Exercices ajoutés (15) — justification individuelle

**CP4 — JavaScript / algo / DS**
- `js-conditions` (j5) — conditions et bornes (aucun exercice sur les conditions).
- `js-loops` (j6) — boucle d'accumulation (aucun exercice sur les boucles).
- `js-initials` (j9) — découpage en fonctions + transformation de chaîne.
- `js-array-objects` (j11) — tableaux d'objets (format des données réelles).
- `js-pipeline` (j22) — HOF via `reduce` + dispatch (gradable, I/O sérialisable).
- `js-even-squares` (j23) — `filter` + `map`.
- `algo-binary-search` (j16) — dichotomie O(log n) (aucun exercice de recherche).
- `algo-two-sum` (j31) — réflexe hash map O(n).
- `ds-stack` (j33, TS) — pile LIFO (aucune structure de données implémentée).

**CP5 — Node/API / TypeScript / Python**
- `http-status` (j50) — classes de code HTTP (aucun exercice HTTP).
- `api-router` (j52) — routeur REST avec paramètres `:id`.
- `ts-pluck` (j43) — fonction pure générique (`K extends keyof T`).
- `py-exceptions` (j122) — exceptions multiples, distinct de `py-safe-divide`.

**CP6 — React**
- `react-lift-state` (j100) — remontée d'état (état initial threadé, noté statique).
- `react-parent-child` (j94) — communication parent/enfant via callback en prop.

## 7. Exercices supprimés ou remplacés

Aucun. Un exercice **corrigé** : `ts-debug-discount` — son bug n'était attrapé
que par un test privé (les 2 tests publics passaient, dont un par coïncidence
`100−20 = 100×0,8`). Le test public `t1` est remplacé par un cas discriminant
(`200 à −10% → 180`), pour que le starter échoue publiquement. Aucune autre
modification.

## 8. Journées nouvellement reliées

j5, j6, j9, j11, j16, j22, j23, j31, j33 (CP4) ; j43, j50, j52, j122 (CP5) ;
j94, j100, j103, j89 (CP6/CP7). Redistribution React : j92 (12 → 3),
j94 (listes/conditionnel), j96 (+`react-search`), j100 (lifting/communication),
j103 (accessibilité), j89 (débogage DOM déplacé hors de la journée React).

## 9. Journées laissées sans exercice — justification

- **Git / terminal / système de fichiers** (j2, j3, j18, j72, j73) : aucun runtime
  shell ; un exercice Node simulant Git/terminal serait artificiel. Hors périmètre.
- **SQL** (j55–58) : aucun runtime SQL ; un exercice JS simulant une requête serait
  artificiel. Hors périmètre (conforme au prompt).
- **useEffect / fetch** (j95) : `renderToStaticMarkup` n'exécute pas les effets →
  un effet n'est pas observable en notation statique. Démontré en preview
  uniquement, non noté (limite honnête, ADR-013 §8).
- Journées purement théoriques (culture, lecture, projets rédactionnels) : sans
  exercice à dessein (une journée théorique peut légitimement n'en avoir aucun).

## 10. Charge maximale observée

**5** (jour 88, hérité V11 : async + DOM). Journées > cible (3), toutes des hubs
thématiques cohérents et documentés : j87=4 (HTML/CSS de base), j88=5, j94=4
(listes & rendu conditionnel). Toutes les autres respectent 1 principal + 0–2
compléments. Aucune journée n'est « terminée » par un exercice (la preuve
n'affecte jamais le statut du jour).

## 11. Couverture par dimension

- **Runtime** : node-js 18, typescript 15, react-tsx 15, web 11, python3 9.
- **Difficulté** : d1=13, d2=31, d3=21, d4=3.
- **Compétence (top)** : javascript 30, typescript 15, react 15, algo 11,
  props 10, python 9, jsx 8, components 7 ; + compétences fines nouvelles
  (conditions, loops, functions, arrays, objects, hof, search, hashmap, stack,
  http, errors, lifting-state, purity).
- **Type pédagogique** : implémentation, débogage, transformation de données,
  cas métier, tests privés, composition, accessibilité.
- **Rôle** (dérivé, par journée) : principal / complément / remédiation / défi.

## 12. Audit des doublons sémantiques

- `fizzbuzz` (node) vs `ts-fizzbuzz` (TS) ; `word-frequencies` vs
  `ts-word-frequency` : conservés — l'angle **typage TS** est un objectif
  pédagogique distinct (intro TypeScript sur un algorithme connu). Documentés.
- `py-safe-divide` (ZeroDivisionError) vs `py-exceptions` (parsing +
  ValueError/ZeroDivisionError) : distincts (division simple vs robustesse de
  parsing multi-exceptions).
- Aucun doublon reformulé ni variante cosmétique ajoutée.

## 13. Taxonomie consolidée

`lib/skill-taxonomy.mjs` : résolveur pur (`canonicalSkill`, `canonicalizeSkills`,
`skillLabel`, `isKnownSkill`). Additif et rétrocompatible — test prouvant que
**toute** compétence du corpus se résout sans perte, de façon idempotente, vers
un id canonique connu. Le catalogue affiche les libellés lisibles ; la
progression et les preuves ne sont pas migrées.

## 14. Résultats références et starters

**68 / 68** : chaque référence passe 100 % des tests, chaque starter échoue à
≥ 1 test **public** pertinent (validation automatisée sur tout le corpus).

## 15. Tests privés et anti-fuite

Palette et recherche indexent les 68 exercices par **métadonnées publiques
seules** ; vérifié : aucune fuite de solution de référence, de valeur attendue
privée, de contenu de fichier, ni de type de test dans l'index. Backup v3 :
round-trip Node/Python/TS/React avec exclusion des tests privés / traversal /
hors-allowlist. Les tests privés restent notés côté serveur uniquement.

## 16. Validations navigateur

**95 / 95** combinaisons (19 routes × 5 largeurs 375/768/1024/1440/1920) :
HTTP 200, zéro overflow horizontal global, zéro erreur console applicative.
Routes : Dashboard, Parcours, Calendrier, Révisions, Vue Jour courte/longue,
Catalogue, exercices Node/algo/Python/TypeScript/DS/API/Web, React
JSX/TSX/multi-fichiers/lifting/formulaire. Rôle affiché sur les journées
multi-exercices, absent sur les journées à exercice unique. Grading vérifié
(référence → preuve ; erreur de compilation → diagnostics localisés).

## 17. Performances et bundles

- Routes principales : ~15–25 ms (réponse serveur, dynamique).
- Notation : Node ~51 ms, Python ~56 ms, TypeScript ~342 ms (compile),
  React ~1,2 s (compile + rendu + tests). Cohérent avec V12, **aucune régression
  attribuable à V13**.
- Bundles inchangés depuis V12 : CodeMirror et composants preview **lazy** ;
  compilateur TS/TSX et runtime React **serveur uniquement** ; build sans warning.

## 18. Export / import

Format v3 agnostique au runtime : les workspaces des nouveaux exercices
(Node/Python/TypeScript/React) transitent sans migration dédiée, compatibilité
totale des sauvegardes antérieures. Test de non-régression `backup-runtimes`.
Export vérifié en navigateur (clé `workspaces` présente).

## 19. État final de `data/progress.json`

Restauré à l'identique après chaque validation (sauvegardes horodatées dans le
scratchpad, comparaison `git diff --quiet` verte). Aucune preuve de test laissée.

## 20. `program.json` et 365 Markdown

**Byte-identiques** à la baseline `b7bc8e7` (vérifié après génération idempotente ;
seul le timestamp `generatedAt` varie et est restauré). Aucun Markdown modifié.

## 21. Limites honnêtes

- Les **transitions par événement** et **`useEffect`** sont visibles en preview
  mais **non auto-notés** (rendu statique). Aucun exercice ne prétend le
  contraire.
- **Git/terminal** et **SQL** : sans runtime adapté, aucun exercice ; journées
  laissées vides à dessein.
- Le **rôle** est propre à une journée (un exercice peut être principal sur l'une
  et complément sur une autre) ; il n'est donc pas exposé au catalogue.
- Protections **applicatives** (sandbox iframe, CSP, allowlist, timeouts, sorties
  bornées) — jamais une isolation OS.

## 22. État Git final

- Branche `claude/ai-career-os-saas-phfg49`, tous les checkpoints commités et
  poussés, **local == origin**, working tree propre.
- 472 tests verts, `tsc --noEmit` OK, build sans warning, curriculum:check OK,
  génération idempotente, `program.json` + 365 Markdown byte-identiques,
  `progress.json` restauré, aucun workspace résiduel.

## 23. Prompt de reprise V14

Voir le message de clôture de session (prompt V14 orienté « rendre un deuxième
parcours réellement disponible et exploitable »), à ne pas démarrer dans cette
session.
