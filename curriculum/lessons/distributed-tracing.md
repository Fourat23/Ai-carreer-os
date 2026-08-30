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

## 🛠 Exemple guidé — pourquoi il faut un identifiant, et pas seulement des horodatages

Avant de lire une trace, il faut comprendre pourquoi une trace existe. L'objection
naturelle est raisonnable : « mes trois services journalisent avec un horodatage
précis à la milliseconde ; je peux reconstituer une requête en regardant ce qui
s'est passé au même moment. » Cette méthode marche. C'est le problème.

Le script `scripts/v70-verifications/journaux-et-correlation.mjs` fabrique 200
requêtes traversant trois services — `passerelle`, `commandes`, `paiement` —
chacune durant environ 30 ms. On fait varier une seule chose : combien de requêtes
sont en vol en même temps. Puis on reconstitue chaque requête de deux façons : par
proximité temporelle, et par identifiant de corrélation.

```
 1 requête simultanée  : par proximité temporelle 200/200 · par identifiant 200/200
 5 requêtes simultanées : par proximité temporelle   1/200 · par identifiant 200/200
20 requêtes simultanées : par proximité temporelle   1/200 · par identifiant 200/200
```

### Ce que ces trois lignes disent

**Sans concurrence, deviner par le temps est parfait.** Deux cents sur deux cents.
C'est exactement la situation d'un poste de développement, où l'on envoie une
requête et où l'on regarde les journaux. La méthode fonctionne, on l'adopte, on la
trouve suffisante.

**Dès cinq requêtes simultanées, elle s'effondre : une sur deux cents.** Pas
« moins fiable » — inutilisable. Il suffit que les requêtes se chevauchent pour
que « le premier appel de `commandes` après le début de cette requête » désigne
la requête d'à côté. Cinq requêtes simultanées est un trafic minuscule.

**Et l'effondrement est silencieux.** C'est le point qui compte plus que les
chiffres. La méthode ne renvoie pas « je ne sais pas » : elle renvoie une
reconstitution parfaitement plausible, avec des durées cohérentes et des services
dans le bon ordre. **On analyse ensuite une requête qui n'a jamais existé.** On
mesure la latence d'un appel entre deux morceaux de requêtes différentes, on
conclut, et la conclusion est fausse sans qu'aucun signal ne l'indique.

Le remède ne demande aucune infrastructure : un identifiant unique généré **à la
frontière d'entrée** — le tout premier service qui reçoit la requête — puis
propagé dans un en-tête à chaque appel suivant, et journalisé par chacun. Deux
cents sur deux cents, à toutes les concurrences.

Deux erreurs annulent le bénéfice, et elles sont fréquentes. Si **chaque service
génère son propre identifiant**, il y en a trois et ils ne relient rien. Et si un
service **oublie de propager l'en-tête**, la chaîne se coupe à cet endroit
précis — c'est la cause presque systématique de « la trace s'arrête au service B ».

### Lire une trace, ensuite

Une fois la corrélation acquise, une trace est une hiérarchie de segments
(*spans*), chacun avec un début et une durée. Exemple :

```
API                2 000 ms
├─ SQL users          40 ms
└─ appel paiement  1 900 ms
```

Le réflexe est de désigner le paiement. C'est probablement juste, mais la lecture
complète pose trois questions, dans cet ordre :

1. **Où part le temps ?** 1 900 ms sur 2 000, côté paiement.
2. **Qu'est-ce qui n'est couvert par aucun segment enfant ?** 2 000 − 40 − 1 900 =
   **60 ms non instrumentées**. Ce n'est pas du néant : c'est de la sérialisation,
   de l'attente de connexion, du code non instrumenté. Sur cette trace c'est
   négligeable ; sur une trace où le trou fait la moitié du temps, **le trou est
   le diagnostic** — et c'est le seul cas que le classement des segments par durée
   ne trouvera jamais, puisque le trou n'est pas un segment.
3. **Qu'est-ce qui s'exécute en parallèle ?** Si deux enfants de 800 ms tiennent
   dans un parent de 900 ms, ils se recouvrent. Additionner les durées des
   enfants n'a alors aucun sens, et « optimiser le plus long » ne gagne que la
   différence, pas les 800 ms.

### L'échantillonnage, qui décide de ce que tu pourras voir

Conserver toutes les traces coûte cher, donc on échantillonne. Le calcul de ce
qu'on perd est une simple probabilité, et il est brutal :

```
taux  10 % · défaut survenu  1 fois -> capturé au moins une fois :  10,0 %
taux  10 % · défaut survenu 50 fois -> capturé au moins une fois :  99,5 %
taux   1 % · défaut survenu  1 fois -> capturé au moins une fois :   1,0 %
taux   1 % · défaut survenu  5 fois -> capturé au moins une fois :   4,9 %
taux   1 % · défaut survenu 50 fois -> capturé au moins une fois :  39,5 %
```

