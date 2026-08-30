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

## 🧭 Exemple guidé — 100 − 30 − 50 = 50, et les trois façons d'obtenir 20

La concurrence est le domaine où « ça marche chez moi » est le plus trompeur : seul, tout
fonctionne, toujours. Le défaut n'apparaît que lorsque deux choses arrivent en même temps —
c'est-à-dire en production, rarement, et de façon irreproductible.

Alors provoquons-le exprès, et regardons le nombre.

> Les quatre résultats de cette section sont **mesurés** : le script
> `scripts/v70-verifications/sql-mise-a-jour-perdue.mjs` ouvre deux connexions sur une vraie
> base, entrelace leurs opérations à la main et imprime le solde obtenu.

### Le décor

Un compte avec **100 €**. Deux opérations simultanées : A retire 30, B retire 50. La réponse
attendue est **20**, et il n'y a pas de débat là-dessus.

### A. Le code que tout le monde écrit

```js
const compte = await db.get('SELECT solde FROM comptes WHERE id = 1');   // lit 100
const nouveau = compte.solde - montant;                                   // calcule
await db.run('UPDATE comptes SET solde = ? WHERE id = 1', nouveau);       // écrit
```

Lire, calculer, écrire. C'est lisible, testable, et faux.

```
attendu : 20   |   obtenu : 50   ← MISE À JOUR PERDUE
```

Déroulons ce qui s'est passé, ligne à ligne :

| Temps | A | B | Solde en base |
|---|---|---|---|
| 1 | lit **100** | | 100 |
| 2 | | lit **100** | 100 |
| 3 | écrit `100 − 30 = 70` | | 70 |
| 4 | | écrit `100 − 50 = 50` | **50** |

Le retrait de A a **disparu**. Pas échoué : disparu. Aucune erreur, aucune exception, aucun
journal. Le client a bien reçu « retrait effectué », et l'argent est toujours là.

C'est ce qu'on appelle une **mise à jour perdue**, et c'est le défaut de concurrence
fondamental. Sa cause tient en une phrase : **B a pris sa décision à partir d'une valeur
devenue périmée entre le moment où il l'a lue et le moment où il a écrit.**

Note que ce n'est pas un problème de vitesse. L'intervalle entre les lignes 2 et 4 peut être
d'une milliseconde ; il suffit qu'il existe.

### B. La correction la plus simple : ne pas lire

```sql
UPDATE comptes SET solde = solde - 30 WHERE id = 1;
```

```
attendu : 20   |   obtenu : 20
```

Une seule instruction, et le problème s'évapore. Pourquoi ? Parce qu'il n'y a plus d'intervalle
entre la lecture et l'écriture : la base lit `solde` et écrit `solde - 30` **à l'intérieur de
la même opération**, qu'elle garantit atomique. Aucun tiers ne peut s'intercaler.

C'est la réponse à privilégier chaque fois qu'elle est possible, parce qu'elle ne demande ni
transaction, ni verrou, ni nouvelle tentative. La règle à retenir : **quand la nouvelle valeur
se déduit de l'ancienne, exprime-la en SQL au lieu de la calculer dans ton code.**

Sa limite est réelle : elle ne convient qu'aux opérations exprimables en une instruction. Dès
qu'il faut **décider** — « retirer 30 seulement si le solde le permet », « réserver le dernier
siège puis créer la réservation » — il faut autre chose.

### C. Le verrou : la transaction pessimiste

```sql
BEGIN IMMEDIATE;                                        -- je prends le verrou d'écriture
SELECT solde FROM comptes WHERE id = 1;                 -- je lis, protégé
-- l'application vérifie : solde >= 30 ?
UPDATE comptes SET solde = ? WHERE id = 1;
COMMIT;                                                 -- je relâche
```

Mesure : pendant que A tient le verrou, la tentative de B est **refusée** (`ERR_SQLITE_ERROR`).
B rejoue après, et le solde final est **20**.

Le principe est de supposer le conflit **probable** et de l'empêcher : personne d'autre ne
touche à cette ligne tant que je n'ai pas fini. C'est ce que fait `SELECT … FOR UPDATE` sur
PostgreSQL ou MySQL, avec la même intention.

Le prix est réel, et il faut le connaître :

