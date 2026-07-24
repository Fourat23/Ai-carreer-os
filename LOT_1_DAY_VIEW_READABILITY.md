# Lot 1 — Lisibilité de la Vue Jour · AI Career OS (2026-07-24)

> Refonte **contrôlée et bornée** de la seule Vue Jour (`/day/[id]`) : lisibilité uniquement.
> **Aucun** contenu pédagogique, navigation, structure, fonctionnalité, ni autre écran modifié.
> Direction retenue : « le carnet de bord de l'ingénieur » — sobre, dense mais respirable, sans « AI
> slop ». **Rien n'est commité** (en attente de validation).

---

## 0. État de départ

- HEAD `4e88ddd` · working tree propre · `local == origin`.
- Gates avant écriture : `curriculum-guard` ✅ (0 dérive) · `local-verify` ✅ (64/64, build OK).
- Skills projet présents ; `frontend-design` (direction) + `typescript-lsp` (contrôle TS) actifs.

## 1. Cause du défaut (rappel audit)

La Vue Jour rendait tout le contenu dans un `article.prose` **pleine largeur** (~878 px, 15 px), soit
**~117 caractères/ligne** — bien au-delà du confort de lecture (45-75), sur 4,5-5,4 écrans. Effet
« mur de texte plein écran ».

## 2. Métriques avant / après (Chromium, mesuré)

| Viewport | Avant — colonne / police / interligne / CPL | Après — colonne / police / interligne / CPL |
|---|---|---|
| **1440 px** | 878 px / 15 px / 1.55 / **~117 CPL** | **578 px / 16,5 px / 1,72 / ~70 CPL** ✅ |
| **1024 px** | 670 px / 15 px / 1.55 / ~89 CPL | **578 px / 16,5 px / ~70 CPL** ✅ |
| **768 px** | 414 px / 15 px / ~55 CPL | 414 px / **16,5 px** / ~50 CPL *(sidebar encore présente — hors périmètre)* |
| **375 px** | 289 px / 15 px / ~39 CPL | 289 px / **16,5 px** / ~35 CPL *(corps plus grand, confortable)* |

- **Cible desktop 68-72 CPL atteinte** (1024 et 1440 → ~70). Colonne de lecture bornée à **39,5 rem
  (~632 px de colonne, ~578 px de texte)**, **gauche-alignée** dans l'espace de contenu (jusqu'à 1000 px)
  — c'est une **colonne de lecture**, pas une page « artificiellement étroite » (sidebar + colonne +
  marge).
- Corps **16,5 px / line-height 1,72** partout (desktop **et** mobile).

## 3. Captures avant / après

Fournies dans cette session : `before-day241-desktop` / `after-day241-desktop` (dense IA + code),
`before-day241-mobile` / `after-day241-mobile`, `before-day7-table-desktop` / `after-day7-table-desktop`
(revue + tableau). L'après montre la colonne bornée, la typo agrandie, l'en-tête plus net et la
métadonnée compacte — **identité sombre sobre inchangée**, aucun élément décoratif ajouté.

## 4. Fichiers modifiés (périmètre exact)

| Fichier | Nature | Changement |
|---|---|---|
| `app/day/[id]/page.tsx` | conteneur Vue Jour | fragment `<>…</>` → `<div className="day-view">…</div>` (**wrapper de portée**, 2 lignes) |
| `app/globals.css` | styles | **bloc additif** « Vue Jour — lisibilité (Lot 1) », **entièrement scopé sous `.day-view`** |

**Aucun** autre fichier : ni `curriculum/`, `scripts/`, `data/`, `lib/`, ni composant, ni autre écran.
Le bloc CSS est **purement additif** (aucune règle existante modifiée) → **zéro impact** sur les écrans
partageant `.prose` (semaine, mois, doc, leçons, projets).

## 5. Diff fonctionnel exact

