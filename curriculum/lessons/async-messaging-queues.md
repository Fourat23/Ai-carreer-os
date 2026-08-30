<!-- keep -->
# Leçon — Travail asynchrone : files, workers, retry et idempotence

## 🌍 Le problème d'abord
Un utilisateur téléverse une vidéo et ton API doit l'encoder, générer des miniatures, envoyer un
e-mail. Si tu fais tout ça DANS la requête HTTP, l'utilisateur attend 40 secondes, et si l'e-mail
échoue, toute l'opération échoue. Autre cas : un pic de trafic envoie 10 000 commandes en une minute,
mais ta base ne peut en traiter que 200/s — tout s'effondre. Le point commun : certaines tâches ne
doivent pas bloquer la requête, et le travail doit être LISSÉ dans le temps. La réponse est le
**travail asynchrone** : déposer une tâche dans une **file**, qu'un **worker** traitera plus tard.
Cette leçon t'apprend à raisonner ce découplage — et ses pièges.

## 🎯 Objectif
Savoir expliquer et raisonner le traitement asynchrone par messages : **file (queue)** et **worker**,
**retry** avec backoff, livraison **at-least-once** et **duplication**, **consommateur idempotent**,
**dead letter queue (DLQ)**, **ordering**, et la différence **file vs publish/subscribe**. Savoir
quand découpler par une file — et quand ce n'est pas nécessaire.

## 🧩 Prérequis
Tu dois comprendre HTTP et le cycle requête/réponse (`/doc/lessons/http-rest-json`), les bases de
performance et de cache (`/doc/lessons/caching-performance`), l'idempotence côté API
(`/doc/lessons/api-production-contracts`) et les patterns de résilience — timeout, retry, backoff
(`/doc/lessons/resilience-patterns`). Aucune expérience d'un broker (Redis/Kafka/RabbitMQ) n'est
supposée : on raisonne les CONCEPTS.

> **Réel vs simulé.** Cette leçon enseigne des concepts ; les exercices associés sont des
> **SIMULATIONS déterministes** locales (aucun vrai Redis/Kafka/RabbitMQ n'est exécuté).

## 🧠 Modèle mental
Une file est une **boîte aux lettres entre deux parties qui n'ont pas besoin d'être présentes en même
temps**. Le **producteur** (ton API) DÉPOSE un message et rend la main immédiatement ; le **worker**
(consommateur) RETIRE les messages et les traite à SON rythme. Deux bénéfices : le **découplage** (le
producteur n'attend pas le traitement) et le **lissage** (un pic est absorbé par la file, le worker
consomme au débit soutenable). La contrepartie : le traitement devient **plus tard, ailleurs, et peut
échouer ou se répéter** — d'où retry, idempotence et DLQ. « La file échange de la latence immédiate
contre de la robustesse et de l'absorption de charge. »

## 📚 Explication progressive

### Producteur, file, worker
Au lieu de tout faire dans la requête, l'API **publie** un message (« encoder la vidéo 42 ») dans une
file et répond tout de suite (« reçu, en cours »). Un ou plusieurs workers consomment la file et font
le travail. Ajouter des workers augmente le débit (parallélisme) sans toucher au producteur.

### Livraison : at-least-once et duplication
La plupart des systèmes de messages garantissent **at-least-once** : un message est livré AU MOINS une
fois — donc parfois PLUSIEURS fois (si un worker traite puis tombe avant d'accuser réception, le
message est redistribué). Conséquence directe : **le traitement peut être dupliqué**. On ne peut pas
l'empêcher totalement ; on doit le rendre INOFFENSIF.

### Le consommateur idempotent (la parade clé)
Un **consommateur idempotent** produit le même effet qu'il traite un message une ou deux fois. Comme
pour l'API (clé d'idempotence), le worker mémorise les identifiants de messages déjà traités, ou écrit
de façon idempotente (`UPSERT` par clé métier plutôt qu'`INSERT`). Ainsi, une re-livraison ne double
pas l'effet. **at-least-once + consommateur idempotent = exactly-once en pratique.**

### Retry, backoff et jitter
Si le traitement échoue (dépendance momentanément indisponible), on **réessaie** — mais pas en boucle
immédiate : un **backoff exponentiel** espace les tentatives (1s, 2s, 4s…) et un peu de **jitter**
(aléa) évite que tous les workers réessaient en même temps (voir resilience-patterns). Le retry
transforme une panne transitoire en simple délai.

### Dead Letter Queue (DLQ)
Un message qui échoue encore et encore (donnée corrompue, bug) ne doit pas boucler éternellement ni
bloquer la file. Après N tentatives, on le déplace dans une **dead letter queue** : une file « à part »
où l'on inspecte, corrige et rejoue les messages problématiques. La DLQ protège le débit et rend les
échecs VISIBLES au lieu de les cacher.

### File vs publish/subscribe
- **File (queue)** : chaque message est traité par UN SEUL consommateur (répartition du travail). Idéal
  pour « faire une tâche » (encoder, envoyer).
- **Publish/subscribe** : un message (événement) est diffusé à TOUS les abonnés intéressés. Idéal pour
  « prévenir plusieurs systèmes » (une commande passée → facturation + stock + e-mail réagissent
  chacun). L'un répartit le travail ; l'autre diffuse un fait.

### Ordering (ordre)
L'ordre n'est PAS garanti par défaut sur plusieurs workers (le message 2 peut finir avant le 1). Si
l'ordre compte (événements d'un même compte), on le garantit par PARTITION (tous les messages d'une
même clé vont au même consommateur) — au prix d'un parallélisme réduit sur cette clé.