- pendant le verrou, les autres **attendent** — le débit chute si la transaction est longue ;
- une transaction qui englobe un appel réseau (paiement, courriel, appel à un tiers) tient le
  verrou pendant toute la latence de ce tiers. C'est l'une des causes les plus fréquentes de
  blocage généralisé en production ;
- deux transactions qui verrouillent deux lignes dans des ordres opposés peuvent s'attendre
  mutuellement — un **interblocage**, que la base tranche en tuant l'une des deux.

D'où la discipline : **une transaction contient des accès à la base, et rien d'autre.** Les
appels externes se font avant, ou après.

### D. La version : le verrouillage optimiste

```sql
UPDATE comptes SET solde = ?, version = version + 1
 WHERE id = 1 AND version = ?;      -- ← la version que j'avais lue
```

Mesure — le nombre de lignes réellement modifiées :

```
A = 1 ligne modifiée      B = 0 ligne modifiée
```

Cette ligne à `0` est tout le mécanisme. B a lu la version 1, A a commis entre-temps et l'a
fait passer à 2 : la condition `version = 1` ne correspond plus à rien, l'`UPDATE` ne modifie
**aucune** ligne. B l'apprend par ce zéro, relit, et rejoue. Solde final : **20**.

Le principe est inverse du précédent : on suppose le conflit **rare**, on ne verrouille rien,
et on **détecte** l'écrasement au moment d'écrire. D'où le nom d'optimiste.

Le point à ne pas manquer : **ce mécanisme n'existe que si l'application vérifie le nombre de
lignes modifiées.** Un code qui lance l'`UPDATE` sans regarder ce qu'il retourne a exactement
le comportement de la version A — il croira avoir réussi. La protection n'est pas dans le SQL,
elle est dans le fait de lire la réponse.

### Choisir

| Situation | Réponse |
|---|---|
| la nouvelle valeur se déduit de l'ancienne | **B** — un seul `UPDATE` atomique |
| il faut décider entre lire et écrire, conflits fréquents | **C** — transaction avec verrou |
| il faut décider, conflits rares, ou un humain édite un formulaire | **D** — version optimiste |

Le cas de l'humain mérite un mot : quand quelqu'un ouvre un formulaire d'édition, réfléchit
trois minutes et enregistre, un verrou pessimiste est exclu — on ne bloque pas une ligne
pendant trois minutes. La version optimiste donne exactement le bon comportement : « cette
fiche a été modifiée par quelqu'un d'autre pendant votre saisie », ce qui est bien plus
honnête qu'un écrasement silencieux.

### La limite de cette démonstration, déclarée

Elle est menée sur SQLite, qui sérialise les écritures au niveau du fichier. Sur PostgreSQL ou
MySQL, les **mécanismes** sont identiques — mise à jour perdue, écriture atomique, verrou,
version — mais les niveaux d'isolation, les erreurs renvoyées et la granularité des verrous
diffèrent. Ce qu'il faut retenir n'est pas un code d'erreur : c'est que **lire puis écrire est
faux dès qu'on est deux**, et qu'il existe trois façons différentes d'y remédier selon ce
qu'on a le droit de supposer sur la fréquence des conflits.

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
avec une **erreur de sérialisation** — le nom que la norme SQL donne au refus
d'une transaction dont le résultat ne pourrait pas être obtenu en exécutant
les transactions l'une après l'autre. Ton code doit donc **savoir rejouer** — attraper cette
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

## 🔥 Pratique — reproduire les anomalies plutôt que les lire

Les anomalies de concurrence se comprennent en les provoquant. Deux connexions
suffisent.

**A. La mise à jour perdue.** Deux connexions lisent le même stock à 100, en
retirent chacune 40, et écrivent. Livrable : la valeur finale, celle qu'on
attendait, et le nombre de connexions qui ont cru réussir.

**B. La corriger de deux façons.** D'abord par une écriture relative, ensuite par
un verrouillage explicite à la lecture. Mesure la valeur finale dans chaque cas.
Livrable : les deux valeurs, et le compromis entre les deux méthodes.

**C. L'interruption au milieu.** Écris une séquence qui insère mille lignes sans
transaction, interromps-la en cours, puis compte. Recommence dans une
transaction. Livrable : les deux décomptes.

**D. L'étreinte fatale.** Fabrique deux connexions qui verrouillent deux
ressources dans l'ordre inverse. Livrable : le message d'erreur, quelle
connexion est sacrifiée, et la règle qui évite le cas.

