<!-- keep -->
# Leçon — Traces distribuées : suivre une requête de bout en bout

## 🌍 Le problème d'abord
Un utilisateur clique, et « c'est lent » : 2 secondes pour afficher une page.
Mais ta page appelle une API, qui appelle une base de données, qui appelle un
service externe… Où sont passées ces 2 secondes ? Dans l'API ? la base ? le service
externe ? Le réseau entre les deux ? Les logs te disent que chaque brique « a
répondu », les métriques que « globalement c'est lent », mais aucun des deux ne te dit
OÙ le temps a été dépensé pour CETTE requête précise. C'est exactement ce que résout
une **trace distribuée** : suivre une seule requête à travers tous les composants et
mesurer le temps de chaque étape. Cette leçon explique comment.

## 🎯 Objectif
Comprendre ce qu'est une **trace** et un **span**, comment le contexte se **propage**
d'un service à l'autre, ce qu'est l'**instrumentation** et le **sampling**, et à
quelle question la tracing répond que les logs et métriques ne peuvent pas.

## 🧩 Prérequis
Tu dois connaître les trois piliers de l'observabilité
(`/doc/lessons/observability-fundamentals`) et l'idée de **correlation ID**
(`/doc/lessons/logging-structured`) — une trace est, en quelque sorte, ce
correlation ID poussé plus loin, avec le temps de chaque étape. Utile : savoir qu'un
service en appelle d'autres (`/doc/lessons/networking-proxy-loadbalancing`).

## 🧠 Modèle mental
Imagine un colis avec un **bordereau de suivi** : il est scanné à chaque étape
(entrepôt, camion, centre de tri, livraison), avec l'heure. À la fin, tu vois où il a
attendu le plus longtemps. Une **trace** est le bordereau de suivi d'UNE requête ;
chaque étape scannée est un **span** (avec son heure de début/fin). Limite de
l'analogie : le colis est physique et unique ; une requête peut se diviser en appels
parallèles — la trace forme alors un arbre de spans, pas une simple ligne.

## 📖 Explication progressive
**Trace et span.** Une **trace** représente le parcours complet d'une requête. Elle
est composée de **spans** : chaque span est une opération (« appel API », « requête
SQL », « appel service paiement ») avec un début, une fin (donc une durée) et un
parent. Les spans s'emboîtent : le span « traiter la requête » contient le span
« requête SQL ». En les affichant sur une timeline, on VOIT immédiatement quelle
étape domine le temps total.

**Propagation de contexte.** Pour que les spans de plusieurs services appartiennent à
la MÊME trace, chaque service transmet au suivant un **identifiant de trace** (via
des en-têtes de la requête). Sans cette propagation, tu obtiens des morceaux isolés
au lieu d'une histoire continue — comme un correlation ID qu'on aurait oublié de
passer.

**Instrumentation.** Comme pour les autres piliers, rien n'apparaît sans
instrumentation : le code (souvent via une bibliothèque standard type OpenTelemetry —
cité à titre d'exemple, non exécuté ici) crée les spans et propage le contexte. Les
bibliothèques modernes instrumentent automatiquement les appels HTTP et bases de
données courants.

**Sampling.** Tracer 100 % des requêtes coûte cher (stockage, performance). On
**échantillonne** (sampling) : on ne garde qu'une fraction des traces (par ex. 1 %),
ou on garde toutes les traces d'erreur. Compromis classique : assez pour diagnostiquer,
pas au point de coûter plus que le service lui-même.

**À quelle question ça répond.** « OÙ le temps est-il passé pour cette requête ? » et
« quel service, dans une chaîne, est responsable de la lenteur/de l'erreur ? ». Les
métriques disent « c'est lent globalement » ; les traces disent « c'est l'appel à la
base, à l'étape 3 ».

## 🔎 Décomposition
- trace = le parcours complet d'une requête.
- span = une étape mesurée (début, fin, parent).
- propagation = passer l'ID de trace au service suivant.
- sampling = quelle fraction on conserve.

## 🛠 Exemple guidé — « 2 secondes, mais où ? »
1. On ouvre la trace d'une requête lente. Total : 2 000 ms.
2. Spans : `API` 2 000 ms → dont `SQL users` 40 ms, `appel service paiement` 1 900 ms.
3. Le coupable saute aux yeux : le service de paiement (1,9 s), pas notre code ni la
   base.
4. On zoome : le span « paiement » attend un service externe → problème de dépendance
   externe (voir résilience : timeout, circuit breaker).

## 🧪 Mise en pratique
Voir la pratique associée : lire un ensemble de métriques/percentiles pour localiser
une lenteur, et raisonner sur ce qui manque pour diagnostiquer.

## ⚠️ Erreurs fréquentes / anti-patterns
- **Oublier la propagation** du contexte → traces fragmentées, inutiles.
- **Tracer 100 %** sans réfléchir au coût (préférer un sampling + garder les erreurs).
- Croire que les traces remplacent logs et métriques (elles répondent à « où », pas à
  « pourquoi précisément » ni « quelle tendance »).
- Instrumenter seulement son code et pas les appels sortants (on rate les dépendances).

## 🏢 Cas métier
Une page passe de 300 ms à 2 s après une mise en production. Les métriques confirment
la hausse ; impossible de savoir pourquoi avec les seuls logs. Une trace montre qu'un
nouvel appel à un service de recommandation a été ajouté dans le chemin critique et
prend 1,7 s. Décision : le rendre asynchrone (hors du chemin critique). Sans tracing,
l'équipe aurait cherché au mauvais endroit.

## 🚨 Que faire dans ce cas ? — « une dépendance externe est lente »
- **Observer** : la trace localise l'appel lent et sa durée.
- **Limiter l'impact** : poser un **timeout** raisonnable pour ne pas bloquer toute
  la requête ; envisager un **circuit breaker** (voir résilience).
- **Corriger** : sortir l'appel du chemin critique (async), mettre en cache, ou
  dégrader gracieusement (répondre sans la partie optionnelle).
- **Prévenir** : suivre la latence de chaque dépendance ; alerter sur sa dégradation.

## 🎤 Questions d'entretien
- « Trace vs span ? » → parcours complet d'une requête vs une étape mesurée dedans.
- « À quoi sert la propagation de contexte ? » → relier les spans de plusieurs
  services en une seule trace.
- « Pourquoi échantillonner les traces ? » → coût ; on garde une fraction (+ les
  erreurs).

## ✅ À retenir
- Trace = parcours d'une requête ; spans = étapes mesurées emboîtées.
- La propagation de contexte relie les services en une trace unique.
- Le tracing répond à « OÙ le temps est passé », que logs/métriques ne disent pas.
- Sampling pour maîtriser le coût ; instrumenter aussi les appels sortants.

## 📚 Vocabulaire
**trace** · **span** · **span parent/enfant** · **propagation de contexte** ·
**instrumentation** · **sampling / échantillonnage** · **chemin critique** ·
**timeline de trace**.

## 🎯 Pratique associée
Exercices : localiser une lenteur via des percentiles ; identifier le signal manquant.

## 🔗 Liens avec le programme
Jour `/day/79` (observabilité). Leçons liées :
`/doc/lessons/observability-fundamentals`, `/doc/lessons/logging-structured`. La trace
localise une lenteur ; les leçons suivantes couvrent les métriques/percentiles et les
patterns de résilience (timeout, circuit breaker) qui corrigent les dépendances lentes.
