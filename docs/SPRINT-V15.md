# Sprint V15 — Troisième parcours : Backend Engineer + surfaces track-aware

> V15 rend disponible un **troisième parcours** (Backend Engineer) et **affine
> les surfaces** pour qu'elles soient réellement pilotées par le parcours actif
> (navigation Vue Jour bornée, `computeStats` scopé). Aucun nouveau runtime,
> aucun second moteur de progression, aucune modification de `data/program.json`
> ni des 365 Markdown.

## 1. État initial réellement audité (CP0)

HEAD `eaaf2b8` (V14). Infrastructure multi-parcours **présente et générique** :
progression v3 (`activeTrackId`/`tracks`, `migrateToV7`, `activeTrackProgress`,
`writeActiveTrack`, `enrollTrack`/`setActiveTrack`), `/api/track`, `TrackActions`,
`buildCatalogue`/`validateCatalogue`/`resolveTrackDays`/`resolveTrackDayObjects`,
backup v3 multi-parcours, surfaces Dashboard/calendrier/trajectoire déjà
track-aware (V14). 491 tests verts, program.json + 365 MD byte-identiques à
`b7bc8e7`, progress.json SHA `8b043eeb…`, 0 workspace/serveur.
`backend-engineer-v1` n'existait que comme placeholder **announced**.

## 2. Architecture retenue

Étendre l'existant (ADR-015). Le catalogue (`lib/catalogue.mjs`) reste la source
de vérité : ajout du parcours `backend-engineer-v1` (available) via les mêmes
fonctions génériques que Full-Stack (modules = plages de jours, skills dérivés,
aucune copie de contenu). Surfaces restées globales affinées : navigation Vue
Jour bornée au parcours (`trackNeighbors`), `computeStats` scopé aux journées du
parcours actif.

## 3. Définition de `backend-engineer-v1`

- **Statut** available · **version** 1 · **durée dérivée** : **85 jours**.
- **Objectif** : concevoir et exposer des APIs HTTP/REST robustes en Node.js/
  TypeScript (validation, erreurs, persistance SQL, sécurité, architecture,
  observabilité). **Rôles** : Backend Node.js junior, API TypeScript junior.
- **Sélection** : spine serveur du trimestre 1 (jours 1-86), **sans** le bloc
  frontend/React (j87-119) ni l'intro Python/data (j82) → **non contigu**
  (saut j81→j83).
- **Technologies** (honnêtes) : linux, git, javascript, typescript, node, api,
  sql, testing, architecture (docker retiré, non couvert).

## 4-5. Matrice modules / journées / exercices / projets

| Module | Jours | Exercices | Projets |
|--------|-------|-----------|---------|
| Fondations backend | j1-14 | 8 | 0 |
| Algo & structures | j15-35 | 9 | 0 |
| TypeScript & conception | j36-49 | 12 | 4 |
| HTTP, Node & Express | j50-56 | 2 | 0 |
| SQL, persistance & API | j57-66 | 0 | 6 |
| Sécurité applicative | j67-70 | 0 | 0 |
| Architecture & qualité | j71-81 | 0 | 0 |
| Consolidation | j83-86 | 0 | 2 |
| **Total** | **85 j / 8 modules** | **31** | **12** |

## 6. Couverture pédagogique réelle & lacunes