**E. Le compteur juste.** Écris un compteur incrémenté par cent opérations
concurrentes et prouve qu'il vaut exactement cent. Livrable : la valeur et la
technique employée.

## ✅ Correction attendue — sur la pratique A → E

> Les valeurs de A et C sont **mesurées** par
> `scripts/v70-verifications/sql-mise-a-jour-perdue.mjs` et
> `scripts/v70-verifications/etl-idempotence.mjs`.

L'**idempotence** dont il est question ici est la propriété d'une opération qu'on peut rejouer sans changer le résultat.

**A — la mise à jour perdue.** Le stock final vaut **50** au lieu de 20 attendus,
et **les deux connexions ont cru réussir**. Aucune erreur, aucun avertissement.

Le mécanisme : chacune a lu 100, calculé 60 dans son propre processus, et écrit
60. La seconde écriture écrase la première, dont le travail disparaît. C'est
l'anomalie la plus coûteuse parce qu'elle est **silencieuse** — elle ne se
découvre qu'à l'inventaire, des semaines plus tard, et il est alors impossible de
savoir combien d'opérations ont été perdues.

Le point à formuler : **le défaut n'est pas dans la base, il est dans le schéma
« lire, calculer dans l'application, écrire ».** Toute séquence de cette forme est
vulnérable, quel que soit le moteur.

**B — les deux remèdes, et leur compromis.**

L'**écriture relative** — demander à la base de soustraire, au lieu de lui donner
un résultat calculé ailleurs — supprime le problème par construction : la lecture
et l'écriture n'existent plus séparément. C'est la meilleure réponse quand elle
est applicable, et elle ne coûte rien.

Le **verrouillage à la lecture** rend la valeur lue exclusive jusqu'à la fin de
la transaction. Il devient nécessaire dès que le calcul intermédiaire ne peut pas
s'exprimer dans la requête d'écriture — une décision métier, une validation. Son
coût est réel : les autres connexions attendent, et l'attente peut devenir une
étreinte fatale (point D).

La règle de choix : **écriture relative si le calcul tient dans la requête,
verrou sinon.** Verrouiller par précaution là où une écriture relative suffirait
est une perte de débit gratuite.

**C — l'interruption.** Mesuré : sans transaction, l'interruption laisse **617
lignes sur 1000 et une somme de 96 006**. La base n'est ni vide ni complète : elle
est dans un état intermédiaire qu'aucune partie du code n'a prévu.

Avec transaction, le décompte est 0 ou 1000. Rien d'autre n'est possible.

Ce qu'il faut savoir énoncer : **une transaction ne rend pas l'opération plus
sûre, elle rend l'état intermédiaire inobservable.** C'est ce qui permet d'écrire
le reste du programme sans se demander, à chaque lecture, si une écriture a été
interrompue au milieu.

**D — l'étreinte fatale.** Le moteur détecte le cycle d'attente et sacrifie l'une
des deux connexions, qui reçoit une erreur explicite. La transaction sacrifiée
est annulée entièrement.

Deux enseignements. Le premier : **c'est un comportement normal, pas une panne.**
Une application correcte réessaie la transaction annulée, et cette reprise fait
partie du code attendu, pas d'un traitement exceptionnel.

Le second, qui est la vraie prévention : **verrouiller toujours dans le même
ordre.** Si toutes les transactions prennent les ressources par ordre
d'identifiant croissant, aucun cycle ne peut se former. C'est une convention
d'équipe, pas un réglage — et elle doit être écrite quelque part, sinon elle sera
violée par le premier code qui itère dans un autre ordre.

**E — le compteur juste.** La bonne réponse n'est pas un verrou : c'est de faire
faire l'incrément **par la base**, dans la requête d'écriture. Cent opérations
concurrentes donnent alors exactement cent, sans verrou explicite et sans
attente.

Le raisonnement à retenir dépasse les bases de données : **quand une valeur est
partagée, on ne la lit pas pour la recalculer ailleurs ; on décrit la
modification à faire.** C'est le même principe que l'opération atomique en
programmation concurrente, et la même famille de raisonnement que l'**idempotence** — la propriété d'une
opération qu'on peut rejouer sans changer le résultat —
mesurée dans `etl-pipelines`.

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
