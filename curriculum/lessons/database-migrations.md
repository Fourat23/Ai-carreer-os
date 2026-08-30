<!-- keep -->
# Leçon — Migrations de schéma et compatibilité

## 🌍 Le problème d'abord
Ton application tourne en production avec des vraies données. Un jour, tu dois ajouter une
colonne, renommer un champ, ou découper une table. Tu ne peux pas juste « refaire la base » :
elle contient les données des utilisateurs, et l'ancienne version de ton application tourne
peut-être ENCORE pendant que tu déploies la nouvelle. Comment faire évoluer la STRUCTURE
d'une base vivante, sur toutes les machines (ta machine, celle des collègues, la production),
de façon reproductible et sans casser ni perdre de données ? La réponse s'appelle les
**migrations**. Cette leçon t'apprend à faire évoluer un schéma en toute sécurité — une
compétence que les tutoriels sautent presque toujours et que la production exige tout de suite.

## 🎯 Objectif
Comprendre pourquoi les changements de schéma passent par des **migrations versionnées**,
savoir écrire une migration réversible, et maîtriser la **compatibilité** entre versions
(changement cassant vs compatible, motif *expand/contract*) pour déployer sans interruption
ni perte de données.

## 🧩 Prérequis
Tu dois savoir modéliser un schéma et connaître les contraintes (`/doc/lessons/database-modeling`),
et comprendre le versionnement du code (`/doc/lessons/git-fundamentals`), car une migration
est au schéma ce qu'un commit est au code. Aucune
connaissance préalable des outils de migration n'est supposée.

Ce que tu dois savoir du **déploiement progressif** pour lire cette leçon tient en une
phrase : lors d'une mise à jour, les instances sont remplacées une par une, donc **l'ancienne
et la nouvelle version du code tournent en même temps pendant quelques minutes**, sur la même
base. C'est cette cohabitation qui rend une migration dangereuse, et c'est tout ce dont la
leçon a besoin.

> **Où trouver le détail.** `/doc/lessons/deployment-strategies` compare les stratégies
> (rolling, blue-green, canary). Elle est sur **l'étagère de référence** : aucune des 365
> journées ne la programme, et rien ici ne suppose que tu l'as lue.

## 🧠 Modèle mental
Pense les migrations comme le « Git de la structure de la base ». Chaque changement de schéma
est un fichier de migration NUMÉROTÉ (001, 002, …) qui décrit une transformation ; appliquées
DANS L'ORDRE, ces migrations amènent n'importe quelle base (vide ou déjà peuplée) à l'état
voulu, de façon identique et reproductible partout. La règle d'or, quand la base est vivante :
un changement doit être COMPATIBLE avec le code encore en cours d'exécution — sinon, pendant
le déploiement, l'ancien code face au nouveau schéma (ou l'inverse) plante. On évolue donc par
petites étapes compatibles, jamais par un grand changement brutal.

## 💡 Pourquoi c'est important
En production, toute évolution de fonctionnalité touchant les données passe par une migration.
Une migration mal pensée peut provoquer une panne (l'ancien code ne trouve plus une colonne
renommée) ou une perte de données irréversible. Savoir concevoir des migrations sûres et
compatibles distingue immédiatement un développeur prêt pour la production. C'est aussi ce qui
rend un projet reproductible : un nouveau coéquipier obtient exactement ton schéma en lançant
les migrations, sans « démerde-toi pour recréer la base ».

## Explication complète

### Pourquoi versionner le schéma
Modifier la base « à la main » en production est ingérable : personne ne sait quel changement
a été appliqué où, et un nouveau venu ne peut pas reconstruire le schéma. Une **migration**
est un script versionné, committé avec le code, qui décrit un changement. Un outil de
migration garde trace de celles déjà appliquées et n'exécute que les nouvelles — l'état du
schéma devient reproductible et traçable, comme l'historique Git du code.

