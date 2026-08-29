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

## 🛠 Exemple guidé — une dépendance externe ralentit
1. **Symptôme** : le service de paiement passe de 100 ms à 8 s ; TON service commence
   à saturer (threads bloqués).
2. **Timeout** : borner l'appel paiement à 2 s → on ne bloque plus indéfiniment.
3. **Circuit breaker** : après N échecs, arrêter d'appeler le paiement 30 s → échouer
   vite.
4. **Graceful degradation** : proposer « réessayer le paiement plus tard » plutôt
   qu'une page d'erreur totale.
5. Résultat : la panne du paiement reste LOCALE ; le reste du service tient.

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