## 🔬 Exemple guidé — un paiement de 30 €, et quatre façons de le débiter

Une file de messages garantit la **livraison au moins une fois** : tant qu'un consommateur n'a
pas accusé réception, le message lui est représenté. Cette garantie est celle qu'on veut — elle
assure qu'aucun paiement n'est perdu — et elle a une conséquence directe : **ton consommateur
verra le même message plusieurs fois.** Pas peut-être : régulièrement.

La question n'est donc pas « comment éviter les doublons ? » mais « **que se passe-t-il quand
le doublon arrive ?** ». Mesurons-le.

> Les quatre résultats sont **exécutés** par
> `scripts/v70-verifications/file-idempotence.mjs` : une file à livraison au moins une fois,
> un consommateur que l'on fait tomber à un instant choisi, et un vrai solde en base.

**Le décor.** Un compte à **100 €**, un message `{ id: 'p-42', montant: 30 }`. La réponse
attendue est **70 €**, quel que soit le nombre de re-livraisons.

### A. Le consommateur naïf

```js
function traiter(m) {
  db.run('UPDATE comptes SET solde = solde - ? WHERE id = 1', m.montant);
  accuserReception(m);          // ← le worker tombe parfois avant d'arriver ici
}
```

Le worker tombe deux fois juste après le débit, avant l'accusé de réception.

```
livraisons = 3      solde = 10 €      ← DÉBIT MULTIPLE
```

Trois débits de 30 € pour un seul paiement. Aucun bug dans le code : il fait exactement ce
qu'on lui demande, trois fois. Le défaut n'est pas dans le traitement, il est dans
l'**hypothèse** — celle qu'un message n'arrive qu'une fois.

### B. Le consommateur idempotent

On mémorise les messages déjà traités :

```js
function traiter(m) {
  if (dejaTraite(m.id)) return;                                        // rien à refaire
  db.run('UPDATE comptes SET solde = solde - ? WHERE id = 1', m.montant);
  db.run('INSERT INTO traites VALUES (?)', m.id);
  accuserReception(m);
}
```

Sans panne : `livraisons = 1`, `solde = 70 €`. Correct.

**Idempotent** veut dire exactement cela : *rejouer l'opération ne change pas le résultat.* Ce
n'est pas « refuser les doublons », c'est « les traiter sans effet supplémentaire ».

### C. Le même code, avec une panne au mauvais moment

Faisons tomber le worker **entre** le débit et le marquage — deux lignes consécutives, un
intervalle de quelques microsecondes.