### Up et down : réversibilité
Une migration a idéalement deux sens : **up** (appliquer le changement — ex. `ALTER TABLE …
ADD COLUMN …`) et **down** (le défaire — `DROP COLUMN …`), pour pouvoir revenir en arrière si
un déploiement tourne mal. Attention : certaines opérations perdent de l'information (supprimer
une colonne détruit ses données) — leur `down` ne peut pas tout restaurer. On le sait et on le
documente.

### Changement compatible vs cassant
- **Compatible (additif)** : ajouter une colonne nullable, ajouter une table, ajouter un
  index. L'ancien code continue de fonctionner car il ignore la nouveauté.
- **Cassant** : renommer/supprimer une colonne utilisée, ajouter une colonne NOT NULL sans
  défaut, changer un type. L'ancien code (ou l'ancienne version encore en ligne pendant le
  déploiement) casse.
La question à se poser AVANT toute migration : « le code actuellement en production
survit-il à ce schéma ? ».

### Le motif expand / contract (pour déployer sans interruption)
Un renommage ou un changement de type se fait en PLUSIEURS étapes compatibles, jamais d'un
coup :
1. **Expand** : ajouter la nouvelle colonne (compatible), sans toucher l'ancienne.
2. Déployer le code qui écrit dans les DEUX et lit la nouvelle (transition).
3. **Backfill** : copier les données de l'ancienne vers la nouvelle (migration de données).
4. **Contract** : une fois que plus aucun code n'utilise l'ancienne colonne, la supprimer.
Chaque étape est individuellement compatible : à aucun moment le code en ligne ne voit un
schéma qu'il ne comprend pas. C'est ainsi qu'on modifie une base sans coupure.

### Migrations de données vs de schéma
Changer la STRUCTURE (colonnes, tables) et TRANSFORMER les données existantes (backfill,
nettoyage) sont deux choses. Les migrations de données doivent gérer le VOLUME (traiter par
lots pour ne pas verrouiller une table entière des heures) et être **idempotentes** — rejouables sans double effet — autant que
possible (rejouables sans double effet).

## Concepts clés
Migration versionnée · up / down (réversibilité) · reproductibilité du schéma · changement
compatible (additif) vs cassant · compatibilité descendante · motif expand/contract ·
backfill · migration de données par lots · zéro interruption (zero-downtime).

## 🧭 Exemple guidé
Renommer `nom` en `nom_complet` sur une table vivante, sans coupure.

Ce qui rend l'exercice difficile n'est pas le SQL — `RENAME COLUMN` existe et fonctionne. C'est
qu'au moment où la migration s'exécute, **l'ancien code tourne encore**. Un déploiement n'est
jamais instantané : la migration passe, puis les instances applicatives sont remplacées une par
une, sur plusieurs minutes.

Alors mesurons ce que voit ce code pendant l'opération.

> Les résultats sont **exécutés** par
> `scripts/v70-verifications/migration-expand-contract.mjs` : à chaque étape, les requêtes de
> l'ancienne version **et** de la nouvelle sont réellement jouées contre la base.

### A. La migration en une instruction

```sql
ALTER TABLE clients RENAME COLUMN nom TO nom_complet;
```

| Instant | `ancien.lire` | `ancien.écrire` | `nouveau.lire` |
|---|---|---|---|
| avant | OK | OK | échec : `no such column: nom_complet` |
| **après le RENAME** | **échec : `no such column: nom`** | **échec** | OK |

Une instruction, et **l'ancien code est mort d'un coup** — en lecture comme en écriture. Toutes
les instances pas encore remplacées renvoient des erreurs, pour toutes les requêtes touchant
cette table.

La durée de la panne n'est pas celle de la migration (quelques millisecondes) : c'est celle du
**déploiement**, soit plusieurs minutes. Et si le déploiement échoue et qu'il faut revenir en
arrière, l'ancien code revient sur un schéma qu'il ne comprend plus — la panne devient longue.

Retiens la formulation : **une migration n'est jamais seule.** Elle est jouée dans un système
où deux versions du code coexistent, et c'est cette coexistence qu'il faut rendre possible.

