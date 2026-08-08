<!-- keep -->
# Leçon — Transactions, ACID et concurrence

## 🌍 Le problème d'abord
Deux clients réservent le DERNIER siège d'un vol exactement au même instant. Chacun lit « 1
siège disponible », chacun réserve, et… le vol est en surbooking. Ou bien : ton code crée une
commande PUIS décrémente le stock, mais le serveur plante entre les deux — la commande existe
sans que le stock ait bougé, et la base est incohérente. Ces bugs n'apparaissent jamais quand
tu testes seul, tranquillement ; ils surgissent en production quand plusieurs opérations se
produisent EN MÊME TEMPS ou qu'une panne tombe au mauvais moment. Cette leçon t'apprend les
outils que les bases offrent pour garder les données correctes malgré les pannes et la
concurrence : les transactions et les niveaux d'isolation.

## 🎯 Objectif
Comprendre ce qu'est une **transaction** et ce que garantit **ACID**, reconnaître les
anomalies de **concurrence** (lecture sale, mise à jour perdue…), savoir choisir un **niveau
d'isolation**, et arbitrer entre verrouillage **optimiste** et **pessimiste** — pour écrire
des opérations sûres à plusieurs.

## 🧩 Prérequis
Tu dois connaître les transactions au niveau intuitif « tout ou rien » et le modèle
relationnel (`/doc/lessons/sql-foundations`, `/doc/lessons/database-modeling`). Une notion de
ce qu'est une opération asynchrone / concurrente aide (`/doc/lessons/async-javascript`).
Aucune connaissance préalable des niveaux d'isolation ni des verrous n'est supposée : ils
sont construits ici.

## 🧠 Modèle mental
Une **transaction** regroupe plusieurs opérations en UN bloc « tout ou rien » : soit tout
réussit et devient permanent (`COMMIT`), soit rien ne s'applique (`ROLLBACK`) — comme si le
bloc n'avait jamais existé. C'est une garantie de TOUT-OU-RIEN face aux pannes. La
**concurrence** ajoute une seconde difficulté : quand plusieurs transactions s'exécutent en
même temps, elles peuvent se marcher dessus. Le **niveau d'isolation** est le réglage qui
décide à quel point une transaction est protégée de ce que font les autres — plus d'isolation
= plus de sûreté mais moins de parallélisme. Tout est là : sûreté contre pannes
(transaction) et sûreté contre les autres (isolation).

## 💡 Pourquoi c'est important
Les bugs de concurrence sont parmi les plus coûteux et les plus difficiles à reproduire :
argent en double, stock négatif, réservations perdues. Ils ne se voient pas en développement
et frappent en production sous charge. Savoir raisonner en transactions et isolation, c'est
protéger les données qui comptent (paiements, stocks, réservations). C'est une question
d'entretien classique (« explique ACID », « comment gères-tu deux mises à jour
concurrentes ? ») et un socle pour tout système fiable.

## Explication complète

### ACID, concrètement
- **Atomicité** : tout ou rien. « Créer la commande + décrémenter le stock » dans une
  transaction : une panne au milieu → `ROLLBACK` automatique, base intacte.
- **Cohérence** : la transaction fait passer la base d'un état valide à un autre état valide
  (les contraintes — clés, `CHECK` — restent respectées).
- **Isolation** : les transactions concurrentes ne se corrompent pas mutuellement (réglable,
  voir plus bas).
- **Durabilité** : une fois le `COMMIT` renvoyé, les données survivent à une panne (elles
  sont écrites durablement).

### Les anomalies de concurrence (ce contre quoi on se protège)
- **Lecture sale (dirty read)** : lire des données qu'une autre transaction a écrites mais pas
  encore validées — elle peut faire `ROLLBACK`, tu as lu un fantôme.
- **Lecture non répétable (non-repeatable read)** : relire la même ligne dans une transaction
  et obtenir une valeur différente (une autre a commité entre-temps).
- **Mise à jour perdue (lost update)** : deux transactions lisent la même valeur, la modifient
  chacune, et la seconde écrase la première (le siège réservé deux fois).
- **Lecture fantôme (phantom read)** : une requête qui compte des lignes en voit apparaître de
  nouvelles au second passage.

