<!-- keep -->
# Leçon — SQL : les fondations

## 🌍 Le problème d'abord
Une entreprise stocke des millions de lignes : clients, commandes, produits. Un jour on te
demande « quels sont nos 3 meilleurs clients ce trimestre ? ». Ouvrir un fichier et compter
à la main est impossible. Il te faut un moyen de POSER une question précise à un grand
ensemble de données et d'obtenir la réponse en une seconde. Ce moyen s'appelle **SQL** : au
lieu d'écrire COMMENT parcourir les données, tu DÉCRIS ce que tu veux (« les clients, triés
par total dépensé, les 3 premiers ») et le moteur se débrouille. Cette leçon t'apprend à
raisonner sur les données relationnelles et à formuler ces questions.

## 🎯 Objectif
Comprendre le **modèle relationnel** (tables reliées par des clés) et savoir écrire les
requêtes fondamentales — filtrer (WHERE), joindre (JOIN), regrouper/agréger (GROUP BY),
trier/limiter — puis raisonner sur l'intégrité (transactions) et la performance (index).

## 🧩 Prérequis
Tu dois être à l'aise avec les tableaux d'objets et les six gestes universels (filtrer,
transformer, agréger, trier, regrouper) vus en JavaScript (`/doc/lessons/javascript-basics`),
car SQL EST ce raisonnement, dans une autre langue. Aucune base de données ni aucun serveur
n'est requis pour comprendre la leçon : le modèle relationnel est construit ici.

## 🧠 Modèle mental
Pense « question métier → ensemble de lignes → filtrage/jointure/agrégation → résultat ».
Les données vivent dans des **tables** (lignes × colonnes typées), reliées entre elles par
des **clés** (chaque ligne a un identifiant unique ; une table en référence une autre par
cet identifiant). SQL est **déclaratif** : tu décris le résultat voulu, pas la façon de
parcourir. C'est exactement ton pipeline `filter → map → reduce → sort` du mois 1, exprimé
dans le langage des données.

## 💡 Pourquoi c'est important
SQL a 50 ans et enterrera probablement toutes les technologies de ton CV : c'est LA langue des données en entreprise. Analytics, pipelines, feature engineering ML, métadonnées de ton RAG — tout y passe. C'est aussi une compétence d'entretien quasi systématique pour les rôles data/IA (2-3 requêtes en live), et un des rares savoirs qui ne se périme pas.

## Explication complète

### Les tables reliées par des clés, en détail
Une base relationnelle organise les données en **tables** (lignes × colonnes typées). Chaque ligne a une **clé primaire** (id unique) ; une table en référence une autre par une **clé étrangère** (`livres.auteur_id` → `auteurs.id`). Ce système de références élimine la duplication : l'auteur vit à UN endroit, mille livres pointent vers lui.

### SQL est DÉCLARATIF
Tu décris le résultat voulu, le moteur trouve comment l'obtenir :
```sql
SELECT nom, salaire FROM employes
WHERE service = 'tech' ORDER BY salaire DESC LIMIT 3;
```
C'est ton pipeline `filter → sort → slice` du mois 1, en langage de base. La correspondance est exacte : SELECT ≈ map (choisir les colonnes), WHERE ≈ filter, ORDER BY ≈ sort, GROUP BY + agrégats ≈ ton reduce de regroupement.

### JOIN : recomposer ce que la normalisation a séparé
```sql
SELECT l.titre, a.nom FROM livres l
JOIN auteurs a ON a.id = l.auteur_id;
```
**INNER JOIN** garde les correspondances ; **LEFT JOIN** garde aussi les orphelins de gauche (les livres SANS auteur, les clients SANS commande — souvent la question métier intéressante). Un JOIN sans condition = produit cartésien (explosion de lignes) : toujours un `ON`.

### GROUP BY : le regroupement-agrégation
```sql
SELECT service, COUNT(*) AS n, AVG(salaire) AS moyen
FROM employes GROUP BY service HAVING COUNT(*) > 2;
```
La nuance d'entretien : **WHERE filtre les LIGNES avant** le regroupement, **HAVING filtre les GROUPES après**.

