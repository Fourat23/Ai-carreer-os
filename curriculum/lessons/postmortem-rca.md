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

## 🛠 Exemple guidé — post-mortem d'un déploiement cassé
1. **Timeline** (depuis l'incident) : release 15 h 00, 5xx 15 h 02, rollback tenté
   15 h 05 (échoue : migration destructive), roll-forward 15 h 20.
2. **Symptôme** : 5xx massifs. **Cause racine** : migration destructive incompatible
   avec la version en cours. **Facteurs** : rollback impossible, pas d'alerte precoce.
3. **Five Whys** → « rien n'empêchait une migration destructive non rétro-compatible ».
4. **Actions préventives** : adopter expand/contract, check CI bloquant, alerte burn
   rate — chacune avec un responsable et une date.

## 🧪 Mise en pratique
Voir la pratique associée : reconstruire une chaîne symptôme→cause, décider
rollback/roll-forward, agréger l'état de santé.

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
