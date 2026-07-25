# ADR-007 — Multi-parcours & fondations du laboratoire de code

Statut : accepté (Sprint V7) · Contexte : V6 Active Learning terminée (schéma progression v2).

## Problème
Le produit est structurellement mono-programme : un unique `data/program.json`
(365 jours) chargé par `getProgram()`, une progression indexée par numéro de jour
`1..365`, et des bornes `365` codées en dur dans la Vue Jour, l'API progression,
la trajectoire et la sauvegarde. On veut accueillir plusieurs parcours composés de
modules mutualisés, sans réécrire le curriculum ni casser l'expérience actuelle.

## Audit (état réel)
- **Curriculum** : `data/program.json` généré (scripts/data) → `Program`
  { skills, months, weeks, days, lessons }. Contenu Markdown rendu à la volée.
  16 routes consomment `getProgram()`/`getDay()`.
- **Progression** : `data/progress.json` → `lib/progress-server.ts` (lecture unique,
  migre via `learning.migrateProgress`) ; `lib/learning.mjs` (modèle jour v2),
  `lib/position.mjs`, `lib/review.mjs`, `lib/skill-state.mjs`, `lib/backup.mjs`.
  Progression = `{ startDate, days: {"N": DayProgress}, skills, weeklyReviews, monthlyReviews }`.
- **Couplage 365** : `day/[id]/page.tsx` (`>365`), `api/progress/route.ts`,
  `DayHeader`/`DayPanel` (`/365`, `day<365`), `Trajectory365`, `backup` (bornes 1–365).

## Décision
1. **Le programme actuel devient le premier parcours** `ai-engineer-foundations-v1`,
   sans toucher son contenu ni sa séquence. `getProgram()` reste la source de contenu
   de ce parcours (le catalogue le référence, il ne le duplique pas).
2. **Catalogue générique** (`lib/catalogue.mjs`, pur, validé au chargement) :
   `Track` → `TrackVersion` → `ModuleReference` → `Module` → `LearningUnit`/`DayReference`
   /`ProjectReference` ; `Skill`/`Technology` (taxonomie) ; `Prerequisite`. Un module
   est référencé par plusieurs parcours, jamais copié. Ids stables ≠ titres affichés.
   Référence cassée / id dupliqué → **erreur explicite** (pas de fallback silencieux).
3. **Progression multi-parcours (schéma v3)** : `{ activeTrackId, tracks: {[id]:
   { version, enrolledAt, lastOpenedAt, days, skills, ... } } }`. Migration
   automatique et idempotente v2→v3 : la progression V6 existante est déplacée sous
   `tracks['ai-engineer-foundations-v1']` et ce parcours devient actif. **Aucune perte**
   (réponses, auto-éval, tentatives, corrections, révisions, preuves, compétences).
4. **API unique** : `lib/progress-server.ts` reste le seul point d'accès disque ; on
   ajoute une couche « parcours actif » ; les composants n'accèdent jamais au JSON
   directement. Les helpers jour (learning/position/review) restent inchangés et
   opèrent sur `days` du parcours actif.
5. **Laboratoire** : modèle d'exercice générique versionné (`Exercise`,
   `WorkspaceTemplate`, `TestDefinition`, `RuntimeDefinition`, `AttemptResult`…),
   validateurs purs. Un **workspace local cloisonné** sous une racine dédiée
   (`data/workspaces/`, gitignorée), sans shell libre : `spawn` sans shell, binaires
   et arguments **allowlistés**, timeout, limites taille/sortie, anti path-traversal.
   Premier runtime : **JS/Node local**. Exercices = fixtures de démo, jamais injectés
   dans les 365 jours. Lien jour↔exercice via `exerciseRefs` optionnel (fixture).

## Ce qui reste inchangé
Contenu des 365 jours (byte-identical), rendu Markdown, familles pédagogiques,
boucle de reprise V6, trajectoire, design « Engineering Workbench », une seule
source utilisateur (`data/progress.json`).

## Ce qui devient générique
Le « total de jours » et les bornes viennent du parcours actif (via le catalogue),
plus d'un `365` magique dans la logique ; la progression est indexée par parcours ;
la recherche/sauvegarde connaissent la notion de parcours.

## Compatibilité V6
Un utilisateur qui n'active aucun nouveau parcours voit exactement l'app actuelle
(le parcours par défaut EST le programme actuel). Les sauvegardes V4/V5/V6 se migrent
vers v3 ; les schémas futurs (> version courante) sont rejetés proprement.

## Limites volontairement reportées
Pas de second programme de 365 jours écrit ; pas de moteur de prérequis complexe ;
pas de Monaco/terminal/Docker/Python/preview ; runtime unique JS/Node ; pas de
cloud/collaboration. Exécution strictement locale, allowlistée, temporisée, testée.

## Stratégie de migration (incrémentale, gates verts à chaque étape)
CP2 catalogue → CP3 progression v3 (migration) → CP4 route /parcours + dashboard
→ CP5 recherche/sauvegarde multi-parcours → CP6 modèle exercice + validateurs →
CP7 workspace sécurisé → CP8 /lab MVP (éditeur) → CP9 lien jour↔exercice → CP10
hardening. Chaque étape préserve l'expérience mono-parcours par défaut.
