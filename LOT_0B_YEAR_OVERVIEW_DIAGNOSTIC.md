# Lot 0B — Diagnostic des liens `year-overview.md` · AI Career OS (2026-07-24)

> **Phase de diagnostic uniquement.** Aucun code, CSS, composant, contenu de curriculum ou générateur
> modifié. Seul fichier écrit : ce rapport. Aucun commit sans validation. Le Lot 1 (UI/UX) n'est pas
> commencé.

---

## 0. État de départ (vérifié)

- Branche `claude/ai-career-os-saas-phfg49` · **HEAD `54df5eb`** · working tree **propre** ·
  `local == origin`.
- Lot 0 terminé (liens week/month/day/solution/project normalisés). `curriculum-guard` ✅ (0 dérive) ·
  `local-verify` ✅ (**58/58** tests, build OK, 365/365 jours, 60 leçons).
- Plugins `frontend-design` + `typescript-lsp` actifs ; 4 Skills projet présents.

## 1. Inventaire des 64 liens

| Fichier source | Écran | Texte visible du lien | Occurrences | href |
|---|---|---|---:|---|
| `curriculum/week-*.md` | Vue Semaine (`/week/[id]`) | **« Vue d'ensemble »** | **52** (1/semaine) | `year-overview.md` |
| `curriculum/month-*.md` | Vue Mois (`/month/[id]`) | **« ← Vue d'ensemble »** | **12** (1/mois) | `year-overview.md` |
| **Total** | | | **64** | |

**Contexte pédagogique** : ce sont des **fils d'Ariane** (breadcrumbs) en tête de page qui remontent la
hiérarchie du programme : Jour → Semaine → Mois → **Vue d'ensemble de l'année**. Exemples réels :
- Semaine : `[← Mois 9](month-09.md) · [Vue d'ensemble](year-overview.md)`
- Mois : `[← Vue d'ensemble](year-overview.md)`

**Destination attendue** : la page de **synthèse annuelle** du programme. Elle **existe déjà** comme
contenu : `curriculum/year-overview.md` (« # AI Career OS — Vue d'ensemble de l'année » : principe
6+1 j/sem, les 12 mois, les 20 compétences 0-5, les projets portfolio, ressources & méthode).

## 2. Cause racine — **route jamais implémentée**

- `curriculum/year-overview.md` **existe** et est **généré** par le générateur
  (`scripts/generate-curriculum.mjs:707` → `renderYearOverview()`). Les 64 liens sont **eux aussi
  générés** (`:581` pour les semaines, `:611` pour les mois). L'intention des liens est donc **valide**.
