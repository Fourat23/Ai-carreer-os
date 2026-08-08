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
**preuves** (`/doc/lessons/incident-response`). Utile : les mécaniques de
correction (`/doc/lessons/release-incident-recovery`) puisque les actions correctives
s'y réfèrent.

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