### B. Élargir, remplir, rétrécir

Quatre étapes, et la mesure à chacune :

| Étape | `ancien.lire` | `ancien.écrire` | `nouveau.lire` |
|---|---|---|---|
| 0. avant | OK | OK | échec |
| **1. `ADD COLUMN nom_complet`** | **OK** | **OK** | **OK** |
| 2. `UPDATE … SET nom_complet = nom` | OK | OK | OK |
| 3. *déploiement du nouveau code* | OK | OK | OK |
| **4. `DROP COLUMN nom`** | échec | échec | OK |

La ligne 1 est le cœur du motif. **Ajouter une colonne ne casse personne** : l'ancien code ne
la connaît pas et ne la demande pas, le nouveau code peut déjà l'utiliser. C'est la seule
opération de schéma qui laisse les deux versions fonctionner, et c'est pourquoi toute migration
compatible commence par une addition.

L'ancien code ne casse qu'à l'étape 4 — **après avoir été retiré de la production**. Le schéma
n'a jamais, à aucun instant, été incompatible avec le code qui tournait.

```sql
-- 012 (expand)   : personne ne casse
ALTER TABLE clients ADD COLUMN nom_complet TEXT;

-- 013 (backfill) : copier l'existant
UPDATE clients SET nom_complet = nom WHERE nom_complet IS NULL;

-- déploiement du code qui ÉCRIT les deux colonnes et LIT nom_complet
-- ... puis on attend. Des jours, si nécessaire.

-- 014 (contract) : seulement quand plus aucun code ne lit `nom`
ALTER TABLE clients DROP COLUMN nom;
```

### Les deux détails qui font échouer ce motif en vrai

**Le code intermédiaire doit écrire les DEUX colonnes.** C'est l'étape que l'on oublie, et elle
est indispensable : entre le déploiement et le `DROP`, des instances de l'ancienne version
écrivent encore dans `nom` seul. Si le nouveau code n'écrit pas les deux, les lignes créées
pendant cette fenêtre auront un `nom_complet` vide — un trou de données que personne ne
remarquera avant des mois.

**Le moment du `DROP` se décide sur une mesure, pas sur un calendrier.** « Plus aucun code ne
lit `nom` » est une hypothèse tant qu'on ne l'a pas vérifiée : un compteur sur la lecture du
champ, ou une recherche dans le code de tous les services — y compris les tâches planifiées,
les exports, les tableaux de bord d'analyse et le script de quelqu'un qui interroge la base
directement.

C'est exactement la même exigence que la dépréciation d'un champ d'API dans
`/doc/lessons/api-production-contracts` : **sans compteur, on ne sait jamais si l'on peut
retirer.**

### Le remplissage : un seul `UPDATE` ou par lots ?

Question qui se pose dès que la table est grosse. Mesure sur **500 000 lignes** :

| Méthode | Durée totale | Ce qui se passe |
|---|---|---|
| un seul `UPDATE` | **125 ms** | une transaction, verrou tenu du début à la fin |
| par lots de 10 000 | **884 ms** | 50 transactions courtes |

Le traitement par lots est **sept fois plus lent au total** — et c'est celui qu'il faut choisir
en production.

La raison n'apparaît pas dans la colonne « durée totale », et c'est tout l'intérêt de la
mesure : ce qui compte n'est pas le temps total, c'est **la durée de la plus longue
transaction**. Le seul `UPDATE` tient un verrou pendant toute son exécution ; ici 125 ms, mais
sur 50 millions de lignes et une vraie base sous charge, ce sont plusieurs minutes pendant
lesquelles les écritures des utilisateurs attendent.

Cinquante transactions de quelques millisecondes laissent, entre chacune, la place aux requêtes
normales. On paie 759 ms de plus, et personne ne s'en aperçoit.

Généralisation utile bien au-delà des migrations : **quand une opération longue bloque les
autres, la découper la rend plus lente et le système plus disponible.** C'est un arbitrage
qu'on retrouve partout — traitements par lots, indexation, purge d'archives.