```
livraisons = 2      solde = 40 €      ← DÉBIT MULTIPLE
```

Le compte a été débité deux fois, **malgré** le contrôle d'idempotence.

Déroulons :

| Temps | Ce qui se passe | Solde | Table `traites` |
|---|---|---|---|
| 1 | débit de 30 | 70 | vide |
| 2 | **le worker tombe** | 70 | vide |
| 3 | le message est re-livré | 70 | vide |
| 4 | `dejaTraite('p-42')` → **non** | 70 | vide |
| 5 | débit de 30 | **40** | vide |

Le marquage n'a jamais eu lieu, donc le contrôle ne pouvait rien voir. **L'effet et la preuve
de l'effet n'étaient pas solidaires.**

C'est le point le plus important de cette leçon, et celui qui manque dans la plupart des
réponses d'entretien : *« mon consommateur est idempotent »* ne suffit pas. Il faut préciser
**comment** l'idempotence est enregistrée, et si elle l'est **en même temps** que l'effet.

### D. La correction : une seule transaction

```js
db.exec('BEGIN');
db.run('UPDATE comptes SET solde = solde - ? WHERE id = 1', m.montant);
db.run('INSERT INTO traites VALUES (?)', m.id);
db.exec('COMMIT');
accuserReception(m);
```

```
livraisons = 2      solde = 70 €
```

Deux livraisons, un seul débit. La panne survient toujours au même endroit, mais elle annule
maintenant **les deux** écritures d'un coup : la re-livraison repart d'un état propre, où rien
n'a été fait ni marqué.

La règle qui en découle, et elle est générale : **l'effet et sa trace doivent être commis
ensemble, ou pas du tout.** Si l'effet est dans la base, la trace doit être dans la même base
et la même transaction. Si l'effet est ailleurs — un appel à un prestataire de paiement — il
faut un mécanisme d'idempotence **chez lui** (la clé d'idempotence de
`/doc/lessons/api-production-contracts`), parce qu'aucune transaction locale ne peut annuler un
débit déjà effectué à l'extérieur.

### Le message empoisonné

Dernier cas : un message dont les données sont corrompues et qui échouera toujours. Deux
messages dans la file, `p-99` (corrompu) et `p-100` (sain), cinq tentatives autorisées :

```
livraisons = 6
file d'attente d'échecs = [{ id: 'p-99', tentatives: 5 }]
solde = 80          ← p-100 a bien été traité
```

Après cinq échecs, `p-99` est déplacé dans une **file d'attente d'échecs** (souvent appelée
*dead letter queue*, DLQ) — une file à part, où il attend qu'un humain l'examine. Et surtout :
`p-100` **a été traité**, le solde le prouve.

Sans ce mécanisme, `p-99` serait re-livré indéfiniment, occuperait le consommateur, et
bloquerait tout ce qui le suit. Un seul message malformé suffit alors à immobiliser un système
entier — c'est une panne classique, et son nom dit bien ce qu'elle fait.

Deux garde-fous vont ensemble : **un compteur de tentatives borné** et **une destination pour
les abandons**. Le second sans le premier ne se déclenche jamais ; le premier sans le second
perd silencieusement des paiements.

### Ce qu'il faut retenir de la mesure

| Question | Réponse |
|---|---|
| Mon message sera-t-il livré plusieurs fois ? | oui, régulièrement |
| L'idempotence suffit-elle ? | non — seulement si effet et marquage sont atomiques |
| Que faire d'un message qui échoue toujours ? | le borner et le sortir de la file |
| Ai-je le droit de supposer l'ordre ? | non, sauf partitionnement explicite par clé |

Et la formulation à garder : **une file ne promet pas « une fois », elle promet « au moins une
fois ».** Tout ce qui suit découle de cette phrase.

