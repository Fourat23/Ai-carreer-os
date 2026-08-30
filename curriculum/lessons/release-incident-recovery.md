<!-- keep -->
# Leçon — Reprise après incident : rollback, roll-forward, hotfix

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Il est 15 h, vous venez de livrer, et le taux d'erreurs explose. Panique ? Non :
méthode. La toute première décision n'est PAS « comprendre le bug » — c'est
**rétablir le service** au plus vite pour les utilisateurs, quitte à comprendre
après. Mais rétablir comment ? Revenir à la version d'avant (rollback) ? Foncer vers
un correctif (roll-forward / hotfix) ? Couper la fonctionnalité fautive ? Le mauvais
choix aggrave l'incident — par exemple, un rollback devient IMPOSSIBLE si une
modification de base de données est déjà passée. Cette leçon donne le réflexe et les
critères pour choisir, puis la discipline de l'après (post-mortem sans blâme). On
part du principe fondateur : « rétablir d'abord, comprendre ensuite ».

## 🎯 Objectif
Savoir RÉAGIR quand une release tourne mal : distinguer **rollback**,
**roll-forward** et **hotfix**, choisir la bonne réponse selon la situation, et
comprendre pourquoi les artefacts versionnés et les migrations compatibles rendent
la reprise possible. L'objectif d'un incident : rétablir vite, comprendre ensuite.

## 🧩 Prérequis
Vous devez comprendre les **artefacts versionnés** (ce qui rend un rollback possible
— `/doc/lessons/ci-cd-quality-gates-artifacts`) et les **stratégies de déploiement**
(rolling, canary, feature flag, migrations — `/doc/lessons/deployment-strategies`).
Les termes rollback, roll-forward, hotfix et post-mortem sont définis ici.

## 🧠 Modèle mental
En incident, la priorité n'est pas de COMPRENDRE, c'est de RÉTABLIR le service
(stop the bleeding), puis de diagnostiquer à froid. Trois façons de rétablir :
revenir à la version d'avant (**rollback**), avancer vite vers une version
corrigée (**roll-forward**/hotfix), ou désactiver le coupable (**feature flag**).
Le bon réflexe dépend de ce qui est le plus RAPIDE et le plus SÛR ici et
maintenant.

## 📖 Explication complète
**Rollback.** Redéployer l'artefact précédent, connu bon. C'est possible SI les
artefacts sont versionnés et immuables ET si aucune migration destructive n'a
rendu l'ancienne version incompatible avec la base. Rapide et sûr quand ces
conditions tiennent. Un blue-green rend le rollback quasi instantané (rebascule).

**Roll-forward.** Quand le rollback est impossible ou risqué (une migration de
base est déjà passée, ou l'ancienne version a d'autres défauts), on avance : on
corrige et on déploie une NOUVELLE version. Plus lent qu'un rollback, mais parfois
la seule option sûre. Souligne pourquoi les migrations doivent être compatibles :
un schéma non rétro-compatible ferme la porte du rollback.

**Hotfix.** Un correctif URGENT, minimal, ciblé sur le bug de prod, déployé hors
du cycle normal. Discipline indispensable : le hotfix doit être **reporté** sur la
branche principale (sinon il « disparaît » à la release suivante — régression). Un
hotfix reste soumis aux portes qualité essentielles ; on ne contourne pas tout
sous prétexte d'urgence.

**Feature flag comme filet.** Si la fonctionnalité fautive est derrière un flag,
la réponse la plus rapide est souvent de la COUPER : rétablissement immédiat sans
redéploiement, le temps de corriger.

**Décider vite.** Critère : quelle action rétablit le plus vite avec le moins de
risque ? Souvent rollback si disponible ; flag si applicable ; roll-forward si le
rollback est fermé (migration) ou insuffisant.

**Après coup : post-mortem sans blâme.** Une fois rétabli, on analyse la cause
racine et on tire des actions correctives (tests manquants, porte qualité,
migration mal planifiée). Sans blâme : on corrige le SYSTÈME qui a laissé passer,
pas la personne. C'est ce qui fait progresser la fiabilité.

