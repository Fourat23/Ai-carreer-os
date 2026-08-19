# V52 — Audit UX/UI & validation produit

Audit forensique (lecture seule) + validation navigateur réelle des pages pilotes.

## 1. État constaté (CP0)

- **37 routes** Next.js (app router). Shell `app/shell/AppShell.tsx` : rail de
  navigation groupé (`nav.ts`, 6 groupes), **icônes lucide (aucun emoji)**,
  command palette (⌘K), drawer mobile. Sobre, esprit « engineering workbench ».
- **Design tokens existants** (`app/globals.css`, ~1586 l) : source unique de fonds,
  surfaces, bordures, texte, accent, fonctionnels, espacement, rayons, typo,
  largeurs. **Adoption : 6 couleurs hex en dur dans 90 fichiers UI.**
- Pages branchées sur les **vrais read-models** : Dashboard (`nextBestActions`,
  `reviewSummary`, `progressPosition`, `skillStats`), Compétences (`skillStats` +
  `explainSkillState` « Pourquoi cet état ? »).

## 2. Constat majeur : le produit actuel est SOBRE, le mockup est GAMIFIÉ

Le mockup fourni contient **XP total, Niveau 24, streak, badges** — explicitement
interdits par le prompt (§3, §CRITÈRES 10). **L'UI réelle n'a aucune gamification**
(les « badge » sont des puces de statut sémantiques). Adopter le mockup serait une
**régression**. Décision : garder sa **direction visuelle** (dark, accent indigo
parcimonieux, densité maîtrisée, Linear/GitHub), **rejeter** sa gamification.

## 3. 🔴 P0 corrigé : le rail « Aujourd'hui » (`/day`) rendait 500

Validation navigateur (serveur de production réel) : `/` et `/skills` → 200, mais
**`/day/[id]` → 500 pour TOUS les jours**. Cause racine : `lib/missions-server.ts`
validait les `trackRefs` des missions contre une **liste blanche incomplète** de
parcours (4 sur ~8 définis) ; des missions référençant des parcours définis mais
omis (`cloud-devops-engineer-v1`, `frontend-engineer-v1`, …) faisaient échouer le
chargement et planter toute la page. **Correctif** : compléter la liste blanche avec
tous les parcours définis (`DATA_ML`, `FRONTEND`, `APPSEC_CLOUD`, `CLOUD_DEVOPS`).
Après correctif : **`/day/1`, `/day/5`, `/day/186`, `/day/320` → 200**. Ce n'est
pas un changement de curriculum (aucune leçon, aucun jour, aucun ordre modifié) —
un bug de liste blanche de validation, réparé avec preuve (P0 autorisé).

## 4. Validation navigateur (serveur réel)

| Route | Avant | Après |
|-------|:--:|:--:|
| `/` (Dashboard) | 200 | 200 |
| `/skills` (Compétences) | 200 | 200 |
| `/day/[id]` (Aujourd'hui) | **500** | **200** |
| `/parcours`, `/revisions` | 200 | 200 |

Validation multi-largeurs visuelle (overflow horizontal aux 375/768/1024/1440/1920)
non exécutée automatiquement : Playwright n'est pas installé comme dépendance npm et
le prompt interdit d'ajouter une grosse dépendance sans justification. Statut :
**HTTP 200 confirmé sur serveur réel** ; l'inspection visuelle multi-largeurs est
cadrée en dette V53 (environnement interactif requis). Le CSS possède déjà des
points de rupture (`globals.css`).

## 5. Vocabulaire & explicabilité (CP5/CP9)

Le statut d'une compétence réutilise la **vérité du moteur** (`SKILL_STATE_LABEL`) :
Non abordée / Découverte / Pratiquée / Démontrée / À consolider. L'adaptateur PUR
`lib/skill-vocabulary.mjs` associe chaque état à un **ton** (neutral/info/positive/
attention/blocking) et impose `requiresExplanation`. « Pourquoi cet état ? » est
déjà rendu via `explainSkillState` (déterministe, jamais « IA »). Règle : aucun
statut porté par la couleur seule.

## 6. Anti-AI-slop — ce qui a été explicitement ÉVITÉ

Pas de hero marketing, pas de glow/gradients décoratifs généralisés, pas de radar,
pas de grille de cartes clonées, **pas d'XP/streak/badge/niveau RPG**, pas de
statistique vanity, pas de texte motivationnel généré, pas d'emoji décoratif, pas
d'animation gratuite. Verrouillé par `v52:check`.

## 7. Dette V53 (sans euphémisme)

- Migration visuelle **page à page** vers un design system documenté : les pages
  restent fonctionnelles et sobres mais n'ont pas été redessinées pixel-à-pixel
  (non faisable à l'aveugle sans itération visuelle interactive).
- Inspection overflow multi-largeurs automatisée (Playwright) à mettre en place.
- Extraction de primitives partagées dans un dossier `ui/` dédié (aujourd'hui
  co-localisées par route).
- Consolidation des 6 couleurs hex héritées vers des tokens.
