# ADR-052 — Product UX Architecture & Design System I

## Statut
Accepté (V52, CP1).

## Contexte

Le Curriculum 1.0 est verrouillé (V50/V51). V52 fait passer le produit de
« curriculum optimisé » à « produit réellement utilisable ». L'audit CP0 (lecture
seule) révèle un état **déjà mûr et sobre**, contrairement au mockup fourni :

- Shell « engineering workbench » (`app/shell/AppShell.tsx`) : rail de navigation
  groupé, icônes lucide (aucun emoji), command palette, drawer mobile.
- **Système de tokens existant** (`app/globals.css`, ~1586 lignes) : fonds,
  surfaces, bordures, texte, accent, fonctionnels, espacement, rayons, typo,
  largeurs — **3 seules couleurs en dur dans tout le TSX**.
- Pages branchées sur les **vrais** read-models (`learning-experience`,
  `skill-state`, `review`, `practice-coverage`, `curriculum-timeline`).
- **Aucune gamification** (les « badge » sont des puces de statut sémantiques).

Le mockup contient XP / Niveau / streak / badges — explicitement **interdits** par
le prompt V52. Il sert donc de **direction visuelle** (dark, accent indigo
parcimonieux, densité maîtrisée, esprit Linear/GitHub/IDE), **pas** de spécification.

## Décisions

### A. Architecture d'information (IA)

Navigation principale (existante, conservée — fusion uniquement si gain prouvé) :
- **Tableau de bord** (`/`) = orientation : « où en suis-je, quelle priorité ? »
- **Aujourd'hui** (`/day/[id]`) = exécution immédiate : « que faire dans mes 4-5 h ? »
- **Parcours** (`/parcours`) = trajectoire temporelle.
- **Compétences** (`/skills`) = état + preuves + gaps.
- **Révisions** (`/revisions`) = récupération active / SM-2.
- **Capstones** (`/capstones`) = transfert professionnel.
- **Leçons** / **Exercices (Lab)** = corpus de référence / pratique ciblée.

Chaque bloc d'UI doit répondre à une VRAIE question utilisateur ; interdiction des
widgets sans action et des statistiques « vanity ».

### B. Design system — source unique

Les tokens de `app/globals.css` sont la **source unique** (documentés dans
`docs/audits/DESIGN-TOKENS-V52.md`). Aucune valeur arbitraire dispersée si un token
sémantique existe. Thème **dark** conservé (light non demandé). Le gate `v52:check`
interdit l'introduction de nouvelles couleurs en dur au-delà d'un seuil de base.

### C. Couleur jamais seule porteuse d'information

Tout statut est rendu par **label + ton sémantique** (classe), jamais par la
couleur seule. Tons : `neutral` · `info` · `positive` · `attention` · `blocking`.

### D. Vocabulaire produit — dérivé de la vérité du moteur

Le statut d'une compétence réutilise `SKILL_STATE_LABEL` (`lib/skill-state.mjs`,
source de vérité) : Non abordée / Découverte / Pratiquée / Démontrée / À consolider.
Un adaptateur de présentation PUR (`lib/skill-vocabulary.mjs`) associe chaque état à
un **ton** et impose `requiresExplanation: true`. **Règle produit** : aucun score
pédagogique affiché sans explication accessible (« Pourquoi cet état ? » via
`explainSkillState`) — jamais une « recommandation IA », toujours déterministe.

### E. Anti-AI-slop (contraintes dures, vérifiées par le gate)

Interdits : XP/streak/badge/niveau RPG inventés, hero marketing, glow/gradients
décoratifs généralisés, grilles de cartes clonées, widgets sans action, radar
décoratif, « AI insight » générique, textes motivationnels générés, emoji
décoratif, animations gratuites. Le gate `v52:check` échoue si des littéraux de
gamification réapparaissent dans l'UI.

### F. Aucune seconde source de vérité, aucun moteur parallèle

L'UI ne fait que REPRÉSENTER les read-models existants. Aucun recalcul concurrent
de skill-state/review/coverage/timeline. Curriculum 1.0 et `progress.json`
strictement inchangés.

## Conséquences

V52 consolide et VERROUILLE l'état sain (tokens, vocabulaire, anti-slop) plutôt que
de régresser vers le mockup gamifié. La migration visuelle complète des pages,
page à page, se poursuit au-dessus de ce contrat (dette V53 documentée), sans
jamais toucher au curriculum.
