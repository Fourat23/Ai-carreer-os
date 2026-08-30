<!-- keep -->
# Leçon — Patterns de résilience : survivre aux pannes des autres

## 🌍 Le problème d'abord
Ton service dépend d'un autre service (un paiement, une API externe, une base). Un
jour, CET autre service ralentit ou tombe. Sans précaution, voici ce qui se passe :
tes requêtes attendent la réponse qui ne vient pas, tes connexions s'accumulent, ta
mémoire se remplit, et TON service tombe à son tour — à cause de la panne de
QUELQU'UN D'AUTRE. Une petite panne locale devient une panne générale : c'est une
**panne en cascade**. La résilience, c'est l'art de ne PAS s'effondrer quand une
dépendance flanche. Cette leçon présente les patterns qui contiennent les pannes :
timeout, retry, circuit breaker, backpressure, dégradation gracieuse, redondance.

## 🎯 Objectif
Connaître les principaux **patterns de résilience** (timeout, retry avec backoff,
circuit breaker, backpressure, rate limiting, load shedding, graceful degradation,
failover, redondance) et savoir quand les appliquer pour éviter les pannes en
cascade ; comprendre **SPOF**, **RTO** et **RPO**.

## 🧩 Prérequis
Tu dois comprendre qu'un service en **appelle** d'autres (chaîne de dépendances —
`/doc/lessons/networking-proxy-loadbalancing`, `/doc/lessons/distributed-tracing`) et
savoir repérer une lenteur (`/doc/lessons/metrics-percentiles`). La disponibilité et
la redondance sont introduites ici.

## 🧠 Modèle mental
Pense à un système électrique. Un **fusible** (circuit breaker) coupe le courant quand
une partie déraille, pour protéger le reste de la maison au lieu de tout griller. Un
**disjoncteur différentiel**, des **prises multiples avec limite**, un **groupe
électrogène** de secours (failover)… ce sont des mécanismes pour qu'une panne locale
reste locale. En logiciel, c'est pareil : on ajoute des « fusibles » entre les
composants pour qu'une dépendance défaillante n'emporte pas tout le système.

## 📖 Explication progressive
**Timeout.** Ne JAMAIS attendre indéfiniment une réponse. Un **timeout** fixe une
durée max ; passé ce délai, on abandonne l'appel et on libère les ressources. Sans
timeout, une dépendance lente bloque tes threads/connexions jusqu'à l'épuisement →
cascade. C'est la protection la plus fondamentale.

**Retry avec backoff (et prudence).** Réessayer un appel qui a échoué PEUT aider (si
l'erreur était transitoire), mais mal fait, ça AGGRAVE : réessayer immédiatement et en
boucle pendant une panne, c'est ajouter de la charge à un service déjà à terre (effet
« troupeau »). Règles : n'utiliser le retry que sur des opérations **idempotentes**,
espacer les tentatives (**exponential backoff** + jitter), et limiter leur nombre.

**Circuit breaker (disjoncteur).** Si un service échoue de façon répétée, on OUVRE le
circuit : on arrête de l'appeler pendant un moment et on échoue vite (ou on dégrade),
au lieu d'attendre à chaque fois. Après un délai, on teste prudemment s'il est
revenu. Cela protège À LA FOIS l'appelant (qui ne s'épuise pas) et l'appelé (qui n'est
pas achevé par le trafic).

