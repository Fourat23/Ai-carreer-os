# Local V1 Integrity / Local V1 Baseline — AI Career OS (2026-07-24)

> **Portée** : cette étape valide l'**intégrité locale** du socle (fonctionnement en localhost,
> installation reproductible, persistance locale, navigation, responsive minimal, documentation, tests,
> build). **Ce n'est pas** une « release publique », ni une mise en production, ni un SaaS. AI Career OS
> reste un **outil personnel exécuté en localhost**.

Ce rapport documente la résolution des 3 défauts relevés par `RELEASE_READINESS_V1.md` (renommés ici
« findings d'intégrité locale »), sans aucune modification de contenu pédagogique.

---

## 1. HEAD initial

- Branche : `claude/ai-career-os-saas-phfg49` · **HEAD initial** : `bd45702` · tree propre, synchronisé.
- Stratégie Git validée : **rester sur la branche actuelle** — aucun `main`, aucune PR, aucun
  déploiement, aucune release publique.

## 2. D1 — Responsive mobile (barre latérale fixe) — AVANT / APRÈS

**Avant** : `.layout` en flex-row avec `.sidebar` **232px fixe** (`min-width:232px`, sticky), **sans
repli mobile ni media query sidebar**. Sur 375px : contenu écrasé à **~143px** ; débordements
horizontaux sur dashboard (grilles de cartes) et pages à `<pre>`/`<table>`.

**Après** (`app/globals.css`, changements sous `@media (max-width: 640px)` + `min-width:0` sur
`.content`) :
- barre latérale **repliée au-dessus du contenu** (largeur pleine, non sticky, nav en ligne repliable) ;
- `.content { min-width: 0 }` → le flex-item rétrécit, `<pre>`/`<table>` scrollent **en interne** ;
- grilles de cartes en **1 colonne**, ligne de compétence repliée, sous 640px.
- **Desktop (>640px) inchangé.**

**Mesures réelles (Chromium headless, largeur du contenu principal)** :

| Route \ viewport | 375px | 768px | 1024px | 1440px |
|---|---|---|---|---|
| contenu (px) | **375** (pleine largeur) | 536 | 792 | 1000 |
| barre latérale | empilée (pleine largeur) | 232 (latérale) | 232 | 232 |
| barre horizontale parasite | **non** | non | non | non |
| superposition sidebar/contenu | **non** | non | non | non |

Vérifié sur **15 routes** (`/`, `/day/1`, `/day/91`, `/day/314`, `/day/365`, `/calendar`, `/glossary`,
`/skills`, `/reviews`, `/projects`, `/lessons`, `/career`, `/notes`, `/resources`, `/guide`) × 4
viewports : **0 débordement horizontal, 0 superposition**. Boutons (statut, auto-éval), toggle de
correction (`<details>`) et navigation restent accessibles.

## 3. D2 — README — AVANT / APRÈS

| Point | Avant | Après |
|---|---|---|
| Nombre de leçons | « **21 leçons** » | **60 leçons** (8 catégories réelles : Fondations 9, Web & backend 7, Data & SQL 5, SE & archi 6, Python & ML 8, IA appliquée 15, Production & DevOps 5, Portfolio & carrière 5) |
| Routes documentées | diagramme sans `/lessons`, `/glossary`, `/guide` | routes ajoutées au diagramme |
| Nature de l'app | dispersée (localhost mentionné) | **encadré explicite** : outil personnel, 100 % local, sans auth, sans base de données, sans hébergement — ni SaaS ni app publique |
| Init progression | absente | section « Initialiser la progression locale » (copie de l'exemple, comportement si absent/corrompu) |

## 4. D3 — Progression locale — AVANT / APRÈS

| Point | Avant | Après |
|---|---|---|
| Suivi Git de `data/progress.json` | **traqué** (progression versionnée ; se salissait à l'usage) | **retiré du suivi** (`git rm --cached`) + **ajouté à `.gitignore`** |
| Modèle d'init | aucun | **`data/progress.example.json`** (schéma exact, état neutre `{startDate:null,days:{},skills:{},weeklyReviews:{},monthlyReviews:{}}`) |
| Logique de persistance | — | **inchangée** (aucune modification de `lib/progress-server.ts` ni des routes API) |
| Comportement fichier présent | GET 200, forme correcte | idem (vérifié) |
| Comportement fichier absent | — | GET **200, état vide** (l'app crée le fichier au 1er suivi) — vérifié |
| Comportement fichier corrompu | — | GET **200, état vide, pas de crash, pas d'écrasement silencieux** — vérifié |
| Écriture (POST) | fonctionne | fonctionne, et **ne salit plus Git** (fichier ignoré) — vérifié |

## 5. Fichiers modifiés (liste exacte)

| Fichier | Nature | Finding |
|---|---|---|
| `app/globals.css` | UI (CSS responsive) | D1 |
| `README.md` | documentation | D2 |
| `.gitignore` | configuration | D3 |
| `data/progress.json` | **retiré du suivi** (reste en local, ignoré) | D3 |
| `data/progress.example.json` | ajouté (modèle neutre) | D3 |
| `LOCAL_V1_INTEGRITY.md` | ce rapport | doc |
| `RELEASE_READINESS_V1.md` | bandeau de renvoi ajouté | doc |

**Aucun** fichier de `curriculum/`, `scripts/`, ni `data/program.json` modifié.

## 6. Tests exécutés et résultats

| Contrôle | Commande | Résultat |
|---|---|---|
| Génération (idempotence) | `npm run generate` | 795 fichiers, **0 diff** hors horodatage (restauré) |
| Intégrité curriculum | `npm run curriculum:check` | **365/365 jours, 365 corrections, 52 semaines, 12 mois, 60 leçons** ✅ |
| Profondeur | `npm run curriculum:depth-check` | ✅ |
| Glossaire | `npm run glossary:check` | ✅ |
| Tests | `npm test` | **43/43** ✅ |
| Lint + typecheck + build | `npm run build` | **compilé, 0 erreur, 0 warning**, 18 routes ✅ |
| Liens de leçons | script | **0 cassé** |
| Scan glyphes (U+FFFD/cyrillique/géorgien) | script | **0** |
| Routes live | `curl` | `/`, jours 1/365, sections → **200** |
| Erreurs live | `curl` | routes/jours/slugs invalides → **404** |
| Persistance live | `POST`+`GET /api/progress` | écrit/relu → OK |

*(Le dépôt n'expose pas de script `lint`/`typecheck` autonome : les deux sont exécutés par
`next build`.)*

## 7. Viewports contrôlés

**375px, 768px, 1024px, 1440px** (les quatre demandés), sur 15 routes, via Chromium headless
(`playwright-core` installé en **`--no-save`**, transitoire ; `package.json`/`package-lock.json`
**inchangés**, vérifié). Résultat : aucune barre horizontale parasite, aucune superposition, contenu
consultable, boutons accessibles.

## 8. Preuve de non-régression pédagogique

- `git status` du chantier : uniquement `app/globals.css`, `README.md`, `.gitignore`,
  `data/progress.json` (retrait de suivi), `data/progress.example.json` — **aucun** `curriculum/`,
  `scripts/`, `data/program.json`.
- `npm run generate` (sources inchangées) → **0 diff** sur `curriculum/` ; `data/program.json` ne varie
  que par l'horodatage (restauré).
- `curriculum:check` **365/365**, `depth-check` OK, **43/43** tests, **60 leçons**, 0 lien cassé,
  0 glyphe cassé : le socle pédagogique (jours, corrections, leçons, revues, projets, réflexions Y2/Y3)
  est **intact**.

## 9. Limites restantes (assumées, non bloquantes)

- **Mobile = repli simple** : la barre latérale s'empile en haut (nav repliable). Pas de hamburger ni de
  drawer animé — volontairement minimal (aucun design system introduit). Suffisant pour un usage local ;
  l'ergonomie mobile fine relève du futur chantier UI/UX.
- **`--no-save playwright-core`** : outil de test transitoire présent dans `node_modules` (ignoré par
  Git) ; non ajouté aux dépendances. Sans effet sur le build ou un clone neuf.
- **Produit desktop-first par conception** : localhost, mono-utilisateur ; le responsive garantit
  désormais un usage mobile **correct** (pas de débordement), pas une expérience mobile optimisée.

## 10. Verdict

Critères d'intégrité locale :

| Critère | État |
|---|---|
| Installation reproductible | ✅ |
| Build vert (lint + typecheck inclus) | ✅ |
| Navigation 1-365 fonctionnelle | ✅ |
| Persistance locale (présent/absent/corrompu) | ✅ |
| Aucune erreur bloquante | ✅ |
| Aucune corruption de contenu | ✅ |
| Aucune barre horizontale sur mobile (375-1440) | ✅ |
| Documentation d'installation conforme | ✅ |
| Progression locale non versionnée + exemple | ✅ |
| Dépôt propre, sur la branche actuelle | ✅ |

### LOCAL V1 BASELINE VALIDÉE

Les 3 findings (D1/D2/D3) sont résolus, le pipeline est intégralement vert, le socle pédagogique est
intact. Un tag annoté `local-v1-content-stable` marque ce point de retour **avant** le futur chantier
UI/UX (ce tag n'est **pas** une release publique).