`page.tsx` : `<>` → `<div className="day-view">` et `</>` → `</div>` (aucun composant déplacé, aucune
logique changée). `globals.css` (ajouts, tous sous `.day-view`) :
- `.day-view { max-width: 39.5rem; }` — colonne de lecture.
- `.day-view .prose { font-size: 16.5px; line-height: 1.72; }` + marges de paragraphes/listes.
- `.day-view .prose h1/h2/h3` — hiérarchie nette (27 / 20 / 16 px ; H1 le plus fort, H2 séparateur +
  gras 700, H3 600).
- `.day-view .prose code` 0.88em ; `pre` 13,5 px ; `blockquote` (métadonnées/notes) compacté (14 px).

**Comportement inchangé** : tous les liens et contrôles, `<details>` correction, `DayPanel` (suivi),
navigation, `overflow-x:auto` des `pre`/`table` (contenus techniques **dans un conteneur scrollable**).

## 6. Résultats des tests / gates

- **tsc --noEmit** (fichiers TS/TSX) : **0 erreur** ; `typescript-lsp` actif pendant l'édition, aucun
  diagnostic sur `page.tsx`.
- **curriculum-guard** (vs `local-v1-content-stable`) : **0 dérive** → **contenu pédagogique
  byte-identique**.
- **Suite complète** : **64/64**. `local-verify` : generate idempotent · curriculum:check 365/365 + 60
  leçons · depth-check · glossary:check · **build (lint+typecheck) 0 erreur / 0 warning** · 0 lien
  cassé · 0 glyphe.

## 7. Résultats par viewport (audit responsive Chromium)

- **375 / 768 / 1024 / 1440 px** sur `/day/{241, 7, 181, 25}` : **aucune barre horizontale parasite,
  aucun chevauchement**.
- Titres distincts, listes correctement indentées, paragraphes lisibles, blocs de code utilisables
  (scroll interne), tableaux consultables (scroll interne), aucun contenu masqué.
- Mobile (375) : toujours utilisable ; la sidebar empilée actuelle reste inchangée (traitée dans un
  autre lot).

## 8. Limites restantes (assumées, hors périmètre Lot 1)

- **@768 px** : colonne ~50 CPL (< 68-72) car la **sidebar (232 px)** occupe encore l'espace à cette
  largeur (breakpoint de repli à 640 px). La cible CPL est **desktop** (1024/1440 → ~70). La sidebar /
  nav mobile relève d'un **autre lot**.
- **Code/tableaux** restent **dans** la colonne de lecture avec **scroll horizontal interne** (contrôlé).
  Les élargir au-delà de la colonne sémantique est **permis** mais **différé** (garde le diff minimal).
- **Pas de test UI automatisé ajouté** : la suite du dépôt est `node:test` **sans navigateur** ; ajouter
  un runner navigateur serait une **nouvelle dépendance UI** (interdite). La validation lisibilité passe
  donc par les **mesures Chromium** ci-dessus (méthode `ux-audit`), comme pour les lots précédents.

## 9. Critères d'acceptation — état

| Critère | État |
|---|---|
| Contenu pédagogique byte-identique | ✅ (curriculum-guard 0 dérive) |
| Largeur de lecture desktop maîtrisée (~70 CPL) | ✅ (1024/1440) |
| Typographie plus lisible (16,5 px / 1,72, hiérarchie H1>H2>H3) | ✅ |
| Aucun contenu masqué | ✅ |
| Aucun comportement fonctionnel modifié | ✅ |
| Aucune dérive « AI slop » (gradients/cartes/glow/néon/…) | ✅ (bloc additif, sobre) |
| 4 viewports valides (0 débordement) | ✅ |
| curriculum-guard 0 dérive · tests & build verts | ✅ |
| Diff limité à la Vue Jour + styles nécessaires | ✅ (2 fichiers) |

## 10. git status

```
 M app/day/[id]/page.tsx
 M app/globals.css
```
HEAD `4e88ddd` inchangé — **aucun commit**.

---

**Statut : Lot 1 implémenté et validé en réel. En attente de ta validation explicite avant tout commit.
Le Lot 2 n'est pas commencé.**
