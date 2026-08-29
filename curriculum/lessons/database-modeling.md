<!-- keep -->
# Leçon — Modélisation de données, index et transactions

## 🌍 Le problème d'abord
Tu démarres une appli et tu ranges les données « au plus simple » : le nom de l'auteur écrit
en toutes lettres dans chaque ligne de livre, les catégories dans une colonne « a,b,c ». Six
mois plus tard, l'auteur change de nom : tu dois corriger 40 lignes (et tu en oublies), et
« trouver tous les livres de la catégorie b » devient un cauchemar. Le problème n'était pas
le code : c'était le MODÈLE de données. Bien modéliser, c'est décider où vit chaque
information pour que les questions futures restent faciles et que rien ne se désynchronise.
Cette leçon t'apprend à concevoir un schéma solide — la fondation qui rend tout le reste de
l'application simple ou impossible.

## 🎯 Objectif
Concevoir des schémas de base solides (normalisation, relations, tables de liaison), poser des index JUSTIFIÉS, et garantir l'intégrité par les transactions. Un mauvais schéma condamne une application ; un bon schéma rend tout le reste simple.

## 🧠 Modèle mental
Modéliser, c'est **décider où vit chaque FAIT — à un seul endroit**. Toute duplication finira désynchronisée (la règle « une source de vérité » du jour 10, au niveau base). Les relations recomposent ensuite ce qu'on a soigneusement séparé.

## 🧩 Prérequis
Tu dois maîtriser le modèle relationnel et les requêtes de base — tables, clés, SELECT,
JOIN, GROUP BY (`/doc/lessons/sql-foundations`), car la modélisation décide de la forme des
tables que tu interrogeras. Le principe « une source de vérité » vient de la conception
logicielle (`/doc/lessons/clean-code`). Aucune connaissance préalable de normalisation ni
d'index n'est supposée.

## 📖 Explication complète
- **La normalisation** : 1NF — valeurs atomiques (pas de listes dans une cellule) ; 2NF/3NF — chaque colonne dépend de la clé, toute la clé, rien que la clé. Concrètement : l'auteur vit dans SA table, les livres le référencent par clé étrangère — renommer l'auteur = UNE ligne modifiée.
- **Les relations** : 1-N (un auteur, des livres) par clé étrangère ; **N-N** (un livre, plusieurs catégories) par **table de liaison** — le pattern à reconnaître partout : emprunts (membre×livre+dates), inscriptions, participations. La table de liaison porte souvent SES données (dates, statut).
- **La dénormalisation** : dupliquer EXPRÈS pour lire plus vite (un compteur, un total) — un trade-off assumé qui impose de maintenir la cohérence. Jamais un accident.
- **Les index** : un arbre auxiliaire qui rend une recherche O(log n). Coût : espace + écritures ralenties. Règle : indexer les colonnes FILTRÉES/JOINTES fréquemment, prouvé par une mesure avant/après — pas partout, pas nulle part.
- **Les transactions (ACID)** : un groupe d'opérations tout-ou-rien. « Créer la commande + décrémenter le stock » sans transaction = une panne au milieu laisse la base incohérente. Atomicité, Cohérence, Isolation, Durabilité.
- **Contraintes en base** : NOT NULL, UNIQUE, FOREIGN KEY, CHECK — la base comme DERNIER rempart de l'intégrité (la validation applicative peut avoir des trous ; la contrainte, non).

