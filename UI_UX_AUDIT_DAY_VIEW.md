# Audit UI/UX — Vue Jour (`app/day/[id]/`) · AI Career OS (2026-07-24)

> **Phase de diagnostic et de direction artistique uniquement.** Aucun fichier `app/`, `lib/`, CSS,
> composant, contenu pédagogique ou générateur modifié. Aucun `ui-implement`. Seul fichier écrit :
> ce rapport. AI Career OS reste un **outil personnel, strictement local**.

---

## 1. État Git initial

- Branche `claude/ai-career-os-saas-phfg49` · **HEAD `04c8770`** (conforme) · working tree **propre** ·
  `local == origin` · baseline `local-v1-content-stable` intacte.
- Gates avant audit : `curriculum-guard` ✅ (0 dérive pédagogique) · `local-verify` ✅
  (365/365 jours, 60 leçons, 43/43 tests, build OK, 0 lien de leçon cassé, 0 glyphe).
- Plugins actifs : `frontend-design` (utilisé pour la direction), `typescript-lsp` (binaire 5.3.0).

## 2. Écrans / jours inspectés

| Jour | Tranche | Type | Observé |
|---|---|---|---|
| 5 | 1-30 | Fondations très détaillé | 14 sections, ~5.4 écrans |
| 72 | 31-90 | Projet/ingénierie | rendu identique |
| 120 | 91-180 | React/data | rendu identique |
| 241 | 181-270 | **IA dense (RAG/chunking)** | 11 sections, ~4.5 écrans |
| 340 | 271-365 | Portfolio/carrière | 11 sections, ~4.5 écrans |
| 7 | — | **Revue hebdomadaire** | gabarit **identique** à un jour d'apprentissage |

## 3. Tailles d'écran testées

**375 / 768 / 1024 / 1440 px** (via `ux-audit` / Chromium headless). Résultat responsive : **0 barre
horizontale, 0 superposition** sur les 6 jours — la baseline responsive tient.

## 4. Preuves / mesures réelles

- **Largeur de lecture** : `article.prose` = **878 px** de texte, corps **15 px** → **~117 caractères par
  ligne** (mesuré à 1440 px ; idem 1024). *Cible confort long-form : 45-75, max ~90.*
- **Longueur verticale** : **4,5 à 5,4 écrans** par jour, **11 à 14 sections `h2`**, **sans** sommaire,
  ancre, retour-haut ni navigation persistante.
- **Liens in-content cassés (404)** présents sur **chaque** jour rendu : `../week-35.md` →
  `/week-35.md` **404**, `../month-09.md` **404**, `../solutions/day-241-solution.md` **404**,
  `../days/day-241.md` **404** (dans la correction). Les vrais itinéraires `/week/35`, `/month/9`
  renvoient 200 — les liens du **contenu** pointent vers des chemins `.md` inexistants côté web.
- **Captures** (evidence, jointes à cette session) : `day241-desktop`, `day241-mobile`,
  `day5-desktop`, `day7-review-desktop`.
- **Mobile 375 px** : la barre latérale empilée (correctif D1) occupe **~1 écran plein** (11 liens +
  section « Méthode ») **avant** le contenu du jour.

## 5. Forces actuelles (à conserver)

1. **Sobriété assumée** : fond sombre, **aucun** gradient gratuit, glassmorphism, pile de cartes
   arrondies ni badge décoratif. C'est un **vrai atout** — l'inverse de l'« AI slop ».
2. **Contenu en Markdown** rendu via `marked` : la présentation est **découplée** du contenu → on peut
   restyler **sans toucher** aux 365 jours.
3. **Correction en `<details>` natif** : accessible clavier (Entrée/Espace), sobre.
4. **Bases d'accessibilité** : `<html lang="fr">`, `:focus-visible`, boutons/inputs sémantiques.
5. **Responsive fiable** (baseline) : blocs de code et tableaux défilent en interne (`overflow-x:auto`).
6. **Routage propre** : `/day/[id]`, bornes gérées, 404 corrects hors contenu.

## 6. Défauts observés & classement

