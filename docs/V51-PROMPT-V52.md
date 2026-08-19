# V52 — Product UX Architecture & Design System

> À lancer APRÈS V51. Ne PAS démarrer pendant V51. Premier sprint UI/UX, construit
> AU-DESSUS du Curriculum 1.0 VERROUILLÉ. LE DÉPÔT FAIT FOI.

## Contrainte fondamentale
L'UI se construit **au-dessus du Curriculum 1.0 stable** et ne doit **PAS**
provoquer de restructuration pédagogique. Le prototype fourni par l'utilisateur
sert de DIRECTION, pas de design à recopier aveuglément.

## Invariants absolus (hérités)
- **Curriculum 1.0 VERROUILLÉ** (`docs/audits/CURRICULUM-1.0-LOCK.md`) : ordre des
  365 jours, prérequis, identité des 128 leçons, architecture des parcours —
  immuables sauf ADR + preuve d'une régression.
- **Corpus gelé** (SHA-1 `4c1f3028…`). `progress.json` intact
  (`323604021055588a9528a86875f36598dbdc7758`). Une seule source de vérité, aucun
  second moteur. Read-models dérivés uniquement.
- Branche `claude/ai-career-os-saas-phfg49` ; trailers requis ; id de modèle absent
  des artefacts ; pas de PR sauf demande.

## Principes V52 (anti-AI-slop)
- Densité maîtrisée ; hiérarchie éditoriale forte ; données RÉELLES uniquement.
- Aucune gamification fictive, aucune métrique décorative, aucun XP/streak/badge.
- Composants sobres ; informations ACTIONNABLES ; progression EXPLICABLE
  (réutiliser `learning-experience`, `practice-coverage`, `curriculum-timeline`).
- Accessibilité ; responsive (375/768/1024/1440/1920).
- Design system COHÉRENT ; inspiration produit/IDE plutôt que dashboard SaaS
  générique.

## Démarrage V52 (ordre)
1. **Audit** : le prototype fourni, l'UI actuelle (surfaces `/parcours`, `/synthese`,
   `/skills`, `/day`, `/lab`, `/capstones`…), et les données RÉELLEMENT disponibles
   (read-models existants). Lecture seule d'abord.
2. **Concevoir le système visuel** (tokens, typographie, densité, composants,
   états) AVANT toute implémentation massive.
3. Implémenter par surface, sobre, en réutilisant les read-models — sans jamais
   modifier le curriculum ni introduire de fausse donnée.

## Clôture (obligatoire à chaque sprint UI)
`npm test` + `tsc --noEmit` + `npm run build` + `gates:active` verts ; validation
navigateur réelle aux largeurs ci-dessus ; corpus SHA-1 identique ; ordre des jours
inchangé ; `progress.json` restauré ; working tree propre. **Ne pas démarrer V53.**
