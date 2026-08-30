<!-- keep -->
# Leçon — Réseau : DNS, la résolution de noms

## 🌍 Le problème d'abord
Vous tapez `exemple.fr` dans un navigateur, pas une suite de chiffres. Pourtant les
machines ne savent se joindre que par des **adresses numériques** (IP). Il faut donc
un annuaire géant qui traduise les noms en adresses : c'est le **DNS**. Ce détail
invisible est responsable d'une part énorme des pannes : « j'ai changé le serveur
mais le site pointe encore vers l'ancien », « le site marche chez moi mais pas chez
le voisin ». La raison est presque toujours la même — une réponse **gardée en
mémoire** trop longtemps. Cette leçon explique comment un nom devient une adresse, et
pourquoi un réglage appelé TTL décide de la vitesse à laquelle un changement se
propage. D'où la blague d'ingénieur : « c'est toujours le DNS ».

## 🎯 Objectif
Comprendre comment un **nom de domaine** devient une **IP** : les types
d'enregistrements (A, AAAA, CNAME, MX, TXT), le rôle du **TTL** et du **cache**, et
savoir diagnostiquer un problème DNS avec `dig` — l'une des causes d'incident les plus
fréquentes et les plus mal comprises.

## 🧩 Prérequis
Vous devez savoir ce qu'est une **adresse IP** et distinguer réseau public/privé
(`/doc/lessons/networking-addressing-routing`), puisque le DNS ne fait que traduire un
nom EN une IP. Les notions d'enregistrement (A/CNAME/…), de resolver et de TTL sont
définies ici.

## 🧠 Modèle mental
Les humains retiennent des noms (`api.exemple.test`), les machines parlent en IP. Le
**DNS** est l'annuaire distribué qui traduit l'un en l'autre. Avant TOUT échange réseau,
le nom doit être résolu en IP. Si cette traduction échoue ou renvoie une vieille valeur,
rien ne marche — même si le serveur est parfaitement sain. « C'est toujours le DNS » est
une blague d'ingénieur… souvent vraie.

## 📖 Explication complète
**La résolution, étape par étape.** Quand un programme veut joindre `api.exemple.test`,
un **resolver** interroge la hiérarchie DNS : les serveurs racine → le serveur du TLD
(`.test`) → le serveur faisant autorité pour `exemple.test`, qui renvoie l'IP. En
pratique, on interroge d'abord un resolver **récursif** (celui du système/FAI/cloud) qui
fait ce travail et met en cache le résultat.

**Les types d'enregistrements.**
- **A** : nom → IPv4. **AAAA** : nom → IPv6.
- **CNAME** : alias d'un nom vers un AUTRE nom (`www` → `exemple.test`). Un CNAME ne
  peut pas cohabiter avec d'autres enregistrements sur le même nom (piège fréquent à la
  racine d'un domaine).
- **MX** : serveurs de messagerie du domaine.
- **TXT** : texte libre, utilisé pour la vérification de propriété (SPF, DKIM, preuve de
  domaine pour un fournisseur cloud/TLS).
- **NS** : serveurs faisant autorité pour la zone.

**TTL et cache : la source des surprises.** Chaque enregistrement porte un **TTL** (Time
To Live) : la durée pendant laquelle un resolver a le droit de le garder en cache. Si le
TTL d'un A est de 3600 s, un changement d'IP peut mettre jusqu'à une heure à se
propager : d'anciens clients continuent de joindre l'ancienne IP. C'est pourquoi on
**baisse le TTL AVANT** une migration prévue (pour propager vite), puis on le remonte.
Le cache existe à plusieurs niveaux (application, OS, resolver) : vider l'un ne vide pas
les autres.

**Autorité vs cache.** Interroger le serveur faisant AUTORITÉ (`dig @ns nom`) donne la
vérité actuelle ; interroger un resolver récursif peut renvoyer une valeur en cache
(potentiellement périmée). Comparer les deux est la clé pour diagnostiquer « j'ai changé
l'IP mais ça ne prend pas ».

