# Audit pédagogique — Sprint V37 (Frontend Engineer II)

> Approfondissement du socle Frontend : split css-layout → css-flexbox + css-grid (approfondis),
> durcissement de css-fundamentals / react-accessibility / frontend-testing, pratique Web ciblée,
> accessibilité concrète, fondations Next.js (conceptuelles), et rattachement du socle Web au
> parcours. Document en français, factuel, sans langage promotionnel. Les scores sont des PROXYS,
> pas une mesure de l'apprentissage humain réel.

## 1. Méthodologie

Séparation stricte (rubrique v20, `lib/pedagogy-audit.mjs`) : rubrique (16 dimensions 0-4, notées à
la lecture intégrale) ; signaux structurels (informatifs) ; signaux de danger (bloquants). Seuils :
aucune dimension < 2 ; dimensions dures (technical-accuracy, objective, progression,
autonomous-practice) ≥ 3 ; moyenne récente ≥ 3,25. Registre `docs/architecture/v37-pedagogy-audit.json`,
validé par `validateAuditLedger`. Gate `v37:check` = structure, jamais profondeur par longueur.

## 2. Ce qui a été fait (résumé)

- **Split** css-layout-flexbox-grid → **css-flexbox** + **css-grid** (approfondis), justifié par la
  densité conceptuelle.
- **Durcissements** : css-fundamentals (flux normal, display, positionnement, overflow),
  react-accessibility (tabindex, focus/modales, reduced-motion), frontend-testing (async, flaky,
  régression après merge).
- **Pratique** : +6 exercices déterministes (spécificité, box model, délégation, nom accessible,
  choix de rendu, choix de layout), vérifiés par exécution.
- **Next.js** : 4 leçons de fondations (conceptuelles, aucune exécution réelle prétendue).
- **Reachability** : socle Web rattaché aux modules du parcours (lessonRefs, affiché sur /parcours).
- **Capstone** : mission de diagnostic transversale.

## 3. Matrice d'audit — 9 leçons du périmètre

TA=exactitude, Obj=objectif, Pré=prérequis, MM=modèle mental, Prof=profondeur, Prog=progression,
EG=exemple guidé, PA=pratique autonome, FB=feedback, EF=erreurs, PP=pertinence pro, Éval=évaluation,
CC=charge cognitive, Acc=accessibilité, Rét=rétention, TC=cohérence parcours.

| Leçon | TA | Obj | Pré | MM | Prof | Prog | EG | PA | FB | EF | PP | Éval | CC | Acc | Rét | TC | Moy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| css-flexbox ⚑ | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,75 |
| css-grid ⚑ | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,69 |
| nextjs-foundations | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 3,75 |
| nextjs-rendering | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,63 |
| nextjs-server-client-components | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,63 |
| nextjs-data-production | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,63 |
| css-fundamentals ✚ | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,75 |
| react-accessibility ✚ | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 3,81 |
| frontend-testing ✚ | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,69 |

⚑ = split approfondi · ✚ = durcie. **Moyenne globale du périmètre : 3,70.** Aucune dimension < 3 ;
dimensions dures ≥ 3.

### Honnêteté des notes
- **autonomous-practice = 3** partout : la pratique reliée est notée par MODÈLE DÉTERMINISTE
  (`frontend-model`/`react-model`/`node-js`), pas par un vrai navigateur ; pour Next.js, la pratique
  est **réflexive** (exercices « papier » de modèle mental + un exercice de choix). Plancher assumé.
- **depth = 3** pour les 4 leçons Next.js : ce sont des FONDATIONS conceptuelles, pas un cours
  exhaustif — assumé et cohérent avec le report du gros de Next.js.
- **evaluation = 3** quasi partout : marge réelle (vérification de compréhension, pas encore quiz de
  prédiction/diagnostic systématiques) — non masquée.

## 4. Évaluation qualitative par axe (pas d'« excellent » automatique)

