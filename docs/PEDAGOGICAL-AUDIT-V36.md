# Audit pédagogique — Sprint V36 (Frontend Engineer)

> Reconstruction du socle Frontend : création d'une colonne « Web Platform » (HTML → CSS → mise en
> page → responsive → formulaires → TypeScript front) et d'une couche « application » (routing,
> useReducer, états d'écran, tests, performance), durcissement React, puis activation du parcours
> `frontend-engineer-v1` sur preuve. Document en français, factuel, sans langage promotionnel.

## 1. Méthodologie

L'audit sépare strictement trois choses (rubrique v20, `lib/pedagogy-audit.mjs`) :

1. **La rubrique** — 16 dimensions, échelle 0-4, notées par un **humain** à la **lecture intégrale**
   de chaque leçon. Une occurrence de mot-clé n'est jamais une preuve d'enseignement ; une longueur
   n'est jamais une qualité.
2. **Les signaux structurels** — présence des composants (on-ramp, prérequis rédigés, modèle mental,
   exemple guidé, erreurs fréquentes, à retenir, vocabulaire, liens). Ils informent, ils ne notent pas.
3. **Les signaux de danger** — commande destructive non signalée, promesse trompeuse, code tronqué,
   placeholder d'authoring. Bloquants quelle que soit la moyenne.

Seuils appliqués : aucune dimension < 2 ; dimensions dures (technical-accuracy, objective,
progression, autonomous-practice) ≥ 3 ; moyenne récente ≥ 3,25. Registre
`docs/architecture/v36-pedagogy-audit.json`, validé par `validateAuditLedger`
(`tests/v36-pedagogy.test.mjs`). Le gate `v36:check` valide la STRUCTURE, pas la profondeur.

Les scores sont des **proxys** : ils ne mesurent pas directement l'apprentissage d'un humain réel.

## 2. Constat de départ (CP0)

L'hypothèse du prompt (« quelques leçons React ») a été **corrigée par l'audit** : React était en
réalité bien couvert (3 leçons + react-accessibility, 15 exercices `react-tsx`, jours 87-112). Le
**vrai trou P0** était la **plateforme web visuelle** : aucune leçon canonique pour HTML sémantique,
CSS (cascade/box model), la mise en page (Flexbox/Grid) ni le responsive. Le programme sautait de
JavaScript à React sans jamais enseigner HTML/CSS.

## 3. Ce qui a été fait

- **9 leçons créées** (socle Web Platform + couche application) ;
- **2 leçons durcies** (browser-dom-rendering, react-fundamentals) ;
- **2 exercices** (garde de type API, reducer pur), **1 mission** intégratrice, **1 playbook** ;
- **parcours `frontend-engineer-v1` activé** (7 modules, 54 jours) sur preuve.

## 4. Matrice d'audit — 11 leçons du périmètre

Notes humaines (0-4). TA=exactitude, Obj=objectif, Pré=prérequis, MM=modèle mental, Prof=profondeur,
Prog=progression, EG=exemple guidé, PA=pratique autonome, FB=feedback, EF=erreurs, PP=pertinence pro,
Éval=évaluation, CC=charge cognitive, Acc=accessibilité, Rét=rétention, TC=cohérence parcours.

| Leçon | TA | Obj | Pré | MM | Prof | Prog | EG | PA | FB | EF | PP | Éval | CC | Acc | Rét | TC | Moy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| html-semantic-structure | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 3,75 |
| css-fundamentals | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,69 |
| css-layout-flexbox-grid ⚑ | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,63 |
| responsive-design | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,69 |
| web-forms-validation | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,63 |
| typescript-frontend | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,63 |
| react-application-states | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,63 |
| frontend-testing | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,63 |
| frontend-performance | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,63 |
| browser-dom-rendering ✚ | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 3,75 |
| react-fundamentals ✚ | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,75 |

⚑ = leçon **critique** V36 · ✚ = leçon **durcie**. **Moyenne globale du périmètre : 3,67** (cible ≥ 3,6
atteinte). Aucune dimension < 3 ; toutes les dimensions dures ≥ 3.

### Honnêteté des notes (pas de gonflage)

- **autonomous-practice = 3** partout (sauf react-fundamentals=4) : la pratique reliée existe
  (exercices `web`/`react-tsx`), mais elle est **notée par un modèle déterministe** (`frontend-model`/
  `react-model`), **pas par un vrai navigateur** — le plancher 3 est assumé, pas gonflé à 4.
- **depth = 3** partout : chaque leçon couvre bien son périmètre sans prétendre à l'exhaustivité d'un
  cours dédié.
- **evaluation = 3** et **cognitive-load = 3** (sauf html/dom = 4) : marge réelle, non masquée — les
  leçons CSS/layout sont denses et l'évaluation reste au niveau « vérification de compréhension ».

## 5. Meilleurs contenus / contenus encore perfectibles