## 🔧 Exemple simple
`livres(auteur TEXT)` avec le nom en toutes lettres = 40 lignes à corriger au premier renommage (et des variantes d'orthographe). `livres(auteur_id → auteurs.id)` = une seule vérité.

## 🧭 Exemple guidé

« Un membre emprunte des livres. » La première moitié du travail est mécanique et se fait en
deux minutes : c'est du N-N dans le temps — un membre emprunte plusieurs livres, un livre
passe entre plusieurs membres — et la relation porte ses propres données, les dates. Donc
une table de liaison, où l'emprunt devient une entité à part entière.

```sql
CREATE TABLE emprunts (
  id INTEGER PRIMARY KEY,
  livre_id    INTEGER NOT NULL REFERENCES livres(id),
  membre_id   INTEGER NOT NULL REFERENCES membres(id),
  emprunte_le TEXT NOT NULL,
  rendu_le    TEXT               -- NULL = emprunt en cours
);
```

`rendu_le NULL` encode l'état « en cours » sans colonne booléenne supplémentaire — une seule
information, un seul endroit. Jusqu'ici, rien de discutable.

**La vraie question arrive maintenant : où vit la règle « un livre ne peut pas être emprunté
deux fois en même temps » ?** Trois endroits sont possibles, et le choix n'est pas affaire de
goût.

**Candidat 1 — dans le service.** On lit, on vérifie, on écrit :

```js
const enCours = await db.get(`SELECT 1 FROM emprunts WHERE livre_id=? AND rendu_le IS NULL`, id);
if (enCours) throw httpError(409, 'Déjà emprunté');
await db.run(`INSERT INTO emprunts (livre_id, membre_id, emprunte_le) VALUES (?,?,?)`, …);
```

C'est lisible, testable, et ça donne un beau message d'erreur. C'est aussi **faux dès qu'il y
a deux utilisateurs**. Entre le `SELECT` et l'`INSERT`, il s'écoule un temps — quelques
millisecondes suffisent. Deux requêtes qui arrivent ensemble lisent toutes les deux « aucun
emprunt en cours », concluent toutes les deux que c'est libre, et insèrent toutes les deux.
La base contient alors deux emprunts simultanés du même livre, et aucun bug n'est visible
dans le code : chaque exécution, prise seule, est correcte. C'est le défaut classique
*vérifier-puis-agir*, et il ne se reproduit presque jamais en développement, où l'on est
seul à cliquer.

**Candidat 2 — une contrainte d'unicité.** Le réflexe est d'écrire :

```sql
CREATE UNIQUE INDEX u ON emprunts(livre_id, rendu_le);
```

Vérifie-la avant de la croire, parce qu'elle se trompe **dans les deux sens**. Trois emprunts
du même livre, tous en cours, passent sans broncher : les trois ont `rendu_le = NULL`, et en
SQL `NULL` n'est jamais égal à `NULL` — deux lignes contenant `NULL` ne sont donc pas des
doublons pour l'index, quel que soit leur nombre. Symétriquement, la contrainte **refuse**
quelque chose de parfaitement légitime : deux exemplaires rendus le même jour, puisque là
les valeurs sont égales pour de bon. Une contrainte qui autorise exactement ce qu'on
interdit et interdit exactement ce qu'on autorise. Retiens le mécanisme plutôt que le cas :
`NULL` signifie *inconnu*, et deux inconnus ne sont pas réputés identiques.

**Candidat 3 — l'index unique partiel.** On ne contraint que les lignes qui nous intéressent :

```sql
CREATE UNIQUE INDEX u_emprunt_en_cours ON emprunts(livre_id) WHERE rendu_le IS NULL;
```

Là, ça tient. Le premier emprunt passe, le second est refusé par la base — même si les deux
requêtes arrivent en même temps, parce que la vérification n'est plus séparée de l'écriture :
c'est le moteur qui les fait ensemble. Et l'historique reste intact : une fois `rendu_le`
renseigné, la ligne sort du champ de l'index et le livre redevient empruntable. Une seule
ligne de SQL exprime « au plus un emprunt ouvert par livre, autant de clos qu'on veut ».

**Ce que ça change pour le service.** Le candidat 1 n'est pas à jeter, il est à
*rétrograder* : il reste utile pour produire un message clair dans le cas courant, mais il
n'est plus ce qui garantit la règle. Le service attrape désormais la violation de contrainte
et la traduit en `409`. C'est la logique du « dernier rempart » : l'application optimise
l'expérience, la base garantit l'invariant. Quand les deux disent la même chose, seule la
base a le droit d'avoir raison.

**Une vérification que peu de gens font.** Les clés étrangères de ce schéma ne sont pas
forcément actives : SQLite, pour raisons de compatibilité historique, peut les ignorer
silencieusement selon le pilote utilisé — un `INSERT` référençant un livre inexistant passe
alors sans erreur. Un `PRAGMA foreign_keys` répond `0` ou `1` et règle la question en deux
secondes. Une contrainte qu'on croit posée mais qui n'est pas appliquée est pire que pas de
contrainte du tout, puisqu'on cesse de vérifier.

**Variante qui déplace le problème.** La bibliothèque achète trois exemplaires du même
titre. L'index partiel devient faux : il n'autorise qu'un emprunt en cours par `livre_id`,
alors qu'on en veut trois. Et le correctif n'est pas dans l'index — il est dans le modèle.
« Livre » désignait jusqu'ici deux choses différentes : l'œuvre (titre, auteur, ISBN) et
l'objet physique qu'on emprunte. Il faut les séparer : `oeuvres` et `exemplaires`, l'emprunt
pointant vers un exemplaire. La contrainte redevient juste sans être modifiée. C'est le
scénario le plus fréquent en modélisation : un invariant qui résiste mal n'est pas
un problème de contrainte, c'est le signe qu'une entité en cache deux.

## 🤖 Exemple appliqué (IA / data / architecture)
Le modèle de données de DocSense : documents, chunks (avec source/page — la matière des citations), évaluations (version × question × scores — l'historique du dashboard qualité), sessions. Un RAG bien modélisé se debugge ; un RAG aux données plates se subit. Et le feature engineering ML (mois 6) commence toujours par comprendre le schéma.

## ⚠️ Erreurs fréquentes
- Stocker des listes dans une colonne (« tags: a,b,c ») → jointures impossibles, requêtes tortueuses.
- Oublier la table de liaison et dupliquer les lignes.
- Index partout « au cas où » (écritures lentes) ou nulle part (lectures lentes).
- Opérations liées hors transaction.

## 🚫 Anti-patterns
- Modéliser d'après l'écran (« la page affiche X ») au lieu du DOMAINE.
- La colonne fourre-tout JSON quand des colonnes typées s'imposent.

## ✍️ Mini-exercice
Modélise « des étudiants s'inscrivent à des cours avec une note finale » : tables, clés, où vit la note ? (Réponse : dans la table de liaison.)

## 🔥 Exercice plus difficile
Sur une base peuplée (10k+ lignes) : mesure une requête filtrée sans index, pose l'index, remesure, documente le gain. Puis écris la transaction « commande + stock » et prouve le rollback sur une panne simulée.

## ✅ Correction attendue
La logique : un fait = un endroit ; N-N = table de liaison (avec ses données) ; index prouvés par la mesure ; transactions sur les opérations liées ; contraintes comme rempart. Vérifie : ton schéma survit à « et si X devient multiple ? » ; le rollback fonctionne (testé) ; chaque index cite sa requête.

## 🎤 Questions d'entretien
- « Modélise un système de réservation. » → Entités + table de liaison avec ses attributs (dates, statut) + contraintes.
- « Quand poses-tu un index, et quel est son coût ? » → Colonnes filtrées/jointes souvent ; coût : espace + écritures — mesurer.
- « Explique ACID avec un exemple. » → Commande + stock : tout ou rien, sinon incohérence.

> **Note pratique — réel vs simulé.** La pratique associée à cette leçon s'exécute en
> JavaScript (raisonnement relationnel déterministe : les lignes sont des tableaux d'objets),
> **pas sur un vrai SGBD**. Elle entraîne le RAISONNEMENT sur les données, pas la syntaxe SQL
> réellement exécutée. AI Career OS n'embarque pas (encore) de moteur SQL — voir la décision de
> runtime dans `docs/ADR-030-curriculum-hardening-iii-and-ai-ml-debt.md`.

## 🧾 À retenir
- Chaque fait à UN endroit ; N-N = table de liaison ; dénormaliser = décision, pas accident.
- Index : justifiés par une mesure ; transactions : sur toute opération multi-étapes.
- Les contraintes en base sont le dernier rempart de l'intégrité.

## 📚 Vocabulaire
**normalisation (1-3NF)** · **clé primaire/étrangère** · **table de liaison** · **cardinalité (1-N, N-N)** · **index** · **transaction / ACID / rollback** · **contrainte (UNIQUE, CHECK)** · **dénormalisation**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je reconnais un N-N et je crée la table de liaison sans hésiter.
- [ ] Mes index sont justifiés par des mesures.
- [ ] Mes opérations multi-étapes sont transactionnelles (rollback testé).

## 🔗 Liens avec le programme
Mois 3 (jours ~58-66), mois 5 (jours ~131-140), modèle de DocSense. Leçons liées : `sql-foundations`, `etl-pipelines`, `architecture-basics`.
