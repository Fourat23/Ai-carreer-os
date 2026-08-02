# ADR-018 — Missions d'ingénierie & évaluation honnête

Statut : accepté (Sprint V18). Décision fondée sur l'audit CP0 réel. Étend
l'existant ; aucun second moteur de progression, aucun second catalogue, aucune
nouvelle source de vérité dispersée, aucun nouveau runtime.

## Problème produit

V17 a ajouté les *notions* professionnelles (dette technique, maintenance,
performance, ADR/HSD/TSD, runbook, post-mortem) sous forme de cours, d'exercices
courts et de modèles documentaires. L'apprenant les **connaît** mais ne les
**pratique pas** dans un contexte réaliste : analyser une situation existante,
diagnostiquer, arbitrer, modifier sous contrôle, mesurer avant/après, produire
des livrables et justifier ses décisions. Il manque une brique de **missions
d'ingénierie** : des scénarios longs, multi-livrables, reliés aux parcours, aux
journées, aux projets, aux compétences et au système de preuves.

## Contexte pédagogique

Une mission part d'un contexte métier crédible et produit au moins un artefact
vérifiable. Elle est progressive et réutilise les notions déjà enseignées. Elle
reste utilisable dans une application **locale, mono-utilisateur**, sans réseau.

## Architecture existante réutilisée (audit CP0)

- **Progression v3** (`data/progress.json`, source unique) :
  `{ schemaVersion:3, activeTrackId, tracks:{ [id]:{ version, enrolledAt,
  lastOpenedAt, startDate, days:{}, skills:{}, weeklyReviews:{}, monthlyReviews:{} } } }`.
- **Preuves** : `evidence[]` par journée, via `addEvidence` (lib/learning.mjs) et
  `recordExerciseSuccess` (lib/lab-progress.mjs), dédoublonnées par URL.
- **Compétences** : carte `skills{}` (niveaux 0–5, plancher pratiqué = 3).
- **Exercices** : `data/exercises/*.json` + `lib/exercise.mjs` (`call-equals`),
  tests publics/privés, référence côté serveur.
- **Jours ↔ exercices** : `data/day-exercises.json`. **Jours ↔ parcours** :
  `resolveTrackDays` / `resolveTrackDayObjects` (lib/catalogue.mjs).
- **Projets** : `program.json` (`day.project`) + `curriculum/projects/*.md`.
- **Backup v3** : `lib/backup.mjs` — `serializeBackupV3`/`parseBackupV3`, avec
  `validateStrict` qui **whiteliste** `{ startDate, days, skills, weeklyReviews,
  monthlyReviews }` (les champs inconnus sont retirés avec avertissement).
- **Recherche** : `lib/search.mjs` `buildIndex` (paramètres optionnels).

## Décisions

### 1. Source de vérité

- **Définitions de mission** (contenu, contexte, livrables attendus, rubric,
  critères) : nouvelle source **versionnable** `data/missions/*.json`, parallèle à
  `data/exercises/`. Pure donnée, jamais injectée en dur dans les composants.
- **État de mission** (progression de l'apprenant, livrables produits,
  auto-évaluation, revue) : dans la **progression v3 existante**, sous un champ
  optionnel `missions` du track plat. **Aucune** seconde progression.
- **Preuves & compétences** : réutilisent `addEvidence` et la carte `skills{}`.

Justification d'un modèle dédié : une mission n'est ni un exercice (`call-equals`
mono-fonction) ni un projet (markdown pur). Elle est longue, multi-livrables, à
validation **mixte** (auto / structurelle / humaine). Le modèle d'exercice et le
modèle de projet sont réutilisés *à l'intérieur* d'une mission, pas dupliqués.

### 2. Modèle de mission (CP2)

