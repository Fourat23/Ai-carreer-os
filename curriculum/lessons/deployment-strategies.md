<!-- keep -->
# Leçon — Stratégies de déploiement sans coupure

## 🌍 Le problème d'abord
Mettre en ligne une nouvelle version, c'est risqué : et si elle contient un bug ? La
tentation du débutant est de tout remplacer d'un coup — mais alors, si ça casse, TOUT
casse pour TOUS les utilisateurs en même temps. Il existe des façons de déployer qui
limitent la casse : remplacer progressivement, ou n'exposer d'abord la nouveauté qu'à
1 % des visiteurs, ou pouvoir revenir en arrière en une seconde. Et un piège sournois
guette : modifier la base de données de façon irréversible pendant que l'ancienne
version tourne encore. Cette leçon présente les stratégies (rolling, blue-green,
canary, feature flags) comme des réponses à UNE question : « comment réduire le rayon
d'impact d'une mauvaise version ? ».

## 🎯 Objectif
Livrer une nouvelle version SANS interrompre le service et en limitant le rayon
d'impact d'un bug : **rolling update**, **blue-green**, **canary**, **feature
flags**, et le cas piégeux des **migrations de base compatibles**. Choisir la
bonne stratégie selon le risque.

## 🧩 Prérequis
Vous devez comprendre les **artefacts versionnés** (pour pouvoir revenir à une
version précédente — `/doc/lessons/ci-cd-quality-gates-artifacts`) et le **load
balancing / health check** (`/doc/lessons/networking-proxy-loadbalancing`), car le
déploiement sans coupure repose sur le routage vers les instances saines.

## 🧠 Modèle mental
Déployer, c'est **remplacer progressivement** l'ancienne version par la nouvelle
en gardant le service debout. Deux leviers : COMMENT on bascule le trafic
(d'un coup, par vagues, sur une fraction d'utilisateurs) et COMMENT on peut
revenir en arrière vite. Plus le rayon d'impact d'une erreur est petit et
réversible, plus on déploie sereinement — donc souvent.

## 📖 Explication complète
**Rolling update.** On remplace les instances par petits lots : quelques
nouvelles montent, on retire quelques anciennes, et ainsi de suite. Le service
reste disponible pendant la bascule. Nécessite un **health check** fiable (ne
router que vers les instances saines) et que ancienne et nouvelle versions
cohabitent le temps de la transition.

**Blue-green.** On maintient deux environnements complets : « bleu » (actuel) et
« vert » (nouvelle version). On déploie et teste sur le vert pendant que le bleu
sert le trafic, puis on **bascule le routage** d'un coup vers le vert. Rollback =
rebasculer vers le bleu, quasi instantané. Coût : faire tourner deux
environnements.

**Canary.** On envoie une PETITE fraction du trafic (1 %, 5 %) vers la nouvelle
version et on OBSERVE (erreurs, latence, métriques métier). Si tout va bien, on
augmente progressivement ; sinon on retire la canary. C'est la stratégie qui
limite le mieux le rayon d'impact — à condition d'avoir de l'observabilité pour
décider.

**Feature flags.** Découpler le DÉPLOIEMENT du code de son ACTIVATION : on livre
la fonctionnalité désactivée, puis on l'active (pour un pourcentage, un segment)
sans redéployer. Permet un « rollback » logique instantané (couper le flag) et le
test en production maîtrisé. Piège : les flags s'accumulent → dette à nettoyer.

**Migrations de base compatibles.** Le point qui casse les beaux plans : pendant
une transition, ancienne et nouvelle versions du code tournent EN MÊME TEMPS sur
la MÊME base. Une migration destructive (renommer/supprimer une colonne
utilisée) casse l'ancienne version encore en service. La règle est le
changement **rétro-compatible en plusieurs étapes** : d'abord ajouter (colonne,
table) sans rien casser, déployer le code qui l'utilise, puis seulement plus tard
retirer l'ancien — l'**expand/contract**. Jamais « migration destructive + déploiement » d'un bloc.