Couvert réellement : terminal/Git, JS/TS, algo/DS, HTTP/REST, Node/Express,
validation/erreurs, SQL introductif, projets API (TaskFlow, LivreAPI),
sécurité de base (OWASP/auth), architecture 3-tiers/MVC, observabilité (j79).
**Lacunes assumées** (aucun faux contenu) : Docker, CI/CD, cloud (absents du
trimestre 1) ; sécurité légère (2 jours) ; SQL non avancé ; modules sécurité/
architecture/consolidation **conceptuels** (peu/pas d'exercices de code).

## 7. Checkpoints et commits

| CP | Objet | Commit |
|----|-------|--------|
| CP0 | Audit forensique | (aucun changement) |
| CP1 | ADR-015 | `2591d67` |
| CP2 | Backend disponible (85 j, non contigu) | `86b9f49` |
| CP3 | Couverture pédagogique (tests) | `b079f2a` |
| CP4 | Sélection/bascule 3 parcours | (vérifié E2E, aucun changement) |
| CP5 | Isolation stricte 3 parcours | `155c5fb` |
| CP6 | Nav Vue Jour + computeStats bornés | `ef9dc14` |
| CP7 | Preuves/compétences/révisions Backend | (vérifié E2E, aucun changement) |
| CP8 | Recherche multi-parcours (tests) | `c18f774` |
| CP9 | Backup/import 3 parcours (tests) | `902ba7b` |
| CP10 | Hardening, validation, rapport | _ce commit_ |

## 8. Nombre final de tests

**507** (491 → 507) : catalogue (backend + resolveTrackDays + trackNeighbors + validation),
track-backend-coverage, progress-store (isolation 3 parcours), search, backup-multitrack.

## 9. Validations navigateur

Matrice **60/60** (12 routes × 375/768/1024/1440/1920) : HTTP 200, zéro overflow,
zéro erreur console applicative, focus clavier. Routes : Dashboard, Parcours,
Calendrier, Révisions, Compétences, Catalogue, Vue Jour (commun/Full-Stack/borne
Backend j81/hors-Backend j200), Recherche, Projets.

## 10. Scénarios E2E

- **Bascule 3 parcours** (CP4) : Fondations → Backend → Full-Stack → Backend →
  Fondations, confirmation à chaque bascule, zéro erreur console.
- **Preuve isolée** (CP7) : Backend actif → réussite api-router (j52) → preuve +
  compétence `http` dans Backend seul ; Fondations et Full-Stack non contaminés.
- **Nav bornée** (CP6) : Backend actif → j81 suivant = /day/83 (saut j82), j86
  sans suivant (« 85 sur 85 »), j1 sans précédent, Dashboard « sur 85 ».
- Données restaurées au SHA initial après chaque scénario.

## 11. Preuve d'isolation des trois parcours

Fonctions pures (aucune écriture disque) : une activité/preuve/compétence dans un
parcours n'altère aucun autre (dans les deux sens) ; bascule aller-retour
Fondations → Full-Stack → Backend restaure exactement chaque état. Confirmé E2E.

## 12. Sauvegarde / import / migrations

Backup v3 : round-trip des trois parcours + parcours actif préservés, isolation
maintenue ; stats `trackCount=3`. Mutation puis import → restauration exacte.
Format plat historique → `migrateToV7` → parcours par défaut. Aucun incrément de
schéma.

## 13. Recherche et sécurité anti-fuite

Backend indexé, trouvable, marqué disponible (« Parcours »), distingué des
annoncés. `buildIndex` ne reçoit que programme + catalogue publics → aucune
donnée privée indexée (l'entrée n'expose que title/subtitle/href/keywords/id/type).

## 14. Performances

Routes chaudes : / ~28 ms, /parcours ~18 ms, /calendar ~38 ms, /day/81 ~21 ms,
/skills ~16 ms. Aucune régression.

## 15. Discipline de bundle

CodeMirror **lazy** (absent de /, /parcours, /calendar, /day/[id] et du bundle
initial du labo). Compilateurs TS/TSX, react-preview et `renderToStaticMarkup`
**serveur uniquement** (absents de tous les chunks client). Build sans warning.

## 16. Limites honnêtes

- **Docker/CI/CD/cloud** non couverts (backlog pédagogique) ; sécurité légère ;
  SQL introductif ; modules sécurité/archi/consolidation conceptuels.
- La journée hors parcours reste consultable individuellement (contenu partagé),
  avec navigation linéaire de repli.
- Le **catalogue du Laboratoire** reste un corpus global partagé (les exercices
  sont liés aux journées, pas aux parcours) ; le contexte parcours est porté par
  la Vue Jour, pas par un filtre de catalogue (choix assumé, non bloquant).
- Notation React : événements/`useEffect` non auto-notés (limite V12-V14).
- Protections **applicatives**, jamais une isolation OS.

## 17. Byte-identité `program.json` + 365 Markdown

Vérifiée après génération idempotente : **byte-identiques** à `b7bc8e7`.

## 18. SHA des données utilisateur

Initial et final : `8b043eeb337db1672413e5239be73ecfc6f55d61dc97465b3a8d9dca79b2b7d1`.

## 19-21. Restauration / workspaces / serveurs

`data/progress.json` restauré à l'identique après chaque validation ; **aucun
workspace résiduel** ; **aucun serveur résiduel**.

## 22. État Git final

Branche `claude/ai-career-os-saas-phfg49`, tous les checkpoints commités et
poussés, **local == origin**, working tree propre.

## 23. Résumé avant / après

| | Avant (V14, `eaaf2b8`) | Après (V15) |
|---|---|---|
| Parcours disponibles | 2 (365 j, 119 j) | **3** (+ Backend, **85 j, 8 modules, 31 exercices**) |
| Navigation Vue Jour | globale (day±1, /365) | **bornée au parcours** (`trackNeighbors`) |
| computeStats | programme complet | **scopé au parcours actif** |
| Tests | 491 | **507** |

## 24. Techniquement disponible vs pédagogiquement exploitable

- **Infrastructure multi-parcours** : pleinement fonctionnelle (3 parcours,
  isolation, bascule, backup, surfaces track-aware).
- **Backend techniquement activable** : oui (available, sélectionnable,
  progression isolée, exploitable de bout en bout).
- **Backend pédagogiquement exploitable** : oui sur le **spine serveur** (31
  exercices, 12 journées projet, progression lisible fondations → API → SQL →
  sécurité → architecture) ; **partiel** sur Docker/CI/CD (absents),
  sécurité/observabilité (légers). Ces manques sont **documentés**, non masqués.

## 25. Prompt de reprise V16

Voir le message de clôture de session (prompt V16), à ne pas démarrer ici.

---

**HEAD final** : commit CP10 · **local == origin** · working tree propre ·
**507 tests** · build sans warning · curriculum guard OK · parcours disponibles :
Fondations (365 j / 12 mod / 68 ex), Full-Stack TypeScript (119 j / 11 mod /
59 ex), Backend Engineer (85 j / 8 mod / 31 ex) · données restaurées (SHA
`8b043eeb…`) · aucun workspace ni serveur résiduel.
