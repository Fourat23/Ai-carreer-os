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
**Énoncé** : modéliser « un membre emprunte des livres ».
**Raisonnement** : N-N dans le temps (un membre, plusieurs livres ; un livre, plusieurs membres successifs) + des données propres à la relation → table de liaison.
**Solution** :
```sql
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  book_id   INTEGER NOT NULL REFERENCES books(id),
  member_id INTEGER NOT NULL REFERENCES members(id),
  borrowed_at TEXT NOT NULL,
  returned_at TEXT              -- NULL = en cours
);
CREATE INDEX idx_loans_book ON loans(book_id);
```
**Explication** : l'emprunt EST une entité (avec ses dates) ; les clés étrangères garantissent l'existence des deux côtés ; l'index sert la question fréquente « ce livre est-il emprunté ? ». **Variante** : la règle « pas de double emprunt en cours » — contrainte partielle ou vérification transactionnelle dans le service ?

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
