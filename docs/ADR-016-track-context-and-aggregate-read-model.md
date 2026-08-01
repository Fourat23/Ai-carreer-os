# ADR-016 — Contexte de parcours des exercices & read-model agrégé multi-parcours

Statut : accepté (Sprint V16). Décision fondée sur l'audit CP0 réel. Aucun
nouveau moteur de progression, aucune nouvelle source de vérité, aucune
persistance agrégée, aucune modification de `data/program.json` ni des 365
Markdown.

## Contexte — état réel audité (CP0)

L'infrastructure multi-parcours est fonctionnelle (3 parcours disponibles) :
progression v3, `activeTrackId`/`tracks`, `/api/track`, `TrackActions`,
`buildCatalogue`/`validateCatalogue`/`resolveTrackDays`/`resolveTrackDayObjects`/
`trackNeighbors`, `computeStats(days,…)` scopé, backup v3, isolation par
parcours. **Manques** : le catalogue du Laboratoire (`app/lab/page.tsx` +
`LabCatalog.tsx`) ne porte **aucun contexte de parcours** (chaque exercice
n'expose que sa première journée liée, sans savoir de quels parcours il est
atteignable) ; il n'existe **aucune synthèse multi-parcours en lecture seule** ;
`/revisions` et `/skills` lisent déjà le parcours actif (`readProgress` =
`activeTrackProgress`) mais **ne l'affichent pas explicitement**. Aucun helper de
classification (« tracks per exercise ») n'existe.

## Décisions

### 1. Sémantique de contexte (dérivée, non ambiguë)

Un exercice est relié à des **journées** (`data/day-exercises.json`, agnostique
au parcours). Les journées appartiennent aux parcours (via `resolveTrackDays`).
Un exercice est donc « atteignable depuis le parcours T » si **au moins une** de
ses journées liées appartient à T. Classification **structurée** (pas des
booléens contradictoires) produite par un helper pur :

```
classifyExercise(exerciseDayNums, trackDaySets, activeTrackId) → {
  reachableTracks: string[],   // parcours DISPONIBLES atteignables (triés)
  activeDays: number[],        // journées liées appartenant au parcours actif (triées)
  inActive: boolean,           // activeDays.length > 0
  multiTrack: boolean,         // reachableTracks.length >= 2
  scope: 'active' | 'other' | 'global',  // catégorie primaire, exclusive
}
```

- **active** : `inActive` (atteignable depuis le parcours actif).
- **other** : atteignable depuis ≥1 parcours disponible, mais pas l'actif.
- **global** : relié à aucune journée d'un parcours disponible (ou à aucune
  journée du tout).
- **multi-parcours** : `multiTrack` (orthogonal — un exercice actif peut aussi
  être multi-parcours ; on ne prétend jamais qu'il est exclusif).
- **journée** : `activeDays` (1 = « Jour N », plusieurs = « Plusieurs jours »).

### 2. Filtre de portée (dérivé de la classification)

Valeurs : `active`, `active-day` (exactement 1 journée active), `other`, `multi`,
`global`, `all` (défaut souple = tous). Le filtre par défaut du Laboratoire
**privilégie visuellement** le parcours actif via un badge, mais **n'exclut
rien** par défaut : le corpus global reste visible ; l'utilisateur peut filtrer
explicitement et revenir à « tous ».

### 3. Source de vérité & calcul

Le catalogue (`buildCatalogue`) reste la vérité des parcours ; `data/day-
exercises.json` la vérité des liaisons. La classification est **pure** et
calculée **côté serveur** (dans `app/lab/page.tsx`) à partir de `trackDaySets`
(construit une fois par requête depuis le catalogue mémoïsé). Aucun recalcul
d'index, aucun envoi de contenu d'exercice au client (seules les métadonnées
publiques + le contexte dérivé partent dans les props).

### 4. Read-model agrégé multi-parcours (lecture seule)

Un helper pur `aggregateTracks(catalogue, progressV3, program)` produit, **par
parcours disponible**, un objet conservant `trackId` et des métriques réellement
calculables avec les helpers existants (`resolveTrackDayObjects`, `computeStats`,
`progressPosition`, `reviewSummary`, `skillState`) : titre, statut, durée, jours
terminés, %, jour de reprise, révisions dues, activités en cours/à revoir,
dernière preuve, compétences pratiquées/démontrées. **Jamais** de score global
fusionné, **jamais** d'addition de % de parcours de longueurs différentes. Une
métrique non fiable est **omise** et documentée. **Aucune écriture** : le
read-model lit `tracks[*]` sans jamais muter.

### 5. Conservation du parcours d'origine

Preuves, compétences et révisions restent sous `tracks[<id>]`. Le read-model et
les vues agrégées **conservent `trackId`** sur chaque donnée ; aucune fusion
d'homonymes sans règle canonique (la taxonomie V13 reste la seule normalisation).

### 6. URL & filtres

Les nouveaux filtres (parcours, portée) sont encodés dans l'URL (`track`,
`scope`) comme les filtres existants, restaurables au rechargement et via
retour/avant. Ce sont des **préférences d'affichage** : elles vivent dans l'URL,
**jamais** dans `data/progress.json`.

### 7. Politique anti-fuite

Le contexte n'expose que des métadonnées publiques (ids de parcours, numéros de
journées, portée). **Jamais** de solution, code utilisateur, test privé, valeur
attendue privée, contenu de workspace ni preuve privée dans les props client,
l'index de recherche ou les métadonnées.

### 8. Comportement dégénéré

- **Un seul parcours** : la classification donne `active`/`global` ; la vue
  agrégée reste utile (une seule carte). Aucune hypothèse de N ≥ 2.
- **Ancien format plat migré** : `migrateToV7` → parcours par défaut ; la
  classification et l'agrégation fonctionnent (un parcours actif, éventuellement
  d'autres vides). Fondations reste identique à l'existant.

### 9. Mémoïsation

`getCatalogue()` est déjà mémoïsé ; `trackDaySets` est construit une fois par
requête serveur. Aucune mémoïsation client, aucun index reconstruit à chaque
interaction. Optimisation supplémentaire uniquement si une mesure la justifie.

## Décisions refusées

- Un score global unique fusionnant plusieurs parcours.
- Une progression agrégée **persistée** (nouvelle donnée dans progress.json).
- Des filtres d'affichage stockés dans progress.json.
- Masquer silencieusement le corpus global derrière le parcours actif.
- Des badges affirmant l'exclusivité d'un exercice réellement multi-parcours.
- Une vue agrégée capable de muter la progression.

## Limites honnêtes

- L'agrégation « prochaine activité/livrable » n'est affichée que si
  `computeStats` la fournit de façon fiable pour le parcours ; sinon omise.
- Le Laboratoire reste un **corpus partagé** : un exercice n'appartient pas à un
  parcours, il est *atteignable* depuis des journées de parcours. Les badges
  reflètent l'atteignabilité, pas une possession.
- Les compétences homonymes entre parcours ne sont pas fusionnées : chaque
  parcours conserve les siennes (pas de score inter-parcours).
