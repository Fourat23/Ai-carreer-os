<!-- keep -->
# Leçon — Post-mortem et analyse de cause racine (RCA)

## 🌍 Le problème d'abord
L'incident est terminé, le service est rétabli, tout le monde veut passer à autre
chose. Grave erreur : si on ne comprend pas POURQUOI c'est arrivé, ça
recommencera — souvent en pire. Mais l'analyse d'après-incident tourne souvent mal :
on cherche « qui a cassé la prod ? », la personne se braque, se défend, et personne
n'ose plus toucher à rien. On apprend alors la peur, pas la fiabilité. Le
**post-mortem sans blâme** renverse ça : on n'accuse pas une personne, on interroge
le SYSTÈME qui a permis l'erreur. Cette leçon apprend à transformer un incident en
progrès durable, avec une méthode d'analyse de cause racine (RCA).

## 🎯 Objectif
Savoir conduire un **post-mortem sans blâme**, mener une **analyse de cause racine
(RCA)** avec les **Five Whys**, distinguer **symptôme / cause / facteur contributif**,
et produire des **actions correctives et préventives** qui empêchent la récidive.

## 🧩 Prérequis
Tu dois connaître le déroulé d'un incident et l'importance de la **timeline** et des
**preuves** (`/doc/lessons/incident-response`). 
> **Étagère de référence.** `/doc/lessons/release-incident-recovery` détaille les mécaniques
> de retour arrière auxquelles les actions correctives se réfèrent. Elle n'est programmée par
> aucune des 365 journées. L'essentiel est rappelé dans les prérequis de
> `/doc/lessons/incident-response`, qui est programmée : rollback si l'artefact précédent
> existe encore et qu'aucune migration destructive n'a eu lieu, roll-forward sinon.

## 🧠 Modèle mental
Pense à l'aviation. Après un incident aérien, on n'emprisonne pas le pilote par
réflexe : on analyse la chaîne complète (procédures, formation, signaux, fatigue)
pour que ça n'arrive plus à PERSONNE. C'est le principe « sans blâme » : les gens
compétents font des erreurs quand le système le PERMET. On corrige le système. Limite
de l'analogie : en logiciel les enjeux humains sont moindres, mais la logique est la
même — chercher la cause systémique, pas un coupable.

## 📖 Explication progressive
**Post-mortem sans blâme.** Réunion après incident où l'on reconstitue les faits
(depuis la timeline) et on cherche à COMPRENDRE, pas à punir. Hypothèse de départ :
chacun a agi raisonnablement avec les informations dont il disposait. Si on cherche un
coupable, les gens cachent l'information → on n'apprend rien. Sans blâme, ils la
partagent → on progresse.

