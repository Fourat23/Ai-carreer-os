# Lot 0B — Implémentation : accès à la vue d'ensemble annuelle · AI Career OS (2026-07-24)

> Option **B** validée. Rend accessible le document annuel **existant** à `/doc/year-overview` et
> normalise les liens documentaires internes **réellement identifiés** par le diagnostic. **Aucun** CSS,
> composant visuel, contenu de curriculum, script de génération ou `data/` modifié. Le Lot 1 n'est pas
> commencé.

---

## 1. Cause racine (rappel)

`curriculum/year-overview.md` **existe** et est **généré** (`renderYearOverview()`), et les 64
fils d'Ariane « Vue d'ensemble » (52 semaines + 12 mois) sont **eux aussi générés** vers
`year-overview.md`. Mais **aucune route ne servait ce fichier racine** : il n'était pas dans l'allowlist
`ALLOWED` de `/doc/[...slug]`. → chaque lien se résolvait en `/year-overview.md` → **404**. Cause :
**route jamais implémentée** (document + liens valides, accès manquant).

## 2. Fichiers modifiés (périmètre exact)

| Fichier | Nature | Changement |
|---|---|---|
| `app/doc/[...slug]/page.tsx` | route documentaire | **+1 mot** : `'year-overview'` ajouté à `ALLOWED` |
| `lib/internal-links.mjs` | normalisation (Lot 0) | `DOC_DIRS` + `parentDir` + 2 branches (year-overview, doc-family) |
| `tests/internal-links.test.mjs` | tests | tests Lot 0B + mise à jour du test « inconnu » |

**Aucun** autre fichier. **Pas** de CSS, **pas** de composant visuel (hors la ligne `ALLOWED`), **pas**
de `curriculum/`, `scripts/`, générateur, `data/`, ni `.d.ts` (les signatures publiques n'ont pas changé).

## 3. Transformations exactes

**Route** : `ALLOWED` passe de `{methodology, rubrics, resources, career, lessons}` à
`{…, year-overview}` → `/doc/year-overview` rend `curriculum/year-overview.md` via `getDocHtml` →
`renderMarkdown` (style `.prose` existant, garde anti-traversée déjà présente).

**Normalisation** (ajoutée, sans toucher les fichiers Markdown) :

| Entrée (href du contenu) | Sortie |
|---|---|
| `year-overview.md`, `./year-overview.md`, `../year-overview.md` | `/doc/year-overview` |
| `../year-overview.md#les-12-mois` | `/doc/year-overview#les-12-mois` *(ancre conservée)* |
| `methodology/<nom>.md`, `career/<nom>.md`, `rubrics/<nom>.md`, `resources/<nom>.md`, `lessons/<nom>.md` (avec `./`, `../`) | `/doc/<dossier>/<nom>` |
| `<dossier-inconnu>/<nom>.md` (ex. `other/thing.md`) | **inchangé** *(pas de généralisation arbitraire)* |
| `<nom>.md` à la racine sans dossier connu (ex. `how-to-learn.md`) | **inchangé** *(on n'invente pas de dossier)* |

La conversion doc-family est **restreinte** aux familles réellement servies par la route
(`DOC_DIRS`, miroir de `ALLOWED`). **Préservés** : ancres `#…`, liens externes, routes absolues,
`.md` non reconnus, et **toutes** les normalisations du Lot 0 (week/month/day/solution/project).

## 4. Résultats des tests

- **Ciblés** `tests/internal-links.test.mjs` : **21/21** (year-overview `./`+`../`+nu, ancre conservée,
  les 5 familles doc, variantes `../`/`./`, dossier non servi → inchangé, `.md` racine inconnu →
  inchangé, **non-régression** week/month/day/solution/project, externes/ancres inchangés).
- **Suite complète** : **64/64** (58 précédents + 6 nouveaux Lot 0B).
- **curriculum-guard** : **0 dérive pédagogique**. **generate idempotent** · **curriculum:check**
  365/365 + 60 leçons · **depth-check** · **glossary:check** · **build (lint+typecheck) 0 erreur / 0
  warning** · 0 lien de leçon cassé · 0 caractère invalide.

## 5. Preuves Chromium

- **`/doc/year-overview` → 200**, H1 rendu : « AI Career OS — Vue d'ensemble de l'année ».
- **Fils d'Ariane** : sur `/week/35` et `/month/9`, le lien « Vue d'ensemble » a `href="/doc/year-overview"` ;
  **clic réel** → atterrit sur la page annuelle (H1 correct) ✅.
- **12 liens mensuels** de la page annuelle → `/month/1..12` ; **clic** → page Mois (200) ✅.
- **5 liens doc-family** → `/doc/methodology/how-to-learn`, `/doc/methodology/how-to-use-ai-without-dependency`,
  `/doc/career/cv-linkedin-strategy`, `/doc/rubrics/skills-scorecard`, `/doc/resources/resources` — **tous
  200** ; **clic** → bonne page ✅.
- **0 href `.md` résiduel** sur `/doc/year-overview`, `/week/35`, `/month/9`.
- **Console** : au chargement, `/week/35` → **0 erreur** ; `/doc/year-overview` → **1** = le **favicon
  404 pré-existant** (hors périmètre). **Aucune nouvelle erreur pertinente.** (Les échecs `?_rsc=` vus
  pendant une navigation rapide sont des prefetches Next.js annulés — 200 quand ils aboutissent.)

## 6. Critères d'acceptation — état

| Critère | État |
|---|---|
| `/doc/year-overview` → 200 | ✅ |
| Document annuel réellement rendu | ✅ (H1 correct) |
| 64 fils d'Ariane réparés | ✅ (breadcrumbs → `/doc/year-overview`, 0 `.md`) |
| 12 liens mensuels fonctionnels | ✅ (`/month/1..12`) |
| 5 liens doc-family fonctionnels | ✅ (200) |
| 0 régression du Lot 0 | ✅ (tests de non-régression verts) |
| curriculum-guard : 0 dérive | ✅ |
| tests + build verts | ✅ (64/64, 0 warning) |
| aucun changement UI/CSS/curriculum/générateur | ✅ |

## 7. Exclusions (conformes à la consigne)

`favicon.ico` (404 pré-existant) · ouverture automatique du bloc Correction · toute modification
UI/CSS/visuelle · redirection vers `/calendar` ou le Dashboard · Lot 1 · nouvelle vue annuelle
(on réutilise le document existant).

---

**Statut : Lot 0B implémenté, testé et validé en réel. Les 64 (+ 5 internes) liens résolvent en routes
200 ; contenu pédagogique intact ; pipeline vert.**
