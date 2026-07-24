# Release Readiness V1 — AI Career OS (2026-07-24)

> **Audit fonctionnel et release-readiness**, en **lecture seule**. Aucun contenu pédagogique,
> aucun jour, aucune correction, aucune leçon, aucun composant n'a été modifié. Ce document est un
> **diagnostic** ; aucune correction n'est appliquée sans validation explicite.

---

## 1. État Git

- Branche : `claude/ai-career-os-saas-phfg49` · HEAD `8cfc7c8` · working tree **propre** · synchronisé
  origin (0/0).
- **Aucune branche principale** (`main`/`master`) sur le dépôt distant, **aucune PR**. La branche de
  travail est l'unique branche et la branche par défaut. La fusion V1 **n'est pas réalisée** (et ne peut
  pas l'être en l'état) — **point de décision remonté à l'utilisateur, aucune action de fusion prise**.

## 2. Procédure d'installation réelle (vérifiée)

| Étape | Commande | Constat |
|---|---|---|
| Node requis | — | **Node 22.22** présent ; README annonce « Node 20+, testé 22 » → **conforme** |
| Dépendances | `npm install` | `node_modules` présent (353 Mo) ; 4 dépendances runtime (`next`, `react`, `react-dom`, `marked`) |
| Variables d'env | — | **Aucune requise** (les `process.env` du dépôt sont dans du *contenu* pédagogique, pas dans le code app) → conforme au README |
| Dév | `npm run dev` | route `/` → **200** |
| Build prod | `npm run build` | **✓ vert**, 0 erreur lint, 0 erreur type, 0 warning, 18 routes |
| Start prod | `npm start` | serveur up, toutes routes testées → 200 |
| Base de données / clé | — | aucune (conforme au README) |

**Écarts README ↔ réalité** (voir défauts D2) : le README ne bloque aucune installation ; les écarts
sont documentaires (nombre de leçons, diagramme de structure incomplet).

## 3. Parcours fonctionnels (testés sur build de production, port 3100)

| Parcours | Test | Attendu | Réel | Verdict |
|---|---|---|---|---|
| A. Accueil | `GET /` | 200, dashboard | 200 | **PASS** |
| B. Navigation | mois/semaine/jour, sections | 200 | `/calendar` `/month/1` `/week/1` → 200 | **PASS** |
| B. Bornes jours | 1, 90, 91, 180, 181, 270, 271, 365 | 200 | **tous 200** | **PASS** |
| B. Sections app | projects, skills, reviews, notes, resources, career, glossary, guide, lessons | 200 | **tous 200** | **PASS** |
| C. Contenu jour | day 314 (renommé N3) sections + accents | titre + 🎯📖🧭✍️📦✅⚠️, 0 U+FFFD | présents, 0 caractère cassé | **PASS** |
| C. Fuite technique | `undefined`/`[object Object]` visibles | aucune | aucune (le `"$undefined"` détecté = flux RSC interne Next.js, non visible) | **PASS** |
| D. Progression écrire | `POST /api/progress` day done | persistée | `{ok:true}`, écrite sur disque avec `updatedAt`, `startDate` auto | **PASS** |
| D. Progression relire | `GET /api/progress` | jour présent | présent | **PASS** |
| D. Fichier corrompu | JSON invalide puis `GET` | pas de crash | **200, état vide en mémoire** (non écrasé) | **PASS** |
| D. Payloads invalides | day 999 / corps non-JSON / type inconnu | 400 | `jour invalide` / `JSON invalide` / `type inconnu` (400) | **PASS** |
| E. Leçons | `/lessons`, `/doc/lessons/<slug>` | 200 | 200 ; 60 leçons rendues ; lien valide → 200 | **PASS** |
| E. Lien leçon invalide | `/doc/lessons/does-not-exist` | 404 | 404 | **PASS** |
| F. Projets | `/projects` | 200 | 200 | **PASS** |
| G. Recherche/filtres | glossaire (existe réellement) | 200 | `/glossary` 200 ; validateur OK | **PASS** |
| H. Route inexistante | `/nonexistent-route` | 404 | 404 | **PASS** |
| H. Jour hors borne | `/day/0`, `/day/366`, `/day/abc` | 404 | **tous 404** | **PASS** |
| H. Semaine/mois hors borne | `/week/99`, `/month/99` | 404 | 404 | **PASS** |
| H. Import sauvegarde | forme invalide | rejet avant écrasement | `isValid()` valide la forme avant `writeProgress` → 400 sinon | **PASS** |

