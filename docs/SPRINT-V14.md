# Sprint V14 — Deuxième parcours réellement disponible : Full-Stack TypeScript Engineer

> V14 rend un **deuxième parcours** réellement disponible, sélectionnable et
> exploitable de bout en bout, en réutilisant l'infrastructure multi-parcours
> existante. Aucun nouveau runtime, aucun second moteur de progression, aucune
> modification de `data/program.json` ni des 365 Markdown.

## 1. Résumé produit avant / après

| | Avant (V13, `99e8688`) | Après (V14) |
|---|---|---|
| Parcours disponibles | 1 (AI Engineer — Fondations, 365 j) | **2** (+ Full-Stack TypeScript, 119 j) |
| Parcours annoncés | 5 | 5 |
| Sélection / bascule | infra présente, un seul parcours | **bascule confirmée, aller-retour** |
| Surfaces (Dashboard/calendrier) | « 365 » en dur | **pilotées par le parcours actif** |
| Tests | 472 | **491** |

## 2. État initial réellement audité (CP0)

Infrastructure multi-parcours **déjà présente et générique** : progression v3
(`activeTrackId`/`tracks`, `migrateToV7`, `activeTrackProgress`,
`writeActiveTrack`, `enrollTrack`/`setActiveTrack`), API `/api/track`, UI
`TrackActions`, catalogue (`buildCatalogue`/`validateCatalogue`), backup v3
multi-parcours. `progressPosition(days, …)` déjà agnostique au parcours.
**Manques** : aucun second parcours `available` (seuls des placeholders
`announced`) ; surfaces codant 365 en dur. HEAD `99e8688`, 472 tests verts,
program.json + 365 MD byte-identiques, progress.json restauré, 0 workspace.

## 3. Architecture multi-parcours retenue

Étendre l'existant (ADR-014). Le catalogue (`lib/catalogue.mjs`) reste la source
de vérité : ajout du parcours `fullstack-typescript` (`status: available`) et de
ses modules (références de jours, aucune copie de contenu). La progression, les
preuves, les compétences et les révisions vivent sous `tracks[<id>]` ;
`writeProgress → writeActiveTrack` écrit toujours le parcours actif. Un helper
pur `resolveTrackDays`/`resolveTrackDayObjects` alimente les surfaces à partir du
parcours actif (Fondations = 365 j inchangés).

## 4. Spécification du parcours Full-Stack TypeScript

- **id** : `fullstack-typescript` · **version** 1 · **statut** available.
- **Finalité** : concevoir, développer, tester et livrer une application web
  full-stack TypeScript (React, Node.js, APIs HTTP, SQL, tests, architecture).
- **Rôles** : Développeur Full-Stack TypeScript / Backend Node.js / Frontend
  React-TypeScript junior.
- **Technologies** : linux, git, javascript, typescript, node, react, api, sql,
  testing, architecture.
- **Durée dérivée** : **119 jours** (jours 1-119 du programme, trimestre 1).
- **Complétion** : `minDaysDone: 119`.

## 5. Modules, journées, exercices, projets, technologies, compétences

11 modules (plages contiguës, aucun jour dupliqué) :
1. Environnement, terminal & Git (j1-7) — 2. JavaScript moderne (j8-14) —
3. Algorithmie & structures de données (j15-35) — 4. TypeScript & conception
(j36-49) — 5. HTTP, REST & Node/Express (j50-56) — 6. SQL & persistance (j57-66)
— 7. Sécurité & robustesse d'API (j67-70) — 8. Architecture, observabilité &
qualité (j71-86) — 9. React : composants, état & hooks (j87-105) — 10. Tests &
qualité front (j106-112) — 11. Projet full-stack final (j113-119).

## 6. Matrice de couverture

- 119 journées · 11 modules · **59 exercices atteignables** (34 jours avec
  exercice) · 19 journées projet · 17 révisions.
- Charge max d'exercices/jour : 5 (j88, héritée V11).
- Compétences/technologies : voir §4-5.

## 7. Progression indépendante démontrée (CP5)

Test pur du scénario complet : Fondations a une progression → démarrage
Full-Stack → activité + réussite DANS Full-Stack → retour Fondations
**strictement inchangé** → retour Full-Stack **restauré**. Une preuve d'un
parcours laisse l'autre vierge. Confirmé en navigateur (E2E, §13).

## 8. Scénarios de migration

Format plat historique (V4-V8) → `migrateToV7` → parcours par défaut, sans perte.
Idempotent (v3 → v3 stable). Aucune incrémentation de schéma (v3 gère déjà N
parcours).

## 9. Sauvegarde / import multi-parcours (CP9)

Backup v3 sérialise `activeTrackId` + **tous** les parcours + workspaces
autorisés. Round-trip : deux parcours et le parcours actif préservés, isolation
maintenue. Refus propres : schéma trop récent, JSON corrompu, mauvaise app.
Anti-fuite : fichiers hors allowlist / traversal / tests privés jamais importés.

