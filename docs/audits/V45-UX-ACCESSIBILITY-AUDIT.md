# V45 — UX / ACCESSIBILITÉ AUDIT

Audit **lecture seule**. AUCUNE refonte. Honnêteté de méthode : **INSPECTÉ = code** (JSX/CSS lus,
signaux grep sur `app/` + `components/`). **NON TESTÉ = rendu** : le driver Playwright (`@playwright/
test`) et `axe-core` ne sont PAS installés ; les installer modifierait le projet. Aucun audit de rendu
pixel ni axe-core automatisé n'a été exécuté — ce document ne le prétend pas. Chromium binaire est
présent mais inutilisable sans driver ici.

## CP10 — UX / Information Architecture (INSPECTÉ)

### Signaux mesurés (app/ + components/)
| Signal | Valeur | Lecture |
|---|---|---|
| `bg-gradient` / gradients | ~0 | UI non « slop » |
| `shadow-*` / glow / blur | 0 | sobre |
| titres hero (`text-6xl`…) | 0 | pas de hero marketing |
| `<img>` / `<Image>` | **0** | UI 100 % textuelle/éditoriale |
| grid/card (classes) | 116 occ | à surveiller (densité) |
| badge/chip/pill | 127 occ | indicateurs d'état — fonctionnels sur échantillon |
| `<h1>`/`<h2>`/`<section>`/`<aside>`/`<nav>` | présents | hiérarchie éditoriale réelle |

### Verdict UX : **BON (sobre, éditorial)**
- Le tableau de bord (`/`) a une hiérarchie claire : `h1` unique, `section`/`h2`, `aside aria-label`,
  `nav aria-label`. Orientation « Que faire maintenant ? » présente (section « Prochaines actions »,
  résumé du jour) — ajouts V41 réels.
- **Anti-AI-slop : PASS.** Aucun gradient décoratif, aucun halo, aucune image décorative, aucun hero,
  aucune métrique vanity détectée à l'inspection. Le design est retenu et orienté contenu.
- **Points d'attention (recommandations Vxx, non implémentées)** :
  - 127 badges/chips : vérifier qu'aucun n'est purement décoratif (charge visuelle) — INSPECTÉ comme
    fonctionnels (états de compétence, difficulté), à confirmer en rendu.
  - 116 usages grid/card : risque de « card grid clonée » sur les pages de listing (parcours, lessons,
    missions) — à auditer visuellement en V46.
  - Continuité cours→pratique : les practiceRefs relient leçon→exercice (V44), mais 14 leçons n'ont pas
    de lien exécutable (cf. CURRICULUM-AUDIT) — discontinuité pour l'apprenant sur ces pages.
  - `detailed` non peuplé au niveau `program.days` : vérifier que la page `/day/[id]` affiche bien le
    contenu (rendu via day-view/lessons-map) — NON TESTÉ en rendu.

### Pages learner-facing recensées (36)
`/`, parcours, lessons, doc/[...slug], day/[id], month/[id], week/[id], skills, synthese, revisions,
reviews, diagnostics, capstones(+[id]), missions(+[id]), lab(+[id]), kubernetes(+[id]), security(+[id]),
cloud-lab(+[id]), cloud-foundations(+[id]), pipelines(+[id]), glossary, calendar, notes, projects,
career, guide, resources, settings, week/month. **Couverture de surfaces : large.**

## CP11 — Accessibilité

Statut de méthode par contrôle :

| Contrôle | Statut | Constat |
|---|---|---|
| HTML sémantique / landmarks | INSPECTÉ | `<nav>`, `<main>`, `<section>`, `<aside>`, `<header>` présents ; bon usage |
| Hiérarchie de titres | INSPECTÉ | `h1` unique par page (échantillon `/`), `h2`/`h3` structurés |
| `aria-*` | INSPECTÉ | 157 attributs aria ; `aria-label` sur nav/aside |
| `role=` | INSPECTÉ | 52 usages |
| Boutons vs div-cliquables | INSPECTÉ | 97 `<button>` vs **4** `<div onClick>` → très bon (interactions natives) |
| Labels de formulaire | INSPECTÉ | **7 `htmlFor` pour ~50 `<input>`** → ⚠️ déficit APPARENT (beaucoup d'inputs sont dans l'éditeur CodeMirror, à confirmer ; vérifier les champs de settings/notes) |
| Images `alt` | N/A | **0 image** dans l'UI → pas de risque alt |
| `prefers-reduced-motion` | INSPECTÉ | 2 usages seulement (peu d'animation, à confirmer) |
| Contraste / zoom / focus visible / focus trap modales | **NON TESTÉ** | nécessite rendu (Playwright/axe absents) |
| Navigation clavier / focus order | **NON TESTÉ** | idem |
| 375/768/1024/1440/1920 responsive | **NON TESTÉ** | idem |
| Lecteur d'écran | **NON TESTÉ** | idem |

### Verdict accessibilité : **CORRECT (structure), NON TESTÉ (rendu)**
- Structurellement encourageant : interactions natives (`<button>`), landmarks, aria présents.
- **Risque prioritaire à vérifier** : couverture des labels de formulaire (7/50) — potentiels champs
  sans `<label>` associé (settings, notes, réponses de jour). À confirmer en rendu, MEDIUM a11y.
- Contraste, focus visible, ordre de tabulation, comportement responsif : **non vérifiés faute d'outil
  de rendu** — à instruire en V46 avec Playwright + axe-core installés proprement.

## Recommandations (V46+, non implémentées)
1. Installer proprement `@playwright/test` + `axe-core` (dev-deps) et créer une suite d'audit a11y de
   rendu sur les pages clés × 5 largeurs.
2. Auditer la couverture `<label>`/`aria-label` de tous les champs de saisie.
3. Vérifier contraste et focus visible (tokens de thème).
4. Revue « card grid » des pages de listing pour éviter la répétition générique.