Champs : `id` (stable, kebab), `title`, `description`, `category`
(debt-maintenance | performance | documentation | incident), `difficulty` (1–5),
`estimatedHours`, `context`, `prerequisites`, `skills[]`, `trackRefs[]`,
`dayRefs[]`, `starterFiles?`, `deliverables[]`, `exerciseRefs[]`, `rubric[]`,
`commonMistakes[]`, `status` (`draft`|`published`), `version`.

Un **deliverable** : `{ id, kind, title, required, validation }` où `kind` ∈
`code` | `document` | `metrics` | `decision` | `plan` | `report` ; `validation` ∈
`auto` (exercice lié, tests) | `structural` (sections/champs/limites) | `review`
(revue humaine / auto-évaluation).

### 3. Relation mission ↔ journée ↔ parcours ↔ projet ↔ compétence

Une mission déclare `dayRefs` (journées) et `skills`. Son **atteignabilité par
parcours** est **dérivée** de `dayRefs` via `resolveTrackDays` — jamais codée en
dur, jamais dupliquée par parcours. `trackRefs` sert d'indice d'affichage
cohérent (les trois parcours quand pertinent). Le lien au projet passe par les
journées de projet (`day.project`). La réussite relève les `skills`.

### 4. Exercice de code / mission longue / livrable documentaire

- **Exercice de code** : court, auto-corrigé (`call-equals`), preuve immédiate.
- **Mission longue** : orchestre plusieurs livrables (dont ≥ 1 exercice de code
  quand pertinent) sur une ou plusieurs journées.
- **Livrable documentaire** : produit par l'apprenant (ADR/HSD/TSD/LLD/RFC/
  runbook/changelog/migration/rollback/post-mortem), validé **structurellement**,
  jamais présenté comme jugé sur le fond.

### 5. Règles de validation — automatique / structurelle / sémantique

- **Auto** (booléen fiable) : un exercice de code lié passe tous ses tests
  (mécanisme existant). C'est la seule validation qui **crée une preuve** de
  compétence forte.
- **Structurelle** (booléen honnête, périmètre limité) : pour un document —
  présence des sections attendues, champs obligatoires, bornes de taille
  raisonnables, absence de placeholder (`TODO`, `TBD`, `xxx`, `<...>`, `lorem`),
  références cohérentes, présence de risques/alternatives/rollback/critères
  mesurables selon le type. Produit un statut `structure valide`, **pas** une
  preuve de qualité.
- **Sémantique** : **hors périmètre automatique**. L'application ne prétend
  **jamais** juger la justesse architecturale d'un HSD/TSD/ADR/post-mortem. Ces
  critères relèvent de l'**auto-évaluation guidée** et de la **revue humaine**
  (statut `à revoir` / `validé manuellement`). Aucune pseudo-IA locale de
  notation sémantique n'est introduite.

### 6. Stratégie de preuves

- Un livrable **auto-validé** (exercice lié vert) → preuve `type:'exercise'`
  existante + relève de compétence (inchangé).
- Un livrable **structurellement valide** → une preuve `type:'mission'` avec un
  statut explicite (`structure-valid`), **distinct** d'une preuve de compétence
  démontrée : le libellé indique « structure validée, revue humaine requise ».
- Une mission n'est **terminée** que lorsque ses livrables **requis** atteignent
  leur seuil (auto vert pour les livrables auto ; structure valide + auto-évaluation
  pour les livrables structurels/humains). Les preuves sont créées **uniquement
  dans le parcours actif**.

### 7. Persistance

État par mission dans `tracks[activeTrackId].missions[missionId]` :
`{ status, deliverables:{ [id]:{ status, content?, selfAssessment?, reviewNote?,
submittedAt } }, startedAt, updatedAt, history[] }`. Statuts de mission :
`not-started` → `in-progress` → `deliverables-incomplete` → `ready-for-review` →
`done`. Transitions validées par une fonction pure (refus des transitions
invalides).

### 8. Sauvegarde / import