### La normalisation : une source de vérité
1NF : valeurs atomiques (pas de listes dans une cellule). 2NF/3NF : chaque colonne dépend de la clé, toute la clé, rien que la clé. L'idée profonde = celle du jour 10 : **ne jamais dupliquer un fait** — une donnée dupliquée finit désynchronisée. La dénormalisation (dupliquer exprès pour lire plus vite) est un TRADE-OFF assumé, jamais un accident.

### Index et transactions : performance et intégrité
Un **index** est un arbre auxiliaire qui rend une recherche O(log n) au lieu du parcours complet — au prix d'espace et d'écritures plus lentes : on indexe les colonnes FILTRÉES/JOINTES souvent, pas tout. Une **transaction** rend un groupe d'opérations atomique (tout ou rien — ACID) : sans elle, une panne entre « créer la commande » et « décrémenter le stock » laisse la base incohérente.

### La règle de sécurité non négociable
Les requêtes **paramétrées** (`WHERE nom = ?` + valeur passée séparément) : l'entrée utilisateur est traitée comme une DONNÉE, jamais comme du code SQL. C'est l'unique défense sérieuse contre l'injection SQL — zéro concaténation, sans exception, à vie.

## Concepts clés
Table, ligne, colonne typée · clé primaire / étrangère · SELECT / WHERE / ORDER BY / LIMIT · JOIN (INNER / LEFT, condition ON) · GROUP BY, agrégats, HAVING · sous-requêtes · normalisation 1-3NF, dénormalisation · index (coût/bénéfice) · transaction, ACID · requêtes paramétrées.

## 🧭 Exemple guidé
« Les 3 services qui coûtent le plus cher » :
```sql
SELECT service, SUM(salaire) AS cout
FROM employes
GROUP BY service
ORDER BY cout DESC
LIMIT 3;
```
Compare mot à mot avec ta version JS du jour 11 (regrouper → sommer → trier → découper) : QUATRE syntaxes dans l'année (JS, SQL, pandas, et l'agrégation d'éval RAG), UN modèle mental.

## ⚠️ Erreurs fréquentes
- JOIN sans ON : explosion cartésienne.
- WHERE au lieu de HAVING sur un agrégat (et inversement).
- Index partout (écritures lentes) ou nulle part (lectures lentes) : mesurer.
- Concaténer du SQL avec l'entrée utilisateur : faille d'injection béante.
- NULL se compare avec `IS NULL`, jamais `= NULL`.

## 🔗 Liens avec le programme
Ton RAG hybride (mois 9) utilisera SQLite FTS5 (recherche lexicale = du SQL), et les métadonnées des chunks vivront en SQL. Le feature engineering ML (mois 6) commence par des agrégats SQL. L'évaluation de DocSense stockera ses scores versionnés en SQLite. Et « écris-moi la requête des top clients » reste un grand classique d'entretien data.

## Mini-exercice
Sur une base livres/auteurs/emprunts : (1) les livres jamais empruntés (LEFT JOIN + IS NULL), (2) le nombre d'emprunts par membre trié décroissant, (3) les auteurs ayant plus de 2 livres (HAVING). Vérifie chaque résultat à la main sur des données de test réduites.

## 📚 Vocabulaire
**clé primaire / étrangère** · **jointure** · **agrégat** · **HAVING** · **sous-requête** · **normalisation / dénormalisation** · **index** · **transaction / ACID / rollback** · **requête paramétrée** · **injection SQL**.

> **Note pratique — réel vs simulé.** La pratique associée à cette leçon s'exécute en
> JavaScript (raisonnement relationnel déterministe : les lignes sont des tableaux d'objets),
> **pas sur un vrai SGBD**. Elle entraîne le RAISONNEMENT sur les données, pas la syntaxe SQL
> réellement exécutée. AI Career OS n'embarque pas (encore) de moteur SQL — voir la décision de
> runtime dans `docs/ADR-030-curriculum-hardening-iii-and-ai-ml-debt.md`.

## 🧾 À retenir
SQL décrit déclarativement des résultats sur des tables reliées par des clés : filtrer (WHERE), joindre (JOIN...ON), regrouper-agréger (GROUP BY/HAVING), trier-découper. La normalisation garantit une source de vérité unique, les index achètent de la vitesse de lecture, les transactions l'intégrité, et les requêtes paramétrées la sécurité. C'est le socle data de toute ta carrière IA.