## 10. Recherche et confidentialité (CP8)

Le parcours Full-Stack et ses modules sont trouvables par métadonnées publiques
seules ; disponibilité distinguée (« Parcours » vs « Parcours · à venir »).
Aucune donnée privée indexée (buildIndex ne reçoit que programme + catalogue
publics). Palette et catalogue restent génériques.

## 11. Checkpoints et commits

| CP | Objet | Commit |
|----|-------|--------|
| CP0 | Audit forensique | (aucun changement) |
| CP1 | ADR-014 | `d1e9f97` |
| CP2 | resolveTrackDays + validation renforcée | `3a6fbf7` |
| CP3 | Parcours Full-Stack TypeScript disponible | `65c8206` |
| CP4 | Bascule confirmée et accessible | `5b3163b` |
| CP5 | Isolation stricte (scénario) | `e1f7139` |
| CP6 | Surfaces pilotées par le parcours actif | `74527f2` |
| CP7 | Preuves/compétences/révisions par parcours | (vérifié, aucun changement) |
| CP8 | Recherche multi-parcours (tests) | `1dcaaed` |
| CP9 | Backup/import multi-parcours (tests) | `522db36` |
| CP10 | Hardening, validation, rapport | _ce commit_ |

## 12. Tests ajoutés

catalogue (resolveTrackDays, resolveTrackDayObjects, validation renforcée : 9),
progress-store (isolation, scénario : 2), search (multi-parcours : 3),
backup-multitrack (round-trip, migration, refus, anti-fuite : 5). Total suite :
**491** (472 → 491).

## 13. Validation navigateur

- **Bascule E2E réelle** : Fondations → Full-Stack (confirmation) → retour, zéro
  erreur console ; Dashboard « jour X sur 119 », calendrier 119 jours ; retour
  Fondations → 365.
- **Scénario complet (19 étapes)** : bascule + réussite d'exercice (jour 50) →
  preuve dans Full-Stack, Fondations non contaminé → export → import → deux
  parcours préservés → restauration exacte des données.
- **Matrice** : 50/50 (10 routes × 375/768/1024/1440/1920) — HTTP 200, zéro
  overflow, zéro erreur console applicative, focus clavier.

## 14. Performances et bundles

- Routes chaudes : / ~34 ms, /parcours ~15-30 ms, /calendar ~35-70 ms,
  /skills ~18 ms, /revisions ~13 ms. Aucune régression.
- Bundles : CodeMirror lazy (absent de /, /parcours, /calendar et du bundle
  initial de /lab/[id]) ; compilateurs TS/TSX, react-preview et
  renderToStaticMarkup **serveur uniquement** ; aucun runtime lourd ajouté aux
  routes ordinaires. Build sans warning.

## 15. Sécurité et anti-fuite

Aucune indexation de code apprenant, réponse/note privée, test privé, solution,
workspace ni secret. Preuve créée uniquement par réussite réelle, dans le
parcours actif. Import : allowlist stricte, refus propres. Protections
**applicatives** (jamais présentées comme isolation OS).

## 16. Limites honnêtes

- **Docker / CI / livraison** : non couverts par le trimestre 1 (l'observabilité
  l'est, j79). Lacune assumée du module 8, à enrichir ultérieurement — aucun
  faux contenu injecté.
- Les journées hors parcours restent consultables individuellement (contenu
  partagé) ; elles n'appartiennent pas à la trajectoire du parcours.
- `computeStats` (prochain livrable) reste calculé sur le programme complet ;
  affinement par parcours reporté (non bloquant).
- Notation React : événements/`useEffect` non auto-notés (limite V12/V13).

## 17. État Git final

Branche `claude/ai-career-os-saas-phfg49`, tous les checkpoints commités et
poussés, **local == origin**, working tree propre.

## 18. SHA des données utilisateur

Initial et final : `8b043eeb337db1672413e5239be73ecfc6f55d61dc97465b3a8d9dca79b2b7d1`
(restauré à l'identique après chaque test).

## 19. Byte-identité `program.json` + 365 Markdown

Vérifiée après génération idempotente : `data/program.json` et les 365 Markdown
**byte-identiques** à la baseline `b7bc8e7`.

## 20. Prompt de reprise V15

Voir le message de clôture de session (prompt V15), à ne pas démarrer ici.

---

**HEAD final** : commit CP10 · **local == origin** · working tree propre ·
**491 tests** · **parcours disponibles** : AI Engineer — Fondations (365 j),
Full-Stack TypeScript Engineer (119 j) · **données restaurées** (SHA identique) ·
**aucun workspace parasite** · limites : Docker/CI non couverts, stats « prochain
livrable » globales, notation React statique.
