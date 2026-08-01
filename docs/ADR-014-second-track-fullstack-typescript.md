# ADR-014 — Deuxième parcours : Full-Stack TypeScript Engineer

Statut : accepté (Sprint V14). Décision fondée sur l'architecture réellement
auditée (CP0), pas sur le prompt. Aucun nouveau runtime, aucun second moteur de
progression, aucune modification de `data/program.json` ni des 365 Markdown.

## Contexte — état réel audité (CP0)

L'infrastructure multi-parcours est **déjà présente et générique** :

- **Progression v3** (`lib/progress-store.mjs`, `PROGRESS_SCHEMA = 3`) :
  `{ schemaVersion, activeTrackId, tracks: { <id>: <flat> } }`. `migrateToV7`
  migre le format plat historique vers le parcours par défaut ; `activeTrackProgress`,
  `writeActiveTrack`, `enrollTrack`, `setActiveTrack`, `tracksMeta` gèrent
  l'isolation, l'inscription et la bascule — **testés**.
- **Sélection** : `POST /api/track` → `enrollAndActivate` (n'active qu'un parcours
  `available`, refuse un `announced`) ; UI `/parcours` + `TrackActions`
  (« Activer ce parcours », « Parcours actif », « Bientôt disponible »).
- **Catalogue** (`lib/catalogue.mjs`) : `buildCatalogue(program)` dérive le
  parcours `ai-engineer-foundations-v1` (`status: 'available'`) des mois du
  programme (références de jours, jamais de copie), plus `ANNOUNCED_TRACKS`
  (`status: 'announced'`, non activables). `validateCatalogue` vérifie unicité et
  références résolues.
- **Sauvegarde** : `serializeBackupV3` sérialise `activeTrackId` + tous les
  `tracks` ; les anciens formats sont migrés.
- **Position** : `progressPosition(days, progress)` calcule `total = days.length`
  à partir de la **liste de jours fournie** — déjà agnostique au parcours.

**Manques réels pour V14** : (1) aucun second parcours `available` (seulement des
placeholders `announced`) ; (2) les surfaces (`app/page.tsx`, `app/calendar`,
`Trajectory365`, borne de la Vue Jour) **codent 365 en dur** et itèrent
`program.days` au lieu des jours du parcours actif.

## Décisions

### 1. Source de vérité des parcours : `lib/catalogue.mjs` (étendue)

La source dédiée existe déjà (code versionné, `version` par parcours). On
**l'étend** : ajout du parcours réel `fullstack-typescript` et de ses modules,
sans nouvelle source JSON et sans dupliquer le contenu rédactionnel. Chaque
module ne porte que des **références** (dayRefs, skills, projectRef).

### 2. Le parcours Full-Stack TypeScript réutilise les journées existantes

Le programme historique contient déjà toute la fondation génie logiciel aux
**mois 1 à 4 (jours 1–119)** : terminal/Git, JavaScript, TypeScript, algo/DS,
Node/Express, HTTP/REST, SQL, tests, React/full-stack, sécurité d'API,
architecture, projets. Le parcours `fullstack-typescript` **sélectionne et
regroupe** ces jours en modules thématiques (références explicites), sans
réordonner le contenu ni modifier un seul Markdown.

### 3. Durée dérivée des références

`totalDays` = nombre de jours distincts référencés par les modules du parcours
(pas 365, pas une constante). Un helper pur `resolveTrackDays(catalogue, trackId,
program)` renvoie la liste ordonnée et dédupliquée des jours du parcours ; il
alimente position, calendrier et trajectoire. Pour le parcours fondations, il
renvoie l'ensemble des 365 jours → comportement historique **inchangé**.

### 4. Sélection et bascule : réutilisation intégrale

Aucun nouveau mécanisme. `TrackActions` + `POST /api/track` + `enrollTrack`/
`setActiveTrack` activent `fullstack-typescript` comme n'importe quel parcours
`available`. La bascule conserve la progression de chaque parcours (map `tracks`)
et restaure la position propre à chacun. Un parcours annoncé reste non activable.

### 5. Isolation stricte par parcours

Tout l'état (journée courante, statuts, réponses, notes, tentatives, corrections,
auto-évaluations, révisions, preuves, compétences, reprise) vit sous
`tracks[<id>]`. `activeTrackProgress`/`writeActiveTrack` lisent/écrivent le
parcours actif uniquement. Les preuves d'exercice (`recordExerciseSuccess`) et
les compétences sont écrites dans le parcours actif — jamais dans un autre.

### 6. Création de preuves inchangée

Une preuve n'est créée que par une réussite réelle, dans le parcours actif. Le
simple rattachement d'un exercice à une journée ne crée aucune preuve. Taxonomie
canonique V13 réutilisée.

### 7. Compatibilité des sauvegardes

Format plat historique (V4–V8) → `migrateToV7` → parcours par défaut. Backup v3
multi-parcours déjà pris en charge. Aucun changement de version de schéma n'est
nécessaire (le schéma v3 gère déjà N parcours) → on ne l'incrémente pas.

### 8. Surfaces pilotées par le parcours actif (sans casser 365)

`app/page.tsx`, `app/calendar`, `Trajectory365` et la navigation Vue Jour
itèrent désormais `resolveTrackDays(activeTrack)` au lieu de `program.days` en
dur, et affichent « Jour X sur Y » avec `Y = totalDays` du parcours actif. Les
mentions « 365 » qui décrivent réellement **le programme historique** (ex.
composant de signature du parcours fondations) ne sont pas remplacées
aveuglément. La Vue Jour d'un jour reste consultable pour tout jour du programme
(contenu partagé) ; seuls les jours du parcours actif figurent dans sa
trajectoire, son calendrier et ses compteurs — aucun jour hors parcours n'est
présenté comme obligatoire.

### 9. Invariants de sécurité et confidentialité

Inchangés : aucune indexation de code apprenant, réponse/note privée, test privé,
solution, contenu de workspace ni secret. Métadonnées publiques seules pour
catalogue/recherche/palette. Protections **applicatives** (sandbox, CSP,
allowlist, timeouts) — jamais une isolation OS.

### 10. Décisions rejetées

- Un second `data/progress.json` ou un second moteur de progression.
- Une copie du programme / des Markdown par parcours.
- Une logique Full-Stack codée en dur dispersée dans les composants.
- Incrémenter la version de schéma (v3 suffit).
- Référencer les jours Docker/CI du mois 11 (contexte projet IA) hors de leur
  contexte pour « remplir » un module — ce serait du faux contenu.

## Limites honnêtes

- **Docker / CI / observabilité** : le programme ne les traite qu'au mois 11,
  imbriqués dans le projet final IA. Le parcours Full-Stack marque ce module
  comme **lacune assumée** (référencé mais signalé « à enrichir »), sans inventer
  de contenu. De même, la couverture SQL/PostgreSQL s'appuie sur les jours SQL
  réels du mois 3 (introduction), pas sur une expertise avancée.
- Le parcours est une **sélection/regroupement** de journées existantes : il ne
  crée pas de nouveau contenu rédactionnel. V14 rend le parcours *disponible et
  exploitable*, il n'enrichit pas les 365 cours.
- Les jours hors parcours restent consultables individuellement (contenu
  partagé) ; ils n'appartiennent simplement pas à la trajectoire du parcours.
