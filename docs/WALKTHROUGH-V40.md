# Walkthrough pédagogique — Sprint V40, CP13

> Test de bout en bout d'un capstone comme un apprenant qui possède UNIQUEMENT les prérequis officiels.
> Objectif : détecter les ruptures (jargon non introduit, prérequis caché, solution non dérivable des
> artefacts, ambiguïté insoluble). Français, factuel.

## Capstone testé : `backend-latency-after-release` (« L'API des commandes ralentit après une release »)

Prérequis officiels (lessonRefs) : `sql-performance-indexing`, `database-transactions-concurrency`,
`incident-response`, `metrics-percentiles`. On suppose l'apprenant à jour de ces leçons, et de rien de plus.

### 1. Compréhension du contexte
Le contexte décrit une PME, un service « Commandes », 3 instances derrière un load balancer, une base avec
réplicas. Ces notions (load balancer, réplica, instance) sont couvertes par la colonne System Design/Cloud
antérieure. **RAS.**

### 2. Vocabulaire
Termes employés et leur couverture : **p50/p95** (enseignés par `metrics-percentiles`, glossaire
« percentile »), **N+1** (enseigné par `sql-performance-indexing`, présent au glossaire), **rollback /
roll-forward** (`incident-response` / `release-incident-recovery`), **index** (glossaire), **ORM**
(glossaire). Terme non présent au glossaire : **« eager loading »** — mais il est **glosé en ligne**
(« chargement anticipé / groupé », « une seule requête groupée ») dans les options et le debrief.
**Verdict : pas de jargon à froid. Rupture mineure (eager loading) mitigée par la glose inline.**

### 3. Compréhension des artefacts
8 artefacts : p95, CPU applicatif, nombre de requêtes SQL/appel, diff ORM, CPU DB, migrations, cache CDN
(bruit), cron nocturne (bruit). Chaque artefact est court et lisible. Le bruit est plausible sans être
piégeux. **RAS.**

### 4. Hypothèses possibles
La phase Hypothèses propose « changement de chargement des données », « CPU », « index manquant »,
« cache CDN ». Deux sont raisonnables (chargement, index), deux écartables par les artefacts (CPU stable,
CDN hors sujet). **Ambiguïté pédagogique saine** : plusieurs pistes plausibles, mais les preuves tranchent.

### 5. Ordre d'investigation
La phase Investigation guide vers le couple « nombre de requêtes/appel + durée unitaire », qui sépare
« volume » de « lenteur unitaire ». C'est une **méthode**, pas seulement une réponse. **RAS.**

### 6. Décision
Rollback vs scale vs attendre vs index au hasard. La bonne décision (rollback, aucune migration ne
l'empêche) est justifiable par les artefacts (release en cause, pas de migration). **RAS.**

### 7. Feedback
Chaque question porte une explication ; les mauvaises réponses de type `predict` montrent l'attendu.
**RAS.**

### 8. Compréhension de la correction
Le debrief explicite pourquoi N+1 gagne (p95↑ + CPU stable + requêtes unitaires rapides + explosion du
NOMBRE de requêtes + diff en boucle) et pourquoi les autres perdent (faux indices listés). **RAS.**

### 9. Liens de remédiation
En cas d'échec : `sql-performance-indexing`, `database-transactions-concurrency`, `incident-response`,
`metrics-percentiles` + exercices `fix-nplus1`, `latency-percentiles`, `api-pagination-choice` +
playbooks `cloud-latency-regression`, `slow-sql-query`. Tous existent (vérifié par le gate). **RAS.**

### 10. Recommencer plus intelligemment
Le bouton « Recommencer » réinitialise sans révéler les réponses tant qu'on n'a pas soumis ; après un
debrief, l'apprenant peut refaire en sachant où regarder. **RAS.**

## Vérification transversale (les 5 capstones)
- **Solution dérivable des artefacts** : oui pour les 5 (la cause se déduit toujours d'au moins deux
  artefacts convergents ; auto-cohérence 100 % vérifiée par les tests).
- **Pas de prérequis caché** : les compétences et leçons reliées couvrent le vocabulaire ; aucun capstone
  n'exige une connaissance jamais enseignée.
- **Anti-leak** : le gate vérifie que la bonne réponse de diagnostic n'apparaît pas dans le signal/contexte
  (0 fuite).
- **Ambiguïté contrôlée** : plusieurs hypothèses plausibles, mais toujours tranchables par les preuves ;
  aucune question à réponses multiples également correctes.

## Ruptures détectées et traitement
| Rupture | Gravité | Traitement |
|---|---|---|
| « eager loading » absent du glossaire | mineure | Glosé en ligne dans le capstone ; acceptable. Non bloquant. |
| Aucune autre rupture réelle | — | — |

**Aucune rupture bloquante. Aucun correctif de contenu nécessaire au-delà de ce qui est déjà en place.**

## Limites
Walkthrough conduit par un seul auteur ; il vérifie la STRUCTURE et la dérivabilité, pas un apprentissage
humain réel. Le score reste un PROXY.