- **Les plus solides** : html-semantic-structure, browser-dom-rendering, react-fundamentals (3,75) —
  modèle mental fort, néophyte-first, misconceptions déconstruites (« l'état est un instantané »).
- **Perfectibles** : css-layout / forms / react-application-states restent à 3 sur rétention et
  évaluation — des quiz de prédiction/diagnostic supplémentaires les feraient progresser (piste V37).

## 6. Exemple de correction appliquée

`react-fundamentals` n'abordait pas la misconception « le setter modifie immédiatement la variable ».
Ajout d'une déconstruction explicite : l'état est un **instantané** figé pour le rendu courant,
`setN(n+1)` appelé deux fois n'ajoute que 1, d'où la **forme updater** `setN(c => c+1)` — plus une
erreur fréquente et le vocabulaire associés. De même, `browser-dom-rendering` a reçu une sous-section
**propagation/délégation** (bubbling, `event.target`, `closest`) qui manquait totalement.

## 7. Couverture conceptuelle (avant → après)

| Concept | Avant V36 | Après V36 |
|---|---|---|
| HTML sémantique | aucune leçon | ✅ html-semantic-structure |
| CSS cascade/box model | aucune | ✅ css-fundamentals |
| Mise en page (Flexbox/Grid) | aucune | ✅ css-layout-flexbox-grid |
| Responsive / media queries | aucune | ✅ responsive-design |
| Formulaires natifs & validation | partiel (exo) | ✅ web-forms-validation |
| Événements (propagation/délégation) | absent | ✅ (browser-dom-rendering durci) |
| TypeScript côté frontend | général | ✅ typescript-frontend |
| React : instantané d'état | absent | ✅ (react-fundamentals durci) |
| React application (routing/reducer/états) | partiel | ✅ react-application-states |
| Tests frontend (comportement) | général | ✅ frontend-testing |
| Performance frontend | partiel | ✅ frontend-performance |
| Next.js | absent | ❌ reporté V37 (documenté) |

## 8. Couverture pratique

26 exercices frontend préexistants (15 `react-tsx` + 11 `web`) **réutilisés** ; **+2** ciblés
(`ts-frontend-guard` : `unknown` → garde de type ; `react-reducer-actions` : reducer pur), vérifiés
par exécution (référence 5/5 verte, starter échoue ≥ 1 test public), reliés à des jours réels.
Mission intégratrice `frontend-accessible-search` (4 états d'écran, accessibilité, responsive) et
playbook `frontend-infinite-render` (boucle useEffect) ajoutés.

## 9. Cohérence du parcours (walkthrough néophyte)

La chaîne de prérequis est **acyclique** et remonte aux fondations. Un débutant complet progresse
sans saut :

```
javascript-basics → browser-dom-rendering → html-semantic-structure → css-fundamentals
→ css-layout-flexbox-grid → responsive-design         (socle Web Platform)
javascript-basics → browser-dom-rendering → react-fundamentals → react-hooks-effects
→ react-composition-architecture → react-application-states   (React → application)
```

Départ : « un site s'affiche dans un navigateur, mais je ne sais pas ce qu'est le DOM ni un
composant. » Arrivée : « je peux structurer une page accessible, la mettre en page et la rendre
responsive, typer mes données d'API, construire une application React (routing, état, 4 états
d'écran), la tester par comportement et raisonner sa performance. » Aucun saut conceptuel, jargon
prématuré ou prérequis caché détecté sur cette chaîne.

## 10. Réel / simulé / non testé

- **RÉEL** : exécution des exercices (`ts-frontend-guard`, `react-reducer-actions`) via le vrai
  harnais ; validation navigateur Playwright (12 pages × 5 largeurs → 60/60, overflow ≤ 2px).
- **SIMULÉ** : la notation des exercices `web`/`react-tsx` (modèle DOM déterministe, `react-dom/server`)
  — **pas de vrai navigateur ni d'interaction clavier pilotée**.
- **NON TESTÉ** : accessibilité clavier réelle (non pilotée en E2E), Core Web Vitals réels,
  performance de rendu réelle. Ces points ne sont donc PAS déclarés « testés ».

## 11. Dette restante

- **P3** : Next.js (aucune leçon — reporté V37) ; enrichissement du glossaire central en termes
  Web Platform (cascade, spécificité, box model, Flexbox, Grid, media query, CWV… présents dans les
  Vocabulaires des leçons mais pas tous dans le glossaire) ; rétention/évaluation à 3 sur plusieurs
  leçons (quiz de prédiction/diagnostic à ajouter) ; le socle visuel vit dans les LEÇONS, non dans
  des jours dédiés (le programme 365 j n'a pas de jours HTML/CSS — aucun jour créé).
- **P2** : 7 avertissements du Curriculum Graph (dépendances conceptuelles légitimes), 0 bloquant.

## 12. Limites de l'audit

Les notes sont portées par un seul auteur et constituent des proxys structurels et qualitatifs, non
une mesure d'apprentissage humain. La validation navigateur observe le rendu et l'absence de
débordement/erreurs console ; elle ne teste ni l'accessibilité clavier réelle ni les performances
perçues. Aucun test A/B, aucune donnée d'usage réel.