Un échantillonnage uniforme à 1 % rate **six fois sur dix** un défaut survenu
cinquante fois. Or ce qu'on veut absolument garder — les erreurs, les requêtes
lentes — est justement ce qui est rare, donc ce que l'échantillonnage uniforme
supprime en priorité.

La conclusion n'est pas « ne pas échantillonner » : c'est **échantillonner le
succès, pas l'échec**. On garde 100 % des traces en erreur et des traces
au-dessus d'un seuil de latence, et on descend très bas — 1 %, 0,1 % — sur les
requêtes rapides et réussies, qui sont nombreuses et se ressemblent toutes.
Cette décision est prise à la conception ; elle ne se rattrape pas pendant
l'incident, parce que la trace qu'on cherche n'a alors jamais été enregistrée.

## 🧪 Mise en pratique — poser la corrélation, puis mesurer ce qu'elle change

**A. Reproduire l'effondrement.** Écris un script qui simule N requêtes
traversant trois services, avec un paramètre de concurrence. Reconstitue chaque
requête par proximité temporelle et compte les reconstitutions correctes pour
une concurrence de 1, 5 et 20. Livrable : le tableau, et le taux d'erreur.

**B. Poser l'identifiant.** Sur deux services que tu contrôles (deux processus
suffisent), génère un identifiant à l'entrée, propage-le dans un en-tête, et
journalise-le des deux côtés. Livrable : les journaux des deux services filtrés
sur un même identifiant.

**C. Casser la chaîne exprès.** Retire la propagation dans un seul appel, puis
essaie de reconstituer une requête. Livrable : ce que tu vois dans la trace, et
comment tu localises l'endroit exact où l'en-tête a été perdu.

**D. Mesurer le trou.** Sur une requête réelle, instrumente le parent et deux
enfants, puis calcule le temps non couvert. Livrable : le chiffre, et ton
hypothèse sur ce qui s'y passe — puis une instrumentation supplémentaire qui la
confirme ou l'infirme.

**E. Décider ton échantillonnage.** Estime ton volume de requêtes et ton taux
d'erreur. Calcule, pour trois taux d'échantillonnage uniforme, la probabilité de
capturer un défaut qui touche une requête sur mille. Puis écris la règle
d'échantillonnage que tu retiens et ce qu'elle garde à 100 %.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Une trace affiche : `API` 2 000 ms, contenant `SQL` 40 ms et `paiement` 1 900 ms.
   Combien de millisecondes ne sont couvertes par AUCUN span enfant, et que
   pourrait-il s'y passer ?
2. Deux spans enfants durent 800 ms chacun et leur parent 900 ms. Comment est-ce
   possible ?
3. Ton service appelle un service B qui appelle un service C. La trace s'arrête à B.
   Qu'est-ce qui manque, et où précisément ?
4. Tu échantillonnes 1 % des traces. Un bug touche une requête sur mille. Combien de
   traces de ce bug verras-tu par million de requêtes, et que faut-il changer ?

## ✅ Correction attendue

**La démarche.** Lire une trace, c'est répondre à trois questions dans l'ordre : où
part le temps, qu'est-ce qui n'est pas instrumenté, et qu'est-ce qui s'exécute en
parallèle. Le classement des spans par durée ne vient qu'après.

**L'erreur probable : accuser le span le plus long.** Devant la trace de l'exemple,
la réponse immédiate est « c'est le paiement, 1 900 ms ». C'est souvent juste — mais
c'est une conclusion tirée du mauvais raisonnement, et le raisonnement se venge dès
que la trace est moins simple.

**Un span parent CONTIENT ses enfants.** Sa durée n'est pas son propre travail : c'est
le temps total, attente comprise. Dire « `API` prend 2 000 ms » ne désigne aucun
coupable, puisque `API` ne fait qu'attendre. Ce qui accuse réellement, c'est le
**temps non couvert** : 2 000 − 40 − 1 900 = **60 ms** ici, ce qui est sain. Quand ce
reste devient gros, il désigne du travail que personne n'a instrumenté — sérialisation
JSON, attente d'une connexion dans le pool, garbage collector — et c'est très souvent
là que se cache un problème durable, précisément parce qu'aucun span ne le montre.

Le piège séduit parce qu'une visualisation de trace **dessine** les barres par ordre
de longueur. L'œil suit la plus grande, et l'outil récompense ce réflexe. On lit un
graphique au lieu de lire un raisonnement.

**Sur les autres questions.** Deux enfants de 800 ms dans un parent de 900 ms : ils
s'exécutent **en parallèle** — c'est le cas normal, et c'est pourquoi additionner les
durées des spans n'a aucun sens. La trace qui s'arrête à B signifie que B n'a pas
**propagé** le contexte dans son appel sortant vers C : ce n'est pas B qui manque
d'instrumentation, c'est son client HTTP. Et l'échantillonnage à 1 % sur un bug à
0,1 % donne **une trace par million de requêtes** : inexploitable. La parade est
l'échantillonnage **par la queue** (*tail-based*), qui décide de garder la trace après
coup, en fonction de ce qu'elle contient — toutes les erreurs, toutes les lentes.