## 🔧 Repères pratiques (démarche)
```
1. Détecter + confirmer l'impact (métriques, alertes).
2. Rétablir : rollback (artefact précédent) OU couper le flag OU roll-forward.
3. Communiquer (statut, périmètre, ETA) aux parties prenantes.
4. Stabiliser, vérifier le retour à la normale.
5. Post-mortem sans blâme : cause racine + actions durables.
```

## 🧭 Exemple guidé — « on a un bouton retour arrière, donc on est couverts »

Il faut prendre cette phrase au sérieux, parce qu'elle est vraie la plupart du
temps. C'est précisément ce qui la rend dangereuse : elle échoue rarement, et
elle échoue au pire moment. Le script
`scripts/v70-verifications/retour-arriere.mjs` déroule une livraison réelle sur
une base et mesure, à chaque étape, ce que le retour arrière rend et ce qu'il ne
rend pas.

**La situation.** Une table `commande(id, client, total_cents)` avec 100 lignes
en production. La livraison ajoute une colonne `devise` et le code v2 qui la
remplit. Déploiement progressif, donc plusieurs instances, donc cohabitation.

### Étape 1 — le défaut silencieux, avant même l'incident

La migration part avant que toutes les instances v1 soient remplacées. C'est
inévitable dans un déploiement progressif. La colonne est ajoutée en `NOT NULL
DEFAULT ''`, ce que fait tout générateur de migration à qui l'on demande une
colonne obligatoire :

```
colonne devise ajoutée (NOT NULL, sans valeur métier)
une instance v1 écrit encore : ACCEPTÉ, devise = ""
```

Pas d'erreur. Pas d'alerte. Une commande sans devise entre en base. Ce défaut ne
déclenchera aucun incident : il se découvrira à la facturation. Retiens la
forme, elle est générale — **une valeur par défaut transforme une incompatibilité
bruyante en corruption silencieuse.** Le plantage aurait été préférable.

### Étape 2 — l'incident, et le retour arrière du code

Le code v2 tourne et écrit 50 commandes avec une devise, moitié `EUR`, moitié
`USD`. Puis les erreurs montent et on revient au code v1.

```
151 commandes au total, dont 50 portent une devise
somme facturée par v1 : 3581.75 (toutes devises confondues)
```

Le retour arrière du code **réussit** : v1 redémarre, ignore la colonne, sert le
trafic. Le taux d'erreur redescend, le tableau de bord repasse au vert, et
l'incident est déclaré clos.

Il ne l'est pas. v1 additionne des euros et des dollars comme s'ils étaient
homogènes, et produit un total faux. Le retour arrière a restauré la
**disponibilité** sans restaurer la **correction**. Ces deux choses sont
distinctes et la première masque la seconde, parce que c'est la première qu'on
surveille.

### Étape 3 — le retour arrière du schéma, qui détruit

Quelqu'un décide d'être propre et lance le `down` de la migration :

```
colonne devise supprimée. Lignes qui portaient 'USD' : 25
relire la colonne : no such column: devise
```

Aucune ligne n'a été supprimée : 151 avant, 151 après. Et pourtant la seule
trace de la devise de 50 commandes vient de disparaître, dont 25 en dollars
désormais indiscernables des euros. **« Aucune ligne supprimée » n'est pas
« aucune donnée perdue ».** Une sauvegarde restaurerait l'état d'avant la
livraison — donc sans les 50 commandes. Il n'existe aucun état de la base qui
contienne à la fois les commandes et leur devise.

C'est le point que la leçon existe pour transmettre : **le retour arrière du
code est réversible, le retour arrière du schéma ne l'est pas.** Ce sont deux
opérations différentes, et le mot « rollback » les désigne toutes les deux, ce
qui est la source de la confusion.

### Étape 4 — la même livraison, conçue pour être réversible

