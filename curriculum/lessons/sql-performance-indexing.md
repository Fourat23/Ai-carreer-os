<!-- keep -->
# Leçon — Performance SQL : index, plans d'exécution et N+1

## 🌍 Le problème d'abord
Ton application marche parfaitement… avec 100 lignes de test. Puis la base grossit à un
million de lignes, et la même page met huit secondes à charger. Rien n'a changé dans ton
code — c'est la QUANTITÉ de données qui a tout changé. La différence entre une requête
instantanée et une requête qui gèle l'application ne tient souvent qu'à un détail : la base
a-t-elle un moyen rapide de retrouver les lignes que tu demandes, ou doit-elle les parcourir
TOUTES ? Cette leçon t'apprend à comprendre COMMENT une base exécute tes requêtes, à
diagnostiquer une requête lente, et à la rendre rapide — sans deviner.

## 🎯 Objectif
Comprendre le **modèle d'exécution** d'une requête (parcours complet vs index), savoir lire
un **plan d'exécution**, poser des **index justifiés** (et connaître leur coût), et
reconnaître/corriger les deux tueurs de performance les plus fréquents : le **N+1** et la
**pagination naïve**.

## 🧩 Prérequis
Tu dois savoir écrire des requêtes avec WHERE, JOIN et ORDER BY (`/doc/lessons/sql-foundations`)
et avoir l'intuition du coût algorithmique — parcourir n éléments coûte O(n), une recherche
indexée O(log n) (`/doc/lessons/algorithmic-thinking`, `/doc/lessons/data-structures-intro`).
Aucune connaissance préalable des plans d'exécution n'est supposée.

## 🧠 Modèle mental
Imagine un livre de 1000 pages sans index : pour trouver toutes les mentions d'un mot, tu
lis TOUT (parcours complet, « full scan »). Un **index**, c'est l'index alphabétique à la
fin du livre : tu sautes directement aux bonnes pages. Une base fait pareil : sans index sur
la colonne filtrée, elle lit toute la table ; avec un index adapté, elle va droit au but.
Toute la performance SQL se résume à : « pour CETTE requête, la base peut-elle éviter de tout
lire ? » — et le **plan d'exécution** est le compte-rendu de ce qu'elle a décidé de faire.

## 💡 Pourquoi c'est important
La performance des données est ce qui sépare une application de démo d'une application qui
tient en production. Un développeur qui sait lire un plan d'exécution et poser le bon index
résout en dix minutes un problème qui, sinon, dégrade l'expérience de tous les utilisateurs.
C'est une compétence d'entretien data récurrente (« cette requête est lente, que fais-tu ? »)
et un réflexe qui protège tes futurs pipelines RAG (mois 9), où une requête de métadonnées
mal indexée peut multiplier le coût de chaque question.

## Explication complète

### Ce que fait la base : parcours complet vs recherche indexée
Pour `SELECT * FROM commandes WHERE client_id = 42`, sans index la base lit CHAQUE ligne
pour tester `client_id = 42` : c'est O(n), catastrophique sur des millions de lignes. Avec
un index sur `client_id`, elle utilise une structure triée (un arbre équilibré, cf. les
structures de données) pour aller directement aux lignes concernées : O(log n). Le gain n'est
pas marginal : sur 10 millions de lignes, on passe de millions d'opérations à une vingtaine.

### Lire un plan d'exécution
La plupart des bases répondent à `EXPLAIN <ta requête>` par le PLAN qu'elles vont suivre. Tu
y cherches deux mots :
- **« scan » de table complet** (`SEQ SCAN`, `SCAN TABLE`) sur une grande table filtrée :
  signal d'alerte — un index manque probablement.
- **« index »** (`INDEX SCAN`, `SEARCH USING INDEX`) : la base saute au bon endroit.
Ne devine JAMAIS pourquoi une requête est lente : demande son plan. C'est la première chose
à faire, toujours.

