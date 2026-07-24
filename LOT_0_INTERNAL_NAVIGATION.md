# Lot 0 — Fiabilisation de la navigation interne · AI Career OS (2026-07-24)

> Lot **fonctionnel** préalable au chantier visuel. Corrige les liens internes du contenu qui
> pointaient vers des chemins Markdown inexistants côté web (404). **Aucune refonte visuelle** :
> typographie, couleurs, espacement et layout **inchangés**. Aucun contenu pédagogique modifié.
> **Ce rapport et le code ne sont pas encore commités** (en attente de validation).

---

## 1. Cause racine

Le contenu est rendu par `marked.parse()` dans **`lib/program.ts › renderMarkdown()`**, qui émet les
`href` du Markdown **tels quels**. Or le contenu généré référence des **chemins Markdown relatifs**
(hérités d'une navigation « fichiers ») :

| Format dans le contenu | Occurrences | Résolu par le navigateur (ex. depuis `/day/241`) | Résultat |
|---|---:|---|---|
| `../solutions/day-N-solution.md` | 626 | `/solutions/day-241-solution.md` | **404** |
| `../week-N.md` / `week-N.md` | 365 / 52 | `/week-35.md` | **404** |
| `../month-N.md` / `month-N.md` | 365 / 52 | `/month-09.md` | **404** |
| `../days/day-N.md` / `days/day-N.md` | 365 / 364 | `/days/day-241.md` | **404** |
| `projects/project-N.md` | 9 | `/projects/project-01.md` | **404** |
| `year-overview.md` | 64 | `/year-overview.md` | **404** (aucune route dédiée) |

Les **vraies** routes sont `/week/35`, `/month/9`, `/day/241`, `/projects?p=01`. Confirmé en réel :
`/week-35.md` → **404**, `/week/35` → **200**.

## 2. Stratégie choisie (la plus centralisée, la moins intrusive)

Normaliser les `href` **dans la couche de rendu**, en **un seul point** (`renderMarkdown`), qui sert
**tout** le contenu (jours, corrections, semaines, mois, projets, docs). **Aucun** fichier de contenu
réécrit (les centaines de `.md` générés restent intacts → `curriculum-guard` vert).

- **`lib/internal-links.mjs`** (logique **pure**, testable, même patron que `lib/glossary-core.mjs`) :
  - `normalizeInternalHref(href)` : convertit **uniquement** les familles connues et sans ambiguïté ;
  - `rewriteHtmlLinks(html)` : réécrit les `href` des **vraies balises `<a>`** du HTML rendu.
- **`lib/internal-links.d.ts`** : types.
- **`lib/program.ts`** : `renderMarkdown` applique `rewriteHtmlLinks` à la sortie de `marked`.

**Sûreté anti-faux-positif** : `marked` n'émet pas de `<a href>` pour le **contenu des blocs de code**
(échappé) ; un `` `week-35.md` `` inline devient `<code>…</code>` sans `href`. La réécriture ne touche
donc **que** de vrais liens (vérifié par test).

## 3. Fichiers modifiés

| Fichier | Nature |
|---|---|
| `lib/internal-links.mjs` | **ajouté** — normalisation pure |
| `lib/internal-links.d.ts` | **ajouté** — types |
| `lib/program.ts` | **modifié** (3 lignes : import + `html` + `rewriteHtmlLinks(html)`) |
| `tests/internal-links.test.mjs` | **ajouté** — 15 tests ciblés |
| `LOT_0_INTERNAL_NAVIGATION.md` | **ajouté** — ce rapport |

**Aucun** changement dans `app/`, CSS, `curriculum/`, `scripts/`, `data/program.json`, ni le générateur.

## 4. Transformations supportées

| Entrée (href du contenu) | Sortie (route) |
|---|---|
| `../week-35.md`, `week-35.md`, `./week-35.md`, `../week-05.md` | `/week/35`, `/week/5` (zéros de tête retirés) |
| `../month-09.md`, `month-9.md` | `/month/9` |
| `../days/day-241.md`, `days/day-241.md`, `day-1.md` | `/day/241`, `/day/1` |
| `../solutions/day-241-solution.md` | `/day/241` *(la correction est affichée sur la page du jour)* |
| `projects/project-01.md`, `project-final.md` | `/projects?p=01`, `/projects?p=final` |
| `../week-35.md#bilan` | `/week/35#bilan` *(ancre conservée)* |
| **Inchangés** : `https://…`, `mailto:…` | identiques |
| **Inchangés** : `#objectif` (ancre), `/day/5` (route absolue) | identiques |
| **Inchangés** : `year-overview.md`, `../../`, `.md` non reconnu | identiques *(jamais de mauvaise redirection silencieuse)* |

## 5. Preuves de navigation (réel, Chromium)

- **Liens `.md` restants** sur `/day/{5,7,72,241,340}` : **0**.
- **Hrefs rendus** sur `/day/241` : `/week/35`, `/month/9`, `/day/241` (correction), `/day/240`,
  `/day/242` — **plus aucun `.md`**.
- **Clics réels** sur 3 jours représentatifs (5, 241, 340) :
  - « Semaine » → `/week/1`, `/week/35`, `/week/49` → **page Semaine ouverte** ✅ ;
  - « Mois » → `/month/1`, `/month/9`, `/month/12` → **page Mois ouverte** ✅ ;
  - boutons **précédent/suivant** → `/day/N±1` ✅ ; **nav globale** (sidebar) fonctionnelle ✅.
- **Routes cibles** : `/week/35` **200**, `/month/9` **200** (vs `.md` **404** avant).

## 6. Résultats des tests et des gates

- **Tests ciblés** `tests/internal-links.test.mjs` : **15/15** (semaine relative, mois relatif, jour,
  correction, projet, externe, ancre, `.md` non reconnu, variantes `./` et `../`, zéros de tête,
  suffixe d'ancre, cas vides, `rewriteHtmlLinks` sur `<a>` réels **et** non-réécriture des blocs de code).
- **Suite complète** : **58/58** (43 existants + 15 nouveaux).
- **curriculum-guard** (vs `local-v1-content-stable`) : ✅ **0 dérive pédagogique**.
- **generate idempotent** ✅ · **curriculum:check** 365/365, 60 leçons ✅ · **depth-check** ✅ ·
  **glossary:check** ✅ · **build** (lint+typecheck) **0 erreur / 0 warning** ✅ · 0 lien de leçon
  cassé · 0 caractère invalide.
- **`typescript-lsp`** a détecté (et fait corriger) un paramètre inutilisé pendant l'écriture — diagnostic
  intégré au flux.

## 7. Limites restantes

- **`year-overview.md`** (64 liens) : **aucune route dédiée** dans l'app (le set `ALLOWED` de
  `/doc/[...slug]` ne l'inclut pas). Conformément à la règle « ne pas transformer vers une mauvaise
  route », ces liens sont **laissés inchangés** (ils restent 404). Les activer relèverait d'un autre lot
  (ajouter `year-overview` aux docs autorisés) — **hors périmètre Lot 0**.
- **Lien « Correction »** → `/day/N` : ouvre la **bonne page** (la correction y est affichée dans le
  `<details>`) mais ne déplie pas / ne fait pas défiler automatiquement vers elle (pas d'ancre dédiée
  aujourd'hui). Amélioration possible ultérieure (ancre sur le bloc correction).
- **`/favicon.ico` → 404** : **pré-existant** (l'app n'embarque pas de favicon), **sans rapport** avec
  ce lot (le diff ne touche aucun asset). Seule « erreur » console au chargement ; cosmétique, hors
  périmètre.
- Les requêtes `?_rsc=…` en échec observées pendant la navigation rapide sont des **prefetches Next.js
  annulés** (la requête RSC renvoie **200** quand elle aboutit) — comportement normal, non lié au lot.

## 8. Verdict

Lot 0 **implémenté et validé en réel** : les liens internes du contenu (semaine / mois / jour /
correction / projet) conduisent désormais aux routes réelles ; **0 lien `.md` cassé** sur les jours
testés ; pipeline entièrement vert ; **contenu pédagogique intact**. Correction **centralisée** (3
lignes + un utilitaire pur testé), **réversible**, strictement dans la couche de rendu.

**En attente de validation explicite avant commit.** Aucun commit effectué. Le **Lot 1** (visuel) n'est
pas commencé.
