# HSD-037 — Profondeur Frontend, standard académique V37 & reachability du parcours

Document de conception de haut niveau (Sprint V37). Complète ADR-037. En français.

## 1. Ordre pédagogique Frontend (décision)

Ordre cible, validé par l'audit de la chaîne de prérequis (acyclique, remonte aux fondations) :

```
Web / navigateur → HTML sémantique → CSS (cascade, box model, flux, display, positionnement, overflow)
→ CSS Flexbox (1D) → CSS Grid (2D) → Responsive
JavaScript → DOM & événements (propagation/délégation) → Formulaires → HTTP/fetch → TypeScript frontend
→ React (fondations, instantané d'état) → hooks/effets → composition → application (routing/reducer/états)
→ Accessibilité → Tests frontend → Performance → Next.js (fondations)
```

On ne réécrit PAS le graphe pour coller à cet ordre : on ajoute les prérequis des nouvelles leçons de
façon acyclique et on vérifie qu'aucun concept n'est utilisé avant d'être enseigné.

## 2. Standard « Academic Lesson V37 »

Au-delà du standard V27 (on-ramp/objectif/prérequis/modèle mental/exemple/erreurs/à retenir/vocabulaire/
liens), une leçon critique V37 vise : accessibilité néophyte (concret→problème→intuition→nom→formel),
prérequis réels (quoi/pourquoi/lien/ce qu'on peut ignorer), vocabulaire défini au premier usage, double
explication (intuition + modèle technique), exemple minimal + guidé + réaliste, **contre-exemple**,
misconceptions, pratique de rappel/application/**transfert**, feedback exploitable, charge cognitive
maîtrisée (splitter si trop dense), frontière réel/simulé, cas métier, entretien de compréhension,
synthèse « 5 choses », pratique reliée pertinente, et un critère de **maîtrise** explicite.

La gate `v37:check` mesure les signaux STRUCTURELS et déterministes de ce standard ; elle ne prétend pas
mesurer la compréhension humaine (portée par l'audit manuel du ledger).

## 3. Surfaces impactées

- **Contenu** : `curriculum/lessons/*.md` (split css-layout → css-flexbox + css-grid ; durcissements ;
  chaîne Next.js).
- **Registre** : `scripts/data/lessons-map.mjs` (`LESSONS`) + rattachement au parcours (D7).
- **Parcours** : `lib/catalogue.mjs` — `frontendModules` enrichi de `lessonRefs` par module (read model).
- **Pratique** : `data/exercises/*.json` (trous Web confirmés) + `data/day-exercises.json` (reachability).
- **Gate/plan/ledger** : `scripts/v37-check.mjs`, `docs/architecture/v37-lessons-plan.json`,
  `docs/architecture/v37-pedagogy-audit.json`.
- **Tests** : `tests/v37-*.test.mjs` + mises à jour ciblées.
- **Glossaire** : ajouts Web Platform manquants seulement.

## 4. Politique de split

Split UNIQUEMENT si la densité conceptuelle le justifie (deux systèmes/modèles distincts), pas la taille.
Cas retenu : css-layout → css-flexbox + css-grid. Cas examinés et NON splittés : react-application-states,
frontend-testing, frontend-performance (topics cohérents, sous-sections suffisantes). Un split remplace
la leçon d'origine (pas de doublon) et repointe prérequis + practiceRefs + rattachements de parcours.

## 5. Reachability du parcours (D7)

Problème : `frontendModules` compose des JOURS ; le socle Web vit dans des LEÇONS sans jour dédié. Solution
additive : chaque module frontend porte une liste `lessonRefs` (leçons canoniques pertinentes) exposée par
le read model du catalogue et affichée sur la page parcours/module. Ainsi l'apprenant voit, dans son
module « fondations » et « React », les leçons Web Platform à lire — sans jour créé ni 365 jours dupliqués.
Preuve attendue : parcours → module → lessonRefs → leçon → practiceRefs.

## 6. Réel / simulé (rappel)

`web`/`react-tsx` notés par modèle déterministe (pas de navigateur réel). Next.js : contenu conceptuel,
aucune exécution réelle prétendue. Playwright : validation responsive + navigation clavier UNIQUEMENT si
réellement pilotée, et alors limitée aux observations effectives.