## 🔧 Repères pratiques (conceptuels)
- Rolling : lots + health check fiable ; adapté par défaut.
- Blue-green : bascule/rollback instantanés ; coût de deux environnements.
- Canary : fraction + observation ; exige des métriques.
- Feature flag : activation découplée du déploiement ; nettoyer les flags.
- Base : expand/contract, jamais de destructif pendant la cohabitation.

## 🧭 Exemple guidé — livrer un changement risqué
1. L'artefact est versionné et immuable (rollback possible).
2. Le changement touche-t-il la base ? Si oui, planifier en **expand/contract**
   (ajouter d'abord, retirer plus tard).
3. Choisir la stratégie selon le risque : canary (fort risque, besoin
   d'observer), blue-green (bascule/rollback rapides), rolling (cas courant).
4. Surveiller erreurs/latence pendant la montée ; prêt à rebasculer/couper le
   flag.

## ⚠️ Erreurs fréquentes
- **Migration destructive** déployée d'un bloc → casse l'ancienne version encore
  en service.
- Rolling sans **health check** fiable → trafic routé vers des instances non
  prêtes.
- Canary sans observabilité → on déploie « en aveugle », inutile.
- Feature flags jamais nettoyés → dette et complexité.
- Big bang (tout remplacer d'un coup, sans plan de retour).

## 🔐 Sécurité
Un canary ou un flag peut exposer une fonctionnalité à un sous-ensemble : veiller
à ne pas fuiter de données/permissions non prêtes. La configuration par
environnement (et les secrets) reste injectée à part de l'artefact promu.

## 🏢 Cas métier
Une équipe a renommé une colonne et déployé dans le même coup. Le temps du rolling
update, l'ancienne version cherchait l'ancien nom → erreurs 500 pour une partie
des utilisateurs. Adoption de l'**expand/contract** : ajouter la nouvelle colonne,
écrire dans les deux, migrer, basculer la lecture, puis retirer l'ancienne — plus
aucune coupure lors des changements de schéma.

## 🎤 Questions d'entretien
- « Blue-green vs canary ? » → deux environnements avec bascule d'un coup vs
  fraction de trafic observée progressivement.
- « Pourquoi une migration doit être rétro-compatible ? » → ancienne et nouvelle
  versions cohabitent pendant le déploiement.
- « À quoi sert un feature flag ? » → activer/désactiver sans redéployer, limiter
  le risque.

## ✍️ Mini-exercice
Vous devez supprimer une colonne encore lue par la version en prod. Quelle
approche ? → expand/contract : d'abord déployer le code qui ne l'utilise plus,
retirer la colonne SEULEMENT ensuite (jamais destructif pendant la cohabitation).

## 🧾 À retenir
- Rolling (défaut), blue-green (bascule/rollback rapides), canary (rayon d'impact
  minimal + observation), flags (activation découplée).
- Health check fiable indispensable pour le sans-coupure.
- Migrations en expand/contract, jamais de destructif pendant la cohabitation.
- Petit rayon d'impact + réversibilité = déployer souvent, sereinement.

## 📚 Vocabulaire
**rolling update** · **blue-green** · **canary** · **feature flag** · **rayon
d'impact** · **health check** · **expand/contract** · **rétro-compatibilité** ·
**zéro coupure**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je choisis une stratégie selon le risque du changement.
- [ ] Je gère les migrations de base en expand/contract.
- [ ] Je sais limiter le rayon d'impact et revenir en arrière.

## 🔗 Liens avec le programme
Mois 11 (livraison). Leçons liées :
`/doc/lessons/ci-cd-quality-gates-artifacts`,
`/doc/lessons/release-incident-recovery`,
`/doc/lessons/networking-proxy-loadbalancing`. Ces stratégies s'appuient sur les
artefacts versionnés et préparent le déploiement Kubernetes.