**Symptôme vs cause vs facteur contributif.**
- **Symptôme** : ce qu'on a observé (« les 5xx ont explosé »).
- **Cause racine** : la raison profonde (« une migration a supprimé une colonne encore
  lue par l'ancienne version »).
- **Facteur contributif** : ce qui a aggravé sans être LA cause (« pas d'alerte sur le
  taux d'erreur », « rollback impossible car migration destructive »).
Corriger le symptôme (relancer) ne suffit jamais : ça revient. On vise la cause
racine ET les facteurs contributifs.

**Five Whys (les cinq pourquoi).** Une technique simple pour creuser : on demande
« pourquoi ? » en chaîne jusqu'à la cause systémique.
1. Pourquoi les 5xx ? → l'app plantait sur une colonne absente.
2. Pourquoi absente ? → une migration l'a supprimée.
3. Pourquoi ça a cassé l'app ? → l'ancienne version tournait encore et la lisait.
4. Pourquoi une migration destructive pendant un déploiement progressif ? → pas de
   règle expand/contract connue.
5. Pourquoi pas de garde-fou ? → pas de revue des migrations ni de check en CI.
La vraie cause n'est pas « la migration » mais « rien n'empêchait une migration
destructive » → action systémique.

**Actions correctives vs préventives.**
- **Corrective** : répare la situation présente (restaurer la colonne, corriger le
  code).
- **Préventive** : empêche la RÉCIDIVE (règle expand/contract, check en CI qui refuse
  une migration destructive non compatible, alerte sur le taux d'erreur).
Un bon post-mortem produit surtout des actions PRÉVENTIVES, avec un responsable et une
échéance — sinon le document dort et l'incident revient.

## 🔎 Décomposition
- sans blâme → les gens partagent l'info → on apprend.
- symptôme (observé) → cause racine (le fond) → facteurs contributifs (aggravants).
- Five Whys : creuser jusqu'au systémique.
- actions préventives assignées + datées, sinon inutiles.

## 🛠 Exemple guidé — « la » cause racine n'existe pas

La méthode des cinq pourquoi est enseignée partout, et elle a un défaut qu'on
mentionne rarement : **elle produit une réponse différente selon la personne qui
pose les questions**, sur exactement le même incident. Ce n'est pas un défaut
d'exécution, c'est une propriété de la méthode, et savoir cela change la façon
d'écrire un compte rendu.

**L'incident**, unique et factuel : après une mise en production, le service a
renvoyé des erreurs 500 pendant 37 minutes.

Le script `scripts/v70-verifications/incidents-arithmetique.mjs` déroule trois
chaînes de « pourquoi », toutes correctes, toutes partant du même fait.

**Chemin A — on interroge le code.**

```
· le service a renvoyé des erreurs 500
↳ une requête SQL a échoué
↳ une colonne attendue n existait pas
↳ la migration n avait pas été appliquée
↳ le script de déploiement ne lance pas les migrations
=> action : le déploiement applique les migrations
```

**Chemin B — on interroge le processus.**

```
· le service a renvoyé des erreurs 500
↳ une version incompatible avec le schéma est partie en production
↳ personne n a vérifié la compatibilité avant la mise en production
↳ la revue ne demande pas de vérifier les migrations
↳ la liste de contrôle de mise en production n a jamais été relue
=> action : la revue exige une vérification de compatibilité
```

**Chemin C — on interroge la détection.**

```
· le service a renvoyé des erreurs 500
↳ la panne a duré 37 minutes
↳ personne n a vu les erreurs pendant 6 minutes
↳ aucune alerte ne surveille le taux d erreur par version
↳ le tableau de bord n est pas découpé par version déployée
=> action : alerter sur le taux d erreur par version
```

### Ce que ça implique

Les trois chaînes sont valides et mènent à trois actions correctives
**différentes et non redondantes**. Il n'y a pas de chaîne fausse à éliminer : il
y a un **arbre** de causes, et les cinq pourquoi n'en explorent qu'une branche —
celle que choisit la personne qui pose les questions, généralement sans le savoir.

En pratique, l'ingénieur qui a corrigé le bug prend le chemin A, parce que c'est
celui qu'il vient de parcourir. Le compte rendu produit alors une seule action —
« le déploiement applique les migrations » — qui est juste, utile, et qui laisse
intactes les deux autres branches. Le prochain incident aura une autre cause
technique, ne sera pas plus vite détecté, et ne sera pas plus vite attrapé en
revue.

**Un compte rendu utile explore donc trois axes, systématiquement :**

1. **Ce qui a cassé** — la cause technique. C'est celle qu'on trouve toujours.
2. **Ce qui l'a laissé passer** — la barrière absente ou franchie. Test, revue,
   porte qualité, environnement de recette.
3. **Ce qui a retardé la détection et le rétablissement** — c'est l'axe le plus
   négligé et souvent le plus rentable, parce qu'il protège aussi des incidents
   qu'on n'a pas imaginés.

### Le calcul qui justifie l'axe 3

Sur six occurrences par an d'un incident de 37 minutes, soit 3,7 heures par an :

```
corriger le bug de cette fois        : 3,1 h/an  (−17 %)
diviser le temps de diagnostic par 2 : 2,6 h/an  (−30 %)
les deux                             : 2,2 h/an  (−41 %)
```

**Corriger le bug ne protège que de ce bug.** Réduire le temps de diagnostic
protège de tous les incidents à venir, y compris de ceux qu'on ne peut pas
prévoir — et c'est précisément la catégorie qui compte, puisque par définition on
ne les a pas anticipés.

Ce calcul n'invite pas à ne plus corriger les bugs : la correction est moins
chère et se fait de toute façon. Il tranche sur l'action **supplémentaire** qu'on
choisit de financer, et il explique pourquoi une équipe qui produit chaque fois
un compte rendu impeccable peut ne jamais voir sa fiabilité s'améliorer.

### Sans blâme — et pourquoi ce n'est pas de la politesse

L'interdiction de nommer une personne n'est pas une convenance sociale : c'est un
choix d'ingénierie, et il a une justification opérationnelle.

Une cause racine ne peut pas être « une erreur humaine ». Cela décrit ce qui
s'est passé, pas **pourquoi le système l'a permis**. La question qui remplace
utilement le blâme : « qu'est-ce qui a rendu cette erreur facile à commettre et
difficile à détecter ? » — et elle produit des actions, ce que le blâme ne fait
jamais.

La conséquence pratique est celle qui devrait convaincre les plus sceptiques :
quand un compte rendu désigne un coupable, **les incidents suivants cessent
d'être déclarés**. On répare discrètement, on ne dit rien, et l'organisation perd
sa seule source d'information sur ses propres défaillances. Un incident non
déclaré est un incident dont on ne tire rien et qui se reproduira.

## 🧪 Mise en pratique — écrire un compte rendu qui change quelque chose

**A. Explorer trois branches.** Prends un incident réel (ou celui de la section
guidée) et construis **trois** chaînes de « pourquoi » distinctes : le code, le
processus, la détection. Livrable : les trois chaînes et les trois actions
correctives, toutes différentes.

**B. La chronologie.** Reconstitue la chronologie horodatée en distinguant trois
instants : quand le défaut est **entré** en production, quand il a été
**détecté**, quand le service a été **rétabli**. Livrable : les trois horodatages
et les deux écarts.

**C. Des actions vérifiables.** Réécris chaque action corrective de A sous une
forme dont on peut constater l'existence sans demander à personne. Livrable :
pour chacune, la phrase et le moyen de vérifier qu'elle est en place.

**D. Chiffrer.** Estime le nombre d'occurrences par an de ce type d'incident et
sa durée moyenne. Calcule ce que rapporterait chaque action de A sur un an.
Livrable : le tableau, et l'action que tu finances en premier.

**E. Le test du blâme.** Relis ton compte rendu et supprime tout nom de personne
ainsi que toute formulation qui en désigne une implicitement (« l'auteur de la
demande de fusion », « celui qui était d'astreinte »). Si un paragraphe devient
vide, c'est qu'il ne contenait pas d'analyse.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Un post-mortem conclut : « cause racine — un développeur a lancé une migration
   destructive en production ». Qu'est-ce qui ne va pas dans cette phrase ?
2. Les cinq pourquoi de l'exemple s'arrêtent à « pas de revue des migrations ni de
   check en CI ». Pourquoi s'arrêter là plutôt qu'à quatre ou à six ?
3. Un post-mortem produit huit actions. Six mois plus tard, l'incident se reproduit.
   Quelle est l'hypothèse la plus probable, et comment la vérifies-tu ?
4. Ton équipe est petite et tout le monde se connaît. Le « sans blâme » est-il encore
   nécessaire ?

## ✅ Correction attendue

**La démarche.** Reconstituer les faits horodatés, séparer symptôme / cause /
facteurs contributifs, puis remonter par les cinq pourquoi jusqu'à un niveau où
l'action possible est **systémique** et non individuelle.

**L'erreur probable : s'arrêter à la personne.** « Un développeur a lancé une
migration destructive » est factuellement exact et pourtant inutilisable. Ce n'est pas
une cause racine : c'est **l'endroit où l'enquête s'est arrêtée**.

Le test qui tranche : *l'action corrective désigne-t-elle un comportement, ou un
système ?* « Faire attention aux migrations » est un vœu ; « refuser en CI toute
migration destructive non précédée d'un déploiement compatible » est un mécanisme. Le
premier repose sur la vigilance permanente d'êtres humains fatigués à 15 h un
vendredi ; le second fonctionne même quand personne ne fait attention.

Le piège séduit pour deux raisons qui se renforcent. D'abord, **l'enquête se termine
naturellement quand on trouve quelqu'un** : il y a une réponse, elle est
vérifiable, on peut fermer le ticket. Ensuite, le blâme est **rassurant** — si c'est la
faute de quelqu'un, alors le système va bien, et il suffira que cette personne soit
plus prudente. C'est exactement l'inverse qui est vrai : si une seule inattention
suffisait à casser la production, c'est le système qui est fautif, et la prochaine
inattention viendra de quelqu'un d'autre.

C'est aussi la raison profonde du « sans blâme », et elle n'est pas de politesse : une
enquête qui cherche un coupable **reçoit moins d'informations**. Les gens taisent ce
qu'ils ont réellement fait, les hypothèses embarrassantes ne sont pas formulées, et le
post-mortem produit un récit propre et faux.

**Sur les autres questions.** Les cinq pourquoi s'arrêtent quand on atteint **le
premier niveau où l'on a le pouvoir d'agir durablement** — ni avant (on corrigerait un
symptôme), ni après (« pourquoi n'avons-nous pas de culture d'ingénierie ? » est vrai,
et inactionnable). « Cinq » est une indication, pas une règle : certaines chaînes
s'arrêtent à trois, d'autres continuent à sept.

Huit actions et une récidive : l'hypothèse la plus probable est que **les actions
n'ont pas été faites**, pas qu'elles étaient mauvaises. C'est le mode de défaillance
numéro un du post-mortem — le document est excellent, chacun approuve, et rien n'a de
responsable ni de date. Vérification directe : ouvre le post-mortem précédent et
compte les actions effectivement livrées. Un post-mortem sans nom et sans échéance en
face de chaque action est un texte de littérature.

Et le « sans blâme » dans une petite équipe soudée : **encore plus nécessaire**,
justement parce qu'on se connaît. Le blâme n'a pas besoin d'être formulé pour opérer ;
il suffit qu'une personne pense que l'incident sera associé à son nom pour qu'elle
omette un détail. La taille de l'équipe ne change rien au mécanisme.

**Alternative défendable.** Toutes les organisations ne pratiquent pas les cinq
pourquoi. L'approche **par facteurs contributifs multiples** — on renonce à *la* cause
racine et on liste les conditions qui, ensemble, ont rendu l'incident possible — est
plus fidèle à la réalité des systèmes complexes, où il n'y a presque jamais une cause
unique. Elle est moins facile à communiquer, et c'est son seul vrai défaut.

**Vérifie seul, sans corrigé** :
1. Reprends ton dernier post-mortem. Chaque action a-t-elle un nom et une date ?
   Combien sont livrées ?
2. Relis ta cause racine. Contient-elle le nom ou le rôle d'une personne ? Si oui,
   pose un pourquoi de plus.
3. Pour chaque action préventive, demande : *si personne n'y pense, est-ce que ça
   marche quand même ?* Si non, ce n'est pas une action préventive.

### Sur la mise en pratique A → E

**A — les trois branches.** Le critère de réussite est que les trois actions
soient **non redondantes** : si tes trois chaînes mènent à la même action, tu as
posé trois fois la même question sous des formes différentes. Le repère est
qu'une branche remonte au code, une aux barrières (test, revue, recette), une au
temps (détection, diagnostic, rétablissement).

Si une branche te paraît impossible à construire, c'est souvent une information :
« aucune barrière n'aurait pu attraper ça » signifie qu'il n'y a pas de barrière,
pas qu'elle a bien fonctionné.

**B — les trois instants.** L'écart le plus souvent omis est le premier — entre
l'entrée du défaut et sa détection — parce qu'il est gênant : il peut se compter
en jours pour un défaut silencieux, et il ne figure dans aucune métrique
habituelle. C'est pourtant le seul des deux écarts qui se réduise directement par
l'outillage, et donc le plus actionnable.

Le piège de reconstitution : on ne peut pas retrouver ces instants de mémoire,
surtout l'ordre exact des actions pendant l'incident. D'où l'importance du
journal horodaté tenu **pendant**, mentionné dans la leçon `incident-response`.
Si ton exercice bute ici, c'est le vrai résultat de l'exercice.

**C — la vérifiabilité.** Le test : peut-on constater l'existence de l'action
sans demander à personne ?

- « être plus vigilant sur les migrations » — non vérifiable ;
- « ajouter une étape dans la liste de contrôle » — vérifiable, mais rien ne
  garantit qu'elle sera suivie ;
- « la CI refuse toute migration contenant `DROP COLUMN` sans étiquette
  d'approbation explicite » — vérifiable **et** contraignante.

L'échelle a trois barreaux et il faut savoir les nommer : une action peut être
non vérifiable, vérifiable, ou automatiquement appliquée. Chaque barreau coûte
plus cher que le précédent, et chaque compte rendu ne peut pas financer le
troisième pour tout. Le choix se justifie par D.

Ajout attendu d'une bonne réponse : chaque action a un **propriétaire** et une
**échéance**. Une action corrective sans les deux n'est pas une action, c'est un
souhait — et la relecture des comptes rendus de l'année précédente est le moyen
le plus rapide de mesurer combien de souhaits une équipe produit.

**D — le chiffrage.** Les ordres de grandeur du calcul : −17 % pour la correction
du bug, −30 % pour la réduction du temps de diagnostic, −41 % pour les deux. La
conclusion attendue n'est pas « le diagnostic d'abord » dans l'absolu : c'est que
**le calcul doit être fait**, parce que l'intuition privilégie systématiquement
la correction technique, qui est la plus visible et la plus satisfaisante.

Une nuance à ne pas manquer : les actions du deuxième type (détection,
diagnostic) sont **mutualisées** entre incidents. Leur bénéfice doit donc être
compté sur l'ensemble des incidents de l'année, pas sur celui-ci seul — ce qui
les rend nettement plus rentables que ne le suggère un calcul mené sur un seul
incident.

**E — le test du blâme.** Ce qui reste après suppression des noms est l'analyse ;
ce qui disparaît était du récit. Un paragraphe qui devient vide n'était pas
neutre : il expliquait l'incident par une personne, ce qui ne produit aucune
action.

La reformulation attendue transforme « X a oublié d'appliquer la migration » en
« le déploiement n'applique pas les migrations et rien ne le signale ». La
seconde phrase est vérifiable, produit une action, et reste vraie quelle que soit
la personne concernée — ce qui est le test le plus simple de sa qualité.

## ⚠️ Erreurs fréquentes / anti-patterns
- **Chercher un coupable** → les gens cachent l'info, aucune leçon tirée.
- S'arrêter au **symptôme** (« on a relancé, c'est réglé ») → récidive garantie.
- Post-mortem sans **actions préventives** assignées/datées → document mort.
- Confondre cause racine et premier « pourquoi » (creuser insuffisamment).
- Blâmer « l'erreur humaine » sans se demander pourquoi le système l'a permise.

## 🏢 Cas métier
Après trois incidents similaires en deux mois, une équipe a instauré des post-mortems
sans blâme systématiques. Le troisième a révélé un facteur commun : aucune alerte
précoce sur le taux d'erreur. L'action préventive (alerte sur le burn rate + check CI
des migrations) a supprimé cette famille d'incidents. Le changement clé : cesser
d'accuser des personnes pour corriger le système.

## 🚨 Que faire dans ce cas ? — « le même incident se répète »
- **Observer** : rassembler les post-mortems précédents — un facteur commun ?
- **Analyser** : Five Whys sur la répétition elle-même (« pourquoi les actions
  préventives n'ont-elles pas été faites/efficaces ? »).
- **Corriger** : action préventive RÉELLEMENT priorisée (responsable, échéance,
  vérifiable).
- **Prévenir** : suivre l'exécution des actions post-mortem comme du vrai travail, pas
  comme un vœu pieux.

## 🎤 Questions d'entretien
- « Pourquoi un post-mortem sans blâme ? » → pour que les gens partagent
  l'information et qu'on corrige le système, pas les personnes.
- « Symptôme vs cause racine ? » → ce qu'on observe vs la raison profonde ; corriger
  le symptôme fait récidiver.
- « À quoi servent les Five Whys ? » → creuser jusqu'à la cause systémique.

## ✅ À retenir
- Sans blâme : on interroge le système, pas les personnes.
- Symptôme ≠ cause racine ≠ facteur contributif ; viser la cause + les aggravants.
- Five Whys pour creuser jusqu'au systémique.
- Un post-mortem utile produit des actions préventives assignées et datées.

## 📚 Vocabulaire
**post-mortem** · **sans blâme (blameless)** · **RCA (analyse de cause racine)** ·
**Five Whys** · **symptôme / cause racine / facteur contributif** · **action
corrective / préventive** · **timeline** · **récidive**.

## 🎯 Pratique associée
Exercices : chaîne symptôme→cause, décision de reprise, agrégation de santé.

## 🔗 Liens avec le programme
Jour `/day/79` (incident/observabilité). Leçons liées :
`/doc/lessons/incident-response`, `/doc/lessons/release-incident-recovery`,
`/doc/lessons/deployment-strategies`. Le post-mortem transforme un incident en
prévention durable.