```
colonne ajoutée NULLABLE : v1 et v2 écrivent toutes les deux.
lignes sans devise : 1 — repérables par une requête, donc rattrapables.
```

Une seule différence : la colonne est *nullable*. Trois conséquences en chaîne.
v1 continue d'écrire sans erreur. Les lignes écrites par v1 sont **identifiables**
(`WHERE devise IS NULL`) au lieu d'être noyées parmi les valeurs vides, donc
rattrapables plus tard. Et le retour arrière de v2 vers v1 ne demande aucune
migration : la colonne reste, personne ne perd rien. La suppression de la
colonne, seule opération destructive, n'arrive qu'une fois qu'aucune instance
v1 ne tourne — et elle n'est alors plus urgente, ce qui est exactement la
propriété qu'on veut d'une opération irréversible.

### La règle de décision, dérivée de ce qui précède

Au moment de l'incident, tu n'as pas le temps de raisonner. Les quatre questions
dans l'ordre :

1. **Un drapeau de fonctionnalité couvre-t-il le fautif ?** Si oui, le couper.
   C'est le rétablissement le plus rapide et le seul qui ne redéploie rien.
2. **Une opération irréversible est-elle passée ?** Suppression de colonne,
   e-mails envoyés, paiements capturés, appel à un système tiers. Si oui, **le
   retour arrière est fermé** : il ne restaurera pas l'état d'avant, il en
   fabriquera un troisième. Direction correction en avant.
3. **Sinon : revenir à l'artefact précédent.** C'est rapide et sûr, à une
   condition — que l'artefact précédent existe encore, versionné et immuable. Un
   déploiement qui reconstruit depuis la branche principale n'a pas d'artefact
   précédent : il a un rebuild, avec des dépendances éventuellement différentes.
4. **Une fois disponible : vérifier la correction, pas seulement la
   disponibilité.** L'étape 2 ci-dessus montre un service parfaitement
   disponible qui produit des totaux faux. La question « combien de lignes ont
   été écrites pendant la fenêtre, et sont-elles correctes ? » se pose
   systématiquement, et son coût de réparation dépasse presque toujours celui de
   l'incident lui-même.

Une remarque sur l'ordre : rétablir passe avant comprendre. Mais rétablir ne
veut pas dire « faire quelque chose ». L'étape 3 ci-dessus était une action de
rétablissement, exécutée avec de bonnes intentions, et elle a causé le seul
dommage définitif de tout l'incident. **Sous pression, l'action irréversible est
celle qu'il faut refuser de prendre vite.**