### Le retour arrière, et pourquoi il est asymétrique

Dernière propriété du motif, et elle est décisive : à quelles étapes peut-on revenir en
arrière ?

| Étape | Réversible ? |
|---|---|
| 1. `ADD COLUMN` | oui, sans perte |
| 2. remplissage | oui, sans perte |
| 3. déploiement du nouveau code | oui — l'ancien code fonctionne encore |
| 4. `DROP COLUMN` | **non — la donnée est perdue** |

Trois étapes réversibles, une définitive. C'est pour cela que le `DROP` est **séparé** des
autres et joué bien plus tard : on découpe la migration de manière que tout ce qui est risqué
soit repoussé au moment où l'on est sûr.

Le principe, applicable à tout changement délicat : **regroupe ce qui est réversible, isole ce
qui ne l'est pas, et exécute l'irréversible en dernier, séparément.**

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Tu dois renommer la colonne `nom` en `nom_complet`. Ta migration fait
   `ALTER TABLE … RENAME COLUMN`. Que se passe-t-il pendant un déploiement progressif ?
2. Ta migration a un `down` qui fait `DROP COLUMN`. Est-elle réversible ?
3. Tu ajoutes `ALTER TABLE commandes ADD COLUMN statut TEXT NOT NULL DEFAULT 'nouveau'`
   sur 80 millions de lignes. Que crains-tu ?
4. Deux développeurs créent une migration le même jour. Que peut-il arriver ?

## ✅ Correction attendue

**La démarche.** Une migration ne s'exécute jamais dans un monde vide : pendant qu'elle
tourne, **du code ancien et du code nouveau parlent à la même base**. Toute migration se
juge donc sur cette cohabitation, pas sur l'état final.

**L'erreur probable, et elle casse la production pendant chaque déploiement.** Renommer
une colonne en une seule migration paraît propre : un seul changement, un seul script, un
schéma correct à l'arrivée. La chronologie réelle est la suivante.

Un déploiement progressif remplace les instances une par une. Pendant plusieurs minutes,
d'anciennes instances tournent encore. La migration s'applique — la colonne s'appelle
désormais `nom_complet` — et **toutes les anciennes instances plantent instantanément**,
puisqu'elles demandent `nom`. Si l'on tente un retour arrière, c'est pire : le code
revenu en arrière cherche `nom`, qui n'existe plus, et **le rollback ne rétablit rien**.

Le motif qui règle cela s'appelle **expand / contract**, et il tient en trois
déploiements séparés :

1. **Expand** — ajouter `nom_complet` sans toucher à `nom`. Les deux existent, le code
   ancien continue de fonctionner.
2. **Migrer** — déployer le code qui écrit dans les deux et lit `nom_complet`, puis
   recopier les données existantes.
3. **Contract** — une fois qu'aucune instance ne lit plus `nom`, et seulement alors, le
   supprimer.

C'est trois fois plus de travail, et c'est le prix d'un déploiement qui ne coupe rien.

Le piège séduit parce que **la migration est correcte** : elle produit exactement le
schéma voulu, elle passe en local, elle passe en préproduction — où l'on déploie
généralement d'un bloc, sans cohabitation. Le défaut n'apparaît que sous une condition
qu'aucun environnement de test ne reproduit : **deux versions du code en même temps.**

**Sur les autres questions.** Un `down` qui fait `DROP COLUMN` n'est pas réversible : il
restaure la **structure**, pas les **données**. Descendre puis remonter perd le contenu de
la colonne définitivement. Un `down` de ce type est un filet de sécurité pour le schéma,
jamais pour les données — et il faut l'écrire noir sur blanc dans la migration.

L'ajout d'une colonne `NOT NULL DEFAULT` sur 80 millions de lignes est le cas où
**la migration elle-même devient l'incident** : selon la base et sa version, l'opération
peut réécrire toute la table en tenant un verrou, pendant lequel plus rien n'écrit. Les
bases récentes traitent ce cas par une simple entrée de métadonnées, mais la prudence
consiste à vérifier pour **sa** version, et sinon à procéder en plusieurs temps — colonne
nullable, remplissage par lots, puis contrainte.

