<!-- keep -->
# Leçon — SLI, SLO et error budget : la fiabilité comme un budget

## 🌍 Le problème d'abord
Deux camps s'affrontent dans toutes les équipes : les développeurs veulent LIVRER
vite (nouvelles fonctionnalités), les opérations veulent la STABILITÉ (ne rien
casser). Sans arbitre, c'est un conflit permanent : « tu déploies trop souvent ! » /
« tu bloques tout ! ». Et « viser 100 % de disponibilité » n'est pas la réponse :
c'est impossible et ruineux. Il manque une règle du jeu CHIFFRÉE, acceptée par tous,
qui dise combien de pannes sont tolérables — et qui décide automatiquement quand on
peut continuer à livrer ou quand il faut se concentrer sur la fiabilité. Cette règle,
c'est le trio **SLI / SLO / error budget**. Cette leçon montre pourquoi « 99,9 % »
n'est pas juste un joli chiffre marketing, mais un budget qu'on dépense.

## 🎯 Objectif
Comprendre **SLI** (ce qu'on mesure), **SLO** (l'objectif qu'on se fixe), **SLA**
(l'engagement contractuel), l'**error budget** (le droit à l'échec qui en découle),
le **burn rate**, et pourquoi la fiabilité est un ARBITRAGE, pas un « toujours plus ».

## 🧩 Prérequis
Tu dois savoir lire des **métriques** et des **percentiles** (latence, taux
d'erreur — `/doc/lessons/metrics-percentiles`), car un SLI est une métrique choisie.
Aucune formule de fiabilité n'est supposée.

La seule notion de disponibilité nécessaire ici tient en une phrase : **la disponibilité est
la part du temps pendant laquelle le service rend le service attendu**, et on l'exprime en
« neuf » — 99 % (deux neuf) autorise environ 7 heures d'indisponibilité par mois, 99,9 %
(trois neuf) 43 minutes, 99,99 % (quatre neuf) 4 minutes. Chaque neuf supplémentaire divise
le budget par dix et multiplie le coût d'ingénierie bien davantage. C'est tout ce que la
leçon utilise.

> **Où trouver le détail.** `/doc/lessons/cloud-fundamentals` situe la disponibilité parmi
> les autres propriétés d'une architecture. Elle est sur **l'étagère de référence** : aucune
> des 365 journées ne la programme.

## 🧠 Modèle mental
Pense à un **budget de dépenses**. Tu ne dépenses pas « le moins possible » ni « sans
limite » : tu as un montant, et tant qu'il reste du budget, tu peux dépenser. Ici, la
« dépense » ce sont les PANNES. L'**error budget** est le montant d'échec autorisé
sur une période. Tant qu'il en reste, l'équipe peut prendre des risques (livrer
vite) ; quand il est épuisé, on gèle les nouveautés et on stabilise. La fiabilité
devient une monnaie partagée, pas une dispute.

## 📖 Explication progressive
**SLI — l'indicateur.** Un **Service Level Indicator** est une MESURE de la qualité
vécue : par exemple « % de requêtes réussies en moins de 300 ms » ou « % de
disponibilité ». C'est une métrique bien choisie, du point de vue de l'utilisateur.

**SLO — l'objectif.** Un **Service Level Objective** est la CIBLE qu'on se fixe sur un
SLI : « 99,9 % des requêtes réussies sur 30 jours ». C'est une décision interne, un
contrat avec soi-même.

**SLA — l'engagement.** Un **Service Level Agreement** est un engagement CONTRACTUEL
envers un client, souvent avec pénalités si non tenu. On fixe le SLA plus BAS que le
SLO (marge de sécurité) : on vise 99,9 % en interne pour tenir un SLA de 99,5 %.

**« Pourquoi 99,9 % n'est pas juste un joli chiffre ».** Chaque « neuf » a un COÛT en
temps d'indisponibilité toléré sur 30 jours :
- 99 % → ~7 h 12 min d'indispo/mois.
- 99,9 % → ~43 min/mois.
- 99,99 % → ~4,3 min/mois.
Passer de 99,9 % à 99,99 % divise par 10 le droit à l'erreur — et coûte beaucoup plus
cher (redondance, astreintes). On choisit le SLO selon le BESOIN réel, pas par
esthétique : viser trop haut gaspille, viser trop bas déçoit.

**Error budget — le droit à l'échec.** Si le SLO est 99,9 %, alors 0,1 % d'échecs est
AUTORISÉ : c'est l'error budget. Sur 1 000 000 de requêtes/mois, 1 000 requêtes
peuvent échouer sans « brûler » le contrat. Ce budget se DÉPENSE : chaque incident en
consomme une part.

**Burn rate — la vitesse de consommation.** Le **burn rate** mesure à quelle vitesse
on épuise l'error budget. Un burn rate de 1 = on consomme pile le budget sur la
période. Un burn rate de 10 = on va tout épuiser 10× trop vite → alerte forte. Alerter
sur le burn rate (plutôt que sur chaque erreur) évite la fatigue d'alerte : on ne
réveille quelqu'un que si le budget part vraiment trop vite.

**La règle de décision.** Budget restant → on peut livrer (prendre des risques
mesurés). Budget épuisé → gel des nouveautés, priorité à la fiabilité. C'est objectif
et partagé : fin des disputes développeurs/ops.

**Toil.** Le **toil** est le travail manuel, répétitif, sans valeur durable (relancer
un service à la main chaque nuit). Le réduire (automatisation) libère du temps pour la
fiabilité. Un SLO tenu à coups de toil n'est pas soutenable.

## 🔎 Décomposition
- SLI = la mesure ; SLO = la cible ; SLA = l'engagement contractuel (plus bas que le
  SLO).
- error budget = 100 % − SLO = le droit à l'échec.
- burn rate = vitesse de consommation du budget.
- budget restant → livrer ; budget épuisé → stabiliser.

## 🛠 Exemple guidé — poser un SLO et l'exploiter
« On vise 99,9 % de disponibilité. » Tout le monde acquiesce, personne ne sait ce que ça
autorise. Calculons-le, parce que c'est précisément là que la notion devient un outil de
décision au lieu d'un slogan.

> Les nombres de cette section sont **calculés** par
> `scripts/v70-verifications/slo-budget-erreur.py`.

### Ce qu'un « neuf » de plus coûte vraiment

| Objectif | Par an | Par mois (30 j) | Par semaine | Par jour |
|---|---|---|---|---|
| 99 % | 3,7 j | **7,2 h** | 1,7 h | 14 min |
| 99,5 % | 1,8 j | 3,6 h | 50 min | 7 min |
| **99,9 %** | 8,8 h | **43 min** | 10 min | 1 min |
| 99,95 % | 4,4 h | 22 min | 5 min | 43 s |
| **99,99 %** | 53 min | **4 min** | 1 min | 9 s |

Deux lectures.

**99 % est très permissif** : sept heures par mois. C'est plus qu'une journée de travail
d'indisponibilité, et pourtant l'objectif paraît sérieux quand on l'énonce.

**99,99 % est un autre métier.** Quatre minutes par mois — moins que le temps de comprendre un
incident, a fortiori de le corriger. Un tel objectif suppose que la reprise soit
**automatique** : bascule, dégradation, redémarrage sans humain. Ce n'est plus une exigence de
qualité, c'est une contrainte d'architecture, et son coût est sans commune mesure avec celui
de 99,9 %.

D'où la question à poser avant de choisir un nombre : **combien de minutes par mois
sommes-nous prêts à perdre, et quel budget acceptons-nous d'y consacrer ?** Un objectif choisi
sans cette conversation est un objectif qu'on ne tiendra pas et qu'on cessera de regarder.

### Le budget d'erreur : de l'objectif au nombre d'erreurs

Trente millions de requêtes par mois :

| SLO | Budget d'erreur mensuel |
|---|---|
| 99 % | **300 000** requêtes |
| 99,9 % | **30 000** requêtes |
| 99,99 % | **3 000** requêtes |

C'est le renversement utile : au lieu de « il ne faut pas d'incident », on obtient **une
quantité d'échecs qu'on a le droit de dépenser**. Un budget se dépense, se surveille, et se
répartit.

Et il se consomme vite. Un incident de vingt minutes, à douze mille requêtes par minute,
consomme 240 000 requêtes :

| SLO | Part du budget mensuel consommée par **ce seul incident** |
|---|---|
| 99 % | 80 % |
| 99,9 % | **800 %** |
| 99,99 % | **8 000 %** |

Un seul incident de vingt minutes fait **huit fois** dépasser un objectif de 99,9 %. Personne
ne le devine sans calculer, et c'est ce calcul qui rend la conversation possible : *« notre
objectif implique de ne pas avoir plus de deux minutes et demie d'incident par mois — en
avons-nous les moyens ? »*

### À quoi sert un budget qu'on n'a pas dépensé

C'est la partie que la plupart des équipes n'appliquent jamais, et c'est la seule qui rende le
dispositif utile.

| État du budget | Ce que ça autorise |
|---|---|
| largement disponible | **livrer plus vite**, prendre des risques, migrer, expérimenter |
| entamé, sous surveillance | livrer normalement, mais pas de changement structurel |
| **épuisé** | gel des livraisons non critiques, priorité à la fiabilité |

Le budget d'erreur transforme un débat récurrent — *« il faut aller plus vite » contre *« il
faut être plus stable »* — en une **règle chiffrée que les deux camps ont acceptée d'avance**.
Ce n'est plus une opinion contre une autre : c'est un compteur.

Et il fonctionne dans les deux sens. Un budget systématiquement **inutilisé** ne signifie pas
que tout va bien : il signifie que l'objectif est trop bas, ou qu'on est trop prudent. Une
équipe qui n'entame jamais son budget paie de la fiabilité que personne ne lui demande.

### La vitesse de consommation

Le budget dit *combien il reste*. La vitesse de consommation dit *à quelle allure il part* —
et c'est elle qui déclenche les alertes.

```
vitesse = (taux d'erreur observé) / (taux d'erreur autorisé)
```

Une vitesse de **1** consomme exactement le budget sur la période. Une vitesse de **14** épuise
un budget mensuel en un peu plus de deux jours.

C'est l'indicateur d'alerte correct, et il évite les deux défauts habituels :

- alerter sur **le taux d'erreur brut** réveille pour un pic de trois minutes sans conséquence ;
- alerter sur **le budget restant** réveille trop tard, quand tout est déjà consommé.

La pratique courante combine deux fenêtres : une vitesse élevée sur une heure déclenche une
alerte immédiate ; une vitesse modérée sur six heures déclenche un ticket. Rapide et grave
réveille ; lent et grave n'est pas urgent, mais ne doit pas être oublié.

### Le SLI, et pourquoi il se choisit en premier

Un indicateur de niveau de service se mesure **du point de vue de l'utilisateur** :

> *pourcentage de requêtes réussies en moins de 300 ms*

Ce que cette formulation contient et qu'un « taux de disponibilité » n'a pas : un **critère de
succès** (pas d'erreur **et** rapide) et un **seuil explicite**. Une requête qui répond
correctement en douze secondes n'est pas un succès pour l'utilisateur ; elle l'est pour la
plupart des tableaux de bord.

Le piège inverse est l'indicateur commode : *« le processus tourne »*, *« le point de santé
répond »*. Ce sont des indicateurs qui restent verts pendant que le produit est inutilisable —
faciles à mesurer, et sans rapport avec ce que vit quelqu'un.

**Un bon indicateur est celui qui devient rouge quand un utilisateur est mécontent, et
seulement à ce moment-là.**


## 🧪 Mise en pratique
Voir la pratique associée : calculer l'error budget restant à partir du SLO et des
échecs observés.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ton service tourne à 99,95 % de succès depuis six mois. Quel SLO poses-tu, et
   pourquoi ?
2. Un SLO à 99,9 % sur 30 jours : combien de minutes d'indisponibilité cela autorise-t-il ?
   Refais le calcul pour 99,99 %.
3. L'error budget du mois est intact au 28 du mois. Bonne ou mauvaise nouvelle ?
4. Ton SLI est « le taux de réponses HTTP 2xx ». Nomme une panne totale du point de vue
   de l'utilisateur que cet indicateur ne verrait pas.

## ✅ Correction attendue

**La démarche.** Un SLO n'est pas une mesure, c'est une **décision** : le niveau de
fiabilité en dessous duquel on arrête de livrer des nouveautés. Il se pose donc en
partant de ce dont les utilisateurs ont besoin et de ce que l'entreprise est prête à
payer — jamais en partant de ce que le graphique affiche.

**L'erreur probable : poser le SLO au niveau qu'on atteint déjà.** « On fait 99,95 %,
donc notre SLO est 99,95 %. » C'est la réponse la plus fréquente et elle vide
l'exercice de tout contenu, de deux façons à la fois.

D'abord, **elle ne décide de rien.** Un SLO égal à la performance actuelle produit un
budget nul en pratique : le moindre incident le dépasse, l'équipe gèle ses livraisons,
et comme ce gel est intenable, on finit par ignorer le SLO. Un indicateur qu'on ignore
est pire qu'aucun indicateur, parce qu'il donne l'illusion d'un garde-fou.

Ensuite, **elle inverse le raisonnement.** Le SLO est censé dire « voilà ce dont nos
utilisateurs ont besoin », ce qui permet ensuite de constater qu'on fait mieux — et
donc qu'on peut dépenser cette marge en vélocité. Le poser sur la mesure, c'est
transformer une cible en description, et perdre exactement l'information qui rendait
l'outil utile : **de combien de marge dispose-t-on ?**

Le piège séduit parce que la mesure est le seul chiffre disponible, et qu'il paraît
objectif — donc défendable en réunion. Choisir 99,5 % quand on fait 99,95 % demande
d'assumer devant sa hiérarchie qu'on s'autorise à faire moins bien qu'aujourd'hui. La
bonne réponse est presque toujours **un SLO strictement inférieur à la performance
observée**, et l'écart est précisément ce qu'on a le droit de dépenser.

**Sur les autres questions.** 30 jours font 43 200 minutes ; 0,1 % en fait **43,2**, et
0,01 % en fait **4,3** — passer de trois à quatre neufs divise le budget par dix et
multiplie le coût d'ingénierie bien davantage. C'est le calcul qui rend concrète la
phrase « viser 100 % est ruineux ».

Un budget **intact au 28 du mois** est une mauvaise nouvelle, et c'est le point le plus
contre-intuitif de la leçon : cela signifie qu'on a été plus prudent que nécessaire.
Le budget n'est pas une réserve de sécurité à préserver, c'est une **autorisation de
dépense** — de la vélocité qu'on n'a pas prise, des livraisons qu'on n'a pas faites,
des risques utiles qu'on a refusés. Un budget systématiquement inutilisé signale un SLO
mal posé, trop bas ou trop haut selon le cas.

Enfin, un SLI fondé sur les `2xx` rate une panne totale évidente : **l'API qui répond
`200` avec un corps vide, ou avec une page d'erreur.** Elle rate aussi la lenteur — une
réponse correcte en 30 secondes est un `2xx`. C'est pourquoi un bon SLI combine
presque toujours succès **et** latence : « % de requêtes réussies **sous 300 ms** ».

**Alternative défendable.** Pour un service interne, un produit jeune ou un outil sans
engagement contractuel, ne pas poser de SLO du tout est une position tenable — mieux
vaut aucun SLO qu'un SLO décoratif que personne n'applique. Ce qui n'est pas défendable
est d'en afficher un et de continuer à livrer quand il est épuisé : cela apprend à
l'équipe que les indicateurs sont négociables, et cette leçon-là se retient.

**Vérifie seul, sans corrigé** :
1. Calcule le budget en minutes de ton SLO actuel. Si tu ne connais pas ton SLO, c'est
   la réponse.
2. Regarde le dernier mois : le budget a-t-il été consommé ? Si non, qu'as-tu refusé de
   livrer et pourquoi ?
3. Demande à ton SLI : quelle panne visible par un utilisateur le laisserait vert ?
   Écris-la. C'est ton prochain indicateur.

## ⚠️ Erreurs fréquentes / anti-patterns
- **Viser 100 %** : impossible, ruineux, et cache que la vraie question est « combien
  de neuf a-t-on VRAIMENT besoin ? ».
- Confondre **SLO** (interne) et **SLA** (contractuel avec pénalités).
- Choisir un **SLI côté infra** (CPU) au lieu de l'expérience utilisateur.
- Alerter sur chaque erreur au lieu du **burn rate** → fatigue d'alerte.
- Tenir le SLO à coups de **toil** manuel non soutenable.

## 🏢 Cas métier
Une équipe se disputait à chaque release. En adoptant un SLO à 99,9 % et un error
budget partagé, la règle est devenue objective : tant qu'il reste du budget, on
livre ; quand un mois consomme tout (gros incident), on gèle les features deux
semaines pour fiabiliser. Les tensions développeurs/ops ont chuté : ce n'est plus une
opinion, c'est un chiffre.

## 🚨 Que faire dans ce cas ? — « le SLO est consommé trop vite (burn rate élevé) »
- **Observer** : quel SLI se dégrade ? depuis quand ? corrélé à quel changement ?
- **Limiter l'impact** : si une release en est la cause, envisager rollback.
- **Décider** : si le budget est presque épuisé, GELER les nouveautés (règle error
  budget) et traiter la cause.
- **Valider** : le burn rate redescend-il ? le budget se reconstitue-t-il ?
- **Prévenir** : alerte sur le burn rate (pas sur chaque erreur), post-mortem si
  incident majeur.

## 🔥 Pratique — poser un objectif et l'exploiter

**A. Le budget en minutes.** Pour 99 %, 99,9 % et 99,99 %, calcule le temps
d'indisponibilité autorisé par mois et par an. Livrable : le tableau des six
valeurs.

**B. Ce qu'un incident consomme.** Prends une durée d'incident réaliste pour ton
service et calcule quelle part du budget mensuel il consomme, aux trois niveaux
de A. Livrable : les trois pourcentages.

**C. Définir « disponible ».** Écris la définition exacte de ce qui compte comme
succès pour ton service. Livrable : la définition, et trois cas limites que tu
as dû trancher.

**D. Mesurer depuis le bon endroit.** Compare ce que dirait la mesure prise sur
ton serveur et celle prise depuis le client. Livrable : deux situations où les
deux divergent.

**E. La décision.** Écris la règle qui lie l'état du budget à une décision
d'équipe. Livrable : la règle, et ce qu'elle interdit concrètement.

## ✅ Correction attendue

> Les valeurs de A et B sont **calculées** par
> `scripts/v70-verifications/slo-budget-erreur.py`.

**A — le budget.** Les valeurs mesurées, par mois de 30 jours :

```
99 %     : 7 h 12 min      par mois
99,9 %   :   43 min        par mois
99,99 %  :    4,3 min      par mois
```

Le résultat à faire sentir : **chaque neuf supplémentaire divise le budget par
dix**, et le coût pour l'obtenir, lui, augmente bien plus vite. Le passage de
99,9 % à 99,99 % fait tomber le budget à quatre minutes par mois — ce qui exclut
toute intervention humaine dans la boucle de rétablissement, et impose donc une
architecture entièrement différente.

**B — ce qu'un incident consomme.** Mesuré : **un seul incident de 20 minutes
consomme 800 % du budget mensuel à 99,9 %.**

Ce chiffre est le cœur de la leçon. Il rend concret ce que « trois neuf »
signifie : non pas « on peut avoir quelques incidents », mais **un incident de
vingt minutes par trimestre est déjà hors budget**. Un objectif s'écrit donc à
partir de ce calcul, pas à partir d'un nombre de neuf qui sonne bien.

**C — définir « disponible ».** C'est la partie que tout le monde saute, et elle
détermine tout le reste. Les trois cas limites qu'on doit trancher explicitement :

- une réponse **lente mais correcte** — au-delà de quel seuil compte-t-elle comme
  échec ? Sans seuil, un service qui répond en trente secondes est « disponible ».
- une **erreur du client** (requête invalide) — elle ne devrait pas consommer ton
  budget, mais elle apparaît dans le taux d'erreur brut.
- une **dégradation partielle** — la page s'affiche sans les recommandations.
  Succès ou échec ? Il n'y a pas de bonne réponse universelle ; il y a une
  décision à prendre et à écrire.

**D — depuis où on mesure.** Les deux divergences qui comptent :

Le serveur ne voit pas ce qui ne l'atteint pas. Une panne de résolution de nom,
un répartiteur en panne, un problème de réseau côté client : le serveur affiche
100 % de disponibilité pendant que personne ne peut se connecter. C'est le cas le
plus grave, parce qu'il produit un tableau de bord vert pendant une panne totale.

Inversement, une mesure côté client inclut des échecs qui ne sont pas les tiens —
le réseau mobile de l'utilisateur. Sans distinction, on consomme du budget pour
des causes sur lesquelles on n'a aucune prise.

La réponse pratique : **mesurer au plus près de l'utilisateur tout en excluant
explicitement ce qui n'est pas de ton ressort**, et savoir dire lequel des deux
points de mesure produit le chiffre qu'on publie.

**E — la décision, qui est la seule raison d'avoir un budget.** Un objectif sans
conséquence est un chiffre décoratif. La règle attendue lie l'état du budget à
une action :

```
budget consommé < 50 %  : rythme normal, on livre
budget entre 50 et 100 %: on ralentit, on priorise la fiabilité
budget épuisé           : gel des livraisons non correctives jusqu au
                          rétablissement du budget
```

Ce que cette règle **interdit concrètement** est le point important : quand le
budget est épuisé, on ne livre plus de fonctionnalités. C'est une contrainte
réelle sur le travail de l'équipe, et c'est ce qui transforme la fiabilité d'un
souhait en une priorité.

Le corollaire est moins intuitif et tout aussi important : **un budget largement
inutilisé signale un objectif trop conservateur.** On paie de la fiabilité que
personne n'a demandée, au prix de fonctionnalités non livrées. Un budget est fait
pour être **consommé**, pas économisé.

## 🎤 Questions d'entretien
- « SLI vs SLO vs SLA ? » → mesure vs objectif interne vs engagement contractuel.
- « Pourquoi ne pas viser 100 % ? » → impossible/ruineux ; l'error budget rend le
  compromis fiabilité/vélocité explicite.
- « À quoi sert le burn rate ? » → mesurer la vitesse de consommation du budget et
  alerter intelligemment.

## ✅ À retenir
- SLI (mesure) → SLO (cible) → error budget (100 % − SLO = droit à l'échec).
- SLA contractuel < SLO interne (marge).
- Chaque « neuf » coûte : 99,9 % ≈ 43 min d'indispo/mois.
- Budget restant → livrer ; épuisé → stabiliser. Alerter sur le burn rate.

## 📚 Vocabulaire
**SLI** · **SLO** · **SLA** · **error budget** · **burn rate** · **disponibilité
(availability)** · **fiabilité (reliability)** · **toil** · **fatigue d'alerte** ·
**neuf (99,9 %)**.

## 🎯 Pratique associée
Exercice : calcul de l'error budget restant.

## 🔗 Liens avec le programme
Jour `/day/79` (observabilité/SLO). Leçons liées :
`/doc/lessons/metrics-percentiles`, `/doc/lessons/observability-fundamentals`,
`/doc/lessons/incident-response`. L'error budget décide quand livrer et quand
stabiliser ; il se relie à la gestion d'incident et aux stratégies de déploiement.