| # | Défaut (preuve) | Axe | Sévérité |
|---|---|---|---|
| D-A | **Liens in-content 404** sur chaque jour (`../week-35.md`, `../month-09.md`, `../solutions/…md`, `../days/…md`) | navigation | **BLOQUANT** |
| D-B | **Largeur de lecture ~117 car/ligne** (878 px, 15 px) → fatigue sur longues sessions | lisibilité | **MAJEUR** |
| D-C | **Aucun repérage dans la journée** (4,5-5,4 écrans, 11-14 sections, ni sommaire ni ancre ni nav sticky) | orientation | **MAJEUR** |
| D-D | **Sections non différenciées** : théorie / exercice / correction / réflexion ont le **même poids** (émoji + filet). L'œil ne distingue pas « à lire » vs « à faire » vs « à vérifier » | hiérarchie / charge cognitive | **MAJEUR** |
| D-E | **En-tête générique** : titre + *blockquote* méta (Difficulté/Durée noyées dans une citation) — pas d'en-tête scannable | hiérarchie | **MAJEUR** |
| D-F | **Nav mobile lourde** : sidebar empilée = ~1 écran avant le contenu ; pas de repli/hamburger ni nav sticky | responsive mobile | **MAJEUR** |
| D-G | **Suivi & correction en fin de page** : statut/checklist/correction seulement atteignables après ~4-5 écrans ; aucun accès rapide | interaction / progression | **MAJEUR** |
| D-H | **Rangée de liens redondante** sous l'en-tête (duplique la nav du haut ; 3/4 liens cassés) | redondance | MINEUR (lié à D-A) |
| D-I | **Aucun contexte de progression** sur la page (pas de « Jour X / 365 », pas de position mois/semaine, statut non visible en tête) | perception de progression | MINEUR-MAJEUR |
| D-J | **Revues non différenciées** des jours d'apprentissage (même gabarit) alors que c'est un **mode** différent (bilan) | différenciation | MINEUR |
| D-K | **Typo un peu petite/tassée** pour le long-form (15 px / 1.55) | typographie | MINEUR |
| D-L | **Objectif du jour peu saillant** (« Mesurer les stratégies. » au même poids que le corps) | hiérarchie | MINEUR |

> **Note « AI slop »** : le problème de la Vue Jour **n'est pas** l'excès décoratif (elle est sobre) —
> c'est la **sous-différenciation** et le **mur de texte**. La refonte doit **ajouter de la structure et
> une identité**, pas de la décoration.

## 7. Direction artistique recommandée (issue de `frontend-design`)

