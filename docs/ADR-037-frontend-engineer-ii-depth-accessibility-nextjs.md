# ADR-037 — Frontend Engineer II : profondeur, accessibilité, Next.js

Statut : accepté (Sprint V37). Décision fondée sur l'audit CP0 réel. **Priorité : pédagogie >
cohérence du curriculum > pratique > qualité technique > features > quantité.** Local, mono-utilisateur,
sans auth/SaaS/réseau, **une seule source de vérité**, sans faux navigateur/serveur.

## Problème (établi au CP0)

V36 a créé un socle Frontend « Web Platform » structurellement conforme, mais l'audit de profondeur
révèle que la conformité structurelle ≠ maîtrise. Trois manques réels :

1. **`css-layout-flexbox-grid` est trop large ET trop peu profond** : une seule leçon tente de couvrir
   Flexbox (axes, `grow/shrink/basis`, wrap) ET Grid (tracks, grille explicite/implicite, `fr`,
   `repeat`, `minmax`, auto-placement, `grid-template-areas`). Résultat : chaque système reste survolé.
2. **`css-fundamentals` omet le flux normal, `display`, le positionnement et `overflow`** — des
   fondations pourtant nécessaires AVANT la mise en page.
3. **La pratique Web est trop mince** : aucun exercice dédié à la cascade/spécificité, au box model, à
   Flexbox, à Grid, à la délégation d'événements, ni au débordement responsive.
4. **Accessibilité partiellement théorique** : `react-accessibility` couvre clavier/focus/ARIA mais pas
   l'ordre de tabulation, la gestion du focus ni `prefers-reduced-motion`.
5. **Reachability learner** : les leçons Web Platform ne sont pas rattachées aux jours du parcours
   `frontend-engineer-v1` — l'apprenant doit « deviner » d'aller les lire.
6. **Next.js** absent.

## Décisions

### D1 — SPLIT `css-layout-flexbox-grid` → `css-flexbox` + `css-grid`
Le split est justifié par la DENSITÉ conceptuelle (deux systèmes distincts), pas par la taille de
fichier. `css-flexbox` (1D, approfondi : axes principal/secondaire, `justify/align`, `flex-grow/shrink/basis`,
`flex-wrap`, `min-width:auto`) et `css-grid` (2D, approfondi : tracks, grille explicite/implicite,
`fr`, `repeat`, `minmax`, auto-placement, `grid-template-areas`), plus une section « Flex vs Grid :
lequel choisir ». L'ancienne leçon combinée est **remplacée** (pas conservée en doublon) ; la chaîne de
prérequis et les `practiceRefs` sont repointés. `responsive-design` dépend désormais des deux.

### D2 — DURCIR `css-fundamentals` (flux normal, display, positionnement, overflow)
Ajout additif d'une explication du **flux normal**, de `display` (block/inline/inline-block/none), du
**positionnement** (static/relative/absolute/fixed/sticky au niveau conceptuel) et d'`overflow` — les
briques manquantes entre le box model et la mise en page.

### D3 — Pratique Web ciblée (trous confirmés uniquement)
Créer un petit nombre d'exercices déterministes pour les concepts sans pratique (cascade/spécificité,
box model, Flexbox, Grid, délégation d'événements, overflow), en réutilisant les runtimes `web`/`node-js`
existants. Chaque exercice : starter fautif, référence verte, ≥1 public + ≥1 privé, vérifié par exécution.
Aucun quota ; on ne crée que les trous prouvés.

### D4 — Approfondir l'accessibilité (compétence, pas chapitre théorique)
Durcir `react-accessibility` : ordre de tabulation, gestion et visibilité du focus, `prefers-reduced-motion`,
modèle mental du lecteur d'écran, ARIA UNIQUEMENT en complément du HTML natif (jamais en substitut).
Si Chromium/Playwright est réellement disponible, VALIDER la navigation clavier/focus de surfaces
contrôlées ; sinon, documenter la limite. **Ne jamais prétendre** avoir fait un audit lecteur d'écran.

### D5 — React & Testing : audit, durcissement seulement si trou avéré
React est déjà solide (V36 a ajouté « l'état est un instantané »). `frontend-testing` /
`frontend-performance` sont solides. Audit léger ; durcir uniquement un anti-pattern réellement absent.
**Aucune nouvelle leçon React** sauf trou avéré.

### D6 — Next.js fondations (3-5 leçons, concepts avant syntaxe)
Créer une petite chaîne de haute qualité UNIQUEMENT après validation du socle (CP3→CP7) : pourquoi un
framework ; routing par fichiers ; rendu (CSR/SSR/SSG/streaming au niveau conceptuel) ; Server vs Client
Components (modèle mental) ; data fetching/cache/revalidation (fondamental) ; erreurs/loading/not-found ;
frontière client/serveur ; environnement/secrets ; déploiement conceptuel. Séparer explicitement
**concepts stables** et **syntaxe susceptible d'évoluer** ; aucune exécution Next.js réelle prétendue.

### D7 — Rattacher le socle Web au parcours (reachability), sans dupliquer de jours
Rendre les leçons Web Platform **suivables depuis `frontend-engineer-v1`** : rattacher les leçons aux
modules du parcours (métadonnée additive `lessonRefs` sur les modules frontend, exposée par le read
model), plutôt que de créer des jours HTML/CSS ou de dupliquer les 365 jours. Évolution **additive** du
modèle de parcours si nécessaire ; préférée à un « v2 » incompatible.

### D8 — Réel vs simulé, sécurité
Notation `web`/`react-tsx` par modèle déterministe (jamais un vrai navigateur). Validation responsive
Playwright limitée aux observations réellement pilotées. Aucune dépendance lourde, aucun `eval`, aucun
secret, aucun faux runtime Next.js.

## Options rejetées
- **Fragmenter react-application-states / frontend-testing en micro-leçons** : ces topics restent
  cohérents en une leçon ; seul css-layout justifie un split par densité.
- **Créer un parcours frontend v2** : l'évolution additive du parcours existant suffit (D7).
- **Cours Next.js exhaustif** : hors priorité ; réduit avant l'effort pédagogique en cas d'arbitrage.
- **Gonfler la pratique à quota** : on ne crée que les trous prouvés.

## Conséquences
+ Flexbox et Grid gagnent la profondeur qui manquait ; css-fundamentals devient complet.
+ La pratique Web couvre enfin les concepts visuels ; l'accessibilité devient concrète.
+ Le socle Web devient réellement atteignable depuis le parcours.
+ Next.js introduit sans court-circuiter les fondamentaux.
− Léger surcroît de leçons (split + Next.js), justifié concept par concept.
= Gates, graphe, tests restent verts ; `progress.json` restauré ; aucun jour créé.