**Import/export progression** : `GET /api/progress/export`, `POST /api/progress/import` (validé avant
écrasement) — conforme au README.

## 4. Responsive / accessibilité

| Zone | Constat | Sévérité |
|---|---|---|
| Viewport meta | `width=device-width, initial-scale=1` présent (défaut Next.js) | OK |
| Blocs de code | `.prose pre { overflow-x: auto }` → scroll interne sur mobile | OK |
| Tableaux | `.prose table { display: block; overflow-x: auto }` → scroll interne | OK |
| Grilles cartes | media query 860px → 2 colonnes | OK |
| Langue | `<html lang="fr">` | OK (a11y) |
| Correction | `<details>/<summary>` natif → focusable clavier, Entrée/Espace | OK (a11y) |
| Statut / auto-éval | `<button>` natifs → accessibles clavier | OK (a11y) |
| **Barre latérale mobile** | **`.sidebar` largeur fixe 232px, `min-width:232px`, `position:sticky`, AUCUN toggle/hamburger, AUCUNE media query mobile.** Sur 375px : sidebar = 232px (62%), contenu ≈ 143px ; sur 320px, contenu ≈ 88px. | **MAJEUR** |

Le seul media query « mobile » (640px) ajuste le *padding* du contenu et les contrôles du glossaire —
**il ne touche pas la barre latérale**. Le composant `Sidebar.tsx` est un `<aside>` statique sans état
de repli. → **défaut responsive réel D1**, mais l'application est **desktop-first par conception**
(localhost, mono-utilisateur ; le README ne promet pas d'usage mobile).

## 5. Qualité technique

| Contrôle | Résultat |
|---|---|
| `npm run build` (lint + typecheck inclus) | **vert**, 0 erreur, 0 warning |
| `npm test` (node:test) | **43/43** |
| `curriculum:check` | **365/365**, 60 leçons |
| `curriculum:depth-check` | OK |
| `glossary:check` | valide |
| Audit résiduel N1/N3/Y4 | 0 orpheline, 0 titre dupliqué, jour 10 résolu |
| Liens de leçons | **0 cassé** |
| Scan glyphes (U+FFFD/cyrillique/géorgien) | propre |
| Secrets exposés | **aucun** ; aucun `.env` traqué ; `.gitignore` couvre `node_modules`/`.next` |
| TODO/FIXME dans le code app | **aucun** (les occurrences sont dans le *détecteur* de placeholders `audit-pedagogique.mjs`) |
| Gestion JSON invalide | tolérante (progress corrompu → état vide, pas de crash ; POST/import → 400) |
| Validation des entrées | day 1-365, score 0-5, type connu, forme d'import validée |
| Reproductibilité build | déterministe (générateur idempotent ; seul l'horodatage de `program.json` varie, restaurable) |

## 6. Défauts prouvés

- **D1 — Barre latérale non responsive (MAJEUR).** 232px fixes sans repli sur mobile → contenu écrasé
  (~143px sur 375px). Preuve : `app/globals.css` (`.sidebar min-width:232px`, aucune media query
  sidebar) + `app/Sidebar.tsx` (aside statique). *Contexte : produit desktop-first, localhost.*
- **D2 — Dérive documentaire du README (MINEUR).**
  - Ligne 123 : « **21 leçons** » — réel = **60** (fichiers, `program.json`, page `/lessons`
    concordent). Chiffre obsolète.
  - Diagramme de structure (l. 36-76) : n'énumère pas des routes pourtant présentes — `/glossary`,
    `/guide`, `/lessons` (le glossaire est décrit plus bas, mais absent du diagramme).
- **D3 — `data/progress.json` traqué par Git (MINEUR).** La progression utilisateur est versionnée
  (actuellement vierge `{startDate:null,…}`). Écrire de la progression crée un diff Git. Le code gère
  l'absence du fichier (`empty()`), donc l'ignorer serait sans risque. *Par conception c'est un fichier,
  mais son suivi Git peut surprendre.*

## 7. Faux positifs invalidés

- **`"$undefined"` dans le HTML** : sérialisation interne React Server Components (flight data) de
  Next.js, **non visible** par l'utilisateur. Vérifié : 0 token suspect visible sur jours 1/91/181/365.
- **TODO/FIXME** : uniquement dans le détecteur de placeholders et des commentaires de générateur — pas
  des dettes de code.
- **`process.env`** : uniquement dans du contenu pédagogique (exemples de leçons), pas dans le code
  applicatif — aucune variable d'environnement runtime requise.
- **59 vs 60 leçons** (comptage intermédiaire) : `data-cleaning-quality.md` faussement exclu par un
  filtre `quality` ; le compte réel est **60**, cohérent partout.

## 8. Classification par sévérité

| Défaut | Sévérité | Bloque « Release Candidate V1 » ? |
|---|---|---|
| D1 — sidebar mobile | **MAJEUR** | Selon le critère « aucun overflow critique sur mobile » : à trancher (desktop-first). Ne bloque pas l'usage desktop. |
| D2 — README (21→60 leçons, routes) | **MINEUR** | Non (critère « doc d'installation conforme » : l'installation est correcte ; l'écart est sur le contenu descriptif). |
| D3 — progress.json traqué | **MINEUR** | Non. |

**Aucun défaut BLOQUANT, aucune corruption de contenu, aucun secret exposé, build vert, navigation
1-365 fonctionnelle, progression persistante, erreurs gérées.**

## 9. Fichiers potentiellement concernés (si remédiation validée)

- **D1** : `app/globals.css` (+ éventuellement `app/Sidebar.tsx` pour un toggle) — CSS/UI **uniquement**,
  aucun contenu pédagogique.
- **D2** : `README.md` — documentation **uniquement**.
- **D3** : `.gitignore` + `git rm --cached data/progress.json` (+ éventuel `data/progress.example.json`)
  — configuration **uniquement**.

## 10. Options de remédiation A / B / C

| Défaut | A (rien) | B (ciblé minimal) | C (structurel) |
|---|---|---|---|
| **D1 sidebar** | Assumer desktop-first, documenter la limite mobile dans « Known limitations » | Ajouter une media query mobile : barre latérale repliable (hamburger) ou empilée en haut — **~30-50 lignes CSS + petit état client** | Refonte navigation responsive complète (hors périmètre) |
| **D2 README** | — | Corriger « 21 → 60 leçons » + compléter le diagramme de routes (**édition doc pure**) | — |
| **D3 progress.json** | Laisser (par conception) | `.gitignore` + `git rm --cached` + fichier d'exemple | — |

**Recommandation** : **D2 → B** (trivial, doc), **D1 → B** *(media query mobile minimale)* **ou A**
*(documenter la limite si V1 est explicitement desktop)*, **D3 → B ou A**. Aucune option C requise.

---

## Règle de décision — verdict

Critères « Release Candidate V1 » :

| Critère | État |
|---|---|
| Installation reproductible | ✅ |
| Build vert | ✅ |
| Navigation 1-365 fonctionnelle | ✅ |
| Progression persistante | ✅ |
| Aucune erreur bloquante | ✅ |
| Aucune corruption de contenu | ✅ |
| Aucun overflow critique sur mobile | ⚠️ **sidebar 232px non repliable** (desktop-first ; à trancher) |
| Aucun secret exposé | ✅ |
| Documentation d'installation conforme | ⚠️ **README : 21→60 leçons, routes incomplètes** (installation OK, descriptif obsolète) |
| Dépôt propre et synchronisé | ✅ (mais pas de branche principale ni PR — décision utilisateur) |

### RELEASE READINESS À CORRIGER

Le socle fonctionnel est **solide** (build, navigation, persistance, erreurs, sécurité : tous verts).
**3 défauts non bloquants** subsistent avant de déclarer *Release Candidate V1* :

1. **D1 (MAJEUR)** — barre latérale non repliable sur mobile → **OPTION B** (media query mobile minimale)
   ou **OPTION A** (documenter la limite si V1 est officiellement desktop-first).
2. **D2 (MINEUR)** — README : « 21 leçons » (réel 60) + diagramme de routes incomplet → **OPTION B**
   (correction documentaire).
3. **D3 (MINEUR)** — `data/progress.json` traqué par Git → **OPTION B** (gitignore + exemple) ou
   **OPTION A**.

Décision de branche/fusion (aucune `main`, aucune PR) : **à trancher par l'utilisateur** ; aucune action
prise.

**Aucune correction ni tag ni release n'est appliqué. En attente de validation explicite sur D1/D2/D3
et sur la stratégie de branche.**