## 🔧 Diagnostic avec dig
```bash
dig api.exemple.test              # enregistrement A + section ANSWER + TTL restant
dig api.exemple.test AAAA         # IPv6
dig exemple.test MX               # serveurs mail
dig +short api.exemple.test       # juste l'IP
dig @ns1.exemple.test api.exemple.test   # interroger le serveur d'AUTORITÉ (bypass cache)
dig +trace exemple.test           # suivre la délégation depuis la racine
```
Lire la section ANSWER (l'IP renvoyée + le TTL) ; un `NXDOMAIN` = le nom n'existe pas ;
une réponse vide = pas d'enregistrement de ce type.

## 🧭 Exemple guidé — « j'ai changé l'IP mais le site pointe encore vers l'ancienne »
« J'ai changé l'adresse IP il y a deux heures. Ça marche chez moi, pas chez le client. »

C'est le symptôme le plus caractéristique du DNS, et il a une propriété que peu de pannes
partagent : **il dépend de qui pose la question**. Deux personnes obtiennent deux réponses
différentes, toutes deux correctes de leur point de vue.

### Ce qu'il faut comprendre avant de diagnostiquer

Une résolution de nom passe par **plusieurs caches empilés**, chacun avec sa propre durée de
vie :

```
navigateur → système d'exploitation → résolveur du fournisseur → serveurs faisant autorité
   (secondes)      (minutes)              (jusqu'au TTL)              (la vérité)
```

Un changement d'adresse ne se propage pas : **il expire**. Tant qu'un cache intermédiaire
détient l'ancienne réponse et que sa durée de vie n'est pas écoulée, il la sert — et il a
raison de le faire, c'est exactement son rôle.

D'où la question que le diagnostic doit trancher : **où, dans cette chaîne, est la réponse que
je vois ?**

### La bissection, en trois commandes

```bash
dig +short api.exemple.test              # ① ce que voit MON résolveur (peut être en cache)
dig @ns1.exemple.test api.exemple.test   # ② la VÉRITÉ, demandée à l'autorité
dig api.exemple.test | grep -A1 ';; ANSWER'   # ③ le TTL restant sur la réponse en cache
```

Trois résultats possibles, trois causes distinctes :

| ① résolveur | ② autorité | Diagnostic |
|---|---|---|
| ancienne IP | **nouvelle** IP | **cache** : attendre l'expiration du TTL, ou vider le cache local |
| ancienne IP | **ancienne** IP | **la modification n'a pas été appliquée** — vérifier la zone, la bonne zone |
| nouvelle IP | nouvelle IP | le DNS n'est pas en cause : chercher ailleurs (route, pare-feu, certificat) |

La troisième ligne est aussi précieuse que les deux autres : **éliminer le DNS en trente
secondes** évite d'y passer une heure. C'est le principal service que rend cette bissection.

### Le TTL, et la décision qu'on prend trop tard

La durée de vie est un compromis, et il se décide **avant** la migration, pas pendant :

| TTL | Ce qu'il donne | Ce qu'il coûte |
|---|---|---|
| 86 400 s (24 h) | peu de requêtes, résolveurs déchargés | **une migration prend une journée** |
| 3 600 s (1 h) | équilibre courant | une heure de propagation |
| 60 s | bascule quasi immédiate | beaucoup plus de requêtes DNS |

La manœuvre professionnelle est en trois temps, et elle est la vraie réponse à « comment
migrer sans coupure » :

```
J-2  : abaisser le TTL à 60 s          ← il faut attendre l'ANCIEN TTL pour que ce soit effectif
J    : changer l'enregistrement        ← propagation en une minute
J+2  : remonter le TTL à 3 600 s
```

Le piège de l'étape 1 : abaisser le TTL n'a d'effet qu'une fois l'ancien TTL expiré. Si l'on
abaisse à 60 s le matin de la migration alors que l'ancien TTL était de 24 h, les résolveurs
continueront à servir l'ancienne adresse pendant vingt-quatre heures. **Le TTL se baisse au
moins un ancien-TTL à l'avance.**

### Les types d'enregistrements, et le seul choix qui fait réfléchir

| Type | Ce qu'il associe | Usage |
|---|---|---|
| `A` / `AAAA` | un nom → une adresse IPv4 / IPv6 | le cas courant |
| `CNAME` | un nom → **un autre nom** | pointer vers un service géré dont l'IP change |
| `MX` | un domaine → un serveur de courrier | courriel |
| `TXT` | un nom → du texte libre | preuve de possession, politique d'envoi |

Le choix qui compte est `A` contre `CNAME`, et il se pose à chaque intégration d'un service
externe.

Un `CNAME` délègue la résolution : si le fournisseur change ses adresses, tu n'as rien à faire.
C'est la bonne réponse pour un service géré. Sa contrainte, souvent découverte au mauvais
moment : **un `CNAME` ne peut pas coexister avec d'autres enregistrements sur le même nom**, ce
qui l'interdit à la racine d'un domaine — `exemple.fr` a besoin d'un `MX`, donc ne peut pas
être un `CNAME`. C'est pourquoi tant de sites vivent sur `www.` et redirigent la racine.

### Ce que le DNS ne fait pas

Trois confusions fréquentes, qui envoient chercher au mauvais endroit :

- **le DNS ne vérifie pas que le serveur répond.** Un enregistrement peut pointer vers une
  machine éteinte : la résolution réussit, la connexion échoue. Le symptôme est un délai
  d'attente, pas une erreur de nom ;
- **le DNS n'a rien à voir avec le certificat.** Un nom correctement résolu vers un serveur dont
  le certificat porte un autre nom produit une erreur TLS. Ce sont deux systèmes indépendants
  qui utilisent tous deux des noms de domaine ;
- **le DNS ne fait pas de répartition de charge fiable.** Plusieurs enregistrements `A` pour un
  même nom distribuent grossièrement, sans contrôle de santé : une machine morte continue de
  recevoir sa part du trafic tant que l'enregistrement existe et que les caches n'ont pas
  expiré.

Le dernier point explique pourquoi on met un répartiteur de charge derrière un nom unique
plutôt que plusieurs adresses dans le DNS — le sujet de
`/doc/lessons/networking-proxy-loadbalancing`.


## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Tu dois migrer une IP demain. Le TTL actuel est de 3 600 s. Tu le passes à 60 s ce
   matin. Dans combien de temps la migration pourra-t-elle se propager en une minute ?
2. `dig` sur ton poste renvoie la nouvelle IP, mais un collègue voit encore l'ancienne.
   Qui a raison, et que fais-tu ?
3. Ton application Node tourne depuis six jours. Tu changes l'IP, tous les TTL ont
   expiré, et elle continue d'appeler l'ancienne adresse. Que se passe-t-il ?
4. Pourquoi ne peut-on pas mettre un CNAME sur `exemple.test` (la racine du domaine) ?

## ✅ Correction attendue

**La démarche.** Un problème DNS se diagnostique en comparant deux sources : ce que dit
le serveur **faisant autorité** et ce que renvoie le **resolver** qu'on interroge. Tout
écart entre les deux est du cache, et tout cache a une durée qu'on peut lire.

**L'erreur probable, et elle fait rater des migrations soigneusement préparées.** À la
première question, la réponse spontanée est « dans une minute, puisque le TTL est
maintenant de 60 s ». Elle est fausse, et la vraie réponse est **dans une heure**.

Le mécanisme est le suivant, et c'est le point à comprendre une fois pour toutes : **la
modification du TTL est elle-même soumise à l'ancien TTL.** Les resolvers qui ont
interrogé ton domaine il y a dix minutes ont mis en cache l'enregistrement *avec sa
durée de 3 600 s*. Ils ne reviendront pas te demander la nouvelle valeur avant
l'expiration de cette heure-là. Le TTL à 60 s ne s'appliquera qu'à partir du moment où
tout le monde aura rafraîchi — c'est-à-dire une heure plus tard.

D'où la règle opérationnelle : **baisser le TTL une durée au moins égale à l'ancien TTL
avant la migration**, pas le matin même. Pour un TTL d'une heure, on le baisse la
veille ; pour un TTL de 24 h, deux jours avant.

Le piège séduit parce qu'un changement DNS **paraît instantané côté émetteur** : on
modifie l'enregistrement, `dig @autorité` confirme aussitôt, tout semble fait. Ce qu'on
observe est la source ; ce qui compte est la centaine de milliers de caches répartis
dans le monde, et ceux-là ne se voient pas.

**Sur les autres questions.** Ton collègue et toi avez raison tous les deux : vous
interrogez des resolvers différents, dont les caches ont expiré à des moments
différents. Ce n'est pas un désaccord à trancher, c'est une propagation en cours — et
la seule vérité est le serveur d'autorité, que `dig @ns` interroge directement.

L'application Node qui persiste après expiration de tous les TTL révèle un cache que
personne ne surveille : **beaucoup de bibliothèques et de runtimes mettent en cache la
résolution pour la durée de vie du processus**, en ignorant complètement le TTL. Vider
le cache du système d'exploitation ne les atteint pas. La seule solution est souvent de
redémarrer le processus — et c'est une raison sérieuse de préférer un nom stable devant
un load balancer plutôt que de compter sur le DNS pour basculer du trafic.

Enfin, le CNAME à la racine est interdit parce qu'un CNAME dit « ce nom est un alias, va
chercher tout ailleurs » — or la racine d'un domaine doit obligatoirement porter ses
enregistrements **NS** et **SOA**. Un alias et des enregistrements propres ne peuvent
pas coexister sur le même nom. Les fournisseurs contournent cela avec des
enregistrements non standard (ALIAS, ANAME, « CNAME plat ») qui résolvent côté serveur.

**Alternative défendable.** Pour basculer du trafic, beaucoup d'équipes **n'utilisent
pas le DNS du tout** : elles gardent un nom fixe et changent la cible derrière le load
balancer. C'est instantané, réversible en une seconde, et cela évite entièrement le
problème des caches. Le DNS reste utile pour les bascules rares et planifiées — un
changement de fournisseur, une migration de région.

**Vérifie seul, sans corrigé** :
1. Regarde le TTL de ton enregistrement principal (`dig` l'affiche). Combien de temps
   te faudrait-il pour basculer aujourd'hui ?
2. Compare `dig +short nom` et `dig @<autorité> +short nom`. Un écart signifie que tu
   es en train de regarder le passé.
3. Ton application met-elle en cache ses résolutions ? Cherche-le dans sa
   documentation ; presque personne ne le sait avant d'en avoir souffert.

## ⚠️ Erreurs fréquentes
- **Oublier le TTL** : changer un enregistrement et s'étonner que « ça ne prend pas »
  tout de suite.
- Mettre un **CNAME à la racine** d'un domaine (interdit/conflictuel).
- Vider un seul cache (navigateur) en croyant avoir tout vidé (OS/resolver restent).
- Confondre « le nom n'existe pas » (NXDOMAIN) et « pas d'enregistrement de ce type ».
- Diagnostiquer l'application alors que la résolution DNS échoue en amont.

## 🔐 & ☁️ Sécurité / cloud
Les enregistrements **TXT** servent souvent à prouver qu'on possède un domaine (pour
émettre un certificat TLS ou configurer un service cloud). Un DNS pointant vers une
ressource cloud supprimée peut être **détourné** (dangling DNS / subdomain takeover) :
on nettoie les enregistrements orphelins. Le DNS privé (résolution interne d'un VPC/VNet)
permet de nommer des services sans les exposer.

## 🏢 Cas métier
Après un basculement de serveur, 20% des utilisateurs voient encore l'ancien. `dig`
depuis l'autorité renvoie la bonne IP, mais les resolvers publics gardent l'ancienne :
le TTL était à 24 h. Correction immédiate : attendre/forcer ; correction de fond :
politique « TTL bas 24 h avant toute migration DNS planifiée ».

## 🎤 Questions d'entretien
- « À quoi sert le TTL ? » → durée de cache d'un enregistrement ; il gouverne la vitesse
  de propagation.
- « A vs CNAME ? » → A pointe vers une IP, CNAME est un alias vers un autre nom.
- « Pourquoi une modif DNS met du temps ? » → cache + TTL à plusieurs niveaux.

## ✍️ Mini-exercice
Vous prévoyez de changer l'IP d'un service dans deux jours. Quel réglage DNS faites-vous
AUJOURD'HUI pour une propagation rapide le jour J ? → baisser le TTL de l'enregistrement A.

## 🔥 Pratique — observer le cache et la répartition

**A. Mesurer le cache.** Résous le même nom deux fois de suite en chronométrant,
sur trois domaines différents. Livrable : les six durées.

**B. Un nom, combien d'adresses ?** Interroge les enregistrements d'adresse de
plusieurs domaines et compte-les. Livrable : le nombre par domaine, et ce que
tu en déduis sur leur infrastructure.

**C. Simuler un changement d'adresse.** Sur une entrée que tu contrôles (ton
fichier d'hôtes local suffit), change la valeur et observe combien de temps
l'ancienne continue d'être servie par les différents niveaux de cache.
Livrable : la chronologie.

**D. Calculer la fenêtre d'un changement.** Pour une durée de vie
d'enregistrement donnée, calcule le temps maximal pendant lequel une partie des
clients utilisera encore l'ancienne adresse. Puis calcule ce que devient cette
fenêtre si tu abaisses la durée de vie 48 h avant la bascule. Livrable : les
deux fenêtres.

**E. Diagnostiquer.** Écris un script qui, pour un nom donné, affiche : ce que
répond le résolveur système, ce que répond un résolveur public, et les
enregistrements faisant autorité. Livrable : le script et sa sortie sur un nom
dont l'adresse vient de changer.

## ✅ Correction attendue

> Valeurs mesurées par `scripts/v70-verifications/reseau-mesures.mjs`.

**A — le cache.**

```
registry.npmjs.org -> 104.16.0.34     1re 21,3 ms   2e 18,5 ms
github.com         -> 140.82.112.4    1re 17,5 ms   2e  3,1 ms
example.com        -> 172.66.147.243  1re 28,9 ms   2e 15,2 ms
```

La deuxième résolution est plus rapide, mais **pas systématiquement d'un facteur
énorme** — et c'est un résultat honnête à publier plutôt que d'annoncer « le
cache rend la seconde instantanée ». Selon le niveau qui répond (cache du
processus, du système, du résolveur), le gain va de quelques millisecondes à un
facteur cinq.

Ce que cette mesure explique vraiment : **une panne de résolution de nom se
manifeste en différé.** Tant que les caches tiennent, tout fonctionne ; la panne
apparaît à l'expiration, souvent des minutes ou des heures après la cause. C'est
pourquoi « ça marchait il y a une heure » n'exclut pas une modification faite
il y a une heure.

**B — plusieurs adresses.**

```
registry.npmjs.org : 12 adresses — 104.16.8.34, 104.16.10.34, 104.16.3.34…
github.com         :  1 adresse  — 140.82.114.3
example.com        :  2 adresses — 104.20.23.154, 172.66.147.243
```

Plusieurs adresses pour un nom, c'est la forme la plus simple de répartition de
charge : le résolveur rend une liste, le client en choisit une. Sans état, sans
équipement dédié.

Mais la limite est essentielle et souvent tue : **aucun contrôle de santé.**
Une adresse morte reste distribuée jusqu'à ce qu'on retire l'enregistrement — et
le retrait met du temps à se propager, pour la raison mesurée en A. C'est pour
cela que la répartition par noms ne remplace pas un répartiteur de charge, qui
lui retire une instance défaillante en quelques secondes.

**C et D — la fenêtre de bascule.** La règle : après un changement, une partie
des clients utilise l'ancienne adresse pendant **au plus la durée de vie de
l'ancien enregistrement**, comptée depuis leur dernière résolution. Avec une
durée de vie de 24 h, la fenêtre est de 24 h.

D'où la manœuvre standard, qui est la vraie réponse attendue : **abaisser la
durée de vie à quelques minutes 48 heures avant la bascule**, attendre que
l'ancienne valeur ait expiré partout, basculer, puis remonter la durée de vie.
La fenêtre passe alors de 24 h à quelques minutes.

Ce qui rend cette manœuvre non négociable : elle doit être décidée **avant**. Le
jour de la bascule, il est trop tard — la durée de vie qui s'applique est celle
déjà distribuée.

**E — le diagnostic à trois niveaux.** Le script doit distinguer trois réponses
possibles, et l'écart entre elles **est** le diagnostic :

- résolveur système et résolveur public **d'accord**, serveur faisant autorité
  **différent** → le changement est fait, il se propage, il faut attendre ;
- résolveur système **différent** des deux autres → cache local, à vider ;
- serveur faisant autorité **différent de ce que tu as configuré** → le
  changement n'a pas été enregistré là où tu le crois, souvent parce que la
  délégation pointe vers d'autres serveurs que ceux que tu modifies.

Le troisième cas est le plus fréquent en incident réel et le plus long à
trouver, parce qu'on cherche un problème de propagation alors qu'il n'y a rien à
propager.

## 🧾 À retenir
- DNS = annuaire nom → IP ; la résolution précède tout échange.
- Types : A/AAAA (IP), CNAME (alias), MX (mail), TXT (vérif/preuve), NS (autorité).
- Le **TTL** gouverne le cache et la vitesse de propagation : le baisser AVANT une migration.
- Diagnostiquer : comparer resolver (cache) et serveur d'autorité avec `dig`.

## 📚 Vocabulaire
**DNS** · **resolver récursif** · **serveur d'autorité** · **A / AAAA / CNAME / MX / TXT / NS** ·
**TTL** · **cache** · **NXDOMAIN** · **propagation** · **dangling DNS**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'explique la résolution d'un nom en IP.
- [ ] Je lis un `dig` (ANSWER, TTL) et je distingue cache et autorité.
- [ ] Je prépare une migration DNS via le TTL.

## 🔗 Liens avec le programme
Jour `/day/71` (réseau). Leçons liées : `/doc/lessons/networking-tcp-ip-model`,
`/doc/lessons/networking-http-tls`. Le DNS est la première couche à vérifier dans tout
incident « service inaccessible », y compris avec le DNS privé du réseau cloud.
