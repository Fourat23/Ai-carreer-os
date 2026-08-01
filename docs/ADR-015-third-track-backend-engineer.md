# ADR-015 — Troisième parcours : Backend Engineer

Statut : accepté (Sprint V15). Décision fondée sur l'audit CP0 réel. Aucun
nouveau runtime, aucun second moteur de progression, aucune modification de
`data/program.json` ni des 365 Markdown.

## Contexte — état réel audité (CP0)

HEAD `eaaf2b8` (V14). Infrastructure multi-parcours **présente et générique** :
progression v3 (`activeTrackId`/`tracks`, `migrateToV7`, `activeTrackProgress`,
`writeActiveTrack`, `enrollTrack`/`setActiveTrack`), `/api/track`, `TrackActions`,
catalogue (`buildCatalogue`/`validateCatalogue`/`resolveTrackDays`/
`resolveTrackDayObjects`), backup v3 multi-parcours, surfaces Dashboard/
calendrier/trajectoire déjà pilotées par le parcours actif. Deux parcours
disponibles : `ai-engineer-foundations-v1` (365 j), `fullstack-typescript`
(119 j). `backend-engineer-v1` n'existe que comme placeholder **announced**.
491 tests verts, program.json + 365 MD byte-identiques à `b7bc8e7`,
progress.json SHA `8b043eeb…`, 0 workspace/serveur.

## Décisions

### 1. Rôle et objectifs professionnels

`backend-engineer-v1` forme un **développeur backend Node.js/TypeScript** :
concevoir et exposer des APIs HTTP/REST robustes, valider les entrées, gérer les
erreurs, persister en SQL, sécuriser (auth/OWASP de base), structurer
(architecture 3-tiers/MVC), observer et durcir. Rôles cibles : Développeur
Backend Node.js junior, Développeur API TypeScript junior.

### 2. Différences avec Foundations et Full-Stack

- **Foundations** (365 j) : le cursus complet, jusqu'à l'IA appliquée.
- **Full-Stack** (119 j) : trimestre 1 **complet**, React inclus (j87-119).
- **Backend** (85 j) : le **spine serveur** du trimestre 1, **sans le bloc
  frontend/React** (j87-119) et **sans** l'introduction Python/data (j82, hors
  sujet backend-TS). C'est une **sélection thématique cohérente**, pas une
  troncature arbitraire : le parcours s'arrête à la consolidation serveur (j86).
  Il est volontairement **non contigu** (saut j81→j83), ce qui valide le support
  des parcours non contigus dans les surfaces.

### 3. Source de vérité et sélection de journées

`lib/catalogue.mjs` (étendu). Le parcours référence des journées existantes par
`dayRefs` regroupées en modules (plages, j82 exclu). Aucun contenu dupliqué.
Durée dérivée par `resolveTrackDays` : **85 jours**.

### 4. Stratégie de modules (progression lisible)

1. Fondations backend (terminal, Git, JS) — j1-14
2. Algorithmie & structures de données — j15-35
3. TypeScript & conception — j36-49
4. HTTP, Node & Express — j50-56
5. SQL, persistance & API (Projet 2) — j57-66
6. Sécurité applicative — j67-70
7. Architecture, observabilité & qualité — j71-81
8. Consolidation & durcissement — j83-86

Progression : fondations → HTTP/API → Node/Express → validation/erreurs →
persistance SQL → sécurité → architecture → observabilité/perf → consolidation.

### 5. Isolation, navigation bornée, surfaces track-aware

Isolation par `tracks[<id>]` (déjà en place). V15 **affine** les surfaces encore
globales pour qu'elles soient réellement bornées au parcours actif : navigation
Vue Jour précédent/suivant **dans `resolveTrackDays`** (jamais `day±1`),
`computeStats` (jour attendu, retard/avance, prochain livrable/projet) **scopé au
parcours actif**. Fondations reste 365 j, Full-Stack 119 j, Backend 85 j.

### 6. Compatibilité

Format plat historique → `migrateToV7` → parcours par défaut. Backup v3
multi-parcours déjà pris en charge (round-trip 3 parcours ciblé en CP9). Aucun
incrément de schéma.

### 7. Invariants sécurité/confidentialité

Inchangés : aucune indexation de code/réponse/note/test privé/solution/
workspace/secret. Preuve créée uniquement par réussite réelle, dans le parcours
actif. Protections **applicatives**, jamais une isolation OS.

## Matrice de couverture (réelle, CP1)

| Module | Jours | Exercices | Projets | Révisions |
|--------|-------|-----------|---------|-----------|
| Fondations backend | j1-14 | 8 | 0 | 2 |
| Algo & structures | j15-35 | 9 | 0 | 3 |
| TypeScript & conception | j36-49 | 12 | 4 | 2 |
| HTTP, Node & Express | j50-56 | 2 | 0 | 1 |
| SQL, persistance & API | j57-66 | 0 | 6 | 1 |
| Sécurité applicative | j67-70 | 0 | 0 | 1 |
| Architecture & qualité | j71-81 | 0 | 0 | 1 |
| Consolidation | j83-86 | 0 | 2 | 1 |
| **Total** | **85 j** | **31** | **12** | **12** |

Technologies (honnêtes) : linux, git, javascript, typescript, node, api, sql,
testing, architecture.

## Limites honnêtes / lacunes assumées

- **Docker, CI/CD, cloud** : non couverts par le trimestre 1 (le placeholder
  annoncé mentionnait « docker » ; on le **retire** faute de contenu réel).
  Backlog pédagogique.
- **Sécurité applicative** : réelle mais légère (2 jours : OWASP + auth token).
- **SQL** : introductif (SELECT/JOIN, SQLite, modélisation) ; pas de SQL avancé.
- **Observabilité** : couverte (j79) mais isolée.
- Les modules 6-8 (sécurité/architecture/consolidation) sont **conceptuels/
  projet** : peu ou pas d'exercices de code (honnête, non masqué).
- Les journées hors parcours restent consultables individuellement (contenu
  partagé) ; elles n'appartiennent pas à la trajectoire du parcours.

## Décisions rejetées

- Second moteur de progression / seconde source de vérité / copie du programme.
- Durée codée en dur, tableau de journées caché dans un composant.
- Inventer un contenu Docker/CI pour « remplir » un module.
- Inclure React (j87-119) dans un parcours backend.