**Comment reconnaître le problème la prochaine fois.** Avant d'accuser, additionne les
enfants et compare au parent. Si la somme est proche du parent, le temps est expliqué.
Si elle est bien inférieure, cherche le trou. Si elle est supérieure, il y a du
parallélisme et ton intuition d'addition est fausse.

**Alternative défendable.** Sur un service à faible trafic, tracer 100 % et ne rien
échantillonner est parfaitement raisonnable : le coût est nul et on ne rate rien.
L'échantillonnage est une réponse à un problème de volume, pas une bonne pratique en
soi. Ne l'adopte pas avant d'avoir le problème.

**Vérifie seul, sans corrigé** :
1. Ouvre une trace réelle de ton service et calcule le temps non couvert par les
   enfants. S'il dépasse 20 %, tu viens de trouver ton prochain span à ajouter.
2. Coupe une dépendance externe et regarde la trace. Le span porte-t-il l'erreur, ou
   se contente-t-il d'être long ? Un span sans statut d'erreur ne sert qu'à moitié.
3. Suis un `requestId` depuis les logs jusqu'à la trace. Si tu ne peux pas faire ce
   trajet, tes trois piliers ne sont pas reliés.

### Sur la mise en pratique A → E

**A — l'effondrement.** Le résultat attendu suit la forme mesurée : parfait à
concurrence 1, quasi nul dès 5. Si ton script reste bon à concurrence 5, vérifie
que tes requêtes se chevauchent réellement — c'est le paramètre qui compte, pas
leur nombre. Le chiffre à publier n'est pas seulement le taux d'erreur : c'est
**le taux de reconstitutions fausses non détectées**, qui est le même chiffre lu
autrement, et qui est le vrai danger.

**B — l'identifiant.** Trois propriétés font la différence entre un identifiant
qui sert et un identifiant décoratif. Il est généré **une seule fois**, à la
frontière d'entrée. Il est **propagé** dans un en-tête (`traceparent` du standard
W3C, ou un en-tête maison — l'essentiel est qu'il soit unique dans le système).
Et il est **journalisé par tous les services**, y compris ceux qui ne font que
relayer.

**C — la chaîne cassée.** Ce que tu vois : la trace s'arrête net au dernier
service qui avait l'en-tête. La localisation est plus simple qu'il n'y paraît —
le dernier service qui a journalisé l'identifiant est celui qui n'a pas
transmis, et c'est donc **son** code d'appel sortant qu'il faut regarder, pas
celui du service suivant. C'est contre-intuitif : on cherche naturellement chez
celui qui n'apparaît pas.

La cause la plus fréquente en pratique : un client HTTP interne construit
ailleurs (une fonction utilitaire partagée, un client généré) qui ne recopie pas
les en-têtes de la requête entrante. Le service « oublie » sans qu'aucune ligne
de son propre code ne soit en cause.

**D — le trou.** L'écart entre la durée du parent et la somme des enfants est la
mesure la plus utile d'une trace, et la plus ignorée. Les causes typiques, par
fréquence : du code applicatif non instrumenté entre deux appels ; l'attente
d'une connexion disponible dans un pool ; la sérialisation ou la désérialisation
d'une réponse volumineuse ; l'attente dans une file d'exécution.

Le piège méthodologique : ne pas confondre le trou avec du parallélisme. Si deux
enfants se recouvrent, la somme de leurs durées dépasse celle du parent et le
« trou » devient négatif — ce qui ne signifie pas que le temps a disparu, mais
que l'addition n'était pas la bonne opération. Il faut alors raisonner sur les
intervalles (début, fin) et non sur les durées.

**E — l'échantillonnage.** La règle attendue conserve à 100 % : les traces
contenant une erreur, les traces dépassant un seuil de latence, et — détail
qu'on oublie — **toutes les traces d'une requête dont un seul segment est en
erreur**. C'est le point technique de l'exercice : la décision d'échantillonner
se prend à l'entrée, avant de savoir si la requête va échouer. Deux réponses
existent, et une bonne copie en cite au moins une : l'échantillonnage **différé**
(on garde tout en mémoire tampon et on décide à la fin de la requête), ou la
**propagation de la décision** dans l'en-tête pour que tous les services fassent
le même choix. Sans l'un des deux, on obtient des traces à trous, où un service
a gardé son segment et son voisin non — pire qu'une trace absente, parce
qu'elle a l'air complète.

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
`/doc/lessons/observability-fundamentals`, `/doc/lessons/logging-structured`,
`/doc/lessons/metrics-percentiles`. La trace localise une lenteur ; les patterns de
résilience (timeout, circuit breaker) corrigent ensuite les dépendances lentes.