Enfin, deux migrations créées le même jour entrent en conflit sur leur **ordre** : deux
numéros identiques, ou deux ordres différents selon la machine. Le schéma obtenu dépend
alors de qui a fusionné en premier, ce qui est exactement ce que le versionnement devait
éviter. Les outils modernes emploient des horodatages plutôt que des compteurs pour cette
raison, et la revue de code doit traiter un conflit de migration comme un conflit de code.

**Alternative défendable.** Sur une application à une seule instance, arrêtée pendant le
déploiement, la migration directe est parfaitement acceptable : il n'y a pas de
cohabitation, donc pas de problème à résoudre. La fenêtre d'indisponibilité est le prix
payé, et il est souvent négligeable pour un outil interne. **Le motif expand/contract est
une réponse au déploiement sans coupure, pas une règle universelle.**

**Vérifie seul, sans corrigé** :
1. Prends ta dernière migration. L'ancien code aurait-il survécu à son application ? Si
   non, tu as eu une coupure que personne n'a mesurée.
2. Ton `down` restaure-t-il les données, ou seulement les colonnes ? Écris la réponse dans
   le fichier.
3. Combien de temps dure ta plus grosse migration sur un volume de production ? Si tu ne
   l'as jamais mesuré sur une copie, tu le découvriras en production.

## ⚠️ Erreurs fréquentes
- Modifier le schéma à la main en prod (non reproductible, intraçable).
- Un changement cassant en une étape sur une base vivante → l'ancien code plante pendant le
  déploiement.
- `ADD COLUMN ... NOT NULL` sans valeur par défaut sur une table peuplée → échec ou blocage.
- Backfill massif en une requête qui verrouille la table pendant des heures : traiter par lots.
- Migration sans `down` ni sauvegarde avant un changement destructif.

## 🔗 Liens avec le programme
Les migrations sont au schéma ce que Git (`/doc/lessons/git-fundamentals`) est au code, et
elles prolongent la modélisation (`/doc/lessons/database-modeling`). La compatibilité
descendante et l'expand/contract sont la version « données » de la sécurité de livraison
(`/doc/lessons/deployment-strategies`, changement cassant / breaking change). Ton projet
DocSense (mois 11) versionnera son schéma de la même façon.

## Mini-exercice
On te demande d'ajouter une colonne `email` OBLIGATOIRE et UNIQUE à une table `users` déjà
peuplée, en production, sans coupure. Écris la séquence de migrations compatibles (indice :
ajouter en nullable → backfill/collecter les emails → ajouter la contrainte NOT NULL/UNIQUE
une fois toutes les lignes remplies). Explique pourquoi l'ordre importe.

## 📚 Vocabulaire
**migration** · **up / down** · **reproductibilité** · **changement cassant / compatible** ·
**compatibilité descendante** · **expand / contract** · **backfill** · **migration de
données** · **zéro interruption**.

> **Note pratique — réel vs simulé.** La pratique associée à cette leçon s'exécute en
> JavaScript (raisonnement relationnel déterministe : les lignes sont des tableaux d'objets),
> **pas sur un vrai SGBD**. Elle entraîne le RAISONNEMENT sur les données, pas la syntaxe SQL
> réellement exécutée. AI Career OS n'embarque pas (encore) de moteur SQL — voir la décision de
> runtime dans `docs/ADR-030-curriculum-hardening-iii-and-ai-ml-debt.md`.

## 🧾 À retenir
Une base vivante évolue par migrations versionnées, committées avec le code, appliquées dans
l'ordre — le « Git du schéma ». La règle d'or est la compatibilité : le code en production doit
survivre au nouveau schéma. Les changements cassants (renommer, supprimer, contraindre) se
découpent en étapes compatibles via expand/contract (ajouter → migrer les données → retirer),
ce qui permet de déployer sans coupure ni perte de données.
