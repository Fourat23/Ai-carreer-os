<!-- keep -->
# Leçon — Systèmes distribués : ce qui casse quand on distribue

## 🌍 Le problème d'abord
Tu as mis ton système à l'échelle : plusieurs instances, une base répliquée, une file. Ça tient la
charge. Puis des bugs bizarres apparaissent : un utilisateur met à jour son profil et, en rechargeant,
voit l'ANCIENNE valeur ; un paiement est débité DEUX fois ; deux serveurs se croient « chef » en même
temps ; un message arrive avant celui qui aurait dû le précéder. Aucun de ces bugs n'existait sur une
seule machine. Dès qu'un système est DISTRIBUÉ (plusieurs machines qui se parlent par le réseau), de
nouvelles catégories de pannes apparaissent — parce que le réseau n'est pas fiable et que les machines
tombent indépendamment. Cette leçon t'apprend à les reconnaître et à raisonner leurs arbitrages.

## 🎯 Objectif
Savoir raisonner les modes de panne des systèmes distribués : réseau non fiable et **panne partielle**,
**requête dupliquée**, **ordre** des messages, **cohérence à terme (eventual consistency)** et
**retard de réplication**, modèle **leader/follower** et **split-brain**, le théorème **CAP**
correctement contextualisé, **partitionnement/hotspots**, et les **SPOF**. Niveau : raisonner en
junior solide, pas maîtriser la théorie complète.

## 🧩 Prérequis
Tu dois maîtriser la mise à l'échelle — horizontal, réplication, partitionnement, SPOF
(`/doc/lessons/system-design-scaling`) — et les transactions/concurrence
(`/doc/lessons/database-transactions-concurrency`). Le travail asynchrone et l'idempotence
(`/doc/lessons/async-messaging-queues`) éclairent la duplication et l'ordre. Aucune théorie distribuée
préalable n'est supposée.

## 🧠 Modèle mental
Sur une seule machine, tout est fiable et ordonné : la mémoire ne « ment » pas, les opérations se
suivent. Dès qu'il y a PLUSIEURS machines reliées par un réseau, trois vérités s'imposent : (1) le
**réseau échoue** (messages perdus, retardés, dupliqués, réordonnés) ; (2) une machine peut tomber
pendant qu'une autre continue (**panne partielle** : le système n'est ni totalement up ni totalement
down) ; (3) il faut du TEMPS pour que l'information se propage (les copies ne sont pas instantanément
d'accord). Concevoir distribué, c'est accepter ces vérités et choisir des ARBITRAGES conscients plutôt
que de supposer une fiabilité qui n'existe pas. « En distribué, l'échec partiel est la normalité, pas
l'exception. »

## 📚 Explication progressive

### Le réseau n'est pas fiable
Entre deux machines, un message peut être perdu, arriver en retard, arriver DEUX fois, ou dans le
DÉSORDRE. Pire : quand un appel n'obtient pas de réponse, on ne sait PAS s'il a échoué ou juste tardé
(a-t-il été traité ?). D'où le réflexe déjà vu : réessayer (retry) + rendre les opérations
**idempotentes** pour que rejouer ne double rien.

### Panne partielle
Sur une machine, soit ça marche, soit ça plante. En distribué, une PARTIE tombe (un réplica, un
service) pendant que le reste tourne. Le système doit continuer en mode dégradé plutôt que de tout
arrêter — d'où circuit breaker, timeouts, dégradation gracieuse (resilience-patterns).

### Réplication et cohérence à terme
On réplique la base pour encaisser les lectures (system-design-scaling). Mais une écriture sur le
primaire met un peu de temps à atteindre les réplicas : c'est le **retard de réplication (replication
lag)**. Conséquence : lire un réplica juste après une écriture peut renvoyer l'ANCIENNE valeur. Le
système est **cohérent à terme (eventual consistency)** : sans nouvelle écriture, toutes les copies
finissent par converger — mais pas INSTANTANÉMENT. C'est la cause du « je modifie, je recharge, je vois
l'ancien ». On l'accepte (souvent OK) ou on force la lecture sur le primaire quand la fraîcheur est
critique.

### Leader/follower et split-brain
Pour coordonner les écritures, un nœud est souvent **leader** (accepte les écritures), les autres
**followers** (répliquent). Si le réseau se coupe entre eux, deux nœuds peuvent se croire leader en
même temps : **split-brain** — deux « vérités » divergentes, corruption de données. La parade
conceptuelle est le **quorum** : une décision n'est valide que si une MAJORITÉ de nœuds est d'accord
(ainsi deux moitiés isolées ne peuvent pas toutes deux décider). Retiens le problème (split-brain) et
l'idée de la parade (majorité) ; l'implémentation exacte est un sujet avancé.

### CAP, correctement contextualisé
Le théorème **CAP** dit : en présence d'une **partition réseau** (P — des machines ne peuvent plus se
parler), un système doit choisir entre rester **Cohérent** (C — refuser de répondre avec une donnée
peut-être périmée) ou rester **Disponible** (A — répondre quand même, quitte à servir du périmé). Ce
n'est PAS « choisis 2 sur 3 en permanence » : hors partition, on a C et A ; le choix ne se pose que
PENDANT une partition. Exemple : une banque privilégie C (mieux vaut refuser que mentir sur un solde) ;
un fil d'actualité privilégie A (mieux vaut afficher un contenu un peu vieux que rien).

