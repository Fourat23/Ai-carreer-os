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

Reprenons la question du début : **« nos meilleurs clients »**. On y ajoute une demande
banale — le marketing veut aussi, sur le même tableau, le nombre d'avis laissés par chacun.
Une seule requête pour les deux, ça paraît économique.

Travaillons sur des données assez petites pour être vérifiées à la main :

```
clients            commandes (client_id, montant)     avis (client_id)
1 Dupont           1 → 100, 1 → 200                   1, 1, 1   (trois avis)
2 Martin           2 → 500                            2         (un avis)
3 Nkolo            3 → 50                             —
```

À la main : Dupont a dépensé **300** et laissé **3** avis ; Martin **500** et **1** avis ;
Nkolo **50** et **0**. Le meilleur client est Martin. Retiens ces six nombres, ils vont
servir de juge.

La requête que tout le monde écrit :

```sql
SELECT c.nom, SUM(cmd.montant) AS total, COUNT(a.id) AS nb_avis
FROM clients c
JOIN commandes cmd ON cmd.client_id = c.id
LEFT JOIN avis    a ON a.client_id  = c.id
GROUP BY c.id
ORDER BY total DESC;
```

Elle s'exécute sans erreur et renvoie :

| nom | total | nb_avis |
|---|---|---|
| Dupont | **900** | **6** |
| Martin | 500 | 1 |
| Nkolo | 50 | 0 |

Trois des six nombres sont faux, et surtout **le classement est inversé** : la requête
désigne Dupont comme meilleur client alors qu'il a dépensé 300 contre 500. Aucun message
d'erreur. Livré tel quel, ce tableau oriente une décision commerciale sur un chiffre triple
de la réalité.

**Décision 1 — diagnostiquer avant de corriger.** Le réflexe est de bricoler la requête
jusqu'à ce que les nombres tombent juste. Le geste utile est autre : **retirer le `GROUP BY`
et regarder les lignes brutes** que la jointure produit pour Dupont.

```
Dupont | commande 10 (100) | avis 20      ← 2 commandes × 3 avis
Dupont | commande 10 (100) | avis 21        = 6 lignes,
Dupont | commande 10 (100) | avis 22        où chaque montant
Dupont | commande 11 (200) | avis 20        apparaît 3 fois
Dupont | commande 11 (200) | avis 21
Dupont | commande 11 (200) | avis 22
```

Tout s'explique d'un coup : 100 compté 3 fois plus 200 compté 3 fois font 900, et 6 lignes
donnent 6 avis. C'est le **produit cartésien local** — joindre deux tables « plusieurs »
depuis un même parent multiplie leurs lignes entre elles. La leçon générale dépasse SQL :
une agrégation fausse se comprend toujours en regardant **ce qui est agrégé** avant de
regarder l'agrégat.

**Décision 2 — quel correctif ? Et méfie-toi du premier qui marche.** Une recherche rapide
suggère `DISTINCT`. Essayons : `SUM(DISTINCT cmd.montant)` donne 300 pour Dupont,
`COUNT(DISTINCT a.id)` donne 3. Tout est juste. Tentant de s'arrêter là.

Ajoute alors un quatrième client, Sow, avec **deux commandes de 100 € chacune** et deux avis.
Son vrai total est 200. La requête gonflée dit 400 ; la version `SUM(DISTINCT)` dit… **100**.
`DISTINCT` a dédoublonné les *valeurs*, pas les lignes — et deux commandes du même montant ne
sont plus qu'une. Le correctif était faux depuis le début ; il donnait simplement le bon
résultat sur un jeu de données où aucun montant ne se répétait. `COUNT(DISTINCT a.id)`, lui,
reste correct, parce qu'il dédoublonne des identifiants uniques. **Un correctif validé sur un
seul jeu de données n'est pas validé** : c'est ce que le hasard des données de test punit le
plus souvent.

**Décision 3 — la forme juste : agréger AVANT de joindre.** Le problème vient de ce qu'on a
mélangé deux comptages indépendants dans un même produit de lignes. On les sépare :

```sql
SELECT c.nom, COALESCE(t.total, 0) AS total, COALESCE(v.nb_avis, 0) AS nb_avis
FROM clients c
LEFT JOIN (SELECT client_id, SUM(montant) AS total  FROM commandes GROUP BY client_id) t
       ON t.client_id = c.id
LEFT JOIN (SELECT client_id, COUNT(*)     AS nb_avis FROM avis     GROUP BY client_id) v
       ON v.client_id = c.id
ORDER BY total DESC;
```