- **Aucune route web ne sert ce fichier.** La route documentaire `/doc/[...slug]`
  (`app/doc/[...slug]/page.tsx`) n'autorise que `ALLOWED = {methodology, rubrics, resources, career,
  lessons}` — `year-overview` (fichier à la **racine** de `curriculum/`) n'y figure pas, et il n'existe
  pas de route `/year`. → chaque lien se résout en `/year-overview.md` → **404**.
- **Preuve** : `/doc/year-overview` renvoie **404 aujourd'hui uniquement à cause de l'allowlist**
  (`getDocHtml('year-overview.md')` lirait bien `curriculum/year-overview.md`, qui existe et est du
  Markdown valide).

**Conclusion** : ce n'est **pas** un ancien nom de fichier ni un lien documentaire sans équivalent —
c'est un **document existant + liens valides, dont la route d'accès n'a jamais été créée**.

### Découverte liée (à cadrer)
`year-overview.md` contient lui-même **17 liens internes** : **12 × `month-NN.md`** (déjà réparés par le
Lot 0 → `/month/N`) **et 5 liens « doc-family »** — `methodology/how-to-learn.md`,
`methodology/how-to-use-ai-without-dependency.md`, `career/cv-linkedin-strategy.md`,
`rubrics/skills-scorecard.md`, `resources/resources.md` — **non gérés** par le Lot 0. Ces 5 liens sont
**les seuls** liens doc-family de tout le contenu (nulle part ailleurs). Leurs cibles `/doc/<dir>/<name>`
**répondent 200 aujourd'hui** (vérifié) — il ne manque que la conversion `<dir>/<name>.md → /doc/<dir>/<name>`.

## 3. Options comparées

### Option A — Normaliser `year-overview.md` → route existante (`/calendar`)
- **Fichiers touchés** : `lib/internal-links.mjs` (1 branche) + test. **Zéro** fichier `app/`.
- **Impact UX** : « Vue d'ensemble » ouvre le **Calendrier 365 jours** (grille 12 mois → semaines →
  jours). Situe visuellement dans l'année **mais** ce n'est **pas** la synthèse écrite (roadmap /
  compétences / projets / ressources) que le lien et le document désignent.
- **Impact architectural** : nul (aucune page servie en plus).
- **Risques** : mismatch sémantique (le lecteur attend la synthèse écrite, obtient une grille) ; le
  document `year-overview.md` reste **inaccessible**.
- **Tests nécessaires** : 1 test de mapping `year-overview.md → /calendar`.
- **Valeur d'apprentissage** : moyenne (le calendrier est utile mais différent ; la vue d'ensemble
  écrite reste perdue).
- **Classement : B.**

### Option B — Servir la vraie « Vue d'ensemble » via la route doc existante *(recommandée)*
- **Fichiers touchés** :
  1. `app/doc/[...slug]/page.tsx` : ajouter `'year-overview'` à `ALLOWED` (**1 ligne**) → `/doc/year-overview`
     sert `curriculum/year-overview.md` (réutilise `getDocHtml`/`renderMarkdown`/`.prose`).
  2. `lib/internal-links.mjs` : **2 branches** — `year-overview.md → /doc/year-overview` **et**
     `(methodology|career|rubrics|resources|lessons)/<name>.md → /doc/<dir>/<name>` (répare aussi les 5
     liens internes de year-overview).
  3. `tests/internal-links.test.mjs` : tests des deux familles.
- **Impact UX** : « Vue d'ensemble » ouvre la **synthèse annuelle réelle**, **entièrement navigable**
  (ses liens mois + doc fonctionnent). Fil d'Ariane cohérent Jour → Semaine → Mois → Année.
- **Impact architectural** : réutilise la route doc, `renderMarkdown` et le style `.prose` **existants** ;
  **aucun** nouveau composant, **aucune** nouvelle donnée. Ajoute une entrée à une allowlist.
- **Risques** : faibles. Un fichier `app/` est touché — mais **allowlist de navigation**, pas de CSS ni
  de visuel ; garde anti-traversée déjà présente ; `year-overview.md` est **généré** (contenu non
  réécrit).
- **Tests nécessaires** : mapping year-overview + doc-family ; (en validation réelle) `/doc/year-overview`
  → 200, 0 lien `.md` restant sur la page.
- **Valeur d'apprentissage** : **élevée** — la vue d'ensemble (roadmap 12 mois, 20 compétences, projets,
  ressources) devient atteignable depuis **chaque** semaine/mois : orientation réelle sur un parcours de
  365 jours.
- **Classement : A.**

### Option C — Supprimer/remplacer les liens à la source (générateur)
- **Fichiers touchés** : `scripts/generate-curriculum.mjs` (`:581`, `:611`) + **régénération** des 64
  pages week/month (+ year-overview).
- **Impact UX** : perte d'un fil d'Ariane **légitime** vers un document **existant**.
- **Impact architectural** : modifie le **générateur** et **régénère du contenu** (curriculum-guard le
  signalerait).
- **Risques** : élevés/inutiles — l'intention des liens est **valide**, donc leur suppression n'est **pas
  justifiée** (règle : supprimer seulement si l'intention est invalide).
- **Valeur** : négative (retire de la navigation utile).
- **Classement : C — rejetée.**

## 4. Recommandation ferme

**Option B** (servir `curriculum/year-overview.md` via `/doc/year-overview`, + normaliser les liens
year-overview **et** doc-family). C'est la seule option qui **supprime les 404 sans inventer de
destination** : la destination est le **document qui existe déjà** et que les liens désignent
explicitement (« Vue d'ensemble » → « Vue d'ensemble de l'année »). Elle réutilise l'infrastructure
existante, ne touche ni CSS ni composant visuel ni contenu de curriculum, et apporte une réelle valeur
d'orientation. **A** reste un repli à moindre coût si tu refuses tout changement dans `app/` ; **C** est
écartée.

## 5. Périmètre exact proposé (si Option B validée — implémentation ultérieure)

Fichiers modifiés (couche rendu/navigation uniquement) :
- `app/doc/[...slug]/page.tsx` — `ALLOWED` : + `'year-overview'` (1 ligne).
- `lib/internal-links.mjs` — 2 branches : `year-overview.md → /doc/year-overview` ;
  `(methodology|career|rubrics|resources|lessons)/<name>.md → /doc/<dir>/<name>`.
- `tests/internal-links.test.mjs` — tests des nouveaux mappings.
- `LOT_0B_*.md` — mise à jour de clôture.

**Jamais touchés** : CSS, composants visuels, `curriculum/`, `scripts/`, générateur, `data/program.json`.

## 6. Critères d'acceptation

- `/doc/year-overview` → **200** et affiche « Vue d'ensemble de l'année ».
- Les **64** liens « Vue d'ensemble » (semaines + mois) → `/doc/year-overview` (**0** `.md` résiduel).
- Les **5** liens internes doc-family de year-overview → `/doc/<dir>/<name>` **200** ; **0** lien `.md`
  restant sur la page `/doc/year-overview`.
- Liens externes, ancres, routes absolues, `.md` non reconnus : **inchangés** (pas de mauvaise
  redirection).
- `curriculum-guard` **0 dérive** ; `generate` idempotent ; `curriculum:check` 365/365 + 60 leçons ;
  `depth-check` ; `glossary:check` ; **build 0 erreur/0 warning** ; suite de tests **verte** (≥ 58 + les
  nouveaux) ; **aucun** changement `app/` hors la ligne `ALLOWED`, **aucun** changement CSS/curriculum/
  scripts/data.

## 7. Stratégie de tests

- **Unitaires** (`tests/internal-links.test.mjs`) : `../year-overview.md` / `year-overview.md` →
  `/doc/year-overview` ; les 5 doc-family → `/doc/<dir>/<name>` ; zéros/variantes `./`+`../` ; un
  `lessons/<slug>.md` ; non-régression des familles Lot 0 (week/month/day/solution/project) ; externes /
  ancres / inconnus inchangés.
- **Intégration réelle (Chromium)** : `/doc/year-overview` → 200 ; depuis une semaine et un mois,
  **clic** « Vue d'ensemble » → page annuelle ; sur la page annuelle, clic d'un lien mois et d'un lien
  doc → 200 ; scan « 0 lien `.md` » sur `/doc/year-overview`, `/week/35`, `/month/9`.
- **Gates** : `curriculum-guard` + `local-verify` + build 0 warning.

## 8. Exclusions (hors Lot 0B, conformément à la consigne)

- **`favicon.ico`** (404 pré-existant, aucun asset) — non traité.
- **Ouverture automatique du bloc Correction** — non traité.
- **Toute modification UI/UX / CSS / composant visuel** — exclue.
- **Démarrage du Lot 1** — exclu.
- **Redirection vers le Dashboard `/`** — écartée (aucune équivalence sémantique : le Dashboard est la
  progression/le jour courant, pas la synthèse annuelle).

---

**Statut : diagnostic terminé, recommandation = Option B. Aucun code modifié. Ce rapport n'est pas
commité — en attente de ta décision (A / B / C, et périmètre).**
