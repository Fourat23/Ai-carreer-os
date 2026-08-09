# TSD-036 — Gate v36, plan de leçons, parcours & tests

Document de conception technique (Technical Solution Design), Sprint V36. Complète ADR-036 / HSD-036.
En français. Décrit les contrats techniques : plan, gate, composition du parcours, tests.

## 1. Plan de leçons — `docs/architecture/v36-lessons-plan.json`

```jsonc
{
  "sprint": "V36",
  "baselineRef": "1a15d7d",
  "newLessons": [ /* slugs créés, remplis au fil des CP3-CP7 */ ],
  "hardenedLegacy": [ /* leçons React/DOM durcies si l'audit le justifie */ ],
  "critical": [ /* leçons à practiceRef obligatoire résolu */ ],
  "prereq": { /* slug -> [prérequis] ; acyclique ; slugs connus */ }
}
```
Contraintes vérifiées par test (`v36-pedagogy.test.mjs`) : slugs existent dans `LESSONS` ;
`prereq` acyclique et à slugs connus ; `critical ⊆ newLessons ∪ hardenedLegacy`.

## 2. Gate `scripts/v36-check.mjs` (adaptée de v35-check)

Valide **structurellement** les leçons du périmètre V36 (lues depuis le plan) :
- on-ramp `## 🌍` **avant** l'objectif ; prérequis rédigés (pas un lien nu) ;
- sections minimales (objectif, prérequis, modèle mental, explication, exemple guidé, erreurs
  fréquentes, à retenir, vocabulaire, liens) ;
- absence de marqueurs d'authoring (`TODO`/`FIXME`/`à compléter`/`Lorem ipsum`) — hors faux positifs ;
- liens internes `/doc/lessons/<slug>` valides ; `practiceRefs` résolus (obligatoire pour `critical`) ;
- graphe de prérequis sans cycle ; scan de danger (réel/simulé, code non fermé).
- **Signaux pédagogiques en AVERTISSEMENT** (proxys, non bloquants) : densité conceptuelle, jargon à froid.
Ne juge **jamais** la profondeur par la longueur. Réutilise `blockingSignals`, `normalizeText`,
`LESSONS`. Robuste si le plan est vide. `package.json` : ajout `v36:check` et à `gates:active`.

## 3. Composition du parcours — `frontendModules(program)`

Sur le modèle de `dataMlModules`/`fullstackModules`, sélection par **plages/listes de jours réels**
(mécanisme non contigu existant) :

```
fe-01-foundations   JS & TS fondations           [8..14, 36..49]   (langage avant interface)
fe-02-web-http      Le front consomme une API    [50..56, 88, 97]  (HTTP/fetch/états async)
fe-03-react-core    React : composants & état     [87, 92..96]      (JSX, props, state, effets, forms)
fe-04-react-app     Application React             [99..104]         (routing, lifting, Context, perf, a11y)
fe-05-tests-quality Tests & qualité front         [106..111]        (unit/composant/mocks/hooks/erreurs)
fe-06-project       Projet 3 — BiblioApp          [113..118]        (intégrateur)
```
`totalDays` **dérivé** du nombre de jours sélectionnés (aucun nombre magique). Aucun jour dupliqué.
Le socle **visuel** (HTML/CSS/layout/responsive) est apporté par les **leçons** ajoutées, reliées au
corpus/graphe — limite documentée (les jours ne portent pas de CSS/HTML).

## 4. Décision d'activation (implémentée au CP10)

`frontend-engineer-v1` : `announced → available` **si et seulement si** le corpus n'a plus de trou
P0 (leçons Web Platform livrées + reliées), la chaîne de jours composée est cohérente, le projet
intégrateur est présent, et le graphe reste sans bloquant. Sinon : rester annoncé, publier la
matrice de blockers dans `docs/architecture/v36-frontend-track-matrix.md`.
Si activé : ajouter à `ANNOUNCED_TRACKS`→ retrait, construire l'objet track (status `available`,
`moduleRefs`, `totalDays` dérivé), et mettre à jour `tests/catalogue.test.mjs` (availableIds),
`tests/*-e2e` concernés (honnêtement).

## 5. Tests

- `tests/v36-pedagogy.test.mjs` : plan valide, ledger valide (`validateAuditLedger`), practiceRefs résolus.
- `tests/v36-e2e.test.mjs` : nouvelles leçons présentes au corpus, catégorie cohérente, 0 leçon du
  périmètre sans on-ramp, graphe 0 bloquant ; si parcours activé : modules→jours réels + distinction.
- Mise à jour `tests/catalogue.test.mjs` uniquement si activation.

## 6. Réel / simulé (rappel technique)

`web`/`react-tsx` : notation par modèle déterministe (`frontend-model`/`react-model`) — pas de
navigateur réel. Validation responsive : Chromium/Playwright, observations limitées au piloté
(largeurs 375/768/1024/1440/1920 sur surfaces concernées). Aucun entraînement, aucun réseau.

## 7. Discipline

Un commit atomique par CP réellement terminé ; `NO_COMMIT` documenté si un CP ne change rien ;
jamais de commit vide. `progress.json` gitignoré, restauré à la baseline CP0. Aucun force-push,
aucun rebase destructif.