**Backpressure et load shedding.** Quand la demande dépasse la capacité, deux
réflexes : la **backpressure** (ralentir/refuser d'accepter plus de travail que ce
qu'on peut traiter, pour ne pas exploser la mémoire/les files) et le **load shedding**
(rejeter délibérément une partie du trafic — souvent le moins prioritaire — pour
préserver le reste). Mieux vaut refuser proprement 10 % que s'écrouler à 100 %.

**Rate limiting.** Limiter le nombre de requêtes par client/période : protège des abus
et des pics, garantit une part équitable. C'est un garde-fou d'entrée.

**Graceful degradation.** Plutôt que tomber, offrir une version DÉGRADÉE : si le
service de recommandations est down, afficher la page SANS recommandations plutôt
qu'une erreur. L'utilisateur garde l'essentiel. Cela suppose d'avoir identifié ce qui
est optionnel vs critique.

**Redondance, failover, SPOF.** Un **SPOF** (Single Point Of Failure) est un composant
unique dont la panne fait tout tomber (une seule base, une seule instance, une seule
zone). On le supprime par la **redondance** (plusieurs instances/zones) et le
**failover** (bascule automatique vers un exemplaire sain). Le multi-zone (vu en
cloud) est du failover d'infrastructure.

**RTO et RPO.** Deux objectifs de reprise après sinistre : le **RTO** (Recovery Time
Objective) = en combien de temps on doit être rétabli ; le **RPO** (Recovery Point
Objective) = combien de données on accepte de perdre (fréquence des sauvegardes). Ils
guident les choix de redondance et de sauvegarde.

## 🔎 Décomposition
- timeout = ne pas attendre l'infini ; retry = réessayer (idempotent + backoff) ;
  circuit breaker = arrêter d'appeler un service à terre.
- backpressure/load shedding/rate limiting = gérer la surcharge.
- graceful degradation = offrir moins plutôt que rien.
- redondance/failover suppriment les SPOF ; RTO/RPO cadrent la reprise.

## 🛠 Exemple guidé — 6 600 ms d'attente, 600 appels, et comment tomber à 5

Le service de paiement d'un prestataire passe de 100 ms à ne plus répondre du tout. Ton
service, lui, n'a aucun bug. Voyons ce qu'il devient — en chiffres.

> Les valeurs sont produites par `scripts/v70-verifications/disjoncteur-et-attente.mjs`.
> **Limite déclarée :** le temps y est simulé par une horloge virtuelle, pour que le script
> s'exécute instantanément. Les durées publiées sont donc celles du **modèle** — mais le
> modèle, lui, est le comportement exact de tes protections, et c'est ce qu'on cherche à
> comprendre.

### Étape 1 — sans rien : l'attente infinie

Ton code appelle le paiement, sans délai d'attente. Le prestataire ne répond pas. Ton fil
d'exécution attend. Une seconde requête arrive, un autre fil attend. Puis dix, puis cent.

Au bout de quelques minutes, ton service ne répond plus **à rien** — pas même à la page
d'accueil, qui n'a pourtant aucun rapport avec le paiement. Rien chez toi n'est en panne : tous
tes fils sont simplement occupés à attendre quelqu'un d'autre.

C'est la panne en cascade, et elle mérite d'être nommée précisément : **ce n'est pas la panne
du prestataire qui t'a mis à terre, c'est ton absence de limite.**

### Étape 2 — le délai d'attente : calculons ce qu'il coûte

On borne l'appel à **2 secondes**, avec **3 tentatives** et un recul exponentiel de 200 ms.
Question — et c'est une vraie question d'entretien : **quel est le temps d'attente maximal vu
par l'utilisateur ?**

```
3 tentatives × 2 000 ms   = 6 000 ms d'appels
+ reculs : 200 + 400      =   600 ms d'attente entre les tentatives
                          ------------
                            6 600 ms
```

Mesure : **6 600 ms**. Le calcul et le modèle concordent exactement.

Six secondes et demie. Devant un formulaire de paiement, c'est très long — beaucoup
d'utilisateurs auront cliqué une seconde fois avant la fin, ce qui crée les doublons dont
parle `/doc/lessons/api-production-contracts`.

Et voilà le premier enseignement : **le délai d'attente ne se choisit pas seul.** Un délai de
2 s paraît prudent ; multiplié par les tentatives et augmenté des reculs, il donne 6,6 s. La
bonne façon de raisonner est inverse : *je m'autorise 3 secondes de bout en bout, donc je peux
faire deux tentatives d'une seconde, ou une seule de deux secondes et demie.* Le budget total
est la contrainte ; les tentatives s'y logent.

### Étape 3 — ce que subit une dépendance déjà tombée

Passons à l'échelle. La dépendance est **complètement** tombée, et 200 requêtes utilisateur
arrivent, à raison de 20 par seconde.

```
sans disjoncteur :
  appels reçus par la dépendance : 600
  attente moyenne par requête    : 6 600 ms
```

**Six cents appels.** Trois par requête, sur 200 requêtes. Chaque utilisateur attend 6,6
secondes pour recevoir une erreur.

Regarde ce nombre du point de vue du prestataire : il est en train de tomber, et tu lui
envoies **trois fois plus de trafic que d'habitude**. Tes tentatives ne l'aident pas à se
relever ; elles l'en empêchent. Si tous ses clients font pareil — et ils le font — le service
ne redémarre jamais, parce qu'il est submergé dès qu'il reprend son souffle.

Deuxième enseignement, contre-intuitif : **réessayer contre un service en panne aggrave la
panne.** La nouvelle tentative est faite pour les défaillances *passagères*, pas pour les
pannes franches.

### Étape 4 — le disjoncteur

Un **disjoncteur** compte les échecs. Au-delà d'un seuil, il s'ouvre : pendant un temps donné,
il ne laisse plus passer un seul appel et échoue immédiatement. Après ce délai, il laisse
passer une requête d'essai — si elle réussit, il se referme.

Mêmes 200 requêtes, seuil de 5 échecs, ouverture de 30 secondes :

| | Sans disjoncteur | Avec disjoncteur |
|---|---:|---:|
| appels reçus par la dépendance | **600** | **5** |
| attente moyenne par requête | 6 600 ms | **56 ms** |
| pire attente | 6 600 ms | 6 600 ms |
| échecs immédiats | 0 | 199 |

Trois lectures, dans l'ordre d'importance.

**5 appels au lieu de 600.** Les cinq premiers échouent, le disjoncteur s'ouvre, et la
dépendance cesse de recevoir du trafic. Elle a maintenant une chance de se rétablir. Le
disjoncteur protège **la dépendance autant que toi** — c'est l'aspect que la plupart des
présentations omettent.

**56 ms d'attente moyenne au lieu de 6 600.** Cent dix-huit fois moins. L'utilisateur reçoit
une erreur claire presque instantanément, au lieu de regarder un indicateur de chargement
pendant sept secondes pour obtenir la même erreur. **Échouer vite est un service rendu**, pas
un aveu de faiblesse.

**La pire attente reste 6 600 ms.** C'est la ligne honnête du tableau : la toute première
requête, celle qui découvre la panne, paie le prix fort. Le disjoncteur ne supprime pas la
première douleur — il empêche qu'elle se répète deux cents fois. Aucune protection n'est
gratuite ni totale, et le dire fait partie de la compétence.

### Étape 5 — que voit l'utilisateur

Une erreur rapide reste une erreur. La dernière protection est de choisir **ce qui reste
possible** :

| Réponse | Ce que l'utilisateur peut faire |
|---|---|
| « Une erreur est survenue » | rien — il quitte |
| « Le paiement est momentanément indisponible » | attendre, revenir plus tard |
| « Votre commande est enregistrée, le paiement sera relancé automatiquement ; vous recevrez une confirmation » | **rien à faire — et il a acheté** |

La troisième ligne est un vrai mode dégradé : la commande est prise, le paiement passe en file
d'attente, l'utilisateur est prévenu. Le service de paiement est tombé et **la vente a eu
lieu**.

C'est le critère qui distingue un mode dégradé d'une panne polie : *l'utilisateur peut-il
terminer ce qu'il était venu faire ?*

### Les quatre protections, et l'ordre dans lequel elles se posent

| # | Protection | Ce qu'elle empêche |
|---|---|---|
| 1 | **délai d'attente** | que la lenteur d'un tiers devienne ta panne |
| 2 | **tentatives bornées + recul** | qu'un incident passager devienne visible pour l'utilisateur |
| 3 | **disjoncteur** | que tes tentatives empêchent le tiers de se relever |
| 4 | **mode dégradé** | que la panne d'une fonction devienne la panne du produit |

L'ordre n'est pas décoratif : sans le 1, rien d'autre ne peut fonctionner — on ne compte pas
les échecs de quelque chose qui n'échoue jamais parce qu'il attend indéfiniment. Le délai
d'attente est la protection fondatrice, et c'est celle qui manque le plus souvent.

## 🧪 Mise en pratique
Voir la pratique associée : détecter un SPOF, vérifier la redondance multi-zone,
raisonner RTO/RPO, décider d'une reprise.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ton service appelle une dépendance avec un timeout de 2 s, trois tentatives et un
   backoff exponentiel. Quel est le temps d'attente maximal vu par l'utilisateur ?
2. Une dépendance tombe complètement. Ton retry est-il utile ? Que fait-il au service
   en panne ?
3. Tu ajoutes un circuit breaker devant une dépendance. Quel comportement nouveau
   ton service doit-il désormais savoir produire, et qui doit l'écrire ?
4. Un timeout et un retry protègent l'appelant. Lequel des motifs de cette leçon
   protège l'appelé ?

## ✅ Correction attendue

**La démarche.** Chaque motif répond à une panne précise et en crée une autre. Les
poser, c'est choisir quelle défaillance on préfère — jamais les supprimer toutes.

**L'erreur probable : additionner les protections sans additionner leurs délais.** La
première question a une réponse que presque personne ne calcule avant de la voir en
production :

```
tentative 1 : 2 s de timeout   puis attente 1 s
tentative 2 : 2 s de timeout   puis attente 2 s
tentative 3 : 2 s de timeout
                              ──────────────────
total                          9 s
```

**Neuf secondes.** L'utilisateur a quitté la page depuis longtemps, et pendant ces neuf
secondes le thread — ou la connexion — reste occupé. Le timeout de 2 s avait
précisément pour but d'éviter cela ; le retry vient de le multiplier par 4,5 sans que
personne ne le décide.

Le piège séduit parce que **chaque motif est individuellement correct**. Le timeout est
recommandé, le retry est recommandé, le backoff est recommandé. On les empile en toute
bonne foi, chacun documenté, et l'on obtient un comportement que personne n'a choisi.
C'est le mode de défaillance propre aux bonnes pratiques : elles s'ajoutent, leurs
effets se multiplient.

Le repère : **un budget de temps global**, décidé en premier et imposé à tout
l'enchaînement. « Cet appel dispose de 3 secondes, retries compris » — puis on en
déduit le timeout unitaire et le nombre de tentatives, dans cet ordre. Le raisonnement
part de ce que l'utilisateur peut supporter, pas de ce que chaque motif recommande.

**Sur les autres questions.** Face à une dépendance **complètement** tombée, le retry
est non seulement inutile — elle ne répondra pas davantage à la troisième tentative —
mais nuisible : il triple la charge sur un service déjà à terre, et retarde son
redémarrage. C'est l'effet de troupeau, et c'est pourquoi le circuit breaker existe :
il est la reconnaissance qu'à partir d'un certain point, **la meilleure aide qu'on
puisse apporter à un service en panne est d'arrêter de l'appeler.**

Ajouter un circuit breaker oblige le service à savoir répondre **quand le circuit est
ouvert** — c'est-à-dire immédiatement, sans la dépendance. Ce chemin de code n'existe
généralement pas, et c'est le vrai coût du motif : il ne s'installe pas dans la
configuration, il s'écrit dans le métier. Qui doit l'écrire ? Celui qui sait ce qui est
optionnel : afficher la page sans les recommandations est une décision produit, pas une
décision d'infrastructure.

Et le motif qui protège l'**appelé** plutôt que l'appelant : le **rate limiting** en
entrée, et le **load shedding** quand la capacité est dépassée. Le circuit breaker
protège les deux à la fois, ce qui explique sa popularité.

**Alternative défendable.** Sur beaucoup de systèmes, **un timeout court et zéro
retry** est un meilleur choix que la panoplie complète : échouer vite, laisser
l'utilisateur ou la file de messages réessayer, et garder un comportement qu'on peut
prédire de tête. La résilience se paie en complexité, et un système simple dont on
comprend les défaillances est souvent plus disponible qu'un système protégé dont
personne ne sait ce qu'il fait sous charge.

**Vérifie seul, sans corrigé** :
1. Calcule le temps d'attente maximal réel de ton appel le plus critique, retries et
   backoff compris. Compare-le à ce que ton utilisateur accepte.
2. Coupe une dépendance non critique en local. Ton service affiche-t-il une version
   dégradée, ou une erreur ? Si c'est une erreur, le chemin dégradé n'existe pas.
3. Tes retries s'appliquent-ils à des opérations **idempotentes** ? Un `POST` de
   paiement rejoué trois fois est un problème plus grave que la panne qu'on évitait.

## ⚠️ Erreurs fréquentes / anti-patterns
- **Pas de timeout** → une dépendance lente épuise tout (cascade).
- **Retry agressif** (immédiat, illimité, non idempotent) → on achève le service
  déjà en difficulté.
- Aucun **circuit breaker** → on continue d'appeler un service mort.
- Ignorer les **SPOF** (une seule instance/zone/base).
- Tomber complètement au lieu de **dégrader gracieusement**.
- Confondre **RTO** (temps) et **RPO** (données perdues).

## 🏢 Cas métier
Une panne d'un service tiers de 3 minutes a provoqué 40 minutes d'indisponibilité
TOTALE : sans timeout ni circuit breaker, les appels bloqués ont saturé le service
principal, qui est tombé à son tour. Après ajout de timeouts, d'un circuit breaker et
d'une dégradation gracieuse, la même panne tierce devient invisible pour l'utilisateur
(fonctionnalité optionnelle masquée quelques minutes).

## 🚨 Que faire dans ce cas ? — « une dépendance critique est lente/instable »
- **Observer** : trace + métriques localisent la dépendance fautive.
- **Limiter l'impact** : timeout serré, circuit breaker, dégradation gracieuse de la
  partie optionnelle.
- **Corriger** : cache, appel asynchrone hors chemin critique, ou repli.
- **Prévenir** : suivre la latence/erreurs de chaque dépendance ; tester la
  résilience (que se passe-t-il si X tombe ?) ; supprimer les SPOF.

## 🔥 Pratique — provoquer les pannes, puis les absorber

**A. La dépendance qui tombe.** Fabrique un service qui appelle une dépendance,
et fais tomber la dépendance. Compte les appels émis pendant la panne et mesure
le temps d'attente moyen. Livrable : les deux nombres.

**B. Le délai d'attente.** Ajoute un délai maximal d'attente. Compare le temps
d'attente moyen avant et après. Livrable : les deux valeurs, et ce qui décide de
la durée choisie.

**C. Le disjoncteur.** Ajoute un disjoncteur qui s'ouvre après N échecs. Compte
les appels émis vers la dépendance en panne, et le temps d'attente moyen.
Livrable : les nombres, et le rapport avec A.

**D. La reprise, et ce qu'elle aggrave.** Ajoute une reprise sur échec sans
délai, puis avec un délai croissant et une part d'aléatoire. Mesure la charge
imposée à la dépendance au moment où elle revient. Livrable : les trois charges.

**E. La dégradation.** Fais en sorte que ton service rende un résultat utile même
quand la dépendance est morte. Livrable : ce que tu rends, et ce que l'appelant
peut en faire.

## ✅ Correction attendue

> Les valeurs de A et C sont **mesurées** par
> `scripts/v70-verifications/disjoncteur-et-attente.mjs`.

**A — sans protection.** Mesuré : **600 appels** émis vers un service en panne, et
un temps d'attente moyen de **6600 ms**.

Deux dégâts distincts, et il faut les séparer. Le service en panne reçoit 600
appels qu'il ne peut pas servir — ce qui l'empêche de se rétablir. Et l'appelant
immobilise une ressource pendant 6,6 secondes par appel : ses fils d'exécution,
ses connexions, sa mémoire. **La panne se propage vers le haut**, et c'est ainsi
qu'une dépendance secondaire fait tomber tout un système.

**B — le délai d'attente.** Le point de conception : **une absence de délai
maximal est un délai infini**, et c'est presque toujours le défaut des clients
HTTP et des pilotes de base de données. Il faut le poser explicitement.

Ce qui décide de sa durée : le centile 99 de la latence normale de la dépendance,
plus une marge. Trop court, on abandonne des requêtes qui allaient aboutir ; trop
long, on immobilise des ressources pour rien. **La valeur se mesure, elle ne se
choisit pas au hasard** — et elle se remesure quand la dépendance change.

**C — le disjoncteur.** Mesuré : **5 appels** au lieu de 600, et **56 ms** de
temps d'attente moyen au lieu de 6600. Un facteur 120 sur les appels, un facteur
118 sur l'attente.

Le mécanisme à énoncer : après N échecs, le disjoncteur **cesse d'essayer** et
échoue immédiatement, sans toucher le réseau. Périodiquement, il laisse passer un
appel de test pour savoir si le service est revenu.

Ce qu'il achète et qu'un simple délai d'attente n'achète pas : il protège
**l'appelant** de l'épuisement de ses ressources, et il protège **l'appelé** de la
charge qui l'empêche de se rétablir. C'est le seul motif qui traite les deux
côtés.

Sa contrepartie doit être dite : un disjoncteur ouvert refuse aussi les requêtes
qui **auraient pu** réussir. C'est un choix assumé — échouer vite et pour tout le
monde plutôt que lentement et pour une partie.

**D — la reprise, et l'effet de troupeau.** La reprise sans délai est le pire des
trois cas, et pour une raison contre-intuitive : au moment où le service revient,
**tous les clients réessaient simultanément** et le remettent immédiatement à
terre. Une panne de trente secondes devient une panne de dix minutes, par
oscillation.

Le délai croissant réduit la fréquence. Mais il ne suffit pas seul : si tous les
clients ont commencé à échouer au même instant, leurs délais doublent en cadence
et ils réessaient **encore** simultanément. C'est la part d'aléatoire qui casse la
synchronisation, et c'est l'élément qu'on omet presque toujours.

La règle complète tient en trois mots : **délai croissant, plafonné, aléatoire.**
Sans plafond, un client qui a échoué quinze fois attend des heures et ne se
rétablit jamais d'une panne pourtant réparée.

Et une exigence qui prime sur tout : **ne réessayer que ce qui est
réessayable.** Une opération non idempotente rejouée peut débiter deux fois. C'est
le mécanisme de clé d'idempotence de `http-rest-json`, et il est la condition de
la reprise, pas une option.

**E — la dégradation.** Le principe : **une réponse dégradée mais annoncée vaut
mieux qu'une erreur.** Des recommandations génériques plutôt que personnalisées,
un prix en cache plutôt qu'aucun prix, une liste sans le compteur.

La condition est dans le mot « annoncée » : l'appelant doit **savoir** que la
réponse est dégradée, sinon il traite une donnée périmée comme une donnée fraîche
et le défaut devient silencieux. Un champ explicite dans la réponse, ou un
en-tête.

Ce que la dégradation exige à la conception : avoir décidé **à l'avance** ce qui
est essentiel et ce qui est accessoire. Cette décision ne se prend pas pendant
l'incident, et elle est métier avant d'être technique.

## 🎤 Questions d'entretien
- « À quoi sert un circuit breaker ? » → arrêter d'appeler un service défaillant pour
  éviter l'épuisement et une cascade.
- « Pourquoi un retry peut aggraver un incident ? » → il ajoute de la charge à un
  service déjà à terre (préférer backoff + idempotence + limite).
- « RTO vs RPO ? » → temps de rétablissement visé vs quantité de données qu'on
  accepte de perdre.

## ✅ À retenir
- Timeout d'abord : ne jamais attendre l'infini.
- Retry seulement idempotent, avec backoff et limite.
- Circuit breaker pour ne pas s'épuiser sur un service mort.
- Backpressure/load shedding/rate limiting gèrent la surcharge ; dégrader > tomber.
- Redondance/failover suppriment les SPOF ; RTO (temps) et RPO (données) cadrent la
  reprise.

## 📚 Vocabulaire
**résilience** · **timeout** · **retry / backoff / jitter** · **circuit breaker** ·
**backpressure** · **load shedding** · **rate limiting** · **graceful degradation** ·
**redondance / failover** · **SPOF** · **RTO / RPO** · **panne en cascade**.

## 🎯 Pratique associée
Exercices : détection de SPOF, multi-zone, RTO/RPO, décision de reprise.

## 🔗 Liens avec le programme
Jours `/day/78` (haute disponibilité) et `/day/79` (fiabilité). Leçons liées :
`/doc/lessons/networking-proxy-loadbalancing`, `/doc/lessons/distributed-tracing`,
`/doc/lessons/incident-response`, `/doc/lessons/cloud-compute-storage`. La résilience
contient les pannes ; l'incident et le post-mortem traitent ce qui passe quand même.