| Axe | Verdict | Justification |
|---|---|---|
| Accessibilité néophyte | EXCELLENT | Chaque leçon part d'un problème concret ; chaîne acyclique sans saut. |
| Profondeur | FORT | Flexbox/Grid enfin approfondis (grow/shrink/basis, zones, grille implicite) ; CSS complété (flux/positionnement). Next.js volontairement au niveau fondations. |
| Exactitude technique | FORT | Concepts corrects ; Next.js sépare explicitement stable et syntaxe évolutive. |
| Progression conceptuelle | FORT | Prérequis acycliques remontant aux fondations, ordre Web→React→Next.js explicite. |
| Charge cognitive | BON | Split css-layout réduit la densité ; nextjs-data-production et server/client restent denses (cl=3). |
| Exemples | FORT | Chaque leçon : exemple guidé + contre-exemple pour les CSS. |
| Misconceptions | FORT | Instantané d'état (V36), ARIA≠substitut, `as` aveugle, tout-client, optimisation prématurée. |
| Pratique autonome | BON | Pratique reliée et vérifiée, mais notée par modèle déterministe (pas de navigateur réel) ; Next.js réflexif. |
| Transfert | BON | Exercices de CHOIX (rendu, layout) appliquant à un cas nouveau ; capstone de diagnostic. |
| Feedback | BON | Exercices : starter fautif → référence verte ; corrections attendues explicites. Feedback fin surtout côté exercices. |
| Pertinence professionnelle | FORT | Débordement mobile, formulaire accessible, régression après merge, choix de rendu : cas réels. |
| Cohérence parcours | FORT | Socle Web désormais atteignable depuis /parcours (lessonRefs). |
| Accessibilité (a11y du contenu) | FORT | react-accessibility concret (focus, tabindex, reduced-motion) ; validation clavier réelle limitée (cf. §6). |
| Qualité de l'évaluation | BON | Vérifications de compréhension présentes ; quiz de prédiction/diagnostic à généraliser (dette). |
| Honnêteté réel/simulé | EXCELLENT | Frontière explicite partout ; aucune exécution Next.js/navigateur prétendue. |
| Rétention | BON | Synthèses et « à retenir » solides ; espacement/rappel non outillés. |

## 5. Concept → couverture (extrait, trous signalés)

| Concept | Leçon | Pratique | Verdict |
|---|---|---|---|
| Flexbox (axes, grow/shrink/basis, wrap) | css-flexbox | web-nav, web-card | couvert (profond) |
| Grid (fr, repeat, minmax, zones, implicite) | css-grid | frontend-layout-choice, web-card | couvert (profond) |
| Cascade/spécificité/box model/flux/positionnement | css-fundamentals | css-specificity-order, css-box-size | couvert (profond) |
| Responsive | responsive-design | web-nav | couvert |
| DOM/événements/délégation | browser-dom-rendering | dom-event-delegation | couvert |
| Accessibilité (clavier, focus, ARIA) | react-accessibility | a11y-accessible-name | couvert (concret) |
| React (fondations→application) | react-* | react-*, react-reducer-actions | couvert |
| Tests frontend | frontend-testing | react-debug-list, playbooks | couvert (profond) |
| Performance frontend | frontend-performance | perf-pair-count | couvert |
| Next.js (framework, rendu, server/client, prod) | nextjs-* | frontend-rendering-choice | couvert (fondations) |
| Next.js avancé (API concrètes, streaming détaillé) | — | — | **trou assumé (V38)** |
| Visual regression testing | — | — | **trou assumé (mentionné, non approfondi)** |

## 6. Walkthrough néophyte + réel/simulé/non testé

- **Walkthrough** : chaîne `javascript-basics → browser-dom-rendering → html → css-fundamentals →
  css-flexbox → css-grid → responsive-design → react-* → react-application-states → nextjs-*`
  ACYCLIQUE (0 cycle), chaque leçon remonte aux fondations, tous les prérequis existent
  (nextjs-data-production remonte à 25 leçons). Aucun jargon avant définition ni prérequis circulaire
  détecté sur ces chaînes.
- **RÉEL** : exécution des exercices (référence verte, starter en échec) ; validation navigateur
  Playwright (13 pages × 5 largeurs → 65/65, overflow ≤ 2px, 0 erreur console) ; **navigation
  clavier RÉELLEMENT pilotée sur /parcours** (6 Tab → 6 éléments focusables : liens + bouton).
- **SIMULÉ** : notation `web`/`react-tsx` par modèle DOM déterministe ; contenu Next.js conceptuel
  (aucune exécution Next.js).
- **NON TESTÉ** : audit lecteur d'écran réel, `prefers-reduced-motion` réel, focus-trap réel des
  modales, Core Web Vitals réels — **non déclarés testés**.

## 7. Dette restante

- **P2** : 7 avertissements du Curriculum Graph (dépendances conceptuelles légitimes), 0 bloquant.
- **P3** : Next.js avancé (API concrètes, streaming détaillé, actions serveur) → V38 ; quiz de
  prédiction/diagnostic à généraliser (evaluation à 3) ; glossaire central à enrichir en termes Web
  Platform/Next.js (présents dans les Vocabulaires des leçons) ; validation clavier réelle limitée à
  /parcours ; audit lecteur d'écran non réalisé ; le socle visuel vit en leçons rattachées, non en
  jours dédiés (aucun jour créé — assumé).

## 8. Limites de l'audit

Notes portées par un seul auteur ; proxys structurels et qualitatifs, non une mesure d'apprentissage.
La validation navigateur observe rendu, débordement et erreurs console ; la validation clavier se
limite à ce qui a été effectivement piloté (/parcours). Aucun test A/B ni donnée d'usage réel.