### Poser un index justifié
On indexe les colonnes fréquemment **filtrées** (`WHERE`), **jointes** (`JOIN ... ON`) et
**triées** (`ORDER BY`). Un index sur plusieurs colonnes (`(client_id, date)`) sert les
requêtes qui filtrent sur ce préfixe. Le coût est réel : chaque index occupe de l'espace et
RALENTIT les écritures (insert/update doivent aussi mettre l'index à jour). D'où la règle :
indexer ce qui est prouvé utile par une MESURE (plan + temps avant/après), ni partout
(écritures lentes) ni nulle part (lectures lentes).

### Le N+1 : le tueur silencieux
Le **N+1** apparaît quand, pour afficher une liste de N éléments, le code fait 1 requête pour
la liste puis 1 requête PAR élément (N requêtes) — soit N+1 allers-retours. Cent commandes =
101 requêtes. C'est souvent invisible en développement (peu de données) et dévastateur en
production. La correction : récupérer les données liées en UNE requête (un `JOIN`, ou un
`WHERE id IN (...)` qui charge tout d'un coup, puis regrouper en mémoire). Reconnaître un N+1
dans des logs de requêtes est un réflexe pro décisif.

### Pagination : décalage naïf vs curseur
`LIMIT 20 OFFSET 100000` semble anodin mais force souvent la base à parcourir et jeter
100 000 lignes avant d'en renvoyer 20 : lent sur les grandes pages. La **pagination par
curseur** (« les 20 suivant le dernier id vu » : `WHERE id > :dernier ORDER BY id LIMIT 20`)
reste rapide quelle que soit la profondeur, car elle s'appuie sur l'index.

## Concepts clés
Parcours complet (full scan) vs recherche indexée · plan d'exécution (`EXPLAIN`) · index
mono/multi-colonnes · préfixe d'index · coût des index (espace + écritures) · N+1 (détection
et correction par requête groupée) · pagination par décalage vs par curseur · index couvrant.

## 🧭 Exemple guidé
Diagnostiquer puis corriger, sans deviner :
```sql
-- 1) La requête est lente. On demande le plan AVANT de toucher quoi que ce soit.
EXPLAIN SELECT * FROM commandes WHERE client_id = 42 ORDER BY date DESC;
--    → "SEQ SCAN on commandes"  ← elle lit toute la table : index manquant.

-- 2) On pose l'index qui sert le filtre ET le tri.
CREATE INDEX idx_commandes_client_date ON commandes(client_id, date);

-- 3) On re-mesure : le plan doit maintenant montrer un INDEX SCAN, et le temps chuter.
EXPLAIN SELECT * FROM commandes WHERE client_id = 42 ORDER BY date DESC;
```
La démarche est TOUJOURS : mesurer (plan) → agir (index ciblé) → re-mesurer. Jamais « poser
des index au hasard ».

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Tu poses un index sur `client_id`. La requête reste lente. Cite trois raisons
   possibles.
2. Tu as un index sur `(client_id, date)`. Sert-il pour `WHERE date = '2026-01-01'`
   seule ?
3. Tu indexes toutes les colonnes de ta table « pour être tranquille ». Que se
   passe-t-il ?
4. `WHERE YEAR(date_creation) = 2026` sur une colonne indexée. La base utilise-t-elle
   l'index ?

## ✅ Correction attendue

**La démarche.** Toujours `EXPLAIN` avant et après. La question n'est jamais « quel index
poser » mais « qu'est-ce que la base fait aujourd'hui, et pourquoi ».

**L'erreur probable : croire qu'un index posé est un index utilisé.** Créer l'index est la
partie facile et visible ; savoir s'il sert demande de lire un plan, ce qu'on ne fait pas.

Trois causes fréquentes, dans l'ordre où elles se rencontrent :

- **La colonne est enveloppée dans une fonction.** `WHERE YEAR(date) = 2026` empêche
  l'usage de l'index sur `date` : l'index range les valeurs de `date`, pas celles de
  `YEAR(date)`. La base ne peut pas deviner l'équivalence, elle recalcule la fonction sur
  chaque ligne. La forme indexable est un **intervalle** :
  `WHERE date >= '2026-01-01' AND date < '2027-01-01'`.
- **L'index n'est pas sélectif.** Sur une colonne `actif` qui vaut `true` pour 95 % des
  lignes, l'optimiseur estime — correctement — qu'un parcours complet coûte moins cher que
  de sauter partout dans l'index puis de revenir chercher les lignes. **Un index ne sert
  que s'il élimine beaucoup.**
- **Le préfixe ne correspond pas.** Un index sur `(client_id, date)` est trié d'abord par
  `client_id` : il ne sert donc **pas** pour un filtre sur `date` seule. C'est la réponse à
  la deuxième question, et l'image utile est l'annuaire téléphonique — trié par nom puis
  prénom, il est inutile si l'on ne connaît que le prénom.

Le piège séduit parce que **le geste ressemble à la solution**. « Requête lente → il
manque un index » est une heuristique correcte dans la majorité des cas, elle a déjà
fonctionné, et l'index créé est un objet réel qu'on peut montrer. Rien ne signale qu'il
dort. La base ne prévient jamais qu'elle ignore un index : elle exécute la requête, plus
lentement, sans un mot.

**Sur les autres questions.** Indexer toutes les colonnes dégrade le système, et c'est
souvent une surprise. Chaque index est une structure à **maintenir** : tout `INSERT`,
`UPDATE` ou `DELETE` doit mettre à jour chacun d'eux. Une table à douze index paie douze
écritures supplémentaires par insertion. S'y ajoutent l'espace disque — les index dépassent
couramment la taille des données — et le travail de l'optimiseur, qui doit choisir parmi
plus de chemins. **Un index accélère la lecture et ralentit l'écriture** : c'est un
arbitrage, jamais un ajout gratuit.

Quant à `WHERE YEAR(date_creation) = 2026`, la réponse est non, pour la raison donnée plus
haut. Certaines bases permettent d'indexer directement une **expression**
(`CREATE INDEX … ON t (YEAR(date))`), ce qui règle le cas — mais la réécriture en
intervalle reste préférable : elle fonctionne partout et n'ajoute pas d'index à maintenir.

**Alternative défendable.** Sur une table modeste — quelques milliers de lignes — ne poser
**aucun index** au-delà de la clé primaire est parfaitement raisonnable. Un parcours
complet de 5 000 lignes est instantané, et l'on évite la maintenance en écriture. Le
moment d'indexer, c'est quand une requête devient lente **et** qu'`EXPLAIN` montre un
parcours complet sur une grande table — pas au moment de créer la table.

**Vérifie seul, sans corrigé** :
1. `EXPLAIN` sur ta requête la plus lente. Vois-tu « scan » ou « index » ? Si tu ne sais
   pas lire la sortie, c'est le premier travail.
2. Compte tes index et tes écritures par seconde. Multiplie. C'est le coût que tu paies
   pour tes lectures.
3. Cherche une fonction autour d'une colonne dans tes `WHERE`. Chacune est un index
   probablement inutilisé.

## ⚠️ Erreurs fréquentes
- Optimiser à l'aveugle sans lire le plan d'exécution.
- Indexer toutes les colonnes « au cas où » : écritures ralenties, espace gaspillé.
- Laisser un N+1 (boucle qui requête par élément) : lent en prod, invisible en dev.
- `OFFSET` géant pour paginer profond : préférer un curseur.
- Une fonction sur la colonne filtrée (`WHERE lower(nom) = ...`) qui empêche l'usage de
  l'index : indexer l'expression ou normaliser en amont.

## 🔗 Liens avec le programme
L'index est l'arbre équilibré de `/doc/lessons/data-structures-intro` appliqué aux données ;
le N+1 est le même piège que le O(n²) caché de `/doc/lessons/algorithmic-thinking`. La
modélisation (`/doc/lessons/database-modeling`) décide QUELLES colonnes indexer. Et la
performance des métadonnées conditionne le coût de tes pipelines RAG (mois 9).

## Mini-exercice
Avec l'exercice `fix-nplus1` : pars d'un code qui, pour N éléments, refait une recherche par
élément (O(n²) caché), et corrige-le par une pré-indexation en mémoire (une `Map`) — la
version « une passe de préparation puis lookups O(1) » qui incarne exactement la correction
d'un N+1 côté application. Compare le nombre d'opérations avant/après.

## 📚 Vocabulaire
**parcours complet (full scan)** · **index** · **plan d'exécution (`EXPLAIN`)** · **index
composite / préfixe** · **N+1** · **pagination par curseur** · **index couvrant** ·
**sélectivité**.

> **Note pratique — réel vs simulé.** La pratique associée à cette leçon s'exécute en
> JavaScript (raisonnement relationnel déterministe : les lignes sont des tableaux d'objets),
> **pas sur un vrai SGBD**. Elle entraîne le RAISONNEMENT sur les données, pas la syntaxe SQL
> réellement exécutée. AI Career OS n'embarque pas (encore) de moteur SQL — voir la décision de
> runtime dans `docs/ADR-030-curriculum-hardening-iii-and-ai-ml-debt.md`.

## 🧾 À retenir
La performance SQL se joue sur une question : la base peut-elle éviter de tout lire ? Un index
transforme un parcours O(n) en recherche O(log n), au prix d'écritures plus lentes — on
l'ajoute donc là où le PLAN d'exécution prouve qu'il manque. Les deux fléaux les plus
fréquents sont le N+1 (corrigé par une requête groupée) et la pagination par gros `OFFSET`
(corrigée par un curseur). Ne devine jamais : mesure, agis, re-mesure.
