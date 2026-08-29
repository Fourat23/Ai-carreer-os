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

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ton code lit `SELECT solde`, calcule `solde - 100` en JavaScript, puis fait
   `UPDATE comptes SET solde = 900`. Le tout dans une transaction. Es-tu protégé d'une
   mise à jour perdue ?
2. Tu passes en `Serializable` pour être sûr. Que dois-tu désormais gérer dans ton code
   que tu n'avais pas à gérer avant ?
3. Une transaction reste ouverte pendant un appel HTTP de 3 secondes. Quel est le coût
   réel, au-delà de la lenteur ?
4. Deux transactions se bloquent mutuellement. Qui décide, et que doit faire ton code ?

## ✅ Correction attendue

**La démarche.** Une transaction garantit le **tout ou rien** face aux pannes. Elle ne dit
rien, par elle-même, sur ce que font les autres transactions au même moment : c'est le
niveau d'isolation et les verrous qui s'en occupent. Confondre les deux est l'erreur mère
du sujet.

**L'erreur probable : croire qu'« être dans une transaction » protège de la concurrence.**
Le scénario de la première question est le plus courant du métier, et la réponse spontanée
est « oui, c'est atomique, c'est dans un `BEGIN`/`COMMIT` ». **Non.**

Déroulons deux exécutions simultanées en `Read Committed`, le niveau par défaut de la
plupart des bases :

```
T1 : BEGIN ; SELECT solde → 1000
T2 : BEGIN ; SELECT solde → 1000        ← lit la MÊME valeur, rien ne l'en empêche
T1 : (en JS) 1000 - 100 = 900 ; UPDATE solde = 900 ; COMMIT
T2 : (en JS) 1000 - 100 = 900 ; UPDATE solde = 900 ; COMMIT
```

Deux retraits de 100 ont eu lieu, le solde a baissé de 100. Cent euros ont disparu, sans
erreur, sans exception, avec deux transactions parfaitement valides. **L'atomicité était
respectée** — chaque transaction a bien été tout ou rien. Ce n'est simplement pas ce dont
on avait besoin.

Le mécanisme : le calcul a lieu **dans l'application**, sur une valeur lue avant. Entre la
lecture et l'écriture, la base n'a aucune raison de retenir quoi que ce soit — personne ne
le lui a demandé.

Trois parades, par ordre de préférence :

```sql
-- 1. Ne jamais faire l'aller-retour : que la base calcule.
UPDATE comptes SET solde = solde - 100 WHERE id = 7 AND solde >= 100;
-- 2. Verrou pessimiste explicite, si un calcul applicatif est indispensable.
SELECT solde FROM comptes WHERE id = 7 FOR UPDATE;
-- 3. Verrou optimiste : on écrit sous condition que rien n'ait bougé.
UPDATE comptes SET solde = 900, version = 4 WHERE id = 7 AND version = 3;
--    0 ligne affectée = conflit : on relit et on rejoue.
```

Le piège séduit parce que le mot **« transaction » promet la sécurité**, et il tient sa
promesse — sur un autre danger. ACID protège des **pannes** ; l'isolation protège des
**autres**. Les deux sont dans le même acronyme, arrivent dans la même leçon, s'obtiennent
avec le même `BEGIN`, et l'on transfère naturellement la confiance de l'un à l'autre.
S'ajoute que **rien n'échoue** : aucun test ne rougit, le bug ne se manifeste que sous
charge réelle, et il se présente comme une incohérence comptable inexplicable.

**Sur les autres questions.** Passer en `Serializable` déplace le travail sans le
supprimer : la base détecte désormais les conflits et **rejette** une des transactions
avec une erreur de sérialisation. Ton code doit donc **savoir rejouer** — attraper cette
erreur précise et retenter l'opération. Un `Serializable` sans logique de rejeu transforme
un bug silencieux en erreurs visibles pour l'utilisateur ; c'est un progrès, mais le
travail n'est fait qu'à moitié.

Une transaction ouverte pendant un appel HTTP de 3 secondes coûte bien plus que de la
lenteur : elle **tient ses verrous** pendant tout ce temps, bloquant les autres
transactions sur les mêmes lignes ; elle **occupe une connexion** du pool, ressource
limitée et partagée ; et si le service distant ralentit, ces trois secondes deviennent
trente, le pool se vide, et **toute l'application s'arrête** — alors qu'une seule
dépendance était lente. La règle : aucun appel réseau à l'intérieur d'une transaction.

Enfin, l'interblocage est détecté et tranché par **la base**, qui tue arbitrairement l'une
des deux transactions. Ton code doit s'attendre à cette erreur et **rejouer**, exactement
comme pour un conflit de sérialisation. Un interblocage n'est pas un bug à éliminer mais
une condition normale à gérer — on peut en réduire la fréquence en accédant toujours aux
lignes dans le même ordre.

**Alternative défendable.** Renoncer aux transactions pour ce genre de compteur et
s'appuyer sur une opération atomique dédiée — l'incrément d'un cache en mémoire, une
structure conçue pour cela — est un choix courant et raisonnable quand le volume est
énorme et l'exactitude à la seconde près non critique. Un compteur de « likes » n'est pas
un solde bancaire, et la première question à poser reste : **que coûte réellement une
erreur ici ?**

**Vérifie seul, sans corrigé** :
1. Cherche dans ton code un `SELECT` suivi d'un calcul puis d'un `UPDATE` de la même
   ligne. Chaque occurrence est une mise à jour perdue en attente de charge.
2. Cherche un appel réseau entre un `BEGIN` et un `COMMIT`. Chacun est une panne totale en
   attente d'une dépendance lente.
3. Ton code attrape-t-il les erreurs de sérialisation et d'interblocage pour rejouer ? Si
   non, ton niveau d'isolation élevé produit des erreurs utilisateur au lieu de sûreté.

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