Chaque sous-requête réduit sa table à **une ligne par client** avant la jointure : plus rien
à multiplier. Les six nombres tombent juste, Sow compris, et Martin retrouve sa place.
`COALESCE` traduit « aucun avis » par 0 plutôt que par `NULL` — un client sans avis a bien
zéro avis, et c'est au SQL de le dire, pas au code d'appel de le deviner.

**Le réflexe à emporter**, plus durable que la syntaxe : *dès qu'une requête joint deux
tables « plusieurs » et agrège, soupçonne la multiplication.* Le test coûte dix secondes —
compare `COUNT(*)` avec le nombre de lignes que tu attendais. S'il est plus grand, tes
sommes sont déjà fausses.

**Variante qui déplace le problème.** Le marketing revient : il veut la même chose, mais
seulement sur le dernier trimestre. Où mettre `WHERE date >= '2026-07-01'` ? Sur la requête
extérieure, la condition porte sur une colonne qui n'existe plus — elle a disparu dans
l'agrégation. Il faut la placer **dans** la sous-requête des commandes. Et une question de
métier surgit aussitôt : un client sans aucune commande sur le trimestre doit-il apparaître
avec 0, ou disparaître du tableau ? Les deux se codent (`LEFT JOIN` ou `JOIN`), aucune n'est
plus juste que l'autre — c'est le marketing qui doit trancher. Beaucoup de « bugs SQL » sont
en réalité des questions métier que personne n'a posées.

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

## ✅ Correction attendue
**La démarche**, et elle est identique pour les trois questions : de quelles tables ai-je besoin ? comment se relient-elles ? est-ce que je veux garder les lignes SANS correspondance ? est-ce que je compte des lignes ou des groupes ?

```sql
-- (1) livres jamais empruntés : on garde les orphelins, puis on ne garde QU'EUX
SELECT l.titre FROM livres l
LEFT JOIN emprunts e ON e.livre_id = l.id
WHERE e.id IS NULL;
```

**L'erreur probable, et elle annule silencieusement le LEFT JOIN.** Presque tout le monde écrit d'abord la condition dans le `ON` plutôt que dans le `WHERE`, ou pire, écrit `WHERE e.livre_id IS NULL` en pensant filtrer et obtient un résultat qui *semble* plausible. Le cas vraiment vicieux est celui-ci :

```sql
LEFT JOIN emprunts e ON e.livre_id = l.id
WHERE e.date_retour IS NOT NULL     -- ⚠️ transforme le LEFT en INNER
```

Toute condition `WHERE` portant sur la table de DROITE élimine les lignes orphelines — puisque, pour un orphelin, toutes ses colonnes valent `NULL` et échouent à n'importe quel test. Le `LEFT JOIN` est toujours écrit, il ne sert plus à rien, et la requête renvoie des résultats sans jamais protester. Le piège séduit parce que la ligne fautive est syntaxiquement irréprochable et qu'elle se trouve **loin** du `JOIN` qu'elle annule.

La règle qui en sort : une condition sur la table de droite va dans le `ON` ; seul le test `IS NULL` de détection d'orphelins va dans le `WHERE`.

**Alternative défendable** pour la question (1) : `WHERE NOT EXISTS (SELECT 1 FROM emprunts e WHERE e.livre_id = l.id)`. Elle exprime l'intention plus littéralement — « aucun emprunt n'existe » — et beaucoup de moteurs l'optimisent aussi bien, voire mieux, car ils s'arrêtent au premier emprunt trouvé au lieu de construire toute la jointure. Le `LEFT JOIN ... IS NULL` reste plus courant ; `NOT EXISTS` est souvent plus lisible dès que la condition se complique.

**Vérifie seul, sans corrigé** :
1. Fabrique un jeu de test **minuscule** : 3 livres dont 1 jamais emprunté, 2 membres, 4 emprunts. Calcule les trois réponses à la main d'abord. Une requête qui ne correspond pas à ton calcul manuel est fausse — même si son résultat a l'air raisonnable.
2. Pour la (1) : le livre jamais emprunté doit apparaître, et lui seul. Remplace `LEFT` par `INNER` : le résultat doit devenir vide. Si rien ne change, ton `WHERE` avait déjà tué le `LEFT`.
3. Pour la (3) : ajoute un auteur avec exactement 2 livres. Il ne doit PAS apparaître — c'est le test qui distingue `> 2` de `>= 2`, et l'erreur la plus banale du `HAVING`.
4. Remplace `HAVING COUNT(*) > 2` par `WHERE COUNT(*) > 2` : la base doit refuser. Comprendre le message d'erreur vaut mieux que mémoriser la règle.

