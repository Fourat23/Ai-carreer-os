# Audit conceptuel de la chaîne Data/SQL — V30 (CP5)

Objectif du CP5 (prompt V30) : construire/valider une progression relationnelle réellement
compréhensible, éviter d'introduire JOIN/ACID/index sans modèle mental préalable, combler les
trous réels, et — si aucun runtime SQL n'est ajouté — l'indiquer explicitement dans les cours
et exercices. Cet audit établit que la chaîne bâtie en V29 est **complète et cohérente**, et
applique la seule action manquante : rendre la nature **simulée** de la pratique explicite.

## 1. Carte concept → leçon (chaîne réelle)

| Concept (prompt) | Couvert par | Modèle mental préalable ? |
|---|---|---|
| donnée, table, colonne, ligne | `sql-foundations` (🧠 Modèle mental) | ✅ |
| clé, relation, modèle | `sql-foundations` + `database-modeling` | ✅ |
| SELECT, filtre (WHERE) | `sql-foundations` | ✅ |
| JOIN | `sql-foundations` (après le modèle relationnel) | ✅ pas « à froid » |
| agrégation (GROUP BY/HAVING) | `sql-foundations` | ✅ |
| normalisation, contraintes | `database-modeling` | ✅ |
| index, plans d'exécution | `sql-performance-indexing` (index = arbre équilibré, prérequis data-structures) | ✅ |
| N+1, pagination, performance | `sql-performance-indexing` | ✅ |
| transaction, ACID | `database-transactions-concurrency` (ACID introduit progressivement) | ✅ |
| concurrence, isolation, verrous | `database-transactions-concurrency` | ✅ |
| migration, compatibilité schéma/appli | `database-migrations` (expand/contract) | ✅ |

## 2. Vérification du point sensible : pas de JOIN/ACID/index « à froid »
- **JOIN** : introduit dans `sql-foundations` APRÈS la section « Modèle mental » (question
  métier → lignes → jointure) et la sous-section « Les tables reliées par des clés ». ✅
- **index B-tree** : `sql-performance-indexing` a pour prérequis explicite
  `data-structures-intro` (l'index EST l'arbre équilibré), et l'introduit par l'analogie de
  l'index d'un livre. ✅
- **ACID / isolation** : `database-transactions-concurrency` part d'une situation concrète
  (double réservation du dernier siège) avant les niveaux d'isolation. ✅

## 3. Conformité structurelle
Les 5 leçons Data/SQL ont on-ramp + prérequis + modèle mental (vérifié), sont au standard V29
(P3) et reliées à la pratique (exercices `node-js` de raisonnement relationnel + playbook
`slow-sql-query`). Graphe de prérequis acyclique.

## 4. Décision runtime SQL (rappel ADR-030) et action CP5
**Option A retenue** : raisonnement relationnel déterministe en `node-js`, pas de runtime SQL
en V30 (SQLite/DuckDB évalué mais différé — pas de second moteur d'exécution). **Action CP5** :
ajout d'une **note « réel vs simulé »** explicite dans les 5 leçons Data/SQL, indiquant que la
pratique associée s'exécute en JavaScript (les lignes sont des tableaux d'objets), pas sur un
vrai SGBD, et renvoyant à `ADR-030`. Les exercices concernés (`sql-inner-join`,
`db-concurrency-risk`, `migration-compat`, `fix-nplus1`, `sys-log-level-counts`) portent déjà
cette mention dans leur résumé.

## 5. Décision V30
**Aucune nouvelle leçon Data/SQL** (chaîne complète depuis V29 ; en créer serait de la
quantité au détriment de la qualité). Seul durcissement : la note d'honnêteté réel/simulé.

## 6. Dette Data cadrée pour V31 (non bloquante)
- **Runtime SQL réel** (SQLite/DuckDB) : piste sérieuse à rouvrir si un besoin pédagogique
  décisif émerge (exécuter de vraies requêtes, voir de vrais plans). Coût : nouveau runtime,
  isolation, tests — d'où le report.
- **Data quality / ETL** au standard V29 (leçons `data-cleaning-quality`, `etl-pipelines`
  encore P1) : rattrapage possible V31.
- **Parcours Data/ML** : reste `announced` tant qu'une curation dédiée n'existe pas.