### Partitionnement et hotspots
Découper les données entre machines (sharding) répartit la charge — sauf si une clé concentre le
trafic (**hotspot** : une célébrité, un produit viral) : sa partition sature pendant que les autres
dorment. On choisit alors une clé de partition qui RÉPARTIT bien, et on **rééquilibre** si les données
se déséquilibrent.

## 🔬 Exemple guidé
« Je change mon avatar, je recharge, l'ancien s'affiche parfois. » Diagnostic distribué :
1. L'écriture va sur le PRIMAIRE ; la lecture tombe sur un RÉPLICA en léger retard (**replication
   lag**) → cohérence à terme.
2. Est-ce grave ? Pour un avatar, non (ça converge en une seconde). Pour un solde bancaire, oui.
3. Correctif selon la criticité : accepter (afficher un indicateur « mise à jour en cours »), OU lire
   sur le primaire juste après une écriture (« read-your-writes »), OU attendre la convergence.
Raisonnement : le bug n'est pas « aléatoire », c'est une propriété PRÉVISIBLE de la réplication ; on
choisit l'arbitrage cohérence/fraîcheur selon l'enjeu métier.

## ⚖️ Trade-offs
- Cohérence forte ↔ disponibilité/latence : lire le primaire (frais) coûte en charge et en latence ;
  lire un réplica (rapide, scalable) risque le périmé.
- Idempotence/quorum : sûreté ↔ complexité et coût de coordination.
- Sharding : scalabilité d'écriture ↔ requêtes inter-partitions et hotspots.
- Continuer en panne partielle (dégradé) ↔ garanties réduites pendant l'incident.

## ⚠️ Erreurs fréquentes / anti-patterns
- Supposer que le réseau est fiable (pas de retry/idempotence) → doublons et pannes silencieuses.
- Croire qu'une lecture juste après écriture est toujours à jour (ignorer le replication lag).
- Réciter « CAP = 2 sur 3 » sans le lier à la partition → contresens classique.
- Choisir une clé de partition qui crée des hotspots (ex. par date « aujourd'hui »).
- Ignorer le split-brain sur un système à leader (pas de quorum) → corruption.

## 🛠️ Pratique
`cloud-detect-spof` / `cloud-spof-detect` (points uniques de défaillance), `cloud-replica-count`
(réplicas), et l'idempotence côté consommateur (`queue-idempotent-consumer`) pour la duplication.
Approfondissement V38 : `replication-lag-reason` (diagnostiquer une lecture périmée). SIMULATIONS
déterministes — aucun cluster réel.

## 🧪 Vérification de compréhension
- Pourquoi une lecture juste après une écriture peut-elle renvoyer l'ancienne valeur ?
- Que signifie CAP « pendant une partition » pour une banque vs un fil d'actualité ?
- Qu'est-ce qu'un split-brain, et quelle idée (conceptuelle) l'empêche ?

## 💼 Cas professionnel
Toute architecture répliquée/partitionnée vit ces phénomènes : incohérences transitoires, doublons au
réessai, hotspots. Un ingénieur qui « pense distribué » anticipe ces modes de panne au lieu de les
découvrir en production, et choisit des arbitrages explicites.

## 🎤 Entretien
« Que se passe-t-il si on lit un réplica juste après une écriture ? » → possible lecture périmée
(replication lag) ; cohérence à terme ; forcer le primaire si la fraîcheur est critique. « CAP ? » →
pendant une partition, choisir cohérence OU disponibilité, selon l'enjeu métier.

## 📌 À retenir
Distribuer ajoute des modes de panne absents d'une seule machine : réseau non fiable (perte/retard/
duplication/désordre), panne partielle, retard de réplication (cohérence à terme), split-brain
(parade : quorum/majorité), et le choix CAP cohérence↔disponibilité PENDANT une partition. Les parades
sont déjà connues : retry + idempotence pour la duplication, arbitrage fraîcheur/cohérence pour la
réplication, clé de partition qui répartit pour les hotspots. En distribué, l'échec partiel est la
normalité — on conçoit avec, pas contre.

## 📖 Vocabulaire
**panne partielle** · **requête dupliquée** · **ordre / réordonnancement** · **réplication / retard
de réplication** · **cohérence à terme (eventual consistency)** · **leader/follower** · **split-brain**
· **quorum / majorité** · **CAP (partition → C ou A)** · **sharding / hotspot / rééquilibrage**.

## 🔗 Liens avec le programme
Cette leçon prolonge `/doc/lessons/system-design-scaling` (réplication, partitionnement, SPOF), réutilise
`/doc/lessons/async-messaging-queues` (duplication, ordre, idempotence) et `/doc/lessons/resilience-patterns`
(panne partielle, dégradation), et s'appuie sur `/doc/lessons/database-transactions-concurrency`
(cohérence). Elle complète `/doc/lessons/system-design-interview` côté raisonnement distribué.