## 🏢 Cas professionnel
Une équipe branche un tableau de bord sur sa base de production. Une des requêtes fait une jointure sur `commandes.client_id`, une colonne non indexée. Sur les 5 000 commandes de l'environnement de test, la page s'affiche instantanément. En production, sur 12 millions de lignes, la requête prend 40 secondes — et comme le tableau de bord se rafraîchit automatiquement, plusieurs de ces requêtes s'empilent, saturent les connexions disponibles, et **l'application cliente cesse de répondre**. Un tableau de bord de consultation a mis à genoux un service de vente.

Trois choses valent d'être retenues. D'abord, l'index manquant ne se voit jamais sur des données de développement : c'est la même leçon que le `includes` dans une boucle, appliquée aux bases. Ensuite, `EXPLAIN` devant une requête révèle si le moteur parcourt toute la table ou passe par un index — c'est un geste de trente secondes que peu de gens font avant de livrer. Enfin, l'incident n'est pas venu d'une erreur de calcul mais d'un **partage de ressource** : les lectures analytiques et les écritures transactionnelles se disputaient la même base, ce qui est précisément la raison d'être des réplicas de lecture.

Et le contre-poids reste vrai : indexer davantage aurait ralenti les écritures. On n'indexe pas « au cas où », on indexe ce que les requêtes réelles filtrent et joignent.

## 🔥 Pratique — interroger, puis prouver que la requête est juste

**A. Le jeu de départ.** Crée trois tables — clients, commandes, lignes — et
insère assez de données pour que les cas limites existent : un client sans
commande, une commande sans ligne, un client avec dix commandes. Livrable : le
script de création et les décomptes.

**B. Les cinq questions.** Écris une requête pour chacune : le chiffre d'affaires
par client ; les clients **sans** commande ; la commande la plus chère par
client ; le nombre de commandes par mois ; les clients dont le total dépasse une
valeur. Livrable : les cinq requêtes et leurs résultats.

**C. Faire échouer une jointure.** Écris volontairement la jointure qui perd les
clients sans commande, puis celle qui les garde. Compare les décomptes.
Livrable : les deux nombres et l'explication de l'écart.

**D. Le piège du filtre.** Sur une jointure externe, place une condition sur la
table de droite d'abord dans la clause de filtrage, puis dans la condition de
jointure. Compare. Livrable : les deux résultats et pourquoi ils diffèrent.

**E. Vérifier une agrégation.** Pour une de tes requêtes de B, prouve son
résultat par un second calcul obtenu autrement. Livrable : les deux valeurs.

## ✅ Correction attendue

**A — les cas limites d'abord.** Un jeu de test où chaque client a exactement une
commande ne révèle aucune des erreurs de B, C et D. **Les cas limites ne sont pas
un raffinement, ils sont le jeu de test** : le client sans commande et la
commande sans ligne sont précisément ce qui distingue une jointure correcte d'une
jointure fausse.

**B — les cinq requêtes.** Deux points de méthode qui reviennent dans les cinq.

Le premier : la clause qui filtre **avant** le regroupement et celle qui filtre
**après** ne sont pas interchangeables. « Les clients dont le total dépasse une
valeur » se filtre après agrégation, puisque le total n'existe pas avant. Écrire
ce filtre au mauvais endroit produit soit une erreur de syntaxe, soit — plus
grave — un résultat plausible et faux.

Le second, sur « la commande la plus chère par client » : c'est le cas où une
agrégation simple ne suffit pas. Le maximum du montant s'obtient facilement ;
récupérer **la ligne** qui porte ce maximum demande une fonction de fenêtrage ou
une sous-requête corrélée. Mélanger une colonne non agrégée avec une agrégation
est accepté par certains moteurs et rend alors une valeur **arbitraire** — un
défaut silencieux classique.

**C — la jointure qui perd des lignes.** Une jointure interne ne conserve que les
lignes ayant une correspondance des deux côtés : les clients sans commande
disparaissent. Une jointure externe les conserve, avec des valeurs absentes.

L'écart de décompte est le résultat attendu, et il faut savoir en tirer la règle
générale : **une jointure interne est un filtre déguisé.** Beaucoup de rapports
« il manque des clients » viennent de là, et le symptôme est trompeur parce que
la requête ne produit aucune erreur.