### Intention : « le carnet de bord de l'ingénieur »
AI Career OS n'est pas un dashboard SaaS : c'est un **instrument personnel** de travail quotidien sur
**365 jours**. La métaphore directrice est le **carnet de bord / journal de laboratoire** — daté,
paginé, durable, discipliné (« d'abord seul, sans IA »). Chaque jour est une **entrée numérotée dans une
séquence réelle** (Jour 241 / 365). Le vocabulaire visuel vient du monde du sujet : **le terminal, le
code, la progression mesurée**.

### Justification liée à l'usage
Sessions longues, quotidiennes, techniques → priorité à la **lisibilité durable**, au **repérage** dans
une journée dense, et à un **sentiment de progression** sur un an. La sobriété actuelle est gardée
(confort visuel en session longue) ; on lui ajoute **structure + mesure de lecture + identité**.

### Hiérarchie typographique
- **Rôle « instrument » (mono)** : une **monospace** pour les signaux structurels — numéro de jour
  (`241/365`), libellés de section (eyebrows), méta (difficulté/durée/compétence), code. La mono est
  **native au sujet** (terminal/code) et porte l'identité, employée **avec retenue** (pas dans le corps).
- **Rôle « lecture » (corps)** : une face **humaniste très lisible** pour le long-form, **16-17 px /
  line-height ~1.65**, mesurée à **~66-72 car/ligne**.
- **Échelle** nette : titre de jour (display, poids fort) › libellé de section (mono, petit, capitales
  espacées) › sous-titres › corps › légendes (mono). Le contraste vient des **rôles et poids**, pas de
  tailles marketing géantes.

### Logique de couleurs
- **Base « encre » sombre chaude et tonale** (pas le near-black plat + un accent acide, qui est
  précisément le défaut par défaut de l'IA #2). Surfaces différenciées par **élévation tonale** (2-3
  niveaux d'encre) plutôt que par des **bordures** partout.
- **Un seul accent fonctionnel, sémantique** : réservé à **« ta position / ton action / fait »**
  (jour courant, section active, statut terminé) — **jamais** décoratif.
- **Mode « papier » clair optionnel** (lecture de jour) : l'app est aujourd'hui sombre-only ; une lecture
  longue en journée bénéficie d'un thème clair sobre. Dual encre/papier, une seule identité.

### Espacement & rythme vertical
- **Rythme vertical régulier** basé sur une unité (ex. 8 px), respirations plus larges **entre modes**
  qu'à l'intérieur d'un mode → le rythme **encode** la structure.
- **Colonne de lecture bornée** (~700 px) centrée dans l'espace de contenu ; les éléments « instrument »
  (spine, méta, code) peuvent déborder cette colonne.

### Surfaces & séparateurs
- Remplacer la logique « tout bordé » par des **surfaces à élévation tonale** ; réserver les **filets**
  aux vraies coupures de mode. Moins de rectangles, plus de hiérarchie par la couleur d'encre.

### Traitement des sections pédagogiques (le cœur)
Regrouper les 11-14 sections en **4 modes fonctionnels**, chacun avec un traitement **discret mais
distinct** (eyebrow mono + tonalité de surface), pour que l'œil localise instantanément :
- **LIRE** (🎯 Objectif, 📖 Cours, 🧠 À retenir, 🚀 Pourquoi) — encre de lecture, colonne bornée.
- **FAIRE** (🧭 Exemple guidé, ✍️ Pratique, 📦 Livrable, ✅ Critères) — surface légèrement distincte,
  accent « action ».
- **VÉRIFIER** (⛔ Correction, ✅ Critères, 🎤 Entretien) — révélée à la demande, cadrée « après essai ».
- **RÉFLÉCHIR** (🧩 Questions de réflexion, 🏢 Cas métier) — traitement « marge / carnet » (retrait,
  filet latéral), registre introspectif.

### Traitement du code
Conserver le bloc sombre à défilement interne ; **aligner la mono du code** sur la mono « instrument »
pour une cohérence d'identité ; libellé de langage discret ; garder `overflow-x:auto`.

### Traitement de la navigation
- **Desktop** : en plus de la nav globale (sidebar), une **colonne « spine » du jour** (sommaire des
  sections + position dans la journée), **sticky**, qui sert **à la fois** de repérage et d'indicateur
  de progression **intra-journée**. C'est la **signature** de la page.
- **Précédent/Suivant** répétés en **bas** de page (pas seulement en haut), en pagination « carnet »
  (‹ 240 · 241/365 · 242 ›).

### Traitement de la progression
- En-tête : **`Jour 241 / 365`** en mono (ordinal réel = numérotation **signifiante**, pas décorative),
  position mois/semaine, **statut** (non commencé/en cours/fait/à revoir) visible **en tête**.
- La **spine** montre l'avancée **dans** la journée (sections vues) — la progression devient tangible.

### Comportement mobile
- Nav globale **repliée** (hamburger / disclosure) → **le contenu du jour est premier**.
- Spine du jour → **barre de sections déroulante** en haut (sticky compacte), pas une colonne.
- Actions suivi accessibles via un **accès rapide** (ancre ou barre d'action basse), pas seulement en fin.

### Interaction & mouvement (retenu)
- Mouvement **au service du repérage** uniquement : surbrillance douce de la section active dans la
  spine au scroll ; focus clavier visible ; `prefers-reduced-motion` respecté. **Aucune** animation
  décorative. « Enlever un accessoire avant de sortir. »

## 8. Proposition concrète — future Vue Jour (wireframe textuel)

### Desktop (≥ ~1000 px)
```
┌───────────────┬──────────────────────────────────────────────┬───────────────┐
│  NAV GLOBALE   │  ‹ 240   ·   JOUR 241 / 365   ·   242 ›        │  SPINE DU JOUR │
│  (sidebar,     │  Chunking : comparaison objective              │  (sticky)      │
│   inchangée)   │  [RAG] [Intermédiaire] [4.5 h]  · statut ▾      │  Objectif      │
│                │──────────────────────────────────────────────  │  Cours      ●  │  ← section active
│                │                                                │  Exemple guidé │
│                │  ── LIRE ─────────────────────                 │  Pratique      │
│                │  🎯 Objectif du jour                            │  Livrable      │
│                │  Mesurer les stratégies.                       │  Critères      │
│                │                                                │  Cas métier    │
│                │  📖 Cours approfondi                            │  Entretien     │
│                │  [colonne de lecture ~700px, 16-17px/1.65]     │  À retenir     │
│                │                                                │  Réflexion     │
│                │  ── FAIRE ────────────────────                 │  ───────────   │
│                │  🧭 Exemple guidé  · ✍️ Pratique · 📦 · ✅       │  Correction ⛔ │
│                │                                                │  [Mon suivi]   │  ← accès rapide
│                │  ── RÉFLÉCHIR ────────────────                 │                │
│                │  🧩 Questions (traitement « marge »)           │                │
│                │                                                │                │
│                │  ▸ Mon suivi du jour (statut, /5, checklist,   │                │
│                │    réponse, notes)                             │                │
│                │  ▸ ⛔ Voir la correction (après essai)          │                │
│                │  ‹ 240   ·   241 / 365   ·   242 ›  (bas)       │                │
└───────────────┴──────────────────────────────────────────────┴───────────────┘
```

### Mobile (< ~640 px)
```
┌──────────────────────────────┐
│ ☰  AI Career OS      241/365  │  ← barre compacte : nav repliée + ordinal + statut
├──────────────────────────────┤
│ ▾ Sections du jour            │  ← spine = disclosure sticky (sommaire déroulant)
├──────────────────────────────┤
│ Chunking : comparaison…       │
│ [RAG] [Interm.] [4.5 h]       │
│ ── LIRE ──                    │
│ 🎯 Objectif                   │
│ 📖 Cours (colonne pleine,     │
│    16px/1.65)                 │
│ ── FAIRE ──                   │
│ 🧭 ✍️ 📦 ✅                     │
│ ── RÉFLÉCHIR ──               │
│ 🧩 …                          │
│ ▸ Mon suivi   ▸ Correction    │
│ ‹ 240 · 241/365 · 242 ›       │
└──────────────────────────────┘
[ barre d'action basse : ⚑ statut · ✎ ma réponse ]  (accès rapide au suivi)
```

## 9. Composants — conserver / faire évoluer / créer

**Conserver** : pipeline Markdown (`getDayHtml`/`marked`), `DayPanel` (logique de suivi + persistance
debouncée), correction en `<details>`, routage `/day/[id]`, base sombre sobre, `:focus-visible`.

**Faire évoluer** : `app/globals.css` (`.content`/`.prose` → colonne de lecture bornée + typo long-form ;
surfaces tonales) ; `app/day/[id]/page.tsx` (en-tête, mise en page 3 colonnes, pagination bas) ;
`app/Sidebar.tsx` (repli mobile) ; placement/accès du `DayPanel`.

**Créer** : `DayHeader` (ordinal `N/365` + méta en chips mono + statut) ; `DaySpine` (sommaire sticky +
progression intra-journée, dérivé des `h2`) ; regroupement visuel par **mode** (LIRE/FAIRE/VÉRIFIER/
RÉFLÉCHIR) ; (optionnel) thème **papier** clair ; barre d'action mobile.

## 10. Fichiers probablement concernés par l'implémentation

- `app/globals.css` · `app/day/[id]/page.tsx` · `app/day/[id]/DayPanel.tsx` · `app/Sidebar.tsx` ·
  `app/layout.tsx` · `lib/program.ts` (extraction du sommaire depuis les `h2` **et** réécriture des
  liens `.md` → routes pour **D-A**).
- **JAMAIS** : `curriculum/`, `scripts/`, `data/program.json`, le générateur — le contenu reste
  **intact** (garanti par `curriculum-guard`).

## 11. Risques de régression

- **`.prose` est partagé** (`week`/`month`/`doc`/`lessons`/`day`) → tout restyle global de `.prose`
  affecte ces pages. **Mitigation** : porter les styles de lecture sous un **wrapper spécifique jour**
  (ex. `.day-view .prose`) pour borner le rayon d'impact ; sinon, ré-auditer les pages partagées.
- **Réintroduction de débordement** responsive (colonne + spine) → `ux-audit` après **chaque** lot.
- **Hydratation `DayPanel`** (client) si on déplace/duplique l'accès au suivi.
- **Réécriture des liens `.md`** (D-A) : bien mapper `week-NN.md→/week/NN`, `month-NN.md→/month/N`,
  `days/day-NNN.md→/day/NNN`, `solutions/…` → correction in-page ; **vérifier 0 lien 404** après.
- **Thème papier** = surface de risque (contrastes) → optionnel, lot séparé.

## 12. Plan d'implémentation par petits lots (chacun : curriculum-guard → build → ux-audit → local-verify → validation → commit)

- **Lot 1 — Lisibilité** *(risque faible, valeur haute)* : colonne de lecture ~700 px + corps 16-17 px /
  1.65, sous wrapper `.day-view`. Corrige **D-B, D-K**.
- **Lot 2 — En-tête du jour** : `DayHeader` (ordinal `N/365`, méta chips mono, statut). Corrige **D-E,
  D-I, D-L** ; supprime la rangée redondante **D-H**.
- **Lot 3 — Différenciation par mode** : regroupement LIRE/FAIRE/VÉRIFIER/RÉFLÉCHIR (eyebrows mono +
  tonalité). Corrige **D-D** ; marque les revues **D-J**.
- **Lot 4 — Spine / repérage** : `DaySpine` sticky (sommaire + progression intra-jour) + pagination bas.
  Corrige **D-C, D-G**.
- **Lot 5 — Mobile & liens** : repli de la nav globale (contenu premier) + réécriture des liens `.md`.
  Corrige **D-F, D-A**.
- (Optionnel) **Lot 6 — Thème papier** clair.

## 13. Critères d'acceptation mesurables

- **Mesure de lecture** desktop **≤ ~75 car/ligne** (largeur texte ≤ ~720 px) ; corps **≥ 16 px**,
  line-height **≥ 1.6**.
- **0 lien in-content 404** (tous les liens `.md` du contenu résolvent en route 200).
- **0 débordement horizontal / 0 superposition** à **375/768/1024/1440** (`ux-audit`).
- **Mobile** : contenu du jour atteignable **dans le 1er écran** (nav repliée).
- **Repérage** : sommaire des sections présent et section active mise en évidence au scroll.
- **`curriculum-guard` exit 0** (0 dérive) · **`local-verify` vert** (365/365, 60 leçons, 43/43, build) ·
  **aucun** changement `curriculum/`, `scripts/`, `data/program.json`.
- A11y : focus clavier visible sur toute nav/action ; `prefers-reduced-motion` respecté.

## 14. Recommandation finale — **C : refonte contrôlée de la Vue Jour**

- **A (conserver)** — écarté : défauts **MAJEURS** réels (lecture ~117 car/ligne, aucun repérage sur
  4,5-5,4 écrans, sections indifférenciées, mobile lourd) + un **BLOQUANT** (liens 404).
- **B (amélioration ciblée)** — insuffisant seul : les problèmes sont **interdépendants** (typographie +
  mise en page + repérage + identité) ; les traiter isolément ne donnerait pas une expérience cohérente.
- **C (refonte contrôlée)** — **recommandé** : une **direction cohérente** (« carnet de bord de
  l'ingénieur ») appliquée **à la seule Vue Jour**, **par petits lots validés**, **contenu pédagogique
  intact**. Chaque lot est réversible et gardé par `curriculum-guard` + `local-verify`. Les Lots 1-2
  seuls (à faible risque) constituent déjà un repli « B renforcé » si tu préfères avancer prudemment.

---

**Statut : audit + direction terminés. Aucun fichier applicatif, CSS ou pédagogique modifié. Ce rapport
n'est pas commité (en attente de ta validation).**