## ⚖️ Trade-offs
- File vs synchrone : robustesse/absorption de charge ↔ latence (le résultat n'est pas immédiat) et
  complexité (état, idempotence, supervision).
- at-least-once vs at-most-once : ne rien perdre (mais gérer les doublons) ↔ ne jamais doubler (mais
  risque de perdre). At-least-once + idempotence est le choix pragmatique dominant.
- Ordering strict : cohérence ↔ parallélisme réduit (partition par clé).
- File vs pub/sub : répartir un travail ↔ diffuser un événement à plusieurs systèmes.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ton worker consomme une file de paiements. Il traite un message puis tombe avant
   d'accuser réception. Que se passe-t-il, et combien de fois le client est-il débité ?
2. Un message échoue systématiquement — données malformées. Ton worker le rejette et le
   remet en file. Que devient ta file ?
3. Tu passes de un à cinq workers pour aller plus vite. Les messages sont-ils encore
   traités dans l'ordre ?
4. L'API publie dans la file puis écrit en base. La publication réussit, l'écriture
   échoue. Quel est l'état du système ?

## ✅ Correction attendue

**La démarche.** Une file échange une garantie contre une autre : on gagne le découplage
et la reprise, on perd l'ordre strict et l'unicité. Concevoir avec une file, c'est
concevoir **pour** ces pertes.

**L'erreur probable : traiter la duplication comme un défaut à corriger.** Le premier
réflexe, quand on découvre qu'un message peut arriver deux fois, est de chercher comment
l'empêcher — un accusé de réception plus rapide, une transaction, un verrou.

**On ne peut pas.** Le worker doit traiter puis accuser réception ; entre les deux, il
existe toujours un instant où il peut tomber. Accuser d'abord ne résout rien : on perdrait
alors des messages, ce qui est pire. Le choix n'est pas entre duplication et perfection,
il est **entre duplication et perte** — et pour un paiement, on préfère mille fois un
débit à traiter en double qu'un débit oublié.

D'où le renversement qui est le cœur du sujet : **on ne cherche pas à empêcher le doublon,
on le rend sans effet.** Le worker note l'identifiant des messages déjà traités, ou écrit
de façon naturellement idempotente — un `UPSERT` sur une clé métier plutôt qu'un `INSERT`,
un débit enregistré sous la référence unique de la transaction. Le message peut alors
arriver dix fois : le neuvième et le dixième ne font rien.

Le piège séduit parce que **« au moins une fois » se lit comme une imperfection
technique**, une limite qu'un meilleur système corrigerait. On cherche donc la
configuration ou la bibliothèque qui donnerait « exactement une fois ». Or c'est une
propriété du monde, pas de l'outil : dès qu'un accusé de réception traverse un réseau, il
peut se perdre, et l'émetteur ne peut pas distinguer « perdu avant » de « perdu après ».
Les systèmes qui annoncent « exactly-once » font exactement ce qui est décrit ici — de la
déduplication — simplement à un autre endroit.

**Sur les autres questions.** Le message systématiquement en échec, rejeté et remis en
file, produit une **boucle infinie** : il revient, échoue, revient. Il consomme les workers,
retarde tous les autres messages, et peut à lui seul paralyser la file — c'est le
*poison message*. La parade est une **file de rebut** (*dead letter queue*) : après N
tentatives, le message est mis de côté pour inspection humaine, et la file principale
repart. Sans elle, un seul message malformé arrête le système.

Passer à cinq workers **perd l'ordre global**, définitivement : cinq consommateurs tirent
en parallèle et terminent quand ils terminent. Si l'ordre compte pour un sous-ensemble —
tous les événements d'un même client — la solution n'est pas de revenir à un worker, mais
de **partitionner par clé** : tous les messages d'un client donné vont sur la même
partition, donc au même consommateur. On garde le parallélisme entre clients et l'ordre à
l'intérieur de chacun.

Enfin, publier puis écrire en base laisse le système **incohérent** : un message annonce
un travail dont la base n'a aucune trace. C'est le problème de la double écriture, et il
n'a pas de solution simple — deux systèmes ne peuvent pas être commités ensemble. Le motif
usuel est la **boîte d'envoi transactionnelle** (*outbox*) : on écrit le message dans une
table de la même base, **dans la même transaction** que la donnée métier, et un processus
séparé le publie ensuite. Une seule transaction, donc plus de désaccord possible.

**Alternative défendable.** Pour un traitement court et non critique — envoyer un e-mail
de bienvenue — le faire de façon synchrone dans la requête est souvent supérieur : pas de
file à exploiter, pas d'idempotence à écrire, pas de file de rebut à surveiller. Une file
est une infrastructure ; elle se justifie par un besoin de découplage, de débit ou de
reprise, pas par principe.

**Vérifie seul, sans corrigé** :
1. Rejoue deux fois le même message dans ton worker. L'effet est-il identique ? Sinon, tu
   as un doublon en attente d'un redémarrage.
2. Ta file a-t-elle une file de rebut ? Sinon, un seul message malformé peut l'arrêter.
3. Publies-tu un message et écris-tu en base dans la même opération ? Si oui, cherche
   laquelle des deux peut échouer seule.

## ⚠️ Erreurs fréquentes / anti-patterns
- Consommateur NON idempotent sur une livraison at-least-once → effets doublés (paiements, e-mails).
- Retry immédiat en boucle sans backoff → retry storm qui aggrave la panne.
- Pas de DLQ → un message empoisonné bloque la file ou boucle à l'infini.
- Supposer l'ordre global sur plusieurs workers → bugs dépendant de l'ordre.
- Tout passer en asynchrone « par principe » → latence et complexité inutiles pour une tâche courte.

## 🛠️ Pratique
`queue-idempotent-consumer` (rendre un consommateur idempotent), `dlq-duplicate` (compter les effets
réels sous re-livraison / router vers DLQ). Incident associé : playbook `queue-backlog` (file qui
accumule du retard). SIMULATIONS déterministes — aucun vrai broker.
**Auto-évaluation** : teste ta compréhension par niveau (jusqu'au transfert) sur `/diagnostics`
(diagnostic « Travail asynchrone : files, workers et DLQ »).

## 🧪 Vérification de compréhension
- Pourquoi une livraison at-least-once impose-t-elle un consommateur idempotent ?
- Un message échoue 20 fois d'affilée : que doit-il devenir, et pourquoi pas rester dans la file ?
- File ou pub/sub pour « prévenir facturation, stock et e-mail qu'une commande est passée » ?

## 💼 Cas professionnel
Encodage vidéo, envoi d'e-mails, génération de rapports, propagation d'événements entre services :
partout où bloquer la requête serait inacceptable ou où il faut absorber des pics. Les files sont la
colonne vertébrale des architectures orientées événements.

## 🎤 Entretien
« at-least-once, ça veut dire quoi pour ton code ? » → que le consommateur DOIT être idempotent. « À
quoi sert une DLQ ? » → isoler les messages qui échouent en boucle pour ne pas bloquer la file et les
traiter à part.

## 📌 À retenir
Le travail asynchrone découple (le producteur n'attend pas) et lisse la charge (le worker consomme à
son rythme), au prix d'un traitement « plus tard, ailleurs, et rejouable ». La livraison est
généralement at-least-once → rends le consommateur IDEMPOTENT. Réessaie avec backoff+jitter, isole les
messages empoisonnés en DLQ, ne suppose pas l'ordre global (partitionne par clé si besoin), et choisis
file (répartir un travail) vs pub/sub (diffuser un événement).

## 📖 Vocabulaire
**file (queue)** · **producteur / worker (consommateur)** · **at-least-once / duplication** ·
**consommateur idempotent** · **retry / backoff / jitter** · **dead letter queue (DLQ)** ·
**publish/subscribe** · **ordering / partition** · **découplage / lissage de charge**.

## 🔗 Liens avec le programme
Cette leçon prolonge `/doc/lessons/caching-performance` (latence) et `/doc/lessons/api-production-contracts`
(l'idempotence, côté consommateur cette fois), réutilise `/doc/lessons/resilience-patterns` (retry,
backoff, jitter — sans les redéfinir), et prépare les fondations de mise à l'échelle (la file comme
brique d'absorption de charge) et les systèmes distribués (duplication, ordre, cohérence à terme).