## ⚠️ Erreurs fréquentes
- Vouloir COMPRENDRE avant de RÉTABLIR (l'utilisateur attend le service).
- Tenter un **rollback** après une **migration destructive** → incompatibilité,
  aggravation.
- **Hotfix non reporté** sur main → le bug revient à la release suivante.
- Contourner TOUTES les vérifications « parce que c'est urgent » → second incident.
- Post-mortem transformé en recherche de coupable → on n'apprend rien.

## 🔐 Sécurité
Garder la traçabilité : quel artefact tournait, qui a déclenché quoi. Un rollback
ne doit pas réintroduire une version vulnérable connue (arbitrer). Les accès de
déploiement d'urgence restent audités ; l'urgence ne justifie pas de désactiver la
journalisation.

## 🏢 Cas métier
Une release fait grimper les 500. Les artefacts sont versionnés et aucune
migration destructive n'a eu lieu : rollback vers la version précédente en deux
minutes, service rétabli. Post-mortem : un cas limite non testé ; ajout d'un test
de non-régression et d'une porte qualité. La release suivante repasse, corrigée,
par le cycle normal.

## 🎤 Questions d'entretien
- « Rollback vs roll-forward ? » → revenir à la version précédente vs avancer vers
  une version corrigée.
- « Qu'est-ce qui empêche un rollback ? » → une migration de base destructive /
  non rétro-compatible.
- « Que faire d'un hotfix après l'incident ? » → le reporter sur la branche
  principale pour éviter la régression.

## ✍️ Mini-exercice
Sans relire : cite une situation où le retour arrière du code réussit alors que
le système reste faux, et dis ce qui te le signalerait.

## 🔥 Pratique — écrire et éprouver un manuel de rétablissement

Livrable : un document opérationnel qu'une personne d'astreinte, à trois heures
du matin, peut suivre sans réfléchir — et la preuve qu'il a été éprouvé.

**A. Reproduire la perte.** Écris un script qui reproduit les quatre étapes de
la section guidée sur une base jetable : état initial, migration `NOT NULL
DEFAULT`, écriture par une instance ancienne version, écriture par la nouvelle,
retour arrière du code, retour arrière du schéma. À chaque étape, affiche le
nombre de lignes et le nombre de lignes portant l'information. Livrable : la
sortie, et la ligne exacte où l'information disparaît.

**B. Le manuel.** Rédige la procédure de rétablissement de ton service. Elle
doit tenir sur une page et contenir : la commande exacte de retour arrière (pas
« revenir à la version précédente » mais la commande, copiable) ; la liste
nominative des opérations qui ferment le retour arrière dans **ton** système ;
la requête qui répond à « combien de lignes ont été écrites par la version
fautive » ; qui prévenir et par quel canal.

**C. Éprouver le manuel.** Déclenche une panne volontaire dans un environnement
de test et exécute ton manuel chronomètre en main, sans improviser. Chaque fois
que tu dois sortir du document pour avancer, note-le : c'est un trou. Livrable :
le temps de rétablissement, et la liste des trous.

**D. Le compte rendu.** Rédige le compte rendu de l'incident de A, avec une
chronologie horodatée, la cause racine, et des actions correctives dont chacune
est vérifiable. Interdiction d'écrire le nom d'une personne.

## ✅ Correction attendue

**A — où l'information disparaît.** La sortie attendue reproduit les quatre
moments. Le point que la plupart manquent : l'information disparaît à l'étape du
`DROP COLUMN`, alors que **le nombre de lignes ne bouge pas** (151 avant, 151
après). Si ton script n'affiche que le nombre de lignes, il déclare l'opération
sans conséquence. C'est précisément l'erreur du script `down` : il vérifie que
la structure est revenue à l'état antérieur, et il n'existe aucune vérification
automatique de « quelle information a cessé d'être représentable ». Un bon
script de A affiche donc **deux** compteurs, et la leçon est dans l'écart entre
les deux.

Note aussi l'étape 1 : `une instance v1 écrit encore : ACCEPTÉ, devise = ""`.
La bonne réponse relève que l'absence d'erreur est le problème, pas le
soulagement.

**B — ce qui distingue un manuel utile.** Trois critères.

*La commande doit être copiable.* « Revenir à la version précédente » suppose
qu'on sache où la trouver, sous quel nom, et avec quelle autorisation — trois
choses qu'on ne cherche pas pendant un incident. Le manuel contient la commande
avec ses arguments.

*La liste des opérations qui ferment le retour arrière doit être nominative.*
« Éviter les migrations destructives » n'aide personne à trois heures du matin.
Attendu : la liste de **tes** opérations — quelles tables, quels envois d'e-mails,
quels appels de paiement, quels messages publiés dans une file. La personne
d'astreinte doit pouvoir répondre « oui » ou « non » en trente secondes.

*La requête de périmètre doit être écrite d'avance.* « Combien de commandes ont
été écrites entre 14 h 02 et 14 h 19 » est une requête qu'on n'écrit pas
correctement sous pression. Elle vit dans le manuel, avec les deux horodatages
en paramètres.

**C — le résultat qu'on attend de l'épreuve.** On n'attend pas zéro trou. Un
manuel jamais éprouvé en a typiquement entre trois et six, et ce sont toujours
les mêmes familles : une autorisation manquante (la personne d'astreinte n'a pas
le droit de déclencher le retour arrière), une commande qui a changé depuis
qu'elle a été écrite, une étape implicite que l'auteur connaissait par cœur, et
un contact qui a changé d'équipe. **Le nombre de trous est le résultat de
l'exercice, pas son échec.** Un manuel qui n'a jamais été exécuté a une valeur
inconnue ; on ne peut pas dire s'il est bon, seulement qu'il existe.

Le chronomètre sert à une chose précise : comparer le temps réel au temps que tu
aurais annoncé. L'écart, systématiquement dans le même sens, est ce qui rend les
estimations d'incident irréalistes.

**D — le compte rendu.** La chronologie doit distinguer trois instants qui sont
souvent confondus : le moment où le défaut est **entré** en production, le
moment où il a été **détecté**, le moment où le service a été **rétabli**.
L'écart entre le premier et le deuxième est le seul qui se réduise par
l'outillage, et c'est aussi celui qu'on omet le plus souvent parce qu'il est
gênant.

Sur la cause racine, deux exigences. Elle ne peut pas être « une erreur
humaine » : cela décrit ce qui s'est passé, pas pourquoi le système l'a permis.
Et l'étape 3 de la section guidée montre pourquoi l'analyse doit remonter au
delà du code fautif — la perte définitive n'a pas été causée par le bug, mais
par une action de rétablissement légitime rendue destructive par une décision de
conception prise des semaines plus tôt (colonne `NOT NULL`, script `down`
fourni par défaut). Une analyse qui s'arrête au bug produit une action
corrective qui n'empêchera pas la répétition.

Sur les actions correctives : chacune doit être vérifiable. « Être plus
vigilant » ne l'est pas ; « la CI refuse toute migration contenant `DROP
COLUMN` sans étiquette d'approbation explicite » l'est. L'interdiction de nommer
une personne n'est pas de la politesse : quand un compte rendu désigne un
coupable, les incidents suivants cessent d'être déclarés, et l'organisation perd
sa seule source d'information sur ses propres défaillances.

## 🧾 À retenir
- Rétablir d'abord, comprendre ensuite — mais l'action irréversible est celle
  qu'il faut refuser de prendre vite.
- Retour arrière du **code** : réversible. Retour arrière du **schéma** :
  destructif. Le même mot désigne les deux, d'où la confusion.
- Mesuré : après un `DROP COLUMN`, 151 lignes avant, 151 après, et la devise de
  50 commandes définitivement perdue. « Aucune ligne supprimée » ≠ « aucune
  donnée perdue ».
- Disponibilité rétablie ≠ correction rétablie. Un service qui répond peut
  produire des totaux faux, et c'est la disponibilité qu'on surveille.
- Une colonne `NOT NULL DEFAULT` transforme une incompatibilité bruyante en
  corruption silencieuse. Mesuré : `ACCEPTÉ, devise = ""`.
- Ce qui ferme le retour arrière : suppression de données, e-mails envoyés,
  paiements capturés, messages publiés. La liste doit être écrite d'avance,
  nominative, dans le manuel.
- Un drapeau de fonctionnalité rétablit sans redéployer : c'est la première
  question à poser.
- Un manuel jamais exécuté a une valeur inconnue.

## 📚 Vocabulaire
**rollback** · **roll-forward** · **hotfix** · **feature flag** · **migration
destructive** · **post-mortem sans blâme** · **cause racine** · **rayon
d'impact**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je choisis rollback / roll-forward / flag selon la situation.
- [ ] Je sais pourquoi une migration destructive ferme le rollback.
- [ ] Je reporte les hotfix et je conduis un post-mortem sans blâme.

## 🔗 Liens avec le programme
Mois 11 (production, incidents). Leçons liées :
`/doc/lessons/deployment-strategies`,
`/doc/lessons/ci-cd-quality-gates-artifacts`,
`/doc/lessons/observability-logging`. La reprise après incident boucle le cycle de
livraison et prépare la fiabilité en cloud/Kubernetes.