Conséquence sur l'agrégation : un dénombrement sur la table de droite compte les
lignes existantes et rend **zéro** pour un client sans commande, alors qu'un
dénombrement générique compterait la ligne produite par la jointure externe et
rendrait **un**. C'est la même requête à un mot près, avec deux réponses
différentes.

**D — le filtre qui annule la jointure externe.** C'est le piège le plus fréquent
et le plus difficile à voir.

Une condition sur la table de droite placée dans la clause de filtrage est
évaluée **après** la jointure. Les lignes sans correspondance ont des valeurs
absentes, la condition n'est pas satisfaite, elles sont éliminées — et la
jointure externe se comporte exactement comme une jointure interne.

La même condition placée dans la condition de jointure est évaluée **pendant**,
et les lignes sans correspondance survivent.

**Ce n'est pas une subtilité de syntaxe : c'est l'ordre d'évaluation.** Le retenir
sous cette forme — filtrer après ou pendant — évite d'avoir à mémoriser une règle
sans mécanisme.

**E — la vérification croisée.** Le principe dépasse SQL : **un résultat obtenu
d'une seule façon n'est pas vérifié.** Une somme par client se recoupe avec la
somme globale ; un dénombrement par mois se recoupe avec le total sur la période.

Ce que ce recoupement attrape le plus souvent : la multiplication de lignes par
une jointure. Joindre commandes et lignes puis sommer le montant de la commande
compte **une fois par ligne de commande** — une commande à trois lignes est
comptée trois fois. Le total par client paraît normal, le total général est
gonflé, et rien ne le signale. C'est le même défaut, sous une autre forme, que
celui que `sql-performance-indexing` mesure en nombre de requêtes.

## 🎤 Questions d'entretien
- « WHERE ou HAVING ? » → `WHERE` filtre les lignes avant regroupement, `HAVING` filtre les groupes après. Un agrégat ne peut apparaître que dans `HAVING`.
- « INNER ou LEFT JOIN ? » → `LEFT` quand la question porte sur l'ABSENCE : clients sans commande, livres jamais empruntés. Et attention à ne pas l'annuler par une condition `WHERE` sur la table de droite.
- « Comment protèges-tu contre l'injection SQL ? » → Requêtes paramétrées, sans exception. L'entrée utilisateur est une donnée, jamais du code. Échapper à la main n'est pas une défense.
- « Faut-il indexer toutes les colonnes ? » → Non : chaque index accélère des lectures et ralentit toutes les écritures. On indexe ce qui est réellement filtré ou joint, et on le vérifie avec `EXPLAIN`.
- « À quoi sert une transaction ? » → À rendre un groupe d'opérations tout-ou-rien. Sans elle, une panne au milieu laisse la base dans un état qu'aucune règle métier n'autorise.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je traduis une question métier en requête sans passer par du code impératif.
- [ ] Je sais quand un `LEFT JOIN` est nécessaire — et ce qui peut l'annuler sans erreur.
- [ ] Je vérifie mes requêtes sur un jeu de test que j'ai calculé à la main.
- [ ] Je n'écris jamais de SQL par concaténation, même « juste pour tester ».

## 📚 Vocabulaire
**clé primaire / étrangère** · **jointure** · **agrégat** · **HAVING** · **sous-requête** · **normalisation / dénormalisation** · **index** · **transaction / ACID / rollback** · **requête paramétrée** · **injection SQL**.

> **Note pratique — réel vs simulé.** La pratique associée à cette leçon s'exécute en
> JavaScript (raisonnement relationnel déterministe : les lignes sont des tableaux d'objets),
> **pas sur un vrai SGBD**. Elle entraîne le RAISONNEMENT sur les données, pas la syntaxe SQL
> réellement exécutée. AI Career OS n'embarque pas (encore) de moteur SQL — voir la décision de
> runtime dans `docs/ADR-030-curriculum-hardening-iii-and-ai-ml-debt.md`.

## 🧾 À retenir
SQL décrit déclarativement des résultats sur des tables reliées par des clés : filtrer (WHERE), joindre (JOIN...ON), regrouper-agréger (GROUP BY/HAVING), trier-découper. La normalisation garantit une source de vérité unique, les index achètent de la vitesse de lecture, les transactions l'intégrité, et les requêtes paramétrées la sécurité. C'est le socle data de toute ta carrière IA.
