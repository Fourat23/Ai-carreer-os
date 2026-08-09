# ADR-036 — Fondations Web Platform + parcours Frontend Engineer

Statut : accepté (Sprint V36). Décision fondée sur l'audit CP0 réel. **Priorité : pédagogie >
cohérence du curriculum > compréhension néophyte > pratique > transfert professionnel > évaluation
> features > UI.** Local, mono-utilisateur, sans auth/SaaS/réseau, **une seule source de vérité**,
sans faux navigateur ni faux runtime.

## Problème (établi au CP0)

Le prompt V36 supposait un Frontend « beaucoup moins structuré » se réduisant à « quelques leçons
React ». L'audit CP0 **corrige et précise** ce diagnostic :

- **React est en réalité bien couvert** : 3 leçons canoniques (react-fundamentals,
  react-hooks-effects, react-composition-architecture) + react-accessibility, **15 exercices
  `react-tsx`**, et un bloc de jours réels 87-112 (composants, useState, useEffect, formulaires,
  routing, Context, perf, a11y, tests Vitest, Projet 3 BiblioApp).
- **Le DOM et le navigateur** ont une leçon (browser-dom-rendering) + 11 exercices `web`.
- **Le vrai trou est la plateforme web VISUELLE** : il n'existe **aucune leçon canonique** pour
  HTML sémantique, CSS (cascade/spécificité/box model), la mise en page (Flexbox/Grid) ni le
  responsive. Le programme saute de JavaScript à React sans jamais enseigner HTML/CSS/layout.

## Constat décisif

Le mécanisme d'ajout de leçons est **déjà** en place et suffisant : une leçon = un fichier
`curriculum/lessons/<slug>.md` (`<!-- keep -->`, non écrasé par `generate`) **enregistré** dans
`scripts/data/lessons-map.mjs` (`LESSONS`). Cet enregistrement alimente automatiquement : le corpus
du Curriculum Graph (`program.lessons`), la page `/lessons` (regroupée par `cat`), les routes
`/doc/lessons/<slug>`, et les liens de prérequis/pratique. **Aucun nouveau moteur n'est requis.** La
composition de parcours par jours **non contigus** existe déjà (ADR-035, `Array.isArray(from)`).

## Décision

### D1 — Créer un socle de leçons « Web Platform » (le vrai gap P0)
Créer les leçons canoniques manquantes de la plateforme web visuelle, au standard académique V36,
reliées à la **pratique existante** (`web-*`) avant toute création d'exercice :
- `html-semantic-structure` (P0) — structurer une page ; balises sémantiques ; arbre DOM vs source.
- `css-fundamentals` (P0) — cascade, héritage, spécificité, box model, unités.
- `css-layout-flexbox-grid` (P0) — Flexbox (1D) et Grid (2D) ; quand utiliser lequel.
- `responsive-design` (P0) — viewport, media queries, mobile-first, contenu fluide.
- `web-forms-validation` (P1) — formulaires natifs, validation navigateur, accessibilité des champs.

Chaque leçon existe **parce qu'un concept métier essentiel n'a pas de leçon canonique**, pas pour
gonfler un compteur. Le découpage est pédagogique (5 leçons, pas une par puce du prompt).

### D2 — Combler les ponts P1 réellement absents, sans dupliquer
- `typescript-frontend` (P1) — TypeScript **appliqué au front** : props/events typés, données API,
  narrowing, frontières de confiance. Ne recrée PAS `typescript-basics` (général) ; le référence en
  prérequis.
Les événements DOM (propagation/délégation) sont **déjà** dans browser-dom-rendering → **durcir**
cette leçon si l'audit révèle un manque, pas créer une leçon concurrente.

### D3 — Auditer/durcir React sans le dupliquer
React étant déjà couvert, V36 **audite** les 4 leçons React et ne **durcit** (additif : on-ramp
manquant, prérequis, modèle mental anti-misconception « setState est synchrone », état dérivé,
stale closure) que si l'audit CP0-D/CP5 le justifie. **Aucune nouvelle leçon React** sauf trou avéré
(candidat unique éventuel : `react-application-state` — Context/reducer/routing/états
loading-error-empty — SEULEMENT si react-composition-architecture ne les couvre pas assez).

### D4 — Tests / performance / production / Next.js : compléter les vrais trous seulement
`testing-foundations` existe (général). Créer une leçon **frontend testing** uniquement si le
transfert composant/intégration/E2E n'est pas enseignable via l'existant. Next.js : fondations
**minimales** uniquement si le socle est mûr, sinon **backlog V37** documenté (pas de cours Next.js
géant au détriment des fondamentaux).

### D5 — Parcours `frontend-engineer-v1` : activer SUR PREUVE, sinon rester annoncé
Composer via le mécanisme **non contigu existant** (`frontendModules(program)`) les jours du socle
frontend : JS (8-14), TS (36-49), HTTP côté front (50-56), bloc React 87-112, Projet 3 (113-119).
**Critère d'activation** : chaîne débutant→junior cohérente, prérequis respectés, 0 trou P0 dans le
corpus de leçons, concepts critiques pratiqués, projet intégrateur, graphe sans anomalie bloquante,
walkthrough néophyte de bout en bout. **Blocker honnête** : les *jours* n'enseignent pas HTML/CSS
(le socle visuel vit dans les *leçons* ajoutées, reliées au corpus/graphe et référencées par les
jours React pertinents). Si ce blocker rend le parcours-par-jours incohérent, il **reste annoncé**
avec matrice de couverture publiée. **Aucun greenwashing.**

### D6 — Réel vs simulé, sécurité
Les exercices `web`/`react-tsx` sont **notés par modèle déterministe** (`frontend-model`,
`react-model`) — **jamais** un vrai navigateur ; étiquetés en conséquence. Chromium/Playwright ne
sert qu'aux **validations responsive** (observations réelles limitées à ce qui est effectivement
piloté). Aucune dépendance lourde, aucun `eval`/`exec`, aucun secret.

## Options rejetées
- **Créer 20+ leçons frontend pour « faire un vrai cursus »** : gonflage ; React/DOM déjà couverts.
- **Créer un second moteur de leçons ou de parcours (Track Architecture V3)** : inutile, le
  mécanisme existant suffit.
- **Activer le parcours coûte que coûte** : greenwashing si le socle jours reste incohérent.
- **Transformer V36 en cours Next.js** : hors priorité ; reporté si le socle n'est pas mûr.

## Conséquences
+ Le corpus gagne un **socle Web Platform** franchissable par un néophyte (HTML→CSS→layout→responsive)
  qui manquait, relié à la pratique existante.
+ React est consolidé sans duplication.
− Les nouvelles leçons Web Platform ne sont pas attachées à des *jours* dédiés (le programme 365 j
  n'en a pas) : limite documentée, sans création de jours.
= Aucune régression : gates, graphe et tests restent verts ; `progress.json` restauré.