### Les niveaux d'isolation
Du moins au plus strict : **Read Uncommitted** (autorise les lectures sales — à éviter),
**Read Committed** (ne lit que du validé — défaut courant), **Repeatable Read** (les lignes
relues ne changent pas), **Serializable** (comme si les transactions s'exécutaient l'une
APRÈS l'autre — le plus sûr, le plus coûteux). Plus l'isolation monte, plus la sûreté monte
mais plus le parallélisme baisse (attentes, conflits). On choisit selon l'enjeu : Serializable
pour un transfert d'argent, Read Committed pour un affichage courant.

### Verrous : optimiste vs pessimiste
Pour empêcher deux transactions de corrompre la même donnée, deux stratégies :
- **Pessimiste** : verrouiller la ligne dès qu'on la lit (« personne d'autre n'y touche tant
  que je n'ai pas fini »). Sûr, mais crée des attentes et des risques d'**interblocage
  (deadlock)** — deux transactions s'attendent mutuellement (la base en tue une).
- **Optimiste** : ne pas verrouiller, mais vérifier au moment d'écrire que la donnée n'a pas
  changé depuis la lecture (via un numéro de version). Si elle a changé, on rejoue. Idéal
  quand les conflits sont rares. C'est le pattern « compare-and-set ».

### La bonne granularité
Une transaction doit être AUSSI COURTE que possible : elle enveloppe les opérations qui
doivent être atomiques, puis commite. Une transaction qui reste ouverte pendant un appel
réseau lent tient des verrous et bloque les autres — anti-pattern fréquent.

## Concepts clés
Transaction (`BEGIN`/`COMMIT`/`ROLLBACK`) · ACID (atomicité, cohérence, isolation,
durabilité) · anomalies (dirty read, non-repeatable read, lost update, phantom) · niveaux
d'isolation (Read Committed → Serializable) · verrou pessimiste vs optimiste · interblocage
(deadlock) · granularité (transactions courtes).

## 🧭 Exemple guidé
Réserver le dernier siège sans double réservation :
```sql
BEGIN;                                            -- ouvre la transaction
-- Verrou pessimiste : personne d'autre ne peut modifier cette ligne jusqu'au COMMIT.
SELECT places_restantes FROM vols WHERE id = 7 FOR UPDATE;
-- (l'application vérifie : places_restantes > 0 ?)
UPDATE vols SET places_restantes = places_restantes - 1 WHERE id = 7;
INSERT INTO reservations (vol_id, client_id) VALUES (7, 42);
COMMIT;                                            -- tout devient permanent, d'un coup
```
Le `FOR UPDATE` sérialise les réservations concurrentes sur ce vol : la seconde transaction
attend la première et voit alors `places_restantes` à jour. Sans cela, deux clients
réserveraient le même dernier siège (mise à jour perdue).

## ⚠️ Erreurs fréquentes
- Opérations liées (argent, stock) HORS transaction → incohérence à la première panne.
- Ignorer la concurrence : « ça marche quand je teste seul » ≠ « ça marche sous charge ».
- Transaction trop longue (qui englobe un appel réseau) → verrous tenus, blocages.
- Croire qu'un niveau d'isolation élevé est toujours « mieux » : il coûte en parallélisme.
- Ne pas gérer le rejeu en verrouillage optimiste (le conflit doit être retenté).

## 🔗 Liens avec le programme
L'atomicité prolonge la modélisation (`/doc/lessons/database-modeling`) : les contraintes +
transactions sont les remparts de l'intégrité. Les mises à jour perdues sont une course
(race condition) côté données, cousine de celles vues en React
(`/doc/lessons/react-hooks-effects`) et en résilience (`/doc/lessons/resilience-patterns`).
Tout système qui manipule de l'argent ou du stock repose sur cette leçon.

## Mini-exercice
Décris, pour un système de « like » d'un post très populaire, le risque de mise à jour perdue
si deux likes arrivent en même temps. Propose DEUX solutions : (1) `UPDATE posts SET likes =
likes + 1` (incrément atomique côté base) ; (2) un verrouillage optimiste avec numéro de
version. Explique laquelle tu choisis et pourquoi.

## 📚 Vocabulaire
**transaction** · **ACID** · **`COMMIT` / `ROLLBACK`** · **isolation** · **dirty read** ·
**lost update** · **niveau d'isolation (Read Committed, Serializable)** · **verrou pessimiste
/ optimiste** · **deadlock** · **compare-and-set**.

> **Note pratique — réel vs simulé.** La pratique associée à cette leçon s'exécute en
> JavaScript (raisonnement relationnel déterministe : les lignes sont des tableaux d'objets),
> **pas sur un vrai SGBD**. Elle entraîne le RAISONNEMENT sur les données, pas la syntaxe SQL
> réellement exécutée. AI Career OS n'embarque pas (encore) de moteur SQL — voir la décision de
> runtime dans `docs/ADR-030-curriculum-hardening-iii-and-ai-ml-debt.md`.

## 🧾 À retenir
Une transaction rend un groupe d'opérations tout-ou-rien (ACID) : c'est la protection contre
les pannes. La concurrence ajoute un second danger — des transactions simultanées qui se
corrompent — contre lequel on règle le niveau d'isolation et on choisit un verrouillage
optimiste (conflits rares) ou pessimiste (conflits fréquents). Garde les transactions courtes,
n'ignore jamais la concurrence sur les données critiques (argent, stock, réservations), et
teste sous charge, pas seulement seul.