`missions` est ajouté à la **whitelist** de `validateStrict` (lib/backup.mjs) :
schéma borné (nombre de missions, taille des contenus, clés non dangereuses),
statuts contrôlés, refus des schémas futurs et des données corrompues, preview
avant import, rollback atomique déjà en place. **Aucun** secret, test privé,
solution ou contenu de notation interne n'entre dans l'export.

### 9. Isolation par parcours

L'état des missions vit sous le track actif : l'isolation multi-parcours est
**native** (mêmes garanties que les preuves/compétences). Une preuve de mission
n'apparaît que dans le parcours où elle a été produite. La vue globale
(consultation multi-parcours) reste **en lecture seule**, sans mutation.

### 10. Anti-fuite & sécurité

Les définitions de mission séparent le **public** (contexte, objectifs, livrables
attendus, rubric visible, critères d'acceptation généraux) de l'**interne**
(référence des exercices liés, tests privés, attentes cachées). Seul le public
est indexé en recherche et envoyé au client. La validation structurelle des
documents s'exécute côté serveur ; les contenus utilisateur ne sont jamais
indexés. Aucune protection n'est présentée comme une isolation OS. CodeMirror,
compilateurs et previews restent **lazy** et confinés aux routes `/lab`.

### 11. Performances

Le catalogue de missions est petit (quelques entrées), chargé côté serveur, sans
compilateur. L'affichage des missions par journée dérive d'un index léger
(mission↔jour) construit une fois. Aucun recalcul par rendu ; aucun impact
significatif sur le bundle principal (le contenu lourd reste `/lab`).

### 12. Alternatives rejetées

- **Tout dans le modèle d'exercice** : rejeté — un exercice est mono-fonction
  auto-corrigé, incapable de porter des livrables documentaires et une validation
  mixte.
- **Missions en markdown pur (comme les projets)** : rejeté — impossible de
  valider structurellement, de suivre un état, ni de produire des preuves.
- **Seconde progression / second catalogue** : rejeté — viole « une seule source
  de vérité » et casse l'isolation par parcours.
- **Notation sémantique automatique des documents** : rejeté — malhonnête sans
  modèle réel ; on s'en tient à la validation structurelle + revue humaine.

### 13. Plan de migration & rollback

Additif : le champ `missions` est **optionnel** ; une progression sans lui reste
valide (migration = no-op, `migrateToV7` inchangé). Aucun retrait ni réécriture
de données existantes. Rollback : `git revert` du checkpoint + régénération si un
`.mjs` éditorial a changé ; l'état des missions étant additif et optionnel, son
absence ne casse aucune lecture. `data/progress.json` est sauvegardé avant les
tests mutateurs et restauré exactement après.

## Conventions documentaires (rappel, cohérent ADR-017)

- **ADR** = décision d'architecture (contexte, décision, alternatives,
  conséquences, risques, statut).
- **HSD** = *High-Level Solution Design* (quelle solution et pourquoi ; l'acronyme
  n'est pas universel, cf. ADR-017).
- **TSD** = *Technical Solution Design* (contrat technique d'implémentation ;
  V17 le nommait « Technical Specification Document » — V18 retient « Technical
  Solution Design », les deux lectures existent dans l'industrie et le glossaire
  signale l'équivalence).
- **LLD** = *Low-Level Design* (détail interne d'un composant).
- **RFC** = proposition à discuter avant décision.
- **runbook** = procédure opérationnelle exécutable.
- **post-mortem** = analyse structurée et **sans blâme** d'un incident.

## Conséquences

- Positives : pratique réelle de l'ingénierie ; réutilisation intégrale de la
  progression/preuves/compétences/parcours ; évaluation **honnête** (auto vs
  structurel vs humain) ; isolation et sauvegarde préservées.
- Coûts : un modèle et une source de plus (`lib/mission.mjs`, `data/missions/`) ;
  une gate de validation de missions ; extension du backup et de la recherche.
- Non-objectifs : pas de second moteur, pas de refonte, pas de réseau, pas de
  notation sémantique automatique, pas de duplication par parcours.
